import { z } from "zod";

export const chatbotMessageDto = z.object({
  message: z.string().min(1),
  context: z.string().optional().nullable(),
});
