import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { HTTP_STATUS } from "@/constants/constants";
import {
  AppError,
  createResponse,
  throwError,
} from "@/utils/responseHandler";
import { toMilliseconds } from "@/utils/timeConverter";
import emailService from "@/services/email.service";
import { redis } from "@/config/redis";
import authService from "@/services/auth.service";
import { ZodError } from "zod";
import {
  loginDto,
  registerDto,
  resetPasswordDto,
  sendOtpDto,
  verifyOtpDto,
} from "@/validators/auth.dto";

class AuthController {
  // =====================================================
  // REGISTER
  // =====================================================
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = registerDto.parse(req.body);
      const { user, accessToken, refreshToken } =
        await authService.register(payload);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: toMilliseconds(7, "day"),
      });

      createResponse(res, HTTP_STATUS.CREATED, "Registration successful", {
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
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Registration failed", error);
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = loginDto.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.login(
        payload.email,
        payload.password
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: toMilliseconds(7, "day"),
      });

      createResponse(res, HTTP_STATUS.OK, "Login successful", {
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
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Login failed", error);
    }
  };

  // =====================================================
  // REFRESH TOKEN
  // =====================================================
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Refresh token required");
      }

      const tokenPayload = await authService.refreshToken(refreshToken);

      res.cookie("refreshToken", tokenPayload.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: toMilliseconds(7, "day"),
      });

      createResponse(res, HTTP_STATUS.OK, "Token refreshed", {
        accessToken: tokenPayload.accessToken,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired refresh token");
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
      const payload = resetPasswordDto.parse(req.body);

      const resetSessionKey = `reset_session:${payload.email}`;
      const isVerified = await redis.get(resetSessionKey);

      if (!isVerified) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "OTP verification required");
      }

      await authService.resetPassword(payload.email, payload.newPassword);
      await redis.del(resetSessionKey);

      createResponse(res, HTTP_STATUS.OK, "Password reset successful");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Password reset failed", error);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  public logout = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = req.user?.userId;

      if (userId) {
        await authService.logout(userId, refreshToken);
      }

      res.clearCookie("refreshToken");
      createResponse(res, HTTP_STATUS.OK, "Logout successful");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Logout failed", error);
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
      await authService.logoutAll(req.user!.userId);

      res.clearCookie("refreshToken");
      createResponse(res, HTTP_STATUS.OK, "Logged out from all devices");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Logout all failed", error);
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
      const user = await authService.getProfile(req.user!.userId);

      createResponse(res, HTTP_STATUS.OK, "Profile retrieved", { user });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Get profile failed", error);
    }
  };

  // =====================================================
  // OTP FLOW (UNCHANGED, PRESERVED)
  // =====================================================
  public sendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = sendOtpDto.parse(req.body);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redis.setex(`otp:${payload.email}`, 600, otp);

      await emailService.sendOTPEmail(payload.email, payload.firstName, otp);

      createResponse(res, HTTP_STATUS.OK, "OTP sent");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to send OTP", error);
    }
  };

  public verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = verifyOtpDto.parse(req.body);

      const storedOtp = await redis.get(`otp:${payload.email}`);
      if (storedOtp !== payload.otp) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired OTP");
      }

      await redis.del(`otp:${payload.email}`);
      await redis.setex(`reset_session:${payload.email}`, 300, "true");

      createResponse(res, HTTP_STATUS.OK, "OTP verified");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "OTP verification failed", error);
    }
  };
}

export default new AuthController();
