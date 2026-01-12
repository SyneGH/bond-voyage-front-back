import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Package,
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Car,
  BookOpen,
  Clock,
  MapPin,
  Compass,
  TreePine,
  Building2,
  Ship,
  Train,
  Coffee,
  ShoppingBag,
  Music,
  Sunset,
  AlertCircle,
  Waves,
  Mountain,
  Palmtree,
  Tent,
  Bike,
  Bus,
  Anchor,
  Film,
  Ticket,
  Wine,
  IceCream,
  Pizza,
  Fish,
  Salad,
  Utensils,
  Home,
  Landmark,
  Church,
  Castle,
  Globe,
  Backpack,
  Luggage,
  Umbrella,
  Sun,
  Moon,
  Star,
  Heart,
  Gift,
  ShoppingCart,
  Search,
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
} from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  SearchFilterToolbar,
  SortOrder,
} from "../components/SearchFilterToolbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { StandardItineraryDetailView } from "../components/StandardItineraryDetailView";
import { BookingListCard } from "../components/BookingListCard";
import { BookingDetailView } from "../components/BookingDetailView";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  useDeleteTourPackage,
  useTourPackageDetail,
  useTourPackages,
} from "../hooks/useTourPackages";
import { toast } from "sonner";
import { Booking, TourPackage } from "../types/types";
import { queryKeys } from "../utils/lib/queryKeys";
import {
  useBookingDetail,
  useCreateBooking,
  useAdminBookings,
  useSubmitBooking,
  useCancelBooking,
  useUpdateBookingStatus,
  useBookingPayments,
  useDeleteBooking,
} from "../hooks/useBookings";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "../hooks/useUsers";

interface RequestedItineraryBooking {
  id: string;
  bookingCode?: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  itinerary: string;
  dates: string;
  travelers: number;
  totalAmount: string;
  paid: string;
  bookedDate: string;
  status: "pending" | "in-progress" | "completed";
  sentStatus: "sent" | "unsent";
  confirmStatus?: "confirmed" | "unconfirmed";
  rawBooking?: any;
}

interface ItineraryActivity {
  time: string;
  icon: string;
  title: string;
  description: string;
  location?: string;
  order: number;
}

interface ItineraryDay {
  day: number;
  dayNumber: number;
  title: string;
  activities: ItineraryActivity[];
}

interface BookingFormData {
  customerName: string;
  customerId?: string;
  email: string;
  mobile: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  tourType: "Joiner" | "Private";
}

interface ItineraryProps {
  requestedBookingsFromBookings?: any[];
  newStandardItineraries?: any[];
  drafts?: any[];
  onEditRequestedDraft?: (draft: any) => void;
  onEditStandardDraft?: (draft: any) => void;
  onDeleteDraft?: (draftId: string) => void;
}

const transformStandardItineraryDetailsForPayload = (
  days: ItineraryDay[],
  startDate?: string
): any[] => {
  if (!days || days.length === 0) return [];

  return days.map((day, index) => {
    let date = null;
    if (startDate) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + index);
      date = dayDate.toISOString();
    }

    return {
      dayNumber: day.dayNumber || index + 1,
      date: date,
      activities: (day.activities || []).map((activity, activityIndex) => ({
        time: activity.time || "00:00",
        title: activity.title || `Activity ${activityIndex + 1}`,
        description: activity.description || "",
        location: activity.location || "",
        icon: activity.icon || null,
        order: activity.order || activityIndex,
      })),
    };
  });
};

const transformApiDaysToItineraryDetailsForPayload = (days: any[]): any[] => {
  if (!days || days.length === 0) return [];

  return days.map((day, index) => ({
    dayNumber: day.dayNumber || index + 1,
    date: day.date || null,
    activities: (day.activities || []).map(
      (activity: any, activityIndex: number) => ({
        time: activity.time || "00:00",
        title: activity.title || `Activity ${activityIndex + 1}`,
        description: activity.description || "",
        location: activity.location || "",
        icon: activity.icon || null,
        order: activity.order || activityIndex,
      })
    ),
  }));
};

const transformRequestedItineraryForPayload = (days: any[]): any[] => {
  if (!days || days.length === 0) return [];

  return days.map((day, index) => ({
    dayNumber: day.dayNumber || index + 1,
    date: day.date || null,
    activities: (day.activities || []).map(
      (activity: any, activityIndex: number) => ({
        time: activity.time || "00:00",
        title: activity.title || `Activity ${activityIndex + 1}`,
        description: activity.description || "",
        location: activity.location || "",
        icon: activity.icon || null,
        order: activity.order || activityIndex,
      })
    ),
  }));
};

const ICON_MAP: Record<string, any> = {
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Car,
  Package,
  MapPin,
  Compass,
  TreePine,
  Building2,
  Ship,
  Train,
  Coffee,
  ShoppingBag,
  Music,
  Sunset,
  Clock,
  Waves,
  Mountain,
  Palmtree,
  Tent,
  Bike,
  Bus,
  Anchor,
  Film,
  Ticket,
  Wine,
  IceCream,
  Pizza,
  Fish,
  Salad,
  Utensils,
  Home,
  Landmark,
  Church,
  Castle,
  Globe,
  Backpack,
  Luggage,
  Umbrella,
  Sun,
  Moon,
  Star,
  Heart,
  Gift,
  ShoppingCart,
  Search,
};

const getIconName = (iconComponent: any): string => {
  if (typeof iconComponent === "string") return iconComponent;

  for (const [name, component] of Object.entries(ICON_MAP)) {
    if (component === iconComponent) return name;
  }
  return "Clock";
};

const serializeItineraryData = (data: any) => {
  if (!data) return data;

  const serialized = { ...data };

  if (data.itineraryDetails || data.itineraryDays) {
    const details = data.itineraryDetails || data.itineraryDays;
    serialized.itineraryDetails = details.map((day: any) => ({
      ...day,
      activities: day.activities.map((activity: any) => ({
        ...activity,
        icon: getIconName(activity.icon),
      })),
    }));
    if (data.itineraryDays) {
      serialized.itineraryDays = serialized.itineraryDetails;
    }
  }

  return serialized;
};

const formatDateRange = (
  startDate: string | Date | null,
  endDate: string | Date | null
): string => {
  if (!startDate || !endDate) return "Dates not set";

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid dates";
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return `${formatDate(start)} – ${formatDate(end)}`;
  } catch (error) {
    return "Invalid date format";
  }
};

const formatDate = (dateString: string | Date | null): string => {
  if (!dateString) return "Date not available";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid date";
  }
};

const formatDateISO = (dateString: string | Date | null): string => {
  if (!dateString) return new Date().toISOString().split("T")[0];

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0];

    return date.toISOString().split("T")[0];
  } catch (error) {
    return new Date().toISOString().split("T")[0];
  }
};

const getStatusBadge = (
  status: string,
  isResolved?: boolean
): "pending" | "in-progress" | "completed" => {
  if (isResolved) return "completed";

  const statusMap: Record<string, "pending" | "in-progress" | "completed"> = {
    DRAFT: "pending",
    PENDING: "pending",
    CONFIRMED: "in-progress",
    APPROVED: "in-progress",
    COMPLETED: "completed",
    CANCELLED: "completed",
    REJECTED: "completed",
  };

  return statusMap[status] || "pending";
};

const getSentStatus = (booking: any): "sent" | "unsent" => {
  const sentAt = booking.itinerary?.sentAt || booking.sentAt;
  const sentStatus = booking.itinerary?.sentStatus || booking.sentStatus;
  const status = booking.status || booking.itinerary?.status;

  if (sentAt || sentStatus === "sent" || status === "CONFIRMED") {
    return "sent";
  }

  return "unsent";
};

const getConfirmStatus = (status: string): "confirmed" | "unconfirmed" => {
  return status === "CONFIRMED" ? "confirmed" : "unconfirmed";
};

const getActivityIcon = (title: string) => {
  const lowerTitle = title?.toLowerCase() || "";
  if (lowerTitle.includes("flight") || lowerTitle.includes("arrival"))
    return "Plane";
  if (lowerTitle.includes("hotel") || lowerTitle.includes("check-in"))
    return "Hotel";
  if (lowerTitle.includes("photo") || lowerTitle.includes("view"))
    return "Camera";
  if (
    lowerTitle.includes("lunch") ||
    lowerTitle.includes("dinner") ||
    lowerTitle.includes("breakfast")
  )
    return "UtensilsCrossed";
  if (lowerTitle.includes("transfer") || lowerTitle.includes("drive"))
    return "Car";
  return "MapPin";
};

