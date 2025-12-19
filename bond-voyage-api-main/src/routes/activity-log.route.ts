import { Router } from "express";
import { ActivityLogController } from "@/controllers/activity-log.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(ActivityLogController.list)
);

export default router;
