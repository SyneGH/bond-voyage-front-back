import { prisma } from "@/config/database";
import { NotificationDTO } from "@/dtos/notification.dto";
import { serializeNotification } from "@/utils/serialize";
import { validateNotificationPayload } from "@/validators/notification.dto";
import { NotificationType, Prisma, PrismaClient } from "@prisma/client";

type NotificationClient = Prisma.TransactionClient | PrismaClient;

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title?: string | null;
  message: string;
  data?: Prisma.InputJsonValue;
}

export const NotificationService = {
  async create(input: CreateNotificationInput, tx: NotificationClient = prisma) {
    validateNotificationPayload(input.type, input.data);

    const notification = await tx.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title ?? null,
        message: input.message,
        data: input.data ?? undefined,
      },
    });

    return serializeNotification(notification);
  },

  async notifyAdmins(input: Omit<CreateNotificationInput, "userId">) {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
    });

    if (!admins.length) return [];

    return Promise.all(
      admins.map((admin) =>
        NotificationService.create(
          {
            userId: admin.id,
            ...input,
          },
          prisma
        )
      )
    );
  },

  async list(userId: string, params?: { page?: number; limit?: number; isRead?: boolean }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = { userId };
    if (typeof params?.isRead === "boolean") {
      where.isRead = params.isRead;
    }

    const [items, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      items: items.map((n) => serializeNotification(n) as NotificationDTO),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async markRead(notificationId: string, userId: string) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
    return result.count;
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  },

  async clearRead(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
    return result.count;
  },
};
