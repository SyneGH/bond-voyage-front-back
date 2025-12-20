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
import { HTTP_STATUS, Role } from "@/constants/constants";

export const PaymentController = {
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { id: bookingId } = bookingIdParamDto.parse(req.params);
      const payload = createPaymentDto.parse(req.body);

      let proofImage: Buffer | undefined;
      let proofSize: number | undefined;
      const maxBytes = 5 * 1024 * 1024;

      if (payload.proofImageBase64) {
        const base64 = payload.proofImageBase64.includes(",")
          ? payload.proofImageBase64.split(",").pop()
          : payload.proofImageBase64;

        if (!base64) {
          throwError(HTTP_STATUS.BAD_REQUEST, "Invalid proof image");
        }

        proofImage = Buffer.from(base64, "base64");
        proofSize = proofImage.length;

        if (proofSize > maxBytes) {
          throwError(HTTP_STATUS.BAD_REQUEST, "Proof image exceeds 5MB limit");
        }
      }

      const payment = await PaymentService.createPayment({
        bookingId,
        userId: req.user.userId,
        amount: payload.amount,
        method: payload.method,
        type: payload.type,
        proofImage,
        proofMimeType: payload.proofMimeType ?? undefined,
        proofSize,
        transactionId: payload.transactionId ?? undefined,
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

  getProof: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const { id } = paymentIdParamDto.parse(req.params);
      const payment = await PaymentService.getPaymentProof(id);

      if (!payment) {
        throwError(HTTP_STATUS.NOT_FOUND, "Payment not found");
      }

      const isAdmin = req.user.role === Role.ADMIN;
      const isOwner = payment.booking?.userId === req.user.userId;
      const isSubmitter = payment.submittedById === req.user.userId;

      if (!isAdmin && !isOwner && !isSubmitter) {
        throwError(HTTP_STATUS.FORBIDDEN, "Insufficient permissions");
      }

      if (!payment.proofImage) {
        throwError(HTTP_STATUS.NOT_FOUND, "Payment proof not found");
      }

      if (payment.proofSize) {
        res.setHeader("Content-Length", payment.proofSize.toString());
      }

      res.setHeader(
        "Content-Type",
        payment.proofMimeType ?? "application/octet-stream"
      );

      res.status(HTTP_STATUS.OK).send(payment.proofImage);
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch payment proof",
        error
      );
    }
  },
};
