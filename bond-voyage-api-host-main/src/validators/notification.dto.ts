import { BookingStatus, NotificationType, PaymentStatus } from "@prisma/client";
import { z } from "zod";

export const notificationIdParamDto = z.object({
  id: z.string().uuid(),
});

const bookingDataSchema = z.object({
  bookingId: z.string().uuid(),
  bookingCode: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  itineraryId: z.string().optional(),
  destination: z.string().optional(),
});

const paymentDataSchema = z.object({
  paymentId: z.string().uuid(),
  bookingId: z.string().uuid(),
  bookingCode: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  amount: z.number().optional(),
});

const inquiryDataSchema = z.object({
  inquiryId: z.string().uuid(),
  bookingId: z.string().optional(),
  itineraryId: z.string().optional(),
  subject: z.string().optional(),
});

const systemDataSchema = z.object({
  key: z.string(),
  meta: z.record(z.any()).optional(),
});

export const notificationPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(NotificationType.BOOKING), data: bookingDataSchema }),
  z.object({ type: z.literal(NotificationType.PAYMENT), data: paymentDataSchema }),
  z.object({ type: z.literal(NotificationType.INQUIRY), data: inquiryDataSchema }),
  z.object({ type: z.literal(NotificationType.SYSTEM), data: systemDataSchema }),
  z.object({ type: z.literal(NotificationType.FEEDBACK), data: z.record(z.any()).optional() }),
]);

export const validateNotificationPayload = (
  type: NotificationType,
  data?: unknown
): { type: NotificationType; data?: unknown } => {
  const parsed = notificationPayloadSchema.safeParse({ type, data });
  if (!parsed.success) {
    throw new Error("INVALID_NOTIFICATION_PAYLOAD");
  }
  return parsed.data;
};

export const listNotificationsQueryDto = z.object({
  page: z
    .preprocess((val) => Number(val ?? 1), z.number().int().min(1))
    .optional(),
  limit: z
    .preprocess((val) => Number(val ?? 10), z.number().int().min(1).max(100))
    .optional(),
  isRead: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val.toLowerCase() === "true"
          ? true
          : val.toLowerCase() === "false"
            ? false
            : val
        : val,
    z.boolean().optional()
  ),
});
