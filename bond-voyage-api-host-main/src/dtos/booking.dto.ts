import { BookingStatus, BookingType, PaymentStatus, TourType } from "@prisma/client";
import { ItineraryDTO } from "./itinerary.dto";

export type BookingOwnership = "OWNED" | "COLLABORATED" | "REQUESTED";

export interface BookingDTO {
  id: string;
  bookingCode: string;
  itineraryId: string;
  userId: string;
  destination: string | null;
  // ISO dates
  startDate: string | null;
  endDate: string | null;
  // Display dates (formatted)
  startDateDisplay?: string | null;
  endDateDisplay?: string | null;
  dateRangeDisplay?: string | null;
  travelers: number | null;
  totalPrice: number | null;
  userBudget: number | null;
  type: BookingType;
  status: BookingStatus;
  tourType: TourType;
  paymentStatus: PaymentStatus;
  paymentReceiptUrl: string | null;
  rejectionReason: string | null;
  rejectionResolution: string | null;
  isResolved: boolean;
  customerName: string | null;
  customerEmail: string | null;
  customerMobile: string | null;
  // ISO dates
  bookedDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  // Display dates (formatted)
  bookedDateDisplay?: string | null;
  createdAtDisplay?: string | null;
  updatedAtDisplay?: string | null;
  itinerary: ItineraryDTO | null;
  ownership?: "OWNED" | "COLLABORATED" | "REQUESTED";
}
