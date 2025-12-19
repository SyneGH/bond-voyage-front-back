import { Router } from "express";
import { WeatherController } from "@/controllers/weather.controller";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.get("/", asyncHandler(WeatherController.getWeather));

export default router;
