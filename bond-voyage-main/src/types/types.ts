export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedData<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;

  // user related
  isActive?: boolean;
  role?: string;
}

export type User = {
  id: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  mobile: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  avatarUrl: string | null;
  birthday: string | null;
  companyName: string | null;
  employeeId: string | null;
  customerRating: number | null;
};

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface IActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  icon: string;
  order: number;
  // Optional place object returned by places search/geocoding
  locationData?: {
    source: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
}

export interface Day {
  id: string;
  dayNumber: number;
  date?: string;
  title?: string;
  activities: IActivity[];
}

export interface Collaborator {
  id: string;
  userId: string;
  invitedById: string;
  role: string;
  addedAt: string;
  user: any | null;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string | null;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  travelers: number;
  estimatedCost: number | null;
  type: "STANDARD" | "CUSTOMIZED" | "REQUESTED";
  status: string;
  tourType: "PRIVATE" | "GROUP" | string;
  sentStatus: string | null;
  requestedStatus: string | null;
  sentAt: string | null;
  confirmedAt: string | null;
  rejectionReason: string | null;
  rejectionResolution: string | null;
  isResolved: boolean;
  collaborators: Collaborator[];
  days: Day[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  itineraryId: string;
  userId: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  travelers: number;
  totalPrice: number;
  ownership: string;
  type: "STANDARD" | "CUSTOMIZED" | "REQUESTED";
  status:
    | "DRAFT"
    | "PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED";
  tourType: "PRIVATE" | "GROUP" | string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  paymentReceiptUrl: string | null;
  rejectionReason: string | null;
  rejectionResolution: string | null;
  isResolved: boolean;
  customerName: string | null;
  customerEmail: string | null;
  customerMobile: string | null;
  bookedDate: string;
  createdAt: string;
  updatedAt: string;
  itinerary: Itinerary;
}

export interface TourPackage {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration: number;
  isActive: boolean;
  description?: string;
  thumbUrl?: string;
  days: any[];
  category: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  type: "PARTIAL" | "FULL";
  status: "PENDING" | "VERIFIED" | "REJECTED";
  transactionId?: string;
}

export interface Inquiry {
  id: string;
  subject: string;
  message: string;
  status: string;
  bookingId?: string;
  userId: string;
  createdAt: string;
}

type NotificationType =
  | "BOOKING"
  | "PAYMENT"
  | "INQUIRY"
  | "FEEDBACK"
  | "SYSTEM";

export interface INotification {
  id: string;
  userId: string;
  type: string;
  title: string | null;
  message: string;
  data: {
    amount?: number;
    status?: string;
    bookingId?: string;
    paymentId?: string;
    bookingCode?: string;
    destination?: string;
    itineraryId?: string;
  } | null;
  isRead: boolean;
  createdAt: string;
}
export interface Feedback {
  id: string;
  userId: string;
  respondedById?: string;
  rating: number;
  comment: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  respondedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  userId: string;
}

export interface WeatherResponse {
  coord?: { lon: number; lat: number };
  weather?: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main?: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind?: {
    speed: number;
    deg: number;
  };
  name?: string;
}

export interface ChatbotRequest {
  question: string;
}

export interface FAQSource {
  id: string;
  question: string;
  order: number;
  answer?: string;
  lastUpdated?: string;
  tags?: string[];
  targetPages?: string[];
  pageKeywords?: string[];
  systemCategory?: string;
}

export interface FAQAction {
  label: string;
  action: string;
  type: "QUERY" | "NAVIGATION";
}

export interface ChatbotResponse {
  answer: string;
  confidence: string;
  sources: FAQSource[];
  actions: FAQAction[];
}

export interface DashboardStats {
  cards: {
    activeBookings: number;
    completedTrips: number;
    pendingApprovals: number;
    totalUsers: number;
  };

  distributions: {
    status: {
      active: number;
      cancelled: number;
      completed: number;
      pending: number;
    };
    type: {
      customized: number;
      requested: number;
      standard: number;
    };
  };

  trends: {
    historical: number[];
    labels: string[];
    predicted: number[];
    year: number;
  };
}

export interface DraftItinerary {
  type: string;
  destination: string;
  travelers: number;
  days: Array<{
    dayNumber: number;
    date: string | null;
    title: string;
    activities: Array<{
      time: string;
      title: string;
      location?: string;
      description?: string;
      order?: number;
    }>;
  }>;
}

export interface RoamanRequest {
  prompt: string;
  preferences?: {
    selectedDay?: number;
    destination?: string;
    currentDayActivities?: IActivity[];
    totalDays?: number;
  };
}

export interface RoamanResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    draft?: DraftItinerary;
    suggestions?: string[];
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  tags: string[];
  targetPages: string[];
  pageKeywords: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Place {
  source: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface RouteOptimizationRequest {
  activities: Array<{
    id: string;
    lat: number;
    lng: number;
    name: string;
    location: string;
    time: string;
  }>;
  origin: string;
  destination: string;
  mode?: "drive" | "walk" | "bike" | "transit";
}

export interface RouteCalculationRequest {
  activities: Array<{
    id: string;
    lat: number;
    lng: number;
    name: string;
    location: string;
    time: string;
  }>;
  origin: string;
  destination: string;
  mode?: "drive" | "walk" | "bike" | "transit";
}

export interface RouteGeometry {
  type: "MultiLineString";
  coordinates: number[][][];
}

export interface ActivityResponse {
  id: string;
  lat: number;
  lng: number;
  name: string;
  location: string;
  time: string;
}

export interface RouteCalculationResponse {
  success: boolean;
  message: string;
  data: {
    activities: ActivityResponse[];
    routeGeometry: RouteGeometry;
    totalDistance: number;
    totalTime: number;
  };
}

export interface RouteOptimizationResponse {
  success: boolean;
  message: string;
  data: {
    activities: ActivityResponse[];
    routeGeometry: RouteGeometry;
    totalDistance: number;
    totalTime: number;
  };
}
