import { z } from "zod";

export const optimizeRouteDto = z.object({
  dayId: z.string().uuid().optional(), // For reference/logging
  mode: z.enum(["drive", "walk", "bicycle"]).default("drive"),
  activities: z.array(
    z.object({
      id: z.string().min(1),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      name: z.string().optional(),
      location: z.string().optional(),
      time: z.string().optional(),
    })
  ).min(4, "At least 4 activities required for route optimization"),
  origin: z.string().optional(), // "lat,lng" format (kept for frontend compatibility)
  destination: z.string().optional(), // "lat,lng" format (kept for frontend compatibility)
});