import { prisma } from "@/config/database";
import { logAudit } from "@/services/activity-log.service";

interface CreateFaqInput {
  question: string;
  answer: string;
  tags: string[];
  targetPages?: string[];
  pageKeywords?: string[];
  systemCategory?: string;
  isActive?: boolean;
}

export const FaqService = {
  // Public / Roameo Access
  async listPublic() {
    return prisma.faqEntry.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  },

  // Admin Access
  async create(userId: string, data: CreateFaqInput) {
    const faq = await prisma.faqEntry.create({
      data: {
        question: data.question,
        answer: data.answer,
        tags: data.tags,
        targetPages: data.targetPages ?? [],
        pageKeywords: data.pageKeywords ?? [],
        category: data.systemCategory ?? "user",
        isActive: data.isActive ?? true,
        order: 0,
      },
    });

    // Wrap audit in try-catch to prevent 500s if logging fails
    try {
      await logAudit(prisma, {
        actorUserId: userId,
        action: "FAQ_CREATED",
        entityType: "FAQ",
        entityId: faq.id,
        metadata: { question: faq.question },
        message: `Created FAQ: ${faq.question}`,
      });
    } catch (error) {
      console.error("⚠️ Failed to log audit for FAQ creation:", error);
    }

    return faq;
  },

  async update(id: string, userId: string, data: Partial<CreateFaqInput>) {
    const existing = await prisma.faqEntry.findUnique({ where: { id } });
    if (!existing) throw new Error("FAQ_NOT_FOUND");

    const updated = await prisma.faqEntry.update({
      where: { id },
      data: {
        question: data.question,
        answer: data.answer,
        tags: data.tags,
        targetPages: data.targetPages,
        pageKeywords: data.pageKeywords,
        category: data.systemCategory,
        isActive: data.isActive,
      },
    });

    try {
      await logAudit(prisma, {
        actorUserId: userId,
        action: "FAQ_UPDATED",
        entityType: "FAQ",
        entityId: id,
        message: `Updated FAQ ${id}`,
      });
    } catch (error) {
      console.error("⚠️ Failed to log audit for FAQ update:", error);
    }

    return updated;
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.faqEntry.findUnique({ where: { id } });
    if (!existing) throw new Error("FAQ_NOT_FOUND");

    await prisma.faqEntry.delete({ where: { id } });

    try {
      await logAudit(prisma, {
        actorUserId: userId,
        action: "FAQ_DELETED",
        entityType: "FAQ",
        entityId: id,
        metadata: { question: existing.question },
        message: `Deleted FAQ ${id}`,
      });
    } catch (error) {
      console.error("⚠️ Failed to log audit for FAQ deletion:", error);
    }

    return true;
  },
};