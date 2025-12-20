import { HTTP_STATUS } from "@/constants/constants";
import userService from "@/services/user.service";
import { AuthenticatedRequest } from "@/types/index";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { Response } from "express";
import { redis } from "@/config/redis";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { registerDto } from "@/validators/auth.dto";
import {
  changePasswordDto,
  updateProfileDto,
  updateUserAdminDto,
  userIdParamDto,
  userListQueryDto,
} from "@/validators/user.dto";

class UserController {
  // Cache TTL constants (in seconds)
  private readonly CACHE_TTL = {
    USER_LIST: 300,
    SINGLE_USER: 600,
  };

  // Generate cache keys
  private generateCacheKey = {
    userList: (
      page: number,
      limit: number,
      q?: string,
      role?: string,
      isActive?: boolean
    ) =>
      `users:list:page:${page}:limit:${limit}:q:${q || "none"}:role:${
        role || "all"
      }:isActive:${isActive === undefined ? "all" : String(isActive)}`,
    singleUser: (id: string) => `user:${id}`,
    userCount: (q?: string, role?: string, isActive?: boolean) =>
      `users:count:q:${q || "none"}:role:${role || "all"}:isActive:${
        isActive === undefined ? "all" : String(isActive)
      }`,
  };

  // Cache invalidation helpers
  private invalidateUserCaches = async (userId: string) => {
    try {
      const listKeys = await redis.keys("users:list:*");
      const countKeys = await redis.keys("users:count:*");

      if (listKeys.length > 0) await redis.del(...listKeys);
      if (countKeys.length > 0) await redis.del(...countKeys);

      if (userId) await redis.del(this.generateCacheKey.singleUser(userId));
    } catch (error) {
      console.warn("Cache invalidation failed", error);
    }
  };

  public addUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const payload = registerDto.parse(req.body);

      const [existingEmailUser, existingEmployeeUser, existingPhoneUser] =
        await Promise.all([
          userService.findByEmail(payload.email),
          payload.employeeId
            ? userService.findByEmployeeId(payload.employeeId)
            : Promise.resolve(null),
          userService.findByPhoneNumber(payload.phoneNumber),
        ]);

      if (existingEmailUser || existingEmployeeUser || existingPhoneUser) {
        let message = "User already exists";

        if (existingEmployeeUser) {
          message = "User with this employee ID already exists";
        } else if (existingEmailUser) {
          message = "User with this email already exists";
        } else if (existingPhoneUser) {
          message = "User with this phone number already exists";
        }

        throwError(HTTP_STATUS.CONFLICT, message);
      }

      const user = await userService.createWithLog(req.user!.userId, payload);

