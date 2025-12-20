import { prisma } from "@/config/database";

export const FeedbackService = {
  async create(userId: string, rating: number, comment?: string | null) {
    return prisma.feedback.create({
      data: {
        userId,
        rating,
        comment: comment ?? null,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  async list() {
    return prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        respondedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  async respond(feedbackId: string, adminId: string, response: string) {
    return prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        response,
        respondedAt: new Date(),
        respondedById: adminId,
      },
    });
  },
};
