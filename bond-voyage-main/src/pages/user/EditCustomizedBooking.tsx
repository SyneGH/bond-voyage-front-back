import { useState, useEffect, useRef, useMemo } from "react";
import { useBookingDetail, useUpdateBooking } from "../../hooks/useBookings";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  History,
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
  AlertCircle,
  Sparkles,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  FileText,
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
  RotateCcw,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { RouteOptimizationPanel } from "../../components/RouteOptimizationPanel";
import { VersionHistoryModal } from "../../components/VersionHistoryModal";
import { AITravelAssistant } from "../../components/AITravelAssistant";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { toast } from "sonner";
import { useBreadcrumbs } from "../../components/BreadcrumbContext";
import { useProfile } from "../../hooks/useAuth";
import { Day, IActivity, User as IUser, Place } from "../../types/types";
import { queryKeys } from "../../utils/lib/queryKeys";
import { useDebounce } from "../../hooks/useDebounce";
import { usePlacesSearch } from "../../hooks/useLocations";
import { ICON_OPTIONS } from "../../utils/constants/constants";

interface BookingFormData {
  destination: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  totalPrice: string;
}

interface Version {
  id: string;
  timestamp: number;
  author: string;
  bookingData: BookingFormData;
  itineraryDays: Day[];
  label?: string;
}

const getIconComponent = (iconName: string) => {
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return iconOption ? iconOption.icon : Clock;
};

