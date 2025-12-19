import { Router } from "express";
import { BookingController } from "@/controllers/booking.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";
import { bookingRateLimit } from "@/middlewares/rate-limit.middleware";

const router = Router();

router.use(authenticate);

// USER: list first (must be before "/:id")
router.get("/my-bookings", BookingController.getMyBookings);

// USER: create
router.post("/", BookingController.create);

// USER: submit, cancel
router.patch("/:id/submit", BookingController.submit);
router.patch("/:id/cancel", BookingController.cancel);

// USER: edit itinerary
router.put("/:id", BookingController.updateItinerary);

// USER: delete draft
router.delete("/:id", BookingController.deleteDraft);

// USER/ADMIN: detail
router.get("/:id", BookingController.getOne);

// ADMIN: list all (with optional status filter)
router.get(
  "/admin/bookings",
  authorize([Role.ADMIN]),
  BookingController.getAllBookings
);

// ADMIN: approve/reject
router.patch(
  "/:id/status",
  authorize([Role.ADMIN]),
  BookingController.updateStatus
);

router.post(
  "/",
  bookingRateLimit,
  BookingController.create
);

router.patch(
  "/:id/submit",
  bookingRateLimit,
  BookingController.submit
);

export default router;
