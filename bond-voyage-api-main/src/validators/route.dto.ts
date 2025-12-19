import { z } from "zod";

const locationDto = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const optimizeRouteDto = z.object({
  origin: locationDto,
  destination: locationDto,
  waypoints: z.array(locationDto).optional(),
});
