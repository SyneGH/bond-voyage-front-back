import { Request, Response } from "express";
import { ZodError } from "zod";
import { FaqService } from "@/services/faq.service";
import { AuthenticatedRequest } from "@/types";
import { createFaqDto, updateFaqDto, faqIdParamDto } from "@/validators/faq.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";
import { requireAuthUser } from "@/utils/requestGuards"; // Import the guard

export const FaqController = {
  // Public Endpoint
  list: async (_req: Request, res: Response): Promise<void> => {
    try {
      const faqs = await FaqService.listPublic();
      createResponse(res, HTTP_STATUS.OK, "FAQs retrieved", faqs);
    } catch (error) {
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch FAQs", error);
    }
  },

  // Admin Endpoints
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req); // Use the helper
      const payload = createFaqDto.parse(req.body);
      
      const faq = await FaqService.create(authUser.userId, payload); // Pass correct userId
      
      createResponse(res, HTTP_STATUS.CREATED, "FAQ created", faq);
    } catch (error) {
      if (error instanceof ZodError) throwError(HTTP_STATUS.BAD_REQUEST, "Validation error", error.errors);
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to create FAQ", error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req); // Use the helper
      const { id } = faqIdParamDto.parse(req.params);
      const payload = updateFaqDto.parse(req.body);
      
      const faq = await FaqService.update(id, authUser.userId, payload);
      
      createResponse(res, HTTP_STATUS.OK, "FAQ updated", faq);
    } catch (error: any) {
      if (error instanceof ZodError) throwError(HTTP_STATUS.BAD_REQUEST, "Validation error", error.errors);
      if (error.message === "FAQ_NOT_FOUND") throwError(HTTP_STATUS.NOT_FOUND, "FAQ not found");
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update FAQ", error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req); // Use the helper
      const { id } = faqIdParamDto.parse(req.params);
      
      await FaqService.delete(id, authUser.userId);
      
      createResponse(res, HTTP_STATUS.OK, "FAQ deleted");
    } catch (error: any) {
      if (error.message === "FAQ_NOT_FOUND") throwError(HTTP_STATUS.NOT_FOUND, "FAQ not found");
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to delete FAQ", error);
    }
  },
};