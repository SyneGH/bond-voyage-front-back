import { Router } from "express";
import { NotificationController } from "@/controllers/notification.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(NotificationController.list));
router.patch("/:id/read", asyncHandler(NotificationController.markRead));
router.patch("/read-all", asyncHandler(NotificationController.markAllRead));
router.delete("/clear-read", asyncHandler(NotificationController.clearRead));

export default router;
