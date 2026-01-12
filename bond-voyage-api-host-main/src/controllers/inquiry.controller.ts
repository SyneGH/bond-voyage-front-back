import { Response } from "express";
import { ZodError } from "zod";
import { InquiryService } from "@/services/inquiry.service";
import { AuthenticatedRequest } from "@/types";
import {
  addInquiryMessageDto,
  createInquiryDto,
  inquiryIdParamDto,
  inquiryListQueryDto,
} from "@/validators/inquiry.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";
import { requireAuthUser } from "@/utils/requestGuards";

export const InquiryController = {
  list: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);

      const { page, limit, bookingId } = inquiryListQueryDto.parse(req.query);

      const result = await InquiryService.listInquiries(
        authUser.userId,
        authUser.role === "ADMIN",
        { page, limit, bookingId }
      );

      createResponse(
        res,
        HTTP_STATUS.OK,
        "Inquiries retrieved",
        result.items,
        result.meta
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch inquiries",
        error
      );
    }
  },

  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);

      const payload = createInquiryDto.parse(req.body);
      const inquiry = await InquiryService.createInquiry(
        authUser.userId,
        payload.subject,
        payload.message,
        payload.bookingId
      );

      createResponse(res, HTTP_STATUS.CREATED, "Inquiry created", inquiry);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to create inquiry",
        error
      );
    }
  },

  addMessage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);

      const { id } = inquiryIdParamDto.parse(req.params);
      const payload = addInquiryMessageDto.parse(req.body);

      const message = await InquiryService.createMessage(
        id,
        authUser.userId,
        payload.content,
        authUser.role === "ADMIN"
      );

      createResponse(res, HTTP_STATUS.CREATED, "Message sent", message);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      if (error?.message === "INQUIRY_NOT_FOUND") {
        throwError(HTTP_STATUS.NOT_FOUND, "Inquiry not found");
      }
      if (error?.message === "INQUIRY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to send message",
        error
      );
    }
  },
};
