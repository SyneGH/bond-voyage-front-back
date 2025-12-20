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

export const createInquiryDto = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
  bookingId: z.string().uuid().optional(),
});

export const addInquiryMessageDto = z.object({
  content: z.string().min(1),
});

export const inquiryIdParamDto = z.object({
  id: z.string().uuid(),
});

export const inquiryListQueryDto = z.object({
  page: z.preprocess((val) => parseNumber(val, 1), z.number().int().min(1)),
  limit: z.preprocess((val) => parseNumber(val, 10), z.number().int().min(1)),
  bookingId: z.string().uuid().optional(),
});
