import { prisma } from "@/config/database";
import { Prisma } from "@prisma/client";
import { AuthUtils } from "@/utils/auth";
import { User, UserRole } from "@prisma/client";
import userService from "@/services/user.service";
import { throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";
import { logAudit } from "@/services/activity-log.service";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  mobile: string;
  birthday?: string | null;
  role?: "ADMIN" | "USER";
  companyName?: string | null;
}

export class AuthService {
  async register(
    data: RegisterInput
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { mobile: data.mobile }],
      },
    });

    if (existingUser) {
      throwError(
        HTTP_STATUS.CONFLICT,
        "User with this email or phone number already exists"
      );
    }

    const hashedPassword = await userService.hashPassword(data.password);
    const userRole: UserRole =
      data.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER;

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        mobile: data.mobile,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
        role: userRole,
        companyName: userRole === UserRole.ADMIN ? data.companyName : null,
        isActive: true,
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    };

    const { accessToken, refreshToken } =
      AuthUtils.generateTokenPair(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokens: {
          push: refreshToken,
        },
      },
    });

    return { user, accessToken, refreshToken };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throwError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid credentials or inactive account"
      );
    }

    const authUser = user as NonNullable<typeof user>;

    if (!authUser.isActive) {
      throwError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid credentials or inactive account"
      );
    }

    const validPassword = await userService.comparePassword(
      password,
      authUser.password
    );
    if (!validPassword) {
      throwError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    const tokenPayload = {
      userId: authUser.id,
      email: authUser.email,
      mobile: authUser.mobile,
      role: authUser.role,
    };

    const { accessToken, refreshToken } =
      AuthUtils.generateTokenPair(tokenPayload);

    // Single-session enforcement: Clear all existing sessions
    const hadExistingSessions = authUser.refreshTokens.length > 0;

    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        refreshTokens: [refreshToken], // Replace all tokens with new one
        lastLogin: new Date(),
      },
    });

    await logAudit(prisma, {
      actorUserId: authUser.id,
      action: "AUTH_LOGIN",
      entityType: "AUTH",
      metadata: { 
        email: authUser.email,
        sessionReplaced: hadExistingSessions,
      },
      message: hadExistingSessions 
        ? "User login successful - previous session invalidated"
        : "User login successful",
    });

    return { user: authUser, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const decoded = AuthUtils.verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throwError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
    }

    const authUser = user as NonNullable<typeof user>;

    if (!authUser.isActive || !authUser.refreshTokens.includes(refreshToken)) {
      // Check if user has ANY refresh tokens - if yes, session was replaced
      const sessionWasReplaced = authUser.refreshTokens.length > 0;
      
      throwError(
        HTTP_STATUS.UNAUTHORIZED, 
        sessionWasReplaced 
          ? "Session invalidated - logged in from another device"
          : "Invalid refresh token",
        { 
          code: sessionWasReplaced ? "SESSION_REPLACED" : "REFRESH_TOKEN_INVALID"
        }
      );
    }

    const tokenPayload = {
      userId: authUser.id,
      email: authUser.email,
      mobile: authUser.mobile,
      role: authUser.role,
    };

    const accessToken = AuthUtils.generateAccessToken(tokenPayload);

    // SMART ROTATION LOGIC
    // Check if the current refresh token is expiring soon (e.g., < 24 hours).
    // decoded.exp is in seconds (Unix timestamp).
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const exp = decoded.exp || 0;
    const bufferSeconds = 24 * 60 * 60; // 1 day buffer (adjust as needed)

    // Only rotate if expiring soon
    if ((exp - nowInSeconds) < bufferSeconds) {
      const newRefreshToken = AuthUtils.generateRefreshToken(tokenPayload);

      await prisma.user.update({
        where: { id: authUser.id },
        data: {
          refreshTokens: authUser.refreshTokens
            .filter((token) => token !== refreshToken)
            .concat(newRefreshToken),
        },
      });

      await logAudit(prisma, {
        actorUserId: authUser.id,
        action: "AUTH_REFRESH",
        entityType: "AUTH",
        message: "Refresh token rotated (expiring soon)",
      });

      return { accessToken, refreshToken: newRefreshToken };
    }

    await logAudit(prisma, {
      actorUserId: authUser.id,
      action: "AUTH_REFRESH",
      entityType: "AUTH",
      message: "Refresh token rotated",
    });

    return { accessToken, refreshToken };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return false;
    }

    const hashedPassword = await userService.hashPassword(newPassword);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        refreshTokens: [],
      },
    });

    return true;
  }

  async logout(userId: string, refreshToken?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return;
    }

    if (!refreshToken) {
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokens: user.refreshTokens.filter((t) => t !== refreshToken),
      },
    });

    await logAudit(prisma, {
      actorUserId: userId,
      action: "AUTH_LOGOUT",
      entityType: "AUTH",
      message: "User logged out",
    });
  }

  async logoutAll(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokens: [] },
    });

    await logAudit(prisma, {
      actorUserId: userId,
      action: "AUTH_LOGOUT_ALL",
      entityType: "AUTH",
      message: "User logged out from all sessions",
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throwError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const foundUser = user as NonNullable<typeof user>;

    // If user is ADMIN, calculate average rating from all feedback
    if (foundUser.role === "ADMIN") {
      const feedbackStats = await prisma.feedback.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });

      // Update customerRating with calculated average as Prisma Decimal
      const avgRating = feedbackStats._avg.rating 
        ? new Prisma.Decimal(feedbackStats._avg.rating.toFixed(2))
        : null;

      // Return user with calculated customerRating
      return {
        ...foundUser,
        customerRating: avgRating,
      };
    }

    return foundUser;
  }
}

export default new AuthService();
