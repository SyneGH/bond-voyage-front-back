import { Router } from "express";
import { InquiryController } from "@/controllers/inquiry.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(InquiryController.list));
router.post("/", asyncHandler(InquiryController.create));
router.post("/:id/messages", asyncHandler(InquiryController.addMessage));

export default router;
