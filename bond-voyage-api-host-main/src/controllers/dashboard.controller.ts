import { Response } from "express";
import { ZodError } from "zod";
import { DashboardService } from "@/services/dashboard.service";
import { AuthenticatedRequest } from "@/types";
import { dashboardStatsQueryDto } from "@/validators/dashboard.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const DashboardController = {
  stats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { year } = dashboardStatsQueryDto.parse(req.query);

      const userId = req.user?.userId; 

      if (!userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "User not authenticated");
        return;
      }

      const result = await DashboardService.getStats(year, userId);
      createResponse(res, HTTP_STATUS.OK, "Dashboard stats retrieved", result);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch dashboard stats",
        error
      );
    }
  },
};
