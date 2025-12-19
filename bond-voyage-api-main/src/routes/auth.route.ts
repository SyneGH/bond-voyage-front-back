import { Router } from "express";
import authController from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import {
    registerSchema,
    loginSchema,
    resetPasswordSchema,
    sendOTPSchema,
    verifyOTPSchema
} from "@/validations/auth.validation";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", authController.refreshToken);
// router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.post('/send-otp', validate(sendOTPSchema), authController.sendOTP);
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/profile", authenticate, authController.getProfile);

export default router;
