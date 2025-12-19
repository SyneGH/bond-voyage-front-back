import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, History, Plane, Hotel, Camera, UtensilsCrossed, Car, Package, MapPin, Compass, TreePine, Building2, Ship, Train, Coffee, ShoppingBag, Music, Sunset, Clock, AlertCircle, Sparkles, CheckCircle2, User, Mail, Phone, Calendar, Users, FileText, Waves, Mountain, Palmtree, Tent, Bike, Bus, Anchor, Film, Ticket, Wine, IceCream, Pizza, Fish, Salad, Utensils, Home, Landmark, Church, Castle, Globe, Backpack, Luggage, Umbrella, Sun, Moon, Star, Heart, Gift, ShoppingCart, Search, RotateCcw, ChevronRight } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { RouteOptimizationPanel } from "../../components/RouteOptimizationPanel";
import { VersionHistoryModal } from "../../components/VersionHistoryModal";
import { AITravelAssistant } from "../../components/AITravelAssistant";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { toast } from "sonner@2.0.3";
import { useBookings } from "../../components/BookingContext";
import { useBreadcrumbs } from "../../components/BreadcrumbContext";

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

interface BookingFormData {
  destination: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  totalAmount: string;
}

interface Version {
  id: string;
  timestamp: number;
  author: string;
  bookingData: BookingFormData;
  itineraryDays: Day[];
  label?: string;
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

// Time conversion helpers
const convertTo24Hour = (time12h: string): string => {
  if (!time12h) return "";
  
  // If already in 24-hour format (HH:MM), return as is
  if (/^\d{1,2}:\d{2}$/.test(time12h) && !time12h.includes("AM") && !time12h.includes("PM")) {
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
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { userTravels, updateUserTravel } = useBookings();
  const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbs();
  
  // Get passed data from route state
  const passedBookingData = location.state?.bookingData;
  const passedItinerary = location.state?.itinerary;
  const passedTabStatus = location.state?.tabStatus;
  
  const [bookingData, setBookingData] = useState<BookingFormData>({
    destination: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    totalAmount: "",
  });

  const [itineraryDays, setItineraryDays] = useState<Day[]>([]);
  const [initialBookingData, setInitialBookingData] = useState<BookingFormData | null>(null);
  const [initialItineraryDays, setInitialItineraryDays] = useState<Day[] | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string>("");

  // Version History states
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);
  const initialVersionCreated = useRef(false);
  
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

  // Current user (in a real app, this would come from auth context)
  const currentUser = "Maria Santos";

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
      localStorage.setItem(`booking-versions-${id}`, JSON.stringify(newVersions));
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
      setItineraryDays(JSON.parse(JSON.stringify(versionToRestore.itineraryDays)));
      setHasUnsavedChanges(true);
      
      toast.success("Version Restored", {
        description: `Restored to version from ${new Date(versionToRestore.timestamp).toLocaleString()}`,
      });
    }
    setRestoreConfirmOpen(false);
    setVersionToRestore(null);
    setVersionHistoryOpen(false);
  };

  // Get version display data
  const getVersionPreview = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return null;
    return version;
  };

  // Calculate changes between versions
  const getChangesSummary = (version: Version, previousVersion: Version | null) => {
    const changes: string[] = [];
    
    if (!previousVersion) {
      return ["Initial version"];
    }

    // Check booking data changes
    if (version.bookingData.destination !== previousVersion.bookingData.destination) {
      changes.push("Destination changed");
    }
    if (version.bookingData.travelDateFrom !== previousVersion.bookingData.travelDateFrom || 
        version.bookingData.travelDateTo !== previousVersion.bookingData.travelDateTo) {
      changes.push("Travel dates changed");
    }
    if (version.bookingData.travelers !== previousVersion.bookingData.travelers) {
      changes.push("Number of travelers changed");
    }
    if (version.bookingData.totalAmount !== previousVersion.bookingData.totalAmount) {
      changes.push("Budget changed");
    }

    // Check itinerary changes
    if (version.itineraryDays.length !== previousVersion.itineraryDays.length) {
      changes.push(`Days count changed (${previousVersion.itineraryDays.length} → ${version.itineraryDays.length})`);
    }

    // Check for activity changes
    let activitiesAdded = 0;
    let activitiesRemoved = 0;
    version.itineraryDays.forEach((day, idx) => {
      const prevDay = previousVersion.itineraryDays[idx];
      if (prevDay) {
        activitiesAdded += Math.max(0, day.activities.length - prevDay.activities.length);
        activitiesRemoved += Math.max(0, prevDay.activities.length - day.activities.length);
      }
    });

    if (activitiesAdded > 0) {
      changes.push(`${activitiesAdded} ${activitiesAdded === 1 ? 'activity' : 'activities'} added`);
    }
    if (activitiesRemoved > 0) {
      changes.push(`${activitiesRemoved} ${activitiesRemoved === 1 ? 'activity' : 'activities'} removed`);
    }

    return changes.length > 0 ? changes : ["Minor edits"];
  };

  // Helper function to convert icon component to string name
  const getIconNameFromComponent = (iconComponent: any): string => {
    if (!iconComponent) return "Clock";
    if (typeof iconComponent === "string") return iconComponent;
    
    const iconMatch = ICON_OPTIONS.find(opt => {
      try {
        return opt.icon === iconComponent || opt.icon.name === iconComponent.name;
      } catch {
        return false;
      }
    });
    
    if (iconMatch) return iconMatch.value;
    return "Clock";
  };

  // Load booking data from context or passed state
  useEffect(() => {
    if (!id) {
      navigate("/user/travels");
      return;
    }

    // Try to use passed data first, then fall back to context
    let booking = passedBookingData;
    let itinerary = passedItinerary;
    
    // If no passed data, try to find in context
    if (!booking) {
      const contextBooking = userTravels.find(t => t.id === id);
      if (contextBooking) {
        booking = {
          id: contextBooking.id,
          destination: contextBooking.destination,
          dates: `${new Date(contextBooking.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${new Date(contextBooking.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
          travelers: contextBooking.travelers,
          budget: contextBooking.budget,
          status: contextBooking.status,
          bookingType: contextBooking.bookingType,
          ownership: contextBooking.ownership,
          owner: contextBooking.owner,
          collaborators: contextBooking.collaborators,
          createdOn: contextBooking.createdOn,
        };
        itinerary = contextBooking.itinerary;
      }
    }
    
    if (!booking) {
      toast.error("Booking not found");
      navigate("/user/travels");
      return;
    }

    // Parse dates from booking
    let startDate = "";
    let endDate = "";
    
    // Try to get dates from context first (these are the authoritative dates)
    const contextBooking = userTravels.find(t => t.id === id);
    if (contextBooking) {
      startDate = contextBooking.startDate;
      endDate = contextBooking.endDate;
    } else if (booking.dates && typeof booking.dates === 'string') {
      // Fall back to parsing date range from string like "February 10, 2025 – February 15, 2025"
      const dateMatch = booking.dates.match(/(\w+ \d+, \d+)\s*–\s*(\w+ \d+, \d+)/);
      if (dateMatch) {
        // Parse dates in local timezone to avoid offset issues
        const start = new Date(dateMatch[1] + ' 12:00:00');
        const end = new Date(dateMatch[2] + ' 12:00:00');
        
        // Format to YYYY-MM-DD using local date parts (not UTC)
        startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      }
    }

    // Parse budget amount
    let parsedAmount = "";
    if (booking.budget) {
      const numericValue = booking.budget.replace(/[₱$,]/g, '').trim();
      parsedAmount = numericValue;
    }

    const loadedBookingData: BookingFormData = {
      destination: booking.destination,
      travelDateFrom: startDate,
      travelDateTo: endDate,
      travelers: booking.travelers.toString(),
      totalAmount: parsedAmount,
    };

    setBookingData(loadedBookingData);
    setInitialBookingData(loadedBookingData);
    setBookingStatus(passedTabStatus || booking.status);

    // Load itinerary
    if (itinerary && Array.isArray(itinerary)) {
      // Convert icon components to string names
      const convertedItinerary = itinerary.map((day: any) => ({
        ...day,
        id: day.id || generateId(),
        activities: day.activities.map((activity: any) => ({
          ...activity,
          id: activity.id || generateId(),
          icon: getIconNameFromComponent(activity.icon)
        }))
      }));
      setItineraryDays(convertedItinerary);
      setInitialItineraryDays(JSON.parse(JSON.stringify(convertedItinerary)));
    } else {
      // Generate empty itinerary based on dates
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        const days: Day[] = [];
        for (let i = 1; i <= dayCount; i++) {
          days.push({
            id: generateId(),
            day: i,
            title: "",
            activities: [],
          });
        }
        setItineraryDays(days);
        setInitialItineraryDays(JSON.parse(JSON.stringify(days)));
      }
    }
  }, [id, userTravels, navigate, passedBookingData, passedItinerary, passedTabStatus]);

  // Create initial version snapshot when data is first loaded
  useEffect(() => {
    if (initialBookingData && initialItineraryDays && !initialVersionCreated.current && id) {
      // Create the initial version snapshot only once when data is first loaded
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
  }, [initialBookingData, initialItineraryDays, id]);

  // Update breadcrumbs
  useEffect(() => {
    if (id && bookingStatus) {
      const tabLabel = 
        bookingStatus === "in-progress" ? "In Progress" :
        bookingStatus === "pending" ? "Pending" :
        bookingStatus === "rejected" ? "Rejected" :
        "In Progress";
      
      setBreadcrumbs([
        { label: "Home", path: "/user/home" },
        { label: "Travels", path: "/user/travels" },
        { label: tabLabel },
        { label: `Booking #${id}` },
        { label: "Edit Booking" }
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
      bookingData.totalAmount !== initialBookingData.totalAmount;

    const itineraryChanged = JSON.stringify(itineraryDays) !== JSON.stringify(initialItineraryDays);

    setHasUnsavedChanges(bookingChanged || itineraryChanged);
  }, [bookingData, itineraryDays, initialBookingData, initialItineraryDays]);

  // Recalculate days when dates change
  useEffect(() => {
    if (bookingData.travelDateFrom && bookingData.travelDateTo && !pendingDateChange) {
      const start = new Date(bookingData.travelDateFrom);
      const end = new Date(bookingData.travelDateTo);
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
        } else {
          // Days need to be reduced - check if empty days can be auto-removed
          const daysToRemove = itineraryDays.slice(dayCount);
          const hasContent = daysToRemove.some(day => day.title || day.activities.length > 0);
          
          if (!hasContent) {
            // Auto-remove empty days
            setItineraryDays(prev => prev.slice(0, dayCount));
          }
          // If there's content, the confirmation modal is already shown by handleBookingChange
        }
      }
    }
  }, [bookingData.travelDateFrom, bookingData.travelDateTo, pendingDateChange, itineraryDays]);

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

  // Handle booking data changes
  const handleBookingChange = (field: keyof BookingFormData, value: string) => {
    // Special handling for date changes
    if (field === "travelDateFrom" || field === "travelDateTo") {
      const tempData = { ...bookingData, [field]: value };
      
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
    
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  // Confirm reduce days
  const handleConfirmReduceDays = () => {
    if (reduceDaysConfirm && pendingDateChange) {
      // Apply the pending date change
      setBookingData(prev => ({ ...prev, [pendingDateChange.field]: pendingDateChange.value }));
      
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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

    setDeleteActivityConfirm(null);
    toast.success("Activity Removed", {
      description: "The activity has been deleted.",
    });
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  // Move activity up
  const moveActivityUp = (dayId: string, activityIndex: number) => {
    if (activityIndex === 0) return;

    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id === dayId) {
          const newActivities = [...day.activities];
          [newActivities[activityIndex - 1], newActivities[activityIndex]] = 
          [newActivities[activityIndex], newActivities[activityIndex - 1]];
          return { ...day, activities: newActivities };
        }
        return day;
      })
    );
    setHasUnsavedChanges(true);
  };

  // Move activity down
  const moveActivityDown = (dayId: string, activityIndex: number) => {
    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id === dayId && activityIndex < day.activities.length - 1) {
          const newActivities = [...day.activities];
          [newActivities[activityIndex], newActivities[activityIndex + 1]] = 
          [newActivities[activityIndex + 1], newActivities[activityIndex]];
          return { ...day, activities: newActivities };
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
  };

  // Select icon
  const selectIcon = (iconValue: string) => {
    if (currentActivityForIcon) {
      updateActivity(currentActivityForIcon.dayId, currentActivityForIcon.activityId, "icon", iconValue);
    }
    setIconPickerOpen(false);
    setCurrentActivityForIcon(null);
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
    const hasEmptyDays = itineraryDays.some(day => !day.title.trim());
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

    // Parse budget for storage
    const budgetValue = bookingData.totalAmount ? parseFloat(bookingData.totalAmount) : 0;
    const formattedBudget = `₱${budgetValue.toLocaleString()}`;

    // Format dates for display
    const startDate = new Date(bookingData.travelDateFrom + 'T12:00:00');
    const endDate = new Date(bookingData.travelDateTo + 'T12:00:00');
    const formattedDates = `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

    // Check if this booking exists in context
    const existsInContext = userTravels.some(t => t.id === id);
    
    if (existsInContext) {
      // Update in context
      updateUserTravel(id, {
        destination: bookingData.destination,
        startDate: bookingData.travelDateFrom,
        endDate: bookingData.travelDateTo,
        travelers: parseInt(bookingData.travelers),
        budget: formattedBudget,
        itinerary: itineraryDays,
      });

      toast.success("Booking Updated!", {
        description: "The customized booking has been successfully updated.",
      });
      
      setHasUnsavedChanges(false);
      setSaveConfirmOpen(false);
      
      // Redirect to the correct tab based on booking status with scroll to booking card
      navigate("/user/travels", { 
        state: { 
          activeTab: bookingStatus,
          scrollToId: id 
        } 
      });
    } else {
      // For mock data bookings, pass the updates back via state
      // The UserTravels page will handle updating mock data
      toast.success("Booking Updated!", {
        description: "The customized booking has been successfully updated.",
      });
      
      setHasUnsavedChanges(false);
      setSaveConfirmOpen(false);
      
      // Pass updated data back to UserTravels
      navigate("/user/travels", { 
        state: { 
          activeTab: bookingStatus,
          scrollToId: id,
          mockDataUpdate: {
            id,
            destination: bookingData.destination,
            dates: formattedDates,
            travelers: parseInt(bookingData.travelers),
            budget: formattedBudget,
            itinerary: itineraryDays,
          }
        } 
      });
    }
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

  // Handle route optimization acceptance
  const handleAcceptOptimization = (dayId: string, optimizedActivities: Activity[]) => {
    setItineraryDays(prev =>
      prev.map(day =>
        day.id === dayId
          ? { ...day, activities: optimizedActivities }
          : day
      )
    );
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6" style={{paddingBottom: 50}}>
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
            <Label htmlFor="destination" className="text-sm text-[#1A2B4F] mb-2 block font-medium">
              Destination <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              <Input
                id="destination"
                placeholder="e.g., Coron, Palawan"
                value={bookingData.destination}
                onChange={(e) => handleBookingChange("destination", e.target.value)}
                className="h-11 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="totalAmount" className="text-sm text-[#1A2B4F] mb-2 block font-medium">
              Total Amount (₱)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] pointer-events-none">₱</span>
              <Input
                id="totalAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 45000"
                value={bookingData.totalAmount}
                onChange={(e) => handleBookingChange("totalAmount", e.target.value)}
                className="h-11 pl-8 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="travelDateFrom" className="text-sm text-[#1A2B4F] mb-2 block font-medium">
              Travel Start Date <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              <Input
                id="travelDateFrom"
                type="date"
                value={bookingData.travelDateFrom}
                onChange={(e) => handleBookingChange("travelDateFrom", e.target.value)}
                className="h-11 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="travelDateTo" className="text-sm text-[#1A2B4F] mb-2 block font-medium">
              Travel End Date <span className="text-[#FF6B6B]">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              <Input
                id="travelDateTo"
                type="date"
                value={bookingData.travelDateTo}
                onChange={(e) => handleBookingChange("travelDateTo", e.target.value)}
                className="h-11 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="travelers" className="text-sm text-[#1A2B4F] mb-2 block font-medium">
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
                onChange={(e) => handleBookingChange("travelers", e.target.value)}
                className="h-11 pl-10 rounded-xl border-2 border-[#E5E7EB] focus:border-[#14B8A6] transition-all"
              />
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Route Optimization Panel */}
      {itineraryDays.some(day => day.activities.filter(a => a.location).length >= 2) && (
        <RouteOptimizationPanel
          itineraryDays={itineraryDays}
          onAcceptOptimization={handleAcceptOptimization}
        />
      )}

      {/* Day-by-Day Itinerary */}
      <ContentCard>
        <div className="mb-6">
          <h2 className="text-lg text-[#1A2B4F] font-semibold">Day-by-Day Itinerary ({itineraryDays.length} Days)</h2>
        </div>
        <div className="space-y-6">
          {itineraryDays.map((day, dayIndex) => (
            <div
              key={day.id}
              className="p-6 rounded-2xl border-2 border-[#E5E7EB] bg-gradient-to-br from-[rgba(10,122,255,0.02)] to-[rgba(20,184,166,0.02)] hover:border-[#0A7AFF]/30 transition-all"
            >
              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6">
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
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center gap-2 text-sm font-medium shadow-lg shadow-[#0A7AFF]/20 hover:shadow-xl hover:shadow-[#0A7AFF]/30 transition-all"
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
                          <div className="flex-1 grid grid-cols-12 gap-4">
                            {/* Time */}
                            <div className="col-span-2">
                              <Label className="text-xs text-[#64748B] mb-1 block">Time</Label>
                              <Input
                                type="time"
                                value={convertTo24Hour(activity.time)}
                                onChange={(e) => updateActivity(day.id, activity.id, "time", convertTo12Hour(e.target.value))}
                                className="h-9 rounded-lg border-[#E5E7EB] text-sm"
                              />
                            </div>

                            {/* Icon */}
                            <div className="col-span-2">
                              <Label className="text-xs text-[#64748B] mb-1 block">Icon</Label>
                              <button
                                onClick={() => openIconPicker(day.id, activity.id)}
                                className="w-full h-9 rounded-lg border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white flex items-center justify-center transition-all"
                              >
                                <IconComponent className="w-4 h-4 text-[#0A7AFF]" />
                              </button>
                            </div>

                            {/* Title */}
                            <div className="col-span-8">
                              <Label className="text-xs text-[#64748B] mb-1 block">Activity Title *</Label>
                              <Input
                                placeholder="e.g., Arrival at the Hotel"
                                value={activity.title}
                                onChange={(e) => updateActivity(day.id, activity.id, "title", e.target.value)}
                                className="h-9 rounded-lg border-[#E5E7EB] text-sm"
                              />
                            </div>

                            {/* Location */}
                            <div className="col-span-12 relative">
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
                                  className="h-9 pl-9 rounded-lg border-[#E5E7EB] text-sm"
                                />
                              </div>

                              {/* Location Suggestions Dropdown */}
                              {activeLocationInput?.dayId === day.id && 
                               activeLocationInput?.activityId === activity.id && 
                               locationSuggestions.length > 0 && (
                                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border-2 border-[#E5E7EB] rounded-lg shadow-lg max-h-40 overflow-auto">
                                  {locationSuggestions.map((suggestion, suggestionIndex) => (
                                    <button
                                      key={`${day.id}-${activity.id}-${suggestionIndex}-${suggestion}`}
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
                            <div className="col-span-12">
                              <Label className="text-xs text-[#64748B] mb-1 block">Description</Label>
                              <Textarea
                                placeholder="Add activity details..."
                                value={activity.description}
                                onChange={(e) => updateActivity(day.id, activity.id, "description", e.target.value)}
                                className="rounded-lg border-[#E5E7EB] text-sm resize-none"
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

      {/* AI Travel Assistant */}
      <AITravelAssistant
        itineraryDays={itineraryDays}
        destination={bookingData.destination}
      />

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-20 right-0 bg-white border-t-2 border-[#E5E7EB] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
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
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] hover:from-[#0865CC] hover:to-[#12A594] text-white flex items-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Icon Picker Modal */}
      <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
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

          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-4 gap-3">
              {ICON_OPTIONS.filter(opt => 
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
            <p>Are you sure you want to save changes to this customized booking?</p>
          </div>
        }
        onConfirm={handleConfirmSave}
        onCancel={() => setSaveConfirmOpen(false)}
        confirmText="Save Changes"
        confirmVariant="success"
      />

      {/* Back Confirmation Modal */}
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
              Your booking has unsaved changes. You can continue editing or discard the changes.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => setBackConfirmOpen(false)}
                className="w-full h-12 px-6 rounded-xl border-2 border-transparent 
                           bg-gradient-to-br from-[#FFB84D] to-[#FF9800] 
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
            <p>Are you sure you want to delete this activity? This action cannot be undone.</p>
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
        confirmText="Yes, Remove Days"
        cancelText="Keep All Days"
        confirmVariant="destructive"
      />

      {/* Version History Modal */}
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
      />

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
                Are you sure you want to restore this version? Your current changes will be replaced.
              </p>
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Version Date:</span>
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
                  <span className="text-xs text-muted-foreground">Destination:</span>
                  <span className="text-xs text-card-foreground font-medium">
                    {versionToRestore.bookingData.destination}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    This will replace your current work. Make sure to save if you want to keep your current changes before restoring.
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