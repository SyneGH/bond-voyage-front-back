import { Router } from "express";
import { asyncHandler } from "@/middlewares/async.middleware";
import { AiController } from "@/controllers/ai.controller";

const router = Router();

router.post("/itinerary", asyncHandler(AiController.generateItinerary));

export default router;
