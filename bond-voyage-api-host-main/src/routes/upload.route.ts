import { Router } from "express";
import { asyncHandler } from "@/middlewares/async.middleware";
import { UploadController } from "@/controllers/upload.controller";

const router = Router();

router.post(
  "/itinerary-thumbnail",
  asyncHandler(UploadController.uploadThumbnail)
);

export default router;
