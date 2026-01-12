import { Request, Response } from 'express';
import { ZodError } from 'zod';
import emailService from '@/services/email.service';
import {
  systemContactDto,
  travelAgencyContactDto,
} from '@/validators/contact.dto';
import { fileToBase64, cleanupFiles } from '@/middlewares/upload.middleware';
import { HTTP_STATUS } from '@/constants/constants';
import { createResponse, throwError, AppError } from '@/utils/responseHandler';

class ContactController {
  /**
   * Send system contact email (Contact.tsx - Landing Page)
   * POST /api/contact/system
   */
  public sendSystemContact = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const payload = systemContactDto.parse(req.body);

      await emailService.sendSystemContactEmail(
        payload.name,
        payload.email,
        payload.message
      );

      createResponse(
        res,
        HTTP_STATUS.OK,
        "Your message has been sent successfully! We'll get back to you soon.",
        {
          sentAt: new Date().toISOString(),
          recipient: 'BondVoyage Development Team',
        }
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throwError(
          HTTP_STATUS.BAD_REQUEST,
          'Validation failed',
          error.errors
        );
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to send message. Please try again later.',
        error
      );
    }
  };

  /**
   * Send travel agency contact email (UserHome.tsx - User Dashboard)
   * POST /api/contact/travel-agency
   * Supports rich HTML content and file attachments
   */
  public sendTravelAgencyContact = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const files = req.files as Express.Multer.File[] | undefined;

    try {
      const payload = travelAgencyContactDto.parse(req.body);

      // Process file attachments for Brevo (base64 encoding)
      let attachments: Array<{ filename: string; content: string }> | undefined;

      if (files && files.length > 0) {
        attachments = files.map((file) => ({
          filename: file.originalname,
          content: fileToBase64(file.path),
        }));
      }

      await emailService.sendTravelAgencyContactEmail(
        payload.subject,
        payload.message,
        payload.senderName,
        payload.senderEmail,
        attachments
      );

      // Cleanup uploaded files after successful send
      if (files && files.length > 0) {
        cleanupFiles(files);
      }

      createResponse(
        res,
        HTTP_STATUS.OK,
        `Your message has been sent successfully to 4B's Travel and Tours! ${
          files && files.length > 0
            ? `(${files.length} attachment${files.length > 1 ? 's' : ''} included)`
            : ''
        }`,
        {
          sentAt: new Date().toISOString(),
          recipient: "4B's Travel and Tours",
          attachments: files?.length || 0,
        }
      );
    } catch (error) {
      // Cleanup files on error
      if (files && files.length > 0) {
        cleanupFiles(files);
      }

      if (error instanceof ZodError) {
        throwError(
          HTTP_STATUS.BAD_REQUEST,
          'Validation failed',
          error.errors
        );
      }
      if (error instanceof AppError) {
        throw error;
      }
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to send email. Please try again or contact support if the issue persists.',
        error
      );
    }
  };
}

export default new ContactController();