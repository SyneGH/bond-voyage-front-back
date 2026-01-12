import { z } from "zod";
import { smartTripItineraryDataDto, smartTripGenerateDto } from "@/validators/ai.dto";

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
  title: z.string().optional().nullable(),
  date: dateSchema.optional().nullable(),
  activities: z.array(activityDto).min(0),
});


const tourTypeSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.toUpperCase() === "GROUP") {
      return "JOINER";
    }
    return value;
  },
  z.enum(["JOINER", "PRIVATE"])
);

const optionalDateSchema = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return value;
}, z.date().optional());

const updateDayDto = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().optional().nullable(),
  date: optionalDateSchema.optional().nullable(),
  activities: z.array(activityDto).optional(),
});

const itineraryActivityWithDayDto = activityDto.extend({
  dayNumber: z.number().int().min(1),
});

const itineraryWrapperDto = z.object({
  title: z.string().optional().nullable(),
  destination: z.string().optional(),
  startDate: optionalDateSchema.optional().nullable(),
  endDate: optionalDateSchema.optional().nullable(),
  travelers: z.number().int().min(1).optional(),
  type: z.enum(["STANDARD", "CUSTOMIZED", "REQUESTED"]).optional(),
  tourType: tourTypeSchema.optional(),
  totalDays: z.number().int().min(1).optional(),
  days: z.array(updateDayDto).optional(),
  activities: z.array(itineraryActivityWithDayDto).optional(),
});

const versionNumberSchema = z.preprocess((val) => {
  const num = Number(val);
  return Number.isNaN(num) ? val : num;
}, z.number().int().min(1));

const inlineItineraryDto = z
  .object({
    title: z.string().optional().nullable(),
    destination: z.string().min(1),
    startDate: dateSchema.optional().nullable(),
    endDate: dateSchema.optional().nullable(),
    travelers: z.number().int().min(1),
    type: z.enum(["STANDARD", "CUSTOMIZED", "REQUESTED"]).optional(),
    tourType: tourTypeSchema.optional(),
    days: z.array(itineraryDayDto).optional(),
  })
  .refine((data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  }, "End date must be on or after start date");

export const createBookingDto = z
  .object({
    customerName: z.string().min(1, "Customer name is required").optional(),
    customerEmail: z.string().email("Invalid email address").optional(),
    customerMobile: z.string().min(1, "Customer mobile number is required").optional(),

    itineraryId: z.string().uuid().optional(),
    tourPackageId: z.string().uuid().optional(),
    itinerary: inlineItineraryDto.optional(),
    totalPrice: z.number().min(0),
    type: z.enum(["STANDARD", "CUSTOMIZED", "REQUESTED"]).optional(),
    tourType: tourTypeSchema.optional(),

    itineraryType: z
      .enum(["STANDARD", "CUSTOMIZED", "REQUESTED", "SMART_TRIP"])
      .optional(),
    destination: z.string().min(1).max(100).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    travelers: z.number().int().min(1).optional(),
    budget: z.number().min(0).optional(),
    userBudget: z.number().min(0).optional(),
    travelPace: z.enum(["relaxed", "moderate", "packed", "own_pace"]).optional(),
    preferences: z.array(z.string().min(1).max(40)).max(10).optional(),
    itineraryData: smartTripItineraryDataDto.optional(),
  })
  .superRefine((data, ctx) => {
    const hasLegacyItinerary = data.itineraryId || data.tourPackageId || data.itinerary;
    const isSmartTrip =
      data.itineraryType === "SMART_TRIP" || data.itineraryData !== undefined;

    if (!hasLegacyItinerary && !isSmartTrip) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "itineraryId, tourPackageId, or itinerary is required",
        path: ["itineraryId"],
      });
      return;
    }

    const requiresCustomer =
      data.type === "STANDARD" || Boolean(data.tourPackageId);

    if (requiresCustomer) {
      if (!data.customerName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Customer name is required",
          path: ["customerName"],
        });
      }
      if (!data.customerEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Customer email is required",
          path: ["customerEmail"],
        });
      }
      if (!data.customerMobile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Customer mobile number is required",
          path: ["customerMobile"],
        });
      }
    }

    if (!isSmartTrip) return;

    const smartTripBase = smartTripGenerateDto.safeParse({
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      travelers: data.travelers,
      budget: data.budget,
      travelPace: data.travelPace,
      preferences: data.preferences,
    });

    if (!smartTripBase.success) {
      smartTripBase.error.issues.forEach((issue) => ctx.addIssue(issue));
    }

    if (!data.itineraryData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "itineraryData is required for SMART_TRIP",
        path: ["itineraryData"],
      });
    }
  });

export const updateItineraryDto = z
  .object({
    customerName: z.string().min(1, "Customer name is required").optional(),
    customerEmail: z.string().email("Invalid email address").optional(),
    customerMobile: z.string().min(1, "Customer mobile number is required").optional(),
    destination: z.string().min(1).optional(),
    startDate: optionalDateSchema.optional().nullable(),
    endDate: optionalDateSchema.optional().nullable(),
    travelers: z.number().int().min(1).optional(),
    totalPrice: z.number().min(0).optional(),
    userBudget: z.number().min(0).optional(),
    type: z.enum(["STANDARD", "CUSTOMIZED", "REQUESTED"]).optional(),
    status: z.enum([
      "DRAFT",
      "PENDING",
      "CONFIRMED",
      "REJECTED",
      "COMPLETED",
      "CANCELLED",
    ]).optional(),
    tourType: tourTypeSchema.optional(),
    isResolved: z.boolean().optional(),
    rejectionReason: z.string().optional().nullable(),
    rejectionResolution: z.string().optional().nullable(),
    itinerary: z
      .union([
        z.array(updateDayDto),
        itineraryWrapperDto,
        z.array(itineraryWrapperDto),
      ])
      .optional(),
    version: versionNumberSchema.optional(),
  })
  .refine((data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  }, {
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

export const bookingIdAliasParamDto = z.object({
  bookingId: z.string().uuid(),
});

export const collaboratorUserIdParamDto = z.object({
  collaboratorUserId: z.string().uuid(),
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
