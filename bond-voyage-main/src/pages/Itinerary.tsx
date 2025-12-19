import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, CheckCircle2, Package, Plane, Hotel, Camera, UtensilsCrossed, Car, BookOpen, Clock, GripVertical, Save, MapPin, Compass, TreePine, Building2, Ship, Train, Coffee, ShoppingBag, Music, Sunset, AlertCircle, Sparkles, FileText, Calendar, Users, DollarSign, Mail, Phone, User, Waves, Mountain, Palmtree, Tent, Bike, Bus, Anchor, Film, Ticket, Wine, IceCream, Pizza, Fish, Salad, Utensils, Home, Landmark, Church, Castle, Globe, Backpack, Luggage, Umbrella, Sun, Moon, Star, Heart, Gift, ShoppingCart, Search, Send } from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SearchFilterToolbar, SortOrder } from "../components/SearchFilterToolbar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { StandardItineraryDetailView } from "../components/StandardItineraryDetailView";
import { BookingListCard } from "../components/BookingListCard";
import { BookingDetailView } from "../components/BookingDetailView";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner@2.0.3";

interface RequestedItineraryBooking {
  id: string;
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
}

interface ItineraryActivity {
  time: string;
  icon: any;
  title: string;
  description: string;
  location?: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

interface BookingFormData {
  customerName: string;
  email: string;
  mobile: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  tourType: "Joiner" | "Private";
}

interface ItineraryProps {
  onCreateBooking?: (bookingData: any) => void;
  requestedBookingsFromBookings?: any[];
  newStandardItineraries?: any[];
  drafts?: any[];
  onNavigateToCreateStandard?: () => void;
  onNavigateToCreateRequested?: () => void;
  onEditItinerary?: (itinerary: any) => void;
  onEditRequestedBooking?: (booking: any) => void;
  onEditRequestedDraft?: (draft: any) => void;
  onEditStandardDraft?: (draft: any) => void;
  onDeleteDraft?: (draftId: string) => void;
}

// Icon mapping helper
const ICON_MAP: Record<string, any> = {
  Plane, Hotel, Camera, UtensilsCrossed, Car, Package, MapPin, Compass, TreePine, 
  Building2, Ship, Train, Coffee, ShoppingBag, Music, Sunset, Clock, Waves, Mountain,
  Palmtree, Tent, Bike, Bus, Anchor, Film, Ticket, Wine, IceCream, Pizza, Fish, Salad,
  Utensils, Home, Landmark, Church, Castle, Globe, Backpack, Luggage, Umbrella, Sun,
  Moon, Star, Heart, Gift, ShoppingCart, Search
};

const getIconComponent = (iconName: string) => {
  return ICON_MAP[iconName] || Clock;
};

// Helper to get icon name from component
const getIconName = (iconComponent: any): string => {
  if (typeof iconComponent === 'string') return iconComponent;
  
  // Find the icon name by matching the component
  for (const [name, component] of Object.entries(ICON_MAP)) {
    if (component === iconComponent) return name;
  }
  return 'Clock'; // default
};

// Serialize itinerary data for navigation (convert icon components to strings)
const serializeItineraryData = (data: any) => {
  if (!data) return data;
  
  const serialized = { ...data };
  
  if (data.itineraryDetails || data.itineraryDays) {
    const details = data.itineraryDetails || data.itineraryDays;
    serialized.itineraryDetails = details.map((day: any) => ({
      ...day,
      activities: day.activities.map((activity: any) => ({
        ...activity,
        icon: getIconName(activity.icon)
      }))
    }));
    if (data.itineraryDays) {
      serialized.itineraryDays = serialized.itineraryDetails;
    }
  }
  
  return serialized;
};

export function Itinerary({ onCreateBooking, requestedBookingsFromBookings = [], newStandardItineraries = [], drafts = [], onEditItinerary, onEditRequestedBooking, onEditRequestedDraft, onEditStandardDraft, onDeleteDraft }: ItineraryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const standardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const requestedRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [selectedCategory, setSelectedCategory] = useState<"Standard" | "Requested">("Standard");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Standard itinerary states
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const [selectedStandardId, setSelectedStandardId] = useState<number | null>(null);
  
  // Requested itinerary states  
  const [requestedViewMode, setRequestedViewMode] = useState<"list" | "detail">("list");
  const [selectedRequestedId, setSelectedRequestedId] = useState<string | null>(null);

  // Booking modal states
  const [standardBookingModalOpen, setStandardBookingModalOpen] = useState(false);
  const [selectedStandardForBooking, setSelectedStandardForBooking] = useState<number | null>(null);
  const [requestedBookingModalOpen, setRequestedBookingModalOpen] = useState(false);
  const [selectedRequestedForBooking, setSelectedRequestedForBooking] = useState<string | null>(null);

  // Booking form data
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    customerName: "",
    email: "",
    mobile: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    tourType: "" as any,
  });

  // Edit requested booking states
  const [editRequestedModalOpen, setEditRequestedModalOpen] = useState(false);
  const [requestedToEdit, setRequestedToEdit] = useState<RequestedItineraryBooking | null>(null);
  const [editRequestedFormData, setEditRequestedFormData] = useState<BookingFormData>({
    customerName: "",
    email: "",
    mobile: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    tourType: "Private",
  });
  
  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<RequestedItineraryBooking | null>(null);

  // Delete standard itinerary states
  const [deleteStandardConfirm, setDeleteStandardConfirm] = useState<number | null>(null);
  const [deletedItineraries, setDeletedItineraries] = useState<number[]>([]);

  // Delete draft states
  const [deleteDraftConfirmOpen, setDeleteDraftConfirmOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<any | null>(null);

  // State for standard itinerary updates from edit page
  const [standardItineraryUpdates, setStandardItineraryUpdates] = useState<Record<number, any>>({});
  const [requestedBookingUpdates, setRequestedBookingUpdates] = useState<Record<string, any>>({});

  // Confirmation modal for creating booking
  const [createBookingConfirmOpen, setCreateBookingConfirmOpen] = useState(false);

  // Conversation state for requested bookings
  const [conversations, setConversations] = useState<Record<string, Array<{ sender: "admin" | "user"; message: string; time: string }>>>({
    "BV-2024-REQ-001": [
      { sender: "user", message: "Hello! I would like to request this custom itinerary for my upcoming trip.", time: "Oct 5, 2024, 10:00 AM" },
      { sender: "admin", message: "Thank you for your request! We're reviewing your itinerary details and will get back to you shortly.", time: "Oct 5, 2024, 2:30 PM" },
    ],
    "BV-2024-REQ-002": [
      { sender: "user", message: "I'm interested in this surfing adventure package.", time: "Sep 20, 2024, 9:00 AM" },
    ],
    "BV-2024-REQ-003": [
      { sender: "user", message: "Can you help me with the cultural immersion tour?", time: "Sep 10, 2024, 11:00 AM" },
      { sender: "admin", message: "Absolutely! We'd be happy to help you plan your cultural tour.", time: "Sep 10, 2024, 3:00 PM" },
    ],
  });
  const [currentMessage, setCurrentMessage] = useState<Record<string, string>>({});

  // Merge requested bookings from Bookings page with existing ones
  useEffect(() => {
    if (requestedBookingsFromBookings && requestedBookingsFromBookings.length > 0) {
      const convertedBookings: any[] = requestedBookingsFromBookings.map(booking => ({
        id: booking.id,
        customer: booking.customer,
        email: booking.email,
        mobile: booking.mobile,
        destination: booking.destination,
        itinerary: booking.itinerary,
        dates: formatDateRange(booking.startDate, booking.endDate),
        travelers: booking.travelers,
        totalAmount: booking.totalAmount ? (typeof booking.totalAmount === 'number' ? `₱${booking.totalAmount.toLocaleString()}` : booking.totalAmount) : "₱0",
        paid: booking.paid ? (typeof booking.paid === 'number' ? `₱${booking.paid.toLocaleString()}` : booking.paid) : "₱0",
        bookedDate: booking.bookedDate,
        status: "pending",
        sentStatus: booking.sentStatus || "unsent",
        confirmStatus: booking.confirmStatus || "unconfirmed",
        // Preserve itineraryDetails if it exists
        ...(booking.itineraryDetails && { itineraryDetails: booking.itineraryDetails }),
      }));

      setRequestedBookings(prev => {
        // Avoid duplicates by checking if booking ID already exists
        const existingIds = prev.map(b => b.id);
        const newBookings = convertedBookings.filter(b => !existingIds.includes(b.id));
        return [...newBookings, ...prev];
      });
    }
  }, [requestedBookingsFromBookings]);

  // Handle navigation back from edit pages with updates
  useEffect(() => {
    if (location.state?.scrollToId) {
      const { scrollToId, category, updatedItinerary, updatedBooking } = location.state;
      
      // Handle standard itinerary updates
      if (category === "Standard" && updatedItinerary) {
        setStandardItineraryUpdates(prev => ({
          ...prev,
          [updatedItinerary.id]: updatedItinerary
        }));
        setSelectedCategory("Standard");
        setViewMode("grid");
        
        // Scroll to updated item after a short delay
        setTimeout(() => {
          const element = standardRefs.current[scrollToId];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            element.style.animation = 'highlight 2s ease-in-out';
          }
        }, 300);
      }
      
      // Handle requested itinerary updates
      if (category === "Requested" && updatedBooking) {
        setRequestedBookingUpdates(prev => ({
          ...prev,
          [updatedBooking.id]: updatedBooking
        }));
        setSelectedCategory("Requested");
        setRequestedViewMode("list");
        
        // Scroll to updated item after a short delay
        setTimeout(() => {
          const element = requestedRefs.current[scrollToId];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            element.style.animation = 'highlight 2s ease-in-out';
          }
        }, 300);
      }
      
      // Clear the location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Helper function to format date range (same as in App.tsx)
  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  // Combine default templates with newly created ones
  const defaultTemplates = [
    {
      id: 1,
      title: "Boracay, Aklan",
      destination: "Boracay, Aklan",
      days: 5,
      category: "Standard",
      pricePerPax: 5700,
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCb3JhY2F5JTIwYmVhY2glMjBQaGlsaXBwaW5lc3xlbnwxfHx8fDE3NjAyNjEwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 2,
      title: "Palawan, Puerto Princesa",
      destination: "Palawan, Puerto Princesa",
      days: 7,
      category: "Requested",
      image: "https://images.unsplash.com/photo-1561198940-072c31c6f42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYWxhd2FuJTIwUGhpbGlwcGluZXMlMjBpc2xhbmR8ZW58MXx8fHwxNzYwMjYxMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      title: "Baguio City, Benguet",
      destination: "Baguio City, Benguet",
      days: 4,
      category: "Standard",
      pricePerPax: 4875,
      image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYWd1aW8lMjBQaGlsaXBwaW5lcyUyMG1vdW50YWluc3xlbnwxfHx8fDE3NjAyNjEwNzV8MA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 4,
      title: "Siargao, Surigao del Norte",
      destination: "Siargao, Surigao del Norte",
      days: 6,
      category: "Requested",
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaWFyZ2FvJTIwUGhpbGlwcGluZXMlMjBzdXJmaW5nfGVufDF8fHx8MTc2MDI2MTA3NXww&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 5,
      title: "Cebu City, Cebu",
      destination: "Cebu City, Cebu",
      days: 5,
      category: "Standard",
      pricePerPax: 4800,
      image: "https://images.unsplash.com/photo-1580837119756-563d608dd119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDZWJ1JTIwUGhpbGlwcGluZXMlMjBjaXR5fGVufDF8fHx8MTc2MDI2MTA3NXww&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 6,
      title: "Vigan, Ilocos Sur",
      destination: "Vigan, Ilocos Sur",
      days: 7,
      category: "Requested",
      image: "https://images.unsplash.com/photo-1597074866923-dc0589150215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxWaWdhbiUyMFBoaWxpcHBpbmVzJTIwaGVyaXRhZ2V8ZW58MXx8fHwxNzYwMjYxMDc1fDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  // Merge with newly created itineraries, apply updates, and filter out deleted ones
  const templates = [...newStandardItineraries, ...defaultTemplates]
    .filter(t => !deletedItineraries.includes(t.id))
    .map(t => standardItineraryUpdates[t.id] || t);

  // Standard Itinerary Details Data
  const defaultItineraryDetails: Record<number, ItineraryDay[]> = {
    1: [ // Boracay 5-Day Beach Escape
      {
        day: 1,
        title: "Arrival & Beach Sunset",
        activities: [
          { time: "10:00 AM", icon: Plane, title: "Arrival at Caticlan Airport", description: "Meet and greet with tour guide", location: "Caticlan Airport" },
          { time: "11:30 AM", icon: Car, title: "Transfer to Boracay", description: "Boat ride and van transfer to hotel", location: "D'Mall Area" },
          { time: "2:00 PM", icon: Hotel, title: "Check-in at Resort", description: "Check-in and settle at beachfront resort", location: "Station 2" },
          { time: "6:00 PM", icon: Camera, title: "Sunset at White Beach", description: "Witness the famous Boracay sunset", location: "White Beach" },
          { time: "8:00 PM", icon: UtensilsCrossed, title: "Welcome Dinner", description: "Seafood dinner at beachfront restaurant", location: "D'Mall Area" },
        ],
      },
      {
        day: 2,
        title: "Island Hopping Adventure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel restaurant", location: "Resort" },
          { time: "9:00 AM", icon: Plane, title: "Island Hopping Tour", description: "Visit Crystal Cove, Crocodile Island", location: "Various Islands" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch on Island", description: "Beachside lunch and snorkeling", location: "Puka Beach" },
          { time: "5:00 PM", icon: Hotel, title: "Return to Resort", description: "Free time for rest", location: "Resort" },
        ],
      },
      {
        day: 3,
        title: "Water Sports & Activities",
        activities: [
          { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Buffet breakfast at resort", location: "Resort" },
          { time: "10:00 AM", icon: Camera, title: "Water Sports", description: "Parasailing, jet ski, banana boat", location: "White Beach" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Beachfront dining", location: "Station 1" },
          { time: "3:00 PM", icon: Package, title: "Free Time", description: "Shopping or beach relaxation", location: "D'Mall" },
        ],
      },
      {
        day: 4,
        title: "Relaxation Day",
        activities: [
          { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Leisurely breakfast", location: "Resort" },
          { time: "10:00 AM", icon: Camera, title: "Beach Time", description: "Sunbathing and swimming", location: "White Beach" },
          { time: "2:00 PM", icon: Package, title: "Spa Treatment", description: "Optional massage services", location: "Resort Spa" },
          { time: "7:00 PM", icon: UtensilsCrossed, title: "Farewell Dinner", description: "Special seafood feast", location: "Beachfront Restaurant" },
        ],
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Final breakfast at resort", location: "Resort" },
          { time: "9:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out", location: "Resort" },
          { time: "10:00 AM", icon: Car, title: "Transfer to Airport", description: "Boat and van transfer", location: "Caticlan Airport" },
          { time: "12:00 PM", icon: Plane, title: "Departure", description: "Flight back home", location: "Caticlan Airport" },
        ],
      },
    ],
    3: [ // Baguio 4-Day Summer Capital
      {
        day: 1,
        title: "Arrival & City Tour",
        activities: [
          { time: "8:00 AM", icon: Car, title: "Departure from Manila", description: "Travel to Baguio City", location: "Manila" },
          { time: "2:00 PM", icon: Hotel, title: "Check-in", description: "Check-in at hotel", location: "Baguio City" },
          { time: "4:00 PM", icon: Camera, title: "Burnham Park", description: "Boat rides and biking", location: "Burnham Park" },
          { time: "6:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Try local delicacies", location: "Session Road" },
        ],
      },
      {
        day: 2,
        title: "Nature & Heritage",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel", location: "Hotel" },
          { time: "9:00 AM", icon: Camera, title: "Botanical Garden", description: "Nature walk and photo ops", location: "Botanical Garden" },
          { time: "11:00 AM", icon: Camera, title: "Mines View Park", description: "Scenic mountain views", location: "Mines View Park" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Local restaurant", location: "City Center" },
          { time: "3:00 PM", icon: Package, title: "Good Shepherd", description: "Buy pasalubong and souvenirs", location: "Good Shepherd Convent" },
        ],
      },
      {
        day: 3,
        title: "Adventure Day",
        activities: [
          { time: "6:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Packed breakfast", location: "Hotel" },
          { time: "7:00 AM", icon: Plane, title: "Strawberry Farm", description: "Strawberry picking experience", location: "La Trinidad" },
          { time: "10:00 AM", icon: Camera, title: "Lion's Head", description: "Iconic landmark visit", location: "Kennon Road" },
          { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Mountain view restaurant", location: "Camp John Hay" },
          { time: "3:00 PM", icon: Package, title: "Shopping Time", description: "Night market preparation", location: "Session Road" },
        ],
      },
      {
        day: 4,
        title: "Departure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Last breakfast in Baguio", location: "Hotel" },
          { time: "9:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out", location: "Hotel" },
          { time: "10:00 AM", icon: Car, title: "Return to Manila", description: "Travel back to Manila", location: "Baguio City" },
        ],
      },
    ],
    5: [ // Cebu 5-Day Heritage Tour
      {
        day: 1,
        title: "Arrival & City Orientation",
        activities: [
          { time: "10:00 AM", icon: Plane, title: "Arrival at Mactan Airport", description: "Meet tour coordinator", location: "Mactan-Cebu Airport" },
          { time: "12:00 PM", icon: Hotel, title: "Check-in", description: "Check-in at city hotel", location: "Cebu City" },
          { time: "2:00 PM", icon: Camera, title: "City Tour", description: "Visit Magellan's Cross, Basilica", location: "Downtown Cebu" },
          { time: "6:00 PM", icon: UtensilsCrossed, title: "Welcome Dinner", description: "Lechon dinner", location: "Ayala Center" },
        ],
      },
      {
        day: 2,
        title: "Historical Sites",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel", location: "Hotel" },
          { time: "9:00 AM", icon: Camera, title: "Fort San Pedro", description: "Spanish-era fortress", location: "Fort San Pedro" },
          { time: "11:00 AM", icon: Camera, title: "Yap-Sandiego House", description: "Ancestral house tour", location: "Parian District" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Traditional Cebuano food", location: "Carbon Market Area" },
          { time: "3:00 PM", icon: Package, title: "Heritage Walk", description: "Explore colonial streets", location: "Colon Street" },
        ],
      },
      {
        day: 3,
        title: "Island Adventure",
        activities: [
          { time: "6:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Packed breakfast", location: "Hotel" },
          { time: "7:00 AM", icon: Plane, title: "Island Hopping", description: "Malapascua or Bantayan Island", location: "Northern Cebu" },
          { time: "12:00 PM", icon: UtensilsCrossed, title: "Beach Lunch", description: "Fresh seafood", location: "Island" },
          { time: "5:00 PM", icon: Car, title: "Return to City", description: "Transfer back to hotel", location: "Cebu City" },
        ],
      },
      {
        day: 4,
        title: "Nature & Waterfalls",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel", location: "Hotel" },
          { time: "9:00 AM", icon: Camera, title: "Kawasan Falls", description: "Canyoneering adventure", location: "Badian" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Waterfall-side dining", location: "Kawasan" },
          { time: "4:00 PM", icon: Car, title: "Return to City", description: "Drive back to Cebu", location: "Cebu City" },
        ],
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Final breakfast", location: "Hotel" },
          { time: "9:00 AM", icon: Package, title: "Last Minute Shopping", description: "Buy pasalubong", location: "SM Seaside" },
          { time: "11:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out", location: "Hotel" },
          { time: "12:00 PM", icon: Car, title: "Airport Transfer", description: "Transfer to airport", location: "Mactan Airport" },
          { time: "2:00 PM", icon: Plane, title: "Departure", description: "Flight back home", location: "Mactan-Cebu Airport" },
        ],
      },
    ],
  };

  // Merge with itinerary details from newly created itineraries and updates
  const standardItineraryDetails: Record<number, ItineraryDay[]> = {
    ...defaultItineraryDetails,
    ...newStandardItineraries.reduce((acc, itinerary) => {
      if (itinerary.itineraryDetails) {
        acc[itinerary.id] = itinerary.itineraryDetails;
      }
      return acc;
    }, {} as Record<number, ItineraryDay[]>),
    // Apply updates from edit page
    ...Object.keys(standardItineraryUpdates).reduce((acc, id) => {
      const numId = parseInt(id);
      if (standardItineraryUpdates[numId]?.itineraryDetails) {
        acc[numId] = standardItineraryUpdates[numId].itineraryDetails;
      }
      return acc;
    }, {} as Record<number, ItineraryDay[]>)
  };

  // Requested Itinerary Bookings Data (matching the requested itineraries)
  const [requestedBookings, setRequestedBookings] = useState<RequestedItineraryBooking[]>([
    {
      id: "BV-2024-REQ-001",
      customer: "Sofia Martinez",
      email: "sofia.martinez@email.com",
      mobile: "+63 918 234 5678",
      destination: "Palawan, Puerto Princesa",
      itinerary: "Palawan 7-Day Island Hopping",
      dates: "November 15, 2024 – November 22, 2024",
      travelers: 4,
      totalAmount: "₱85,000",
      paid: "₱42,500",
      bookedDate: "2024-10-05",
      status: "in-progress",
      sentStatus: "sent",
      confirmStatus: "confirmed",
    },
    {
      id: "BV-2024-REQ-002",
      customer: "Miguel Santos",
      email: "miguel.santos@email.com",
      mobile: "+63 927 345 6789",
      destination: "Siargao, Surigao del Norte",
      itinerary: "Siargao 6-Day Surfing Adventure",
      dates: "December 1, 2024 – December 7, 2024",
      travelers: 2,
      totalAmount: "₱58,000",
      paid: "₱58,000",
      bookedDate: "2024-09-20",
      status: "completed",
      sentStatus: "sent",
      confirmStatus: "unconfirmed",
    },
    {
      id: "BV-2024-REQ-003",
      customer: "Isabella Reyes",
      email: "isabella.reyes@email.com",
      mobile: "+63 919 456 7890",
      destination: "Vigan, Ilocos Sur",
      itinerary: "Vigan 7-Day Cultural Immersion",
      dates: "October 20, 2024 – October 27, 2024",
      travelers: 3,
      totalAmount: "₱72,000",
      paid: "₱24,000",
      bookedDate: "2024-09-10",
      status: "pending",
      sentStatus: "unsent",
    },
  ]);

  // Itinerary data for requested bookings detail view
  const defaultRequestedItineraryDetails: Record<string, ItineraryDay[]> = {
    "BV-2024-REQ-001": [ // Palawan 7-Day Island Hopping
      {
        day: 1,
        title: "Arrival & City Tour",
        activities: [
          { time: "9:00 AM", icon: Plane, title: "Arrival at Puerto Princesa", description: "Meet tour coordinator", location: "Puerto Princesa Airport" },
          { time: "11:00 AM", icon: Hotel, title: "Check-in", description: "Hotel check-in", location: "City Center" },
          { time: "2:00 PM", icon: Camera, title: "City Tour", description: "Plaza Cuartel, Cathedral, Baywalk", location: "Puerto Princesa" },
          { time: "6:00 PM", icon: UtensilsCrossed, title: "Welcome Dinner", description: "Local seafood cuisine", location: "Baywalk" },
        ],
      },
      {
        day: 2,
        title: "Underground River",
        activities: [
          { time: "6:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Packed breakfast", location: "Hotel" },
          { time: "7:00 AM", icon: Car, title: "Travel to Sabang", description: "2-hour drive", location: "Sabang Wharf" },
          { time: "9:30 AM", icon: Plane, title: "Underground River Tour", description: "UNESCO World Heritage Site", location: "Puerto Princesa Underground River" },
          { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Beachside lunch", location: "Sabang Beach" },
        ],
      },
    ],
    "BV-2024-REQ-002": [ // Siargao 6-Day Surfing Adventure
      {
        day: 1,
        title: "Arrival & Beach Welcome",
        activities: [
          { time: "10:00 AM", icon: Plane, title: "Arrival at Siargao", description: "Airport pickup", location: "Sayak Airport" },
          { time: "11:30 AM", icon: Car, title: "Transfer to Resort", description: "Drive to General Luna", location: "General Luna" },
          { time: "1:00 PM", icon: Hotel, title: "Check-in", description: "Resort check-in", location: "Cloud 9 Area" },
          { time: "4:00 PM", icon: Camera, title: "Beach Orientation", description: "Explore Cloud 9 boardwalk", location: "Cloud 9" },
        ],
      },
    ],
    "BV-2024-REQ-003": [ // Vigan 7-Day Cultural Immersion
      {
        day: 1,
        title: "Heritage City Arrival",
        activities: [
          { time: "8:00 AM", icon: Car, title: "Departure from Manila", description: "Travel to Vigan", location: "Manila" },
          { time: "4:00 PM", icon: Hotel, title: "Check-in", description: "Heritage hotel check-in", location: "Calle Crisologo" },
          { time: "6:00 PM", icon: Camera, title: "Kalesa Ride", description: "Horse-drawn carriage tour", location: "Heritage Village" },
          { time: "8:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Ilocano cuisine", location: "Plaza Salcedo" },
        ],
      },
    ],
  };

  // State for requested itinerary details (combine default with new bookings)
  const [requestedItineraryDetails, setRequestedItineraryDetails] = useState<Record<string, ItineraryDay[]>>(defaultRequestedItineraryDetails);

  // Update requested itinerary details when new bookings are added or edited
  useEffect(() => {
    const newDetails: Record<string, ItineraryDay[]> = {};
    let hasNewDetails = false;

    // Add details from booking updates first
    Object.keys(requestedBookingUpdates).forEach(bookingId => {
      const booking = requestedBookingUpdates[bookingId];
      if (booking?.itineraryDetails) {
        const convertedDetails = booking.itineraryDetails.map((day: any) => ({
          ...day,
          activities: day.activities.map((activity: any) => ({
            ...activity,
            icon: typeof activity.icon === 'string' ? getIconComponent(activity.icon) : activity.icon
          }))
        }));
        
        newDetails[bookingId] = convertedDetails;
        hasNewDetails = true;
      }
    });

    requestedBookings.forEach(booking => {
      // Check if this booking has itineraryDetails and isn't already in the state
      if ((booking as any).itineraryDetails && !requestedItineraryDetails[booking.id]) {
        // Convert icon strings to components
        const convertedDetails = (booking as any).itineraryDetails.map((day: any) => ({
          ...day,
          activities: day.activities.map((activity: any) => ({
            ...activity,
            icon: typeof activity.icon === 'string' ? getIconComponent(activity.icon) : activity.icon
          }))
        }));
        
        newDetails[booking.id] = convertedDetails;
        hasNewDetails = true;
      }
    });

    // Only update state if there are new details
    if (hasNewDetails) {
      setRequestedItineraryDetails(prev => ({
        ...prev,
        ...newDetails
      }));
    }
  }, [requestedBookings, requestedBookingUpdates]);

  // Delete standard itinerary function
  const handleDeleteStandardItinerary = () => {
    if (deleteStandardConfirm !== null) {
      setDeletedItineraries(prev => [...prev, deleteStandardConfirm]);
      setDeleteStandardConfirm(null);
      
      // If the deleted itinerary was currently being viewed, go back to grid
      if (selectedStandardId === deleteStandardConfirm) {
        setSelectedStandardId(null);
        setViewMode("grid");
      }
    }
  };

  // Send to Client function - changes sentStatus from "unsent" to "sent"
  const handleSendToClient = (bookingId: string) => {
    setRequestedBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, sentStatus: "sent" as const }
          : booking
      )
    );

    toast.success("Itinerary Sent to Client!", {
      description: "The requested itinerary has been marked as sent.",
    });
  };

  // Unsend function - changes sentStatus from "sent" to "unsent"
  const handleUnsendToClient = (bookingId: string) => {
    setRequestedBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, sentStatus: "unsent" as const }
          : booking
      )
    );

    toast.success("Itinerary Marked as Unsent!", {
      description: "The requested itinerary status has been changed to unsent.",
    });
  };

  // Export functions
  const handleExportPDF = () => {
    console.log("Exporting itineraries as PDF...");
    alert("PDF export functionality would be implemented here");
  };

  const handleExportExcel = () => {
    console.log("Exporting itineraries as Excel...");
    alert("Excel export functionality would be implemented here");
  };

  // Filter and sort templates
  const getFilteredAndSortedTemplates = () => {
    // Apply category filter
    let filtered = templates.filter(t => t.category === selectedCategory);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortOrder === "newest") {
      filtered = [...filtered].sort((a, b) => b.id - a.id);
    } else if (sortOrder === "oldest") {
      filtered = [...filtered].sort((a, b) => a.id - b.id);
    }

    return filtered;
  };

  // Filter requested bookings
  const getFilteredRequestedBookings = () => {
    // Apply updates from edit page first
    const updatedBookings = requestedBookings.map(b => requestedBookingUpdates[b.id] || b);
    let filtered = updatedBookings;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.itinerary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
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

  const selectedStandard = selectedStandardId ? templates.find(t => t.id === selectedStandardId) : null;
  // Apply updates when getting selected requested booking
  const selectedRequestedBase = selectedRequestedId ? requestedBookings.find(b => b.id === selectedRequestedId) : null;
  const selectedRequested = selectedRequestedBase ? (requestedBookingUpdates[selectedRequestedBase.id] || selectedRequestedBase) : null;

  // Handle showing confirmation modal for booking
  const handleShowBookingConfirmation = () => {
    if (!selectedStandardForBooking || !bookingFormData.customerName || !bookingFormData.email || !bookingFormData.mobile || !bookingFormData.travelDateFrom || !bookingFormData.travelDateTo) {
      alert("Please fill in all required fields");
      return;
    }
    setCreateBookingConfirmOpen(true);
  };

  // Handle booking from standard itinerary
  const handleBookStandardItinerary = () => {
    if (!selectedStandardForBooking) return;

    const standard = templates.find(t => t.id === selectedStandardForBooking);
    if (!standard) return;

    // Generate new booking ID
    const newBookingId = `BK-2024-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

    // Calculate total amount
    const travelers = parseInt(bookingFormData.travelers);
    const totalAmount = standard.pricePerPax ? standard.pricePerPax * travelers : 0;

    // Get itinerary details for this standard template
    const itineraryDetails = standardItineraryDetails[standard.id] || [];

    // Create booking data
    const newBooking = {
      id: newBookingId,
      customer: bookingFormData.customerName,
      email: bookingFormData.email,
      mobile: bookingFormData.mobile,
      destination: standard.destination,
      itinerary: standard.title,
      startDate: bookingFormData.travelDateFrom,
      endDate: bookingFormData.travelDateTo,
      travelers: travelers,
      totalAmount: totalAmount,
      paid: 0,
      paymentStatus: "Unpaid",
      bookedDate: new Date().toISOString().split('T')[0],
      bookedDateObj: new Date(),
      status: "pending",
      bookingType: "Standard" as const,
      tourType: bookingFormData.tourType,
      itineraryDetails: itineraryDetails,
    };

    // Call the callback to add booking
    if (onCreateBooking) {
      onCreateBooking(newBooking);
    }

    // Reset form and close modals
    setBookingFormData({
      customerName: "",
      email: "",
      mobile: "",
      travelDateFrom: "",
      travelDateTo: "",
      travelers: "1",
      tourType: "" as any,
    });
    setCreateBookingConfirmOpen(false);
    setStandardBookingModalOpen(false);
    setSelectedStandardForBooking(null);

    toast.success("Standard Booking Created!", {
      description: `Booking ${newBookingId} for ${bookingFormData.customerName} has been successfully created.`,
    });
  };

  // Handle booking from requested itinerary
  const handleBookRequestedItinerary = () => {
    if (!selectedRequestedForBooking) return;

    const requested = requestedBookings.find(b => b.id === selectedRequestedForBooking);
    if (!requested) return;

    // Generate new booking ID
    const newBookingId = `BK-2024-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

    // Parse dates from requested itinerary (format: "November 15 - November 22, 2024")
    const datesParts = requested.dates.split(' - ');
    let startDate = '';
    let endDate = '';
    
    try {
      // Try to parse the dates - if format is "Month Day - Month Day, Year"
      const startDateParsed = new Date(datesParts[0] + ', 2024');
      const endDateParsed = new Date(datesParts[1]);
      
      if (!isNaN(startDateParsed.getTime()) && !isNaN(endDateParsed.getTime())) {
        startDate = startDateParsed.toISOString().split('T')[0];
        endDate = endDateParsed.toISOString().split('T')[0];
      } else {
        // Fallback to today + 30 days if parsing fails
        const today = new Date();
        startDate = today.toISOString().split('T')[0];
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 7);
        endDate = futureDate.toISOString().split('T')[0];
      }
    } catch (e) {
      // Fallback to today + 7 days if parsing fails
      const today = new Date();
      startDate = today.toISOString().split('T')[0];
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 7);
      endDate = futureDate.toISOString().split('T')[0];
    }

    // Create booking data
    const newBooking = {
      id: newBookingId,
      customer: requested.customer,
      email: requested.email,
      mobile: requested.mobile,
      destination: requested.destination,
      itinerary: requested.itinerary,
      startDate: startDate,
      endDate: endDate,
      travelers: requested.travelers,
      totalAmount: parseInt(requested.totalAmount.replace(/[₱,]/g, '')),
      paid: parseInt(requested.paid.replace(/[₱,]/g, '')),
      paymentStatus: requested.paid === requested.totalAmount ? "Paid" : "Partial",
      bookedDate: new Date().toISOString().split('T')[0],
      bookedDateObj: new Date(),
      status: "pending",
      bookingType: "Requested" as const,
    };

    // Call the callback to add booking
    if (onCreateBooking) {
      onCreateBooking(newBooking);
    }

    setRequestedBookingModalOpen(false);
    setSelectedRequestedForBooking(null);

    toast.success("Requested Booking Created!", {
      description: `Booking ${newBookingId} for ${requested.customer} has been successfully created from requested itinerary.`,
    });
  };

  // Render Standard Itinerary Grid View
  const renderStandardGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredTemplates.map((template) => (
        <div
          key={template.id}
          ref={(el) => (standardRefs.current[template.id] = el)}
          onClick={() => {
            setSelectedStandardId(template.id);
            setViewMode("detail");
          }}
          className="group rounded-2xl border-2 border-[#E5E7EB] overflow-hidden bg-white transition-all duration-200 hover:border-[#0A7AFF] hover:shadow-[0_8px_20px_rgba(10,122,255,0.15)] hover:-translate-y-1 cursor-pointer"
        >
          {/* Image Area */}
          <div className="h-[180px] relative overflow-hidden">
            <ImageWithFallback 
              src={template.image} 
              alt={template.destination}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="mb-2">
              <h3 className="text-lg text-[#1A2B4F] font-semibold mb-1 group-hover:text-[#0A7AFF] transition-colors">
                {template.destination}
              </h3>
            </div>

            <div className="flex items-center gap-3 mb-4">
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

            {/* Actions */}
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
                  className="flex-1 h-9 rounded-xl border border-[#14B8A6] bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:from-[#12A594] hover:to-[#0EA574] text-white flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Book This Trip
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to edit page with itinerary data (serialize icons to strings)
                    const itineraryData = {
                      ...template,
                      itineraryDetails: standardItineraryDetails[template.id] || [],
                      itineraryDays: standardItineraryDetails[template.id] || []
                    };
                    const serializedData = serializeItineraryData(itineraryData);
                    navigate(`/itinerary/edit-standard/${template.id}`, {
                      state: { itineraryData: serializedData }
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
                    setDeleteStandardConfirm(template.id);
                  }}
                  className="h-9 w-9 rounded-lg border border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.1)] flex items-center justify-center transition-all group/delete"
                >
                  <Trash2 className="w-4 h-4 text-[#64748B] group-hover/delete:text-[#FF6B6B]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render Requested Itinerary List View
  const renderRequestedListView = () => (
    <div className="space-y-4">
      {filteredRequestedBookings.map((booking) => (
        <div key={booking.id} className="relative" ref={(el) => (requestedRefs.current[booking.id] = el)}>
          <BookingListCard
            booking={{
              id: booking.id,
              customer: booking.customer,
              email: booking.email,
              mobile: booking.mobile,
              destination: booking.destination,
              dates: booking.dates,
              travelers: booking.travelers,
              total: booking.totalAmount,
              bookedDate: booking.bookedDate,
            }}
            onViewDetails={() => {
              setSelectedRequestedId(booking.id);
              setRequestedViewMode("detail");
            }}
            additionalBadges={
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  booking.sentStatus === "sent" 
                    ? "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
                    : "bg-[rgba(100,116,139,0.1)] text-[#64748B] border border-[rgba(100,116,139,0.2)]"
                }`}>
                  {booking.sentStatus === "sent" ? "Sent" : "Unsent"}
                </span>
                {booking.sentStatus === "sent" && booking.confirmStatus && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    booking.confirmStatus === "confirmed"
                      ? "bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border border-[rgba(10,122,255,0.2)]"
                      : "bg-[rgba(255,193,7,0.1)] text-[#FFC107] border border-[rgba(255,193,7,0.2)]"
                  }`}>
                    {booking.confirmStatus === "confirmed" ? "Confirmed" : "Unconfirmed"}
                  </span>
                )}
              </div>
            }
          />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {selectedCategory === "Standard" && viewMode === "detail" && selectedStandard ? (
        // Standard Itinerary Detail View
        <StandardItineraryDetailView
          itinerary={selectedStandard}
          itineraryDetails={standardItineraryDetails[selectedStandard.id] || []}
          onBack={() => setViewMode("grid")}
          onEdit={() => {
            // Navigate to edit page with itinerary data (serialize icons to strings)
            const itineraryData = {
              ...selectedStandard,
              itineraryDetails: standardItineraryDetails[selectedStandard.id] || [],
              itineraryDays: standardItineraryDetails[selectedStandard.id] || []
            };
            const serializedData = serializeItineraryData(itineraryData);
            navigate(`/itinerary/edit-standard/${selectedStandard.id}`, {
              state: { itineraryData: serializedData }
            });
          }}
          onDelete={() => {
            setDeletedItineraries(prev => [...prev, selectedStandard.id]);
            setSelectedStandardId(null);
            setViewMode("grid");
          }}
        />
      ) : selectedCategory === "Requested" && requestedViewMode === "detail" && selectedRequested ? (
        // Requested Itinerary Detail View
        <BookingDetailView
          booking={{
            id: selectedRequested.id,
            customer: selectedRequested.customer,
            email: selectedRequested.email,
            mobile: selectedRequested.mobile,
            destination: selectedRequested.destination,
            itinerary: selectedRequested.itinerary,
            dates: selectedRequested.dates,
            travelers: selectedRequested.travelers,
            total: selectedRequested.totalAmount,
            bookedDate: selectedRequested.bookedDate,
            status: selectedRequested.status,
          }}
          itinerary={requestedItineraryDetails[selectedRequested.id] || []}
          onBack={() => setRequestedViewMode("list")}
          actionButtons={
            <div className="space-y-3">
              {/* Conversation Section for Requested Bookings */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden mb-3">
                <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFB] to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#1A2B4F]">Conversation</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3 p-4 bg-accent/50 rounded-xl max-h-64 overflow-y-auto mb-4">
                    {(conversations[selectedRequested.id] || []).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      (conversations[selectedRequested.id] || []).map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] p-4 rounded-xl shadow-sm ${
                            msg.sender === "admin" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-card border border-border"
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                            <p className={`text-xs mt-2 ${msg.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={currentMessage[selectedRequested.id] || ""}
                      onChange={(e) => setCurrentMessage({ ...currentMessage, [selectedRequested.id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && currentMessage[selectedRequested.id]?.trim()) {
                          const newMsg = {
                            sender: "admin" as const,
                            message: currentMessage[selectedRequested.id].trim(),
                            time: new Date().toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }),
                          };
                          setConversations({
                            ...conversations,
                            [selectedRequested.id]: [...(conversations[selectedRequested.id] || []), newMsg],
                          });
                          setCurrentMessage({ ...currentMessage, [selectedRequested.id]: "" });
                          toast.success("Message sent!", {
                            description: "Your reply has been sent to the client."
                          });
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <button
                      onClick={() => {
                        if (currentMessage[selectedRequested.id]?.trim()) {
                          const newMsg = {
                            sender: "admin" as const,
                            message: currentMessage[selectedRequested.id].trim(),
                            time: new Date().toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }),
                          };
                          setConversations({
                            ...conversations,
                            [selectedRequested.id]: [...(conversations[selectedRequested.id] || []), newMsg],
                          });
                          setCurrentMessage({ ...currentMessage, [selectedRequested.id]: "" });
                          toast.success("Message sent!", {
                            description: "Your reply has been sent to the client."
                          });
                        }
                      }}
                      className="px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white"
                    >
                      <Send className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequested.sentStatus === "sent" && selectedRequested.confirmStatus === "confirmed" && (
                <button
                  onClick={() => {
                    setSelectedRequestedForBooking(selectedRequested.id);
                    setRequestedBookingModalOpen(true);
                  }}
                  className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:from-[#12A594] hover:to-[#0EA574] text-white flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-[#14B8A6]/20"
                >
                  <BookOpen className="w-5 h-5" />
                  Book This Trip
                </button>
              )}
              {selectedRequested.sentStatus === "unsent" && (
                <button
                  onClick={() => handleSendToClient(selectedRequested.id)}
                  className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#0EA574] hover:to-[#12A594] text-white flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-[#10B981]/20"
                >
                  <Send className="w-4 h-4" />
                  Send to Client
                </button>
              )}
              <button
                onClick={() => {
                  // Navigate to edit page with booking/itinerary data (serialize icons to strings)
                  const itineraryData = {
                    ...selectedRequested,
                    title: selectedRequested.itinerary,
                    itineraryDetails: requestedItineraryDetails[selectedRequested.id] || [],
                    itineraryDays: requestedItineraryDetails[selectedRequested.id] || [],
                    days: (requestedItineraryDetails[selectedRequested.id] || []).length,
                    category: "Beach", // Default or extract from booking data
                    pricePerPax: selectedRequested.totalAmount.replace("₱", "").replace(",", ""),
                    image: ""
                  };
                  const serializedData = serializeItineraryData(itineraryData);
                  navigate(`/itinerary/edit-requested/${selectedRequested.id}`, {
                    state: { itineraryData: serializedData }
                  });
                }}
                className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,122,255,0.35)] transition-all"
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </button>
              <button
                onClick={() => {
                  setBookingToDelete(selectedRequested);
                  setDeleteConfirmOpen(true);
                }}
                className="w-full h-11 px-4 rounded-xl bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] flex items-center justify-center gap-2 font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Booking
              </button>
            </div>
          }
          breadcrumbPage="Requested"
          isRequestedItinerary={true}
        />
      ) : (
        // List/Grid View
        <ContentCard 
          title={selectedCategory === "Standard" 
            ? `Standard Itineraries (${filteredTemplates.length})` 
            : `Requested Itineraries (${filteredRequestedBookings.length})`
          }
          action={
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="h-10 px-5 rounded-[20px] text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}
            >
              <Plus className="w-4 h-4" />
              Create New Itinerary
            </button>
          }
        >
          <SearchFilterToolbar
            searchPlaceholder={selectedCategory === "Standard" 
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

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b-2 border-[#E5E7EB]">
            <button 
              onClick={() => {
                setSelectedCategory("Standard");
                setViewMode("grid");
              }}
              className={`px-5 h-11 text-sm transition-colors ${
                selectedCategory === "Standard"
                  ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
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
                  ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
                  : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
              }`}
            >
              Requested
            </button>
          </div>

          {/* Content based on selected category */}
          {selectedCategory === "Standard" ? renderStandardGridView() : renderRequestedListView()}
        </ContentCard>
      )}

      {/* Create Itinerary Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Create New Itinerary
            </DialogTitle>
            <DialogDescription className="pb-4">
              Choose the type of itinerary you want to create or continue from a saved draft.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="px-8 py-2 space-y-4 pb-6">
              {/* Standard Itinerary Option */}
              <button 
                onClick={() => {
                  setCreateModalOpen(false);
                  navigate("/itinerary/create-standard");
                }}
                className="w-full p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white hover:bg-[rgba(10,122,255,0.02)] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A2B4F] mb-1 group-hover:text-[#0A7AFF] transition-colors">Standard Itinerary</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      Create a new pre-built template for popular destinations from scratch.
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

              {/* Requested Itinerary Option */}
              <button 
                onClick={() => {
                  setCreateModalOpen(false);
                  navigate("/itinerary/create-requested");
                }}
                className="w-full p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#14B8A6] bg-white hover:bg-[rgba(20,184,166,0.02)] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#10B981] flex items-center justify-center shadow-lg shadow-[#14B8A6]/20 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A2B4F] mb-1 group-hover:text-[#14B8A6] transition-colors">Requested Itinerary</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      Create a custom itinerary booking based on specific customer requests with detailed day-by-day plans.
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

              {/* Drafts Section */}
              {drafts && drafts.length > 0 && (
                <>
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E7EB]"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-xs text-[#64748B] bg-white font-medium">OR CONTINUE FROM DRAFT</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="relative w-full p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#FFB84D] bg-white hover:bg-[rgba(255,184,77,0.02)] transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFB84D] to-[#FF9800] flex items-center justify-center shadow-md flex-shrink-0">
                            {draft.type === "requested" ? <Package className="w-5 h-5 text-white" /> : <BookOpen className="w-5 h-5 text-white" />}
                          </div>
                          <button
                            onClick={() => {
                              setCreateModalOpen(false);
                              // Handle requested drafts differently
                              if (draft.type === "requested") {
                                if (onEditRequestedDraft) {
                                  onEditRequestedDraft(draft);
                                }
                              } else {
                                // Handle standard drafts
                                if (onEditStandardDraft) {
                                  onEditStandardDraft(draft);
                                }
                              }
                            }}
                            className="flex-1 min-w-0 text-left"
                          >
                            <h4 className="text-sm font-semibold text-[#1A2B4F] mb-1 truncate group-hover:text-[#FFB84D] transition-colors">
                              {draft.type === "requested" ? draft.customerName : draft.title}
                            </h4>
                            <p className="text-xs text-[#64748B] mb-2 truncate">{draft.destination || "No destination set"}</p>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-xs bg-[rgba(255,184,77,0.1)] text-[#FFB84D] border border-[rgba(255,184,77,0.2)]">
                                {draft.type === "requested" ? "Requested Draft" : "Standard Draft"}
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
                            className="flex-shrink-0 w-8 h-8 rounded-lg border border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.1)] flex items-center justify-center transition-all group/delete"
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

      {/* Standard Itinerary Booking Modal */}
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
              <Label htmlFor="customerName" className="text-[#1A2B4F] mb-2 block">
                Customer Name <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="customerName"
                value={bookingFormData.customerName}
                onChange={(e) => setBookingFormData({ ...bookingFormData, customerName: e.target.value })}
                placeholder="Enter customer name"
                className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-[#1A2B4F] mb-2 block">
                Email Address <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={bookingFormData.email}
                onChange={(e) => setBookingFormData({ ...bookingFormData, email: e.target.value })}
                placeholder="customer@email.com"
                className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
              />
            </div>
            <div>
              <Label htmlFor="mobile" className="text-[#1A2B4F] mb-2 block">
                Mobile Number <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={bookingFormData.mobile}
                onChange={(e) => setBookingFormData({ ...bookingFormData, mobile: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
                className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="travelDateFrom" className="text-[#1A2B4F] mb-2 block">
                  Travel Start Date <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="travelDateFrom"
                  type="date"
                  value={bookingFormData.travelDateFrom}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, travelDateFrom: e.target.value })}
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
              <div>
                <Label htmlFor="travelDateTo" className="text-[#1A2B4F] mb-2 block">
                  Travel End Date <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="travelDateTo"
                  type="date"
                  value={bookingFormData.travelDateTo}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, travelDateTo: e.target.value })}
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tourType" className="text-[#1A2B4F] mb-2 block">
                Tour Type <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Select
                value={bookingFormData.tourType}
                onValueChange={(value: "Joiner" | "Private") => setBookingFormData({ ...bookingFormData, tourType: value })}
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
                onChange={(e) => setBookingFormData({ ...bookingFormData, travelers: e.target.value })}
                className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
              />
            </div>
            {selectedStandardForBooking && templates.find(t => t.id === selectedStandardForBooking)?.pricePerPax && (
              <div className="pt-4 border-t border-[rgba(20,184,166,0.3)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#64748B]">Price per Pax:</span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    ₱{templates.find(t => t.id === selectedStandardForBooking)!.pricePerPax!.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#64748B]">Number of Travelers:</span>
                  <span className="text-sm font-medium text-[#1A2B4F]">
                    {bookingFormData.travelers || 1}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(20,184,166,0.3)]">
                  <span className="font-semibold text-[#1A2B4F]">Total:</span>
                  <span className="font-semibold text-[#14B8A6]">
                    ₱{(templates.find(t => t.id === selectedStandardForBooking)!.pricePerPax! * parseInt(bookingFormData.travelers || '1')).toLocaleString()}
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
            email: "",
            mobile: "",
            travelDateFrom: "",
            travelDateTo: "",
            travelers: "1",
            tourType: "" as any,
          });
        }}
        confirmText="Create Booking"
        cancelText="Cancel"
        confirmVariant="success"
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
              <span className="text-sm font-medium text-[#1A2B4F]">{bookingFormData.customerName}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Email:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">{bookingFormData.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Mobile:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">{bookingFormData.mobile}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Travel Dates:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">
                {bookingFormData.travelDateFrom} to {bookingFormData.travelDateTo}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Tour Type:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">{bookingFormData.tourType}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#64748B]">Travelers:</span>
              <span className="text-sm font-medium text-[#1A2B4F]">{bookingFormData.travelers}</span>
            </div>
            {selectedStandardForBooking && templates.find(t => t.id === selectedStandardForBooking)?.pricePerPax && (
              <div className="flex items-center justify-between py-2 pt-3 border-t border-[rgba(20,184,166,0.3)]">
                <span className="font-semibold text-[#1A2B4F]">Total Amount:</span>
                <span className="font-semibold text-[#14B8A6]">
                  ₱{(templates.find(t => t.id === selectedStandardForBooking)!.pricePerPax! * parseInt(bookingFormData.travelers || '1')).toLocaleString()}
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

      {/* Edit Requested Booking Modal */}
      <ConfirmationModal
        open={editRequestedModalOpen}
        onOpenChange={setEditRequestedModalOpen}
        title="Edit Requested Booking"
        description="Update the details of this requested booking."
        icon={<Edit className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(10,122,255,0.2)]"
        content={
          requestedToEdit && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-req-customer" className="text-[#1A2B4F] mb-2 block">
                  Customer Name <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="edit-req-customer"
                  value={editRequestedFormData.customerName}
                  onChange={(e) => setEditRequestedFormData({ ...editRequestedFormData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
              <div>
                <Label htmlFor="edit-req-email" className="text-[#1A2B4F] mb-2 block">
                  Email Address <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="edit-req-email"
                  type="email"
                  value={editRequestedFormData.email}
                  onChange={(e) => setEditRequestedFormData({ ...editRequestedFormData, email: e.target.value })}
                  placeholder="customer@email.com"
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
              <div>
                <Label htmlFor="edit-req-mobile" className="text-[#1A2B4F] mb-2 block">
                  Mobile Number <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="edit-req-mobile"
                  type="tel"
                  value={editRequestedFormData.mobile}
                  onChange={(e) => setEditRequestedFormData({ ...editRequestedFormData, mobile: e.target.value })}
                  placeholder="+63 9XX XXX XXXX"
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
              <div>
                <Label htmlFor="edit-req-travelers" className="text-[#1A2B4F] mb-2 block">
                  Number of Travelers <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="edit-req-travelers"
                  type="number"
                  min="1"
                  value={editRequestedFormData.travelers}
                  onChange={(e) => setEditRequestedFormData({ ...editRequestedFormData, travelers: e.target.value })}
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
            </div>
          )
        }
        onConfirm={() => {
          if (!requestedToEdit || !editRequestedFormData.customerName || !editRequestedFormData.email || !editRequestedFormData.mobile) {
            alert("Please fill in all required fields");
            return;
          }

          const updatedBookings = requestedBookings.map(b => {
            if (b.id === requestedToEdit.id) {
              return {
                ...b,
                customer: editRequestedFormData.customerName,
                email: editRequestedFormData.email,
                mobile: editRequestedFormData.mobile,
                travelers: parseInt(editRequestedFormData.travelers),
              };
            }
            return b;
          });

          setRequestedBookings(updatedBookings);
          setEditRequestedModalOpen(false);
          setRequestedToEdit(null);
          setEditRequestedFormData({
            customerName: "",
            email: "",
            mobile: "",
            travelDateFrom: "",
            travelDateTo: "",
            travelers: "1",
          });
          alert("Requested booking updated successfully!");
        }}
        onCancel={() => {
          setEditRequestedModalOpen(false);
          setRequestedToEdit(null);
          setEditRequestedFormData({
            customerName: "",
            email: "",
            mobile: "",
            travelDateFrom: "",
            travelDateTo: "",
            travelers: "1",
          });
        }}
        confirmText="Save Changes"
        cancelText="Cancel"
        confirmVariant="default"
      />

      {/* Requested Itinerary Booking Modal */}
      <ConfirmationModal
        open={requestedBookingModalOpen}
        onOpenChange={setRequestedBookingModalOpen}
        title="Book Requested Itinerary"
        description="Are you sure you want to create a booking from this confirmed requested itinerary?"
        icon={<BookOpen className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(10,122,255,0.2)]"
        content={
          selectedRequestedForBooking && selectedRequested ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Customer:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">{selectedRequested.customer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Itinerary:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">{selectedRequested.itinerary}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Destination:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">{selectedRequested.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Travel Dates:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">{selectedRequested.dates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Travelers:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">{selectedRequested.travelers}</span>
              </div>
              <div className="pt-3 border-t border-[rgba(10,122,255,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Total Amount:</span>
                  <span className="font-semibold text-[#0A7AFF]">{selectedRequested.totalAmount}</span>
                </div>
              </div>
            </div>
          ) : null
        }
        onConfirm={handleBookRequestedItinerary}
        onCancel={() => {
          setRequestedBookingModalOpen(false);
          setSelectedRequestedForBooking(null);
        }}
        confirmText="Create Booking"
        cancelText="Cancel"
        confirmVariant="success"
      />

      {/* Delete Standard Itinerary Confirmation Modal */}
      <ConfirmationModal
        open={deleteStandardConfirm !== null}
        onOpenChange={(open) => !open && setDeleteStandardConfirm(null)}
        title="Delete Standard Itinerary"
        description="Are you sure you want to delete this standard itinerary? This action cannot be undone."
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
        iconShadow="shadow-[#FF6B6B]/30"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          deleteStandardConfirm !== null ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-[#64748B]">Itinerary:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">
                  {templates.find(t => t.id === deleteStandardConfirm)?.destination || "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-[#64748B]">Destination:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">
                  {templates.find(t => t.id === deleteStandardConfirm)?.destination || "Unknown"}
                </span>
              </div>
              <p className="text-xs text-[#64748B] pt-2">
                This will permanently remove the itinerary from your list.
              </p>
            </div>
          ) : null
        }
        onConfirm={handleDeleteStandardItinerary}
        onCancel={() => setDeleteStandardConfirm(null)}
        confirmText="Delete Itinerary"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      
      {/* Delete Requested Booking Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmOpen(false);
            setBookingToDelete(null);
          }
        }}
        title="Delete Requested Booking"
        description="Are you sure you want to delete this requested booking? This action cannot be undone."
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
        iconShadow="shadow-[#FF6B6B]/30"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          bookingToDelete ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-[#64748B]">Customer:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">
                  {bookingToDelete.customer}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-[#64748B]">Itinerary:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">
                  {bookingToDelete.itinerary}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-[#64748B]">Destination:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">
                  {bookingToDelete.destination}
                </span>
              </div>
              <p className="text-xs text-[#64748B] pt-2">
                This will permanently remove the requested booking from your list.
              </p>
            </div>
          ) : null
        }
        onConfirm={() => {
          if (bookingToDelete) {
            setRequestedBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
            setRequestedViewMode("list");
          }
          setDeleteConfirmOpen(false);
          setBookingToDelete(null);
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setBookingToDelete(null);
        }}
        confirmText="Delete Booking"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* Delete Draft Confirmation Modal */}
      <ConfirmationModal
        open={deleteDraftConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDraftConfirmOpen(false);
            setDraftToDelete(null);
          }
        }}
        title="Delete Draft"
        description="Are you sure you want to delete this draft? This action cannot be undone."
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
        iconShadow="shadow-[#FF6B6B]/30"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          draftToDelete ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-[#64748B]">Title:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">
                  {draftToDelete.type === "requested" ? draftToDelete.customerName : draftToDelete.title}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-[#64748B]">Type:</span>
                <span className="text-sm font-medium text-[#1A2B4F]">
                  {draftToDelete.type === "requested" ? "Requested Draft" : "Standard Draft"}
                </span>
              </div>
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
          ) : null
        }
        onConfirm={() => {
          if (draftToDelete && onDeleteDraft) {
            onDeleteDraft(draftToDelete.id);
            toast.success("Draft deleted successfully!");
          }
          setDeleteDraftConfirmOpen(false);
          setDraftToDelete(null);
        }}
        onCancel={() => {
          setDeleteDraftConfirmOpen(false);
          setDraftToDelete(null);
        }}
        confirmText="Delete Draft"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
}