const transformApiBooking = (apiBooking: any) => {
  // Get dates
  const start =
    apiBooking.startDate ||
    apiBooking.itinerary?.startDate ||
    apiBooking.itinerary?.days?.[0]?.date;
  const end =
    apiBooking.endDate ||
    apiBooking.itinerary?.endDate ||
    apiBooking.itinerary?.days?.[apiBooking.itinerary?.days?.length - 1]?.date;

  const startDate = formatDateISO(start);
  const endDate = formatDateISO(end);

  // Format dates for display
  const formattedDates =
    start && end
      ? `${formatDate(start)} - ${formatDate(end)}`
      : "Date not available";

  // Parse booked date
  const bookedDate = formatDate(apiBooking.bookedDate || apiBooking.createdAt);

  // Parse total amount
  const totalAmount = parseFloat(
    apiBooking.totalPrice || apiBooking.itinerary?.estimatedCost || 0
  );
  const formattedTotal = `₱${totalAmount.toLocaleString()}`;

  // Get customer information
  const customerName =
    apiBooking.customerName ||
    apiBooking.itinerary?.userId ||
    "Unknown Customer";
  const customerEmail =
    apiBooking.customerEmail || apiBooking.itinerary?.user?.email || "";
  const customerMobile = apiBooking.customerMobile || "N/A";

  const itineraryDetails =
    apiBooking.itinerary?.days?.map((day: any) => ({
      day: day.dayNumber,
      title: `Day ${day.dayNumber}`,
      activities:
        (day.activities || []).map((act: any) => ({
          time: act.time || "",
          icon: getActivityIcon(act.title),
          title: act.title || "",
          description: act.description || "",
          location: act.location || "",
        })) || [],
    })) || [];

  const data = {
    id: apiBooking.id,
    bookingCode: apiBooking.bookingCode,
    customer: customerName,
    email: customerEmail,
    mobile: customerMobile,
    destination: apiBooking.destination || apiBooking.itinerary?.destination,
    dates: formattedDates,
    startDate: startDate,
    endDate: endDate,
    travelers: apiBooking.travelers || apiBooking.itinerary?.travelers || 1,
    total: formattedTotal,
    totalAmount: totalAmount,
    bookedDate: bookedDate,
    status: apiBooking.status,
    bookingType: apiBooking.type,
    tourType:
      apiBooking.tourType || apiBooking.itinerary?.tourType || "PRIVATE",
    rejectionReason: apiBooking.rejectionReason,
    rejectionResolution: apiBooking.rejectionResolution,
    resolutionStatus: apiBooking.isResolved ? "resolved" : "unresolved",
    itineraryDetails: itineraryDetails,
  };

  return data;
};

// Simplified transformation for BookingListCard
const transformBookingForListCard = (apiBooking: any) => {
  const transformed = transformApiBooking(apiBooking);

  return {
    id: transformed.id,
    bookingCode: transformed.bookingCode,
    customer: transformed.customer,
    email: transformed.email,
    mobile: transformed.mobile,
    destination: transformed.destination,
    startDate: transformed.startDate,
    endDate: transformed.endDate,
    travelers: transformed.travelers,
    total: transformed.total,
    totalAmount: transformed.totalAmount,
    bookedDate: transformed.bookedDate,
    status: transformed.status,
    bookingType: transformed.bookingType,
    tourType: transformed.tourType,
    rejectionReason: transformed.rejectionReason,
    rejectionResolution: transformed.rejectionResolution,
    resolutionStatus: transformed.resolutionStatus,
    // For BookingListCard props
    customerName: transformed.customer,
    customerEmail: transformed.email,
    customerMobile: transformed.mobile,
    totalAmountNum: transformed.totalAmount,
    // Keep raw booking for reference
    rawBooking: apiBooking,
  };
};

