import { prisma } from "@/config/database";
import { logActivity } from "./activity-log.service";
import { Prisma } from "@prisma/client";

interface CreatePaymentInput {
  bookingId: string;
  userId: string;
  amount: number;
  method?: "CASH" | "GCASH";
  type?: "FULL" | "PARTIAL";
  proofImage?: Buffer;
  proofMimeType?: string;
  proofSize?: number;
  transactionId?: string | null;
}

export const PaymentService = {
  async createPayment(data: CreatePaymentInput) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: data.bookingId, userId: data.userId },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      const payment = await tx.payment.create({
        data: {
          bookingId: data.bookingId,
          submittedById: data.userId,
          amount: data.amount as unknown as Prisma.Decimal,
          method: data.method ?? "GCASH",
          type: data.type ?? "PARTIAL",
          proofImage: data.proofImage,
          proofMimeType: data.proofMimeType ?? null,
          proofSize: data.proofSize ?? null,
          transactionId: data.transactionId ?? null,
        },
      });

      await logActivity(
        tx,
        data.userId,
        "Submitted Payment",
        `Submitted payment for booking ${data.bookingId}`
      );

      return payment;
    });
  },

  async updatePaymentStatus(
    paymentId: string,
    status: "VERIFIED" | "REJECTED",
    actorId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: { status },
      });

      if (actorId) {
        const action =
          status === "VERIFIED" ? "Verified Payment" : "Rejected Payment";
        await logActivity(
          tx,
          actorId,
          action,
          `Payment ${paymentId} marked ${status}`
        );
      }

      return payment;
    });
  },
};
