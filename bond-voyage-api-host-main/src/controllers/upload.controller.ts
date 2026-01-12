import { Request, Response } from "express";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/responseHandler";

const PLACEHOLDER_URL = "https://placehold.co/600x400?text=itinerary-thumbnail";

export const UploadController = {
  uploadThumbnail: async (req: Request, res: Response): Promise<void> => {
    const file = (req as any).file;
    const bodyUrl = (req.body as any)?.url as string | undefined;
    const url = bodyUrl || file?.location || file?.url || PLACEHOLDER_URL;

    createResponse(res, HTTP_STATUS.OK, "Thumbnail uploaded", { url });
  },
};
