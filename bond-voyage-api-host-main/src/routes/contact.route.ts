import { Router } from 'express';
import contactController from '@/controllers/contact.controller';
import { upload } from '@/middlewares/upload.middleware';

const router = Router();

/**
 * @route   POST /api/v1/contact/system
 * @desc    Send email to BondVoyage system developers (Landing Page Contact Form)
 * @access  Public
 * @body    { name: string, email: string, message: string }
 */
router.post('/system', contactController.sendSystemContact);

/**
 * @route   POST /api/v1/contact/travel-agency
 * @desc    Send email to 4B's Travel and Tours with optional attachments (User Dashboard Contact)
 * @access  Public (can add auth middleware in production: authenticate)
 * @body    { subject: string, message: string, senderName: string, senderEmail: string }
 * @files   attachments[] (optional, max 10 files, 10MB each)
 */
router.post(
  '/travel-agency',
  upload.array('attachments', 5),
  contactController.sendTravelAgencyContact
);

export default router;