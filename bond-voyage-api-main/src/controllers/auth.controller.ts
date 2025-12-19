import { Request, Response } from "express";
import userService from "@/services/user.service";
import { AuthUtils } from "@/utils/auth";
import {
  RegisterDto,
  LoginDto,
  ApiResponse,
  AuthenticatedRequest,
  TokenPayload,
  AdminProfileData,
  UserProfileData,
  LoginResponse,
} from "@/types";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/response";
import { toMilliseconds } from "@/utils/timeConverter";
import { throwError } from "@/utils/error";
import emailService from '@/services/email.service';
import { redis } from '@/config/redis';
import { prisma } from "@/config/database";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

class AuthController {
  // =====================================================
  // REGISTER
  // =====================================================
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email,
        password,
        firstName,
        middleName,
        lastName,
        phoneNumber,
        birthday,
        role,
        companyName,
      } = req.body;

      // Basic validation
      if (!email || !password || !phoneNumber) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Email, password, and phone number are required"));
        return;
      }

      // Check duplicates
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { phoneNumber }],
        },
      });

      if (existingUser) {
        res
          .status(HTTP_STATUS.CONFLICT)
          .json(createResponse(false, "User with this email or phone number already exists"));
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole: UserRole = role === "ADMIN" ? UserRole.ADMIN : UserRole.USER;

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          middleName,
          lastName,
          phoneNumber,
          birthday: birthday ? new Date(birthday) : undefined,
          role: userRole,
          companyName: userRole === UserRole.ADMIN ? companyName : null,
          isActive: true,
        },
      });

      const tokenPayload: TokenPayload = {
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

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: toMilliseconds(7, "day"),
      });

      res.status(HTTP_STATUS.CREATED).json(
        createResponse(true, "Registration successful", {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            companyName: user.companyName,
          },
          accessToken,
        })
      );
    } catch (error) {
      throwError("Registration failed", error, HTTP_STATUS.INTERNAL_SERVER_ERROR, res);
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Email and password are required"));
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createResponse(false, "Invalid credentials or inactive account"));
        return;
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createResponse(false, "Invalid credentials"));
        return;
      }

      const tokenPayload: TokenPayload = {
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

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: toMilliseconds(7, "day"),
      });

      res.status(HTTP_STATUS.OK).json(
        createResponse(true, "Login successful", {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            avatarUrl: user.avatarUrl,
            companyName: user.companyName,
            customerRating: user.customerRating,
          },
          accessToken,
        })
      );
    } catch (error) {
      throwError("Login failed", error, HTTP_STATUS.INTERNAL_SERVER_ERROR, res);
    }
  };

  // =====================================================
  // REFRESH TOKEN
  // =====================================================
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createResponse(false, "Refresh token required"));
        return;
      }

      const decoded = AuthUtils.verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (
        !user ||
        !user.isActive ||
        !user.refreshTokens.includes(refreshToken)
      ) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createResponse(false, "Invalid refresh token"));
        return;
      }

      const tokenPayload: TokenPayload = {
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
            .filter((t) => t !== refreshToken)
            .concat(newRefreshToken),
        },
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: toMilliseconds(7, "day"),
      });

      res
        .status(HTTP_STATUS.OK)
        .json(createResponse(true, "Token refreshed", { accessToken }));
    } catch {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(createResponse(false, "Invalid or expired refresh token"));
    }
  };
  
  // =====================================================
  // RESET PASSWORD
  // =====================================================
  public resetPassword = async (
    req: Request<{}, {}, { email: string; newPassword: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createResponse(false, "Email and new password are required"));
        return;
      }

      // Security gate: must have verified OTP
      const resetSessionKey = `reset_session:${email}`;
      const isVerified = await redis.get(resetSessionKey);

      if (!isVerified) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createResponse(false, "OTP verification required"));
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(HTTP_STATUS.OK).json(
          createResponse(true, "Password reset successful")
        );
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          refreshTokens: [], // force logout all
        },
      });

      await redis.del(resetSessionKey);

      res
        .status(HTTP_STATUS.OK)
        .json(createResponse(true, "Password reset successful"));
    } catch (error) {
      throwError("Password reset failed", error, HTTP_STATUS.INTERNAL_SERVER_ERROR, res);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = req.user?.userId;

      if (userId && refreshToken) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              refreshTokens: user.refreshTokens.filter((t) => t !== refreshToken),
            },
          });
        }
      }

      res.clearCookie("refreshToken");
      res.status(HTTP_STATUS.OK).json(createResponse(true, "Logout successful"));
    } catch (error) {
      throwError("Logout failed", error, HTTP_STATUS.INTERNAL_SERVER_ERROR, res);
    }
  };

  // =====================================================
  // LOGOUT ALL
  // =====================================================
  public logoutAll = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { refreshTokens: [] },
      });

      res.clearCookie("refreshToken");
      res
        .status(HTTP_STATUS.OK)
        .json(createResponse(true, "Logged out from all devices"));
    } catch (error) {
      throwError("Logout all failed", error, HTTP_STATUS.INTERNAL_SERVER_ERROR, res);
    }
  };

  // =====================================================
  // GET PROFILE
  // =====================================================
  public getProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
      });

      if (!user) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createResponse(false, "User not found"));
        return;
      }

      res.status(HTTP_STATUS.OK).json(
        createResponse(true, "Profile retrieved", {
          user,
        })
      );
    } catch (error) {
      throwError("Get profile failed", error, HTTP_STATUS.INTERNAL_SERVER_ERROR, res);
    }
  };

  // =====================================================
  // OTP FLOW (UNCHANGED, PRESERVED)
  // =====================================================
  public sendOTP = async (req: Request, res: Response): Promise<void> => {
    const { email, firstName } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.setex(`otp:${email}`, 600, otp);

    await emailService.sendOTPEmail(email, firstName, otp);

    res.status(HTTP_STATUS.OK).json(createResponse(true, "OTP sent"));
  };

  public verifyOTP = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    const storedOtp = await redis.get(`otp:${email}`);
    if (storedOtp !== otp) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(createResponse(false, "Invalid or expired OTP"));
      return;
    }

    await redis.del(`otp:${email}`);
    await redis.setex(`reset_session:${email}`, 300, "true");

    res
      .status(HTTP_STATUS.OK)
      .json(createResponse(true, "OTP verified"));
  };
}

export default new AuthController();