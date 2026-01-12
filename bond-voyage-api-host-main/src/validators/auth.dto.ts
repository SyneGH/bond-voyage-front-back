import { z } from "zod";
import { UserEnum } from "@/types/enums/user.enum";
import { Regex } from "@/utils/regex";

const phoneRegex = /^0?9\d{9}$/;
// Allows alphabets, spaces, hyphens and apostrophes. 
// Rejects numbers and other symbols.
const nameRegex = /^[a-zA-Z\s\-']+$/; 

export const registerDto = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(UserEnum.FIRST_NAME_MIN, { message: "First name is too short" })
    .max(UserEnum.FIRST_NAME_MAX, { message: "First name is too long" })
    .regex(nameRegex, { message: "First name cannot contain numbers or special characters" }),
  
  middleName: z
    .string()
    .min(UserEnum.MIDDLE_NAME_MIN)
    .max(UserEnum.MIDDLE_NAME_MAX)
    .regex(nameRegex, { message: "Middle name cannot contain numbers or special characters" })
    .optional()
    .or(z.literal("")),
    
  lastName: z
    .string({ required_error: "Last name is required" })
    .min(UserEnum.LAST_NAME_MIN, { message: "Last name is too short" })
    .max(UserEnum.LAST_NAME_MAX, { message: "Last name is too long" })
    .regex(nameRegex, { message: "Last name cannot contain numbers or special characters" }),

  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email format" })
    .regex(Regex.EMAIL_PATTERN, { message: "Email format is invalid" }),

  employeeId: z.string().optional().or(z.literal("")),

  mobile: z
    .string({ required_error: "Mobile number is required" })
    .regex(phoneRegex, { message: "Invalid mobile number format (e.g. 09123456789)" }),

  birthday: z.string().optional().or(z.literal("")),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" }),

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

export const refreshTokenDto = z
  .object({ refreshToken: z.string().min(1) })
  .partial();