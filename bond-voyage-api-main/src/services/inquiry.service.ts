import { prisma } from "@/config/database";
import { InquiryStatus } from "@prisma/client";
import { logActivity } from "./activity-log.service";

export const InquiryService = {
  async createInquiry(userId: string, subject: string, message: string) {
    return prisma.$transaction(async (tx) => {
      const inquiry = await tx.inquiry.create({
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

      await logActivity(
        tx,
        userId,
        "Created Inquiry",
        `Inquiry ${inquiry.id} created: ${subject}`
      );

      return inquiry;
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

  async createMessage(
    inquiryId: string,
    senderId: string,
    content: string,
    isAdmin: boolean
  ) {
    return prisma.$transaction(async (tx) => {
      const inquiry = await tx.inquiry.findUnique({
        where: { id: inquiryId },
        select: { userId: true },
      });

      if (!inquiry) throw new Error("INQUIRY_NOT_FOUND");

      if (!isAdmin && inquiry.userId !== senderId) {
        throw new Error("INQUIRY_FORBIDDEN");
      }

      const message = await tx.message.create({
        data: {
          inquiryId,
          senderId,
          content,
        },
      });

      await logActivity(
        tx,
        senderId,
        "Sent Message",
        `Message sent in inquiry ${inquiryId}`
      );

      return message;
    });
  },
};
