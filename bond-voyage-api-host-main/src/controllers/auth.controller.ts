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
  refreshTokenDto,
  resetPasswordDto,
  sendOtpDto,
  verifyOtpDto,
} from "@/validators/auth.dto";
import { serializeUser } from "@/utils/serialize";
import { NotificationService } from "@/services/notification.service";

class AuthController {
  // =====================================================
  // REGISTER
  // =====================================================
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = registerDto.parse(req.body);
      const { user, accessToken, refreshToken } =
        await authService.register(payload);

      if (!user) {
        throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Registration failed");
      }

      const fullName = `${user.firstName} ${user.lastName}`;

      await NotificationService.notifyAdmins({
        type: "SYSTEM",
        title: "New User Registration",
        message: `${fullName} has just signed up.`,
        data: { 
          key: "user_registration", 
          meta: { 
            userId: user.id, 
            email: user.email,
            name: fullName 
          } 
        }
      });      

      const authUser = user as NonNullable<typeof user>;
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: toMilliseconds(7, "day"),
      });

      createResponse(res, HTTP_STATUS.CREATED, "Registration successful", {
        user: serializeUser(authUser),
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

      if (!user) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
      }

      const authUser = user as NonNullable<typeof user>;
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: toMilliseconds(7, "day"),
      });

      createResponse(res, HTTP_STATUS.OK, "Login successful", {
        user: serializeUser(authUser),
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error("❌ Login Critical Error:", error);

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
      let refreshToken: string | undefined;

      // 1) Check Body Strictly (only if key exists)
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, "refreshToken")) {
        const parsed = refreshTokenDto.safeParse(req.body);

        if (!parsed.success) {
          throwError(HTTP_STATUS.BAD_REQUEST, "Invalid refresh token format");
          return;
        }

        refreshToken = parsed.data.refreshToken;
      } else {
        // 2) Fallback to Cookie
        refreshToken = req.cookies?.refreshToken;
      }

      if (!refreshToken) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Refresh token required");
        return;
      }

      const incomingToken = req.cookies?.refreshToken;
      const tokenPayload = await authService.refreshToken(refreshToken);

      const newRefreshToken = tokenPayload.refreshToken || incomingToken;

      const isProduction = process.env.NODE_ENV === "production";
      
      // Set cookie with the NEW token
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: toMilliseconds(7, "day"),
      });

      createResponse(res, HTTP_STATUS.OK, "Token refreshed", {
        accessToken: tokenPayload.accessToken,
      });
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throwError(
          HTTP_STATUS.UNAUTHORIZED, 
          "Refresh token expired",
          { code: "REFRESH_TOKEN_EXPIRED" }
        );
      }
      
      if (error.name === "JsonWebTokenError") {
        throwError(
          HTTP_STATUS.UNAUTHORIZED, 
          "Invalid refresh token",
          { code: "REFRESH_TOKEN_INVALID" }
        );
      }

      // Pass through existing AppErrors (e.g., if authService throws "User not found")
      if (error instanceof AppError) throw error;

      // Only then default to 500
      console.error("RefreshToken Unknown Error:", error);
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
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

      createResponse(res, HTTP_STATUS.OK, "Profile retrieved", {
        user: serializeUser(user),
      });
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
