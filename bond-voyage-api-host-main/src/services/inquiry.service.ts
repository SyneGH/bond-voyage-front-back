import { prisma } from "@/config/database";
import { InquiryStatus } from "@prisma/client";
import { logAudit } from "@/services/activity-log.service";
import { NotificationService } from "@/services/notification.service";

export const InquiryService = {
  async createInquiry(
    userId: string,
    subject: string,
    message: string,
    bookingId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const inquiry = await tx.inquiry.create({
        data: {
          userId,
          bookingId: bookingId ?? null,
          subject,
          status: InquiryStatus.OPEN,
          messages: {
            create: {
              senderId: userId,
              content: message,
            },
          },
        },
        include: {
          messages: { orderBy: { sentAt: "asc" } },
        },
      });

      await NotificationService.create(
        {
          userId,
          type: "INQUIRY",
          title: "Inquiry created",
          message: `Your inquiry "${subject}" has been received.`,
          data: {
            inquiryId: inquiry.id,
            bookingId: inquiry.bookingId ?? undefined,
            subject,
          },
        },
        tx
      );

      await NotificationService.notifyAdmins({
        type: "INQUIRY",
        title: "New inquiry submitted",
        message: `Inquiry "${subject}" requires attention`,
        data: {
          inquiryId: inquiry.id,
          bookingId: inquiry.bookingId ?? undefined,
          subject,
        },
      });

      await logAudit(tx, {
        actorUserId: userId,
        action: "INQUIRY_CREATED",
        entityType: "INQUIRY",
        entityId: inquiry.id,
        metadata: { bookingId: inquiry.bookingId ?? undefined },
        message: `Created inquiry ${inquiry.id}`,
      });

      return inquiry;
    });
  },

  async listInquiries(
    userId: string,
    isAdmin: boolean,
    params: { page: number; limit: number; bookingId?: string }
  ) {
    const { page, limit, bookingId } = params;
    const skip = (page - 1) * limit;

    const whereClause = {
      ...(isAdmin ? {} : { userId }),
      ...(bookingId ? { bookingId } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.inquiry.findMany({
        where: whereClause,
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          messages: { orderBy: { sentAt: "asc" } },
        },
        skip,
        take: limit,
      }),
      prisma.inquiry.count({ where: whereClause }),
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

  async createMessage(inquiryId: string, senderId: string, content: string, isAdmin: boolean) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      select: { userId: true },
    });

    if (!inquiry) throw new Error("INQUIRY_NOT_FOUND");

    if (!isAdmin && inquiry.userId !== senderId) {
      throw new Error("INQUIRY_FORBIDDEN");
    }

    const message = await prisma.message.create({
      data: {
        inquiryId,
        senderId,
        content,
      },
    });

    await logAudit(prisma, {
      actorUserId: senderId,
      action: "INQUIRY_MESSAGE_SENT",
      entityType: "INQUIRY",
      entityId: inquiryId,
      metadata: { isAdmin },
      message: `Sent inquiry message for inquiry ${inquiryId}`,
    });

    if (isAdmin) {
      await NotificationService.create({
        userId: inquiry.userId,
        type: "INQUIRY",
        title: "Inquiry reply",
        message: "You have a new reply to your inquiry.",
        data: { inquiryId },
      });
    }

    return message;
  },
};
