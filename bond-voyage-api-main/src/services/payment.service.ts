import { prisma } from "@/config/database";
import { Prisma } from "@prisma/client";

interface CreatePaymentInput {
  bookingId: string;
  userId: string;
  amount: number;
  method?: "CASH" | "GCASH";
  type?: "FULL" | "PARTIAL";
  proofUrl?: string | null;
  transactionId?: string | null;
}

export const PaymentService = {
  async createPayment(data: CreatePaymentInput) {
    const booking = await prisma.booking.findFirst({
      where: { id: data.bookingId, userId: data.userId },
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    return prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        submittedById: data.userId,
        amount: data.amount as unknown as Prisma.Decimal,
        method: data.method ?? "GCASH",
        type: data.type ?? "PARTIAL",
        proofUrl: data.proofUrl ?? null,
        transactionId: data.transactionId ?? null,
      },
    });
  },

  async updatePaymentStatus(paymentId: string, status: "VERIFIED" | "REJECTED") {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
  },
};
