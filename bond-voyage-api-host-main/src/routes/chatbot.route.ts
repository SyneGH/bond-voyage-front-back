import { Router } from "express";
import { ChatbotController } from "@/controllers/chatbot.controller";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.post("/roameo", asyncHandler(ChatbotController.roameo));
router.post("/roaman", asyncHandler(ChatbotController.roaman));

export default router;
