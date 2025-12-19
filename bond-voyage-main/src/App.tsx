import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { Dashboard } from "./pages/Dashboard";
import { Users } from "./pages/Users";
import { Bookings } from "./pages/Bookings";
import { Approvals } from "./pages/Approvals";
import { History } from "./pages/History";
import { Itinerary } from "./pages/Itinerary";
import { Inquiries } from "./pages/Inquiries";
import { Feedback } from "./pages/Feedback";
import { Notifications } from "./pages/Notifications";
import { EditProfile } from "./pages/EditProfile";
import { CreateStandardItinerary } from "./pages/CreateStandardItinerary";
import { CreateRequestedItinerary } from "./pages/CreateRequestedItinerary";
import { EditStandardItinerary } from "./pages/EditStandardItinerary";
import { EditRequestedItinerary } from "./pages/EditRequestedItinerary";
import { Toaster } from "./components/ui/sonner";
import { ProfileProvider } from "./components/ProfileContext";
import {
  BreadcrumbProvider,
  useBreadcrumbs,
  BreadcrumbItem,
} from "./components/BreadcrumbContext";
import { SideProvider, useSide } from "./components/SideContext";
import { BookingProvider } from "./components/BookingContext";
import { UserSidebar } from "./components/UserSidebar";
import { UserHome } from "./pages/user/UserHome";
import { UserTravels } from "./pages/user/UserTravels";
import { SmartTrip } from "./pages/user/SmartTrip";
import { CreateNewTravel } from "./pages/user/CreateNewTravel";
import { UserBookings } from "./pages/user/UserBookings";
import { UserHistory } from "./pages/user/UserHistory";
import { UserInquiries } from "./pages/user/UserInquiries";
import { UserFeedback } from "./pages/user/UserFeedback";
import { WeatherForecast } from "./pages/user/WeatherForecast";
import { Translation } from "./pages/user/Translation";
import { SpinTheWheel } from "./pages/user/SpinTheWheel";
import { UserEditProfile } from "./pages/user/UserEditProfile";
import { UserActivity } from "./pages/user/UserActivity";
import { EditCustomizedBooking } from "./pages/user/EditCustomizedBooking";
import { UserNotifications } from "./pages/user/UserNotifications";
import { ActivityLog } from "./pages/ActivityLog";
import { UserBookingDetail } from "./pages/user/UserBookingDetail";
import { UserHistoryDetail } from "./pages/user/UserHistoryDetail";
import { UserStandardItinerary } from "./pages/user/UserStandardItinerary";
import HomePage from "./pages/HomePage";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { FaqPage } from "./pages/FaqPage";

// Utility function to format dates consistently
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return `${formatDate(start)} – ${formatDate(end)}`;
};

// Shared booking types
export interface ApprovalBooking {
  id: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  duration: string;
  dates: string;
  total: string;
  travelers: number;
  bookedDate: string;
  urgent?: boolean;
  rejectionReason?: string;
  rejectionResolution?: string;
  bookingSource?: "Customized" | "Generated"; // Added for booking source tracking
  paymentStatus?: string; // Added for payment status tracking
  tourType?: string; // Added for tour type tracking
}

export interface HistoryBooking {
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
  status: "completed" | "cancelled";
  completedDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  bookingType: string;
  paymentStatus?: string; // Added for payment status tracking
  tourType?: string; // Added for tour type tracking
}

export interface BookingData {
  id: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalAmount: number;
  paid: number;
  bookedDate: string;
  bookingType: string;
  status?: string;
  bookingSource?: "Customized" | "Generated";
  paymentStatus?: string; // Added for payment status tracking
  tourType?: string; // Added for tour type tracking
}

// FAQ Types for assistant
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  lastUpdated: string;
  tags: string[];
}

