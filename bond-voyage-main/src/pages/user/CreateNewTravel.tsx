import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Clock } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { AITravelAssistant } from "../../components/AITravelAssistant";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { toast } from "sonner@2.0.3";
import { useBookings } from "../../components/BookingContext";

// Import all icons
import {
  Plane, Hotel, Camera, UtensilsCrossed, Car, Package, MapPin, Compass, TreePine, Building2,
  Ship, Train, Coffee, ShoppingBag, Music, Sunset, AlertCircle, Sparkles, CheckCircle2,
  FileText, Calendar, Users, DollarSign, Waves, Mountain, Palmtree, Tent, Bike, Bus,
  Anchor, Film, Ticket, Wine, IceCream, Pizza, Fish, Salad, Utensils, Home, Landmark,
  Church, Castle, Globe, Backpack, Luggage, Umbrella, Sun, Moon, Star, Heart, Gift,
  ShoppingCart, Search
} from "lucide-react";

interface Activity {
  id: string;
  time: string;
  icon: string;
  title: string;
  description: string;
  location: string;
}

interface Day {
  id: string;
  day: number;
  title: string;
  activities: Activity[];
}

interface TravelFormData {
  destination: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  totalAmount: string;
}

const ICON_OPTIONS = [
  // Transportation
  { value: "Plane", label: "Plane / Flight", icon: Plane },
  { value: "Car", label: "Car / Drive", icon: Car },
  { value: "Bus", label: "Bus", icon: Bus },
  { value: "Train", label: "Train", icon: Train },
  { value: "Ship", label: "Ship / Ferry", icon: Ship },
  { value: "Anchor", label: "Boat / Anchor", icon: Anchor },
  { value: "Bike", label: "Bike / Cycling", icon: Bike },
  
  // Accommodation
  { value: "Hotel", label: "Hotel / Lodging", icon: Hotel },
  { value: "Home", label: "Home / Villa", icon: Home },
  { value: "Tent", label: "Camping / Tent", icon: Tent },
  
  // Food & Dining
  { value: "UtensilsCrossed", label: "Restaurant", icon: UtensilsCrossed },
  { value: "Utensils", label: "Dining", icon: Utensils },
  { value: "Coffee", label: "Coffee / Cafe", icon: Coffee },
  { value: "Wine", label: "Wine / Bar", icon: Wine },
  { value: "IceCream", label: "Dessert / Ice Cream", icon: IceCream },
  { value: "Pizza", label: "Pizza / Fast Food", icon: Pizza },
  { value: "Fish", label: "Seafood", icon: Fish },
  { value: "Salad", label: "Healthy Food", icon: Salad },
  
  // Activities & Attractions
  { value: "Camera", label: "Photography / Sightseeing", icon: Camera },
  { value: "Waves", label: "Beach / Swimming", icon: Waves },
  { value: "Mountain", label: "Mountain / Hiking", icon: Mountain },
  { value: "Palmtree", label: "Tropical / Island", icon: Palmtree },
  { value: "TreePine", label: "Nature / Forest", icon: TreePine },
  { value: "Landmark", label: "Landmark / Monument", icon: Landmark },
  { value: "Church", label: "Church / Temple", icon: Church },
  { value: "Castle", label: "Castle / Palace", icon: Castle },
  { value: "Film", label: "Movies / Shows", icon: Film },
  { value: "Music", label: "Music / Entertainment", icon: Music },
  { value: "Ticket", label: "Event / Tickets", icon: Ticket },
  { value: "ShoppingBag", label: "Shopping", icon: ShoppingBag },
  { value: "ShoppingCart", label: "Market / Shopping", icon: ShoppingCart },
  
  // Navigation & Travel
  { value: "MapPin", label: "Location / Map Pin", icon: MapPin },
  { value: "Compass", label: "Compass / Navigate", icon: Compass },
  { value: "Globe", label: "World / Global", icon: Globe },
  { value: "Backpack", label: "Backpacking / Adventure", icon: Backpack },
  { value: "Luggage", label: "Luggage / Travel", icon: Luggage },
  
  // Misc
  { value: "Package", label: "Package / Tour", icon: Package },
  { value: "Building2", label: "Building / City", icon: Building2 },
  { value: "Sunset", label: "Sunset / Sunrise", icon: Sunset },
  { value: "Sun", label: "Sun / Day", icon: Sun },
  { value: "Moon", label: "Moon / Night", icon: Moon },
  { value: "Star", label: "Star / Featured", icon: Star },
  { value: "Umbrella", label: "Umbrella / Beach", icon: Umbrella },
  { value: "Heart", label: "Love / Favorite", icon: Heart },
  { value: "Gift", label: "Gift / Souvenir", icon: Gift },
];

