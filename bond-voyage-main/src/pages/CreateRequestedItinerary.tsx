import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
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
  FileText,
  Calendar,
  Users,
  DollarSign,
  Mail,
  Phone,
  User,
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
  Bot,
  Lock,
  Loader2,
} from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { RouteOptimizationPanel } from "../components/RouteOptimizationPanel";
import { AITravelAssistant } from "../components/AITravelAssistant";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "sonner";
import {
  ICON_OPTIONS,
  PHILIPPINE_LOCATIONS,
} from "../utils/constants/constants";
import { useUsers } from "../hooks/useUsers";
import { queryKeys } from "../utils/lib/queryKeys";
import { useCreateBooking } from "../hooks/useBookings";
import { useDebounce } from "../hooks/useDebounce";
import { usePlacesSearch } from "../hooks/useLocations";
import { Place } from "../types/types";

interface Activity {
  id: string;
  time: string;
  icon: string;
  title: string;
  description: string;
  location: string;
  locationData?: Place;
  order: number;
}

interface Day {
  id: string;
  day: number;
  title: string;
  activities: Activity[];
}

interface RequestedBookingFormData {
  customerName: string;
  customerId: string;
  email: string;
  mobile: string;
  destination: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  totalAmount: string;
}

interface CreateRequestedItineraryProps {
  onSaveDraft?: (draft: any) => void;
  initialData?: any;
}

const getIconComponent = (iconName: string) => {
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return iconOption ? iconOption.icon : Clock;
};

