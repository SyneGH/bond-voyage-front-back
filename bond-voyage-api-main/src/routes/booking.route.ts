import { Router } from "express";
import { BookingController } from "@/controllers/booking.controller";
import { PaymentController } from "@/controllers/payment.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { Role } from "@/constants/constants";
import { bookingRateLimit } from "@/middlewares/rate-limit.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";

const router = Router();

router.use(authenticate);

// USER: list
router.get("/my-bookings", asyncHandler(BookingController.getMyBookings));

// USER: create
router.post("/", bookingRateLimit, asyncHandler(BookingController.create));

// USER: submit, cancel
router.patch("/:id/submit", bookingRateLimit, asyncHandler(BookingController.submit));
router.patch("/:id/cancel", asyncHandler(BookingController.cancel));

// USER: edit itinerary
router.put("/:id", asyncHandler(BookingController.updateItinerary));

// USER: add payment proof
router.post("/:id/payments", asyncHandler(PaymentController.create));

// USER: delete draft
router.delete("/:id", asyncHandler(BookingController.deleteDraft));

// USER/ADMIN: detail
router.get("/:id", asyncHandler(BookingController.getOne));

// ADMIN: list all (with optional status filter)
router.get(
  "/admin/bookings",
  authorize([Role.ADMIN]),
  asyncHandler(BookingController.getAllBookings)
);

// ADMIN: approve/reject
router.patch(
  "/:id/status",
  authorize([Role.ADMIN]),
  asyncHandler(BookingController.updateStatus)
);

// COLLABORATION
router.post("/:id/collaborators", asyncHandler(BookingController.addCollaborator));
router.get("/:id/collaborators", asyncHandler(BookingController.listCollaborators));
router.delete(
  "/:id/collaborators/:collaboratorId",
  asyncHandler(BookingController.removeCollaborator)
);

export default router;
