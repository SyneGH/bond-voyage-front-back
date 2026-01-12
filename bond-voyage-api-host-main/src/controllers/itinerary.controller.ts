import { Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { ItineraryService } from "@/services/itinerary.service";
import {
  collaboratorParamDto,
  collaboratorPayloadDto,
  createItineraryDto,
  itineraryIdParamDto,
  itineraryListQueryDto,
  itineraryVersionParamDto,
  restoreItineraryDto,
  updateItineraryDtoV2,
} from "@/validators/itinerary.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";
import { ZodError } from "zod";
import { requireAuthUser } from "@/utils/requestGuards";

export const ItineraryController = {
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const payload = createItineraryDto.parse(req.body);
      const authUser = requireAuthUser(req);

      const itinerary = await ItineraryService.create({
        ...payload,
        userId: authUser.userId,
      });

      createResponse(res, HTTP_STATUS.CREATED, "Itinerary created", itinerary);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  getOne: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = itineraryIdParamDto.parse(req.params);
      const itinerary = await ItineraryService.getById(id);
      if (!itinerary) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary not found");
      }

      createResponse(res, HTTP_STATUS.OK, "Itinerary retrieved", itinerary);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  listMine: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);
      const { page, limit } = itineraryListQueryDto.parse(req.query);
      const result = await ItineraryService.listByUser(authUser.userId, page, limit);
      createResponse(res, HTTP_STATUS.OK, "Itineraries retrieved", result.items, result.meta);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = itineraryIdParamDto.parse(req.params);
      const payload = updateItineraryDtoV2.parse(req.body);
      const authUser = requireAuthUser(req);

      const updated = await ItineraryService.update(id, authUser.userId, payload);
      if (!updated) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary not found");
      }

      createResponse(res, HTTP_STATUS.OK, "Itinerary updated", updated);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error?.message === "ITINERARY_VERSION_CONFLICT") {
        throwError(HTTP_STATUS.CONFLICT, "Itinerary version conflict");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = itineraryIdParamDto.parse(req.params);
      const authUser = requireAuthUser(req);
      const archived = await ItineraryService.archive(id, authUser.userId);
      if (!archived) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary not found");
      }
      createResponse(res, HTTP_STATUS.OK, "Itinerary deleted", archived);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  send: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = itineraryIdParamDto.parse(req.params);
      const authUser = requireAuthUser(req);
      const updated = await ItineraryService.send(id, authUser.userId);
      if (!updated) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary not found");
      }
      createResponse(res, HTTP_STATUS.OK, "Itinerary sent", updated);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  confirm: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = itineraryIdParamDto.parse(req.params);
      const authUser = requireAuthUser(req);
      const updated = await ItineraryService.confirm(id, authUser.userId);
      if (!updated) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary not found");
      }
      createResponse(res, HTTP_STATUS.OK, "Itinerary confirmed", updated);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  addCollaborator: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = itineraryIdParamDto.parse(req.params);
      const { userId } = collaboratorPayloadDto.parse(req.body);
      const authUser = requireAuthUser(req);
      const collab = await ItineraryService.addCollaborator(id, authUser.userId, userId);
      if (!collab) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary not found");
      }
      createResponse(res, HTTP_STATUS.CREATED, "Collaborator added", collab);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  listCollaborators: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = itineraryIdParamDto.parse(req.params);
      const authUser = requireAuthUser(req);
      const collaborators = await ItineraryService.listCollaborators(id, authUser.userId);
      if (!collaborators) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary not found");
      }
      createResponse(res, HTTP_STATUS.OK, "Collaborators retrieved", collaborators);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  removeCollaborator: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id, userId } = itineraryIdParamDto.extend(collaboratorParamDto.shape).parse({
        ...req.params,
      });
      const authUser = requireAuthUser(req);
      await ItineraryService.removeCollaborator(id, authUser.userId, userId);
      createResponse(res, HTTP_STATUS.OK, "Collaborator removed");
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  listVersions: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = itineraryIdParamDto.parse(req.params);
      const authUser = requireAuthUser(req);

      const versions = await ItineraryService.listVersions(id, authUser.userId);

      if (!versions) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary not found");
      }

      createResponse(res, HTTP_STATUS.OK, "Itinerary versions retrieved", versions);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  getVersionDetail: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id, versionId } = itineraryIdParamDto
        .merge(itineraryVersionParamDto)
        .parse({ ...req.params });
      const authUser = requireAuthUser(req);

      const version = await ItineraryService.getVersionDetail(id, versionId, authUser.userId);

      if (!version) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary version not found");
      }

      createResponse(res, HTTP_STATUS.OK, "Itinerary version retrieved", version);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },

  restoreVersion: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id, versionId } = itineraryIdParamDto
        .merge(itineraryVersionParamDto)
        .parse({ ...req.params });
      const payload = restoreItineraryDto.parse(req.body);
      const authUser = requireAuthUser(req);

      const restored = await ItineraryService.restoreVersion(
        id,
        versionId,
        authUser.userId,
        authUser.role,
        payload.version
      );

      if (!restored) {
        throwError(HTTP_STATUS.NOT_FOUND, "Itinerary version not found");
      }

      createResponse(res, HTTP_STATUS.OK, "Itinerary restored", restored);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error?.message === "ITINERARY_FORBIDDEN") {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }
      if (error?.message === "ITINERARY_VERSION_CONFLICT") {
        throwError(HTTP_STATUS.CONFLICT, "Itinerary version conflict");
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error", error);
    }
  },
};
