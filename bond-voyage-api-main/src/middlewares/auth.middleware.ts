import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types";
import { AuthUtils } from "@/utils/auth";
import userService from "@/services/user.service";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/responseHandler";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      createResponse(res, HTTP_STATUS.UNAUTHORIZED, "Access token is required");
      return;
    }

    const token = authHeader.substring("Bearer ".length);

    try {
      const decoded = AuthUtils.verifyAccessToken(token);

      const user = await userService.findById(decoded.userId);

      if (!user || !user.isActive) {
        createResponse(res, HTTP_STATUS.UNAUTHORIZED, "User not found or inactive");
        return;
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      createResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid or expired access token");
      return;
    }
  } catch (error) {
    createResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Authentication Error",
      error instanceof Error ? { message: error.message } : undefined
    );
  }
};

export const authorize = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      createResponse(res, HTTP_STATUS.UNAUTHORIZED, "Authentication required");
      return;
    }

    if (!roles.includes(req.user.role)) {
      createResponse(res, HTTP_STATUS.FORBIDDEN, "Insufficient permissions");
      return;
    }

    next();
  };
};
