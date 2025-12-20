import { prisma } from "@/config/database";
import { logActivity } from "./activity-log.service";

export const FeedbackService = {
  async create(userId: string, rating: number, comment?: string | null) {
    return prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.create({
        data: {
          userId,
          rating,
          comment: comment ?? null,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      await logActivity(
        tx,
        userId,
        "Submitted Feedback",
        `Feedback ${feedback.id} with rating ${rating}`
      );

      return feedback;
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
    return prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.update({
        where: { id: feedbackId },
        data: {
          response,
          respondedAt: new Date(),
          respondedById: adminId,
        },
      });

      await logActivity(
        tx,
        adminId,
        "Responded to Feedback",
        `Responded to feedback ${feedbackId}`
      );

      return feedback;
    });
  },
};
