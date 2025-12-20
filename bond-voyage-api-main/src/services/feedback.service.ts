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

  async list(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          respondedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        skip,
        take: limit,
      }),
      prisma.feedback.count(),
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
