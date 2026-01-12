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

export const createPaymentDto = z.object({
  amount: z.number().min(0),
  method: z.enum(["CASH", "GCASH"]).optional(),
  type: z.enum(["FULL", "PARTIAL"]).optional(),
  proofOfPayment: z.string().optional().nullable(),   // Renamed from proofImageBase64
  proofMimeType: z.string().optional().nullable(),
  transactionId: z.string().optional().nullable(),
});

export const updatePaymentStatusDto = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
});

export const paymentIdParamDto = z.object({
  id: z.string().uuid(),
});

export const paymentListQueryDto = z.object({
  page: z.preprocess((val) => parseNumber(val, 1), z.number().int().min(1)),
  limit: z.preprocess((val) => parseNumber(val, 10), z.number().int().min(1)),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  bookingId: z.string().uuid().optional(),
  dateFrom: dateQuerySchema,
  dateTo: dateQuerySchema,
});

export const bookingPaymentListQueryDto = paymentListQueryDto.omit({
  bookingId: true,
});
