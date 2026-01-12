import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  MapPin,
  Search,
  Package,
} from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { ImageUploadField } from "../components/ImageUploadField";
import { ConfirmationModal } from "../components/ConfirmationModal";
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
  useTourPackageDetail,
  useUpdateTourPackage,
} from "../hooks/useTourPackages";
import { useDebounce } from "../hooks/useDebounce";
import { usePlacesSearch } from "../hooks/useLocations";
import { Place } from "../types/types";
import { RouteOptimizationPanel } from "../components/RouteOptimizationPanel";
import {
  ICON_OPTIONS,
  PHILIPPINE_LOCATIONS,
} from "../utils/constants/constants";
import { queryKeys } from "../utils/lib/queryKeys";

const getIconComponent = (iconName: string) => {
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return iconOption ? iconOption.icon : Clock;
};

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

export function EditStandardItinerary() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch tour package details
  const {
    data: tourPackageResponse,
    isLoading,
    error,
  } = useTourPackageDetail(id || "", {
    enabled: !!id,
    queryKey: [queryKeys.tourPackages.detail],
  });

  // Update mutation
  const { mutate: updateTourPackage, isPending } = useUpdateTourPackage(
    id || ""
  );

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    days: 1,
    pricePerPax: "",
    imageUrl: "",
    description: "",
    category: "Beach",
  });

  const [itineraryDays, setItineraryDays] = useState<Day[]>([]);
  const [initialFormData, setInitialFormData] = useState<
    typeof formData | null
  >(null);
  const [initialItineraryDays, setInitialItineraryDays] = useState<
    Day[] | null
  >(null);

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
  const [pendingDaysChange, setPendingDaysChange] = useState<number | null>(
    null
  );

  // Location autocomplete states
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const debouncedValue = useDebounce(locationSearchQuery);

  // Route Optimization state
  const [selectedDayForRoute, setSelectedDayForRoute] = useState<string | null>(
    null
  );

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

  const placesSuggestions = placesData?.data || [];

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [activeLocationInput, setActiveLocationInput] = useState<{
    dayId: string;
    activityId: string;
  } | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  const generateId = () =>
    `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Load tour package data when fetched
  useEffect(() => {
    if (!id) {
      navigate("/itinerary");
      return;
    }

    if (tourPackageResponse?.data) {
      const pkg = tourPackageResponse.data;

      const loadedFormData = {
        title: pkg.title || "",
        destination: pkg.destination || "",
        days: pkg.duration || 1,
        pricePerPax:
          typeof pkg.price === "string" ? pkg.price : pkg.price.toString(),
        imageUrl: pkg.thumbUrl || "",
        description: pkg.description || "",
        category: pkg.category || "Beach",
      };

      setFormData(loadedFormData);
      setInitialFormData(loadedFormData);

      // Convert API days to component format
      if (pkg.days && Array.isArray(pkg.days) && pkg.days.length > 0) {
        const convertedDays: Day[] = pkg.days.map(
          (day: any, index: number) => ({
            id: generateId(),
            day: day.day || index + 1,
            title: day.title || "",
            activities: (day.activities || []).map(
              (activity: any, actIdx: number) => ({
                id: generateId(),
                time: activity.time || "",
                icon: activity.icon || "Clock",
                title: activity.title || "",
                description: activity.description || "",
                location: activity.location || "",
                order: activity.order !== undefined ? activity.order : actIdx,
              })
            ),
          })
        );
        setItineraryDays(convertedDays);
        setInitialItineraryDays(JSON.parse(JSON.stringify(convertedDays)));
      } else {
        // Generate empty days based on duration
        const emptyDays: Day[] = [];
        for (let i = 1; i <= pkg.duration; i++) {
          emptyDays.push({
            id: generateId(),
            day: i,
            title: "",
            activities: [],
          });
        }
        setItineraryDays(emptyDays);
        setInitialItineraryDays(JSON.parse(JSON.stringify(emptyDays)));
      }
    }
  }, [id, tourPackageResponse, navigate]);

  // Track changes
  useEffect(() => {
    if (!initialFormData || !initialItineraryDays) {
      setHasUnsavedChanges(false);
      return;
    }

    const dataChanged =
      JSON.stringify(formData) !== JSON.stringify(initialFormData);
    const itineraryChanged =
      JSON.stringify(itineraryDays) !== JSON.stringify(initialItineraryDays);

    setHasUnsavedChanges(dataChanged || itineraryChanged);
  }, [formData, itineraryDays, initialFormData, initialItineraryDays]);

  // Adjust days when duration changes
  useEffect(() => {
    if (formData.days && !pendingDaysChange && initialFormData) {
      const dayCount = formData.days;

      if (dayCount > 0 && dayCount !== itineraryDays.length) {
        if (dayCount > itineraryDays.length) {
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
        } else {
          const daysToRemove = itineraryDays.slice(dayCount);
          const hasContent = daysToRemove.some(
            (day) => day.title || day.activities.length > 0
          );

          if (!hasContent) {
            setItineraryDays((prev) => prev.slice(0, dayCount));
          }
        }
      }
    }
  }, [formData.days, pendingDaysChange, itineraryDays.length, initialFormData]);

  const handleFormChange = (field: string, value: string | number) => {
    if (field === "days" && typeof value === "number") {
      const currentDays = itineraryDays.length;

      if (value > 0 && value < currentDays) {
        const daysToRemove = itineraryDays.slice(value);
        const hasContent = daysToRemove.some(
          (day) => day.title || day.activities.length > 0
        );

        if (hasContent) {
          setPendingDaysChange(value);
          setReduceDaysConfirm({
            newDayCount: value,
            daysToRemove: currentDays - value,
          });
          return;
        }
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmReduceDays = () => {
    if (reduceDaysConfirm && pendingDaysChange !== null) {
      setFormData((prev) => ({ ...prev, days: pendingDaysChange }));
      setItineraryDays((prev) => prev.slice(0, pendingDaysChange));
      toast.success("Day Count Updated", {
        description: `${reduceDaysConfirm.daysToRemove} ${
          reduceDaysConfirm.daysToRemove === 1 ? "day" : "days"
        } removed from itinerary.`,
      });
    }
    setReduceDaysConfirm(null);
    setPendingDaysChange(null);
  };

  const updateDayTitle = (dayId: string, title: string) => {
    setItineraryDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, title } : day))
    );
  };

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
    toast.success("Activity Added");
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
    toast.success("Activity Removed");
    setDeleteActivityConfirm(null);
  };

  const updateActivity = (
    dayId: string,
    activityId: string,
    field: keyof Activity,
    value: string | Place
  ) => {
    if (field === "time" && value) {
      const day = itineraryDays.find((d) => d.id === dayId);
      if (day) {
        const timeExists = day.activities.some(
          (activity) => activity.id !== activityId && activity.time === value
        );

        if (timeExists) {
          toast.error("Time Overlap Detected", {
            description: `The time ${value} is already used by another activity.`,
          });
          return;
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

  const openIconPicker = (dayId: string, activityId: string) => {
    setCurrentActivityForIcon({ dayId, activityId });
    setIconPickerOpen(true);
  };

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
  };

  const handleLocationSearch = (
    searchTerm: string,
    dayId: string,
    activityId: string
  ) => {
    updateActivity(dayId, activityId, "location", searchTerm);
    setLocationSearchQuery(searchTerm);
    if (searchTerm.length >= 2) {
      const filtered = PHILIPPINE_LOCATIONS.filter((location) =>
        location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // show quick local suggestions while places API resolves
      setLocationSuggestions(filtered.slice(0, 5));
      setActiveLocationInput({ dayId, activityId });
    } else {
      setLocationSuggestions([]);
      setActiveLocationInput(null);
    }
  };

  const selectLocationSuggestion = (
    placeOrName: Place | string,
    dayId: string,
    activityId: string
  ) => {
    if (typeof placeOrName === "string") {
      updateActivity(dayId, activityId, "location", placeOrName);
    } else {
      updateActivity(dayId, activityId, "location", placeOrName.name);
      updateActivity(dayId, activityId, "locationData", placeOrName);
    }
    setLocationSuggestions([]);
    setActiveLocationInput(null);
  };

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
        dayId.split("-")[1]
      } have been reordered for optimal routing.`,
    });
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Validation Error", {
        description: "Please enter the itinerary title.",
      });
      return false;
    }

    if (!formData.destination.trim()) {
      toast.error("Validation Error", {
        description: "Please enter the destination.",
      });
      return false;
    }

    for (const day of itineraryDays) {
      if (!day.title.trim()) {
        toast.error(`Day ${day.day} Incomplete`, {
          description: `Please enter a title for Day ${day.day}.`,
        });
        return false;
      }
    }

    return true;
  };

  const handleSaveClick = () => {
    if (!validateForm()) return;
    // Open confirmation modal instead of saving immediately
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    // Close modal and proceed to save
    setSaveConfirmOpen(false);
    handleSave();
  };

  const handleConfirmBack = () => {
    // Discard changes and navigate back
    setBackConfirmOpen(false);
    setHasUnsavedChanges(false);
    navigate("/itinerary");
  };

  const handleCancelReduceDays = () => {
    // Cancel pending reduction of days
    setReduceDaysConfirm(null);
    setPendingDaysChange(null);
  };

  const handleSave = () => {
    if (!id) return;

    const payload = {
      title: formData.title,
      destination: formData.destination,
      price: parseFloat(formData.pricePerPax),
      duration: formData.days,
      description: formData.description || "",
      thumbUrl: formData.imageUrl || "",
      category: formData.category,
      days: itineraryDays.map((day) => ({
        dayNumber: day.day,
        title: day.title,
        activities: day.activities
          .sort((a, b) => a.order - b.order)
          .map((activity) => ({
            time: activity.time,
            title: activity.title,
            order: activity.order,
            description: activity.description || "",
            icon: activity.icon || "Clock",
            location: activity.location || "",
          })),
      })),
    };

    updateTourPackage(payload, {
      onSuccess: () => {
        toast.success("Itinerary Updated!", {
          description: "The standard itinerary has been successfully updated.",
        });
        setHasUnsavedChanges(false);
        setSaveConfirmOpen(false);
        navigate("/itinerary");
      },
      onError: (error: any) => {
        toast.error("Failed to update itinerary", {
          description:
            error.response?.data?.message || "Please try again later",
        });
      },
    });
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setBackConfirmOpen(true);
    } else {
      navigate("/itinerary");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0A7AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !tourPackageResponse?.data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-[#FF6B6B] mx-auto mb-4" />
        <p className="text-[#64748B] text-lg mb-2">Failed to load itinerary</p>
        <button
          onClick={() => navigate("/itinerary")}
          className="px-4 py-2 bg-[#0A7AFF] text-white rounded-lg hover:bg-[#0A6AE8] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6" style={{ paddingBottom: 70 }}>
        <ContentCard>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackClick}
              className="w-11 h-11 rounded-xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-[#64748B] group-hover:text-[#0A7AFF] transition-colors" />
            </button>
            <div className="flex-1">
              <h1 className="text-[#1A2B4F] mb-1">Edit Standard Itinerary</h1>
              <p className="text-sm text-[#64748B]">
                Update your standard itinerary details and day-by-day activities
              </p>
            </div>
          </div>
        </ContentCard>
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

        <ContentCard>
          <div className="mb-6">
            <h2 className="text-lg text-[#1A2B4F] font-semibold">
              Itinerary Information
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <Label htmlFor="title" className="text-[#1A2B4F] mb-2 block">
                Itinerary Title <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Boracay 5-Day Beach Escape"
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                className="h-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
              />
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
              <Label htmlFor="days" className="text-[#1A2B4F] mb-2 block">
                Number of Days <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="30"
                placeholder="5"
                value={formData.days}
                onChange={(e) =>
                  handleFormChange("days", parseInt(e.target.value) || 1)
                }
                className="h-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
              />
            </div>

            <div className="col-span-2">
              <Label
                htmlFor="pricePerPax"
                className="text-[#1A2B4F] mb-2 block"
              >
                Price Per Pax (₱) <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] font-medium">
                  ₱
                </span>
                <Input
                  id="pricePerPax"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter Price per Person"
                  value={formData.pricePerPax}
                  onChange={(e) =>
                    handleFormChange("pricePerPax", e.target.value)
                  }
                  className="h-12 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label
                htmlFor="description"
                className="text-[#1A2B4F] mb-2 block"
              >
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of the tour package..."
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                className="rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all resize-none"
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <ImageUploadField
                value={formData.imageUrl}
                onChange={(url) => handleFormChange("imageUrl", url)}
              />
            </div>
          </div>
        </ContentCard>

        {/* Continue with Day-by-Day section... */}
        <ContentCard>
          <div className="mb-6">
            <h2 className="text-lg text-[#1A2B4F] font-semibold">
              Day-by-Day Itinerary ({itineraryDays.length} Days)
            </h2>
          </div>
          <div className="space-y-6">
            {itineraryDays.map((day) => (
              <div
                key={day.id}
                className="p-6 rounded-2xl border-2 border-[#E5E7EB] bg-linear-to-br from-[rgba(10,122,255,0.02)] to-[rgba(20,184,166,0.02)] hover:border-[#0A7AFF]/30 transition-all"
              >
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
                          <div className="absolute -left-3 -top-3 w-7 h-7 rounded-lg bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-md text-white text-xs font-bold">
                            {activityIndex + 1}
                          </div>

                          <div className="flex items-start gap-4">
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

                            {/* Activity Form Fields - Same as Create component */}
                            <div className="flex-1 grid grid-cols-12 gap-4">
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

                              <div className="col-span-2">
                                <Label className="text-xs text-[#64748B] mb-1 block">
                                  Icon
                                </Label>
                                <button
                                  onClick={() =>
                                    openIconPicker(day.id, activity.id)
                                  }
                                  className="w-full h-9 rounded-lg border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white flex items-center justify-center transition-all"
                                >
                                  <IconComponent className="w-4 h-4 text-[#0A7AFF]" />
                                </button>
                              </div>

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

                              <div className="col-span-12 relative">
                                <Label className="text-xs text-[#64748B] mb-1 block">
                                  Location
                                </Label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                                  <Input
                                    placeholder="Search location..."
                                    value={activity.location}
                                    onChange={(e) => {
                                      updateActivity(
                                        day.id,
                                        activity.id,
                                        "location",
                                        e.target.value
                                      );
                                      handleLocationSearch(
                                        e.target.value,
                                        day.id,
                                        activity.id
                                      );
                                    }}
                                    onFocus={() => {
                                      if (activity.location.length >= 2) {
                                        handleLocationSearch(
                                          activity.location,
                                          day.id,
                                          activity.id
                                        );
                                      }
                                    }}
                                    onBlur={() => {
                                      setTimeout(() => {
                                        setLocationSuggestions([]);
                                        setActiveLocationInput(null);
                                      }, 200);
                                    }}
                                    className="h-9 pl-9 rounded-lg border-[#E5E7EB] text-sm"
                                  />
                                </div>

                                {activeLocationInput?.dayId === day.id &&
                                  activeLocationInput?.activityId ===
                                    activity.id &&
                                  (placesSuggestions.length > 0 ||
                                    locationSuggestions.length > 0) && (
                                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border-2 border-[#E5E7EB] rounded-lg shadow-lg max-h-40 overflow-auto">
                                      {placesSuggestions.length > 0
                                        ? placesSuggestions.map(
                                            (place: any, idx: number) => (
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
                                                className="w-full px-4 py-2.5 text-left text-sm text-[#334155] hover:bg-[rgba(10,122,255,0.05)] hover:text-[#0A7AFF] transition-colors flex items-center gap-2 border-b border-[#F1F5F9] last:border-0"
                                              >
                                                <MapPin className="w-3.5 h-3.5 text-[#0A7AFF] shrink-0" />
                                                <span className="truncate">
                                                  {place.name}
                                                </span>
                                              </button>
                                            )
                                          )
                                        : locationSuggestions.map(
                                            (suggestion, idx) => (
                                              <button
                                                key={idx}
                                                type="button"
                                                onClick={() =>
                                                  selectLocationSuggestion(
                                                    suggestion,
                                                    day.id,
                                                    activity.id
                                                  )
                                                }
                                                className="w-full px-4 py-2.5 text-left text-sm text-[#334155] hover:bg-[rgba(10,122,255,0.05)] hover:text-[#0A7AFF] transition-colors flex items-center gap-2 border-b border-[#F1F5F9] last:border-0"
                                              >
                                                <MapPin className="w-3.5 h-3.5 text-[#0A7AFF] shrink-0" />
                                                <span className="truncate">
                                                  {suggestion}
                                                </span>
                                              </button>
                                            )
                                          )}
                                    </div>
                                  )}
                              </div>

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

                            <button
                              onClick={() =>
                                setDeleteActivityConfirm({
                                  dayId: day.id,
                                  activityId: activity.id,
                                })
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
      </div>

      {/* Bottom Bar, Modals same as Create component */}
      <div className="fixed bottom-0 left-20 right-0 bg-white border-t-2 border-[#E5E7EB] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-350 mx-auto px-8 h-18 flex items-center justify-between">
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
              disabled={isPending}
              className="h-11 px-8 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] hover:from-[#0865CC] hover:to-[#12A594] text-white flex items-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Icon Picker Modal */}
      <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
        <DialogContent className="sm:max-w-175 max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Choose an Icon</DialogTitle>
            <DialogDescription>
              Select an icon that best represents the activity
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <Input
              placeholder="Search icons..."
              value={iconSearchQuery}
              onChange={(e) => setIconSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-100 pr-4">
            <div className="grid grid-cols-4 gap-3">
              {ICON_OPTIONS.filter((opt) =>
                opt.label.toLowerCase().includes(iconSearchQuery.toLowerCase())
              ).map((iconOption) => {
                const Icon = iconOption.icon;
                return (
                  <button
                    key={iconOption.value}
                    onClick={() => selectIcon(iconOption.value)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] transition-all group"
                  >
                    <Icon className="w-6 h-6 text-[#64748B] group-hover:text-[#0A7AFF] transition-colors" />
                    <span className="text-xs text-center text-[#64748B] group-hover:text-[#0A7AFF] transition-colors">
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
              Are you sure you want to save changes to this standard itinerary?
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
              Your itinerary has unsaved changes. You can continue editing or
              discard the changes.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
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
    </div>
  );
}
