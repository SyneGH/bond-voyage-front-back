import { z } from "zod";

export const roameoQuestionDto = z.object({
  question: z.string().min(1),
});

export const roamanPromptDto = z.object({
  prompt: z.string().min(1),
  preferences: z
    .object({
      destination: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      travelers: z.number().int().positive().optional(),
      tourType: z.enum(["JOINER", "PRIVATE"]).optional(),
      budget: z.number().positive().optional(),
      pace: z.enum(["relaxed", "balanced", "packed"]).optional(),
    })
    .optional(),
});
