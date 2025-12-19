import { Router } from "express";
import authController from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

// Public routes
router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh-token", asyncHandler(authController.refreshToken));
router.post("/reset-password", asyncHandler(authController.resetPassword));
router.post("/send-otp", asyncHandler(authController.sendOTP));
router.post("/verify-otp", asyncHandler(authController.verifyOTP));

// Protected routes
router.post("/logout", authenticate, asyncHandler(authController.logout));
router.post("/logout-all", authenticate, asyncHandler(authController.logoutAll));
router.get("/profile", authenticate, asyncHandler(authController.getProfile));

export default router;
