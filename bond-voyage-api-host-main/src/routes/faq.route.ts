import { Router } from "express";
import { asyncHandler } from "@/middlewares/async.middleware";
import { FaqController } from "@/controllers/faq.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";

const router = Router();

// Public Route (Roameo / User UI)
router.get("/", asyncHandler(FaqController.list));

// Admin Routes (Protected)
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(FaqController.create)
);

router.put(
  "/:id",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(FaqController.update)
);

router.delete(
  "/:id",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(FaqController.delete)
);

export default router;