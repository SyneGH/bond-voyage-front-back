import { DECIMAL_RADIX, HTTP_STATUS } from "@/constants/constants";
import userService from "@/services/user.service";
import {
  ApiResponse,
  AuthenticatedRequest,
  UserUpdateDto,
  ChangePasswordDto,
} from "@/types/index";
import { throwError } from "@/utils/error";
import { createResponse } from "@/utils/response";
import { Response } from "express";
import { redis } from "@/config/redis";
import { Prisma } from "@prisma/client";

class UserController {
  // Cache TTL constants (in seconds)
  private readonly CACHE_TTL = {
    USER_LIST: 300,
    SINGLE_USER: 600,
  };

  // Generate cache keys
  private generateCacheKey = {
    userList: (page: number, limit: number, search?: string, role?: string) =>
      `users:list:page:${page}:limit:${limit}:search:${search || "none"}:role${
        role || "all"
      }`,
    singleUser: (id: string) => `user:${id}`,
    userCount: (search?: string, role?: string) =>
      `users:count:search:${search || "none"}:role:${role || "all"}`,
  };

  // Cache invalidation helpers
  private invalidateUserCaches = async (userId: string) => {
    try {
      // Invalidate user list caches (pattern matching)
      const listKeys = await redis.keys("users:list:*");
      const countKeys = await redis.keys("users:count:*");

      if (listKeys.length > 0) await redis.del(...listKeys);
      if (countKeys.length > 0) await redis.del(...countKeys);

      if (userId) await redis.del(this.generateCacheKey.singleUser(userId));
    } catch (error) {
      console.warn("Cache invalidation failed", error);
    }
  };

