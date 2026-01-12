import { ApiResponse } from "@/types";

export const createResponse = <T = any>(
  success: boolean,
  message: string,
  data?: T
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return response;
};
