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
import { requireAuthUser } from "@/utils/requestGuards";
import { prisma } from "@/config/database";
import { dashboardStatsQueryDto } from "@/validators/dashboard.dto";
import { DashboardService } from "@/services/dashboard.service";
import { activityLogListQueryDto } from "@/validators/activity-log.dto";
import { ActivityLogService } from "@/services/activity-log.service";
import { serializeUser } from "@/utils/serialize";

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
      isActive?: boolean,
      startDate?: string,
      endDate?: string
    ) =>
      `users:list:page:${page}:limit:${limit}:q:${q || "none"}:role:${
        role || "all"
      }:isActive:${isActive === undefined ? "all" : String(isActive)}:startDate:${
        startDate || "all"
      }:endDate:${endDate || "all"}`, // <--- Added these lines

    singleUser: (id: string) => `user:${id}`,

    // NOTE: You should technically update userCount too if the count depends on the date filter
    userCount: (
      q?: string, 
      role?: string, 
      isActive?: boolean, 
      startDate?: string, 
      endDate?: string
    ) =>
      `users:count:q:${q || "none"}:role:${role || "all"}:isActive:${
        isActive === undefined ? "all" : String(isActive)
      }:startDate:${startDate || "all"}:endDate:${endDate || "all"}`,
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
          userService.findBymobile(payload.mobile),
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

      const authUser = requireAuthUser(req);

      const user = await userService.createWithLog(authUser.userId, payload);

      createResponse(res, HTTP_STATUS.CREATED, "User registered successfully", {
        user: serializeUser(user),
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
      // 1. Parse all parameters including dates
      const { page, limit, q, role, isActive, startDate, endDate } = userListQueryDto.parse(
        req.query
      ) as any;

      // 2. Generate Cache Keys
      const listCacheKey = this.generateCacheKey.userList(
        page,
        limit,
        q,
        role,
        isActive,
        startDate,
        endDate
      );
      
      const countCacheKey = this.generateCacheKey.userCount(
        q, 
        role, 
        isActive,
        startDate,
        endDate
      );

      // 3. Check Redis Cache
      let cachedUsers: string | null = null;
      let cachedCount: string | null = null;

      try {
        [cachedUsers, cachedCount] = await Promise.all([
          redis.get(listCacheKey),
          redis.get(countCacheKey),
        ]);
      } catch (error) {
        console.warn("User list cache lookup failed", error);
      }

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

      // 4. Build Database Query (The Fixes)
      let whereClause: Prisma.UserWhereInput = {
        role: { not: "ADMIN" }, // Rule: Never show admins in this list
      };

      if (q) {
        whereClause.OR = [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { employeeId: { contains: q, mode: "insensitive" } },
        ];
      }

      // Only apply specific role filter if it isn't 'ADMIN'
      if (role && role !== 'ADMIN') {
        whereClause.role = role as "USER";
      }

      if (typeof isActive === "boolean") {
        whereClause.isActive = isActive;
      }

      // Date Filter Implementation
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.createdAt.lte = new Date(endDate);
        }
      }

      // 5. Fetch Data & Count from DB
      const users = await prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          bookings: {
            take: 1,
            orderBy: { startDate: "desc" },
            select: { startDate: true, endDate: true },
          },
        },
      });

      // Count using the EXACT same filters (so pagination is correct)
      const total = await userService.count(whereClause);

      // 6. Transform Data
      const transformedUsers = users.map((user: any) => ({
        ...serializeUser(user),
        dateFrom: user.bookings[0]?.startDate || null,
        dateTo: user.bookings[0]?.endDate || null,
      }));

      // 7. Update Cache
      try {
        await Promise.all([
          redis.setex(
            listCacheKey,
            this.CACHE_TTL.USER_LIST,
            JSON.stringify(transformedUsers)
          ),
          redis.setex(
            countCacheKey,
            this.CACHE_TTL.USER_LIST,
            total.toString()
          ),
        ]);
      } catch (error) {
        console.warn("User list cache update failed", error);
      }

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
      let cachedUser: string | null = null;

      try {
        cachedUser = await redis.get(cacheKey);
      } catch (error) {
        console.warn("User cache lookup failed", error);
      }

      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        createResponse(res, HTTP_STATUS.OK, "User found (cached)", { user });
        return;
      }

      const user = await userService.findById(userId);

      if (!user) {
        throwError(HTTP_STATUS.NOT_FOUND, "User not found");
      }

      const transformedUser = serializeUser(user as NonNullable<typeof user>);

      try {
        await redis.setex(
          cacheKey,
          this.CACHE_TTL.SINGLE_USER,
          JSON.stringify(transformedUser)
        );
      } catch (error) {
        console.warn("User cache update failed", error);
      }

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

      const updatedUser = user as NonNullable<typeof user>;
      createResponse(res, HTTP_STATUS.OK, "User updated successfully", {
        user: serializeUser(updatedUser),
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
      const authUser = requireAuthUser(req);

      const updateData = updateProfileDto.parse(req.body);

    if (updateData.companyName !== undefined && authUser.role !== "ADMIN") {
      throwError(
        HTTP_STATUS.FORBIDDEN,
        "Only admin users can update company name"
      );
    }

      const user = await userService.updateProfileWithLog(
        authUser.userId,
        updateData
      );

      if (!user) {
        throwError(HTTP_STATUS.BAD_REQUEST, "User not found");
      }

      await this.invalidateUserCaches(authUser.userId);

      createResponse(res, HTTP_STATUS.OK, "Profile updated successfully", {
        user: serializeUser(user as NonNullable<typeof user>),
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

  public getMyStats = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { year } = dashboardStatsQueryDto.parse(req.query);
      const authUser = requireAuthUser(req);

      const result = await DashboardService.getSelfStats(year, authUser.userId);

      createResponse(res, HTTP_STATUS.OK, "User stats retrieved", result);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch user stats",
        error
      );
    }
  };

  public getMyActivityLogs = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { page, limit, type, action, entityType, entityId, dateFrom, dateTo } =
        activityLogListQueryDto.omit({ actorId: true }).parse(req.query);

      const authUser = requireAuthUser(req);

      const result = await ActivityLogService.list({
        page,
        limit,
        actorId: authUser.userId,
        action: action ?? type,
        entityType,
        entityId,
        dateFrom,
        dateTo,
      });

      createResponse(
        res,
        HTTP_STATUS.OK,
        "Activity logs retrieved",
        result.items,
        result.meta
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
        "Failed to fetch activity logs",
        error
      );
    }
  };

  // Deactivate user
  public deactivateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id: userId } = userIdParamDto.parse(req.params);
      const authUser = requireAuthUser(req);
      const user = await userService.deactivateWithLog(authUser.userId, userId);

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
      const authUser = requireAuthUser(req);
      const user = await userService.deleteWithLog(authUser.userId, userId);

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
      const authUser = requireAuthUser(req);

      const payload = changePasswordDto.parse(req.body);
      const user = await userService.findByIdWithPassword(authUser.userId);

      if (!user) {
        throwError(HTTP_STATUS.NOT_FOUND, "User not found");
      }

      const existingUser = user as NonNullable<typeof user>;
      const isPasswordMatched = await userService.comparePassword(
        payload.oldPassword,
        existingUser.password
      );

      if (!isPasswordMatched) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Old password does not match");
      }

      const hashedNewPassword = await userService.hashPassword(
        payload.newPassword
      );

      await userService.updateById(authUser.userId, { password: hashedNewPassword });

      await redis.del(this.generateCacheKey.singleUser(authUser.userId));

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
