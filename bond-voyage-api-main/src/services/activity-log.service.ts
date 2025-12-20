import { prisma } from "@/config/database";

export async function logActivity(
  tx: typeof prisma,
  userId: string,
  action: string,
  details?: string
) {
  await tx.activityLog.create({
    data: {
      userId,
      action,
      details,
    },
  });
}

export const ActivityLogService = {
  async list(params: {
    page: number;
    limit: number;
    actorId?: string;
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { page, limit, actorId, type, dateFrom, dateTo } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(actorId ? { userId: actorId } : {}),
      ...(type
        ? {
            action: {
              contains: type,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(dateFrom || dateTo
        ? {
            timestamp: {
              gte: dateFrom,
              lte: dateTo,
            },
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.activityLog.count({ where }),
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
