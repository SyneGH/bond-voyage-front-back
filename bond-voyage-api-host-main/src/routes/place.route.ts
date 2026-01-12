import { Router } from "express";
import { PlaceController } from "@/controllers/place.controller";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.get("/search", asyncHandler(PlaceController.search));

export default router;
