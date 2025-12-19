import { Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiResponse } from "@/types";
import { AuthUtils } from "@/utils/auth";
import userService from "@/services/user.service";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/response";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const response: ApiResponse = createResponse(
        false,
        "Access token is required"
      );

      res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
      return;
    }

    const token = authHeader.substring("Bearer ".length);

    try {
      const decoded = AuthUtils.verifyAccessToken(token);

      const user = await userService.findById(decoded.userId);

      if (!user || !user.isActive) {
        const response: ApiResponse = createResponse(
          false,
          "User not found or inactive"
        );

        res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
        return;
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      const response: ApiResponse = createResponse(
        false,
        "Invalid or expired access token"
      );

      res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
      return;
    }
  } catch (error) {
    const response: ApiResponse = createResponse(
      false,
      "Authentication Error",
      error instanceof Error ? error.message : "Unknown error"
    );

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
  }
};

export const authorize = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      const response: ApiResponse = createResponse(
        false,
        "Authentication required"
      );

      res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = createResponse(
        false,
        "Insufficient permissions"
      );

      res.status(HTTP_STATUS.FORBIDDEN).json(response);
      return;
    }

    next();
  };
};