  public addUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, employeeId, phoneNumber } = req.body;

      const [existingEmailUser, existingEmployeeUser, existingPhoneUser] =
        await Promise.all([
          userService.findByEmail(email),
          userService.findByEmployeeId(employeeId),
          userService.findByPhoneNumber(phoneNumber),
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

        const response: ApiResponse = createResponse(false, message);
        res.status(HTTP_STATUS.CONFLICT).json(response);
        return;
      }
  
      const user = await userService.create(req.body);

      const data = {user}

      const response: ApiResponse = createResponse(
        true,
        "User registered successfully",
        data
      );

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      throwError(
        "Failed to create user",
        error,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        res
      );
    } 
  }

  // Get all users (admin only)
  public getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { page = 1, limit = 10, search, role } = req.query;
      const pageNum = parseInt(page as string, DECIMAL_RADIX);
      const limitNum = parseInt(limit as string, DECIMAL_RADIX);

      // Generate cache keys
      const listCacheKey = this.generateCacheKey.userList(
        pageNum,
        limitNum,
        search as string,
        role as string
      );
      const countCacheKey = this.generateCacheKey.userCount(
        search as string,
        role as string
      );

      const [cachedUsers, cachedCount] = await Promise.all([
        redis.get(listCacheKey),
        redis.get(countCacheKey),
      ]);

      if (cachedUsers && cachedCount) {
        const users = JSON.parse(cachedUsers);
        const total = parseInt(cachedCount, DECIMAL_RADIX);

        const data = {
          users,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        };

        const response: ApiResponse = createResponse(
          true,
          "Users retrieved successfully (cached)",
          data
        );

        res.status(HTTP_STATUS.OK).json(response);
        return;
      }

      let whereClause: Prisma.UserWhereInput = {};

      if (search) {
        whereClause.OR = [
          { firstName: { contains: search as string, mode: "insensitive" } },
          { lastName: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
          { employeeId: { contains: search as string, mode: "insensitive" } },
        ];
      }

      if (role && ["USER", "ADMIN"].includes(role as string)) {
        whereClause.role = role as "USER" | "ADMIN";
      }

      const [users, total] = await Promise.all([
        userService.findMany({
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          where: whereClause,
          orderBy: { createdAt: "desc" },
        }),
        userService.count(whereClause),
      ]);

      // Transform users to exclude sensitive data
      const transformedUsers = users.map((user) =>
        userService.transformUser(user)
      );

      // Cache the results
      await Promise.all([
        redis.setex(
          listCacheKey,
          this.CACHE_TTL.USER_LIST,
          JSON.stringify(transformedUsers)
        ),
        redis.setex(countCacheKey, this.CACHE_TTL.USER_LIST, total.toString()),
      ]);

      const data = {
        users: transformedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };

      const response: ApiResponse = createResponse(
        true,
        "Users retrieved successfully",
        data
      );

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError(
        "Failed to retrieve users",
        error,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        res
      );
    }
  };

  public getUserById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.params.id;

      const cacheKey = this.generateCacheKey.singleUser(userId);
      const cachedUser = await redis.get(cacheKey);

      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        const data = { user };
        const response: ApiResponse = createResponse(
          true,
          "User found (cached)",
          data
        );
        res.status(HTTP_STATUS.OK).json(response);
        return;
      }

      const user = await userService.findById(userId);

      if (!user) {
        throwError("User not found", undefined, HTTP_STATUS.NOT_FOUND, res);
        return;
      }

      const transformedUser = userService.transformUser(user);

      await redis.setex(
        cacheKey,
        this.CACHE_TTL.SINGLE_USER,
        JSON.stringify(transformedUser)
      );

      const data = {
        user: transformedUser,
      };

      const response: ApiResponse = createResponse(true, "User found", data);

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError("User not found", error, HTTP_STATUS.NOT_FOUND, res);
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
        throwError(
          "User id is required",
          undefined,
          HTTP_STATUS.BAD_REQUEST,
          res
        );
        return;
      }

      const updateData: UserUpdateDto = req.body;
      const user = await userService.updateProfile(userId, updateData);

      if (!user) {
        throwError("User not found", undefined, HTTP_STATUS.BAD_REQUEST, res);
        return;
      }

      // Invalidate caches after update
      await this.invalidateUserCaches(userId);

      const data = { user: userService.transformUser(user) };

      const response: ApiResponse = {
        success: true,
        message: "Profile updated successfully",
        data,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError(
        "Failed to update profile",
        error,
        HTTP_STATUS.BAD_REQUEST,
        res
      );
    }
  };

  // Deactivate user
  public deactivateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.params.id;
      const user = await userService.deactivate(userId);

      if (!user) {
        throwError("User not found", undefined, HTTP_STATUS.NOT_FOUND, res);
        return;
      }

      // Invalidate caches after deactivation
      await this.invalidateUserCaches(userId);

      const response: ApiResponse = {
        success: true,
        message: "User deactivated successfully",
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError(
        "Failed to deactivate user",
        error,
        HTTP_STATUS.BAD_REQUEST,
        res
      );
    }
  };

  // Delete a user
  public deleteUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.params.id;
      const user = await userService.delete(userId);

      if (!user) {
        throwError("User not found", undefined, HTTP_STATUS.NOT_FOUND, res);
        return;
      }

      // Invalidate caches after deletion
      await this.invalidateUserCaches(userId);

      const response: ApiResponse = {
        success: true,
        message: "User deleted successfully",
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      throwError("Failed to delete user", error, HTTP_STATUS.BAD_REQUEST, res);
    }
  };

  // Change password
  public changePassword = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const user = await userService.findByIdWithPassword(userId!);

      if (!user) {
        throwError("User not found", undefined, HTTP_STATUS.NOT_FOUND, res);
        return;
      }

      const { oldPassword, newPassword }: ChangePasswordDto = req.body;

      const isPasswordMatched = await userService.comparePassword(
        oldPassword,
        user.password
      );

      if (!isPasswordMatched) {
        throwError(
          "Old password does not match",
          undefined,
          HTTP_STATUS.BAD_REQUEST,
          res
        );
        return;
      }

      const hashedNewPassword = await userService.hashPassword(newPassword);

      await userService.updateById(userId!, { password: hashedNewPassword });

      // Only invalidate the specific user's cache (password change doesn't affect lists)
      await redis.del(this.generateCacheKey.singleUser(userId!));

      const response: ApiResponse = {
        success: true,
        message: "Password updated successfully",
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      console.log(error);
      throwError(
        "Failed to change password",
        error instanceof Error ? error.message : "Unknown error",
        HTTP_STATUS.BAD_REQUEST,
        res
      );
    }
  };
}

export default new UserController();
