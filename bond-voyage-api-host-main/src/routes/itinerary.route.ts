import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";
import { ItineraryController } from "@/controllers/itinerary.controller";

const router = Router();

router.use(authenticate);

router.post("/", asyncHandler(ItineraryController.create));
router.get("/", asyncHandler(ItineraryController.listMine));
router.get("/:id/versions", asyncHandler(ItineraryController.listVersions));
router.get(
  "/:id/versions/:versionId",
  asyncHandler(ItineraryController.getVersionDetail)
);
router.post(
  "/:id/versions/:versionId/restore",
  asyncHandler(ItineraryController.restoreVersion)
);
router.get("/:id", asyncHandler(ItineraryController.getOne));
router.patch("/:id", asyncHandler(ItineraryController.update));
router.delete("/:id", asyncHandler(ItineraryController.delete));
router.patch("/:id/send", asyncHandler(ItineraryController.send));
router.patch("/:id/confirm", asyncHandler(ItineraryController.confirm));

router.post("/:id/collaborators", asyncHandler(ItineraryController.addCollaborator));
router.get("/:id/collaborators", asyncHandler(ItineraryController.listCollaborators));
router.delete(
  "/:id/collaborators/:userId",
  asyncHandler(ItineraryController.removeCollaborator)
);

export default router;
