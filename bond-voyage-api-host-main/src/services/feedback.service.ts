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

  listByUser: async (
    userId: string,
    options: { page?: number; limit?: number }
  ): Promise<{ items: any[]; meta: any }> => {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.feedback.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.feedback.count({ where: { userId } }),
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
};
