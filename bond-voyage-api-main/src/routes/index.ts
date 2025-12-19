import { Router } from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import bookingRoutes from "./booking.route";

const router = Router();

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
