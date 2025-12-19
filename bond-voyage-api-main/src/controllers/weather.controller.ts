import { Request, Response } from "express";
import axios from "axios";
import { ZodError } from "zod";
import { weatherQueryDto } from "@/validators/weather.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const WeatherController = {
  getWeather: async (req: Request, res: Response): Promise<void> => {
    try {
      const { lat, lng } = weatherQueryDto.parse(req.query);
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        throwError(
          HTTP_STATUS.BAD_REQUEST,
          "Weather API key not configured",
          { missing: "OPENWEATHER_API_KEY" }
        );
      }

      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            lat,
            lon: lng,
            appid: apiKey,
            units: "metric",
          },
        }
      );

      createResponse(res, HTTP_STATUS.OK, "Weather retrieved", response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Weather lookup failed", error);
    }
  },
};
