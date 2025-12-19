import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { ApiResponse } from "@/types";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/response";

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Show all errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false, // Don't allow unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      console.error('❌ Validation Error:', errors);
      console.error('📦 Request Body:', req.body);
      console.error('📋 Expected Schema:', schema.describe());

      // Create user-friendly error message
      const errorMessage = errors.length === 1 
        ? errors[0].message 
        : 'Multiple validation errors';

      const response: ApiResponse = createResponse(
        false,
        errorMessage,
        { errors }
      );

      res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      return;
    }

    req.body = value; // Use validated and sanitized value
    next();
  };
};