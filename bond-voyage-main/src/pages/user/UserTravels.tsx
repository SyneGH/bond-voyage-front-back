import { useState, useEffect, useRef } from "react";
import {
  Plus,
  MapPin,
  Sparkles,
  Users,
  Calendar,
  CheckCircle,
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Car,
  Trash2,
  Edit,
  BookOpen,
  Send,
  Share2,
  QrCode,
  Download,
  Upload,
  X,
  Copy,
  Type,
  AlertTriangle,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ContentCard } from "../../components/ContentCard";
import { BookingListCard } from "../../components/BookingListCard";
import { BookingDetailView } from "../../components/BookingDetailView";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useBreadcrumbs } from "../../components/BreadcrumbContext";
import { useBookings } from "../../components/BookingContext";
import { toast } from "sonner@2.0.3";
import { FAQAssistant } from "../../components/FAQAssistant";

interface TravelPlan {
  id: string;
  destination: string;
  dates: string;
  travelers: number;
  budget: string;
  status: "in-progress" | "pending" | "rejected";
  bookingType: "Standard" | "Customized";
  ownership: "owned" | "collaborated" | "requested";
  owner: string;
  collaborators: string[];
  createdOn: string;
  rejectionReason?: string;
  rejectionResolution?: string;
  resolutionStatus?: "resolved" | "unresolved";
  confirmationStatus?: "unconfirmed" | "confirmed";
}

