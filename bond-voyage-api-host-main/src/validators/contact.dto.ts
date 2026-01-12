import { z } from 'zod';

/**
 * Validation for system contact form (Contact.tsx)
 */
export const systemContactDto = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must not exceed 100 characters' })
    .trim(),

  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .trim()
    .toLowerCase(),

  message: z
    .string({ required_error: 'Message is required' })
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(5000, { message: 'Message must not exceed 5000 characters' })
    .trim(),
});

/**
 * Validation for travel agency contact form (UserHome.tsx)
 */
export const travelAgencyContactDto = z.object({
  subject: z
    .string({ required_error: 'Subject is required' })
    .min(3, { message: 'Subject must be at least 3 characters' })
    .max(200, { message: 'Subject must not exceed 200 characters' })
    .trim(),

  message: z
    .string({ required_error: 'Message is required' })
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(10000, { message: 'Message must not exceed 10000 characters' }),

  senderName: z
    .string({ required_error: 'Sender name is required' })
    .min(2, { message: 'Sender name must be at least 2 characters' })
    .trim(),

  senderEmail: z
    .string({ required_error: 'Sender email is required' })
    .email({ message: 'Invalid sender email address' })
    .trim()
    .toLowerCase(),
});

export type SystemContactInput = z.infer<typeof systemContactDto>;
export type TravelAgencyContactInput = z.infer<typeof travelAgencyContactDto>;