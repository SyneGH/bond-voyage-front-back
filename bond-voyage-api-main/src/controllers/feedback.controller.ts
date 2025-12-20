import { Response } from "express";
import { ZodError } from "zod";
import { FeedbackService } from "@/services/feedback.service";
import { AuthenticatedRequest } from "@/types";
import {
  createFeedbackDto,
  feedbackIdParamDto,
  feedbackListQueryDto,
  respondFeedbackDto,
} from "@/validators/feedback.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const FeedbackController = {
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const payload = createFeedbackDto.parse(req.body);
      const feedback = await FeedbackService.create(
        req.user.userId,
        payload.rating,
        payload.comment
      );

      createResponse(res, HTTP_STATUS.CREATED, "Feedback submitted", feedback);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Feedback failed", error);
    }
  },

  list: async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page, limit } = feedbackListQueryDto.parse(req.query);
      const result = await FeedbackService.list({ page, limit });
      createResponse(
        res,
        HTTP_STATUS.OK,
        "Feedback retrieved",
        result.items,
        result.meta
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch feedback",
        error
      );
    }
  },

  respond: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { id } = feedbackIdParamDto.parse(req.params);
      const payload = respondFeedbackDto.parse(req.body);

      const feedback = await FeedbackService.respond(
        id,
        req.user.userId,
        payload.response
      );

      createResponse(res, HTTP_STATUS.OK, "Feedback responded", feedback);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to respond to feedback",
        error
      );
    }
  },
};
