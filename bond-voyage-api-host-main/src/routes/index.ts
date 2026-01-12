import { Router } from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import bookingRoutes from "./booking.route";
import tourPackageRoutes from "./tour-package.route";
import paymentRoutes from "./payment.route";
import inquiryRoutes from "./inquiry.route";
import feedbackRoutes from "./feedback.route";
import activityLogRoutes from "./activity-log.route";
import notificationRoutes from "./notification.route";
import weatherRoutes from "./weather.route";
import routeRoutes from "./route.route";
import placeRoutes from "./place.route";
import chatbotRoutes from "./chatbot.route";
import dashboardRoutes from "./dashboard.route";
import aiRoutes from "./ai.route";
import itineraryRoutes from "./itinerary.route";
import faqRoutes from "./faq.route";
import uploadRoutes from "./upload.route";
import contactRoutes from "./contact.route";

const router = Router();

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);
router.use("/tour-packages", tourPackageRoutes);
router.use("/payments", paymentRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/activity-logs", activityLogRoutes);
router.use("/admin/audit-logs", activityLogRoutes);
router.use("/notifications", notificationRoutes);
router.use("/weather", weatherRoutes);
router.use("/routes", routeRoutes);
router.use("/places", placeRoutes);
router.use("/chatbots", chatbotRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/ai", aiRoutes);
router.use("/itineraries", itineraryRoutes);
router.use("/faqs", faqRoutes);
router.use("/upload", uploadRoutes);
router.use("/contact", contactRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
