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

export const dashboardStatsQueryDto = z.object({
  year: z.preprocess(
    (val) => parseNumber(val, new Date().getFullYear()),
    z.number().int().min(2000).max(2100)
  ),
});
