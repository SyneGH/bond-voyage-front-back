// Contracts and types related to bookings

// Booking enums
export type BookingStatus =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type BookingType =
  | "STANDARD"
  | "CUSTOMIZED"
  | "REQUESTED";

export type TourType =
  | "JOINER"
  | "PRIVATE";

// ===============================
// Booking List (My Bookings, Admin)
// ===============================
export interface BookingListItem {
  id: string;
  destination: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  totalPrice: number;
  status: BookingStatus;
  type: BookingType;
  tourType: TourType;
  createdAt: string;
}

// ===============================
// Booking Detail View
// ===============================
export interface ActivityDTO {
  id?: string;
  time: string;
  title: string;
  description?: string | null;
  location?: string | null;
  icon?: string | null;
  order: number;
}

export interface ItineraryDayDTO {
  id?: string;
  dayNumber: number;
  date?: string | null;
  activities: ActivityDTO[];
}

export interface BookingDetail {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalPrice: number;
  status: BookingStatus;
  type: BookingType;
  tourType: TourType;
  rejectionReason?: string | null;
  rejectionResolution?: string | null;
  itinerary: ItineraryDayDTO[];
}
