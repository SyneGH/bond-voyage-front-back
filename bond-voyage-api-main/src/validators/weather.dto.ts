import { z } from "zod";

export const weatherQueryDto = z.object({
  lat: z.preprocess((value) => Number(value), z.number().min(-90).max(90)),
  lng: z.preprocess((value) => Number(value), z.number().min(-180).max(180)),
});
