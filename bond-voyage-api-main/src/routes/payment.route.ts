import { Router } from "express";
import { PaymentController } from "@/controllers/payment.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.get(
  "/:id/proof",
  authenticate,
  asyncHandler(PaymentController.getProof)
);

router.patch(
  "/:id/status",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(PaymentController.updateStatus)
);

export default router;
