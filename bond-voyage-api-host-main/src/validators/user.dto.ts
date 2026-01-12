import { z } from "zod";
import { UserEnum } from "@/types/enums/user.enum";
import { Regex } from "@/utils/regex";

const dateQuerySchema = z.preprocess((value) => {
  // 1. If it's null/undefined/empty string, return undefined
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }
  // 2. If it's already a Date, return it
  if (value instanceof Date) return value;
  
  // 3. Try to parse string/number to Date
  const date = new Date(value as string | number);
  
  // 4. Return the Date if valid, otherwise undefined
  return !Number.isNaN(date.getTime()) ? date : undefined;
}, z.date().optional());

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

export const updateProfileDto = z.object({
  firstName: z
    .string()
    .min(UserEnum.FIRST_NAME_MIN)
    .max(UserEnum.FIRST_NAME_MAX)
    .optional(),
  middleName: z
    .string()
    .min(UserEnum.MIDDLE_NAME_MIN)
    .max(UserEnum.MIDDLE_NAME_MAX)
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .min(UserEnum.LAST_NAME_MIN)
    .max(UserEnum.LAST_NAME_MAX)
    .optional(),
  email: z
    .string()
    .email()
    .regex(Regex.EMAIL_PATTERN)
    .optional(),
  avatarUrl: z
    .string()
    .max(5000000) // Limit to ~5MB for base64 strings (adjust as needed)
    .optional()
    .or(z.literal("")),
  companyName: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters" })
    .max(100, { message: "Company name must be less than 100 characters" })
    .optional()
    .or(z.literal("")),
  yearsInOperation: z
    .preprocess((val) => {
      if (val === null || val === undefined || val === "") return null;
      const parsed = Number(val);
      return Number.isNaN(parsed) ? val : parsed;
    }, z.number().int().min(0).nullable().optional()),
});

export const changePasswordDto = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const userListQueryDto = z.object({
  page: z.preprocess((val) => parseNumber(val, 1), z.number().int().min(1)),
  limit: z.preprocess((val) => parseNumber(val, 10), z.number().int().min(1)),
  q: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActive: z
    .preprocess((value) => {
      if (value === undefined) return undefined;
      if (value === "true" || value === true) return true;
      if (value === "false" || value === false) return false;
      return undefined;
    }, z.boolean().optional()),

  startDate: dateQuerySchema,
  endDate: dateQuerySchema,
});

export const userIdParamDto = z.object({
  id: z.string().uuid(),
});

export const updateUserAdminDto = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),

  firstName: z
    .string()
    .min(UserEnum.FIRST_NAME_MIN)
    .max(UserEnum.FIRST_NAME_MAX)
    .optional(),
  lastName: z
    .string()
    .min(UserEnum.LAST_NAME_MIN)
    .max(UserEnum.LAST_NAME_MAX)
    .optional(),
  email: z
    .string()
    .email()
    .regex(Regex.EMAIL_PATTERN)
    .optional(),
  mobile: z.string().optional(),
  companyName: z.string().optional(),
  yearsInOperation: z
    .preprocess((val) => {
      if (val === null || val === undefined || val === "") return null;
      const parsed = Number(val);
      return Number.isNaN(parsed) ? val : parsed;
    }, z.number().int().min(0).nullable().optional()),
});
