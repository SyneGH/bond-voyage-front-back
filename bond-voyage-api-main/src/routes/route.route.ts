import { Router } from "express";
import { RouteController } from "@/controllers/route.controller";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.post("/optimize", asyncHandler(RouteController.optimize));

export default router;
