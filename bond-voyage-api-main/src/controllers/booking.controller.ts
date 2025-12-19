import { Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { BookingService } from "@/services/booking.service";
import {
  bookingIdParamDto,
  bookingListQueryDto,
  createBookingDto,
  updateItineraryDto,
  updateStatusDto,
} from "@/validators/booking.dto";
import { BookingStatus } from "@prisma/client";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";
import { ZodError } from "zod";

export const BookingController = {
  // POST /api/bookings
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const payload = createBookingDto.parse(req.body);

      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const booking = await BookingService.createBooking({
        ...payload,
        userId: req.user.userId,
      });

      createResponse(res, HTTP_STATUS.CREATED, "Booking created", booking);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },

  // GET /api/bookings/:id
  getOne: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = bookingIdParamDto.parse(req.params);
      const booking = await BookingService.getBookingById(id);
      if (!booking) {
        throwError(HTTP_STATUS.NOT_FOUND, "Booking not found");
      }

      if (req.user?.role !== "ADMIN" && booking.userId !== req.user?.userId) {
        throwError(HTTP_STATUS.FORBIDDEN, "Forbidden");
      }

      createResponse(res, HTTP_STATUS.OK, "Booking retrieved", booking);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },

  // PUT /api/bookings/:id
  updateItinerary: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = bookingIdParamDto.parse(req.params);
      const payload = updateItineraryDto.parse(req.body);

      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      await BookingService.updateItinerary(id, req.user.userId, payload);

      const updated = await BookingService.getBookingById(id);
      createResponse(res, HTTP_STATUS.OK, "Booking updated", updated);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      if (error?.message === "BOOKING_NOT_EDITABLE") {
        throwError(HTTP_STATUS.CONFLICT, "Booking cannot be modified");
      }
      if (error?.message === "BOOKING_NOT_FOUND") {
        throwError(HTTP_STATUS.NOT_FOUND, "Booking not found");
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },

  // PATCH /api/bookings/:id/status (Admin)
  updateStatus: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = bookingIdParamDto.parse(req.params);
      const payload = updateStatusDto.parse(req.body);

      const updated = await BookingService.updateStatus(
        id,
        payload.status as BookingStatus,
        payload.rejectionReason,
        payload.rejectionResolution
      );
      createResponse(res, HTTP_STATUS.OK, "Booking status updated", updated);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },

  // GET /api/bookings/my-bookings?page=1&limit=10
  getMyBookings: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { page, limit } = bookingListQueryDto.parse(req.query);

      const result = await BookingService.getUserBookingsPaginated(
        req.user.userId,
        page,
        limit
      );

      createResponse(res, HTTP_STATUS.OK, "Bookings retrieved", result.items, result.meta);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },

  // GET /api/bookings/admin/bookings?status=PENDING
  getAllBookings: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { page, limit, status } = bookingListQueryDto.parse(req.query);
      const result = await BookingService.getAllBookingsPaginated(
        status as BookingStatus | undefined,
        page,
        limit
      );
      createResponse(res, HTTP_STATUS.OK, "Bookings retrieved", result.items, result.meta);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },

  // DELETE /api/bookings/:id (user can delete DRAFT only)
  deleteDraft: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { id } = bookingIdParamDto.parse(req.params);
      await BookingService.deleteBookingDraft(id, req.user.userId);
      createResponse(res, HTTP_STATUS.OK, "Booking deleted");
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      if (error?.message === "CANNOT_DELETE_NON_DRAFT") {
        throwError(HTTP_STATUS.CONFLICT, "Only drafts can be deleted");
      }
      if (error?.message === "BOOKING_NOT_FOUND") {
        throwError(HTTP_STATUS.NOT_FOUND, "Booking not found");
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },

  // PATCH /api/bookings/:id/submit  (DRAFT -> PENDING)
  submit: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { id } = bookingIdParamDto.parse(req.params);
      const updated = await BookingService.submitBooking(id, req.user.userId);
      createResponse(res, HTTP_STATUS.OK, "Booking submitted", updated);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      if (error?.message === "CANNOT_SUBMIT") {
        throwError(HTTP_STATUS.CONFLICT, "Only drafts can be submitted");
      }
      if (error?.message === "BOOKING_NOT_FOUND") {
        throwError(HTTP_STATUS.NOT_FOUND, "Booking not found");
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },

  // PATCH /api/bookings/:id/cancel
  cancel: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { id } = bookingIdParamDto.parse(req.params);
      const updated = await BookingService.cancelBooking(id, req.user.userId);
      createResponse(res, HTTP_STATUS.OK, "Booking cancelled", updated);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      if (error?.message === "CANNOT_CANCEL") {
        throwError(HTTP_STATUS.CONFLICT, "Booking cannot be cancelled");
      }
      if (error?.message === "BOOKING_NOT_FOUND") {
        throwError(HTTP_STATUS.NOT_FOUND, "Booking not found");
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error
      );
    }
  },
};
