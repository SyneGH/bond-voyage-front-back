import { z } from "zod";

const dateSchema = z.preprocess((value) => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return value;
}, z.date().optional().nullable());

const activityDto = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().int().nonnegative(),
});

const dayDto = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().optional().nullable(),
  date: dateSchema,
  activities: z.array(activityDto).min(0),
});

const versionNumberSchema = z.preprocess((val) => {
  const num = Number(val);
  return Number.isNaN(num) ? val : num;
}, z.number().int().min(1));

export const createItineraryDto = z.object({
  title: z.string().optional().nullable(),
  destination: z.string().min(1),
  startDate: dateSchema,
  endDate: dateSchema,
  travelers: z.number().int().min(1),
  estimatedCost: z.number().optional().nullable(),
  type: z.enum(["STANDARD", "CUSTOMIZED", "REQUESTED", "SMART_TRIP"]).optional(),
  tourType: z.enum(["JOINER", "PRIVATE"]).optional(),
  days: z.array(dayDto).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, { message: "End date must be on or after start date", path: ["endDate"] });

export const updateItineraryDtoV2 = z.object({
  title: z.string().optional().nullable(),
  destination: z.string().min(1).optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  travelers: z.number().int().min(1).optional(),
  estimatedCost: z.number().optional().nullable(),
  type: z.enum(["STANDARD", "CUSTOMIZED", "REQUESTED", "SMART_TRIP"]).optional(),
  tourType: z.enum(["JOINER", "PRIVATE"]).optional(),
  days: z.array(dayDto).optional(),
  version: versionNumberSchema,
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, { message: "End date must be on or after start date", path: ["endDate"] });

export const itineraryIdParamDto = z.object({
  id: z.string().uuid(),
});

export const collaboratorParamDto = z.object({
  userId: z.string().uuid(),
});

export const itineraryVersionParamDto = z.object({
  versionId: z.string().uuid("Invalid version ID"),
});

export const restoreItineraryDto = z.object({
  version: versionNumberSchema,
});

export const collaboratorPayloadDto = z.object({
  userId: z.string().uuid(),
});

export const itineraryListQueryDto = z.object({
  page: z.preprocess((val) => {
    const num = Number(val ?? 1);
    return Number.isNaN(num) ? 1 : num;
  }, z.number().int().min(1)),
  limit: z.preprocess((val) => {
    const num = Number(val ?? 10);
    return Number.isNaN(num) ? 10 : num;
  }, z.number().int().min(1)),
});
