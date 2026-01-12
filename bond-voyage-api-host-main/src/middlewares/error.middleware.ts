import { NextFunction, Request, Response } from "express";
import { AppError, createResponse } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("🔥 FULL ERROR STACK:", error);

  const normalizedError =
    error instanceof AppError
      ? error
      : new AppError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Internal server error",
          error
        );

  const data = normalizedError.details ? { details: normalizedError.details } : undefined;

  createResponse(
    res,
    normalizedError.statusCode,
    normalizedError.message,
    data
  );
};
