import { z } from "zod";

export const notificationIdParamDto = z.object({
  id: z.string().uuid(),
});
