import { z } from "zod";
import { Regex } from "@/utils/regex";

export const addCollaboratorDto = z
  .object({
    userId: z.string().uuid().optional(),
    email: z.string().email().regex(Regex.EMAIL_PATTERN).optional(),
  })
  .refine((data) => data.userId || data.email, {
    message: "userId or email is required",
  });
