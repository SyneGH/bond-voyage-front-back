import { Router } from "express";
import { FeedbackController } from "@/controllers/feedback.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  asyncHandler(FeedbackController.create)
);

router.get(
  "/my",
  authenticate,
  asyncHandler(FeedbackController.myFeedback)
);

router.get(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(FeedbackController.list)
);

router.patch(
  "/:id/respond",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(FeedbackController.respond)
);

export default router;
