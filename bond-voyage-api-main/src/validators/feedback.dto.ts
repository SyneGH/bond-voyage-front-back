import { z } from "zod";

export const createFeedbackDto = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export const respondFeedbackDto = z.object({
  response: z.string().min(1),
});

export const feedbackIdParamDto = z.object({
  id: z.string().uuid(),
});
