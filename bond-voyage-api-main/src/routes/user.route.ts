import { Router } from "express";
import userController from "@/controllers/user.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// User profile routes
router.put("/profile", asyncHandler(userController.updateProfile));
router.put("/change-password", asyncHandler(userController.changePassword));

// Admin only routes
router.post("/", authorize([Role.ADMIN]), asyncHandler(userController.addUser));
router.get("/", authorize([Role.ADMIN]), asyncHandler(userController.getAllUsers));
router.get("/:id", authorize([Role.ADMIN]), asyncHandler(userController.getUserById));
router.patch(
  "/:id",
  authorize([Role.ADMIN]),
  asyncHandler(userController.updateUserById)
);
router.patch(
  "/:id/deactivate",
  authorize([Role.ADMIN]),
  asyncHandler(userController.deactivateUser)
);
router.delete(
  "/:id",
  authorize([Role.ADMIN]),
  asyncHandler(userController.deleteUser)
);

export default router;
