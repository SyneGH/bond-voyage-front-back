import { prisma } from "@/config/database";
import { InquiryStatus } from "@prisma/client";

export const InquiryService = {
  async createInquiry(userId: string, subject: string, message: string) {
    return prisma.inquiry.create({
      data: {
        userId,
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

  async listInquiries(userId: string, isAdmin: boolean) {
    return prisma.inquiry.findMany({
      where: isAdmin ? undefined : { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: { orderBy: { sentAt: "asc" } },
      },
    });
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