export function UserTravels() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbs();
  const { userTravels, updateUserTravel, moveUserTravelToPending, deleteUserTravel } = useBookings();
  const bookingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedTab, setSelectedTab] = useState<
    "in-progress" | "pending" | "rejected"
  >("in-progress");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "owned" | "collaborated" | "requested"
  >("all");
  const [requestedSubTab, setRequestedSubTab] = useState<"all" | "confirmed" | "unconfirmed">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinTravelModal, setShowJoinTravelModal] = useState(false);
  const [joinTravelId, setJoinTravelId] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showBookConfirmModal, setShowBookConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showConfirmBookingModal, setShowConfirmBookingModal] = useState(false);
  const [showConfirmStatusModal, setShowConfirmStatusModal] = useState(false);
  const [showShareQRModal, setShowShareQRModal] = useState(false);
  const [shareQRBookingId, setShareQRBookingId] = useState<string | null>(null);
  const [joinMethod, setJoinMethod] = useState<"manual" | "scan" | "upload">("manual");
  const [scannedQRData, setScannedQRData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Current logged in user (Maria Santos)
  const currentUser = "Maria Santos";

  // Conversation state for requested bookings
  const [conversations, setConversations] = useState<Record<string, Array<{ sender: "user" | "admin"; message: string; time: string }>>>({
    "BV-2025-005": [
      { sender: "user", message: "Hello! I would like to request this custom itinerary for my upcoming trip.", time: "Nov 6, 2024, 10:00 AM" },
      { sender: "admin", message: "Thank you for your request! We're reviewing your itinerary details and will get back to you shortly.", time: "Nov 6, 2024, 2:30 PM" },
    ],
    "BV-2025-006": [
      { sender: "user", message: "I'm excited about this Boracay beach getaway!", time: "Nov 5, 2024, 9:00 AM" },
      { sender: "admin", message: "Great! We've prepared a wonderful itinerary for you. Please review and confirm.", time: "Nov 5, 2024, 11:00 AM" },
    ],
    "BV-2025-007": [
      { sender: "user", message: "Can you help me with the Vigan heritage tour arrangements?", time: "Nov 4, 2024, 8:00 AM" },
    ],
  });
  const [currentMessage, setCurrentMessage] = useState<Record<string, string>>({});

  // Mock data for different statuses - converted to state
  const [mockTravels, setMockTravels] = useState<TravelPlan[]>([
    {
      id: "BV-2025-001",
      destination: "Coron, Palawan",
      dates: "February 10, 2025 – February 15, 2025",
      travelers: 3,
      budget: "₱45,000",
      status: "in-progress",
      bookingType: "Customized",
      ownership: "owned",
      owner: "Maria Santos",
      collaborators: ["Juan Dela Cruz", "Ana Reyes"],
      createdOn: "October 15, 2024",
    },
    {
      id: "BV-2025-002",
      destination: "Cebu City Tour",
      dates: "March 20, 2025 – March 23, 2025",
      travelers: 2,
      budget: "₱32,000",
      status: "pending",
      bookingType: "Standard",
      ownership: "collaborated",
      owner: "Carlos Mendoza",
      collaborators: ["Maria Santos"],
      createdOn: "October 28, 2024",
    },
    {
      id: "BV-2025-003",
      destination: "Batanes Adventure",
      dates: "January 15, 2025 – January 20, 2025",
      travelers: 4,
      budget: "₱68,000",
      status: "rejected",
      bookingType: "Customized",
      ownership: "owned",
      owner: "Maria Santos",
      collaborators: ["Sofia Ramos", "Gabriel Torres", "Isabella Garcia"],
      createdOn: "September 10, 2024",
      rejectionReason: "Incomplete travel documentation submitted. Missing valid IDs for 2 travelers.",
      rejectionResolution: "Please upload clear copies of valid government IDs for all travelers and resubmit the booking.",
      resolutionStatus: "unresolved",
    },
    {
      id: "BV-2025-004",
      destination: "Siargao Surfing",
      dates: "April 5, 2025 – April 10, 2025",
      travelers: 5,
      budget: "₱55,000",
      status: "in-progress",
      bookingType: "Standard",
      ownership: "collaborated",
      owner: "Miguel Fernandez",
      collaborators: ["Maria Santos", "Juan Dela Cruz", "Ana Reyes", "Sofia Ramos"],
      createdOn: "November 1, 2024",
    },
    {
      id: "BV-2025-005",
      destination: "Banaue Rice Terraces",
      dates: "May 15, 2025 – May 19, 2025",
      travelers: 3,
      budget: "₱42,000",
      status: "in-progress",
      bookingType: "Standard",
      ownership: "requested",
      owner: "Admin BondVoyage",
      collaborators: ["Maria Santos"],
      createdOn: "November 6, 2024",
      confirmationStatus: "unconfirmed",
    },
    {
      id: "BV-2025-006",
      destination: "Boracay Beach Getaway",
      dates: "June 12, 2025 – June 17, 2025",
      travelers: 4,
      budget: "₱58,000",
      status: "in-progress",
      bookingType: "Standard",
      ownership: "requested",
      owner: "Admin BondVoyage",
      collaborators: ["Maria Santos", "Juan Dela Cruz"],
      createdOn: "November 5, 2024",
      confirmationStatus: "confirmed",
    },
    {
      id: "BV-2025-007",
      destination: "Vigan Heritage Tour",
      dates: "July 8, 2025 – July 12, 2025",
      travelers: 2,
      budget: "₱35,000",
      status: "in-progress",
      bookingType: "Customized",
      ownership: "requested",
      owner: "Admin BondVoyage",
      collaborators: ["Maria Santos"],
      createdOn: "November 4, 2024",
      confirmationStatus: "unconfirmed",
    },
  ]);

  // Merge context travels with mock travels
  const contextTravelsConverted: TravelPlan[] = userTravels.map(travel => {
    // Parse dates carefully to avoid timezone offset issues
    const startDate = new Date(travel.startDate + 'T12:00:00');
    const endDate = new Date(travel.endDate + 'T12:00:00');
    const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    
    return {
      id: travel.id,
      destination: travel.destination,
      dates: dateRange,
      travelers: travel.travelers,
      budget: travel.budget,
      status: travel.status,
      bookingType: travel.bookingType,
      ownership: travel.ownership,
      owner: travel.owner,
      collaborators: travel.collaborators,
      createdOn: travel.createdOn,
      rejectionReason: travel.rejectionReason,
      rejectionResolution: travel.rejectionResolution,
      resolutionStatus: travel.resolutionStatus,
    };
  });

  // Combine and sort by creation date (newest first)
  const travels = [...contextTravelsConverted, ...mockTravels].sort((a, b) => {
    return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
  });

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBookingId(null);
  };

  const handleStartNewTravel = () => {
    setShowCreateModal(false);
    navigate("/user/create-new-travel");
  };

  const handleJoinExisting = () => {
    setShowCreateModal(false);
    setShowJoinTravelModal(true);
  };

  const handleConfirmJoinTravel = () => {
    const trimmedId = joinTravelId.trim();
    if (!trimmedId) {
      toast.error("Please enter a booking ID");
      return;
    }

    // Check if booking exists in either mockTravels or userTravels
    const existingBooking = travels.find(t => t.id === trimmedId);
    
    if (!existingBooking) {
      toast.error("Booking Not Found", {
        description: `No booking found with ID: ${trimmedId}`
      });
      return;
    }

    // Check if user is already a collaborator or owner
    if (existingBooking.owner === currentUser) {
      toast.error("You Already Own This Booking", {
        description: "You cannot join your own booking as a collaborator"
      });
      return;
    }

    if (existingBooking.collaborators.includes(currentUser)) {
      toast.error("Already a Collaborator", {
        description: "You are already a collaborator on this booking"
      });
      return;
    }

    // Add current user as collaborator
    if (mockTravels.find(t => t.id === trimmedId)) {
      // Update in mock data
      setMockTravels(prev => prev.map(travel => 
        travel.id === trimmedId 
          ? { ...travel, collaborators: [...travel.collaborators, currentUser] }
          : travel
      ));
    } else {
      // Update in context
      const travelInContext = userTravels.find(t => t.id === trimmedId);
      if (travelInContext) {
        updateUserTravel(trimmedId, {
          ...travelInContext,
          collaborators: [...travelInContext.collaborators, currentUser]
        });
      }
    }

    toast.success("Successfully Joined!", {
      description: `You are now a collaborator on booking ${trimmedId}`
    });

    setShowJoinTravelModal(false);
    setJoinTravelId("");
  };

  const handleBookFromStandard = () => {
    setShowCreateModal(false);
    navigate("/user/standard-itinerary");
  };

  const [travelResolutionStatus, setTravelResolutionStatus] = useState<Record<string, "resolved" | "unresolved">>({
    "BV-2025-003": "unresolved",
  });

  // Itinerary data for detailed view (converted to state)
  const [itineraryData, setItineraryData] = useState<Record<string, any[]>>({
    "BV-2025-001": [
      {
        day: 1,
        title: "Arrival & Beach Exploration",
        activities: [
          {
            time: "10:00 AM",
            icon: Plane,
            title: "Arrival at Busuanga Airport",
            description: "Meet and greet with tour guide",
            location: "Busuanga Airport",
          },
          {
            time: "12:00 PM",
            icon: Car,
            title: "Transfer to Coron Town",
            description: "Scenic drive to hotel",
            location: "Coron",
          },
          {
            time: "2:00 PM",
            icon: Hotel,
            title: "Check-in at Resort",
            description: "Settle in at waterfront resort",
            location: "Coron Bay",
          },
          {
            time: "6:00 PM",
            icon: Camera,
            title: "Sunset at Mt. Tapyas Viewpoint",
            description: "Panoramic view of Coron Bay",
            location: "Mt. Tapyas",
          },
          {
            time: "8:00 PM",
            icon: UtensilsCrossed,
            title: "Welcome Dinner",
            description: "Fresh seafood at local restaurant",
            location: "Coron Town",
          },
        ],
      },
      {
        day: 2,
        title: "Island Hopping Adventure",
        activities: [
          {
            time: "7:00 AM",
            icon: UtensilsCrossed,
            title: "Breakfast",
            description: "Breakfast at hotel",
            location: "Resort",
          },
          {
            time: "9:00 AM",
            icon: Plane,
            title: "Island Hopping Tour",
            description: "Visit Kayangan Lake, Twin Lagoon, CYC Beach",
            location: "Various Islands",
          },
          {
            time: "1:00 PM",
            icon: UtensilsCrossed,
            title: "Beachside Lunch",
            description: "BBQ lunch and swimming",
            location: "CYC Beach",
          },
        ],
      },
    ],
    "BV-2025-002": [
      {
        day: 1,
        title: "Cebu City Heritage Tour",
        activities: [
          {
            time: "9:00 AM",
            icon: Camera,
            title: "Magellan's Cross & Basilica",
            description: "Visit historical landmarks",
            location: "Downtown Cebu",
          },
          {
            time: "12:00 PM",
            icon: UtensilsCrossed,
            title: "Lunch",
            description: "Try lechon and local delicacies",
            location: "Zubuchon",
          },
          {
            time: "2:00 PM",
            icon: Camera,
            title: "Fort San Pedro",
            description: "Explore oldest fort",
            location: "Cebu City",
          },
        ],
      },
    ],
    "BV-2025-005": [
      {
        day: 1,
        title: "Journey to Banaue",
        activities: [
          {
            time: "5:00 AM",
            icon: Car,
            title: "Depart from Manila",
            description: "Scenic bus ride to Banaue",
            location: "Manila",
          },
          {
            time: "12:00 PM",
            icon: UtensilsCrossed,
            title: "Lunch Stop",
            description: "Local restaurant along the way",
            location: "Nueva Vizcaya",
          },
          {
            time: "4:00 PM",
            icon: Hotel,
            title: "Arrival & Check-in",
            description: "Check-in at mountain lodge",
            location: "Banaue",
          },
          {
            time: "6:00 PM",
            icon: Camera,
            title: "Sunset at Viewpoint",
            description: "First glimpse of the rice terraces",
            location: "Banaue Viewpoint",
          },
        ],
      },
      {
        day: 2,
        title: "Rice Terraces Exploration",
        activities: [
          {
            time: "7:00 AM",
            icon: UtensilsCrossed,
            title: "Breakfast",
            description: "Traditional Filipino breakfast",
            location: "Lodge",
          },
          {
            time: "8:30 AM",
            icon: Camera,
            title: "Banaue Rice Terraces Tour",
            description: "UNESCO World Heritage Site exploration",
            location: "Banaue Rice Terraces",
          },
          {
            time: "12:00 PM",
            icon: UtensilsCrossed,
            title: "Local Lunch",
            description: "Authentic Ifugao cuisine",
            location: "Native Restaurant",
          },
          {
            time: "2:00 PM",
            icon: Camera,
            title: "Batad Rice Terraces",
            description: "Hike to the amphitheater-shaped terraces",
            location: "Batad",
          },
          {
            time: "6:00 PM",
            icon: UtensilsCrossed,
            title: "Dinner",
            description: "Traditional mountain cuisine",
            location: "Banaue Town",
          },
        ],
      },
      {
        day: 3,
        title: "Cultural Immersion",
        activities: [
          {
            time: "8:00 AM",
            icon: Camera,
            title: "Village Visit",
            description: "Meet local Ifugao community",
            location: "Bangaan Village",
          },
          {
            time: "11:00 AM",
            icon: Camera,
            title: "Weaving Demonstration",
            description: "Traditional cloth weaving",
            location: "Cultural Center",
          },
          {
            time: "1:00 PM",
            icon: UtensilsCrossed,
            title: "Lunch",
            description: "Farm-to-table meal",
            location: "Local Home",
          },
          {
            time: "3:00 PM",
            icon: Camera,
            title: "Hapao Rice Terraces",
            description: "Another stunning terrace formation",
            location: "Hungduan",
          },
        ],
      },
      {
        day: 4,
        title: "Adventure Day",
        activities: [
          {
            time: "6:00 AM",
            icon: Camera,
            title: "Sunrise Viewpoint",
            description: "Golden hour photography",
            location: "Banaue Viewpoint",
          },
          {
            time: "9:00 AM",
            icon: Camera,
            title: "Tappiyah Falls Trek",
            description: "Hike to hidden waterfall",
            location: "Batad",
          },
          {
            time: "12:30 PM",
            icon: UtensilsCrossed,
            title: "Picnic Lunch",
            description: "Packed meal by the falls",
            location: "Tappiyah Falls",
          },
          {
            time: "4:00 PM",
            icon: Camera,
            title: "Museum Visit",
            description: "Learn about Ifugao heritage",
            location: "Banaue Museum",
          },
          {
            time: "7:00 PM",
            icon: UtensilsCrossed,
            title: "Farewell Dinner",
            description: "Special mountain feast",
            location: "Lodge Restaurant",
          },
        ],
      },
      {
        day: 5,
        title: "Return Journey",
        activities: [
          {
            time: "7:00 AM",
            icon: UtensilsCrossed,
            title: "Breakfast",
            description: "Last mountain breakfast",
            location: "Lodge",
          },
          {
            time: "9:00 AM",
            icon: Camera,
            title: "Final Viewpoint Visit",
            description: "Last photos and goodbye",
            location: "Banaue Viewpoint",
          },
          {
            time: "11:00 AM",
            icon: Car,
            title: "Departure to Manila",
            description: "Bus ride back to Manila",
            location: "Banaue",
          },
          {
            time: "7:00 PM",
            icon: Plane,
            title: "Arrival in Manila",
            description: "End of journey",
            location: "Manila",
          },
        ],
      },
    ],
    "BV-2025-006": [
      {
        day: 1,
        title: "Arrival at Boracay",
        activities: [
          {
            time: "8:00 AM",
            icon: Plane,
            title: "Arrival at Caticlan Airport",
            description: "Meet and greet with tour coordinator",
            location: "Caticlan Airport",
          },
          {
            time: "9:00 AM",
            icon: Car,
            title: "Ferry to Boracay",
            description: "Short boat ride to the island",
            location: "Caticlan Jetty Port",
          },
          {
            time: "10:00 AM",
            icon: Hotel,
            title: "Check-in at Beachfront Resort",
            description: "Settle in at White Beach resort",
            location: "Station 2, White Beach",
          },
          {
            time: "12:00 PM",
            icon: UtensilsCrossed,
            title: "Welcome Lunch",
            description: "Fresh seafood and Filipino dishes",
            location: "D'Talipapa Seafood Market",
          },
          {
            time: "2:00 PM",
            icon: Camera,
            title: "Beach Exploration",
            description: "Walk along famous White Beach",
            location: "White Beach",
          },
          {
            time: "5:00 PM",
            icon: Camera,
            title: "Sunset at White Beach",
            description: "Witness the iconic Boracay sunset",
            location: "Station 1, White Beach",
          },
          {
            time: "7:00 PM",
            icon: UtensilsCrossed,
            title: "Dinner",
            description: "Beachfront dining experience",
            location: "D'Mall Area",
          },
        ],
      },
      {
        day: 2,
        title: "Island Hopping & Water Activities",
        activities: [
          {
            time: "7:00 AM",
            icon: UtensilsCrossed,
            title: "Breakfast",
            description: "Breakfast buffet at resort",
            location: "Resort Restaurant",
          },
          {
            time: "9:00 AM",
            icon: Plane,
            title: "Island Hopping Tour",
            description: "Visit Crystal Cove, Crocodile Island, Puka Beach",
            location: "Various Islands",
          },
          {
            time: "12:00 PM",
            icon: UtensilsCrossed,
            title: "Lunch on the Boat",
            description: "Grilled seafood and tropical fruits",
            location: "Private Island",
          },
          {
            time: "2:00 PM",
            icon: Camera,
            title: "Snorkeling & Swimming",
            description: "Explore coral reefs and marine life",
            location: "Crocodile Island",
          },
          {
            time: "5:00 PM",
            icon: Hotel,
            title: "Return to Resort",
            description: "Rest and refresh",
            location: "Resort",
          },
          {
            time: "7:00 PM",
            icon: UtensilsCrossed,
            title: "Dinner",
            description: "Casual beachfront dining",
            location: "White Beach",
          },
        ],
      },
    ],
    "BV-2025-007": [
      {
        day: 1,
        title: "Journey to Vigan",
        activities: [
          {
            time: "6:00 AM",
            icon: Car,
            title: "Depart from Manila",
            description: "Comfortable bus ride to Vigan",
            location: "Manila",
          },
          {
            time: "11:00 AM",
            icon: UtensilsCrossed,
            title: "Lunch Stop",
            description: "Traditional Ilocano lunch",
            location: "Tarlac",
          },
          {
            time: "2:00 PM",
            icon: Hotel,
            title: "Arrival & Check-in",
            description: "Check-in at heritage hotel",
            location: "Calle Crisologo, Vigan",
          },
          {
            time: "4:00 PM",
            icon: Camera,
            title: "Calle Crisologo Walk",
            description: "Explore the iconic cobblestone street",
            location: "Calle Crisologo",
          },
          {
            time: "6:00 PM",
            icon: Camera,
            title: "Plaza Salcedo Fountain Show",
            description: "Musical dancing fountain display",
            location: "Plaza Salcedo",
          },
          {
            time: "7:30 PM",
            icon: UtensilsCrossed,
            title: "Welcome Dinner",
            description: "Vigan empanada and longganisa",
            location: "Plaza Burgos Food Park",
          },
        ],
      },
    ],
  });

  // Handle navigation from SmartTrip or EditCustomizedBooking with scroll-to functionality
  useEffect(() => {
    if (location.state?.scrollToId) {
      const { scrollToId, tab, activeTab, mockDataUpdate } = location.state;
      
      // Handle mock data updates from EditCustomizedBooking
      if (mockDataUpdate) {
        setMockTravels(prev => prev.map(travel => {
          if (travel.id === mockDataUpdate.id) {
            return {
              ...travel,
              destination: mockDataUpdate.destination,
              dates: mockDataUpdate.dates,
              travelers: mockDataUpdate.travelers,
              budget: mockDataUpdate.budget,
            };
          }
          return travel;
        }));
        
        // Update itinerary data if provided
        if (mockDataUpdate.itinerary) {
          setItineraryData(prev => ({
            ...prev,
            [mockDataUpdate.id]: mockDataUpdate.itinerary
          }));
        }
      }
      
      // Set the correct tab - support both 'tab' and 'activeTab' parameters
      const targetTab = tab || activeTab;
      if (targetTab) {
        setSelectedTab(targetTab);
      }
      
      // Clear the location state
      navigate(location.pathname, { replace: true, state: {} });
      
      // Scroll to the booking after a short delay to ensure rendering
      setTimeout(() => {
        const element = bookingRefs.current[scrollToId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          element.style.animation = 'highlight 2s ease-in-out';
        }
      }, 300);
    }
  }, [location.state, navigate, location.pathname]);

  // Update breadcrumbs based on view mode
  useEffect(() => {
    if (viewMode === "detail" && selectedBookingId) {
      const tabLabel = 
        selectedTab === "in-progress" ? "In Progress" :
        selectedTab === "pending" ? "Pending" :
        "Rejected";
      
      setBreadcrumbs([
        { label: "Home", path: "/user/home" },
        { label: "Travels", path: "/user/travels" },
        { label: tabLabel },
        { label: `Booking ${selectedBookingId}` }
      ]);
    } else {
      resetBreadcrumbs();
    }
  }, [viewMode, selectedBookingId, selectedTab, setBreadcrumbs, resetBreadcrumbs]);

  const handleMarkAsResolved = (id: string) => {
    setTravelResolutionStatus(prev => ({
      ...prev,
      [id]: "resolved"
    }));
  };

  const handleMarkAsUnresolved = (id: string) => {
    setTravelResolutionStatus(prev => ({
      ...prev,
      [id]: "unresolved"
    }));
  };

  const handleBookThisTrip = () => {
    setShowBookConfirmModal(true);
  };

  const handleConfirmBooking = () => {
    if (selectedBookingId) {
      // Move to pending and add to admin approvals
      moveUserTravelToPending(selectedBookingId);
      
      toast.success("Booking Submitted!", {
        description: "Your booking request has been sent for approval."
      });
      setShowBookConfirmModal(false);
      setViewMode("list");
      setSelectedBookingId(null);
      
      // Switch to pending tab to show the moved booking
      setSelectedTab("pending");
    }
  };

  const handleEditBooking = () => {
    const selectedBooking = travels.find((t) => t.id === selectedBookingId);
    if (!selectedBooking) {
      toast.error("Booking not found");
      return;
    }
    
    // Get itinerary - check if it's from context first (has itinerary property), otherwise use mock data
    const travelInContext = userTravels.find(t => t.id === selectedBookingId);
    const rawItinerary = travelInContext?.itinerary || itineraryData[selectedBookingId] || [];
    
    // Convert icon components to string names for serialization
    const serializableItinerary = rawItinerary.map((day: any) => ({
      ...day,
      activities: day.activities.map((activity: any) => {
        // Get the icon name from the component
        let iconName = "Clock";
        if (activity.icon) {
          // If it's already a string, use it
          if (typeof activity.icon === "string") {
            iconName = activity.icon;
          } else if (activity.icon.name) {
            // If it's a component, get its name
            iconName = activity.icon.name;
          } else if (activity.icon.displayName) {
            iconName = activity.icon.displayName;
          }
        }
        
        return {
          ...activity,
          icon: iconName
        };
      })
    }));
    
    // Navigate to edit customized booking page with booking data and itinerary
    navigate(`/user/travels/edit/${selectedBookingId}`, {
      state: {
        bookingData: selectedBooking,
        itinerary: serializableItinerary,
        tabStatus: selectedTab
      }
    });
  };

  const handleDeleteBooking = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBookingId) {
      // Delete from context if it exists there
      const travelInContext = userTravels.find(t => t.id === selectedBookingId);
      if (travelInContext) {
        deleteUserTravel(selectedBookingId);
      }
      
      // Also delete from mock data if it exists there
      const travelInMock = mockTravels.find(t => t.id === selectedBookingId);
      if (travelInMock) {
        setMockTravels(prev => prev.filter(t => t.id !== selectedBookingId));
      }
      
      toast.success("Booking Deleted", {
        description: "The travel booking has been permanently removed."
      });
    }
    setShowDeleteConfirmModal(false);
    setViewMode("list");
    setSelectedBookingId(null);
  };

  const handleConfirmStatus = () => {
    if (selectedBookingId) {
      // Update in mock data
      setMockTravels(prev => prev.map(travel => 
        travel.id === selectedBookingId 
          ? { ...travel, confirmationStatus: "confirmed" as const }
          : travel
      ));
      
      toast.success("Booking Confirmed", {
        description: "The booking status has been updated to Confirmed."
      });
    }
    setShowConfirmStatusModal(false);
  };

  // QR Code handlers
  const handleShareBooking = async (bookingId: string) => {
    setShareQRBookingId(bookingId);
    setShowShareQRModal(true);
    
    // Generate QR code after modal opens
    setTimeout(() => {
      generateQRCode(bookingId);
    }, 100);
  };

  const generateQRCode = async (bookingId: string) => {
    const canvas = qrCodeCanvasRef.current;
    if (!canvas) return;
    
    try {
      const QRCode = (await import('qrcode')).default;
      await QRCode.toCanvas(canvas, bookingId, {
        width: 200,
        margin: 2,
        color: {
          dark: '#0A7AFF',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrCodeCanvasRef.current;
    if (!canvas || !shareQRBookingId) return;
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `booking-${shareQRBookingId}-qr.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("QR code downloaded successfully!");
      }
    });
  };

  const handleStartScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning for QR codes
        scanQRCode();
      }
    } catch (error: any) {
      console.error('Failed to access camera:', error);
      
      // Provide specific error messages based on the error type
      if (error.name === 'NotAllowedError') {
        toast.error("Camera Permission Denied", {
          description: "Please enable camera access in your browser settings to scan QR codes"
        });
      } else if (error.name === 'NotFoundError') {
        toast.error("Camera Not Found", {
          description: "No camera device was detected on your device"
        });
      } else {
        toast.error("Failed to access camera", {
          description: "Please check your camera permissions and try again"
        });
      }
      setIsScanning(false);
    }
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !isScanning) return;
    
    try {
      const jsQR = (await import('jsqr')).default;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          setScannedQRData(code.data);
          setJoinTravelId(code.data);
          stopScanning();
          toast.success("QR code scanned successfully!");
          return;
        }
      }
    } catch (error) {
      console.error('QR scanning error:', error);
    }
    
    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const jsQR = (await import('jsqr')).default;
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
              setScannedQRData(code.data);
              /**
               * @TODO insert to user's travel through booking id (code.data)
               */
              setJoinTravelId(code.data);
              toast.success("QR code read successfully!");
            } else {
              toast.error("No QR code found in image");
            }
          }
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to read QR code from file:', error);
      toast.error("Failed to read QR code from file");
    }
  };

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isScanning]);

  // Filter by both tab and ownership
  const filteredTravels = travels.filter((travel) => {
    const statusMatch = travel.status === selectedTab;
    const ownershipMatch =
      selectedFilter === "all" ||
      travel.ownership === selectedFilter;
    
    // If requested filter is active, also filter by confirmation status sub-tab
    if (selectedFilter === "requested" && requestedSubTab !== "all") {
      const confirmationMatch = travel.confirmationStatus === requestedSubTab;
      return statusMatch && ownershipMatch && confirmationMatch;
    }
    
    return statusMatch && ownershipMatch;
  });

  // If in detail view, show BookingDetailView
  if (viewMode === "detail" && selectedBookingId) {
    const selectedBooking = travels.find((t) => t.id === selectedBookingId);
    if (!selectedBooking) {
      setViewMode("list");
      return null;
    }

    const tabLabel = 
      selectedTab === "in-progress" ? "In Progress" :
      selectedTab === "pending" ? "Pending" :
      "Rejected Bookings";
    
    const isOwner = selectedBooking.owner === currentUser;
    const currentResolutionStatus = travelResolutionStatus[selectedBooking.id] || selectedBooking.resolutionStatus;

    // Get itinerary - check if it's from context first (has itinerary property), otherwise use mock data
    const travelInContext = userTravels.find(t => t.id === selectedBookingId);
    const itinerary = travelInContext?.itinerary || itineraryData[selectedBooking.id] || [];

    // Render detail view manually instead of using BookingDetailView
    if (selectedTab === "rejected") {
      return (
        <>
          <style>{`
            @keyframes highlight {
              0%, 100% {
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                transform: scale(1);
              }
              50% {
                box-shadow: 0 0 0 3px rgba(255,107,107,0.3), 0 4px 6px rgba(255,107,107,0.1);
                transform: scale(1.005);
              }
            }
            
            .highlight-animation {
              animation: highlight 2s ease-in-out;
              border-radius: 1rem;
            }
          `}</style>
          
          <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToList}
                className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-[#64748B]" />
              </button>
              <div>
                <h2 className="text-[#1A2B4F] font-semibold">{selectedBooking.destination}</h2>
              </div>
            </div>
            
            {/* Booking Header Card */}
            <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-semibold">{selectedBooking.destination}</h1>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span className="text-lg">{selectedBooking.destination}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm mb-1">Booking ID</p>
                  <p className="text-2xl font-semibold">{selectedBooking.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Calendar className="w-5 h-5 mb-2 text-white/80" />
                  <p className="text-white/80 text-xs mb-1">Travel Dates</p>
                  <p className="font-medium">{selectedBooking.dates}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Users className="w-5 h-5 mb-2 text-white/80" />
                  <p className="text-white/80 text-xs mb-1">Travelers</p>
                  <p className="font-medium">
                    {selectedBooking.travelers} {selectedBooking.travelers > 1 ? "People" : "Person"}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <BookOpen className="w-5 h-5 mb-2 text-white/80" />
                  <p className="text-white/80 text-xs mb-1">Budget</p>
                  <p className="font-medium">{selectedBooking.budget}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Calendar className="w-5 h-5 mb-2 text-white/80" />
                  <p className="text-white/80 text-xs mb-1">Created On</p>
                  <p className="font-medium">{selectedBooking.createdOn}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Customer Info & Rejection Details */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFB] to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-[#1A2B4F]">Customer Information</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">Full Name</p>
                      <p className="text-[#1A2B4F] font-medium">{selectedBooking.owner}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">Collaborators</p>
                      <p className="text-[#334155]">
                        {selectedBooking.collaborators.length > 0 
                          ? selectedBooking.collaborators.join(", ")
                          : "No collaborators"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">Booking Type</p>
                      <p className="text-[#334155]">{selectedBooking.bookingType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">Ownership</p>
                      <p className="text-[#334155]">
                        {selectedBooking.ownership === "owned" ? "Owned" : 
                         selectedBooking.ownership === "collaborated" ? "Collaborated" : "Requested"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejection Details Section - BELOW Customer Information */}
                {selectedBooking.rejectionReason && selectedBooking.rejectionResolution && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
                    <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-[#FF6B6B]">Rejection Details</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-[#FF6B6B] mb-1">Rejection Reason:</p>
                        <p className="text-sm text-[#334155]">{selectedBooking.rejectionReason}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#FF6B6B] mb-1">Required Action:</p>
                        <p className="text-sm text-[#334155]">{selectedBooking.rejectionResolution}</p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                        <p className="text-xs font-semibold text-[#64748B]">Action Status:</p>
                        {currentResolutionStatus === "resolved" ? (
                          <button
                            onClick={() => handleMarkAsUnresolved(selectedBooking.id)}
                            className="px-3 py-1.5 rounded-lg bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)] transition-all"
                          >
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Resolved - Click to mark Unresolved
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsResolved(selectedBooking.id)}
                            className="px-3 py-1.5 rounded-lg bg-[rgba(255,152,0,0.1)] text-[#FF9800] text-xs font-medium border border-[rgba(255,152,0,0.2)] hover:bg-[rgba(255,152,0,0.15)] transition-all"
                          >
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            Unresolved - Click to mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 space-y-3">
                  {currentResolutionStatus === "unresolved" && isOwner && (
                    <button
                      onClick={handleEditBooking}
                      className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,122,255,0.35)] transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Booking
                    </button>
                  )}
                  <button
                    onClick={handleBackToList}
                    className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] flex items-center justify-center gap-2 text-[#334155] font-medium transition-all"
                  >
                    Back to List
                  </button>
                </div>
              </div>

              {/* Right Column - Itinerary */}
              <div className="col-span-2">
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFB] to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-[#1A2B4F]">Travel Itinerary</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    {itinerary.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-[#E5E7EB] mx-auto mb-4" />
                        <p className="text-[#64748B]">No itinerary details available</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {itinerary.map((day) => (
                          <div key={day.day} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                            <div className="p-4 bg-gradient-to-r from-[#F8FAFB] to-white border-b border-[#E5E7EB]">
                              <h4 className="font-semibold text-[#1A2B4F]">
                                Day {day.day}: {day.title}
                              </h4>
                            </div>
                            <div className="p-4 space-y-4">
                              {day.activities.map((activity: any, index: number) => {
                                const IconComponent = activity.icon || Clock;
                                return (
                                  <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 rounded-lg bg-[rgba(10,122,255,0.1)] border border-[rgba(10,122,255,0.2)] flex items-center justify-center">
                                        <IconComponent className="w-4 h-4 text-[#0A7AFF]" />
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-[#1A2B4F]">{activity.title}</p>
                                        <p className="text-sm text-[#64748B]">{activity.time}</p>
                                      </div>
                                      <p className="text-sm text-[#64748B] mb-1">{activity.description}</p>
                                      {activity.location && (
                                        <div className="flex items-center gap-1 text-xs text-[#0A7AFF]">
                                          <MapPin className="w-3 h-3" />
                                          <span>{activity.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Customized Booking Confirmation Modal */}
            <ConfirmationModal
              open={showDeleteConfirmModal}
              onOpenChange={(open) => {
                if (!open) {
                  setShowDeleteConfirmModal(false);
                }
              }}
              title="Delete Customized Booking"
              description="Are you sure you want to delete this customized booking? This action cannot be undone."
              icon={<Trash2 className="w-5 h-5 text-white" />}
              iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
              iconShadow="shadow-[#FF6B6B]/30"
              contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
              contentBorder="border-[rgba(255,107,107,0.2)]"
              content={
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Customer:</span>
                    <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                      {selectedBooking.owner}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Booking Type:</span>
                    <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                      {selectedBooking.bookingType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Destination:</span>
                    <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                      {selectedBooking.destination}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-2">
                    This will permanently remove the customized booking from your list.
                  </p>
                </div>
              }
              onConfirm={handleConfirmDelete}
              onCancel={() => setShowDeleteConfirmModal(false)}
              confirmText="Delete Booking"
              cancelText="Cancel"
              confirmVariant="destructive"
            />
          </div>
        </>
      );
    }

    // For non-rejected bookings, use the BookingDetailView
    return (
      <>
        <BookingDetailView
          booking={{
            id: selectedBooking.id,
            customer: selectedBooking.ownership === "requested" ? currentUser : selectedBooking.owner,
            email: "maria.santos@email.com",
            mobile: "+63 917 123 4567",
            destination: selectedBooking.destination,
            dates: selectedBooking.dates,
            travelers: selectedBooking.travelers,
            total: selectedBooking.budget,
            bookedDate: selectedBooking.createdOn,
            resolutionStatus: currentResolutionStatus,
          }}
          itinerary={itinerary}
          onBack={handleBackToList}
          breadcrumbPage={tabLabel}
          headerVariant={
            selectedTab === "rejected" ? "cancelled" :
            selectedTab === "pending" ? "approval" :
            "default"
          }
          isRequestedItinerary={true}
          actionButtons={
            selectedTab === "pending" ? undefined : (
              <>
                {/* Conversation Section for Requested Bookings */}
                {selectedBooking.ownership === "requested" && (
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
                        {(conversations[selectedBooking.id] || []).length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No messages yet. Start the conversation!
                          </div>
                        ) : (
                          (conversations[selectedBooking.id] || []).map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] p-4 rounded-xl shadow-sm ${
                                msg.sender === "user" 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-card border border-border"
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                <p className={`text-xs mt-2 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
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
                          value={currentMessage[selectedBooking.id] || ""}
                          onChange={(e) => setCurrentMessage({ ...currentMessage, [selectedBooking.id]: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && currentMessage[selectedBooking.id]?.trim()) {
                              const newMsg = {
                                sender: "user" as const,
                                message: currentMessage[selectedBooking.id].trim(),
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
                                [selectedBooking.id]: [...(conversations[selectedBooking.id] || []), newMsg],
                              });
                              setCurrentMessage({ ...currentMessage, [selectedBooking.id]: "" });
                              toast.success("Message sent!", {
                                description: "Your message has been sent to the admin."
                              });
                            }
                          }}
                          className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                        <button
                          onClick={() => {
                            if (currentMessage[selectedBooking.id]?.trim()) {
                              const newMsg = {
                                sender: "user" as const,
                                message: currentMessage[selectedBooking.id].trim(),
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
                                [selectedBooking.id]: [...(conversations[selectedBooking.id] || []), newMsg],
                              });
                              setCurrentMessage({ ...currentMessage, [selectedBooking.id]: "" });
                              toast.success("Message sent!", {
                                description: "Your message has been sent to the admin."
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
                )}

                {/* Action Buttons */}
                {/* Confirm button for requested + unconfirmed bookings */}
                {selectedBooking.ownership === "requested" && selectedBooking.confirmationStatus === "unconfirmed" && (
                  <button
                    onClick={() => setShowConfirmStatusModal(true)}
                    className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#0EA574] hover:to-[#12A594] text-white flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-[#10B981]/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm Booking
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleBookThisTrip}
                    className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:from-[#12A594] hover:to-[#0EA574] text-white flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-[#14B8A6]/20"
                  >
                    <BookOpen className="w-4 h-4" />
                    Book This Trip
                  </button>
                )}
                {/* Only show Edit Booking button if NOT a requested booking OR if requested but no confirmation status */}
                {!(selectedBooking.ownership === "requested" && (selectedBooking.confirmationStatus === "unconfirmed" || selectedBooking.confirmationStatus === "confirmed")) && (
                  <button
                    onClick={handleEditBooking}
                    className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,122,255,0.35)] transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Booking
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleDeleteBooking}
                    className="w-full h-11 px-4 rounded-xl border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] flex items-center justify-center gap-2 font-medium transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Booking
                  </button>
                )}
              </>
            )
          }
        />

        {/* Book This Trip Confirmation Modal */}
        <ConfirmationModal
          open={showBookConfirmModal}
          onOpenChange={setShowBookConfirmModal}
          title="Book This Trip"
          icon={<BookOpen className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
          iconShadow="shadow-[#0A7AFF]/20"
          contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
          contentBorder="border-[rgba(10,122,255,0.2)]"
          content={
            <div className="text-card-foreground">
              <p className="mb-3">
                Are you sure you want to submit this travel plan as a booking request?
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination:</span>
                  <span className="font-medium">{selectedBooking.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dates:</span>
                  <span className="font-medium">{selectedBooking.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">{selectedBooking.budget}</span>
                </div>
              </div>
            </div>
          }
          onConfirm={handleConfirmBooking}
          onCancel={() => setShowBookConfirmModal(false)}
          confirmText="Submit Booking"
          confirmVariant="success"
        />

        {/* Delete Customized Booking Confirmation Modal */}
        <ConfirmationModal
          open={showDeleteConfirmModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowDeleteConfirmModal(false);
            }
          }}
          title="Delete Customized Booking"
          description="Are you sure you want to delete this customized booking? This action cannot be undone."
          icon={<Trash2 className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
          iconShadow="shadow-[#FF6B6B]/30"
          contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
          contentBorder="border-[rgba(255,107,107,0.2)]"
          content={
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Customer:</span>
                <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                  {selectedBooking.owner}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Booking Type:</span>
                <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                  {selectedBooking.bookingType}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Destination:</span>
                <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                  {selectedBooking.destination}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-2">
                This will permanently remove the customized booking from your list.
              </p>
            </div>
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirmModal(false)}
          confirmText="Delete Booking"
          cancelText="Cancel"
          confirmVariant="destructive"
        />

        {/* Confirm Booking Status Modal */}
        <ConfirmationModal
          open={showConfirmStatusModal}
          onOpenChange={setShowConfirmStatusModal}
          title="Confirm Booking Status"
          description="Are you sure you want to confirm this booking? This will update the status from Unconfirmed to Confirmed."
          icon={<CheckCircle className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
          iconShadow="shadow-[#10B981]/20"
          contentGradient="bg-gradient-to-br from-[rgba(16,185,129,0.05)] to-[rgba(20,184,166,0.05)]"
          contentBorder="border-[rgba(16,185,129,0.2)]"
          content={
            <div className="space-y-3 mt-4 mb-2">
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Booking ID:</span>
                <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                  {selectedBooking.id}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Destination:</span>
                <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                  {selectedBooking.destination}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Travel Dates:</span>
                <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                  {selectedBooking.dates}
                </span>
              </div>
            </div>
          }
          onConfirm={handleConfirmStatus}
          onCancel={() => setShowConfirmStatusModal(false)}
          confirmText="Confirm Booking"
          cancelText="Cancel"
          confirmVariant="success"
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs - Approvals.tsx style */}
      <div className="flex gap-1 border-b-2 border-border overflow-x-auto">
        <button
          onClick={() => setSelectedTab("in-progress")}
          className={`px-5 h-11 text-sm transition-colors whitespace-nowrap ${
            selectedTab === "in-progress"
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setSelectedTab("pending")}
          className={`px-5 h-11 text-sm transition-colors whitespace-nowrap ${
            selectedTab === "pending"
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setSelectedTab("rejected")}
          className={`px-5 h-11 text-sm transition-colors whitespace-nowrap ${
            selectedTab === "rejected"
              ? "font-semibold text-[#FF6B6B] border-b-[3px] border-[#FF6B6B] -mb-[2px]"
              : "font-medium text-[#64748B] hover:text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)]"
          }`}
        >
          Rejected Bookings
        </button>
      </div>

      {/* Travels List with Filter Buttons */}
      <ContentCard
        title={`${selectedTab === "in-progress" ? "In Progress" : selectedTab === "pending" ? "Pending" : "Rejected Bookings"} ${filteredTravels.length > 0 ? `(${filteredTravels.length})` : ''}`}
        icon={MapPin}
        action={
          <div className="flex gap-2 items-center">
            <button
              onClick={handleBookFromStandard}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm bg-gradient-to-r from-[#14B8A6] to-[#10B981] hover:from-[#12A594] hover:to-[#0EA574] text-white"
            >
              <BookOpen
                className="w-4 h-4 sm:w-5 sm:h-5"
                strokeWidth={2}
              />
              <span className="hidden sm:inline">
                Book from Standard Itinerary
              </span>
              <span className="sm:hidden">Standard</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                color: "white",
              }}
            >
              <Plus
                className="w-4 h-4 sm:w-5 sm:h-5"
                strokeWidth={2}
              />
              <span className="hidden sm:inline">
                Add Travel
              </span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => {
                setSelectedFilter("all");
                setRequestedSubTab("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "all"
                  ? "shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-accent hover:border-primary/50"
              }`}
              style={
                selectedFilter === "all"
                  ? {
                      background:
                        "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                      color: "white",
                    }
                  : undefined
              }
            >
              All
            </button>
            <button
              onClick={() => {
                setSelectedFilter("owned");
                setRequestedSubTab("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "owned"
                  ? "shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-accent hover:border-primary/50"
              }`}
              style={
                selectedFilter === "owned"
                  ? {
                      background:
                        "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                      color: "white",
                    }
                  : undefined
              }
            >
              Owned
            </button>
            <button
              onClick={() => {
                setSelectedFilter("collaborated");
                setRequestedSubTab("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "collaborated"
                  ? "shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-accent hover:border-primary/50"
              }`}
              style={
                selectedFilter === "collaborated"
                  ? {
                      background:
                        "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                      color: "white",
                    }
                  : undefined
              }
            >
              Collaborated
            </button>
            <button
              onClick={() => setSelectedFilter("requested")}
              className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "requested"
                  ? "shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-accent hover:border-primary/50"
              }`}
              style={
                selectedFilter === "requested"
                  ? {
                      background:
                        "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                      color: "white",
                    }
                  : undefined
              }
            >
              Requested
            </button>
          </div>

          {/* Dropdown for Requested filter */}
          {selectedFilter === "requested" && (
            <div className="pt-3 pb-2">
              <Select value={requestedSubTab} onValueChange={(value: "all" | "confirmed" | "unconfirmed") => setRequestedSubTab(value)}>
                <SelectTrigger className="w-[180px] h-10 border-2 border-border bg-card text-card-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requested</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Travel List */}
          {filteredTravels.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-primary opacity-50" />
              </div>
              <h3 className="text-lg text-card-foreground mb-2">
                No{" "}
                {selectedTab === "in-progress"
                  ? "in progress"
                  : selectedTab}{" "}
                travel plans
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                {selectedTab === "in-progress"
                  ? "Start planning your first adventure!"
                  : `You don't have any ${selectedTab} travel plans yet.`}
              </p>
              {selectedTab === "in-progress" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2.5 rounded-xl transition-all duration-200 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                    color: "white",
                  }}
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                  Create Travel Plan
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTravels.map((travel) => {
                const currentResolutionStatus = travelResolutionStatus[travel.id] || travel.resolutionStatus;
                return (
                  <div 
                    key={travel.id}
                    ref={(el) => bookingRefs.current[travel.id] = el}
                  >
                    <BookingListCard
                      booking={{
                        id: travel.id,
                        customer: travel.owner + (travel.collaborators.length > 0 ? `, ${travel.collaborators.join(", ")}` : ""),
                        email: "",
                        mobile: "",
                        destination: travel.destination,
                        dates: travel.dates,
                        travelers: travel.travelers,
                        total: travel.budget,
                        bookedDate: travel.createdOn,
                        resolutionStatus: currentResolutionStatus,
                      }}
                      onViewDetails={handleViewDetails}
                      onShare={selectedTab === "in-progress" ? handleShareBooking : undefined}
                      variant={travel.status === "rejected" ? "rejected" : "default"}
                      userSide={true}
                      additionalBadges={
                        <>
                          {/* Ownership Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              travel.ownership === "owned"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : travel.ownership === "collaborated"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                            }`}
                          >
                            {travel.ownership === "owned"
                              ? "Owned"
                              : travel.ownership === "collaborated"
                              ? "Collaborated"
                              : "Requested"}
                          </span>
                          {/* Confirmation Status Badge for Requested Bookings */}
                          {travel.ownership === "requested" && travel.confirmationStatus && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                travel.confirmationStatus === "confirmed"
                                  ? "bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border border-[rgba(10,122,255,0.2)]"
                                  : "bg-[rgba(255,193,7,0.1)] text-[#FFC107] border border-[rgba(255,193,7,0.2)]"
                              }`}
                            >
                              {travel.confirmationStatus === "confirmed" ? "Confirmed" : "Unconfirmed"}
                            </span>
                          )}
                          {/* Resolution Status Badge for Rejected Bookings */}
                          {travel.status === "rejected" && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                currentResolutionStatus === "resolved"
                                  ? "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
                                  : "bg-[rgba(255,152,0,0.1)] text-[#FF9800] border border-[rgba(255,152,0,0.2)]"
                              }`}
                            >
                              {currentResolutionStatus === "resolved" ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Resolved
                                </>
                              ) : (
                                "Unresolved"
                              )}
                            </span>
                          )}
                        </>
                      }
                      pendingStatusMessage={
                        travel.status === "pending" && (
                          <div className="w-full p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              Waiting for admin review. You'll be notified once reviewed.
                            </p>
                          </div>
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ContentCard>

      {/* Add Travel Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Add Travel
            </DialogTitle>
            <DialogDescription className="pb-4">
              Choose how you'd like to add your travel plan.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="px-8 py-2 space-y-4 pb-6">
              {/* Start New Travel Option */}
              <button
                onClick={handleStartNewTravel}
                className="w-full p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white dark:bg-[#1E293B] hover:bg-[rgba(10,122,255,0.02)] dark:hover:bg-[rgba(10,122,255,0.05)] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A2B4F] dark:text-white mb-1 group-hover:text-[#0A7AFF] dark:group-hover:text-[#0A7AFF] transition-colors">Start New Travel</h3>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      Use our Smart Trip Generator to create a personalized travel itinerary.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border border-[rgba(10,122,255,0.2)]">
                        Customizable
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] border border-[rgba(139,92,246,0.2)]">
                        Flexible
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Join Existing Travel Option */}
              <button
                onClick={handleJoinExisting}
                className="w-full p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#8B5CF6] bg-white dark:bg-[#1E293B] hover:bg-[rgba(139,92,246,0.02)] dark:hover:bg-[rgba(139,92,246,0.05)] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A2B4F] dark:text-white mb-1 group-hover:text-[#8B5CF6] dark:group-hover:text-[#8B5CF6] transition-colors">Join Existing Travel</h3>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      Collaborate with others on their travel plans.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] border border-[rgba(139,92,246,0.2)]">
                        Collaborative
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]">
                        Join Group
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Join Travel Modal */}
      <ConfirmationModal
        open={showJoinTravelModal}
        onOpenChange={(open) => {
          setShowJoinTravelModal(open);
          if (!open) {
            setJoinMethod("manual");
            setJoinTravelId("");
            setScannedQRData("");
            stopScanning();
          }
        }}
        title="Join Existing Travel"
        description="Choose how you'd like to join an existing travel"
        icon={<Users className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]"
        iconShadow="shadow-[#8B5CF6]/20"
        contentGradient="bg-gradient-to-br from-[rgba(139,92,246,0.05)] to-transparent"
        contentBorder="border-[rgba(139,92,246,0.2)]"
        content={
          <div className="space-y-4">
            {/* Join Method Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setJoinMethod("manual");
                  stopScanning();
                }}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  joinMethod === "manual"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Type className="w-4 h-4 inline mr-2" />
                Manual
              </button>
              <button
                onClick={() => {
                  setJoinMethod("scan");
                  setJoinTravelId("");
                  handleStartScanning();
                }}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  joinMethod === "scan"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <QrCode className="w-4 h-4 inline mr-2" />
                Scan QR
              </button>
              <button
                onClick={() => {
                  setJoinMethod("upload");
                  stopScanning();
                  setJoinTravelId("");
                }}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  joinMethod === "upload"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload QR
              </button>
            </div>

            {/* Manual Entry */}
            {joinMethod === "manual" && (
              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Booking ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., BV-2025-001"
                  value={joinTravelId}
                  onChange={(e) => setJoinTravelId(e.target.value)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmJoinTravel();
                    }
                  }}
                />
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mt-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 Tip: Ask the travel owner for their booking ID to join their travel plan as a collaborator.
                  </p>
                </div>
              </div>
            )}

            {/* QR Code Scanner */}
            {joinMethod === "scan" && (
              <div>
                <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
                  {isScanning ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-4 border-primary rounded-2xl"></div>
                      </div>
                      <button
                        onClick={stopScanning}
                        className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">Camera will activate</p>
                      </div>
                    </div>
                  )}
                </div>
                {scannedQRData && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-3">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ QR code scanned: {scannedQRData}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Upload QR Code */}
            {joinMethod === "upload" && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-8 border-2 border-dashed border-border hover:border-primary rounded-xl bg-muted/50 hover:bg-muted transition-all"
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-card-foreground font-medium">Click to upload QR code image</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </button>
                {scannedQRData && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-3">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ QR code read: {scannedQRData}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        }
        onConfirm={handleConfirmJoinTravel}
        onCancel={() => {
          setShowJoinTravelModal(false);
          setJoinMethod("manual");
          setJoinTravelId("");
          setScannedQRData("");
          stopScanning();
        }}
        confirmText="Join Travel"
        cancelText="Cancel"
        confirmVariant="default"
      />

      {/* Share QR Code Modal */}
      <Dialog open={showShareQRModal} onOpenChange={setShowShareQRModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              Share Travel Booking
            </DialogTitle>
            <DialogDescription>
              Share this QR code with others to let them join as collaborators
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* QR Code Display */}
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                <canvas ref={qrCodeCanvasRef} />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <p className="text-sm text-muted-foreground">
                  Booking ID: <span className="font-semibold text-card-foreground">{shareQRBookingId}</span>
                </p>
                <button
                  onClick={() => {
                    if (shareQRBookingId) {
                      navigator.clipboard.writeText(shareQRBookingId);
                      toast.success("Copied to clipboard!", {
                        description: `Booking ID ${shareQRBookingId} copied`
                      });
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-accent transition-all"
                  title="Copy booking ID"
                >
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl mx-6">
              <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">How to use:</h4>
              <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Download the QR code or let others scan it directly</li>
                <li>Others can scan or upload this QR code in "Join Existing Travel"</li>
                <li>They will be added as collaborators to this booking</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 mx-6">
              <button
                onClick={handleDownloadQR}
                className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
              <button
                onClick={() => setShowShareQRModal(false)}
                className="px-6 h-11 rounded-xl border-2 border-border hover:bg-accent transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <FAQAssistant />
    </div>
  );
}