import { Response } from "express";
import { ApiResponse } from "@/types";
import { createResponse } from "./response";

export const throwError = (
  message: string,
  error: any,
  statusCode: number,
  res: Response
): void => {
  console.error(`Error: ${message}`, error);

  const response: ApiResponse = createResponse(false, message);
  res.status(statusCode).json(response);
};