// Time conversion helpers
const convertTo24Hour = (time12h: string): string => {
  if (!time12h) return "";

  // If already in 24-hour format (HH:MM), return as is
  if (
    /^\d{1,2}:\d{2}$/.test(time12h) &&
    !time12h.includes("AM") &&
    !time12h.includes("PM")
  ) {
    return time12h;
  }

  // Parse 12-hour format
  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12h; // Return original if can't parse

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const convertTo12Hour = (time24h: string): string => {
  if (!time24h) return "";

  // If already in 12-hour format, return as is
  if (time24h.includes("AM") || time24h.includes("PM")) {
    return time24h;
  }

  const [hoursStr, minutes] = time24h.split(":");
  let hours = parseInt(hoursStr);

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
};

export function EditCustomizedBooking() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbs();

  // Use the booking detail hook
  const { data: bookingDetailResponse, isLoading: isBookingLoading } =
    useBookingDetail(id!, {
      enabled: !!id,
      queryKey: [queryKeys.bookings.detail, id],
    });

  // Use the update booking mutation
  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking(
    id!
  );

  const { data: profileResponse, isLoading: profileDataIsLoading } =
    useProfile();

  const profileData: IUser = useMemo(() => {
    return profileResponse?.data?.user
      ? profileResponse.data.user
      : {
          companyName: "",
          id: "",
          email: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          role: "USER",
          avatarUrl: "",
          middleName: "",
          mobile: "",
          isActive: true,
          createdAt: "",
          updatedAt: "",
          lastLogin: "",
          birthday: "",
          employeeId: "",
          customerRating: 0,
        };
  }, [profileResponse?.data?.user]);

  // Get current user name from profile
  const currentUser = useMemo(() => {
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return profileData?.email || "User";
  }, [profileData]);

  const [bookingData, setBookingData] = useState<BookingFormData>({
    destination: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    totalPrice: "",
  });

  const [itineraryDays, setItineraryDays] = useState<Day[]>([]);
  const [initialBookingData, setInitialBookingData] =
    useState<BookingFormData | null>(null);
  const [initialItineraryDays, setInitialItineraryDays] = useState<
    Day[] | null
  >(null);
  const [bookingStatus, setBookingStatus] = useState<string>("");

  // Version History states
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(
    null
  );
  const initialVersionCreated = useRef(false);

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);
  const [deleteActivityConfirm, setDeleteActivityConfirm] = useState<{
    dayId: string;
    activityId: string;
  } | null>(null);
  const [currentActivityForIcon, setCurrentActivityForIcon] = useState<{
    dayId: string;
    activityId: string;
  } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [reduceDaysConfirm, setReduceDaysConfirm] = useState<{
    newDayCount: number;
    daysToRemove: number;
  } | null>(null);
  const [pendingDateChange, setPendingDateChange] = useState<{
    field: "travelDateFrom" | "travelDateTo";
    value: string;
  } | null>(null);

  // Location autocomplete states
  const [activeLocationInput, setActiveLocationInput] = useState<{
    dayId: string;
    activityId: string;
  } | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const debouncedValue = useDebounce(locationSearchQuery);

  // Icon search state
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  // Route Optimization state
  const [selectedDayForRoute, setSelectedDayForRoute] = useState<string | null>(
    null
  );

  // Use Places Search API with debounce
  const { data: placesData, isLoading: isLoadingPlaces } = usePlacesSearch(
    debouncedValue.length >= 2
      ? {
          text: debouncedValue,
          limit: 10,
        }
      : undefined,
    {
      enabled: debouncedValue.length >= 2,
      queryKey: queryKeys.places.search(debouncedValue),
    }
  );

  const locationSuggestions = placesData?.data || [];

  // Generate unique ID
  const generateId = () =>
    `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle route optimization acceptance
  const handleAcceptOptimization = (
    dayId: string,
    optimizedActivities: IActivity[]
  ) => {
    setItineraryDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: optimizedActivities.map((activity, index) => ({
                ...activity,
                order: index,
              })),
            }
          : day
      )
    );
    toast.success("Route Optimized", {
      description: `Activities for Day ${
        itineraryDays.find((d) => d.id === dayId)?.dayNumber
      } have been reordered for optimal routing.`,
    });
    setHasUnsavedChanges(true);
  };

  // Handle location input change
  const handleLocationInputChange = (
    searchTerm: string,
    dayId: string,
    activityId: string
  ) => {
    updateActivity(dayId, activityId, "location", searchTerm);
    if (searchTerm.length >= 2) {
      setLocationSearchQuery(searchTerm);
      setActiveLocationInput({ dayId, activityId });
    } else {
      setLocationSearchQuery("");
      setActiveLocationInput(null);
    }
  };

  // Select location suggestion
  const selectLocationSuggestion = (
    place: Place,
    dayId: string,
    activityId: string
  ) => {
    updateActivity(dayId, activityId, "location", place.name);
    updateActivity(dayId, activityId, "locationData", place);
    setLocationSearchQuery("");
    setActiveLocationInput(null);
  };

  // Load versions from localStorage
  useEffect(() => {
    if (id) {
      const savedVersions = localStorage.getItem(`booking-versions-${id}`);
      if (savedVersions) {
        try {
          const parsed = JSON.parse(savedVersions);
          setVersions(parsed);
          if (parsed.length > 0) {
            initialVersionCreated.current = true;
          }
        } catch (error) {
          console.error("Failed to load versions:", error);
        }
      }
    }
  }, [id]);

  // Save version to localStorage
  const saveVersionToStorage = (newVersions: Version[]) => {
    if (id) {
      localStorage.setItem(
        `booking-versions-${id}`,
        JSON.stringify(newVersions)
      );
    }
  };

  // Create a new version snapshot
  const createVersionSnapshot = (label?: string) => {
    const newVersion: Version = {
      id: generateId(),
      timestamp: Date.now(),
      author: currentUser,
      bookingData: JSON.parse(JSON.stringify(bookingData)),
      itineraryDays: JSON.parse(JSON.stringify(itineraryDays)),
      label,
    };

    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    saveVersionToStorage(updatedVersions);

    return newVersion;
  };

  // Restore a version
  const handleRestoreVersion = (version: Version) => {
    setVersionToRestore(version);
    setRestoreConfirmOpen(true);
  };

  const confirmRestoreVersion = () => {
    if (versionToRestore) {
      setBookingData(JSON.parse(JSON.stringify(versionToRestore.bookingData)));
      setItineraryDays(
        JSON.parse(JSON.stringify(versionToRestore.itineraryDays))
      );
      setHasUnsavedChanges(true);

      toast.success("Version Restored", {
        description: `Restored to version from ${new Date(
          versionToRestore.timestamp
        ).toLocaleString()}`,
      });
    }
    setRestoreConfirmOpen(false);
    setVersionToRestore(null);
    setVersionHistoryOpen(false);
  };

  // Get version display data
  const getVersionPreview = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (!version) return null;
    return version;
  };

  // Calculate changes between versions
  const getChangesSummary = (
    version: Version,
    previousVersion: Version | null
  ) => {
    const changes: string[] = [];

    if (!previousVersion) {
      return ["Initial version"];
    }

    // Check booking data changes
    if (
      version.bookingData.destination !==
      previousVersion.bookingData.destination
    ) {
      changes.push("Destination changed");
    }
    if (
      version.bookingData.travelDateFrom !==
        previousVersion.bookingData.travelDateFrom ||
      version.bookingData.travelDateTo !==
        previousVersion.bookingData.travelDateTo
    ) {
      changes.push("Travel dates changed");
    }
    if (
      version.bookingData.travelers !== previousVersion.bookingData.travelers
    ) {
      changes.push("Number of travelers changed");
    }
    if (
      version.bookingData.totalPrice !== previousVersion.bookingData.totalPrice
    ) {
      changes.push("Budget changed");
    }

    // Check itinerary changes
    if (version.itineraryDays.length !== previousVersion.itineraryDays.length) {
      changes.push(
        `Days count changed (${previousVersion.itineraryDays.length} → ${version.itineraryDays.length})`
      );
    }

    // Check for activity changes
    let activitiesAdded = 0;
    let activitiesRemoved = 0;
    version.itineraryDays.forEach((day, idx) => {
      const prevDay = previousVersion.itineraryDays[idx];
      if (prevDay) {
        activitiesAdded += Math.max(
          0,
          day.activities.length - prevDay.activities.length
        );
        activitiesRemoved += Math.max(
          0,
          prevDay.activities.length - day.activities.length
        );
      }
    });

    if (activitiesAdded > 0) {
      changes.push(
        `${activitiesAdded} ${
          activitiesAdded === 1 ? "activity" : "activities"
        } added`
      );
    }
    if (activitiesRemoved > 0) {
      changes.push(
        `${activitiesRemoved} ${
          activitiesRemoved === 1 ? "activity" : "activities"
        } removed`
      );
    }

    return changes.length > 0 ? changes : ["Minor edits"];
  };

  // Load booking data from API
  useEffect(() => {
    if (!id || !bookingDetailResponse?.data) {
      return;
    }

    const booking = bookingDetailResponse.data;

    // Format dates for input fields
    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    const loadedBookingData: BookingFormData = {
      destination: booking.destination || "",
      travelDateFrom: formatDateForInput(booking.startDate),
      travelDateTo: formatDateForInput(booking.endDate),
      travelers: booking.travelers?.toString() || "1",
      totalPrice: booking.totalPrice?.toString() || "",
    };

    setBookingData(loadedBookingData);
    setInitialBookingData(loadedBookingData);
    setBookingStatus(booking.status || "");

    // Load itinerary from API response
    if (booking.itinerary?.days) {
      const convertedItinerary = booking.itinerary.days.map(
        (day: any, index: number) => ({
          id: day.id || generateId(),
          day: day.dayNumber || index + 1,
          title: "",
          activities:
            day.activities?.map((activity: any, activityIndex: number) => ({
              id: activity.id || generateId(),
              time: activity.time || "",
              icon: activity.icon || "Clock",
              title: activity.title || "",
              description: activity.description || "",
              location: activity.location || "",
              locationData: activity.locationData || undefined,
              order: activity.order ?? activityIndex,
            })) || [],
        })
      );

      setItineraryDays(convertedItinerary);
      setInitialItineraryDays(JSON.parse(JSON.stringify(convertedItinerary)));
    } else {
      // Generate empty itinerary if none exists
      const days: Day[] = [];
      if (booking.startDate && booking.endDate) {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const dayCount =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;

        for (let i = 1; i <= dayCount; i++) {
          days.push({
            id: generateId(),
            dayNumber: i,
            title: "",
            activities: [],
          });
        }
      } else {
        // Default to 1 day if no dates
        days.push({
          id: generateId(),
          dayNumber: 1,
          title: "",
          activities: [],
        });
      }
      setItineraryDays(days);
      setInitialItineraryDays(JSON.parse(JSON.stringify(days)));
    }
  }, [bookingDetailResponse?.data, id]);

  // Create initial version snapshot when data is first loaded
  useEffect(() => {
    if (
      initialBookingData &&
      initialItineraryDays &&
      !initialVersionCreated.current &&
      id
    ) {
      const initialVersion: Version = {
        id: generateId(),
        timestamp: Date.now(),
        author: currentUser,
        bookingData: JSON.parse(JSON.stringify(initialBookingData)),
        itineraryDays: JSON.parse(JSON.stringify(initialItineraryDays)),
        label: "Initial Version",
      };

      const newVersions = [initialVersion];
      setVersions(newVersions);
      saveVersionToStorage(newVersions);
      initialVersionCreated.current = true;
    }
  }, [initialBookingData, initialItineraryDays, id, currentUser]);

  // Update breadcrumbs
  useEffect(() => {
    if (id && bookingStatus) {
      const tabLabel =
        bookingStatus === "DRAFT" || bookingStatus === "in-progress"
          ? "In Progress"
          : bookingStatus === "PENDING" || bookingStatus === "pending"
          ? "Pending"
          : bookingStatus === "REJECTED" || bookingStatus === "rejected"
          ? "Rejected"
          : "In Progress";

      setBreadcrumbs([
        { label: "Home", path: "/user/home" },
        { label: "Travels", path: "/user/travels" },
        { label: tabLabel },
        { label: `Booking #${id}` },
        { label: "Edit Booking" },
      ]);
    }

    return () => {
      resetBreadcrumbs();
    };
  }, [id, bookingStatus, setBreadcrumbs, resetBreadcrumbs]);

  // Track changes
  useEffect(() => {
    if (!initialBookingData || !initialItineraryDays) {
      setHasUnsavedChanges(false);
      return;
    }

    const bookingChanged =
      bookingData.destination !== initialBookingData.destination ||
      bookingData.travelDateFrom !== initialBookingData.travelDateFrom ||
      bookingData.travelDateTo !== initialBookingData.travelDateTo ||
      bookingData.travelers !== initialBookingData.travelers ||
      bookingData.totalPrice !== initialBookingData.totalPrice;

    const itineraryChanged =
      JSON.stringify(itineraryDays) !== JSON.stringify(initialItineraryDays);

    setHasUnsavedChanges(bookingChanged || itineraryChanged);
  }, [bookingData, itineraryDays, initialBookingData, initialItineraryDays]);

  // Recalculate days when dates change
  useEffect(() => {
    if (
      bookingData.travelDateFrom &&
      bookingData.travelDateTo &&
      !pendingDateChange
    ) {
      const start = new Date(bookingData.travelDateFrom);
      const end = new Date(bookingData.travelDateTo);
      const dayCount =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      if (dayCount > 0 && dayCount !== itineraryDays.length) {
        if (dayCount > itineraryDays.length) {
          // Add more days
          const newDays: Day[] = [];
          for (let i = itineraryDays.length + 1; i <= dayCount; i++) {
            newDays.push({
              id: generateId(),
              dayNumber: i,
              title: "",
              activities: [],
            });
          }
          setItineraryDays((prev) => [...prev, ...newDays]);
        } else {
          // Days need to be reduced - check if empty days can be auto-removed
          const daysToRemove = itineraryDays.slice(dayCount);
          const hasContent = daysToRemove.some(
            (day) => day.title || day.activities.length > 0
          );

          if (!hasContent) {
            // Auto-remove empty days
            setItineraryDays((prev) => prev.slice(0, dayCount));
          }
        }
      }
    }
  }, [
    bookingData.travelDateFrom,
    bookingData.travelDateTo,
    pendingDateChange,
    itineraryDays,
  ]);

  // Handle booking data changes
  const handleBookingChange = (field: keyof BookingFormData, value: string) => {
    // Special handling for date changes
    if (field === "travelDateFrom" || field === "travelDateTo") {
      const tempData = { ...bookingData, [field]: value };

      // Check if both dates are set
      if (tempData.travelDateFrom && tempData.travelDateTo) {
        const start = new Date(tempData.travelDateFrom);
        const end = new Date(tempData.travelDateTo);
        const newDayCount =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;
        const currentDayCount = itineraryDays.length;

        // Check if days will be reduced
        if (newDayCount > 0 && newDayCount < currentDayCount) {
          // Check if any of the days to be removed have content
          const daysToRemove = itineraryDays.slice(newDayCount);
          const hasContent = daysToRemove.some(
            (day) => day.title || day.activities.length > 0
          );

          if (hasContent) {
            // Store the pending change and show confirmation
            setPendingDateChange({ field, value });
            setReduceDaysConfirm({
              newDayCount,
              daysToRemove: currentDayCount - newDayCount,
            });
            return;
          }
        }
      }
    }

    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  // Confirm reduce days
  const handleConfirmReduceDays = () => {
    if (reduceDaysConfirm && pendingDateChange) {
      // Apply the pending date change
      setBookingData((prev) => ({
        ...prev,
        [pendingDateChange.field]: pendingDateChange.value,
      }));

      // Remove the extra days
      setItineraryDays((prev) => prev.slice(0, reduceDaysConfirm.newDayCount));

      toast.success("Travel Dates Updated", {
        description: `${reduceDaysConfirm.daysToRemove} ${
          reduceDaysConfirm.daysToRemove === 1 ? "day" : "days"
        } removed from itinerary.`,
      });
    }

    setReduceDaysConfirm(null);
    setPendingDateChange(null);
  };

  // Cancel reduce days
  const handleCancelReduceDays = () => {
    setReduceDaysConfirm(null);
    setPendingDateChange(null);
  };

  // Update day title
  const updateDayTitle = (dayId: string, title: string) => {
    setItineraryDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, title } : day))
    );
    setHasUnsavedChanges(true);
  };

  // Add activity to a day
  const addActivity = (dayId: string) => {
    const day = itineraryDays.find((d) => d.id === dayId);
    const newActivity: IActivity = {
      id: generateId(),
      time: "",
      icon: "",
      title: "",
      description: "",
      location: "",
      order: day ? day.activities.length : 0,
    };

    setItineraryDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, activities: [...day.activities, newActivity] }
          : day
      )
    );

    toast.success("Activity Added", {
      description: "A new activity slot has been created.",
    });
    setHasUnsavedChanges(true);
  };

  // Remove activity from a day
  const confirmDeleteActivity = (dayId: string, activityId: string) => {
    setDeleteActivityConfirm({ dayId, activityId });
  };

  const removeActivity = () => {
    if (!deleteActivityConfirm) return;

    const { dayId, activityId } = deleteActivityConfirm;
    setItineraryDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities
                .filter((a) => a.id !== activityId)
                .map((a, idx) => ({ ...a, order: idx })),
            }
          : day
      )
    );

    setDeleteActivityConfirm(null);
    toast.success("Activity Removed", {
      description: "The activity has been deleted.",
    });
    setHasUnsavedChanges(true);
  };

  // Update activity
  const updateActivity = (
    dayId: string,
    activityId: string,
    field: keyof IActivity,
    value: string | Place
  ) => {
    // Validate time overlap if updating time field
    if (field === "time" && typeof value === "string" && value) {
      const day = itineraryDays.find((d) => d.id === dayId);
      if (day) {
        // Check if this time already exists in other activities of the same day
        const timeExists = day.activities.some(
          (activity) => activity.id !== activityId && activity.time === value
        );

        if (timeExists) {
          toast.error("Time Overlap Detected", {
            description: `The time ${value} is already used by another activity on Day ${day.dayNumber}. Please choose a different time.`,
          });
          return; // Don't update if time overlaps
        }

        // Check if time is sequential (later than previous activity)
        const activityIndex = day.activities.findIndex(
          (a) => a.id === activityId
        );
        if (activityIndex > 0) {
          const previousActivity = day.activities[activityIndex - 1];
          if (previousActivity.time && value <= previousActivity.time) {
            toast.error("Invalid Time Sequence", {
              description: `Activity time must be later than the previous activity (${previousActivity.time}) on Day ${day.dayNumber}.`,
            });
            return; // Don't update if not sequential
          }
        }
      }
    }

    setItineraryDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.map((activity) =>
                activity.id === activityId
                  ? { ...activity, [field]: value }
                  : activity
              ),
            }
          : day
      )
    );
    setHasUnsavedChanges(true);
  };

  // Move activity up
  const moveActivityUp = (dayId: string, activityIndex: number) => {
    if (activityIndex === 0) return;

    setItineraryDays((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          const newActivities = [...day.activities];
          [newActivities[activityIndex - 1], newActivities[activityIndex]] = [
            newActivities[activityIndex],
            newActivities[activityIndex - 1],
          ];
          return {
            ...day,
            activities: newActivities.map((a, idx) => ({ ...a, order: idx })),
          };
        }
        return day;
      })
    );
    setHasUnsavedChanges(true);
  };

  // Move activity down
  const moveActivityDown = (dayId: string, activityIndex: number) => {
    setItineraryDays((prev) =>
      prev.map((day) => {
        if (day.id === dayId && activityIndex < day.activities.length - 1) {
          const newActivities = [...day.activities];
          [newActivities[activityIndex], newActivities[activityIndex + 1]] = [
            newActivities[activityIndex + 1],
            newActivities[activityIndex],
          ];
          return {
            ...day,
            activities: newActivities.map((a, idx) => ({ ...a, order: idx })),
          };
        }
        return day;
      })
    );
    setHasUnsavedChanges(true);
  };

  // Open icon picker
  const openIconPicker = (dayId: string, activityId: string) => {
    setCurrentActivityForIcon({ dayId, activityId });
    setIconPickerOpen(true);
    setIconSearchQuery("");
  };

  // Select icon
  const selectIcon = (iconValue: string) => {
    if (currentActivityForIcon) {
      updateActivity(
        currentActivityForIcon.dayId,
        currentActivityForIcon.activityId,
        "icon",
        iconValue
      );
    }
    setIconPickerOpen(false);
    setCurrentActivityForIcon(null);
    setIconSearchQuery("");
  };

  // Handle save
  const handleSaveClick = () => {
    // Validation
    if (!bookingData.destination.trim()) {
      toast.error("Validation Error", {
        description: "Please enter the destination.",
      });
      return;
    }

    if (!bookingData.travelDateFrom || !bookingData.travelDateTo) {
      toast.error("Validation Error", {
        description: "Please select both travel dates.",
      });
      return;
    }

    // Check if all days have at least a title
    const hasEmptyDays = itineraryDays.some((day) => !day.title?.trim());
    if (hasEmptyDays) {
      toast.error("Validation Error", {
        description: "Please provide a title for all days.",
      });
      return;
    }

    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!id) return;

    // Create version snapshot before saving
    createVersionSnapshot();

    // Prepare data for API update
    const updateData = {
      destination: bookingData.destination,
      startDate: bookingData.travelDateFrom
        ? new Date(bookingData.travelDateFrom).toISOString()
        : null,
      endDate: bookingData.travelDateTo
        ? new Date(bookingData.travelDateTo).toISOString()
        : null,
      travelers: parseInt(bookingData.travelers),
      totalPrice: bookingData.totalPrice
        ? parseFloat(bookingData.totalPrice)
        : 0,
      itinerary: itineraryDays.map((day) => ({
        dayNumber: day.dayNumber,
        activities: day.activities
          .sort((a, b) => a.order - b.order)
          .map((activity) => ({
            time: activity.time,
            title: activity.title,
            description: activity.description,
            location: activity.location,
            locationData: activity.locationData || null,
            icon: activity.icon,
            order: activity.order,
          })),
      })),
    };

    // Call the update mutation
    updateBooking(updateData, {
      onSuccess: () => {
        toast.success("Booking Updated!", {
          description: "The customized booking has been successfully updated.",
        });

        setHasUnsavedChanges(false);
        setSaveConfirmOpen(false);

        // Navigate back to travels
        navigate("/user/travels");
      },
      onError: (error: any) => {
        console.error("Update error:", error);
        console.error("Error response:", error.response?.data);

        toast.error("Update Failed", {
          description:
            error.response?.data?.message ||
            "Failed to update booking. Please try again.",
        });
      },
    });
  };
  // Handle back
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setBackConfirmOpen(true);
    } else {
      navigate("/user/travels");
    }
  };

  const handleConfirmBack = () => {
    setBackConfirmOpen(false);
    navigate("/user/travels");
  };

  if (isBookingLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0A7AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ paddingBottom: 50 }}>
      {/* Header */}
      <ContentCard>
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            className="w-11 h-11 rounded-xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-[#64748B] group-hover:text-[#0A7AFF] transition-colors" />
          </button>
          <div className="flex-1">
            <h1 className="text-[#1A2B4F] mb-1">Edit Customized Booking</h1>
            <p className="text-sm text-[#64748B]">
              Update your travel details and day-by-day itinerary
            </p>
          </div>
          <button
            onClick={() => setVersionHistoryOpen(true)}
            className="h-11 px-6 rounded-xl border-2 border-[#8B5CF6] bg-white hover:bg-[rgba(139,92,246,0.05)] text-[#8B5CF6] flex items-center gap-2 font-medium transition-all"
          >
            <History className="w-4 h-4" />
            Version History
            {versions.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-[#8B5CF6] text-white text-xs rounded-full">
                {versions.length}
              </span>
            )}
          </button>
        </div>
      </ContentCard>

      {/* Booking Details */}
      <ContentCard
        title="Travel Information"
        icon={MapPin}
        gradient="bg-gradient-to-br from-[#14B8A6] to-[#10B981]"
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label
              htmlFor="destination"
              className="text-sm text-[#1A2B4F] mb-2 block font-medium"
            >
              Destination <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              <Input
                id="destination"
                placeholder="e.g., Coron, Palawan"
                value={bookingData.destination}
                onChange={(e) =>
                  handleBookingChange("destination", e.target.value)
                }
                className="h-11 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="totalPrice"
              className="text-sm text-[#1A2B4F] mb-2 block font-medium"
            >
              Total Price (₱)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] pointer-events-none">
                ₱
              </span>
              <Input
                id="totalPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 45000"
                value={bookingData.totalPrice}
                onChange={(e) =>
                  handleBookingChange("totalPrice", e.target.value)
                }
                className="h-11 pl-8 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="travelDateFrom"
              className="text-sm text-[#1A2B4F] mb-2 block font-medium"
            >
              Travel Start Date <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              <Input
                id="travelDateFrom"
                type="date"
                value={bookingData.travelDateFrom}
                onChange={(e) =>
                  handleBookingChange("travelDateFrom", e.target.value)
                }
                className="h-11 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="travelDateTo"
              className="text-sm text-[#1A2B4F] mb-2 block font-medium"
            >
              Travel End Date <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              <Input
                id="travelDateTo"
                type="date"
                value={bookingData.travelDateTo}
                onChange={(e) =>
                  handleBookingChange("travelDateTo", e.target.value)
                }
                className="h-11 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="travelers"
              className="text-sm text-[#1A2B4F] mb-2 block font-medium"
            >
              Number of Travelers <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              <Input
                id="travelers"
                type="number"
                min="1"
                placeholder="e.g., 3"
                value={bookingData.travelers}
                onChange={(e) =>
                  handleBookingChange("travelers", e.target.value)
                }
                className="h-11 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Route Optimization Panel */}
      {itineraryDays.some((day) => {
        const validLocations = day.activities.filter(
          (a) =>
            a.location &&
            a.locationData &&
            typeof a.locationData.lat === "number" &&
            typeof a.locationData.lng === "number"
        );
        return validLocations.length >= 2;
      }) && (
        <RouteOptimizationPanel
          itineraryDays={itineraryDays}
          selectedDayId={
            selectedDayForRoute ||
            itineraryDays.find((d) => {
              const validLocations = d.activities.filter(
                (a) =>
                  a.location &&
                  a.locationData &&
                  typeof a.locationData.lat === "number" &&
                  typeof a.locationData.lng === "number"
              );
              return validLocations.length >= 2;
            })?.id
          }
          onAcceptOptimization={handleAcceptOptimization}
        />
      )}

      {/* Day-by-Day Itinerary */}
      <ContentCard>
        <div className="mb-6">
          <h2 className="text-lg text-[#1A2B4F] font-semibold">
            Day-by-Day Itinerary ({itineraryDays.length} Days)
          </h2>
        </div>
        <div className="space-y-6">
          {itineraryDays.map((day, dayIndex) => (
            <div
              key={day.id}
              className="p-6 rounded-2xl border-2 border-[#E5E7EB] bg-linear-to-br from-[rgba(10,122,255,0.02)] to-[rgba(20,184,166,0.02)] hover:border-[#0A7AFF]/30 transition-all"
            >
              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                  <span className="text-white font-bold">D{day.dayNumber}</span>
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor={`day-${day.id}-title`}
                    className="text-[#1A2B4F] mb-2 block text-sm font-medium"
                  >
                    Day {day.dayNumber} Title{" "}
                    <span className="text-[#FF6B6B]">*</span>
                  </Label>
                  <Input
                    id={`day-${day.id}-title`}
                    placeholder="e.g., Arrival & Beach Sunset"
                    value={day.title}
                    onChange={(e) => updateDayTitle(day.id, e.target.value)}
                    className="h-11 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] bg-white transition-all"
                  />
                </div>
                <button
                  onClick={() => addActivity(day.id)}
                  className="h-11 px-5 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center gap-2 text-sm font-medium shadow-lg shadow-[#0A7AFF]/20 hover:shadow-xl hover:shadow-[#0A7AFF]/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Activity
                </button>
              </div>

              {/* Activities */}
              <div className="space-y-4">
                {day.activities.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-[#E5E7EB] rounded-xl bg-white">
                    <div className="w-14 h-14 rounded-xl bg-[#F8FAFB] flex items-center justify-center mx-auto mb-3">
                      <Package className="w-7 h-7 text-[#CBD5E1]" />
                    </div>
                    <p className="text-sm text-[#64748B] mb-1">
                      No activities yet for Day {day.dayNumber}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Click "Add Activity" to start building this day
                    </p>
                  </div>
                ) : (
                  day.activities.map((activity, activityIndex) => {
                    const IconComponent = getIconComponent(activity.icon);
                    return (
                      <div
                        key={activity.id}
                        className="relative p-4 rounded-xl border-2 border-[#E5E7EB] bg-white hover:border-[#0A7AFF] transition-all group"
                      >
                        {/* Activity number badge */}
                        <div className="absolute -left-3 -top-3 w-7 h-7 rounded-lg bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-md text-white text-xs font-bold">
                          {activityIndex + 1}
                        </div>

                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div className="flex flex-col gap-1 pt-2">
                            <button
                              onClick={() =>
                                moveActivityUp(day.id, activityIndex)
                              }
                              disabled={activityIndex === 0}
                              className="w-7 h-7 rounded-lg hover:bg-[rgba(10,122,255,0.1)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              title="Move Up"
                            >
                              <GripVertical className="w-4 h-4 text-[#CBD5E1] rotate-90" />
                            </button>
                            <button
                              onClick={() =>
                                moveActivityDown(day.id, activityIndex)
                              }
                              disabled={
                                activityIndex === day.activities.length - 1
                              }
                              className="w-7 h-7 rounded-lg hover:bg-[rgba(10,122,255,0.1)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              title="Move Down"
                            >
                              <GripVertical className="w-4 h-4 text-[#CBD5E1] -rotate-90" />
                            </button>
                          </div>

                          {/* Form Fields */}
                          <div className="flex-1 grid grid-cols-12 gap-4">
                            {/* Time */}
                            <div className="col-span-2">
                              <Label className="text-xs text-[#64748B] mb-1 block">
                                Time
                              </Label>
                              <Input
                                type="time"
                                value={convertTo24Hour(activity.time)}
                                onChange={(e) =>
                                  updateActivity(
                                    day.id,
                                    activity.id,
                                    "time",
                                    convertTo12Hour(e.target.value)
                                  )
                                }
                                className="h-9 rounded-lg border-[#E5E7EB] text-sm"
                              />
                            </div>

                            {/* Icon */}
                            <div className="col-span-2">
                              <Label className="text-xs text-[#64748B] mb-1 block">
                                Icon
                              </Label>
                              <button
                                type="button"
                                onClick={() =>
                                  openIconPicker(day.id, activity.id)
                                }
                                className="w-full h-9 rounded-lg border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white flex items-center justify-center transition-all"
                              >
                                <IconComponent className="w-4 h-4 text-[#0A7AFF]" />
                              </button>
                            </div>

                            {/* Title */}
                            <div className="col-span-8">
                              <Label className="text-xs text-[#64748B] mb-1 block">
                                Activity Title *
                              </Label>
                              <Input
                                placeholder="e.g., Arrival at the Hotel"
                                value={activity.title}
                                onChange={(e) =>
                                  updateActivity(
                                    day.id,
                                    activity.id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="h-9 rounded-lg border-[#E5E7EB] text-sm"
                              />
                            </div>

                            {/* Location */}
                            <div className="col-span-12 relative">
                              <Label className="text-xs text-[#64748B] mb-1 block">
                                Location
                              </Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none z-10" />
                                {isLoadingPlaces &&
                                  activeLocationInput?.dayId === day.id &&
                                  activeLocationInput?.activityId ===
                                    activity.id && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A7AFF] animate-spin z-10" />
                                  )}
                                <Input
                                  placeholder="Search location..."
                                  value={activity.location}
                                  onChange={(e) =>
                                    handleLocationInputChange(
                                      e.target.value,
                                      day.id,
                                      activity.id
                                    )
                                  }
                                  onFocus={() => {
                                    if (activity.location.length >= 2) {
                                      setLocationSearchQuery(activity.location);
                                      setActiveLocationInput({
                                        dayId: day.id,
                                        activityId: activity.id,
                                      });
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      setLocationSearchQuery("");
                                      setActiveLocationInput(null);
                                    }, 200);
                                  }}
                                  className="h-9 pl-9 pr-9 rounded-lg border-[#E5E7EB] text-sm"
                                />
                              </div>

                              {/* Location Suggestions Dropdown */}
                              {activeLocationInput?.dayId === day.id &&
                                activeLocationInput?.activityId ===
                                  activity.id &&
                                locationSuggestions.length > 0 && (
                                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border-2 border-[#E5E7EB] rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {locationSuggestions.map((place, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                          selectLocationSuggestion(
                                            place,
                                            day.id,
                                            activity.id
                                          )
                                        }
                                        className="w-full px-4 py-3 text-left hover:bg-[rgba(10,122,255,0.05)] hover:text-[#0A7AFF] transition-colors border-b border-[#F1F5F9] last:border-0 group"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-[rgba(10,122,255,0.1)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(10,122,255,0.15)] transition-colors">
                                            <MapPin className="w-4 h-4 text-[#0A7AFF]" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#334155] group-hover:text-[#0A7AFF] transition-colors truncate">
                                              {place.name}
                                            </p>
                                            <p className="text-xs text-[#64748B] mt-0.5 truncate">
                                              {place.address}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-xs px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                                                {place.source}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}

                              {activeLocationInput?.dayId === day.id &&
                                activeLocationInput?.activityId ===
                                  activity.id &&
                                !isLoadingPlaces &&
                                locationSearchQuery.length >= 2 &&
                                locationSuggestions.length === 0 && (
                                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border-2 border-[#E5E7EB] rounded-lg shadow-lg p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-[#F8FAFB] flex items-center justify-center shrink-0">
                                        <Search className="w-5 h-5 text-[#CBD5E1]" />
                                      </div>
                                      <div>
                                        <p className="text-sm text-[#64748B]">
                                          No locations found
                                        </p>
                                        <p className="text-xs text-[#94A3B8] mt-0.5">
                                          Try a different search term
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="col-span-12">
                              <Label className="text-xs text-[#64748B] mb-1 block">
                                Description
                              </Label>
                              <Textarea
                                placeholder="Add activity details..."
                                value={activity.description}
                                onChange={(e) =>
                                  updateActivity(
                                    day.id,
                                    activity.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="rounded-lg border-[#E5E7EB] text-sm resize-none"
                                rows={2}
                              />
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() =>
                              confirmDeleteActivity(day.id, activity.id)
                            }
                            className="w-9 h-9 rounded-lg border-2 border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] flex items-center justify-center transition-all group/delete mt-1 shrink-0"
                            title="Delete Activity"
                          >
                            <Trash2 className="w-4 h-4 text-[#64748B] group-hover/delete:text-[#FF6B6B] transition-colors" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </ContentCard>

      {/* AI Travel Assistant */}
      <AITravelAssistant
        itineraryDays={itineraryDays}
        destination={bookingData.destination}
      />

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-20 right-0 bg-white border-t-2 border-[#E5E7EB] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-350 mx-auto px-8 h-20 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#64748B]">
              {hasUnsavedChanges ? (
                <>
                  <AlertCircle className="w-4 h-4 inline mr-1 text-[#FF9800]" />
                  You have unsaved changes
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 inline mr-1 text-[#10B981]" />
                  All changes saved
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="h-11 px-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-[#F8FAFB] text-[#334155] font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isUpdating}
              className="h-11 px-8 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] hover:from-[#0865CC] hover:to-[#12A594] text-white flex items-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Icon Picker Modal */}
      <Dialog
        open={iconPickerOpen}
        onOpenChange={(open: any) => {
          setIconPickerOpen(open);
          if (!open) setIconSearchQuery("");
        }}
      >
        <DialogContent className="sm:max-w-175 max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              Select Activity Icon
            </DialogTitle>
            <DialogDescription>
              Choose an icon that best represents this activity
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="px-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              <Input
                placeholder="Search icons..."
                value={iconSearchQuery}
                onChange={(e) => setIconSearchQuery(e.target.value)}
                className="h-10 pl-10 rounded-lg border-[#E5E7EB]"
              />
            </div>
          </div>

          <ScrollArea className="h-100 pr-4 px-6">
            <div className="grid grid-cols-4 gap-3 py-4">
              {ICON_OPTIONS.filter((opt) =>
                opt.label.toLowerCase().includes(iconSearchQuery.toLowerCase())
              ).map((iconOption) => {
                const Icon = iconOption.icon;
                return (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => selectIcon(iconOption.value)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] transition-all group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-center text-[#64748B] group-hover:text-[#0A7AFF] font-medium transition-colors leading-tight">
                      {iconOption.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title="Save Changes"
        icon={<Save className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
        iconShadow="shadow-[#10B981]/20"
        contentGradient="bg-gradient-to-br from-[rgba(16,185,129,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(16,185,129,0.2)]"
        content={
          <div className="text-card-foreground">
            <p>
              Are you sure you want to save changes to this customized booking?
            </p>
          </div>
        }
        onConfirm={handleConfirmSave}
        onCancel={() => setSaveConfirmOpen(false)}
        confirmText="Save Changes"
        confirmVariant="success"
      />

      {/* Back Confirmation Modal */}
      <Dialog open={backConfirmOpen} onOpenChange={setBackConfirmOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#FFB84D] to-[#FF9800] flex items-center justify-center shadow-lg shadow-[#FFB84D]/20">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              Unsaved Changes
            </DialogTitle>
            <DialogDescription className="pb-4">
              You have unsaved changes. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm text-[#64748B]">
              Your booking has unsaved changes. You can continue editing or
              discard the changes.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBackConfirmOpen(false)}
                className="w-full h-12 px-6 rounded-xl border-2 border-transparent 
                           bg-linear-to-br from-[#FFB84D] to-[#FF9800] 
                           hover:opacity-90 text-white font-medium 
                           transition-all flex items-center justify-center 
                           shadow-md shadow-[#FFB84D]/20"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmBack}
                className="w-full h-12 px-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] text-[#334155] hover:text-[#FF6B6B] font-medium transition-all flex items-center justify-center"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Activity Confirmation Modal */}
      <ConfirmationModal
        open={deleteActivityConfirm !== null}
        onOpenChange={(open) => !open && setDeleteActivityConfirm(null)}
        title="Delete Activity"
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
        iconShadow="shadow-[#FF6B6B]/20"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-transparent"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          <div className="text-card-foreground">
            <p>
              Are you sure you want to delete this activity? This action cannot
              be undone.
            </p>
          </div>
        }
        onConfirm={removeActivity}
        onCancel={() => setDeleteActivityConfirm(null)}
        confirmText="Delete Activity"
        confirmVariant="destructive"
      />

      {/* Reduce Days Confirmation Modal */}
      <ConfirmationModal
        open={reduceDaysConfirm !== null}
        onOpenChange={(open) => !open && handleCancelReduceDays()}
        title="Remove Days from Itinerary?"
        icon={<AlertCircle className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF9800] to-[#FFB84D]"
        iconShadow="shadow-[#FF9800]/30"
        contentGradient="bg-gradient-to-br from-[rgba(255,152,0,0.05)] to-transparent"
        contentBorder="border-[#FFB84D]/20"
        content={
          reduceDaysConfirm && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Current Days:</span>
                <span className="text-sm text-[#1A2B4F] font-medium">
                  {itineraryDays.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">New Days:</span>
                <span className="text-sm text-[#1A2B4F] font-medium">
                  {reduceDaysConfirm.newDayCount}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#FFB84D]/20">
                <span className="text-sm text-[#64748B]">Days to Remove:</span>
                <span className="text-sm text-[#FF9800] font-bold">
                  {reduceDaysConfirm.daysToRemove}
                </span>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-[rgba(255,107,107,0.1)] border border-[#FF6B6B]/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#64748B]">
                    Day {reduceDaysConfirm.newDayCount + 1} through Day{" "}
                    {itineraryDays.length} will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          )
        }
        onConfirm={handleConfirmReduceDays}
        onCancel={handleCancelReduceDays}
        confirmText="Yes, Remove Days"
        cancelText="Keep All Days"
        confirmVariant="destructive"
      />

      {/* Version History Modal - Commented out as in original
      <VersionHistoryModal
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        versions={versions}
        selectedVersionId={selectedVersionId}
        setSelectedVersionId={setSelectedVersionId}
        currentUser={currentUser}
        currentBookingData={bookingData}
        currentItineraryDays={itineraryDays}
        onRestoreVersion={handleRestoreVersion}
        getChangesSummary={getChangesSummary}
        getIconComponent={getIconComponent}
        convertTo12Hour={convertTo12Hour}
      /> */}

      {/* Restore Version Confirmation Modal */}
      <ConfirmationModal
        open={restoreConfirmOpen}
        onOpenChange={setRestoreConfirmOpen}
        title="Restore Version"
        icon={<RotateCcw className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]"
        iconShadow="shadow-[#8B5CF6]/20"
        contentGradient="bg-gradient-to-br from-[rgba(139,92,246,0.05)] to-transparent"
        contentBorder="border-[rgba(139,92,246,0.2)]"
        content={
          versionToRestore && (
            <div className="space-y-3">
              <p className="text-sm text-card-foreground">
                Are you sure you want to restore this version? Your current
                changes will be replaced.
              </p>
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Version Date:
                  </span>
                  <span className="text-xs text-card-foreground font-medium">
                    {new Date(versionToRestore.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Author:</span>
                  <span className="text-xs text-card-foreground font-medium">
                    {versionToRestore.author}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Destination:
                  </span>
                  <span className="text-xs text-card-foreground font-medium">
                    {versionToRestore.bookingData.destination}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    This will replace your current work. Make sure to save if
                    you want to keep your current changes before restoring.
                  </p>
                </div>
              </div>
            </div>
          )
        }
        onConfirm={confirmRestoreVersion}
        onCancel={() => {
          setRestoreConfirmOpen(false);
          setVersionToRestore(null);
        }}
        confirmText="Restore Version"
        cancelText="Cancel"
        confirmVariant="default"
      />
    </div>
  );
}
