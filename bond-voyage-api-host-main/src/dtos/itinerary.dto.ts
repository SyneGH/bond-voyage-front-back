import { ItineraryStatus, ItineraryType, RequestStatus, TourType } from "@prisma/client";

export interface ActivityDTO {
  id: string;
  time: string;
  title: string;
  description?: string | null;
  location?: string | null;
  icon?: string | null;
  order: number;
}

export interface ItineraryDayDTO {
  id: string;
  dayNumber: number;
  title?: string | null;
  date: string | null;
  activities: ActivityDTO[];
}

export interface ItineraryCollaboratorDTO {
  id: string;
  userId: string;
  role: string;
  invitedById?: string | null;
  addedAt: string | null;
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

export interface ItineraryDTO {
  id: string;
  userId: string;
  title?: string | null;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  travelers: number;
  estimatedCost?: number | null;
  type: ItineraryType;
  status: ItineraryStatus;
  version: number;
  tourType: TourType;
  sentStatus?: string | null;
  requestedStatus?: RequestStatus;
  sentAt?: string | null;
  confirmedAt?: string | null;
  rejectionReason?: string | null;
  rejectionResolution?: string | null;
  isResolved?: boolean;
  collaborators: ItineraryCollaboratorDTO[];
  days: ItineraryDayDTO[];
  createdAt?: string | null;
  updatedAt?: string | null;
}
