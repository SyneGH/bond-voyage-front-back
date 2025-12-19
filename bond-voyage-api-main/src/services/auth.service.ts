import { prisma } from "@/config/database";
import { AuthUtils } from "@/utils/auth";
import { UserRole } from "@prisma/client";
import userService from "@/services/user.service";
import { throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phoneNumber: string;
  birthday?: string | null;
  role?: "ADMIN" | "USER";
  companyName?: string | null;
}

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
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
        phoneNumber: data.phoneNumber,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
        role: userRole,
        companyName: userRole === UserRole.ADMIN ? data.companyName : null,
        isActive: true,
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
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

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throwError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid credentials or inactive account"
      );
    }

    const validPassword = await userService.comparePassword(
      password,
      user.password
    );
    if (!validPassword) {
      throwError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
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
        lastLogin: new Date(),
      },
    });

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const decoded = AuthUtils.verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive || !user.refreshTokens.includes(refreshToken)) {
      throwError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      AuthUtils.generateTokenPair(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokens: user.refreshTokens
          .filter((token) => token !== refreshToken)
          .concat(newRefreshToken),
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
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
  }

  async logoutAll(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokens: [] },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throwError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    return user;
  }
}

export default new AuthService();
