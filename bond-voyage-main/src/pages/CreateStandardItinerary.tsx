import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2,
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
import { useDebounce } from "../hooks/useDebounce";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "sonner";
import { useCreateTourPackage } from "../hooks/useTourPackages";
import { usePlacesSearch } from "../hooks/useLocations";
import { ICON_OPTIONS } from "../utils/constants/constants";
import { RouteOptimizationPanel } from "../components/RouteOptimizationPanel";
import { Day, Place } from "../types/types";
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

export function CreateStandardItinerary() {
  const navigate = useNavigate();
  const { mutate: createTourPackage, isPending } = useCreateTourPackage();

  const [selectedDayForRoute, setSelectedDayForRoute] = useState<string | null>(
    null
  );

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

  const [formData, setFormData] = useState({
    destination: "",
    days: 1,
    pricePerPax: "",
    imageUrl: "",
    description: "",
    category: "Beach",
  });

  const [itineraryDays, setItineraryDays] = useState<Day[]>([
    {
      id: `day-${Date.now()}`,
      dayNumber: 1,
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
  const [pendingDaysChange, setPendingDaysChange] = useState<number | null>(
    null
  );

  const [activeLocationInput, setActiveLocationInput] = useState<{
    dayId: string;
    activityId: string;
  } | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const debouncedValue = useDebounce(locationSearchQuery);
  const [iconSearchQuery, setIconSearchQuery] = useState("");

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

  const generateId = () =>
    `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (formData.days !== itineraryDays.length) {
      setFormData((prev) => ({ ...prev, days: itineraryDays.length }));
    }
  }, [itineraryDays.length]);

  const handleFormChange = (field: string, value: string | number) => {
    if (field === "days" && typeof value === "number") {
      const currentDays = itineraryDays.length;

      if (value > currentDays) {
        const newDays: Day[] = [];
        for (let i = currentDays + 1; i <= value; i++) {
          newDays.push({
            id: generateId(),
            dayNumber: i,
            title: "",
            activities: [],
          });
        }
        setItineraryDays((prev) => [...prev, ...newDays]);
        setFormData((prev) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
      } else if (value < currentDays) {
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
        } else {
          setItineraryDays((prev) => prev.slice(0, value));
          setFormData((prev) => ({ ...prev, [field]: value }));
          setHasUnsavedChanges(true);
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setHasUnsavedChanges(true);
    }
  };

  const handleConfirmReduceDays = () => {
    if (reduceDaysConfirm && pendingDaysChange !== null) {
      setItineraryDays((prev) => prev.slice(0, pendingDaysChange));
      setFormData((prev) => ({ ...prev, days: pendingDaysChange }));
      toast.success("Days Reduced", {
        description: `${reduceDaysConfirm.daysToRemove} ${
          reduceDaysConfirm.daysToRemove === 1 ? "day" : "days"
        } removed from itinerary.`,
      });
      setHasUnsavedChanges(true);
    }
    setReduceDaysConfirm(null);
    setPendingDaysChange(null);
  };

  const handleCancelReduceDays = () => {
    setFormData((prev) => ({ ...prev, days: itineraryDays.length }));
    setReduceDaysConfirm(null);
    setPendingDaysChange(null);
  };

  const updateDayTitle = (dayId: string, title: string) => {
    setItineraryDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, title } : day))
    );
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const updateActivity = (
    dayId: string,
    activityId: string,
    field: keyof Activity,
    value: string | Place
  ) => {
    if (field === "time" && typeof value === "string" && value) {
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const openIconPicker = (dayId: string, activityId: string) => {
    setCurrentActivityForIcon({ dayId, activityId });
    setIconPickerOpen(true);
    setIconSearchQuery("");
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
    setIconSearchQuery("");
  };

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

  const validateForm = () => {
    if (!formData.destination.trim()) {
      toast.error("Missing Required Field", {
        description: "Please enter a destination for your itinerary.",
      });
      return false;
    }
    if (!formData.pricePerPax || parseFloat(formData.pricePerPax) <= 0) {
      toast.error("Invalid Price", {
        description:
          "Please enter a valid price per pax (must be greater than 0).",
      });
      return false;
    }
    if (formData.days < 1) {
      toast.error("Invalid Duration", {
        description: "Please select at least 1 day for your itinerary.",
      });
      return false;
    }

    for (const day of itineraryDays) {
      if (!day.title?.trim()) {
        toast.error(`Day ${day.dayNumber} Incomplete`, {
          description: `Please enter a title for Day ${day.dayNumber}.`,
        });
        return false;
      }
      if (day.activities.length === 0) {
        toast.error(`Day ${day.dayNumber} Empty`, {
          description: `Please add at least one activity for Day ${day.dayNumber}.`,
        });
        return false;
      }

      for (const activity of day.activities) {
        if (!activity.title.trim()) {
          toast.error(`Activity Title Missing`, {
            description: `Please enter a title for all activities on Day ${day.dayNumber}.`,
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSaveClick = () => {
    if (!validateForm()) return;
    setSaveConfirmOpen(true);
  };

  const handleSave = () => {
    const payload = {
      title: formData.destination,
      destination: formData.destination,
      price: parseFloat(formData.pricePerPax),
      duration: formData.days,
      description: formData.description || "",
      thumbUrl: formData.imageUrl || "",
      category: formData.category,
      isActive: true,
      days: itineraryDays.map((day) => ({
        dayNumber: day.dayNumber,
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
            locationData: activity.locationData || null,
          })),
      })),
    };

    createTourPackage(payload, {
      onSuccess: () => {
        toast.success("Standard Itinerary Created!", {
          description: `${formData.destination} has been successfully added to your standard itineraries.`,
        });
        setSaveConfirmOpen(false);
        setHasUnsavedChanges(false);
        navigate("/itinerary");
      },
      onError: (error: any) => {
        toast.error("Failed to create itinerary", {
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

  return (
    <>
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
              <h1 className="text-[#1A2B4F] mb-1">Create Standard Itinerary</h1>
              <p className="text-sm text-[#64748B]">
                Build a reusable itinerary template for your travel packages
              </p>
            </div>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="mb-6">
            <h2 className="text-lg text-[#1A2B4F] font-semibold">
              Itinerary Information
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
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
                    <span className="text-white font-bold">
                      D{day.dayNumber}
                    </span>
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
                                  type="button"
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
                              type="button"
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

      <div className="fixed bottom-0 left-20 right-0 bg-white border-t-2 border-[#E5E7EB] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-350 mx-auto px-8 py-4 flex items-center justify-between">
          <div className="text-sm text-[#64748B]">
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FFB84D] animate-pulse"></div>
                Unsaved changes
              </span>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackClick}
              className="h-11 px-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-[#F8FAFB] text-[#334155] font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isPending}
              className="h-11 px-6 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:shadow-xl hover:shadow-[#0A7AFF]/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : "Save Itinerary"}
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={iconPickerOpen}
        onOpenChange={(open: any) => {
          setIconPickerOpen(open);
          if (!open) {
            setIconSearchQuery("");
            setCurrentActivityForIcon(null);
          }
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

      <ConfirmationModal
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title="Save Standard Itinerary"
        description="Are you sure you want to save this itinerary? It will be added to your standard itineraries list."
        icon={<CheckCircle2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
        iconShadow="shadow-[#10B981]/30"
        contentGradient="bg-gradient-to-br from-[rgba(16,185,129,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[#10B981]/20"
        content={
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Destination:</span>
              <span className="text-sm text-[#1A2B4F] font-medium">
                {formData.destination || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Duration:</span>
              <span className="text-sm text-[#1A2B4F] font-medium">
                {formData.days} {formData.days === 1 ? "Day" : "Days"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Price per Pax:</span>
              <span className="text-sm text-[#10B981] font-medium">
                ₱
                {formData.pricePerPax
                  ? parseFloat(formData.pricePerPax).toLocaleString()
                  : "0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Total Activities:</span>
              <span className="text-sm text-[#0A7AFF] font-medium">
                {itineraryDays.reduce(
                  (sum, day) => sum + day.activities.length,
                  0
                )}
              </span>
            </div>
          </div>
        }
        onConfirm={handleSave}
        confirmText="Save Itinerary"
        cancelText="Keep Editing"
        confirmVariant="success"
      />

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

      <ConfirmationModal
        open={reduceDaysConfirm !== null}
        onOpenChange={(open) => !open && handleCancelReduceDays()}
        title="Remove Days from Itinerary?"
        description="Reducing the number of days will permanently remove some itinerary details. This action cannot be undone."
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
                    {itineraryDays.length} will be permanently deleted with all
                    their activities.
                  </p>
                </div>
              </div>
            </div>
          )
        }
        onConfirm={handleConfirmReduceDays}
        onCancel={handleCancelReduceDays}
        confirmText="Remove Days"
        cancelText="Keep Current Days"
        confirmVariant="destructive"
      />

      <AITravelAssistant
        itineraryDays={itineraryDays}
        destination={formData.destination}
      />
    </>
  );
}
