import { Router } from "express";
import { RouteController } from "@/controllers/route.controller";
import { asyncHandler } from "@/middlewares/async.middleware";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/calculate", authenticate, asyncHandler(RouteController.calculate));
router.post("/optimize", authenticate, asyncHandler(RouteController.optimize));

export default router;
