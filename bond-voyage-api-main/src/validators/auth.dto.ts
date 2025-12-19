import { z } from "zod";
import { UserEnum } from "@/types/enums/user.enum";
import { Regex } from "@/utils/regex";

const phoneRegex = /^0?9\d{9}$/;

export const registerDto = z.object({
  firstName: z
    .string()
    .min(UserEnum.FIRST_NAME_MIN)
    .max(UserEnum.FIRST_NAME_MAX),
  middleName: z
    .string()
    .min(UserEnum.MIDDLE_NAME_MIN)
    .max(UserEnum.MIDDLE_NAME_MAX)
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .min(UserEnum.LAST_NAME_MIN)
    .max(UserEnum.LAST_NAME_MAX),
  email: z.string().email().regex(Regex.EMAIL_PATTERN),
  employeeId: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().regex(phoneRegex),
  birthday: z.string().optional().or(z.literal("")),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "USER"]).optional(),
  companyName: z.string().optional(),
});

export const loginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const resetPasswordDto = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8),
});

export const sendOtpDto = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
});

export const verifyOtpDto = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});
