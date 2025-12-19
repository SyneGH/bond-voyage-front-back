import { Response } from "express";
import { ZodError } from "zod";
import { NotificationService } from "@/services/notification.service";
import { AuthenticatedRequest } from "@/types";
import { notificationIdParamDto } from "@/validators/notification.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const NotificationController = {
  list: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const notifications = await NotificationService.list(req.user.userId);
      createResponse(res, HTTP_STATUS.OK, "Notifications retrieved", notifications);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch notifications",
        error
      );
    }
  },

  markRead: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { id } = notificationIdParamDto.parse(req.params);
      await NotificationService.markRead(id, req.user.userId);
      createResponse(res, HTTP_STATUS.OK, "Notification marked as read");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to update notification",
        error
      );
    }
  },
};
