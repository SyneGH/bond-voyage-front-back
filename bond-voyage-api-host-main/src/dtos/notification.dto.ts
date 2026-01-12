import { NotificationType } from "@prisma/client";

export type NotificationDataBooking = {
  bookingId: string;
  bookingCode?: string;
  status?: string;
  itineraryId?: string;
  destination?: string;
};

export type NotificationDataPayment = {
  paymentId: string;
  bookingId: string;
  bookingCode?: string;
  status?: string;
  amount?: number;
};

export type NotificationDataInquiry = {
  inquiryId: string;
  bookingId?: string;
  itineraryId?: string;
  subject?: string;
};

export type NotificationDataSystem = {
  key: string;
  meta?: Record<string, any> | null;
};

export type NotificationData =
  | NotificationDataBooking
  | NotificationDataPayment
  | NotificationDataInquiry
  | NotificationDataSystem
  | Record<string, any>
  | null;

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string | null;
  message: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: string;
}
