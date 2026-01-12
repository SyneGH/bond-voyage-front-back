import { Response } from "express";
import { ZodError } from "zod";
import { NotificationService } from "@/services/notification.service";
import { AuthenticatedRequest } from "@/types";
import {
  listNotificationsQueryDto,
  notificationIdParamDto,
} from "@/validators/notification.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";
import { requireAuthUser } from "@/utils/requestGuards";

export const NotificationController = {
  list: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);
      const query = listNotificationsQueryDto.parse(req.query);

      const notifications = await NotificationService.list(authUser.userId, {
        page: query.page,
        limit: query.limit,
        isRead: query.isRead,
      });
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
      const authUser = requireAuthUser(req);
      const { id } = notificationIdParamDto.parse(req.params);
      await NotificationService.markRead(id, authUser.userId);
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

  markAllRead: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);
      await NotificationService.markAllRead(authUser.userId);
      createResponse(res, HTTP_STATUS.OK, "Notifications marked as read");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to update notifications",
        error
      );
    }
  },

  clearRead: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);
      
      const count = await NotificationService.clearRead(authUser.userId);
      
      createResponse(
        res, 
        HTTP_STATUS.OK, 
        `Cleared ${count} read notifications`
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to clear read notifications",
        error
      );
    }
  },
};