export function Itinerary({
  requestedBookingsFromBookings = [],
  newStandardItineraries = [],
  drafts = [],
  onEditRequestedDraft,
  onEditStandardDraft,
  onDeleteDraft,
}: ItineraryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const standardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const requestedRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [selectedCategory, setSelectedCategory] = useState<
    "Standard" | "Requested"
  >("Standard");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
  });

  const [selectedRequestedId, setSelectedRequestedId] = useState<string | null>(
    null
  );

  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useAdminBookings({
    ...queryParams,
    type: "REQUESTED",
  });

  const {
    data: tourPackagesResponse,
    isLoading: isLoadingPackages,
    error: packagesError,
    refetch: refetchTourPackages,
  } = useTourPackages({ isActive: true });

  const { mutate: createBooking, isPending: isCreateBookingPending } =
    useCreateBooking();

  const { mutate: deleteTourPackage, isPending } = useDeleteTourPackage({});

  const { mutate: submitBooking, isPending: isSubmitting } = useSubmitBooking(
    selectedRequestedId || "",
    {
      onSuccess: () => {
        toast.success("Itinerary Sent to Client!", {
          description: "The requested itinerary has been marked as sent.",
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(selectedRequestedId!),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.adminBookings(queryParams),
        });
      },
      onError: (error: any) => {
        toast.error("Failed to send itinerary", {
          description: error.message || "Please try again.",
        });
      },
    }
  );

  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking(
    selectedRequestedId || "",
    {
      onSuccess: () => {
        toast.success("Booking Cancelled", {
          description: "The booking has been cancelled successfully.",
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(selectedRequestedId!),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.adminBookings(queryParams),
        });
      },
      onError: (error: any) => {
        toast.error("Failed to cancel booking", {
          description: error.message || "Please try again.",
        });
      },
    }
  );

  const { mutate: updateBookingStatus, isPending: isUpdatingStatus } =
    useUpdateBookingStatus(selectedRequestedId || "", {
      onSuccess: () => {
        toast.success("Status Updated", {
          description: "Booking status has been updated successfully.",
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(selectedRequestedId!),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.adminBookings(queryParams),
        });
        setStatusUpdateModalOpen(false);
      },
      onError: (error: any) => {
        toast.error("Failed to update status", {
          description: error.message || "Please try again.",
        });
      },
    });

  const { mutate: deleteBooking, isPending: isDeletingBooking } =
    useDeleteBooking(selectedRequestedId || "", {
      onSuccess: () => {
        toast.success("Booking Deleted", {
          description: "The booking has been deleted successfully.",
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(selectedRequestedId!),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.adminBookings(queryParams),
        });
        refetchBookings();
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        setRequestedViewMode("list");
        setSelectedRequestedId(null);
      },
      onError: (error: any) => {
        toast.error("Failed to delete booking", {
          description: error.response?.data?.message || "Please try again.",
        });
      },
    });

  // Payment hooks
  const { data: paymentsData } = useBookingPayments(selectedRequestedId!);

  // User search states
  const [userSearchParams, setUserSearchParams] = useState<{
    q?: string;
    limit?: number;
  }>({
    q: "",
    limit: 5,
  });

  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
  const [isUserSearching, setIsUserSearching] = useState(false);

  const { data: usersData, isLoading: isSearchingUsers } = useUsers(
    userSearchParams,
    {
      enabled: !!userSearchParams.q && userSearchParams.q?.length >= 2,
      staleTime: 30000,
      queryKey: [queryKeys.users.list],
    }
  );

  // Booking modal states
  const [standardBookingModalOpen, setStandardBookingModalOpen] =
    useState(false);
  const [selectedStandardForBooking, setSelectedStandardForBooking] = useState<
    string | null
  >(null);
  const [requestedBookingModalOpen, setRequestedBookingModalOpen] =
    useState(false);
  const [selectedRequestedForBooking, setSelectedRequestedForBooking] =
    useState<string | null>(null);

  // Booking form data
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    customerName: "",
    customerId: "",
    email: "",
    mobile: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    tourType: "Private" as any,
  });

  // Status update states
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{
    status: string;
    rejectionReason?: string;
    rejectionResolution?: string;
  }>({
    status: "",
    rejectionReason: "",
    rejectionResolution: "",
  });

  const { data: selectedBookingPackageDetail } = useTourPackageDetail(
    selectedStandardForBooking || "",
    {
      enabled: !!selectedStandardForBooking,
      queryKey: [queryKeys.tourPackages.detail, selectedStandardForBooking],
    }
  );

  // Delete states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "api" | "local" | "booking";
    title?: string;
    destination?: string;
  } | null>(null);

  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(
    null
  );

  const [requestedViewMode, setRequestedViewMode] = useState<"list" | "detail">(
    "list"
  );

  // Delete draft states
  const [deleteDraftConfirmOpen, setDeleteDraftConfirmOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<any | null>(null);

  // State for standard itinerary updates from edit page
  const [standardItineraryUpdates, setStandardItineraryUpdates] = useState<
    Record<string, any>
  >({});
  const [requestedBookingUpdates, setRequestedBookingUpdates] = useState<
    Record<string, any>
  >({});

  // Confirmation modal for creating booking
  const [createBookingConfirmOpen, setCreateBookingConfirmOpen] =
    useState(false);

  // Requested bookings state
  const [requestedBookings, setRequestedBookings] = useState<
    RequestedItineraryBooking[]
  >([]);

  // Fetch detailed tour package when one is selected
  const { data: selectedTourPackageDetail } = useTourPackageDetail(
    selectedStandardId || "",
    {
      enabled: !!selectedStandardId,
      queryKey: [queryKeys.tourPackages.detail],
    }
  );

  const {
    data: bookingDetailData,
    isLoading: isLoadingBookingDetail,
    isError: isBookingDetailError,
  } = useBookingDetail(selectedRequestedId!, {
    enabled: !!selectedRequestedId && requestedViewMode === "detail",
    queryKey: queryKeys.bookings.detail(selectedRequestedId!),
  });

  // Transform API tour package to standard itinerary format
  const transformTourPackageToItinerary = (
    tourPackage: TourPackage,
    index: number
  ) => {
    return {
      id: tourPackage.id,
      title: tourPackage.title,
      destination: tourPackage.destination,
      days: tourPackage.duration,
      category: "Standard",
      pricePerPax: tourPackage.price,
      image: tourPackage.thumbUrl || "/placeholder-image.jpg",
      description: tourPackage.description,
      apiSource: true, // Mark as API sourced
      isActive: tourPackage.isActive,
    };
  };

  // Transform API days to itinerary details format
  const transformApiDaysToItineraryDetails = (days: any[]): ItineraryDay[] => {
    if (!days || days.length === 0) return [];

    return days.map((day: any, index: number) => ({
      day: index + 1,
      dayNumber: index + 1,
      title: day.title || `Day ${index + 1}`,
      activities: (day.activities || []).map(
        (activity: any, activityIndex: number) => ({
          time: activity.time || "TBD",
          icon: activity.icon || "Clock",
          title: activity.title || "Activity",
          description: activity.description || "",
          location: activity.location || "",
          order: activity.order || activityIndex + 1,
        })
      ),
    }));
  };

  // User search handlers
  const handleUserNameInput = (value: string) => {
    setBookingFormData((prev) => ({
      ...prev,
      customerName: value,
      ...(value !== prev.customerName &&
        value.length < 2 && {
          customerId: "",
          email: "",
          mobile: "",
        }),
    }));

    if (value.length >= 2) {
      setUserSearchParams((prev) => ({
        ...prev,
        q: value,
      }));
    } else {
      setUserSearchParams((prev) => ({
        ...prev,
        q: undefined,
      }));
      setUserSuggestions([]);
      setIsUserSearching(false);
    }
  };

  const selectUserSuggestion = (user: any) => {
    setBookingFormData((prev) => ({
      ...prev,
      customerName: `${user.firstName} ${user.lastName}`,
      customerId: user.id,
      email: user.email || "",
      mobile: user.mobile || "",
    }));

    setUserSearchParams((prev) => ({
      ...prev,
      q: undefined,
    }));
    setUserSuggestions([]);
    setIsUserSearching(false);
  };

  const tourPackages: TourPackage[] = useMemo(() => {
    if (!tourPackagesResponse?.data) return [];
    return Array.isArray(tourPackagesResponse.data)
      ? tourPackagesResponse.data
      : [];
  }, [tourPackagesResponse?.data]);

  // Combine API itineraries with newly created ones
  const apiItineraries = useMemo(() => {
    return tourPackages.map((pkg, index) =>
      transformTourPackageToItinerary(pkg, index)
    );
  }, [tourPackages]);

  // Filter only active packages
  const activeApiItineraries = useMemo(() => {
    return apiItineraries.filter((itinerary) => itinerary.isActive !== false);
  }, [apiItineraries]);

  const templates = useMemo(() => {
    const combined = [...activeApiItineraries, ...newStandardItineraries];
    return combined.map((t) => standardItineraryUpdates[t.id] || t);
  }, [activeApiItineraries, newStandardItineraries, standardItineraryUpdates]);

  const [standardItineraryDetails, setStandardItineraryDetails] = useState<
    Record<string, ItineraryDay[]>
  >({});

  // Standard itinerary states
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");

  // Requested itinerary states

  useEffect(() => {
    if (selectedTourPackageDetail?.data) {
      const pkg = selectedTourPackageDetail.data;
      const days = Array.isArray(pkg.days) ? pkg.days : [];
      const details = transformApiDaysToItineraryDetails(days);

      if (pkg.id) {
        setStandardItineraryDetails((prev) => ({
          ...prev,
          [pkg.id]: details,
        }));
      }
    }
  }, [selectedTourPackageDetail]);

  useEffect(() => {
    const newDetails: Record<string, ItineraryDay[]> = {};

    newStandardItineraries.forEach((itinerary) => {
      if (itinerary.itineraryDetails) {
        newDetails[itinerary.id] = itinerary.itineraryDetails;
      }
    });

    Object.keys(standardItineraryUpdates).forEach((id) => {
      if (standardItineraryUpdates[id]?.itineraryDetails) {
        newDetails[id] = standardItineraryUpdates[id].itineraryDetails;
      }
    });

    if (Object.keys(newDetails).length > 0) {
      setStandardItineraryDetails((prev) => ({ ...prev, ...newDetails }));
    }
  }, [newStandardItineraries, standardItineraryUpdates]);

  useEffect(() => {
    if (bookingsData?.data) {
      const transformedBookings: RequestedItineraryBooking[] =
        bookingsData.data.map((apiBooking: any) => {
          const transformed = transformApiBooking(apiBooking);

          // Determine sent status
          const sentAt = apiBooking.itinerary?.sentAt || apiBooking.sentAt;
          const sentStatus =
            apiBooking.itinerary?.sentStatus ||
            bookingDetailData?.data?.itinerary.sentStatus;
          const sent =
            sentAt || sentStatus === "sent" || apiBooking.status === "CONFIRMED"
              ? "sent"
              : "unsent";

          // Determine confirm status
          const confirmStatus =
            apiBooking.status === "CONFIRMED" ? "confirmed" : "unconfirmed";

          // Determine status badge
          const statusBadge = getStatusBadge(
            apiBooking.status,
            apiBooking.isResolved
          );

          return {
            id: transformed.id,
            bookingCode: transformed.bookingCode,
            customer: transformed.customer,
            email: transformed.email,
            mobile: transformed.mobile,
            destination: transformed.destination,
            itinerary: transformed.destination,
            dates: transformed.dates,
            travelers: transformed.travelers,
            totalAmount: transformed.total,
            paid: "₱0",
            bookedDate: transformed.bookedDate,
            status: statusBadge,
            sentStatus: sent,
            confirmStatus: confirmStatus,
            rawBooking: apiBooking,
          };
        });

      setRequestedBookings(transformedBookings);
    }
  }, [bookingsData, bookingDetailData]);

  useEffect(() => {
    if (
      requestedBookingsFromBookings &&
      requestedBookingsFromBookings.length > 0
    ) {
      const convertedBookings: any[] = requestedBookingsFromBookings.map(
        (booking) => ({
          id: booking.id,
          customer: booking.customer,
          email: booking.email,
          mobile: booking.mobile,
          destination: booking.destination,
          itinerary: booking.itinerary,
          dates: formatDateRange(booking.startDate, booking.endDate),
          travelers: booking.travelers,
          totalAmount: booking.totalAmount
            ? typeof booking.totalAmount === "number"
              ? `₱${booking.totalAmount.toLocaleString()}`
              : booking.totalAmount
            : "₱0",
          paid: booking.paid
            ? typeof booking.paid === "number"
              ? `₱${booking.paid.toLocaleString()}`
              : booking.paid
            : "₱0",
          bookedDate: booking.bookedDate,
          status: "pending",
          sentStatus: getSentStatus(booking),
          confirmStatus: getConfirmStatus(booking.status),
        })
      );

      setRequestedBookings((prev) => {
        const existingIds = prev.map((b) => b.id);
        const newBookings = convertedBookings.filter(
          (b) => !existingIds.includes(b.id)
        );
        return [...newBookings, ...prev];
      });
    }
  }, [requestedBookingsFromBookings]);

  useEffect(() => {
    if (location.state?.scrollToId) {
      const { scrollToId, category, updatedItinerary, updatedBooking } =
        location.state;

      if (category === "Standard" && updatedItinerary) {
        setStandardItineraryUpdates((prev) => ({
          ...prev,
          [updatedItinerary.id]: updatedItinerary,
        }));
        setSelectedCategory("Standard");
        setViewMode("grid");

        setTimeout(() => {
          const element = standardRefs.current[scrollToId];
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.style.animation = "highlight 2s ease-in-out";
          }
        }, 300);
      }

      if (category === "Requested" && updatedBooking) {
        setRequestedBookingUpdates((prev) => ({
          ...prev,
          [updatedBooking.id]: updatedBooking,
        }));
        setSelectedCategory("Requested");
        setRequestedViewMode("list");

        setTimeout(() => {
          const element = requestedRefs.current[scrollToId];
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.style.animation = "highlight 2s ease-in-out";
          }
        }, 300);
      }

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // User search effects
  useEffect(() => {
    if (usersData?.data?.users) {
      setUserSuggestions(usersData.data.users);
      setIsUserSearching(true);
    } else {
      setUserSuggestions([]);
    }
  }, [usersData]);

  useEffect(() => {
    if (!userSearchParams.q || userSearchParams.q.length < 2) {
      setUserSuggestions([]);
      setIsUserSearching(false);
    }
  }, [userSearchParams.q]);

  const handleDeleteTourPackage = (id: string) => {
    deleteTourPackage(
      { id },
      {
        onSuccess: () => {
          toast.success("Tour package deleted successfully!");
          refetchTourPackages();
        },
        onError: () => {
          toast.error("Failed to delete tour package");
        },
      }
    );
  };

  const handleSendToClient = (bookingId: string) => {
    submitBooking(bookingId, {
      onSuccess: () => {
        toast.success("Itinerary Sent to Client!", {
          description: "The requested itinerary has been marked as sent.",
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(bookingId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.adminBookings(queryParams),
        });
      },
      onError: (error: any) => {
        toast.error("Failed to send itinerary", {
          description: error.message || "Please try again.",
        });
      },
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId, {
      onSuccess: () => {
        toast.success("Booking Cancelled", {
          description: "The booking has been cancelled successfully.",
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(bookingId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.adminBookings(queryParams),
        });
      },
      onError: (error: any) => {
        toast.error("Failed to cancel booking", {
          description: error.message || "Please try again.",
        });
      },
    });
  };

  const handleUpdateBookingStatus = (
    bookingId: string,
    status: string,
    rejectionReason?: string,
    rejectionResolution?: string
  ) => {
    updateBookingStatus(
      {
        id: bookingId,
        data: {
          status,
          ...(rejectionReason && { rejectionReason }),
          ...(rejectionResolution && { rejectionResolution }),
        },
      },
      {
        onSuccess: () => {
          toast.success("Status Updated", {
            description: "Booking status has been updated successfully.",
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.bookings.detail(bookingId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.bookings.adminBookings(queryParams),
          });
          setStatusUpdateModalOpen(false);
        },
        onError: (error: any) => {
          toast.error("Failed to update status", {
            description: error.message || "Please try again.",
          });
        },
      }
    );
  };

  const handleDeleteItinerary = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "api") {
      // For standard tour packages
      handleDeleteTourPackage(itemToDelete.id);
    } else if (itemToDelete.type === "booking") {
      // For requested bookings - use the delete booking hook
      deleteBooking();
    } else {
      // For local drafts
      if (onDeleteDraft) {
        onDeleteDraft(itemToDelete.id);
        toast.success("Draft deleted successfully!");
      }
    }

    setItemToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const confirmDelete = (item: {
    id: string;
    type: "api" | "local";
    title?: string;
    destination?: string;
  }) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleExportPDF = () => {
    toast.info("PDF export functionality coming soon");
  };

  const handleExportExcel = () => {
    toast.info("Excel export functionality coming soon");
  };

  const getFilteredAndSortedTemplates = () => {
    let filtered = templates.filter((t) => t.category === selectedCategory);

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOrder === "newest") {
      filtered = [...filtered].reverse();
    } else if (sortOrder === "oldest") {
      filtered = [...filtered];
    }

    return filtered;
  };

  const getFilteredRequestedBookings = () => {
    const allBookings = [...requestedBookings];

    let filtered = allBookings;

    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.itinerary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOrder === "newest") {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.bookedDate);
        const dateB = new Date(b.bookedDate);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (sortOrder === "oldest") {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.bookedDate);
        const dateB = new Date(b.bookedDate);
        return dateA.getTime() - dateB.getTime();
      });
    }

    return filtered;
  };

  const filteredTemplates = getFilteredAndSortedTemplates();
  const filteredRequestedBookings = getFilteredRequestedBookings();

  const selectedStandard = selectedStandardId
    ? templates.find((t) => t.id === selectedStandardId)
    : null;

  const selectedRequestedBase = selectedRequestedId
    ? requestedBookings.find((b) => b.id === selectedRequestedId)
    : null;
  const selectedRequested = selectedRequestedBase
    ? requestedBookingUpdates[selectedRequestedBase.id] || selectedRequestedBase
    : null;

  const handleShowBookingConfirmation = () => {
    if (
      !selectedStandardForBooking ||
      !bookingFormData.customerName ||
      !bookingFormData.email ||
      !bookingFormData.mobile ||
      !bookingFormData.travelDateFrom ||
      !bookingFormData.travelDateTo
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setCreateBookingConfirmOpen(true);
  };

  const handleBookStandardItinerary = () => {
    if (!selectedStandardForBooking) return;

    const standard = templates.find((t) => t.id === selectedStandardForBooking);
    if (!standard) return;

    const travelers = parseInt(bookingFormData.travelers);
    const totalAmount = standard.pricePerPax
      ? standard.pricePerPax * travelers
      : 0;

    // Transform itinerary details to match expected format
    let itineraryDays: any[] = [];

    if (selectedBookingPackageDetail?.data?.days) {
      itineraryDays = transformApiDaysToItineraryDetailsForPayload(
        selectedBookingPackageDetail.data.days
      );
    } else if (standardItineraryDetails[standard.id]) {
      itineraryDays = transformStandardItineraryDetailsForPayload(
        standardItineraryDetails[standard.id],
        bookingFormData.travelDateFrom
      );
    }

    // Create the booking payload matching the expected API format
    const newBooking = {
      destination: standard.destination,
      travelers: travelers,
      totalPrice: totalAmount,
      type: "STANDARD",
      tourType: bookingFormData.tourType.toUpperCase(),
      customerName: bookingFormData.customerName,
      customerEmail: bookingFormData.email,
      customerMobile: bookingFormData.mobile,
      ...(bookingFormData.customerId && { userId: bookingFormData.customerId }),
      ...(bookingFormData.travelDateFrom && {
        startDate: bookingFormData.travelDateFrom,
      }),
      ...(bookingFormData.travelDateTo && {
        endDate: bookingFormData.travelDateTo,
      }),
      // Include itinerary data if available
      ...(itineraryDays.length > 0 && {
        itinerary: {
          title:
            standard.title || `Standard Itinerary - ${standard.destination}`,
          destination: standard.destination,
          travelers: travelers,
          type: "STANDARD",
          tourType: bookingFormData.tourType.toUpperCase(),
          days: itineraryDays,
        },
      }),
    };

    console.log("Creating standard booking payload:", newBooking);

    createBooking(newBooking, {
      onSuccess: (response) => {
        setBookingFormData({
          customerName: "",
          customerId: "",
          email: "",
          mobile: "",
          travelDateFrom: "",
          travelDateTo: "",
          travelers: "1",
          tourType: "Private" as any,
        });
        setCreateBookingConfirmOpen(false);
        setStandardBookingModalOpen(false);
        setSelectedStandardForBooking(null);

        toast.success("Standard Booking Created!", {
          description: `Booking for ${bookingFormData.customerName} has been successfully created.`,
        });
        navigate("/bookings");
      },
      onError: (error: any) => {
        console.error("Booking creation error:", error);
        toast.error("Standard Booking Failed!", {
          description:
            error.response?.data?.message ||
            error.message ||
            `Booking for ${bookingFormData.customerName} has failed.`,
        });
      },
    });
  };

  const handleCreateBookingFromRequested = () => {
    if (!selectedRequestedForBooking || !bookingFormData.customerName) {
      toast.error("Missing required information");
      return;
    }

    const requestedBooking = requestedBookings.find(
      (b) => b.id === selectedRequestedForBooking
    );

    if (!requestedBooking) {
      toast.error("Requested itinerary not found");
      return;
    }

    // Extract numeric value from the formatted string
    const totalAmount = parseFloat(
      requestedBooking?.totalAmount?.replace(/[^0-9.]/g, "")
    );

    // Get the detailed booking data to extract itinerary information
    const bookingDetail =
      bookingDetailData?.data || requestedBooking.rawBooking;

    // Create the booking payload matching the expected API format
    const newBooking = {
      destination: requestedBooking.destination,
      travelers: parseInt(bookingFormData.travelers),
      totalPrice: totalAmount,
      type: "REQUESTED",
      tourType: bookingFormData.tourType.toUpperCase(),
      customerName: bookingFormData.customerName,
      customerEmail: bookingFormData.email,
      customerMobile: bookingFormData.mobile,
      ...(bookingFormData.customerId && { userId: bookingFormData.customerId }),
      ...(bookingFormData.travelDateFrom && {
        startDate: bookingFormData.travelDateFrom,
      }),
      ...(bookingFormData.travelDateTo && {
        endDate: bookingFormData.travelDateTo,
      }),
      // Include original requested itinerary ID
      ...(bookingDetail?.itineraryId && {
        itineraryId: bookingDetail.itineraryId,
      }),
      // Or include full itinerary data if needed
      ...(bookingDetail?.itinerary && {
        itinerary: {
          title:
            bookingDetail.itinerary.title ||
            `Requested Itinerary - ${requestedBooking.destination}`,
          destination: requestedBooking.destination,
          travelers: parseInt(bookingFormData.travelers),
          type: "CUSTOMIZED",
          tourType: bookingFormData.tourType.toUpperCase(),
          days: transformRequestedItineraryForPayload(
            bookingDetail.itinerary?.days || []
          ),
        },
      }),
    };

    console.log("Creating requested booking payload:", newBooking);

    createBooking(newBooking, {
      onSuccess: (response) => {
        setBookingFormData({
          customerName: "",
          customerId: "",
          email: "",
          mobile: "",
          travelDateFrom: "",
          travelDateTo: "",
          travelers: "1",
          tourType: "Private" as any,
        });
        setRequestedBookingModalOpen(false);
        setSelectedRequestedForBooking(null);

        toast.success("Booking Created Successfully!", {
          description: `Booking for ${bookingFormData.customerName} has been created from the requested itinerary.`,
        });

        navigate("/bookings");
      },
      onError: (error: any) => {
        console.error("Booking creation error:", error);
        toast.error("Failed to Create Booking", {
          description:
            error.response?.data?.message ||
            error.message ||
            "Please try again.",
        });
      },
    });
  };

  const renderStandardGridView = () => {
    if (isLoadingPackages) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#0A7AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#64748B]">Loading itineraries...</p>
          </div>
        </div>
      );
    }

    if (packagesError) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-[#FF6B6B] mx-auto mb-4" />
          <p className="text-[#64748B] text-lg mb-2">
            Failed to load itineraries
          </p>
          <button
            onClick={() => refetchTourPackages()}
            className="px-4 py-2 bg-[#0A7AFF] text-white rounded-lg hover:bg-[#0A6AE8] transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filteredTemplates.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
          <p className="text-[#64748B] text-lg mb-2">No itineraries found</p>
          <p className="text-[#94A3B8] text-sm">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "Create your first itinerary to get started"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            ref={(el) => {
              standardRefs.current[template.id] = el;
            }}
            onClick={() => {
              setSelectedStandardId(template.id);
              setViewMode("detail");
            }}
            className="group rounded-2xl border-2 border-[#E5E7EB] overflow-hidden bg-white transition-all duration-200 hover:border-[#0A7AFF] hover:shadow-[0_8px_20px_rgba(10,122,255,0.15)] hover:-translate-y-1 cursor-pointer"
          >
            <div className="h-45 relative overflow-hidden">
              <ImageWithFallback
                src={template.image}
                alt={template.destination}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
              {template.apiSource && (
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(16,185,129,0.9)] text-white border border-white/20 shadow-lg">
                    Live Package
                  </span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="mb-2">
                <h3 className="text-lg text-[#1A2B4F] font-semibold mb-1 group-hover:text-[#0A7AFF] transition-colors">
                  {template.title}
                </h3>
                <p className="text-sm text-[#64748B] line-clamp-1">
                  {template.destination}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#F8FAFB] text-xs text-[#334155] font-medium">
                  {template.days} Days
                </span>
                <span className="px-3 py-1 rounded-full bg-[rgba(10,122,255,0.1)] text-xs text-[#0A7AFF] font-medium">
                  {template.category}
                </span>
                {template.pricePerPax && (
                  <span className="px-3 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-xs text-[#10B981] font-medium">
                    ₱{template.pricePerPax.toLocaleString()}/pax
                  </span>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStandardId(template.id);
                      setViewMode("detail");
                    }}
                    className="flex-1 h-9 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAFB] hover:border-[#0A7AFF] text-[#334155] flex items-center justify-center gap-2 text-sm font-medium transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStandardForBooking(template.id);
                      setStandardBookingModalOpen(true);
                    }}
                    className="flex-1 h-9 rounded-xl border border-[#14B8A6] bg-linear-to-r from-[#14B8A6] to-[#10B981] hover:from-[#12A594] hover:to-[#0EA574] text-white flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    Book This Trip
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {template.apiSource ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/itinerary/edit-standard/${template.id}`);
                        }}
                        className="flex-1 h-9 px-3 rounded-lg border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] flex items-center justify-center gap-2 text-sm text-[#334155] font-medium transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Edit in Admin
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete({
                            id: template.id,
                            type: "api",
                            title: template.title,
                            destination: template.destination,
                          });
                        }}
                        className="h-9 w-9 rounded-lg border border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.1)] flex items-center justify-center transition-all group/delete"
                      >
                        <Trash2 className="w-4 h-4 text-[#64748B] group-hover/delete:text-[#FF6B6B]" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const itineraryData = {
                            ...template,
                            itineraryDetails:
                              standardItineraryDetails[template.id] || [],
                            itineraryDays:
                              standardItineraryDetails[template.id] || [],
                          };
                          const serializedData =
                            serializeItineraryData(itineraryData);
                          navigate(`/itinerary/edit-standard/${template.id}`, {
                            state: { itineraryData: serializedData },
                          });
                        }}
                        className="flex-1 h-9 px-3 rounded-lg border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] flex items-center justify-center gap-2 text-sm text-[#334155] font-medium transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete({
                            id: template.id,
                            type: "local",
                            title: template.title,
                            destination: template.destination,
                          });
                        }}
                        className="h-9 w-9 rounded-lg border border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.1)] flex items-center justify-center transition-all group/delete"
                      >
                        <Trash2 className="w-4 h-4 text-[#64748B] group-hover/delete:text-[#FF6B6B]" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequestedListView = () => {
    if (isLoadingBookings) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#0A7AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#64748B]">Loading requested bookings...</p>
          </div>
        </div>
      );
    }

    if (isBookingsError) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-[#FF6B6B] mx-auto mb-4" />
          <p className="text-[#64748B] text-lg mb-2">
            Failed to load requested bookings
          </p>
          <button
            onClick={() => refetchBookings()}
            className="px-4 py-2 bg-[#0A7AFF] text-white rounded-lg hover:bg-[#0A6AE8] transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    const filteredBookings = getFilteredRequestedBookings();

    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
          <p className="text-[#64748B] text-lg mb-2">
            No requested itineraries found
          </p>
          <p className="text-[#94A3B8] text-sm">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "No customer booking requests yet"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const transformedBooking = transformBookingForListCard(
            booking.rawBooking
          );

          return (
            <div
              key={booking.id}
              className="relative"
              ref={(el) => {
                requestedRefs.current[booking.id] = el;
              }}
            >
              <BookingListCard
                booking={transformedBooking as Booking}
                onViewDetails={() => {
                  setSelectedRequestedId(booking.id);
                  setRequestedViewMode("detail");
                }}
                context="requested"
                showViewDetailsButton={true}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {selectedCategory === "Standard" &&
      viewMode === "detail" &&
      selectedStandard ? (
        <StandardItineraryDetailView
          itinerary={selectedStandard}
          itineraryDetails={standardItineraryDetails[selectedStandard.id] || []}
          onBack={() => setViewMode("grid")}
          onEdit={() => {
            if (selectedStandard.apiSource) {
              navigate(`/itinerary/edit-standard/${selectedStandard.id}`);
            } else {
              const itineraryData = {
                ...selectedStandard,
                itineraryDetails:
                  standardItineraryDetails[selectedStandard.id] || [],
                itineraryDays:
                  standardItineraryDetails[selectedStandard.id] || [],
              };
              const serializedData = serializeItineraryData(itineraryData);
              navigate(`/itinerary/edit-standard/${selectedStandard.id}`, {
                state: { itineraryData: serializedData },
              });
            }
          }}
          onDelete={() => {
            confirmDelete({
              id: selectedStandard.id,
              type: selectedStandard.apiSource ? "api" : "local",
              title: selectedStandard.title,
              destination: selectedStandard.destination,
            });
          }}
        />
      ) : selectedCategory === "Requested" &&
        requestedViewMode === "detail" &&
        selectedRequestedId ? (
        <>
          {isLoadingBookingDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#0A7AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#64748B]">Loading booking details...</p>
              </div>
            </div>
          ) : isBookingDetailError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-[#FF6B6B] mx-auto mb-4" />
              <p className="text-[#64748B] text-lg mb-2">
                Failed to load booking details
              </p>
              <button
                onClick={() => setRequestedViewMode("list")}
                className="px-4 py-2 bg-[#0A7AFF] text-white rounded-lg hover:bg-[#0A6AE8] transition-colors"
              >
                Back to List
              </button>
            </div>
          ) : bookingDetailData?.data ? (
            <BookingDetailView
              // Core booking data
              booking={{
                id: bookingDetailData.data.id,
                bookingCode: bookingDetailData.data.bookingCode,
                customer: bookingDetailData.data.customerName!,
                email: bookingDetailData.data.customerEmail!,
                mobile: bookingDetailData.data.customerMobile!,
                destination: bookingDetailData.data.destination,
                itinerary:
                  bookingDetailData.data.itinerary?.title || "Custom Itinerary",
                dates:
                  bookingDetailData.data.startDate &&
                  bookingDetailData.data.endDate
                    ? formatDateRange(
                        bookingDetailData.data.startDate,
                        bookingDetailData.data.endDate
                      )
                    : "Dates TBD",
                travelers: bookingDetailData.data.travelers,
                total: `₱${parseFloat(
                  bookingDetailData.data.totalPrice.toString()
                ).toLocaleString()}`,
                totalAmount: parseFloat(
                  bookingDetailData.data.totalPrice.toString()
                ),
                paid: 0, // Will be calculated from payment submissions
                paymentStatus:
                  bookingDetailData.data.paymentStatus || "PENDING",
                bookedDate:
                  bookingDetailData.data.bookedDateDisplay ||
                  formatDate(bookingDetailData.data.bookedDate),
                tripStatus: bookingDetailData.data.status,
                rejectionReason:
                  bookingDetailData.data.rejectionReason ||
                  bookingDetailData.data.itinerary?.rejectionReason ||
                  "",
                rejectionResolution:
                  bookingDetailData.data.rejectionResolution ||
                  bookingDetailData.data.itinerary?.rejectionResolution ||
                  "",
                resolutionStatus: bookingDetailData.data.isResolved
                  ? "resolved"
                  : "unresolved",
              }}
              itinerary={bookingDetailData.data.itinerary}
              onBack={() => setRequestedViewMode("list")}
              onSendToClient={() => {}}
              onCancelBooking={() => {}}
              onUpdateStatus={() => {}}
              headerVariant="default"
              breadcrumbPage="Requested Itineraries"
              isRequestedItinerary={true}
              useBackButtonHeader={true}
              backButtonSubtitle="Requested Itinerary Details"
              actionButtons={
                <div className="space-y-3">
                  {/* Send to Client Button */}
                  {bookingDetailData.data.status !== "CONFIRMED" && (
                    <button
                      onClick={() =>
                        handleSendToClient(bookingDetailData.data.id)
                      }
                      className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#10B981] to-[#14B8A6] hover:from-[#0EA574] hover:to-[#12A594] text-white flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-[#10B981]/20"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send to Client
                        </>
                      )}
                    </button>
                  )}

                  {/* Book This Trip Button */}
                  {bookingDetailData.data.status === "CONFIRMED" && (
                    <button
                      onClick={() => {
                        setSelectedRequestedForBooking(
                          bookingDetailData.data?.id!
                        );
                        setRequestedBookingModalOpen(true);
                      }}
                      className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#14B8A6] to-[#10B981] hover:from-[#12A594] hover:to-[#0EA574] text-white flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-[#14B8A6]/20"
                    >
                      <BookOpen className="w-5 h-5" />
                      Book This Trip
                    </button>
                  )}

                  {/* Edit Booking Button */}
                  {(bookingDetailData.data.status === "DRAFT" ||
                    bookingDetailData.data.status === "PENDING" ||
                    bookingDetailData.data.status === "CONFIRMED") && (
                    <button
                      onClick={() => {
                        const itineraryData = {
                          id: bookingDetailData.data?.id,
                          bookingCode: bookingDetailData.data?.bookingCode,
                          title:
                            bookingDetailData.data?.itinerary?.title ||
                            bookingDetailData.data?.destination,
                          destination: bookingDetailData.data?.destination,
                          itineraryDetails:
                            bookingDetailData.data?.itinerary?.days || [],
                          itineraryDays:
                            bookingDetailData.data?.itinerary?.days || [],
                          days: (bookingDetailData.data?.itinerary?.days || [])
                            .length,
                          category: "Custom",
                          pricePerPax: bookingDetailData.data?.totalPrice,
                          image: "",
                          customerName: bookingDetailData.data?.customerName,
                          customerEmail: bookingDetailData.data?.customerEmail,
                          customerMobile:
                            bookingDetailData.data?.customerMobile,
                          travelers: bookingDetailData.data?.travelers,
                          startDate: bookingDetailData.data?.startDate,
                          endDate: bookingDetailData.data?.endDate,
                          tourType: bookingDetailData.data?.tourType,
                          status: bookingDetailData.data?.status,
                          type: bookingDetailData.data?.type,
                        };

                        navigate(
                          `/itinerary/edit-requested/${bookingDetailData.data?.id}`,
                          {
                            state: {
                              itineraryData:
                                serializeItineraryData(itineraryData),
                            },
                          }
                        );
                      }}
                      className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,122,255,0.35)] transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Booking
                    </button>
                  )}

                  {/* Delete Booking Button */}
                  {bookingDetailData.data.status === "DRAFT" && (
                    <button
                      onClick={() => {
                        confirmDelete({
                          id: bookingDetailData.data?.id!,
                          type: "booking",
                          title:
                            bookingDetailData.data?.itinerary?.title ||
                            bookingDetailData.data?.destination,
                          destination: bookingDetailData.data?.destination,
                        });
                      }}
                      className="w-full h-11 px-4 rounded-xl bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] flex items-center justify-center gap-2 font-medium transition-all"
                      disabled={isDeletingBooking}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeletingBooking ? "Deleting..." : "Delete Booking"}
                    </button>
                  )}

                  {/* Status Info Messages */}
                  {bookingDetailData.data.status === "PENDING" && (
                    <div className="flex items-start gap-2 p-3 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.2)] rounded-lg">
                      <AlertCircle className="w-4 h-4 text-[#FFC107] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#8B6914]">
                        This booking is awaiting approval. You can edit or
                        delete it before confirmation.
                      </p>
                    </div>
                  )}

                  {bookingDetailData.data.status === "CONFIRMED" && (
                    <div className="flex items-start gap-2 p-3 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#065F46]">
                        This booking has been confirmed. You can now create a
                        trip booking from this itinerary.
                      </p>
                    </div>
                  )}

                  {(bookingDetailData.data.status === "COMPLETED" ||
                    bookingDetailData.data.status === "CANCELLED") &&
                    bookingDetailData.data.isResolved && (
                      <div className="flex items-start gap-2 p-3 bg-[rgba(100,116,139,0.1)] border border-[rgba(100,116,139,0.2)] rounded-lg">
                        <AlertCircle className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
                        <p className="text-xs text-[#475569]">
                          This booking is{" "}
                          {bookingDetailData.data.status.toLowerCase()} and
                          resolved. No further actions available.
                        </p>
                      </div>
                    )}

                  {/* Back to List Button */}
                  <button
                    onClick={() => setRequestedViewMode("list")}
                    className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] flex items-center justify-center gap-2 text-[#334155] font-medium transition-all"
                  >
                    Back to List
                  </button>
                </div>
              }
            />
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-[#FF6B6B] mx-auto mb-4" />
              <p className="text-[#64748B] text-lg mb-2">
                Booking details not found
              </p>
              <button
                onClick={() => setRequestedViewMode("list")}
                className="px-4 py-2 bg-[#0A7AFF] text-white rounded-lg hover:bg-[#0A6AE8] transition-colors"
              >
                Back to List
              </button>
            </div>
          )}
        </>
      ) : (
        <ContentCard
          title={
            selectedCategory === "Standard"
              ? `Standard Itineraries (${filteredTemplates.length})`
              : `Requested Itineraries (${
                  getFilteredRequestedBookings().length
                })`
          }
          action={
            <button
              onClick={() => setCreateModalOpen(true)}
              className="h-10 px-5 rounded-[20px] text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, #0A7AFF, #14B8A6)`,
              }}
            >
              <Plus className="w-4 h-4" />
              Create New Itinerary
            </button>
          }
        >
          <SearchFilterToolbar
            searchPlaceholder={
              selectedCategory === "Standard"
                ? "Search standard itineraries..."
                : "Search requested itineraries..."
            }
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            showFilter={false}
            filterOpen={false}
            onFilterOpenChange={() => {}}
            filterContent={null}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />

          <div className="flex items-center gap-1 mb-6 border-b-2 border-[#E5E7EB]">
            <button
              onClick={() => {
                setSelectedCategory("Standard");
                setViewMode("grid");
              }}
              className={`px-5 h-11 text-sm transition-colors ${
                selectedCategory === "Standard"
                  ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
                  : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Requested");
                setRequestedViewMode("list");
              }}
              className={`px-5 h-11 text-sm transition-colors ${
                selectedCategory === "Requested"
                  ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
                  : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
              }`}
            >
              Requested
            </button>
          </div>

          {selectedCategory === "Standard"
            ? renderStandardGridView()
            : renderRequestedListView()}
        </ContentCard>
      )}

      {/* Create Itinerary Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-150 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Create New Itinerary
            </DialogTitle>
            <DialogDescription className="pb-4">
              Choose the type of itinerary you want to create or continue from a
              saved draft.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="px-8 py-2 space-y-4 pb-6">
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  navigate("/itinerary/create-standard");
                }}
                className="w-full p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white hover:bg-[rgba(10,122,255,0.02)] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A2B4F] mb-1 group-hover:text-[#0A7AFF] transition-colors">
                      Standard Itinerary
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      Create a new pre-built template for popular destinations
                      from scratch.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border border-[rgba(10,122,255,0.2)]">
                        Reusable
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(20,184,166,0.1)] text-[#14B8A6] border border-[rgba(20,184,166,0.2)]">
                        Template
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  navigate("/itinerary/create-requested");
                }}
                className="w-full p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#14B8A6] bg-white hover:bg-[rgba(20,184,166,0.02)] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#14B8A6] to-[#10B981] flex items-center justify-center shadow-lg shadow-[#14B8A6]/20 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A2B4F] mb-1 group-hover:text-[#14B8A6] transition-colors">
                      Requested Itinerary
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      Create a custom itinerary booking based on specific
                      customer requests with detailed day-by-day plans.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]">
                        Custom
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border border-[rgba(255,107,107,0.2)]">
                        Booking
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {drafts && drafts.length > 0 && (
                <>
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E7EB]"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-xs text-[#64748B] bg-white font-medium">
                        OR CONTINUE FROM DRAFT
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="relative w-full p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#FFB84D] bg-white hover:bg-[rgba(255,184,77,0.02)] transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#FFB84D] to-[#FF9800] flex items-center justify-center shadow-md shrink-0">
                            {draft.type === "requested" ? (
                              <Package className="w-5 h-5 text-white" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setCreateModalOpen(false);
                              if (draft.type === "requested") {
                                if (onEditRequestedDraft) {
                                  onEditRequestedDraft(draft);
                                }
                              } else {
                                if (onEditStandardDraft) {
                                  onEditStandardDraft(draft);
                                }
                              }
                            }}
                            className="flex-1 min-w-0 text-left"
                          >
                            <h4 className="text-sm font-semibold text-[#1A2B4F] mb-1 truncate group-hover:text-[#FFB84D] transition-colors">
                              {draft.type === "requested"
                                ? draft.customerName
                                : draft.title}
                            </h4>
                            <p className="text-xs text-[#64748B] mb-2 truncate">
                              {draft.destination || "No destination set"}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-xs bg-[rgba(255,184,77,0.1)] text-[#FFB84D] border border-[rgba(255,184,77,0.2)]">
                                {draft.type === "requested"
                                  ? "Requested Draft"
                                  : "Standard Draft"}
                              </span>
                              {draft.savedAt && (
                                <span className="text-xs text-[#94A3B8]">
                                  {new Date(draft.savedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDraftToDelete(draft);
                              setDeleteDraftConfirmOpen(true);
                            }}
                            className="shrink-0 w-8 h-8 rounded-lg border border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.1)] flex items-center justify-center transition-all group/delete"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-4 h-4 text-[#64748B] group-hover/delete:text-[#FF6B6B]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Standard Itinerary Booking Modal with Customer Search */}
      <ConfirmationModal
        open={standardBookingModalOpen}
        onOpenChange={setStandardBookingModalOpen}
        title="Book Standard Itinerary"
        description="Please provide the client's details to create a booking for this standard itinerary."
        icon={<BookOpen className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#14B8A6] to-[#10B981]"
        iconShadow="shadow-[#14B8A6]/20"
        contentGradient="bg-gradient-to-br from-[rgba(20,184,166,0.05)] to-[rgba(16,185,129,0.05)]"
        contentBorder="border-[rgba(20,184,166,0.2)]"
        content={
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="customerName"
                className="text-[#1A2B4F] mb-2 block"
              >
                Customer Name <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                <Input
                  id="customerName"
                  value={bookingFormData.customerName}
                  onChange={(e) => handleUserNameInput(e.target.value)}
                  placeholder="Search existing customer or enter new"
                  className="h-11 pl-10 pr-10 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />

                {isSearchingUsers && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {bookingFormData.customerId && !isSearchingUsers && (
                  <button
                    type="button"
                    onClick={() => {
                      setBookingFormData((prev) => ({
                        ...prev,
                        customerName: "",
                        customerId: "",
                        email: "",
                        mobile: "",
                      }));
                      setUserSearchParams((prev) => ({
                        ...prev,
                        q: undefined,
                      }));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] transition-colors"
                    title="Clear selection"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {isUserSearching && userSuggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div className="sticky top-0 bg-white border-b border-[#F1F5F9] px-3 py-2">
                    <span className="text-xs font-medium text-[#64748B]">
                      Found {userSuggestions.length} user
                      {userSuggestions.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {userSuggestions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectUserSuggestion(user)}
                      className="w-full px-3 py-2 text-left hover:bg-[rgba(20,184,166,0.05)] border-b border-[#F1F5F9] last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#14B8A6] to-[#10B981] flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.firstName?.charAt(0)}
                            {user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A2B4F] truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-[#64748B] truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-[#1A2B4F] mb-2 block">
                Email Address <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={bookingFormData.email}
                  onChange={(e) =>
                    setBookingFormData({
                      ...bookingFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="customer@email.com"
                  className={`h-11 pl-10 ${
                    bookingFormData.customerId
                      ? "bg-[#F8FAFB] text-[#94A3B8]"
                      : ""
                  } border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10`}
                  disabled={!!bookingFormData.customerId}
                />
                {bookingFormData.customerId && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8]" />
                )}
              </div>
              {bookingFormData.customerId && (
                <p className="text-xs text-[#94A3B8] mt-1">
                  Linked to existing customer profile
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile" className="text-[#1A2B4F] mb-2 block">
                Mobile Number <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                <Input
                  id="mobile"
                  type="tel"
                  value={bookingFormData.mobile}
                  onChange={(e) =>
                    setBookingFormData({
                      ...bookingFormData,
                      mobile: e.target.value,
                    })
                  }
                  placeholder="+63 9XX XXX XXXX"
                  className={`h-11 pl-10 ${
                    bookingFormData.customerId
                      ? "bg-[#F8FAFB] text-[#94A3B8]"
                      : ""
                  } border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10`}
                  disabled={!!bookingFormData.customerId}
                />
                {bookingFormData.customerId && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8]" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="travelDateFrom"
                  className="text-[#1A2B4F] mb-2 block"
                >
                  Travel Start Date <span className="text-[#FF6B6B]">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  <Input
                    id="travelDateFrom"
                    type="date"
                    value={bookingFormData.travelDateFrom}
                    onChange={(e) =>
                      setBookingFormData({
                        ...bookingFormData,
                        travelDateFrom: e.target.value,
                      })
                    }
                    className="h-11 pl-10 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="travelDateTo"
                  className="text-[#1A2B4F] mb-2 block"
                >
                  Travel End Date <span className="text-[#FF6B6B]">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  <Input
                    id="travelDateTo"
                    type="date"
                    value={bookingFormData.travelDateTo}
                    onChange={(e) =>
                      setBookingFormData({
                        ...bookingFormData,
                        travelDateTo: e.target.value,
                      })
                    }
                    className="h-11 pl-10 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="tourType" className="text-[#1A2B4F] mb-2 block">
                Tour Type <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Select
                value={bookingFormData.tourType}
                onValueChange={(value: "Joiner" | "Private") =>
                  setBookingFormData({ ...bookingFormData, tourType: value })
                }
              >
                <SelectTrigger className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10">
                  <SelectValue placeholder="Choose Tour Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Joiner">Joiner</SelectItem>
                  <SelectItem value="Private">Private Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="travelers" className="text-[#1A2B4F] mb-2 block">
                Number of Travelers <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="travelers"
                type="number"
                min="1"
                value={bookingFormData.travelers}
                onChange={(e) =>
                  setBookingFormData({
                    ...bookingFormData,
                    travelers: e.target.value,
                  })
                }
                className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
              />
            </div>

            {selectedStandardForBooking &&
              templates.find((t) => t.id === selectedStandardForBooking)
                ?.pricePerPax && (
                <div className="pt-4 border-t border-[rgba(20,184,166,0.3)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B]">
                      Price per Pax:
                    </span>
                    <span className="text-sm font-medium text-[#1A2B4F]">
                      ₱
                      {templates
                        .find((t) => t.id === selectedStandardForBooking)!
                        .pricePerPax!.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B]">
                      Number of Travelers:
                    </span>
                    <span className="text-sm font-medium text-[#1A2B4F]">
                      {bookingFormData.travelers || 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(20,184,166,0.3)]">
                    <span className="font-semibold text-[#1A2B4F]">Total:</span>
                    <span className="font-semibold text-[#14B8A6]">
                      ₱
                      {(
                        templates.find(
                          (t) => t.id === selectedStandardForBooking
                        )!.pricePerPax! *
                        parseInt(bookingFormData.travelers || "1")
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
          </div>
        }
        onConfirm={handleShowBookingConfirmation}
        onCancel={() => {
          setStandardBookingModalOpen(false);
          setSelectedStandardForBooking(null);
          setBookingFormData({
            customerName: "",
            customerId: "",
            email: "",
            mobile: "",
            travelDateFrom: "",
            travelDateTo: "",
            travelers: "1",
            tourType: "Private" as any,
          });
        }}
        confirmText="Create Booking"
        cancelText="Cancel"
        confirmVariant="success"
      />

      {/* Requested Itinerary Booking Modal */}
      <ConfirmationModal
        open={requestedBookingModalOpen}
        onOpenChange={setRequestedBookingModalOpen}
        title="Create Booking from Requested Itinerary"
        description="Convert this requested itinerary into an actual booking by providing customer details."
        icon={<BookOpen className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(10,122,255,0.2)]"
        content={
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="customerName"
                className="text-[#1A2B4F] mb-2 block"
              >
                Customer Name <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                <Input
                  id="customerName"
                  value={bookingFormData.customerName}
                  onChange={(e) => handleUserNameInput(e.target.value)}
                  placeholder="Search existing customer or enter new"
                  className="h-11 pl-10 pr-10 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
                />

                {isSearchingUsers && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#0A7AFF] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {bookingFormData.customerId && !isSearchingUsers && (
                  <button
                    type="button"
                    onClick={() => {
                      setBookingFormData((prev) => ({
                        ...prev,
                        customerName: "",
                        customerId: "",
                        email: "",
                        mobile: "",
                      }));
                      setUserSearchParams((prev) => ({
                        ...prev,
                        q: undefined,
                      }));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] transition-colors"
                    title="Clear selection"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {isUserSearching && userSuggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div className="sticky top-0 bg-white border-b border-[#F1F5F9] px-3 py-2">
                    <span className="text-xs font-medium text-[#64748B]">
                      Found {userSuggestions.length} user
                      {userSuggestions.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {userSuggestions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectUserSuggestion(user)}
                      className="w-full px-3 py-2 text-left hover:bg-[rgba(10,122,255,0.05)] border-b border-[#F1F5F9] last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.firstName?.charAt(0)}
                            {user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A2B4F] truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-[#64748B] truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-[#1A2B4F] mb-2 block">
                Email Address <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={bookingFormData.email}
                  onChange={(e) =>
                    setBookingFormData({
                      ...bookingFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="customer@email.com"
                  className={`h-11 pl-10 ${
                    bookingFormData.customerId
                      ? "bg-[#F8FAFB] text-[#94A3B8]"
                      : ""
                  } border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10`}
                  disabled={!!bookingFormData.customerId}
                />
                {bookingFormData.customerId && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8]" />
                )}
              </div>
              {bookingFormData.customerId && (
                <p className="text-xs text-[#94A3B8] mt-1">
                  Linked to existing customer profile
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile" className="text-[#1A2B4F] mb-2 block">
                Mobile Number <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                <Input
                  id="mobile"
                  type="tel"
                  value={bookingFormData.mobile}
                  onChange={(e) =>
                    setBookingFormData({
                      ...bookingFormData,
                      mobile: e.target.value,
                    })
                  }
                  placeholder="+63 9XX XXX XXXX"
                  className={`h-11 pl-10 ${
                    bookingFormData.customerId
                      ? "bg-[#F8FAFB] text-[#94A3B8]"
                      : ""
                  } border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10`}
                  disabled={!!bookingFormData.customerId}
                />
                {bookingFormData.customerId && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8]" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="travelDateFrom"
                  className="text-[#1A2B4F] mb-2 block"
                >
                  Travel Start Date <span className="text-[#FF6B6B]">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  <Input
                    id="travelDateFrom"
                    type="date"
                    value={bookingFormData.travelDateFrom}
                    onChange={(e) =>
                      setBookingFormData({
                        ...bookingFormData,
                        travelDateFrom: e.target.value,
                      })
                    }
                    className="h-11 pl-10 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="travelDateTo"
                  className="text-[#1A2B4F] mb-2 block"
                >
                  Travel End Date <span className="text-[#FF6B6B]">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  <Input
                    id="travelDateTo"
                    type="date"
                    value={bookingFormData.travelDateTo}
                    onChange={(e) =>
                      setBookingFormData({
                        ...bookingFormData,
                        travelDateTo: e.target.value,
                      })
                    }
                    className="h-11 pl-10 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tourType" className="text-[#1A2B4F] mb-2 block">
                  Tour Type <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Select
                  value={bookingFormData.tourType}
                  onValueChange={(value: "Joiner" | "Private") =>
                    setBookingFormData({ ...bookingFormData, tourType: value })
                  }
                >
                  <SelectTrigger className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10">
                    <SelectValue placeholder="Choose Tour Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Joiner">Joiner</SelectItem>
                    <SelectItem value="Private">Private Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="travelers"
                  className="text-[#1A2B4F] mb-2 block"
                >
                  Travelers <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  value={bookingFormData.travelers}
                  onChange={(e) =>
                    setBookingFormData({
                      ...bookingFormData,
                      travelers: e.target.value,
                    })
                  }
                  className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
                />
              </div>
            </div>

            {selectedRequestedForBooking && selectedRequested && (
              <div className="pt-4 border-t border-[rgba(10,122,255,0.3)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#64748B]">Total Amount:</span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    {selectedRequested.totalAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#64748B]">
                    Number of Travelers:
                  </span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    {bookingFormData.travelers || 1}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(10,122,255,0.3)]">
                  <span className="font-semibold text-[#1A2B4F]">
                    Final Total:
                  </span>
                  <span className="font-semibold text-[#0A7AFF]">
                    {selectedRequested.totalAmount}
                  </span>
                </div>
              </div>
            )}
          </div>
        }
        onConfirm={() => {
          if (
            !bookingFormData.customerName ||
            !bookingFormData.email ||
            !bookingFormData.mobile
          ) {
            toast.error("Please fill in all required fields");
            return;
          }
          handleCreateBookingFromRequested();
        }}
        onCancel={() => {
          setRequestedBookingModalOpen(false);
          setSelectedRequestedForBooking(null);
          setBookingFormData({
            customerName: "",
            customerId: "",
            email: "",
            mobile: "",
            travelDateFrom: "",
            travelDateTo: "",
            travelers: "1",
            tourType: "Private" as any,
          });
        }}
        confirmText="Create Booking"
        cancelText="Cancel"
        confirmVariant="default"
      />

      {/* Confirmation Modal for Creating Booking */}
      <ConfirmationModal
        open={createBookingConfirmOpen}
        onOpenChange={setCreateBookingConfirmOpen}
        title="Confirm Booking Creation"
        description="Are you sure you want to create this booking? This will add a new booking to the system."
        icon={<CheckCircle2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#14B8A6] to-[#10B981]"
        iconShadow="shadow-[#14B8A6]/20"
        contentGradient="bg-gradient-to-br from-[rgba(20,184,166,0.05)] to-[rgba(16,185,129,0.05)]"
        contentBorder="border-[rgba(20,184,166,0.2)]"
        content={
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Customer:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">
                {bookingFormData.customerName}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Email:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">
                {bookingFormData.email}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Mobile:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">
                {bookingFormData.mobile}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Travel Dates:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">
                {bookingFormData.travelDateFrom} to{" "}
                {bookingFormData.travelDateTo}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Tour Type:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">
                {bookingFormData.tourType}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Travelers:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">
                {bookingFormData.travelers}
              </span>
            </div>
            {selectedStandardForBooking &&
              templates.find((t) => t.id === selectedStandardForBooking)
                ?.pricePerPax && (
                <div className="flex items-center justify-between py-2 pt-3 border-t border-[rgba(20,184,166,0.3)]">
                  <span className="font-semibold text-[#1A2B4F]">
                    Total Amount:
                  </span>
                  <span className="font-semibold text-[#14B8A6]">
                    ₱
                    {(
                      templates.find(
                        (t) => t.id === selectedStandardForBooking
                      )!.pricePerPax! *
                      parseInt(bookingFormData.travelers || "1")
                    ).toLocaleString()}
                  </span>
                </div>
              )}
          </div>
        }
        onConfirm={handleBookStandardItinerary}
        onCancel={() => setCreateBookingConfirmOpen(false)}
        confirmText="Yes, Create Booking"
        cancelText="No, Go Back"
        confirmVariant="success"
      />

      {/* Delete Confirmation Modal (Unified for both API and local) */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={
          itemToDelete?.type === "api"
            ? "Delete Tour Package"
            : itemToDelete?.type === "booking"
            ? "Delete Booking"
            : "Delete Itinerary"
        }
        description={
          itemToDelete?.type === "api"
            ? "Are you sure you want to delete this tour package? This will remove it from the system."
            : itemToDelete?.type === "booking"
            ? "Are you sure you want to delete this booking? This action cannot be undone and will permanently remove the booking from the system."
            : "Are you sure you want to delete this itinerary? This action cannot be undone."
        }
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
        iconShadow="shadow-[#FF6B6B]/30"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          itemToDelete ? (
            <div className="space-y-3">
              {itemToDelete.title && (
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-[#64748B]">Title:</span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    {itemToDelete.title}
                  </span>
                </div>
              )}
              {itemToDelete.destination && (
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-[#64748B]">Destination:</span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    {itemToDelete.destination}
                  </span>
                </div>
              )}
              <p className="text-xs text-[#64748B] pt-2">
                {itemToDelete.type === "api"
                  ? "This will remove the package from your tour packages list."
                  : itemToDelete.type === "booking"
                  ? "This will permanently remove the booking and all associated data."
                  : "This will permanently remove the itinerary from your list."}
              </p>
            </div>
          ) : null
        }
        onConfirm={handleDeleteItinerary}
        onCancel={() => {
          setItemToDelete(null);
          setDeleteConfirmOpen(false);
        }}
        confirmText={isPending || isDeletingBooking ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* Status Update Modal */}
      <ConfirmationModal
        open={statusUpdateModalOpen}
        onOpenChange={setStatusUpdateModalOpen}
        title="Update Booking Status"
        description="Change the status of this booking"
        icon={<CheckCircle2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(10,122,255,0.2)]"
        content={
          <div className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-[#1A2B4F] mb-2 block">
                Status <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Select
                value={statusUpdateData.status}
                onValueChange={(value) =>
                  setStatusUpdateData({ ...statusUpdateData, status: value })
                }
              >
                <SelectTrigger className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {statusUpdateData.status === "CANCELLED" && (
              <>
                <div>
                  <Label
                    htmlFor="rejectionReason"
                    className="text-[#1A2B4F] mb-2 block"
                  >
                    Reason for Cancellation
                  </Label>
                  <Input
                    id="rejectionReason"
                    value={statusUpdateData.rejectionReason || ""}
                    onChange={(e) =>
                      setStatusUpdateData({
                        ...statusUpdateData,
                        rejectionReason: e.target.value,
                      })
                    }
                    placeholder="Enter reason for cancellation"
                    className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="rejectionResolution"
                    className="text-[#1A2B4F] mb-2 block"
                  >
                    Resolution/Next Steps
                  </Label>
                  <Input
                    id="rejectionResolution"
                    value={statusUpdateData.rejectionResolution || ""}
                    onChange={(e) =>
                      setStatusUpdateData({
                        ...statusUpdateData,
                        rejectionResolution: e.target.value,
                      })
                    }
                    placeholder="Enter resolution or next steps"
                    className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
                  />
                </div>
              </>
            )}
          </div>
        }
        onConfirm={() => {
          if (selectedRequestedId) {
            handleUpdateBookingStatus(
              selectedRequestedId,
              statusUpdateData.status,
              statusUpdateData.rejectionReason,
              statusUpdateData.rejectionResolution
            );
          }
        }}
        onCancel={() => {
          setStatusUpdateModalOpen(false);
          setStatusUpdateData({
            status: "",
            rejectionReason: "",
            rejectionResolution: "",
          });
        }}
        confirmText={isUpdatingStatus ? "Updating..." : "Update Status"}
        cancelText="Cancel"
        confirmVariant="default"
      />

      {/* Delete Draft Confirmation Modal */}
      {draftToDelete && (
        <ConfirmationModal
          open={deleteDraftConfirmOpen}
          onOpenChange={(open) => !open && setDraftToDelete(null)}
          title="Delete Draft"
          description="Are you sure you want to delete this draft? This action cannot be undone."
          icon={<Trash2 className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
          iconShadow="shadow-[#FF6B6B]/30"
          contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
          contentBorder="border-[rgba(255,107,107,0.2)]"
          content={
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-[#64748B]">Type:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">
                  {draftToDelete.type === "requested"
                    ? "Requested"
                    : "Standard"}{" "}
                  Draft
                </span>
              </div>
              {draftToDelete.customerName && (
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-[#64748B]">Customer:</span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    {draftToDelete.customerName}
                  </span>
                </div>
              )}
              {draftToDelete.title && (
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-[#64748B]">Title:</span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    {draftToDelete.title}
                  </span>
                </div>
              )}
              {draftToDelete.destination && (
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-[#64748B]">Destination:</span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    {draftToDelete.destination}
                  </span>
                </div>
              )}
              <p className="text-xs text-[#64748B] pt-2">
                This will permanently remove the draft from your list.
              </p>
            </div>
          }
          onConfirm={() => {
            if (onDeleteDraft && draftToDelete) {
              onDeleteDraft(draftToDelete.id);
              toast.success("Draft deleted successfully!");
            }
            setDraftToDelete(null);
            setDeleteDraftConfirmOpen(false);
          }}
          onCancel={() => {
            setDraftToDelete(null);
            setDeleteDraftConfirmOpen(false);
          }}
          confirmText="Delete Draft"
          cancelText="Cancel"
          confirmVariant="destructive"
        />
      )}
    </div>
  );
}
