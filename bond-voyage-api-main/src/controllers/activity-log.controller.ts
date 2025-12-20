import { Response } from "express";
import { ZodError } from "zod";
import { ActivityLogService } from "@/services/activity-log.service";
import { AuthenticatedRequest } from "@/types";
import { activityLogListQueryDto } from "@/validators/activity-log.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const ActivityLogController = {
  list: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, actorId, type, dateFrom, dateTo } =
        activityLogListQueryDto.parse(req.query);
      const result = await ActivityLogService.list({
        page,
        limit,
        actorId,
        type,
        dateFrom,
        dateTo,
      });
      createResponse(res, HTTP_STATUS.OK, "Activity logs retrieved", result.items, result.meta);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch activity logs",
        error
      );
    }
  },
};
