import { Request, Response } from "express";
import { ZodError } from "zod";
import { ChatbotService } from "@/services/chatbot.service";
import { roamanPromptDto, roameoQuestionDto } from "@/validators/chatbot.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const ChatbotController = {
  roameo: async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = roameoQuestionDto.parse(req.body);
      const response = await ChatbotService.roameo(payload.question);
      createResponse(res, HTTP_STATUS.OK, "Roameo response", response);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Roameo failed", error);
    }
  },

  roaman: async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = roamanPromptDto.parse(req.body);
      const response = await ChatbotService.roaman(
        payload.prompt,
        payload.preferences
      );

      createResponse(res, HTTP_STATUS.OK, "Roaman response", response);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Roaman failed", error);
    }
  },
};
