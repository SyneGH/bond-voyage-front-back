import { Decimal } from "@prisma/client/runtime/library";
import {
  Booking,
  Itinerary,
  ItineraryCollaborator,
  ItineraryDay,
  Activity,
  User,
  Notification,
  ItineraryVersion
} from "@prisma/client";
import { BookingDTO } from "@/dtos/booking.dto";
import { ItineraryDTO } from "@/dtos/itinerary.dto";
import { NotificationDTO } from "@/dtos/notification.dto";
import { formatDisplayDate, formatDateOnly, formatDateTime, formatDateRange } from "@/utils/dateFormatter";

export const toISO = (date?: Date | null): string | null => {
  if (!date) return null;
  try {
    return date.toISOString();
  } catch (err) {
    return null;
  }
};

export const decimalToNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  if (typeof value === "object" && typeof value?.toNumber === "function") {
    return value.toNumber();
  }
  return null;
};

type SerializedItineraryInput = Itinerary & {
  collaborators?: (ItineraryCollaborator & { user?: Pick<User, "id" | "firstName" | "lastName" | "email"> | null })[];
  days?: (ItineraryDay & { activities?: Activity[] })[];
};

export const serializeItinerary = (itinerary?: SerializedItineraryInput | null): ItineraryDTO | null => {
  if (!itinerary) return null;

  return {
    id: itinerary.id,
    userId: itinerary.userId,
    title: itinerary.title ?? null,
    destination: itinerary.destination,
    startDate: toISO(itinerary.startDate),
    endDate: toISO(itinerary.endDate),
    travelers: itinerary.travelers,
    estimatedCost: decimalToNumber((itinerary as any).estimatedCost),
    type: itinerary.type,
    status: itinerary.status,
    version: (itinerary as any).version ?? 1,
    tourType: itinerary.tourType,
    sentStatus: itinerary.sentStatus ?? null,
    requestedStatus: itinerary.requestedStatus,
    sentAt: toISO(itinerary.sentAt),
    confirmedAt: toISO(itinerary.confirmedAt),
    rejectionReason: itinerary.rejectionReason ?? null,
    rejectionResolution: itinerary.rejectionResolution ?? null,
    isResolved: itinerary.isResolved,
    collaborators:
      itinerary.collaborators?.map((collab) => ({
        id: collab.id,
        userId: collab.userId,
        invitedById: collab.invitedById ?? null,
        role: collab.role,
        addedAt: toISO(collab.addedAt),
        user: collab.user
          ? {
              id: collab.user.id,
              firstName: collab.user.firstName,
              lastName: collab.user.lastName,
              email: collab.user.email,
            }
          : null,
      })) ?? [],
    days:
      itinerary.days?.map((day) => ({
        id: day.id,
        dayNumber: day.dayNumber,
        title: day.title ?? null,
        date: toISO(day.date),
        activities:
          day.activities?.map((activity) => ({
            id: activity.id,
            time: activity.time,
            title: activity.title,
            description: activity.description ?? null,
            location: activity.location ?? null,
            icon: activity.icon ?? null,
            order: activity.order,
          })) ?? [],
      })) ?? [],
    createdAt: toISO((itinerary as any).createdAt),
    updatedAt: toISO((itinerary as any).updatedAt),
  };
};

type SerializedBookingInput = Booking & {
  itinerary?: SerializedItineraryInput | null;
};

// Replace the serializeBooking function with this updated version:

