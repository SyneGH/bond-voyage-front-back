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
        const mockCurrent = buildMockCurrentWeather(lat, lng);
        createResponse(res, HTTP_STATUS.OK, "Weather retrieved", mockCurrent);
        return;
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
  getForecast: async (req: Request, res: Response): Promise<void> => {
    try {
      const { lat, lng } = weatherQueryDto.parse(req.query);
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        const mockForecast = buildMockForecast(lat, lng);
        createResponse(
          res,
          HTTP_STATUS.OK,
          "Weather forecast retrieved",
          mockForecast
        );
        return;
      }

      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
          params: {
            lat,
            lon: lng,
            appid: apiKey,
            units: "metric",
          },
        }
      );

      const forecast = (response.data?.list ?? []).slice(0, 5).map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString(),
        temperatureC: typeof item.main?.temp === "number" ? item.main.temp : null,
        description: item.weather?.[0]?.description ?? "",
      }));

      createResponse(
        res,
        HTTP_STATUS.OK,
        "Weather forecast retrieved",
        { lat, lng, unit: "metric", forecast }
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Weather forecast lookup failed",
        error
      );
    }
  },
};

const buildMockCurrentWeather = (lat: number, lng: number) => {
  const temperatureC = Math.round(((lat + lng) % 12) + 18);
  return {
    lat,
    lng,
    unit: "metric",
    temperatureC,
    description: temperatureC > 22 ? "Sunny" : "Partly cloudy",
    observedAt: new Date().toISOString(),
    source: "mock",
  };
};

const buildMockForecast = (lat: number, lng: number) => {
  const baseTemp = Math.round(((lat + lng) % 15) + 20);
  const now = new Date();
  const days = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index);
    return {
      date: date.toISOString().split("T")[0],
      temperatureC: baseTemp + (index % 3) - 1,
      description: index % 2 === 0 ? "Partly cloudy" : "Sunny",
    };
  });

  return {
    lat,
    lng,
    unit: "metric",
    forecast: days,
  };
};
