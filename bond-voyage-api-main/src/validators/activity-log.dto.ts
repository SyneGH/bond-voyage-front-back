import { z } from "zod";

const parseNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? fallback : value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

export const activityLogListQueryDto = z.object({
  page: z.preprocess((val) => parseNumber(val, 1), z.number().int().min(1)),
  limit: z.preprocess((val) => parseNumber(val, 10), z.number().int().min(1)),
  userId: z.string().uuid().optional(),
});
