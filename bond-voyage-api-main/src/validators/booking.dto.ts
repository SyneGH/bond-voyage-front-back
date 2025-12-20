import { z } from "zod";

const parseNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? fallback : value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const dateQuerySchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return undefined;
}, z.date().optional());

const dateSchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return value;
}, z.date());

const activityDto = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().int().min(0),
});

const itineraryDayDto = z.object({
  dayNumber: z.number().int().min(1),
  date: dateSchema.optional().nullable(),
  activities: z.array(activityDto).min(1),
});

export const createBookingDto = z
  .object({
    destination: z.string().min(1),
    startDate: dateSchema,
    endDate: dateSchema,
    travelers: z.number().int().min(1),
    totalPrice: z.number().min(0),
    type: z.enum(["STANDARD", "CUSTOMIZED", "REQUESTED"]),
    tourType: z.enum(["JOINER", "PRIVATE"]),
    itinerary: z.array(itineraryDayDto).min(1),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const updateItineraryDto = z
  .object({
    destination: z.string().min(1),
    startDate: dateSchema,
    endDate: dateSchema,
    travelers: z.number().int().min(1),
    totalPrice: z.number().min(0),
    itinerary: z.array(itineraryDayDto).min(1),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const updateStatusDto = z
  .object({
    status: z.enum([
      "DRAFT",
      "PENDING",
      "CONFIRMED",
      "REJECTED",
      "COMPLETED",
      "CANCELLED",
    ]),
    rejectionReason: z.string().optional(),
    rejectionResolution: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "REJECTED") {
      if (!data.rejectionReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rejection reason is required",
          path: ["rejectionReason"],
        });
      }
      if (!data.rejectionResolution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rejection resolution is required",
          path: ["rejectionResolution"],
        });
      }
    }
  });

export const bookingIdParamDto = z.object({
  id: z.string().uuid(),
});

export const collaboratorIdParamDto = z.object({
  collaboratorId: z.string().uuid(),
});

export const bookingListQueryDto = z.object({
  page: z.preprocess((val) => parseNumber(val, 1), z.number().int().min(1)),
  limit: z.preprocess((val) => parseNumber(val, 10), z.number().int().min(1)),
  status: z
    .enum(["DRAFT", "PENDING", "CONFIRMED", "REJECTED", "COMPLETED", "CANCELLED"])
    .optional(),
});

export const bookingMyListQueryDto = bookingListQueryDto;

export const bookingAdminListQueryDto = z.object({
  page: z.preprocess((val) => parseNumber(val, 1), z.number().int().min(1)),
  limit: z.preprocess((val) => parseNumber(val, 10), z.number().int().min(1)),
  status: z
    .enum(["DRAFT", "PENDING", "CONFIRMED", "REJECTED", "COMPLETED", "CANCELLED"])
    .optional(),
  type: z.enum(["STANDARD", "CUSTOMIZED", "REQUESTED"]).optional(),
  dateFrom: dateQuerySchema,
  dateTo: dateQuerySchema,
  q: z.string().optional(),
  sort: z
    .enum([
      "createdAt:asc",
      "createdAt:desc",
      "startDate:asc",
      "startDate:desc",
    ])
    .optional(),
});
