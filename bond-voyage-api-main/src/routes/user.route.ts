import { Router } from "express";
import userController from "@/controllers/user.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/validations/auth.validation";
import { Role } from "@/constants/constants";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// User profile routes
router.put(
  "/profile",
  validate(updateProfileSchema),
  userController.updateProfile
);
router.put(
  "/change-password",
  validate(changePasswordSchema),
  userController.changePassword
);

// Admin only routes
router.post("/", authorize([Role.ADMIN]), userController.addUser);
router.get("/", authorize([Role.ADMIN]), userController.getAllUsers);
router.get("/:id", authorize([Role.ADMIN]), userController.getUserById);
router.patch(
  "/:id/deactivate",
  authorize([Role.ADMIN]),
  userController.deactivateUser
);
router.delete("/:id", authorize([Role.ADMIN]), userController.deleteUser);

export default router;
