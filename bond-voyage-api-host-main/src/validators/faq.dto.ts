import { z } from "zod";

const parseNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

// Matches the form state in FaqPage.tsx
export const createFaqDto = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  targetPages: z.array(z.string()).optional().default([]),
  pageKeywords: z.array(z.string()).optional().default([]),
  systemCategory: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const updateFaqDto = createFaqDto.partial();

export const faqIdParamDto = z.object({
  id: z.string().uuid(),
});

export const faqListQueryDto = z.object({
  page: z.preprocess((val) => parseNumber(val, 1), z.number().int().min(1)),
  limit: z.preprocess((val) => parseNumber(val, 8), z.number().int().min(1)),
  search: z.string().optional(),
  category: z.string().optional(),
});