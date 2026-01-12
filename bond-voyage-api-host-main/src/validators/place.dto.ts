import { z } from "zod";

const allowExternalSchema = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return false;
}, z.boolean());

export const placeSearchQueryDto = z.object({
  text: z.string().min(1, "Search text is required"),
  allowExternal: allowExternalSchema.optional(),
});