export const serializeBooking = (
  booking?: SerializedBookingInput | null,
  viewerId?: string
): BookingDTO | null => {
  if (!booking) return null;

  const ownership: BookingDTO["ownership"] = booking.userId === viewerId
    ? "OWNED"
    : booking.itinerary?.collaborators?.some((collab) => collab.userId === viewerId)
      ? "COLLABORATED"
      : booking.itinerary?.type === "REQUESTED" && booking.itinerary?.userId === viewerId
        ? "REQUESTED"
        : undefined;

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    itineraryId: booking.itineraryId,
    userId: booking.userId,
    destination: booking.destination ?? null,
    // ISO dates for programmatic use
    startDate: toISO(booking.startDate),
    endDate: toISO(booking.endDate),
    // Formatted dates for display
    startDateDisplay: formatDateOnly(booking.startDate),
    endDateDisplay: formatDateOnly(booking.endDate),
    dateRangeDisplay: formatDateRange(booking.startDate, booking.endDate),
    travelers: booking.travelers ?? null,
    totalPrice: decimalToNumber(booking.totalPrice),
    userBudget: decimalToNumber(booking.userBudget),
    type: booking.type,
    status: booking.status,
    tourType: booking.tourType,
    paymentStatus: booking.paymentStatus,
    paymentReceiptUrl: (booking as any).paymentReceiptUrl ?? null,
    rejectionReason: booking.rejectionReason ?? null,
    rejectionResolution: booking.rejectionResolution ?? null,
    isResolved: booking.isResolved,
    customerName: (booking as any).customerName ?? null,
    customerEmail: (booking as any).customerEmail ?? null,
    customerMobile: (booking as any).customerMobile ?? null,
    // ISO dates
    bookedDate: toISO((booking as any).bookedDate),
    createdAt: toISO((booking as any).createdAt),
    updatedAt: toISO((booking as any).updatedAt),
    // Formatted dates for display
    bookedDateDisplay: formatDateTime((booking as any).bookedDate),
    createdAtDisplay: formatDateTime((booking as any).createdAt),
    updatedAtDisplay: formatDateTime((booking as any).updatedAt),
    itinerary: serializeItinerary(booking.itinerary ?? undefined),
    ownership,
  };
};

export type UserDTO = {
  id: string;
  email: string;
  password?: never;
  refreshTokens?: never;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  birthday: string | null;
  employeeId?: string | null;
  mobile: string;
  role: User["role"];
  avatarUrl?: string | null;
  companyName?: string | null;
  customerRating?: number | null;
  yearsInOperation?: number | null;
  isActive?: boolean;
  lastLogin: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export const serializeUser = (user?: User | null): UserDTO | null => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    birthday: toISO(user.birthday),
    employeeId: user.employeeId,
    mobile: user.mobile,
    role: user.role,
    avatarUrl: user.avatarUrl,
    companyName: user.companyName,
    customerRating: decimalToNumber(user.customerRating),
    yearsInOperation: user.yearsInOperation ?? null,
    isActive: user.isActive,
    lastLogin: toISO(user.lastLogin),
    createdAt: toISO(user.createdAt),
    updatedAt: toISO(user.updatedAt),
  };
};

export const serializeNotification = (
  notification?: Notification | null
): NotificationDTO | null => {
  if (!notification) return null;

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: (notification.data as any) ?? null,
    isRead: notification.isRead,
    createdAt: formatDisplayDate(notification.createdAt) as string,
  };
};

// Define the type expecting the relation included
type ItineraryVersionWithUser = ItineraryVersion & {
  createdBy: Pick<User, "firstName" | "lastName"> | null;
};

export const serializeVersion = (version: ItineraryVersionWithUser) => {
  // 1. Handle the JSON snapshot
  // Prisma usually returns this as an object. If it's a string, JSON.parse() it.
  const snapshotData = version.snapshot as any;

  return {
    id: version.id,
    
    // MAP: createdAt -> timestamp
    timestamp: new Date(version.createdAt).getTime(),
    
    // MAP: createdBy -> author
    author: version.createdBy
      ? `${version.createdBy.firstName} ${version.createdBy.lastName}`
      : "Unknown User",

    // MAP: snapshot -> bookingData & itineraryDays
    // We default to the structure your frontend expects if fields are missing
    bookingData: snapshotData.bookingData || {
      destination: snapshotData.destination || "",
      travelers: snapshotData.travelers || "1",
      travelDateFrom: snapshotData.startDate || "",
      travelDateTo: snapshotData.endDate || "",
      totalAmount: snapshotData.estimatedCost || "0"
    },
    itineraryDays: snapshotData.days || [],
    
    // Optional label
    label: `Version ${version.version}`
  };
};
