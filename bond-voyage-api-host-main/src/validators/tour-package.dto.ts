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

const activityDto = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().int().min(0),
});

const dayDto = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().optional().nullable(),
  activities: z.array(activityDto).optional(),
});

export const createTourPackageDto = z.object({
  title: z.string().min(1),
  destination: z.string().min(1),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  duration: z.number().int().min(1),
  thumbUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  days: z.array(dayDto).optional(),
});

export const updateTourPackageDto = createTourPackageDto.partial();

export const tourPackageIdParamDto = z.object({
  id: z.string().uuid(),
});

export const tourPackageListQueryDto = z.object({
  page: z.preprocess((val) => parseNumber(val, 1), z.number().int().min(1)),
  limit: z.preprocess((val) => parseNumber(val, 10), z.number().int().min(1)),
  q: z.string().optional(),
  isActive: z
    .preprocess((value) => {
      if (value === undefined) return undefined;
      if (value === "true" || value === true) return true;
      if (value === "false" || value === false) return false;
      return undefined;
    }, z.boolean().optional()),
});
