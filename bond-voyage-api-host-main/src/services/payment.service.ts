import { prisma } from "@/config/database";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/services/activity-log.service";
import { NotificationService } from "@/services/notification.service";

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
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { firstName: true, lastName: true }
      });
      const userName = `${user?.firstName} ${user?.lastName}`;

      const booking = await tx.booking.findFirst({
        where: { id: data.bookingId, userId: data.userId },
        select: {
          id: true,
          userId: true,
          bookingCode: true,
          destination: true,
        },
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

      await logAudit(tx, {
        actorUserId: data.userId,
        action: "PAYMENT_SUBMITTED",
        entityType: "PAYMENT",
        entityId: payment.id,
        metadata: {
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          amount: data.amount,
          method: data.method ?? "GCASH",
        },
        message: `Submitted payment ${payment.id} for booking ${booking.id}`,
      });
      await NotificationService.create(
        {
          userId: data.userId,
          type: "PAYMENT",
          title: "Payment submitted",
          message: `Your payment for booking ${booking.bookingCode ?? booking.id} has been submitted.`,
          data: {
            bookingId: booking.id,
            bookingCode: booking.bookingCode ?? undefined,
            paymentId: payment.id,
            status: payment.status,
            amount: Number(data.amount),
          },
        },
        tx
      );

      await NotificationService.notifyAdmins({
        type: "PAYMENT",
        title: "Payment requires verification",
        message: `${userName} submitted a payment for booking ${booking.bookingCode}`,
        data: {
          bookingId: booking.id,
          bookingCode: booking.bookingCode ?? undefined,
          paymentId: payment.id,
          status: payment.status,
          amount: Number(data.amount),
        },
      });

      return payment;
    });
  },

  async updatePaymentStatus(
    paymentId: string,
    status: "VERIFIED" | "REJECTED",
    actorUserId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { booking: { select: { id: true, userId: true, bookingCode: true } } },
      });

      if (!payment) throw new Error("PAYMENT_NOT_FOUND");

      const updated = await tx.payment.update({ where: { id: paymentId }, data: { status } });

      if (actorUserId) {
        await logAudit(tx, {
          actorUserId,
          action: status === "VERIFIED" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
          entityType: "PAYMENT",
          entityId: payment.id,
          metadata: {
            bookingId: payment.booking.id,
            bookingCode: payment.booking.bookingCode,
            status,
          },
          message: `Payment ${payment.id} marked as ${status}`,
        });
      }

      await NotificationService.create(
        {
          userId: payment.booking.userId,
          type: "PAYMENT",
          title: "Payment status updated",
          message:
            status === "VERIFIED"
              ? `Your payment for booking ${payment.booking.bookingCode ?? payment.booking.id} was verified.`
              : `Your payment for booking ${payment.booking.bookingCode ?? payment.booking.id} was rejected.`,
          data: {
            paymentId: payment.id,
            bookingId: payment.booking.id,
            bookingCode: payment.booking.bookingCode ?? undefined,
            status,
          },
        },
        tx
      );

      return updated;
    });
  },

  async getPaymentsPaginated(
    filters: {
      status?: "PENDING" | "VERIFIED" | "REJECTED";
      bookingId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.PaymentWhereInput = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.bookingId) {
      whereClause.bookingId = filters.bookingId;
    }

    if (filters.dateFrom || filters.dateTo) {
      whereClause.createdAt = {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: whereClause,
        select: {
          id: true,
          bookingId: true,
          submittedById: true,
          amount: true,
          method: true,
          status: true,
          type: true,
          transactionId: true,
          createdAt: true,
          updatedAt: true,
          booking: {
            select: {
              id: true,
              destination: true,
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
          submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: whereClause }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getBookingPaymentsPaginated(
    bookingId: string,
    page = 1,
    limit = 10,
    filters?: {
      status?: "PENDING" | "VERIFIED" | "REJECTED";
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.PaymentWhereInput = { bookingId };

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.createdAt = {
        gte: filters?.dateFrom,
        lte: filters?.dateTo,
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: whereClause,
        select: {
          id: true,
          bookingId: true,
          submittedById: true,
          amount: true,
          method: true,
          status: true,
          type: true,
          transactionId: true,
          createdAt: true,
          updatedAt: true,
          submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: whereClause }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getPaymentProof(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        proofImage: true,
        proofMimeType: true,
        proofSize: true,
        submittedById: true,
        booking: {
          select: {
            userId: true,
          },
        },
      },
    });
  },
};
