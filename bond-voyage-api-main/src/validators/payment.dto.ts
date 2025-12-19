import { z } from "zod";

export const createPaymentDto = z.object({
  amount: z.number().min(0),
  method: z.enum(["CASH", "GCASH"]).optional(),
  type: z.enum(["FULL", "PARTIAL"]).optional(),
  proofUrl: z.string().url().optional().nullable(),
  transactionId: z.string().optional().nullable(),
});

export const updatePaymentStatusDto = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
});

export const paymentIdParamDto = z.object({
  id: z.string().uuid(),
});
