import { Router } from "express";
import { WeatherController } from "@/controllers/weather.controller";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.get("/", asyncHandler(WeatherController.getWeather));
router.get("/forecast", asyncHandler(WeatherController.getForecast));

export default router;
