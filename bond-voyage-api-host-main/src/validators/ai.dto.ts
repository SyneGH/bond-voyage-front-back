import { z } from "zod";
import { SMART_TRIP_ICON_KEYS, SMART_TRIP_TRAVEL_PACES } from "@/constants/smartTrip";

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
  }, "Invalid date format");

const travelPaceSchema = z.enum(SMART_TRIP_TRAVEL_PACES);
const preferenceItemSchema = z.string().min(1).max(40);
const preferencesSchema = z.array(preferenceItemSchema).max(10).default([]);
const iconKeySchema = z.enum(SMART_TRIP_ICON_KEYS, {
  errorMap: () => ({ message: "Invalid iconKey" }),
});

export const smartTripActivityDto = z.object({
  time: z.string().min(1).max(40),
  title: z.string().min(1).max(120),
  iconKey: iconKeySchema,
  location: z.string().optional(),
  description: z.string().optional(),
});

export const smartTripDayDto = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1).max(120),
  activities: z.array(smartTripActivityDto).max(12),
});

const enforceDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return { start, end, diff };
};

export const smartTripGenerateDto = z
  .object({
    destination: z.string().min(1).max(100),
    startDate: isoDateString,
    endDate: isoDateString,
    travelers: z.number().int().min(1).max(20),
    budget: z.number().min(0),
    travelPace: travelPaceSchema,
    preferences: preferencesSchema,
  })
  .superRefine((data, ctx) => {
    const { start, end, diff } = enforceDateRange(data.startDate, data.endDate);

    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endDate must be on or after startDate",
        path: ["endDate"],
      });
    }

    if (diff > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Trip duration cannot exceed 30 days",
        path: ["endDate"],
      });
    }
  });

export const smartTripItineraryDataDto = z
  .array(smartTripDayDto)
  .max(30)
  .superRefine((days, ctx) => {
    const dayNumbers = days.map((d) => d.day);
    const hasDuplicates = new Set(dayNumbers).size !== dayNumbers.length;

    if (hasDuplicates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate day numbers are not allowed",
        path: [0, "day"],
      });
    }
  });

// 1. Re-introduce the dateSchema helper
const dateSchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return value;
}, z.date());

export const aiItineraryDto = z
  .object({
    destination: z.string().min(1),
    startDate: dateSchema,
    endDate: dateSchema,
    travelers: z.number().optional(),
    budget: z.number().optional(),
    preferences: z.array(z.string()).optional(),
  })
  // 2. Explicitly type the data argument to fix 'unknown' errors
  .refine(
    (data: { startDate: Date; endDate: Date }) =>
      data.endDate >= data.startDate,
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export const iconWhitelist = SMART_TRIP_ICON_KEYS;
export const travelPaceOptions = SMART_TRIP_TRAVEL_PACES;
export type SmartTripRequest = z.infer<typeof smartTripGenerateDto>;
