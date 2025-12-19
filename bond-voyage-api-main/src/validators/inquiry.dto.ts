import { z } from "zod";

export const createInquiryDto = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
});

export const addInquiryMessageDto = z.object({
  content: z.string().min(1),
});

export const inquiryIdParamDto = z.object({
  id: z.string().uuid(),
});
