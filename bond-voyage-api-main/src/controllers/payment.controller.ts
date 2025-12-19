import { Response } from "express";
import { ZodError } from "zod";
import { PaymentService } from "@/services/payment.service";
import { AuthenticatedRequest } from "@/types";
import { bookingIdParamDto } from "@/validators/booking.dto";
import {
  createPaymentDto,
  paymentIdParamDto,
  updatePaymentStatusDto,
} from "@/validators/payment.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

export const PaymentController = {
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { id: bookingId } = bookingIdParamDto.parse(req.params);
      const payload = createPaymentDto.parse(req.body);

      const payment = await PaymentService.createPayment({
        bookingId,
        userId: req.user.userId,
        ...payload,
      });

      createResponse(res, HTTP_STATUS.CREATED, "Payment submitted", payment);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      if (error?.message === "BOOKING_NOT_FOUND") {
        throwError(HTTP_STATUS.NOT_FOUND, "Booking not found");
      }
      throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Payment failed", error);
    }
  },

  updateStatus: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = paymentIdParamDto.parse(req.params);
      const payload = updatePaymentStatusDto.parse(req.body);

      const payment = await PaymentService.updatePaymentStatus(id, payload.status);
      createResponse(res, HTTP_STATUS.OK, "Payment status updated", payment);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to update payment",
        error
      );
    }
  },
};
