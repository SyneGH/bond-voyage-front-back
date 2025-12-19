import { Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { BookingService } from "@/services/booking.service";
import {
  createBookingSchema,
  updateItinerarySchema,
  updateStatusSchema,
} from "@/validations/booking.validation";
import { BookingStatus } from "@prisma/client";

export const BookingController = {
  // POST /api/bookings
  create: async (req: AuthenticatedRequest, res: Response) => {
    const { error, value } = createBookingSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      const booking = await BookingService.createBooking({
        ...value,
        userId: req.user.userId,
      });

      return res.status(201).json({ success: true, data: booking });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  // GET /api/bookings/:id
  getOne: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const booking = await BookingService.getBookingById(req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

      // Optional: if user is not admin, enforce ownership
      if (req.user?.role !== "ADMIN" && booking.userId !== req.user?.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      return res.status(200).json({ success: true, data: booking });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  // PUT /api/bookings/:id
  updateItinerary: async (req: AuthenticatedRequest, res: Response) => {
    const { error, value } = updateItinerarySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      await BookingService.updateItinerary(req.params.id, req.user.userId, value);

      const updated = await BookingService.getBookingById(req.params.id);
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      if (err.message === "BOOKING_NOT_EDITABLE") {
        return res.status(409).json({ success: false, message: "Booking cannot be modified" });
      }
      if (err.message === "BOOKING_NOT_FOUND") {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  // PATCH /api/bookings/:id/status (Admin)
  updateStatus: async (req: AuthenticatedRequest, res: Response) => {
    const { error, value } = updateStatusSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    try {
      const updated = await BookingService.updateStatus(
        req.params.id,
        value.status,
        value.rejectionReason,
        value.rejectionResolution
      );
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  // GET /api/bookings/my-bookings?page=1&limit=10
  getMyBookings: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);

      const result = await BookingService.getUserBookingsPaginated(
        req.user.userId,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },

  // GET /api/bookings/admin/bookings?status=PENDING
  getAllBookings: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.query.status as BookingStatus | undefined;
      const bookings = await BookingService.getAllBookings(status);
      return res.status(200).json({ success: true, data: bookings });
    } catch {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  // DELETE /api/bookings/:id (user can delete DRAFT only)
  deleteDraft: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      await BookingService.deleteBookingDraft(req.params.id, req.user.userId);
      return res.status(200).json({ success: true, message: "Booking deleted" });
    } catch (err: any) {
      if (err.message === "CANNOT_DELETE_NON_DRAFT") {
        return res.status(409).json({ success: false, message: "Only drafts can be deleted" });
      }
      if (err.message === "BOOKING_NOT_FOUND") {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  // PATCH /api/bookings/:id/submit  (DRAFT -> PENDING)
  submit: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const updated = await BookingService.submitBooking(req.params.id, req.user.userId);
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      if (err.message === "CANNOT_SUBMIT") {
        return res.status(409).json({ success: false, message: "Only drafts can be submitted" });
      }
      if (err.message === "BOOKING_NOT_FOUND") {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  // PATCH /api/bookings/:id/cancel
  cancel: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const updated = await BookingService.cancelBooking(req.params.id, req.user.userId);
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      if (err.message === "CANNOT_CANCEL") {
        return res.status(409).json({ success: false, message: "Booking cannot be cancelled" });
      }
      if (err.message === "BOOKING_NOT_FOUND") {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },
};