      createResponse(res, HTTP_STATUS.CREATED, "User registered successfully", {
        user: userService.transformUser(user),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to create user",
        error
      );
    }
  };

  // Get all users (admin only)
  public getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { page, limit, q, role, isActive } = userListQueryDto.parse(
        req.query
      );

      const listCacheKey = this.generateCacheKey.userList(
        page,
        limit,
        q,
        role,
        isActive
      );
      const countCacheKey = this.generateCacheKey.userCount(q, role, isActive);

      const [cachedUsers, cachedCount] = await Promise.all([
        redis.get(listCacheKey),
        redis.get(countCacheKey),
      ]);

      if (cachedUsers && cachedCount) {
        const users = JSON.parse(cachedUsers);
        const total = parseInt(cachedCount, 10);

        const meta = {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        };

        createResponse(
          res,
          HTTP_STATUS.OK,
          "Users retrieved successfully (cached)",
          { users },
          meta
        );
        return;
      }

      let whereClause: Prisma.UserWhereInput = {};

      if (q) {
        whereClause.OR = [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { employeeId: { contains: q, mode: "insensitive" } },
        ];
      }

      if (role) {
        whereClause.role = role as "USER" | "ADMIN";
      }

      if (typeof isActive === "boolean") {
        whereClause.isActive = isActive;
      }

      const [users, total] = await Promise.all([
        userService.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereClause,
          orderBy: { createdAt: "desc" },
        }),
        userService.count(whereClause),
      ]);

      const transformedUsers = users.map((user) =>
        userService.transformUser(user)
      );

      await Promise.all([
        redis.setex(
          listCacheKey,
          this.CACHE_TTL.USER_LIST,
          JSON.stringify(transformedUsers)
        ),
        redis.setex(countCacheKey, this.CACHE_TTL.USER_LIST, total.toString()),
      ]);

      const meta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      createResponse(
        res,
        HTTP_STATUS.OK,
        "Users retrieved successfully",
        { users: transformedUsers },
        meta
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to retrieve users",
        error
      );
    }
  };

  public getUserById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id: userId } = userIdParamDto.parse(req.params);

      const cacheKey = this.generateCacheKey.singleUser(userId);
      const cachedUser = await redis.get(cacheKey);

      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        createResponse(res, HTTP_STATUS.OK, "User found (cached)", { user });
        return;
      }

      const user = await userService.findById(userId);

      if (!user) {
        throwError(HTTP_STATUS.NOT_FOUND, "User not found");
      }

      const transformedUser = userService.transformUser(user);

      await redis.setex(
        cacheKey,
        this.CACHE_TTL.SINGLE_USER,
        JSON.stringify(transformedUser)
      );

      createResponse(res, HTTP_STATUS.OK, "User found", {
        user: transformedUser,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.NOT_FOUND, "User not found", error);
    }
  };

  public updateUserById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id: userId } = userIdParamDto.parse(req.params);
      const payload = updateUserAdminDto.parse(req.body);

      const user = await userService.updateById(userId, payload);

      if (!user) {
        throwError(HTTP_STATUS.NOT_FOUND, "User not found");
      }

      await this.invalidateUserCaches(userId);

      createResponse(res, HTTP_STATUS.OK, "User updated successfully", {
        user: userService.transformUser(user),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.BAD_REQUEST, "Failed to update user", error);
    }
  };

  // Update own profile
  public updateProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throwError(HTTP_STATUS.BAD_REQUEST, "User id is required");
      }

      const updateData = updateProfileDto.parse(req.body);
      const user = await userService.updateProfileWithLog(userId, updateData);

      if (!user) {
        throwError(HTTP_STATUS.BAD_REQUEST, "User not found");
      }

      await this.invalidateUserCaches(userId);

      createResponse(res, HTTP_STATUS.OK, "Profile updated successfully", {
        user: userService.transformUser(user),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.BAD_REQUEST, "Failed to update profile", error);
    }
  };

  // Deactivate user
  public deactivateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id: userId } = userIdParamDto.parse(req.params);
      const user = await userService.deactivateWithLog(req.user!.userId, userId);

      if (!user) {
        throwError(HTTP_STATUS.NOT_FOUND, "User not found");
      }

      await this.invalidateUserCaches(userId);

      createResponse(res, HTTP_STATUS.OK, "User deactivated successfully");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.BAD_REQUEST, "Failed to deactivate user", error);
    }
  };

  // Delete a user
  public deleteUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id: userId } = userIdParamDto.parse(req.params);
      const user = await userService.deleteWithLog(req.user!.userId, userId);

      if (!user) {
        throwError(HTTP_STATUS.NOT_FOUND, "User not found");
      }

      await this.invalidateUserCaches(userId);

      createResponse(res, HTTP_STATUS.OK, "User deleted successfully");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.BAD_REQUEST, "Failed to delete user", error);
    }
  };

  // Change password
  public changePassword = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throwError(HTTP_STATUS.BAD_REQUEST, "User id is required");
      }

      const payload = changePasswordDto.parse(req.body);
      const user = await userService.findByIdWithPassword(userId);

      if (!user) {
        throwError(HTTP_STATUS.NOT_FOUND, "User not found");
      }

      const isPasswordMatched = await userService.comparePassword(
        payload.oldPassword,
        user.password
      );

      if (!isPasswordMatched) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Old password does not match");
      }

      const hashedNewPassword = await userService.hashPassword(
        payload.newPassword
      );

      await userService.updateById(userId, { password: hashedNewPassword });

      await redis.del(this.generateCacheKey.singleUser(userId));

      createResponse(res, HTTP_STATUS.OK, "Password updated successfully");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.BAD_REQUEST, "Failed to change password", error);
    }
  };
}

export default new UserController();
