import { Request, Response } from "express";
import axios from "axios";
import { ZodError } from "zod";
import { optimizeRouteDto } from "@/validators/route.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const RouteController = {
  optimize: async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = optimizeRouteDto.parse(req.body);
      const apiKey = process.env.GEOAPIFY_API_KEY;

      if (!apiKey) {
        throwError(
          HTTP_STATUS.BAD_REQUEST,
          "Route optimization API key not configured",
          { missing: "GEOAPIFY_API_KEY" }
        );
      }

      const points = [
        payload.origin,
        ...(payload.waypoints ?? []),
        payload.destination,
      ];
      const waypoints = points.map((point) => `${point.lat},${point.lng}`).join("|");

      const response = await axios.get(
        "https://api.geoapify.com/v1/routing",
        {
          params: {
            waypoints,
            mode: "drive",
            apiKey,
          },
        }
      );

      createResponse(res, HTTP_STATUS.OK, "Route optimized", response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Route optimization failed", error);
    }
  },
};