// Layout Component to handle page config and TopNav
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { currentSide } = useSide();
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { breadcrumbs: contextBreadcrumbs, resetBreadcrumbs } =
    useBreadcrumbs();

  useEffect(() => {
    const savedTheme = localStorage.getItem("bondvoyage-theme") || "light";
    setCurrentTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // Initialize FAQ system on app load
  useEffect(() => {
    const initializeFAQSystem = () => {
      if (!localStorage.getItem('bondvoyage-faqs')) {
        const defaultFAQs: FAQ[] = [
          {
            id: "FAQ-SYS-001",
            question: "How do I navigate the system?",
            answer: "Use the sidebar menu to access different sections. You can also use the FAQ Assistant (floating help button) for quick navigation.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["navigation", "system", "help"]
          },
          {
            id: "FAQ-SYS-002",
            question: "What is the Smart Trip feature?",
            answer: "Smart Trip uses AI to generate personalized travel itineraries based on your preferences. You can edit and customize the generated trips.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["smart trip", "ai", "itinerary"]
          },
          {
            id: "FAQ-SYS-003",
            question: "How do I create a new booking?",
            answer: "Go to Travels → Create New Travel, or browse Standard Itineraries to book pre-designed packages.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["booking", "create", "travel"]
          },
          {
            id: "FAQ-SYS-004",
            question: "How do I update my profile information?",
            answer: "Click on your profile picture in the top right corner and select 'Edit Profile' from the dropdown menu.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["profile", "account", "settings"]
          },
          {
            id: "FAQ-SYS-005",
            question: "Where can I view my booking history?",
            answer: "Navigate to the History page from the sidebar to see all your completed and cancelled trips.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["history", "bookings", "past trips"]
          },
          {
            id: "FAQ-SYS-006",
            question: "How do I check weather forecasts?",
            answer: "Go to the Weather Forecast page to see 7-day forecasts for your destinations. You can add weather info to your itineraries.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["weather", "forecast", "planning"]
          },
          {
            id: "FAQ-SYS-007",
            question: "What are Standard Itineraries?",
            answer: "Standard Itineraries are pre-designed travel packages created by our experts. They offer complete itineraries for popular destinations.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["standard", "packages", "pre-designed"]
          },
          {
            id: "FAQ-SYS-008",
            question: "How do I provide feedback?",
            answer: "Navigate to the Feedback page to share your travel experiences and suggestions. Your feedback helps us improve our services.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["feedback", "reviews", "suggestions"]
          },
          {
            id: "FAQ-SYS-009",
            question: "Where can I see my notifications?",
            answer: "All system notifications are available in the Notifications page. You can manage notification preferences there.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["notifications", "alerts", "updates"]
          },
          {
            id: "FAQ-SYS-010",
            question: "How do I use the translation tool?",
            answer: "The Translation Tool helps you translate between English and local dialects. It's available in the More section.",
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: ["translation", "language", "tools"]
          }
        ];
        localStorage.setItem('bondvoyage-faqs', JSON.stringify(defaultFAQs));
        console.log('FAQ system initialized with default FAQs');
      }
    };

    initializeFAQSystem();
  }, []);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("bondvoyage-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  useEffect(() => {
    if (location.pathname === "/home") {
      import("./styles/login.index.css");
      import("./styles/login.globals.css");
    } else {
      import("./styles/globals.css");
      import("./styles/index.css");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, [location, setIsLoading]);

  // Close mobile menu on route change, reset breadcrumbs, and scroll to top
  useEffect(() => {
    setIsMobileMenuOpen(false);
    resetBreadcrumbs();
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    // Also scroll the main content area to top
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
  }, [location.pathname, resetBreadcrumbs]);

  const pageConfig: Record<
    string,
    { title: string; subtitle: string; breadcrumbs: BreadcrumbItem[] }
  > = {
    "/": {
      title: "Dashboard Overview",
      subtitle: "Welcome back, Admin! Here's what's happening today.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Dashboard" }],
    },
    "/users": {
      title: "User Management",
      subtitle: "Manage all registered users and their permissions.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Users" }],
    },
    "/bookings": {
      title: "Booking Management",
      subtitle: "View and manage all current and approved bookings.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Bookings" }],
    },
    "/approvals": {
      title: "Booking Approvals",
      subtitle: "Review and approve pending booking requests.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Approvals" }],
    },
    "/history": {
      title: "Booking History",
      subtitle: "View completed and cancelled bookings.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "History" }],
    },
    "/itinerary": {
      title: "Standard and Requested Itinerary",
      subtitle: "Manage and create travel itinerary templates.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Itinerary" }],
    },
    "/itinerary/create-standard": {
      title: "Create Standard Itinerary",
      subtitle: "Design a new standard itinerary template for travelers.",
      breadcrumbs: [
        { label: "Home", path: "/" },
        { label: "Itinerary", path: "/itinerary" },
        { label: "Create Standard" },
      ],
    },
    "/itinerary/create-requested": {
      title: "Create Requested Itinerary",
      subtitle: "Create a custom itinerary based on client request.",
      breadcrumbs: [
        { label: "Home", path: "/" },
        { label: "Itinerary", path: "/itinerary" },
        { label: "Create Requested" },
      ],
    },
    "/itinerary/edit-standard/:id": {
      title: "Edit Standard Itinerary",
      subtitle: "Update and modify your existing itinerary template.",
      breadcrumbs: [
        { label: "Home", path: "/" },
        { label: "Itinerary", path: "/itinerary" },
        { label: "Edit Standard" },
      ],
    },
    "/itinerary/edit-requested/:id": {
      title: "Edit Requested Booking",
      subtitle: "Update requested booking details and itinerary.",
      breadcrumbs: [
        { label: "Home", path: "/" },
        { label: "Itinerary", path: "/itinerary" },
        { label: "Edit Requested" },
      ],
    },
    "/profile/edit": {
      title: "Edit Profile",
      subtitle: "Manage your account information and security settings.",
      breadcrumbs: [
        { label: "Home", path: "/" },
        { label: "Profile" },
        { label: "Edit" },
      ],
    },
    "/inquiries": {
      title: "Client Inquiries",
      subtitle: "Manage and respond to client inquiries and questions.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Inquiries" }],
    },
    "/feedback": {
      title: "Client Feedback",
      subtitle: "Reviews and feedback from travelers.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Feedback" }],
    },
    "/notifications": {
      title: "Notifications",
      subtitle: "Stay updated with all activities across the dashboard.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Notifications" }],
    },
    "/activity-log": {
      title: "Activity Log",
      subtitle: "Track all administrative actions and system events.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "Activity Log" }],
    },
    "/faq": {
      title: "Frequently Asked Questions",
      subtitle: "Manage FAQs for the user assistant system.",
      breadcrumbs: [{ label: "Home", path: "/" }, { label: "FAQ Management" }],
    },
    // User Side Pages
    "/user/home": {
      title: "Dashboard",
      subtitle: "Welcome back! Plan your next adventure.",
      breadcrumbs: [{ label: "Home" }],
    },
    "/user/travels": {
      title: "Travels",
      subtitle: "Manage your travel plans and bookings.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Travels" },
      ],
    },
    "/user/travels/edit/:id": {
      title: "Edit Customized Booking",
      subtitle: "Update your travel details and day-by-day itinerary.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Travels", path: "/user/travels" },
        { label: "Edit Booking" },
      ],
    },
    "/user/standard-itinerary": {
      title: "Standard Itinerary Packages",
      subtitle: "Browse and book from our pre-designed travel packages.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Travels", path: "/user/travels" },
        { label: "Standard Itinerary" },
      ],
    },
    "/user/smart-trip": {
      title: "Smart Trip Generator",
      subtitle:
        "Let AI create your perfect itinerary. You'll be able to edit this generated trip once it's added to your Travels.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Smart Trip" },
      ],
    },
    "/user/create-new-travel": {
      title: "Create New Travel",
      subtitle:
        "Build a customized travel plan with detailed day-by-day itinerary.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Travels", path: "/user/travels" },
        { label: "Create New Travel" },
      ],
    },
    "/user/bookings": {
      title: "Bookings",
      subtitle: "Track and manage your active bookings.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Bookings" },
      ],
    },
    "/user/bookings/:id": {
      title: "Booking Detail",
      subtitle: "View detailed information about your booking.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Bookings", path: "/user/bookings" },
        { label: "Detail" },
      ],
    },
    "/user/history": {
      title: "Travel History",
      subtitle: "Your completed trips and memories.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "History" },
      ],
    },
    "/user/history/:id": {
      title: "Travel History Detail",
      subtitle: "View detailed information about your completed trip.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "History", path: "/user/history" },
        { label: "Detail" },
      ],
    },
    "/user/activity": {
      title: "Activity Log",
      subtitle: "View all your account activities.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Activity" },
      ],
    },
    "/user/inquiries": {
      title: "Inquiries",
      subtitle: "Manage conversations with our team.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Inquiries" },
      ],
    },
    "/user/feedback": {
      title: "Feedback",
      subtitle: "Share your travel experiences.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Feedback" },
      ],
    },
    "/user/weather": {
      title: "Weather Forecast",
      subtitle: "7-day weather forecast for your destinations.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "More" },
        { label: "Weather" },
      ],
    },
    "/user/translation": {
      title: "Translation Tool",
      subtitle: "Translate between English and local dialects.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "More" },
        { label: "Translation" },
      ],
    },
    "/user/spin-wheel": {
      title: "Spin the Wheel",
      subtitle: "Can't decide? Let the wheel choose for you!",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "More" },
        { label: "Spin the Wheel" },
      ],
    },
    "/user/profile/edit": {
      title: "Edit Profile",
      subtitle: "Manage your personal information.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Profile" },
        { label: "Edit" },
      ],
    },
    "/user/notifications": {
      title: "Notifications",
      subtitle: "Stay updated with all activities across your account.",
      breadcrumbs: [
        { label: "Home", path: "/user/home" },
        { label: "Notifications" },
      ],
    },
  };

  const config = pageConfig[location.pathname] || pageConfig["/"];

  /**
   * @TODO change design of this overlay
   */
  if (isLoading) {
    return <LoadingOverlay />;
  }

  // Use context breadcrumbs if set, otherwise use page config breadcrumbs
  const displayBreadcrumbs =
    contextBreadcrumbs.length > 0 ? contextBreadcrumbs : config.breadcrumbs;
  if (location.pathname === "/home") return children;
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Conditional Sidebar - Admin or User */}
      {currentSide === "admin" ? (
        <Sidebar
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      ) : (
        <UserSidebar
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-20 overflow-y-auto">
        {/* Top Navigation - Now shown on all pages including Dashboard */}
        <TopNav
          pageTitle={config.title}
          pageSubtitle={config.subtitle}
          breadcrumbs={displayBreadcrumbs}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

// Main Routes Component with Data Management
function AppRoutes() {
  const navigate = useNavigate();
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalBooking[]>([
    {
      id: "BV-2024-011",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "El Nido, Palawan",
      duration: "5 Days",
      dates: "December 15, 2026 – December 20, 2026",
      total: "₱45,000",
      travelers: 2,
      urgent: true,
      bookedDate: "2024-11-20",
      bookingSource: "Generated",
      paymentStatus: "Unpaid", // Added
      tourType: "Private", // Added
    },
    {
      id: "BV-2024-010",
      customer: "Juan Dela Cruz",
      email: "juan.delacruz@email.com",
      mobile: "+63 918 234 5678",
      destination: "Bohol",
      duration: "4 Days",
      dates: "December 22, 2026 – December 26, 2026",
      total: "₱38,500",
      travelers: 4,
      urgent: false,
      bookedDate: "2024-11-22",
      bookingSource: "Customized",
      paymentStatus: "Unpaid", // Added
      tourType: "Joiner", // Added
    },
    {
      id: "BV-2024-006",
      customer: "Catherine Smith",
      email: "catherine.smith@email.com",
      mobile: "+63 917 555 1234",
      destination: "Boracay Island, Aklan",
      duration: "5 Days",
      dates: "December 18, 2026 – December 23, 2026",
      total: "₱55,000",
      travelers: 3,
      urgent: false,
      bookedDate: "2024-11-18",
      bookingSource: "Generated",
      paymentStatus: "Partial", // Added
      tourType: "Private", // Added
    },
    {
      id: "BV-2024-007",
      customer: "James Wilson",
      email: "james.wilson@email.com",
      mobile: "+63 918 666 2345",
      destination: "Puerto Princesa, Palawan",
      duration: "4 Days",
      dates: "December 20, 2026 – December 24, 2026",
      total: "₱42,300",
      travelers: 2,
      urgent: true,
      bookedDate: "2024-11-19",
      bookingSource: "Customized",
      paymentStatus: "Unpaid", // Added
      tourType: "Private", // Added
    },
    {
      id: "BV-2024-008",
      customer: "Sophia Garcia",
      email: "sophia.garcia@email.com",
      mobile: "+63 919 777 3456",
      destination: "Siargao Island, Surigao del Norte",
      duration: "6 Days",
      dates: "December 25, 2026 – December 31, 2026",
      total: "₱67,500",
      travelers: 4,
      urgent: false,
      bookedDate: "2024-11-21",
      bookingSource: "Generated",
      paymentStatus: "Unpaid", // Added
      tourType: "Joiner", // Added
    },
  ]);

  const [createdBookings, setCreatedBookings] = useState<BookingData[]>([]);
  const [standardItineraries, setStandardItineraries] = useState<any[]>([]);
  const [requestedBookingsFromBookings, setRequestedBookingsFromBookings] =
    useState<BookingData[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [editingItinerary, setEditingItinerary] = useState<any>(null);
  const [editingRequestedBooking, setEditingRequestedBooking] =
    useState<any>(null);
  const [editingRequestedDraft, setEditingRequestedDraft] = useState<any>(null);
  const [editingStandardDraft, setEditingStandardDraft] = useState<any>(null);

  const [historyBookings, setHistoryBookings] = useState<HistoryBooking[]>([
    {
      id: "BV-2024-034",
      customer: "Carlos Mendoza",
      email: "carlos.mendoza@email.com",
      mobile: "+63 919 456 7890",
      destination: "Siargao Island, Surigao del Norte",
      itinerary: "Siargao 5-Day Surf & Island Adventure",
      dates: "August 10, 2024 – August 15, 2024",
      travelers: 2,
      totalAmount: "₱32,000",
      paid: "₱32,000",
      bookedDate: "2024-07-15",
      status: "completed",
      completedDate: "2024-08-14",
      bookingType: "Requested",
      paymentStatus: "Paid", // Added
      tourType: "Private", // Added
    },
    {
      id: "BV-2024-076",
      customer: "Ana Reyes",
      email: "ana.reyes@email.com",
      mobile: "+63 918 345 6789",
      destination: "Baguio City, Benguet",
      itinerary: "Baguio 7-Day Summer Getaway",
      dates: "July 5, 2024 – July 12, 2024",
      travelers: 1,
      totalAmount: "₱19,500",
      paid: "₱9,750",
      bookedDate: "2024-06-20",
      status: "cancelled",
      cancelledDate: "2024-06-25",
      bookingType: "Standard",
      paymentStatus: "Partial", // Added
      tourType: "Joiner", // Added
    },
  ]);

  // Load bookings from localStorage on initial load
  useEffect(() => {
    const savedBookings = localStorage.getItem('approvedBookings');
    if (savedBookings) {
      try {
        const parsedBookings = JSON.parse(savedBookings);
        setBookings(parsedBookings);
      } catch (error) {
        console.error('Error loading bookings from localStorage:', error);
      }
    }
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('approvedBookings', JSON.stringify(bookings));
  }, [bookings]);

  // Helper function to convert ApprovalBooking to BookingData format
  const convertApprovalToBooking = (approvalBooking: ApprovalBooking): BookingData => {
    const totalAmount = parseInt(approvalBooking.total.replace(/[₱,]/g, '')) || 0;
    
    // Calculate paid amount based on payment status
    let paid = 0;
    if (approvalBooking.paymentStatus === "Paid") {
      paid = totalAmount;
    } else if (approvalBooking.paymentStatus === "Partial") {
      paid = Math.floor(totalAmount / 2);
    }
    
    // Parse dates from the format "February 10, 2026 – February 13, 2026"
    const dateParts = approvalBooking.dates.split(' – ');
    const startDate = dateParts[0] ? new Date(dateParts[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const endDate = dateParts[1] ? new Date(dateParts[1]).toISOString().split('T')[0] : startDate;
    
    // Determine booking type from booking source
    let bookingType = "Standard";
    if (approvalBooking.bookingSource === "Customized") {
      bookingType = "Customized";
    } else if (approvalBooking.bookingSource === "Generated") {
      bookingType = "Standard";
    }
    
    return {
      id: approvalBooking.id,
      customer: approvalBooking.customer,
      email: approvalBooking.email,
      mobile: approvalBooking.mobile,
      destination: approvalBooking.destination,
      startDate: startDate,
      endDate: endDate,
      travelers: approvalBooking.travelers || 1,
      totalAmount: totalAmount,
      paid: paid,
      bookedDate: approvalBooking.bookedDate || new Date().toISOString().split('T')[0],
      bookingType: bookingType,
      status: "confirmed",
      bookingSource: approvalBooking.bookingSource || "Generated",
      paymentStatus: approvalBooking.paymentStatus || "Unpaid",
      tourType: approvalBooking.tourType || "Private",
    };
  };

  // In App.tsx, update the handleBookingApproved function:
  const handleBookingApproved = (booking: ApprovalBooking): string => {
    // Convert ApprovalBooking to BookingData format
    const newBooking = convertApprovalToBooking(booking);

    // Add to bookings state
    setBookings(prev => [newBooking, ...prev]);
    
    // Also add to createdBookings if needed
    setCreatedBookings(prev => [newBooking, ...prev]);

    return booking.id; // Return the booking ID for redirection
  };

  // Function to move booking from Bookings to Approvals
  const moveBookingToApprovals = (booking: BookingData) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const durationDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const today = new Date();
    const daysUntilTrip = Math.ceil(
      (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isUrgent = daysUntilTrip <= 7;

    const approvalBooking: ApprovalBooking = {
      id: booking.id,
      customer: booking.customer,
      email: booking.email,
      mobile: booking.mobile,
      destination: booking.destination,
      duration: `${durationDays} Days`,
      dates: formatDateRange(booking.startDate, booking.endDate),
      total: `₱${booking.totalAmount.toLocaleString()}`,
      travelers: booking.travelers,
      urgent: isUrgent,
      bookedDate: booking.bookedDate,
      bookingSource: booking.bookingSource as "Customized" | "Generated" || (booking.bookingType === "Customized" ? "Customized" : "Generated"),
      paymentStatus: booking.paymentStatus || "Unpaid",
      tourType: booking.tourType || "Private",
    };

    setPendingApprovals((prev) => [approvalBooking, ...prev]);
    navigate("/approvals");
  };

  const moveBookingToRequested = (booking: BookingData) => {
    setRequestedBookingsFromBookings((prev) => [booking, ...prev]);
    navigate("/itinerary");
  };

  const handleCreateBooking = (newBooking: BookingData) => {
    setCreatedBookings((prev) => [newBooking, ...prev]);
    setBookings(prev => [newBooking, ...prev]);
    navigate("/bookings");
  };

  const handleCreateStandardItinerary = (newItinerary: any) => {
    setStandardItineraries((prev) => [newItinerary, ...prev]);
    // Remove draft if it exists
    if (editingStandardDraft) {
      setDrafts((prev) => prev.filter((d) => d.id !== editingStandardDraft.id));
      setEditingStandardDraft(null);
    }
    navigate("/itinerary");
  };

  const handleSaveDraft = (draft: any) => {
    setDrafts((prev) => {
      const existingIndex = prev.findIndex((d) => d.id === draft.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = draft;
        return updated;
      }
      return [draft, ...prev];
    });
  };

  const handleEditStandardItinerary = (itinerary: any) => {
    setEditingItinerary(itinerary);
    navigate("/itinerary/edit-standard");
  };

  const handleUpdateStandardItinerary = (updatedItinerary: any) => {
    setStandardItineraries((prev) =>
      prev.map((it) => (it.id === updatedItinerary.id ? updatedItinerary : it))
    );
    setEditingItinerary(null);
    navigate("/itinerary");
  };

  const handleEditRequestedBooking = (booking: any) => {
    setEditingRequestedBooking(booking);
    navigate("/itinerary/edit-requested");
  };

  const handleUpdateRequestedBooking = (updatedBooking: any) => {
    setRequestedBookingsFromBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
    setEditingRequestedBooking(null);
    navigate("/itinerary");
  };

  const handleSaveRequestedItinerary = (newBooking: any) => {
    setRequestedBookingsFromBookings((prev) => [newBooking, ...prev]);
    // Remove draft if it exists
    if (editingRequestedDraft) {
      setDrafts((prev) =>
        prev.filter((d) => d.id !== editingRequestedDraft.id)
      );
    }
    setEditingRequestedDraft(null);
    navigate("/itinerary");
  };

  const handleEditRequestedDraft = (draft: any) => {
    setEditingRequestedDraft(draft);
    navigate("/itinerary/create-requested");
  };

  const handleEditStandardDraft = (draft: any) => {
    setEditingStandardDraft(draft);
    navigate("/itinerary/create-standard");
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const moveBookingToHistory = (
    booking: BookingData,
    status: "completed" | "cancelled",
    cancellationReason?: string
  ) => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const historyBooking: HistoryBooking = {
      id: booking.id,
      customer: booking.customer,
      email: booking.email,
      mobile: booking.mobile,
      destination: booking.destination,
      itinerary: booking.destination,
      dates: formatDateRange(booking.startDate, booking.endDate),
      travelers: booking.travelers,
      totalAmount: `₱${booking.totalAmount.toLocaleString()}`,
      paid: `₱${booking.paid.toLocaleString()}`,
      bookedDate: booking.bookedDate,
      status: status,
      completedDate: status === "completed" ? today : undefined,
      cancelledDate: status === "cancelled" ? today : undefined,
      cancellationReason:
        status === "cancelled" ? cancellationReason : undefined,
      bookingType: booking.bookingType,
      paymentStatus: booking.paymentStatus, // Added
      tourType: booking.tourType, // Added
    };

    setHistoryBookings((prev) => {
      const exists = prev.some((b) => b.id === booking.id);
      if (exists) {
        return prev.map((b) => (b.id === booking.id ? historyBooking : b));
      }
      return [historyBooking, ...prev];
    });
  };

  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route
        path="/"
        element={
          <Dashboard
            pendingApprovalsCount={pendingApprovals.length}
            historyBookings={historyBookings}
            createdBookings={createdBookings}
            activeBookingsCount={activeBookingsCount}
          />
        }
      />
      <Route path="/users" element={<Users />} />
      <Route
        path="/bookings"
        element={
          <Bookings
            onMoveToApprovals={moveBookingToApprovals}
            onMoveToRequested={moveBookingToRequested}
            onMoveToHistory={moveBookingToHistory}
            createdBookings={createdBookings}
            onBookingsCountChange={setActiveBookingsCount}
          />
        }
      />
      <Route
        path="/approvals"
        element={
          <Approvals
            pendingBookings={pendingApprovals}
            setPendingBookings={setPendingApprovals}
            onApprove={handleBookingApproved}
          />
        }
      />
      <Route
        path="/history"
        element={
          <History
            historyBookings={historyBookings}
            setHistoryBookings={setHistoryBookings}
          />
        }
      />
      <Route
        path="/itinerary"
        element={
          <Itinerary
            onCreateBooking={handleCreateBooking}
            requestedBookingsFromBookings={requestedBookingsFromBookings}
            newStandardItineraries={standardItineraries}
            drafts={drafts}
            onEditItinerary={handleEditStandardItinerary}
            onEditRequestedBooking={handleEditRequestedBooking}
            onEditRequestedDraft={handleEditRequestedDraft}
            onEditStandardDraft={handleEditStandardDraft}
            onDeleteDraft={handleDeleteDraft}
          />
        }
      />
      <Route
        path="/itinerary/create-standard"
        element={
          <CreateStandardItinerary
            onSave={handleCreateStandardItinerary}
            onSaveDraft={handleSaveDraft}
            initialData={editingStandardDraft || undefined}
          />
        }
      />
      <Route
        path="/itinerary/edit-standard/:id"
        element={<EditStandardItinerary />}
      />
      <Route
        path="/itinerary/edit-requested/:id"
        element={<EditRequestedItinerary />}
      />
      <Route
        path="/itinerary/create-requested"
        element={
          <CreateRequestedItinerary
            onSave={handleSaveRequestedItinerary}
            onSaveDraft={handleSaveDraft}
            initialData={editingRequestedDraft || undefined}
          />
        }
      />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/inquiries" element={<Inquiries />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/activity-log" element={<ActivityLog />} />

      {/* User Side Routes */}
      <Route path="/user/home" element={<UserHome />} />
      <Route path="/user/travels" element={<UserTravels />} />
      <Route
        path="/user/travels/edit/:id"
        element={<EditCustomizedBooking />}
      />
      <Route
        path="/user/standard-itinerary"
        element={<UserStandardItinerary />}
      />
      <Route path="/user/smart-trip" element={<SmartTrip />} />
      <Route path="/user/create-new-travel" element={<CreateNewTravel />} />
      <Route path="/user/bookings" element={<UserBookings />} />
      <Route path="/user/bookings/:id" element={<UserBookingDetail />} />
      <Route path="/user/history" element={<UserHistory />} />
      <Route path="/user/history/:id" element={<UserHistoryDetail />} />
      <Route path="/user/activity" element={<UserActivity />} />
      <Route path="/user/inquiries" element={<UserInquiries />} />
      <Route path="/user/feedback" element={<UserFeedback />} />
      <Route path="/user/weather" element={<WeatherForecast />} />
      <Route path="/user/translation" element={<Translation />} />
      <Route path="/user/spin-wheel" element={<SpinTheWheel />} />
      <Route path="/user/profile/edit" element={<UserEditProfile />} />
      <Route path="/user/notifications" element={<UserNotifications />} />

      {/* FAQ Management Route */}
      <Route path="/faq" element={<FaqPage />} />

      {/* Catch-all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SideProvider>
        <ProfileProvider>
          <BookingProvider>
            <BreadcrumbProvider>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
            </BreadcrumbProvider>
          </BookingProvider>
        </ProfileProvider>
      </SideProvider>
    </BrowserRouter>
  );
}