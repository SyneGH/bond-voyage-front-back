import Joi from "joi";
import { UserEnum } from "@/types/enums/user.enum";
import { Regex } from "@/utils/regex";

export const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required',
  }),

  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  employeeId: Joi.string().optional().allow(''), // Optional, can be empty

  mobile: Joi.string()
    .pattern(/^0?9\d{9}$/) // Accepts 09XXXXXXXXX or 9XXXXXXXXX
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number (09XXXXXXXXX)',
      'any.required': 'Phone number is required',
    }),

  birthday: Joi.string().optional().allow(''), // Accept as string, convert in service

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required',
    }),
}).options({ 
  stripUnknown: true,
  allowUnknown: false
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(UserEnum.FIRST_NAME_MIN)
    .max(UserEnum.FIRST_NAME_MAX)
    .optional()
    .trim(),

  middleName: Joi.string()
    .min(UserEnum.MIDDLE_NAME_MIN)
    .max(UserEnum.MIDDLE_NAME_MAX)
    .optional()
    .trim()
    .allow(""),

  lastName: Joi.string()
    .min(UserEnum.LAST_NAME_MIN)
    .max(UserEnum.LAST_NAME_MAX)
    .optional()
    .trim(),

  email: Joi.string()
    .email()
    .pattern(Regex.EMAIL_PATTERN)
    .optional()
    .lowercase()
    .trim(),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
  }),

  newPassword: Joi.string().min(8).required().messages({
    "string.min": "New password must not be less than 8 characters",
    "any.required": "New password is required",
  }),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  
  newPassword: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'New password is required',
    }),
});

export const sendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});