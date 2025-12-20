import { z } from "zod";
import { UserEnum } from "@/types/enums/user.enum";
import { Regex } from "@/utils/regex";

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
});

export const userIdParamDto = z.object({
  id: z.string().uuid(),
});

export const updateUserAdminDto = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});
