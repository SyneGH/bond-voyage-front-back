import { Request, Response } from "express";
import { ZodError } from "zod";
import { placeSearchQueryDto } from "@/validators/place.dto";
import { LocationService } from "@/services/location.service";
import { GeoapifyService } from "@/services/geoapify.service";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

const normalizeSearchText = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const PlaceController = {
  search: async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, allowExternal } = placeSearchQueryDto.parse(req.query);
      const normalizedText = normalizeSearchText(text);
      const normalizedQuery = normalizedText.toLowerCase();

      const localResults = await LocationService.search(
        normalizedText,
        normalizedQuery
      );

      const formattedLocal = localResults.map((location) => ({
        source: "bondvoyage",
        name: location.name,
        address: "BondVoyage Verified Destination",
        lat: location.latitude,
        lng: location.longitude,
      }));

      let externalResults: Array<{
        source: "geoapify";
        name: string;
        address: string;
        lat: number;
        lng: number;
      }> = [];

      if ((allowExternal ?? false) && formattedLocal.length < 3) {
        const features = await GeoapifyService.autocomplete(normalizedText, 3);

        externalResults = features
          .map((feature: any) => ({
            source: "geoapify" as const,
            name: feature?.properties?.name ?? feature?.properties?.formatted,
            address: feature?.properties?.formatted ?? "Geoapify result",
            lat: feature?.properties?.lat,
            lng: feature?.properties?.lon,
          }))
          .filter(
            (item) =>
              typeof item.lat === "number" && typeof item.lng === "number"
          );
      }

      createResponse(res, HTTP_STATUS.OK, "Places found", [
        ...formattedLocal,
        ...externalResults,
      ]);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Place search failed",
        error
      );
    }
  },
};
