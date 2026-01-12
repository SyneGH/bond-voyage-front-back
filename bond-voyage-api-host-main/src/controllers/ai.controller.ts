import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";
// Ensure this matches the export name in ai.dto.ts
import { aiItineraryDto } from "@/validators/ai.dto"; 
import { AiService } from "@/services/ai.service";

export const AiController = {
  generateItinerary: async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = aiItineraryDto.parse(req.body);
      // Ensure we await the async service
      const itinerary = await AiService.generateItinerary(payload);
      createResponse(res, HTTP_STATUS.OK, "Itinerary generated", { itinerary });
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      console.error(error);
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Itinerary generation failed", error);
    }
  },
};