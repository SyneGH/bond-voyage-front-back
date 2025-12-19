import { Response } from "express";
import { ApiResponse } from "@/types";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export const throwError = (
  statusCode: number,
  message: string,
  details?: unknown
): never => {
  throw new AppError(statusCode, message, details);
};

export const createResponse = <T = unknown, M = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: M
): ApiResponse<T, M> => {
  const response: ApiResponse<T, M> = {
    success: statusCode < 400,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (meta !== undefined) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
  return response;
};
