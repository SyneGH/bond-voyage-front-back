import { z } from "zod";
import { SMART_TRIP_TRAVEL_PACES } from "@/constants/smartTrip";

export const roameoQuestionDto = z.object({
  question: z.string().min(1, "Question is required"),
});

export const roamanPromptDto = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  preferences: z
    .object({
      destination: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      travelers: z.number().int().positive().optional(),
      tourType: z.enum(["JOINER", "PRIVATE"]).optional(),
      budget: z.number().positive().optional(),
      // Support both "pace" and "travelPace" for flexibility
      pace: z.enum([...SMART_TRIP_TRAVEL_PACES]).optional(),
      travelPace: z.enum([...SMART_TRIP_TRAVEL_PACES]).optional(),
      // User preference categories
      preferences: z.array(z.string()).optional(),
      // Context from AI assistant (frontend may send these)
      selectedDay: z.number().int().positive().optional(),
      currentDayActivities: z.array(z.any()).optional(),
      totalDays: z.number().int().positive().optional(),
    })
    .optional(),
});

// Type exports for service usage
export type RoameoQuestionInput = z.infer<typeof roameoQuestionDto>;
export type RoamanPromptInput = z.infer<typeof roamanPromptDto>;