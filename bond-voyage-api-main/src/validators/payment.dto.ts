import { z } from "zod";

export const createPaymentDto = z.object({
  amount: z.number().min(0),
  method: z.enum(["CASH", "GCASH"]).optional(),
  type: z.enum(["FULL", "PARTIAL"]).optional(),
  proofImageBase64: z.string().optional().nullable(),
  proofMimeType: z.string().optional().nullable(),
  transactionId: z.string().optional().nullable(),
});

export const updatePaymentStatusDto = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
});

export const paymentIdParamDto = z.object({
  id: z.string().uuid(),
});