// Philippine cities/destinations for autocomplete suggestions
const PHILIPPINE_LOCATIONS = [
  "Boracay, Aklan",
  "Caticlan Airport, Malay, Aklan",
  "White Beach, Boracay",
  "D'Mall, Boracay",
  "Manila, Metro Manila",
  "Makati, Metro Manila",
  "BGC, Taguig City",
  "Intramuros, Manila",
  "Rizal Park, Manila",
  "Palawan",
  "El Nido, Palawan",
  "Coron, Palawan",
  "Puerto Princesa, Palawan",
  "Underground River, Palawan",
  "Cebu City, Cebu",
  "Mactan Island, Cebu",
  "Oslob, Cebu",
  "Moalboal, Cebu",
  "Kawasan Falls, Cebu",
  "Baguio City, Benguet",
  "Banaue Rice Terraces, Ifugao",
  "Sagada, Mountain Province",
  "Vigan, Ilocos Sur",
  "Pagudpud, Ilocos Norte",
  "Siargao Island",
  "Cloud 9, Siargao",
  "Bohol",
  "Chocolate Hills, Bohol",
  "Panglao Island, Bohol",
  "Tagbilaran, Bohol",
  "Davao City",
  "Camiguin Island",
  "Batanes",
  "Hundred Islands, Pangasinan",
];

const getIconComponent = (iconName: string) => {
  const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
  return iconOption ? iconOption.icon : Clock;
};