export function CreateRequestedItinerary({
  onSaveDraft,
  initialData,
}: CreateRequestedItineraryProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RequestedBookingFormData>({
    customerName: "",
    email: "",
    mobile: "",
    destination: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    totalAmount: "",
    customerId: "",
  });

  const [userSearchParams, setUserSearchParams] = useState<{
    q?: string;
    limit?: number;
  }>({
    q: "",
    limit: 5,
  });

  const { data: usersData, isLoading: isSearchingUsers } = useUsers(
    userSearchParams,
    {
      enabled: !!userSearchParams.q && userSearchParams.q?.length >= 2,
      staleTime: 30000,
      queryKey: [queryKeys.users.list],
    }
  );

  const createBookingMutation = useCreateBooking({
    onSuccess: (response) => {
      const bookingId = response.data?.id;

      toast.success("Requested Itinerary Created!", {
        description: `Requested itinerary for ${formData.customerName} has been successfully created.`,
      });

      setSaveConfirmOpen(false);
      setHasUnsavedChanges(false);

      setTimeout(() => {
        navigate("/itinerary", {
          state: {
            scrollToId: bookingId,
            tab: "requested",
          },
        });
      }, 800);
    },
    onError: (error: any) => {
      toast.error("Failed to create requested itinerary", {
        description: error.response?.data?.message || "Please try again later",
      });
    },
  });

  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
  const [isUserSearching, setIsUserSearching] = useState(false);

  const [itineraryDays, setItineraryDays] = useState<Day[]>([
    {
      id: "day-1",
      day: 1,
      title: "",
      activities: [],
    },
  ]);

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

  const handleAcceptOptimization = (
    dayId: string,
    optimizedActivities: Activity[]
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
        itineraryDays.find((d) => d.id === dayId)?.day
      } have been reordered for optimal routing.`,
    });
    setHasUnsavedChanges(true);
  };

  // Generate unique ID
  const generateId = () =>
    `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle user name search input
  const handleUserNameInput = (value: string) => {
    // Update form data
    setFormData((prev) => ({
      ...prev,
      customerName: value,
      // Clear customerId if user starts typing a new name
      ...(value !== prev.customerName &&
        value.length < 2 && {
          customerId: "",
          email: "",
          mobile: "",
        }),
    }));

    // Update search params (React Query will auto-refetch)
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
    setFormData((prev) => ({
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

  // Helper function to get icon name from icon component
  const getIconNameFromComponent = (iconComponent: any) => {
    if (!iconComponent) return "Clock";

    // If it's already a string, return it
    if (typeof iconComponent === "string") return iconComponent;

    // Try to match by component name
    if (iconComponent.name) {
      const iconMatch = ICON_OPTIONS.find(
        (opt) => opt.icon.name === iconComponent.name
      );
      if (iconMatch) return iconMatch.value;
    }

    // Try to match by comparing the actual component
    const iconMatch = ICON_OPTIONS.find((opt) => {
      try {
        return opt.icon === iconComponent;
      } catch {
        return false;
      }
    });

    if (iconMatch) return iconMatch.value;

    // Default fallback
    return "Clock";
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerName: initialData.customerName || "",
        customerId: initialData.customerId || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        destination: initialData.destination || "",
        travelDateFrom: initialData.travelDateFrom || "",
        travelDateTo: initialData.travelDateTo || "",
        travelers: initialData.travelers?.toString() || "1",
        totalAmount: initialData.totalAmount?.toString() || "",
      });

      if (initialData.itineraryDays && initialData.itineraryDays.length > 0) {
        setItineraryDays(initialData.itineraryDays);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (usersData?.data?.users) {
      setUserSuggestions(usersData.data.users);
      setIsUserSearching(true);
    } else {
      setUserSuggestions([]);
    }
  }, [usersData]);

  // Clear suggestions when search term is too short
  useEffect(() => {
    if (!userSearchParams.q || userSearchParams.q.length < 2) {
      setUserSuggestions([]);
      setIsUserSearching(false);
    }
  }, [userSearchParams.q]);

  // Track changes
  useEffect(() => {
    const hasData =
      formData.customerName ||
      formData.email ||
      formData.mobile ||
      formData.destination ||
      formData.totalAmount ||
      itineraryDays.some((day) => day.title || day.activities.length > 0);
    setHasUnsavedChanges(hasData);
  }, [formData, itineraryDays]);

  // Recalculate days when dates change (now handled with confirmation)
  useEffect(() => {
    if (
      formData.travelDateFrom &&
      formData.travelDateTo &&
      !pendingDateChange
    ) {
      const start = new Date(formData.travelDateFrom);
      const end = new Date(formData.travelDateTo);
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
              day: i,
              title: "",
              activities: [],
            });
          }
          setItineraryDays((prev) => [...prev, ...newDays]);
        }
        // Reduction is now handled through confirmation modal
      }
    }
  }, [formData.travelDateFrom, formData.travelDateTo, pendingDateChange]);

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

  // Handle booking data changes
  const handleFormChange = (
    field: keyof RequestedBookingFormData,
    value: string
  ) => {
    // Special handling for date changes
    if (field === "travelDateFrom" || field === "travelDateTo") {
      const tempData = { ...formData, [field]: value };

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

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Confirm reduce days
  const handleConfirmReduceDays = () => {
    if (reduceDaysConfirm && pendingDateChange) {
      // Apply the pending date change
      setFormData((prev) => ({
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
  };

  // Add activity to a day
  const addActivity = (dayId: string) => {
    const day = itineraryDays.find((d) => d.id === dayId);
    const newActivity: Activity = {
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

    toast.success("Activity Removed", {
      description: "The activity has been deleted from your itinerary.",
    });

    setDeleteActivityConfirm(null);
  };

  // Update activity
  const updateActivity = (
    dayId: string,
    activityId: string,
    field: keyof Activity,
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
            description: `The time ${value} is already used by another activity on Day ${day.day}. Please choose a different time.`,
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
              description: `Activity time must be later than the previous activity (${previousActivity.time}) on Day ${day.day}.`,
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
  };

  // Open icon picker
  const openIconPicker = (dayId: string, activityId: string) => {
    setCurrentActivityForIcon({ dayId, activityId });
    setIconPickerOpen(true);
    setIconSearchQuery("");
  };

  // Select icon
  const selectIcon = (iconName: string) => {
    if (currentActivityForIcon) {
      updateActivity(
        currentActivityForIcon.dayId,
        currentActivityForIcon.activityId,
        "icon",
        iconName
      );
    }
    setIconPickerOpen(false);
    setCurrentActivityForIcon(null);
    setIconSearchQuery("");
  };

  // Move activity up
  const moveActivityUp = (dayId: string, activityIndex: number) => {
    if (activityIndex === 0) return;
    setItineraryDays((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          const newActivities = [...day.activities];
          [newActivities[activityIndex], newActivities[activityIndex - 1]] = [
            newActivities[activityIndex - 1],
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
  };

  // Validate form
  const validateForm = () => {
    // Customer Name Validation
    if (!formData.customerName.trim()) {
      toast.error("Missing Required Field", {
        description: "Please enter or select a customer name.",
      });
      return false;
    }

    // Customer Type Validation
    if (formData.customerId) {
      // Existing customer validation
      if (!formData.email.trim() || !formData.mobile.trim()) {
        toast.error("Customer Information Incomplete", {
          description:
            "Selected customer is missing email or mobile information.",
        });
        return false;
      }
    } else {
      // New customer validation
      if (!formData.email.trim()) {
        toast.error("Missing Required Field", {
          description: "Please enter the customer's email address.",
        });
        return false;
      }

      if (!formData.mobile.trim()) {
        toast.error("Missing Required Field", {
          description: "Please enter the customer's mobile number.",
        });
        return false;
      }
    }

    // Email Validation
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Invalid Email", {
          description:
            "Please enter a valid email address (e.g., name@example.com).",
        });
        return false;
      }
    }

    // Mobile Validation
    if (formData.mobile.trim()) {
      const mobileRegex = /^[0-9+\-\s()]{10,20}$/;
      if (!mobileRegex.test(formData.mobile)) {
        toast.error("Invalid Mobile Number", {
          description:
            "Please enter a valid mobile number (e.g., +63 917 123 4567 or 09171234567).",
        });
        return false;
      }
    }

    // Destination Validation
    if (!formData.destination.trim()) {
      toast.error("Missing Required Field", {
        description: "Please enter a destination.",
      });
      return false;
    }

    // Date Validation
    if (!formData.travelDateFrom) {
      toast.error("Missing Required Field", {
        description: "Please enter a travel start date.",
      });
      return false;
    }

    if (!formData.travelDateTo) {
      toast.error("Missing Required Field", {
        description: "Please enter a travel end date.",
      });
      return false;
    }

    // Date Order Validation
    if (formData.travelDateFrom && formData.travelDateTo) {
      const startDate = new Date(formData.travelDateFrom);
      const endDate = new Date(formData.travelDateTo);

      if (endDate < startDate) {
        toast.error("Invalid Date Range", {
          description: "End date must be after start date.",
        });
        return false;
      }

      // Minimum trip duration validation (optional - at least 1 day)
      const dayCount =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
      if (dayCount < 1) {
        toast.error("Invalid Trip Duration", {
          description: "Travel duration must be at least 1 day.",
        });
        return false;
      }
    }

    // Travelers Validation
    if (!formData.travelers) {
      toast.error("Missing Required Field", {
        description: "Please enter number of travelers.",
      });
      return false;
    }

    const travelerCount = parseInt(formData.travelers);
    if (isNaN(travelerCount) || travelerCount < 1) {
      toast.error("Invalid Traveler Count", {
        description: "Number of travelers must be at least 1.",
      });
      return false;
    }

    if (travelerCount > 50) {
      toast.error("Too Many Travelers", {
        description:
          "Maximum number of travelers is 50. Please contact support for larger groups.",
      });
      return false;
    }

    // Total Amount Validation
    if (!formData.totalAmount) {
      toast.error("Missing Required Field", {
        description: "Please enter the total amount.",
      });
      return false;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast.error("Invalid Amount", {
        description: "Total amount must be greater than 0.",
      });
      return false;
    }

    if (totalAmount > 100000000) {
      toast.error("Amount Too High", {
        description:
          "Amount exceeds maximum limit. Please contact support for large bookings.",
      });
      return false;
    }

    // Itinerary Days Validation
    if (itineraryDays.length === 0) {
      toast.error("No Itinerary Days", {
        description: "Please set travel dates to generate itinerary days.",
      });
      return false;
    }

    // Check if all days have titles and at least one activity
    for (const day of itineraryDays) {
      if (!day.title.trim()) {
        toast.error(`Day ${day.day} Incomplete`, {
          description: `Please enter a title for Day ${day.day}.`,
        });
        return false;
      }

      if (day.activities.length === 0) {
        toast.error(`Day ${day.day} Empty`, {
          description: `Please add at least one activity for Day ${day.day}.`,
        });
        return false;
      }

      // Check if all activities have required fields
      for (const [index, activity] of day.activities.entries()) {
        if (!activity.title.trim()) {
          toast.error(`Activity Title Missing`, {
            description: `Please enter a title for Activity ${
              index + 1
            } on Day ${day.day}.`,
          });
          return false;
        }

        // Time validation for sequential activities
        if (index > 0) {
          const prevActivity = day.activities[index - 1];
          if (
            activity.time &&
            prevActivity.time &&
            activity.time <= prevActivity.time
          ) {
            toast.error(`Time Sequence Error`, {
              description: `Activity ${index + 1} time (${
                activity.time
              }) must be after Activity ${index} time (${
                prevActivity.time
              }) on Day ${day.day}.`,
            });
            return false;
          }
        }
      }
    }

    if (formData.travelDateFrom && formData.travelDateTo) {
      const startDate = new Date(formData.travelDateFrom);
      const endDate = new Date(formData.travelDateTo);
      const expectedDayCount =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      if (expectedDayCount !== itineraryDays.length) {
        toast.error("Itinerary Mismatch", {
          description: `Travel dates indicate ${expectedDayCount} days, but itinerary has ${itineraryDays.length} days. Please check your dates.`,
        });
        return false;
      }
    }

    return true;
  };
  const handleSaveClick = () => {
    if (!validateForm()) return;
    setSaveConfirmOpen(true);
  };

  const handleSave = () => {
    const itinerary = {
      travelers: parseInt(formData.travelers),
      totalDays: itineraryDays.length,
      destination: formData.destination,
      days: itineraryDays.map((day, index) => {
        const dayDate = new Date(formData.travelDateFrom);
        dayDate.setDate(dayDate.getDate() + index);

        return {
          dayNumber: day.day,
          date: dayDate.toISOString().split("T")[0],
          title: day.title || "",
          activities: day.activities
            .sort((a, b) => a.order - b.order)
            .map((activity) => ({
              time: activity.time || "00:00",
              title: activity.title,
              description: activity.description || "",
              location: activity.location || "",
              locationData: activity.locationData || null,
              order: activity.order,
            })),
        };
      }),
    };

    const bookingData = {
      destination: formData.destination,
      startDate: formData.travelDateFrom,
      endDate: formData.travelDateTo,

      totalPrice: parseFloat(formData.totalAmount),
      type: "REQUESTED",
      tourType: "PRIVATE",
      customerName: formData.customerName,
      customerEmail: formData.email,
      customerMobile: formData.mobile,
      ...(formData.customerId && { userId: formData.customerId }),
      itinerary: itinerary,
      status: "PENDING",
    };

    createBookingMutation.mutate(bookingData);
  };
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setBackConfirmOpen(true);
    } else {
      navigate("/itinerary");
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      id: initialData?.id || `DRAFT-REQ-${Date.now()}`,
      type: "requested" as const,
      customerName: formData.customerName || "Unnamed Customer",
      email: formData.email,
      mobile: formData.mobile,
      destination: formData.destination || "No destination set",
      travelDateFrom: formData.travelDateFrom,
      travelDateTo: formData.travelDateTo,
      travelers: formData.travelers ? parseInt(formData.travelers) : 1,
      totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : 0,
      itineraryDays: itineraryDays,
      isDraft: true,
      savedAt: new Date().toISOString(),
    };

    if (onSaveDraft) {
      onSaveDraft(draft);
    }

    toast.success("Draft Saved", {
      description: "Your requested booking has been saved as a draft.",
    });

    setBackConfirmOpen(false);
    setHasUnsavedChanges(false);
    navigate("/itinerary");
  };

  return (
    <div className="gap-6" style={{ paddingBottom: 50 }}>
      {/* Main Content */}
      <div className="space-y-6">
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
              <h1 className="text-[#1A2B4F] mb-1">
                Create Requested Itinerary
              </h1>
              <p className="text-sm text-[#64748B]">
                Build a customized itinerary with detailed day-by-day plans for
                your client
              </p>
            </div>
          </div>
        </ContentCard>

        {/* Customer & Booking Information */}
        <ContentCard>
          <div className="mb-6">
            <h2 className="text-lg text-[#1A2B4F] font-semibold">
              Customer & Booking Information
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <Label
                htmlFor="customerName"
                className="text-[#1A2B4F] mb-2 block"
              >
                Customer Name <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <Input
                  id="customerName"
                  placeholder="Search customer by name, email, or mobile..."
                  value={formData.customerName}
                  onChange={(e) => handleUserNameInput(e.target.value)}
                  onFocus={() => {
                    if (formData.customerName.length >= 2) {
                      setUserSearchParams((prev) => ({
                        ...prev,
                        q: formData.customerName,
                      }));
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click
                    setTimeout(() => {
                      setUserSuggestions([]);
                      setIsUserSearching(false);
                    }, 200);
                  }}
                  className="h-12 pl-12 pr-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
                />

                {/* Loading indicator */}
                {isSearchingUsers && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#0A7AFF] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Clear Selection Button (when user is selected) */}
                {formData.customerId && !isSearchingUsers && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] transition-colors"
                    title="Clear selection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* User Suggestions Dropdown */}
                {isUserSearching && userSuggestions.length > 0 && (
                  <div
                    className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border-2 border-[#E5E7EB] rounded-lg shadow-lg max-h-80 overflow-auto"
                    style={{ zIndex: 20 }}
                  >
                    <div className="sticky top-0 bg-white border-b border-[#F1F5F9] px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">
                          Found {userSuggestions.length} user
                          {userSuggestions.length !== 1 ? "s" : ""}
                        </span>
                        {isSearchingUsers && (
                          <span className="text-xs text-[#0A7AFF]">
                            Searching...
                          </span>
                        )}
                      </div>
                    </div>

                    {userSuggestions.map((user) => {
                      const fullName = `${user.firstName} ${user.lastName}`;
                      const hasBookings =
                        user.bookings && user.bookings.length > 0;
                      const isActive = user.isActive;

                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectUserSuggestion(user)}
                          onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                          className="w-full px-4 py-3 text-left hover:bg-[rgba(10,122,255,0.05)] hover:text-[#0A7AFF] transition-colors border-b border-[#F1F5F9] last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            {/* User Avatar */}
                            <div className="shrink-0">
                              {user.avatarUrl ? (
                                <ImageWithFallback
                                  src={user.avatarUrl}
                                  alt={fullName}
                                  className="w-10 h-10 rounded-lg object-cover"
                                  fallback={
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">
                                        {user.firstName?.charAt(0)}
                                        {user.lastName?.charAt(0)}
                                      </span>
                                    </div>
                                  }
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {user.firstName?.charAt(0)}
                                    {user.lastName?.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1A2B4F] truncate">
                                  {fullName}
                                </span>

                                {/* Status Badges */}
                                <div className="flex items-center gap-1">
                                  {!isActive && (
                                    <span className="px-1.5 py-0.5 bg-[#FF6B6B]/10 text-[#FF6B6B] text-xs rounded-full font-medium">
                                      Inactive
                                    </span>
                                  )}
                                  {hasBookings && (
                                    <span className="px-1.5 py-0.5 bg-[#10B981]/10 text-[#10B981] text-xs rounded-full font-medium">
                                      Previous
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Contact Info */}
                              <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span className="truncate">
                                    {user.mobile || "No mobile"}
                                  </span>
                                </div>

                                {/* Booking History (if any) */}
                                {hasBookings && user.dateFrom && (
                                  <div className="mt-1 pt-1 border-t border-[#F1F5F9]">
                                    <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                                      <Calendar className="w-3 h-3 shrink-0" />
                                      <span>
                                        Last booking:{" "}
                                        {new Date(
                                          user.dateFrom
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Role Indicator */}
                            <div className="shrink-0">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  user.role === "ADMIN"
                                    ? "bg-[#0A7AFF]/10 text-[#0A7AFF]"
                                    : user.role === "AGENT"
                                    ? "bg-[#14B8A6]/10 text-[#14B8A6]"
                                    : "bg-[#94A3B8]/10 text-[#94A3B8]"
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Create New Customer Option */}
                    {userSuggestions.length > 0 && !isSearchingUsers && (
                      <div className="border-t border-[#F1F5F9]">
                        <button
                          type="button"
                          onClick={() => {
                            // Keep current name but don't link to existing user
                            setUserSuggestions([]);
                            setIsUserSearching(false);
                            setUserSearchParams((prev) => ({
                              ...prev,
                              q: undefined,
                            }));
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[rgba(10,122,255,0.05)] text-[#64748B] hover:text-[#0A7AFF] transition-colors flex items-center gap-3"
                        >
                          <Plus className="w-4 h-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Create new customer
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                              Use "{formData.customerName}" as new customer
                            </p>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* No Results */}
                    {userSuggestions.length === 0 &&
                      !isSearchingUsers &&
                      userSearchParams.q && (
                        <div className="px-4 py-6 text-center">
                          <User className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">
                            No users found
                          </p>
                          <p className="text-xs text-[#94A3B8] mt-1">
                            Try a different name, email, or mobile number
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              // Keep current name as new customer
                              setUserSuggestions([]);
                              setIsUserSearching(false);
                              setUserSearchParams((prev) => ({
                                ...prev,
                                q: undefined,
                              }));
                            }}
                            className="mt-3 px-4 py-2 text-sm rounded-lg border border-[#0A7AFF] text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] transition-colors"
                          >
                            Create new customer
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Selected User Info Panel */}
              {formData.customerId && (
                <div className="mt-2 p-3 rounded-lg bg-linear-to-r from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)] border border-[#0A7AFF]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1A2B4F]">
                            Existing Customer Selected
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] rounded-full font-medium">
                            ID: {formData.customerId.substring(0, 8)}...
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Email and mobile have been auto-filled from customer
                          profile
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
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
                        className="px-3 py-1 text-xs rounded-lg border border-[#E5E7EB] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors"
                      >
                        Change Customer
                      </button>
                      <a
                        href={`/users/${formData.customerId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-xs rounded-lg bg-linear-to-r from-[#0A7AFF] to-[#3B9EFF] text-white hover:shadow-lg transition-shadow flex items-center gap-1"
                      >
                        <User className="w-3 h-3" />
                        View Profile
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-[#1A2B4F] mb-2 block">
                Email Address <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="maria.santos@email.com"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className={`h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all ${
                    formData.customerId
                      ? "bg-[#F8FAFB] text-[#94A3B8]"
                      : "bg-white"
                  }`}
                />
                {formData.customerId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                )}
              </div>
              {formData.customerId && (
                <p className="text-xs text-[#94A3B8] mt-1">
                  Email is locked because customer is selected
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile" className="text-[#1A2B4F] mb-2 block">
                Mobile Number <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+63 917 123 4567"
                  value={formData.mobile}
                  onChange={(e) => handleFormChange("mobile", e.target.value)}
                  className={`h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all ${
                    formData.customerId
                      ? "bg-[#F8FAFB] text-[#94A3B8]"
                      : "bg-white"
                  }`}
                />
                {formData.customerId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                )}
              </div>
              {formData.customerId && (
                <p className="text-xs text-[#94A3B8] mt-1">
                  Mobile is locked because customer is selected
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="destination"
                className="text-[#1A2B4F] mb-2 block"
              >
                Destination <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <Input
                  id="destination"
                  placeholder="e.g., Baguio City"
                  value={formData.destination}
                  onChange={(e) =>
                    handleFormChange("destination", e.target.value)
                  }
                  className="h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="travelDateFrom"
                className="text-[#1A2B4F] mb-2 block"
              >
                Travel Start Date <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <Input
                  id="travelDateFrom"
                  type="date"
                  value={formData.travelDateFrom}
                  onChange={(e) =>
                    handleFormChange("travelDateFrom", e.target.value)
                  }
                  className="h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
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
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <Input
                  id="travelDateTo"
                  type="date"
                  value={formData.travelDateTo}
                  onChange={(e) =>
                    handleFormChange("travelDateTo", e.target.value)
                  }
                  className="h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="travelers" className="text-[#1A2B4F] mb-2 block">
                Number of Travelers <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  placeholder="2"
                  value={formData.travelers}
                  onChange={(e) =>
                    handleFormChange("travelers", e.target.value)
                  }
                  className="h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="totalAmount"
                className="text-[#1A2B4F] mb-2 block"
              >
                Total Amount (₱) <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] font-medium">
                  ₱
                </span>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter Total Amount"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    handleFormChange("totalAmount", e.target.value)
                  }
                  className="h-12 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
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
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-linear-to-r from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)] border border-[#0A7AFF]/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[#1A2B4F] mb-1">
                    AI Route Optimization Available
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {
                      itineraryDays.filter((d) => {
                        const validLocations = d.activities.filter(
                          (a) =>
                            a.location &&
                            a.locationData &&
                            typeof a.locationData.lat === "number" &&
                            typeof a.locationData.lng === "number"
                        );
                        return validLocations.length >= 4;
                      }).length
                    }{" "}
                    day(s) with 4+ locations can be optimized for efficient
                    routing. The AI will analyze each day independently and
                    suggest the best route order.
                  </p>
                </div>
              </div>
            </div>

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
          </div>
        )}

        {/* Day-by-Day Itinerary */}
        <ContentCard>
          <div className="mb-6">
            <h2 className="text-lg text-[#1A2B4F] font-semibold">
              Day-by-Day Itinerary ({itineraryDays.length} Days)
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Days are automatically calculated from travel dates
            </p>
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
                    <span className="text-white font-bold">D{day.day}</span>
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={`day-${day.id}-title`}
                      className="text-[#1A2B4F] mb-2 block text-sm font-medium"
                    >
                      Day {day.day} Title{" "}
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
                        No activities yet for Day {day.day}
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
                                  value={activity.time}
                                  onChange={(e) =>
                                    updateActivity(
                                      day.id,
                                      activity.id,
                                      "time",
                                      e.target.value
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
                                        setLocationSearchQuery(
                                          activity.location
                                        );
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

        <div className="fixed bottom-0 left-20 right-0 h-20 bg-white border-t-2 border-[#E5E7EB] z-40">
          <div className="h-full max-w-350 mx-auto px-8 flex items-center justify-end gap-3">
            <button
              onClick={handleBackClick}
              disabled={createBookingMutation.isPending}
              className="h-12 px-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFB] text-[#334155] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={createBookingMutation.isPending}
              className="h-12 px-8 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white font-medium shadow-lg shadow-[#0A7AFF]/20 hover:shadow-xl hover:shadow-[#0A7AFF]/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {createBookingMutation.isPending ? "Saving..." : "Save Itinerary"}
            </button>
          </div>
        </div>
      </div>

      {/* Icon Picker Dialog */}
      <Dialog
        open={iconPickerOpen}
        onOpenChange={(open) => {
          setIconPickerOpen(open);
          if (!open) setIconSearchQuery("");
        }}
      >
        <DialogContent className="sm:max-w-175">
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

          {/* Search Bar */}
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

          <ScrollArea className="max-h-100 px-6">
            <div className="grid grid-cols-4 gap-3 py-4">
              {ICON_OPTIONS.filter(
                (option) =>
                  option.label
                    .toLowerCase()
                    .includes(iconSearchQuery.toLowerCase()) ||
                  option.value
                    .toLowerCase()
                    .includes(iconSearchQuery.toLowerCase())
              ).map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectIcon(option.value)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] transition-all group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-center text-[#64748B] group-hover:text-[#0A7AFF] font-medium transition-colors leading-tight">
                      {option.label}
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
        title="Save Requested Itinerary"
        description="Are you ready to save this requested itinerary? It will be added to the Requested tab in the Itinerary page."
        icon={<CheckCircle2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
        iconShadow="shadow-[#10B981]/20"
        contentGradient="bg-gradient-to-br from-[rgba(16,185,129,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(16,185,129,0.2)]"
        content={
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Customer:</span>
              <span className="text-sm text-[#1A2B4F] font-medium">
                {formData.customerName || "N/A"}
              </span>
            </div>
            {formData.customerId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Customer Type:</span>
                <span className="text-xs px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] rounded-full font-medium">
                  Existing Customer
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Destination:</span>
              <span className="text-sm text-[#1A2B4F] font-medium">
                {formData.destination || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Days:</span>
              <span className="text-sm text-[#1A2B4F] font-medium">
                {itineraryDays.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Total Amount:</span>
              <span className="text-sm text-[#10B981] font-bold">
                ₱
                {formData.totalAmount
                  ? parseFloat(formData.totalAmount).toLocaleString()
                  : "0"}
              </span>
            </div>
          </div>
        }
        onConfirm={handleSave} // This now calls the API
        onCancel={() => setSaveConfirmOpen(false)}
        confirmText={
          createBookingMutation.isPending ? "Saving..." : "Save Itinerary"
        }
        cancelText="Review Again"
        confirmVariant="default"
      />

      {/* Unsaved Changes Modal */}
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
              Your itinerary has unsaved changes. You can save it as a draft to
              continue working on it later, continue editing, or discard the
              changes.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full h-12 px-6 rounded-xl bg-linear-to-r from-[#FFB84D] to-[#FF9800] text-white font-medium shadow-lg shadow-[#FFB84D]/20 hover:shadow-xl hover:shadow-[#FFB84D]/30 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setBackConfirmOpen(false)}
                className="w-full h-12 px-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-[#F8FAFB] text-[#334155] font-medium transition-all flex items-center justify-center"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setBackConfirmOpen(false);
                  setHasUnsavedChanges(false);
                  navigate("/itinerary");
                }}
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
        description="Are you sure you want to remove this activity from the itinerary?"
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
        iconShadow="shadow-[#FF6B6B]/30"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
        contentBorder="border-[#FF6B6B]/20"
        content={
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#FF6B6B]">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                This action cannot be undone
              </span>
            </div>
            <p className="text-sm text-[#64748B]">
              The activity will be permanently removed from this day's
              itinerary.
            </p>
          </div>
        }
        onConfirm={removeActivity}
        confirmText="Delete Activity"
        cancelText="Keep Activity"
        confirmVariant="destructive"
      />

      {/* Reduce Days Confirmation Modal */}
      <ConfirmationModal
        open={reduceDaysConfirm !== null}
        onOpenChange={(open) => !open && handleCancelReduceDays()}
        title="Remove Days from Itinerary?"
        description="Changing the travel dates will reduce the number of days in this itinerary. Some itinerary details will be permanently removed and cannot be recovered."
        icon={<AlertCircle className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FFB84D] to-[#FF9800]"
        iconShadow="shadow-[#FFB84D]/30"
        contentGradient="bg-gradient-to-br from-[rgba(255,184,77,0.05)] to-[rgba(255,152,0,0.05)]"
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
        confirmText="Remove Days"
        cancelText="Keep Current Dates"
        confirmVariant="destructive"
      />

      {/* AI Travel Assistant */}
      <AITravelAssistant
        itineraryDays={itineraryDays}
        destination={formData.destination}
      />
    </div>
  );
}
