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