export function CreateNewTravel() {
  const navigate = useNavigate();
  const { addUserTravel } = useBookings();
  const [formData, setFormData] = useState<TravelFormData>({
    destination: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    totalAmount: "",
  });

  const [itineraryDays, setItineraryDays] = useState<Day[]>([
    {
      id: `day-${Date.now()}-1`,
      day: 1,
      title: "",
      activities: [],
    },
  ]);

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);
  const [deleteActivityConfirm, setDeleteActivityConfirm] = useState<{ dayId: string; activityId: string } | null>(null);
  const [currentActivityForIcon, setCurrentActivityForIcon] = useState<{ dayId: string; activityId: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [reduceDaysConfirm, setReduceDaysConfirm] = useState<{ newDayCount: number; daysToRemove: number } | null>(null);
  const [pendingDateChange, setPendingDateChange] = useState<{ field: "travelDateFrom" | "travelDateTo"; value: string } | null>(null);

  // Location autocomplete states
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [activeLocationInput, setActiveLocationInput] = useState<{ dayId: string; activityId: string } | null>(null);

  // Icon search state
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  // Generate unique ID
  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Track changes
  useEffect(() => {
    const hasData = formData.destination || formData.totalAmount || 
                    itineraryDays.some(day => day.title || day.activities.length > 0);
    setHasUnsavedChanges(hasData);
  }, [formData, itineraryDays]);

  // Recalculate days when dates change (now handled with confirmation)
  useEffect(() => {
    if (formData.travelDateFrom && formData.travelDateTo && !pendingDateChange) {
      const start = new Date(formData.travelDateFrom);
      const end = new Date(formData.travelDateTo);
      const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
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
          setItineraryDays(prev => [...prev, ...newDays]);
        }
        // Reduction is now handled through confirmation modal
      }
    }
  }, [formData.travelDateFrom, formData.travelDateTo, pendingDateChange]);

  // Handle location search
  const handleLocationSearch = (searchTerm: string, dayId: string, activityId: string) => {
    if (searchTerm.length >= 2) {
      const filtered = PHILIPPINE_LOCATIONS.filter(location =>
        location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setLocationSuggestions(filtered.slice(0, 5));
      setActiveLocationInput({ dayId, activityId });
    } else {
      setLocationSuggestions([]);
      setActiveLocationInput(null);
    }
  };

  // Select location suggestion
  const selectLocationSuggestion = (location: string, dayId: string, activityId: string) => {
    updateActivity(dayId, activityId, "location", location);
    setLocationSuggestions([]);
    setActiveLocationInput(null);
  };

  // Handle form data changes
  const handleFormChange = (field: keyof TravelFormData, value: string) => {
    // Special handling for date changes
    if (field === "travelDateFrom" || field === "travelDateTo") {
      const tempData = { ...formData, [field]: value };
      
      // Check if both dates are set
      if (tempData.travelDateFrom && tempData.travelDateTo) {
        const start = new Date(tempData.travelDateFrom);
        const end = new Date(tempData.travelDateTo);
        const newDayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const currentDayCount = itineraryDays.length;
        
        // Check if days will be reduced
        if (newDayCount > 0 && newDayCount < currentDayCount) {
          // Check if any of the days to be removed have content
          const daysToRemove = itineraryDays.slice(newDayCount);
          const hasContent = daysToRemove.some(day => day.title || day.activities.length > 0);
          
          if (hasContent) {
            // Store the pending change and show confirmation
            setPendingDateChange({ field, value });
            setReduceDaysConfirm({ 
              newDayCount, 
              daysToRemove: currentDayCount - newDayCount 
            });
            return;
          }
        }
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Confirm reduce days
  const handleConfirmReduceDays = () => {
    if (reduceDaysConfirm && pendingDateChange) {
      // Apply the pending date change
      setFormData(prev => ({ ...prev, [pendingDateChange.field]: pendingDateChange.value }));
      
      // Remove the extra days
      setItineraryDays(prev => prev.slice(0, reduceDaysConfirm.newDayCount));
      
      toast.success("Travel Dates Updated", {
        description: `${reduceDaysConfirm.daysToRemove} ${reduceDaysConfirm.daysToRemove === 1 ? 'day' : 'days'} removed from itinerary.`,
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
    setItineraryDays(prev =>
      prev.map(day => (day.id === dayId ? { ...day, title } : day))
    );
  };

  // Add activity to a day
  const addActivity = (dayId: string) => {
    const newActivity: Activity = {
      id: generateId(),
      time: "",
      icon: "",
      title: "",
      description: "",
      location: "",
    };

    setItineraryDays(prev =>
      prev.map(day =>
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
    setItineraryDays(prev =>
      prev.map(day =>
        day.id === dayId
          ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
          : day
      )
    );

    toast.success("Activity Removed", {
      description: "The activity has been deleted from your itinerary.",
    });

    setDeleteActivityConfirm(null);
  };

  // Update activity
  const updateActivity = (dayId: string, activityId: string, field: keyof Activity, value: string) => {
    // Validate time overlap if updating time field
    if (field === "time" && value) {
      const day = itineraryDays.find(d => d.id === dayId);
      if (day) {
        // Check if this time already exists in other activities of the same day
        const timeExists = day.activities.some(
          activity => activity.id !== activityId && activity.time === value
        );
        
        if (timeExists) {
          toast.error("Time Overlap Detected", {
            description: `The time ${value} is already used by another activity on Day ${day.day}. Please choose a different time.`,
          });
          return; // Don't update if time overlaps
        }

        // Check if time is sequential (later than previous activity)
        const activityIndex = day.activities.findIndex(a => a.id === activityId);
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

    setItineraryDays(prev =>
      prev.map(day =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.map(activity =>
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
    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id === dayId) {
          const newActivities = [...day.activities];
          [newActivities[activityIndex], newActivities[activityIndex - 1]] = [
            newActivities[activityIndex - 1],
            newActivities[activityIndex],
          ];
          return { ...day, activities: newActivities };
        }
        return day;
      })
    );
  };

  // Move activity down
  const moveActivityDown = (dayId: string, activityIndex: number) => {
    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id === dayId && activityIndex < day.activities.length - 1) {
          const newActivities = [...day.activities];
          [newActivities[activityIndex], newActivities[activityIndex + 1]] = [
            newActivities[activityIndex + 1],
            newActivities[activityIndex],
          ];
          return { ...day, activities: newActivities };
        }
        return day;
      })
    );
  };

  // Validate form
  const validateForm = () => {
    if (!formData.destination.trim()) {
      toast.error("Missing Required Field", {
        description: "Please enter a destination.",
      });
      return false;
    }
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
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid budget amount (must be greater than 0).",
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
      for (const activity of day.activities) {
        if (!activity.title.trim()) {
          toast.error(`Activity Title Missing`, {
            description: `Please enter a title for all activities on Day ${day.day}.`,
          });
          return false;
        }
      }
    }

    return true;
  };

  // Open save confirmation
  const handleSaveClick = () => {
    if (!validateForm()) return;
    setSaveConfirmOpen(true);
  };

  // Save travel plan
  const handleSave = () => {
    const startDate = new Date(formData.travelDateFrom);
    const endDate = new Date(formData.travelDateTo);
    const formattedDates = `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    
    const newTripId = `TP-${Date.now().toString().slice(-6)}`;
    
    const newTravel = {
      id: newTripId,
      destination: formData.destination,
      startDate: formData.travelDateFrom,
      endDate: formData.travelDateTo,
      travelers: parseInt(formData.travelers),
      budget: `₱${parseFloat(formData.totalAmount).toLocaleString()}`,
      status: "in-progress" as const,
      bookingType: "Customized" as const,
      bookingSource: "Created" as const,
      ownership: "owned" as const,
      owner: "Maria Santos",
      collaborators: [],
      createdOn: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      itinerary: itineraryDays.map(day => ({
        day: day.day,
        title: day.title,
        activities: day.activities.map(activity => ({
          time: activity.time,
          icon: activity.icon,
          title: activity.title,
          description: activity.description,
          location: activity.location,
        })),
      })),
    };

    // Add to context
    addUserTravel(newTravel);

    toast.success("Travel Plan Created!", {
      description: `Your travel plan to ${formData.destination} has been successfully created.`,
    });

    setSaveConfirmOpen(false);
    setHasUnsavedChanges(false);
    
    // Navigate to UserTravels after a short delay
    setTimeout(() => {
      navigate("/user/travels", { state: { scrollToId: newTripId, tab: "in-progress" } });
    }, 800);
  };

  // Handle back with confirmation
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setBackConfirmOpen(true);
    } else {
      navigate("/user/travels");
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setBackConfirmOpen(false);
    setHasUnsavedChanges(false);
    navigate("/user/travels");
  };

  // Filtered icons based on search
  const filteredIcons = ICON_OPTIONS.filter(option => 
    iconSearchQuery ? 
      option.label.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(iconSearchQuery.toLowerCase())
    : true
  );

  return (
    <div className="space-y-6 pb-20">
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
            <h1 className="text-[#1A2B4F] mb-1 text-lg font-semibold">Create New Travel</h1>
            <p className="text-sm text-[#64748B]">
              Build a customized travel plan with detailed day-by-day itinerary
            </p>
          </div>
        </div>
      </ContentCard>

      {/* Travel Information */}
      <ContentCard>
        <div className="mb-6">
          <h2 className="text-lg text-[#1A2B4F] font-semibold">Travel Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="destination" className="text-[#1A2B4F] mb-2 block">
              Destination <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
              <Input
                id="destination"
                placeholder="e.g., Baguio City"
                value={formData.destination}
                onChange={(e) => handleFormChange("destination", e.target.value)}
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
                onChange={(e) => handleFormChange("travelers", e.target.value)}
                className="h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="travelDateFrom" className="text-[#1A2B4F] mb-2 block">
              Travel Start Date <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
              <Input
                id="travelDateFrom"
                type="date"
                value={formData.travelDateFrom}
                onChange={(e) => handleFormChange("travelDateFrom", e.target.value)}
                className="h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="travelDateTo" className="text-[#1A2B4F] mb-2 block">
              Travel End Date <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
              <Input
                id="travelDateTo"
                type="date"
                value={formData.travelDateTo}
                onChange={(e) => handleFormChange("travelDateTo", e.target.value)}
                className="h-12 pl-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="totalAmount" className="text-[#1A2B4F] mb-2 block">
              Budget (₱) <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] font-medium">₱</span>
              <Input
                id="totalAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter your total budget"
                value={formData.totalAmount}
                onChange={(e) => handleFormChange("totalAmount", e.target.value)}
                className="h-12 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
              />
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Day-by-Day Itinerary */}
      <ContentCard>
        <div className="mb-6">
          <h2 className="text-lg text-[#1A2B4F] font-semibold">Day-by-Day Itinerary ({itineraryDays.length} Days)</h2>
          <p className="text-sm text-[#64748B] mt-1">Days are automatically calculated from travel dates</p>
        </div>
        <div className="space-y-6">
          {itineraryDays.map((day, dayIndex) => (
            <div
              key={day.id}
              className="p-6 rounded-2xl border-2 border-[#E5E7EB] bg-gradient-to-br from-[rgba(10,122,255,0.02)] to-[rgba(20,184,166,0.02)] hover:border-[#0A7AFF]/30 transition-all"
            >
              {/* Day Header */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                  <span className="text-white font-bold">D{day.day}</span>
                </div>
                <div className="flex-1">
                  <Label htmlFor={`day-${day.id}-title`} className="text-[#1A2B4F] mb-2 block text-sm font-medium">
                    Day {day.day} Title <span className="text-[#FF6B6B]">*</span>
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
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center gap-2 text-sm font-medium shadow-lg shadow-[#0A7AFF]/20 hover:shadow-xl hover:shadow-[#0A7AFF]/30 transition-all w-full md:w-auto justify-center"
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
                    <p className="text-sm text-[#64748B] mb-1">No activities yet for Day {day.day}</p>
                    <p className="text-xs text-[#94A3B8]">Click "Add Activity" to start building this day</p>
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
                        <div className="absolute -left-3 -top-3 w-7 h-7 rounded-lg bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-md text-white text-xs font-bold">
                          {activityIndex + 1}
                        </div>

                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div className="flex flex-col gap-1 pt-2">
                            <button
                              onClick={() => moveActivityUp(day.id, activityIndex)}
                              disabled={activityIndex === 0}
                              className="w-7 h-7 rounded-lg hover:bg-[rgba(10,122,255,0.1)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              title="Move Up"
                            >
                              <GripVertical className="w-4 h-4 text-[#CBD5E1] rotate-90" />
                            </button>
                            <button
                              onClick={() => moveActivityDown(day.id, activityIndex)}
                              disabled={activityIndex === day.activities.length - 1}
                              className="w-7 h-7 rounded-lg hover:bg-[rgba(10,122,255,0.1)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              title="Move Down"
                            >
                              <GripVertical className="w-4 h-4 text-[#CBD5E1] -rotate-90" />
                            </button>
                          </div>

                          {/* Form Fields */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Time */}
                            <div className="md:col-span-2">
                              <Label className="text-xs text-[#64748B] mb-1 block">Time</Label>
                              <Input
                                type="time"
                                value={activity.time}
                                onChange={(e) => updateActivity(day.id, activity.id, "time", e.target.value)}
                                className="h-9 rounded-lg border-[#E5E7EB] text-sm w-full"
                              />
                            </div>

                            {/* Icon */}
                            <div className="md:col-span-2">
                              <Label className="text-xs text-[#64748B] mb-1 block">Icon</Label>
                              <button
                                onClick={() => openIconPicker(day.id, activity.id)}
                                className="w-full h-9 rounded-lg border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white flex items-center justify-center transition-all"
                              >
                                {activity.icon ? (
                                  <IconComponent className="w-4 h-4 text-[#0A7AFF]" />
                                ) : (
                                  <span className="text-xs text-[#64748B]">Select</span>
                                )}
                              </button>
                            </div>

                            {/* Title */}
                            <div className="md:col-span-8">
                              <Label className="text-xs text-[#64748B] mb-1 block">Activity Title *</Label>
                              <Input
                                placeholder="e.g., Arrival at the Hotel"
                                value={activity.title}
                                onChange={(e) => updateActivity(day.id, activity.id, "title", e.target.value)}
                                className="h-9 rounded-lg border-[#E5E7EB] text-sm w-full"
                              />
                            </div>

                            {/* Location */}
                            <div className="md:col-span-12 relative">
                              <Label className="text-xs text-[#64748B] mb-1 block">Location</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                                <Input
                                  placeholder="Search location..."
                                  value={activity.location}
                                  onChange={(e) => {
                                    updateActivity(day.id, activity.id, "location", e.target.value);
                                    handleLocationSearch(e.target.value, day.id, activity.id);
                                  }}
                                  onFocus={() => {
                                    if (activity.location.length >= 2) {
                                      handleLocationSearch(activity.location, day.id, activity.id);
                                    }
                                  }}
                                  onBlur={() => {
                                    // Delay hiding suggestions to allow click
                                    setTimeout(() => {
                                      setLocationSuggestions([]);
                                      setActiveLocationInput(null);
                                    }, 200);
                                  }}
                                  className="h-9 pl-9 rounded-lg border-[#E5E7EB] text-sm w-full"
                                />
                              </div>

                              {/* Location Suggestions Dropdown */}
                              {activeLocationInput?.dayId === day.id && 
                               activeLocationInput?.activityId === activity.id && 
                               locationSuggestions.length > 0 && (
                                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border-2 border-[#E5E7EB] rounded-lg shadow-lg max-h-40 overflow-auto">
                                  {locationSuggestions.map((suggestion, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => selectLocationSuggestion(suggestion, day.id, activity.id)}
                                      className="w-full px-4 py-2.5 text-left text-sm text-[#334155] hover:bg-[rgba(10,122,255,0.05)] hover:text-[#0A7AFF] transition-colors flex items-center gap-2 border-b border-[#F1F5F9] last:border-0"
                                    >
                                      <MapPin className="w-3.5 h-3.5 text-[#0A7AFF] flex-shrink-0" />
                                      <span className="truncate">{suggestion}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-12">
                              <Label className="text-xs text-[#64748B] mb-1 block">Description</Label>
                              <Textarea
                                placeholder="Add activity details..."
                                value={activity.description}
                                onChange={(e) => updateActivity(day.id, activity.id, "description", e.target.value)}
                                className="rounded-lg border-[#E5E7EB] text-sm resize-none w-full"
                                rows={2}
                              />
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => confirmDeleteActivity(day.id, activity.id)}
                            className="w-9 h-9 rounded-lg border-2 border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] flex items-center justify-center transition-all group/delete mt-1 flex-shrink-0"
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

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-[80px] right-0 h-16 bg-white border-t-2 border-[#E5E7EB] z-40">
        <div className="h-full max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-end gap-3">
          <button
            onClick={handleBackClick}
            className="h-10 md:h-12 px-4 md:px-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFB] text-[#334155] font-medium transition-all text-sm md:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="h-10 md:h-12 px-4 md:px-8 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white font-medium shadow-lg shadow-[#0A7AFF]/20 hover:shadow-xl hover:shadow-[#0A7AFF]/30 transition-all flex items-center gap-2 text-sm md:text-base"
          >
            <Save className="w-4 h-4" />
            Save Travel Plan
          </button>
        </div>
      </div>

      {/* Icon Picker Dialog */}
      <Dialog open={iconPickerOpen} onOpenChange={(open) => {
        if (!open) {
          setIconPickerOpen(false);
          setIconSearchQuery("");
        }
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
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

          <ScrollArea className="max-h-[400px] px-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 py-4">
              {filteredIcons.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => selectIcon(option.value)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-center text-[#64748B] group-hover:text-[#0A7AFF] font-medium transition-colors leading-tight line-clamp-2">
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
        title="Save Travel Plan"
        description="Are you ready to save this travel plan? It will be added to your In Progress travels."
        icon={<CheckCircle2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
        iconShadow="shadow-[#10B981]/20"
        contentGradient="bg-gradient-to-br from-[rgba(16,185,129,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(16,185,129,0.2)]"
        content={
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Destination:</span>
              <span className="text-sm text-[#1A2B4F] font-medium">{formData.destination || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Days:</span>
              <span className="text-sm text-[#1A2B4F] font-medium">{itineraryDays.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Budget:</span>
              <span className="text-sm text-[#10B981] font-bold">
                ₱{formData.totalAmount ? parseFloat(formData.totalAmount).toLocaleString() : "0"}
              </span>
            </div>
          </div>
        }
        onConfirm={handleSave}
        onCancel={() => setSaveConfirmOpen(false)}
        confirmText="Save Travel Plan"
        cancelText="Review Again"
        confirmVariant="default"
      />

      {/* Unsaved Changes Modal */}
      <Dialog open={backConfirmOpen} onOpenChange={setBackConfirmOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB84D] to-[#FF9800] flex items-center justify-center shadow-lg shadow-[#FFB84D]/20">
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
              Your travel plan has unsaved changes. You can continue editing or discard the changes.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => setBackConfirmOpen(false)}
                className="w-full h-12 px-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-[#F8FAFB] text-[#334155] font-medium transition-all flex items-center justify-center"
              >
                Continue Editing
              </button>
              <button
                onClick={handleDiscardChanges}
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
              <span className="text-sm font-medium">This action cannot be undone</span>
            </div>
            <p className="text-sm text-[#64748B]">
              The activity will be permanently removed from this day's itinerary.
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
                <span className="text-sm text-[#1A2B4F] font-medium">{itineraryDays.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">New Days:</span>
                <span className="text-sm text-[#1A2B4F] font-medium">{reduceDaysConfirm.newDayCount}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#FFB84D]/20">
                <span className="text-sm text-[#64748B]">Days to Remove:</span>
                <span className="text-sm text-[#FF9800] font-bold">{reduceDaysConfirm.daysToRemove}</span>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-[rgba(255,107,107,0.1)] border border-[#FF6B6B]/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#64748B]">
                    Day {reduceDaysConfirm.newDayCount + 1} through Day {itineraryDays.length} will be permanently deleted.
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