import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { ZodError } from "zod";
import { TourPackageService } from "@/services/tour-package.service";
import {
  createTourPackageDto,
  tourPackageIdParamDto,
  tourPackageListQueryDto,
  updateTourPackageDto,
} from "@/validators/tour-package.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const TourPackageController = {
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, q, isActive } = tourPackageListQueryDto.parse(
        req.query
      );
      const result = await TourPackageService.list({
        page,
        limit,
        search: q,
        isActive,
      });
      createResponse(res, HTTP_STATUS.OK, "Tour packages retrieved", result.items, result.meta);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch tour packages",
        error
      );
    }
  },

  getOne: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = tourPackageIdParamDto.parse(req.params);
      const tourPackage = await TourPackageService.getById(id);
      if (!tourPackage) {
        throwError(HTTP_STATUS.NOT_FOUND, "Tour package not found");
      }
      createResponse(res, HTTP_STATUS.OK, "Tour package retrieved", tourPackage);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch tour package",
        error
      );
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = createTourPackageDto.parse(req.body);
      const tourPackage = await TourPackageService.create(payload);
      createResponse(res, HTTP_STATUS.CREATED, "Tour package created", tourPackage);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to create tour package",
        error
      );
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = tourPackageIdParamDto.parse(req.params);
      const payload = updateTourPackageDto.parse(req.body);
      const tourPackage = await TourPackageService.update(id, payload);
      createResponse(res, HTTP_STATUS.OK, "Tour package updated", tourPackage);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to update tour package",
        error
      );
    }
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = tourPackageIdParamDto.parse(req.params);
      await TourPackageService.remove(id);
      createResponse(res, HTTP_STATUS.OK, "Tour package deleted");
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to delete tour package",
        error
      );
    }
  },
};
