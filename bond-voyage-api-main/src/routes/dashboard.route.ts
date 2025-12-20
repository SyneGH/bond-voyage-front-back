import { Router } from "express";
import { DashboardController } from "@/controllers/dashboard.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.get(
  "/stats",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(DashboardController.stats)
);

export default router;
