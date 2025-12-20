import { prisma } from "@/config/database";
import { InquiryStatus } from "@prisma/client";

export const InquiryService = {
  async createInquiry(
    userId: string,
    subject: string,
    message: string,
    bookingId?: string
  ) {
    return prisma.inquiry.create({
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

    return prisma.message.create({
      data: {
        inquiryId,
        senderId,
        content,
      },
    });
  },
};
