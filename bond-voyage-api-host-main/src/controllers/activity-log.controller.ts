import { Response } from "express";
import { ZodError } from "zod";
import { ActivityLogService } from "@/services/activity-log.service";
import { AuthenticatedRequest } from "@/types";
import { activityLogListQueryDto } from "@/validators/activity-log.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS, Role } from "@/constants/constants";
import { requireAuthUser } from "@/utils/requestGuards";

export const ActivityLogController = {
  list: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, actorId, type, action, entityType, entityId, dateFrom, dateTo } =
        activityLogListQueryDto.parse(req.query);

      const authUser = requireAuthUser(req);

      // SECURITY: Non-admins are only allowed to see their own activity logs
      const effectiveActorId = authUser.role === Role.ADMIN ? actorId : authUser.userId;

      const result = await ActivityLogService.list({
        page,
        limit,
        actorId: effectiveActorId,
        action: action ?? type,
        entityType,
        entityId,
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

  getById: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const log = await ActivityLogService.getById(id);

      if (!log) {
        throwError(HTTP_STATUS.NOT_FOUND, "Activity log not found");
      }

      createResponse(res, HTTP_STATUS.OK, "Activity log retrieved", log);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch activity log",
        error
      );
    }
  },
};
