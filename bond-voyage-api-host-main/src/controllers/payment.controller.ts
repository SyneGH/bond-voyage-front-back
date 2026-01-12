import { Response } from "express";
import { ZodError } from "zod";
import { PaymentService } from "@/services/payment.service";
import { AuthenticatedRequest } from "@/types";
import { bookingIdAliasParamDto, bookingIdParamDto } from "@/validators/booking.dto";
import {
  createPaymentDto,
  paymentIdParamDto,
  paymentListQueryDto,
  updatePaymentStatusDto,
} from "@/validators/payment.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS, Role } from "@/constants/constants";
import { requireAuthUser } from "@/utils/requestGuards";

export const PaymentController = {
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);
      const bookingId = req.params.bookingId
        ? bookingIdAliasParamDto.parse(req.params).bookingId
        : bookingIdParamDto.parse(req.params).id;
      const payload = createPaymentDto.parse(req.body);

      let proofImage: Buffer | undefined;
      let proofSize: number | undefined;
      const maxBytes = 5 * 1024 * 1024;

      if (payload.proofOfPayment) {
        const base64 = payload.proofOfPayment.includes(",")
          ? payload.proofOfPayment.split(",").pop()
          : payload.proofOfPayment;

        if (!base64) {
          throwError(HTTP_STATUS.BAD_REQUEST, "Invalid proof image");
        }

        const proofImageBase64 = base64 as string;
        proofImage = Buffer.from(proofImageBase64, "base64");
        proofSize = proofImage.length;

        if (proofSize > maxBytes) {
          throwError(HTTP_STATUS.BAD_REQUEST, "Proof image exceeds 5MB limit");
        }
      }

      const payment = await PaymentService.createPayment({
        bookingId,
        userId: authUser.userId,
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
      const authUser = requireAuthUser(req);
      const { id } = paymentIdParamDto.parse(req.params);
      const payload = updatePaymentStatusDto.parse(req.body);

      const payment = await PaymentService.updatePaymentStatus(
        id,
        payload.status,
        authUser.userId
      );
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

  list: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, status, bookingId, dateFrom, dateTo } =
        paymentListQueryDto.parse(req.query);

      const result = await PaymentService.getPaymentsPaginated(
        {
          status: status ?? undefined,
          bookingId,
          dateFrom,
          dateTo,
        },
        page,
        limit
      );

      createResponse(
        res,
        HTTP_STATUS.OK,
        "Payments retrieved",
        result.items,
        result.meta
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to fetch payments",
        error
      );
    }
  },

  getProof: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authUser = requireAuthUser(req);

      const { id } = paymentIdParamDto.parse(req.params);
      const payment = await PaymentService.getPaymentProof(id);

      if (!payment) {
        throwError(HTTP_STATUS.NOT_FOUND, "Payment not found");
      }

      const paymentRecord = payment as NonNullable<typeof payment>;
      const isAdmin = authUser.role === Role.ADMIN;
      const isOwner = paymentRecord.booking?.userId === authUser.userId;
      const isSubmitter = paymentRecord.submittedById === authUser.userId;

      if (!isAdmin && !isOwner && !isSubmitter) {
        throwError(HTTP_STATUS.FORBIDDEN, "Insufficient permissions");
      }

      if (!paymentRecord.proofImage) {
        throwError(HTTP_STATUS.NOT_FOUND, "Payment proof not found");
      }

      if (paymentRecord.proofSize) {
        res.setHeader("Content-Length", paymentRecord.proofSize.toString());
      }

      res.setHeader(
        "Content-Type",
        paymentRecord.proofMimeType ?? "application/octet-stream"
      );

      res.status(HTTP_STATUS.OK).send(paymentRecord.proofImage);
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
