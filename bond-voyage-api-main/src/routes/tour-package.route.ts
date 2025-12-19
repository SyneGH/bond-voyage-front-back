import { Router } from "express";
import { TourPackageController } from "@/controllers/tour-package.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.get("/", asyncHandler(TourPackageController.list));
router.get("/:id", asyncHandler(TourPackageController.getOne));

router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(TourPackageController.create)
);
router.put(
  "/:id",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(TourPackageController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize([Role.ADMIN]),
  asyncHandler(TourPackageController.remove)
);

export default router;
