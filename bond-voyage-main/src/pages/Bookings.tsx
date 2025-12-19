import { Calendar, MapPin, User, Users, Globe, Eye, Edit, RotateCcw, X, ChevronLeft, ChevronRight, Phone, Mail, CreditCard, CheckCircle2, Package, Clock, Plane, Hotel, Camera, UtensilsCrossed, Car, Briefcase, FileCheck, ClipboardList, BookOpen, Download, Pen, Save, Banknote, Smartphone, Wallet, TrendingUp, Receipt, ChevronDown, AlertCircle, Shield, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button as ShadcnButton } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { SearchFilterToolbar, SortOrder } from "../components/SearchFilterToolbar";
import { BookingFilterContent } from "../components/filters/BookingFilterContent";
import { ContentCard } from "../components/ContentCard";
import { ItineraryDetailDisplay } from "../components/ItineraryDetailDisplay";
import { StatCard } from "../components/StatCard";
import { formatDateRange } from "../App";
import { Pagination } from "../components/Pagination";
import { toast } from "sonner@2.0.3";
import { useBreadcrumbs } from "../components/BreadcrumbContext";
import { exportToPDF, exportToExcel, exportBookingDetailToPDF, exportBookingDetailToExcel } from "../utils/exportUtils";

interface PaymentSubmission {
  id: string;
  paymentType: "Full Payment" | "Partial Payment";
  amount: number;
  modeOfPayment: "Cash" | "Gcash";
  proofOfPayment?: string;
  cashConfirmation?: string;
  submittedAt: string;
  status?: "pending" | "verified" | "rejected";
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

type Booking = {
  id: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  itinerary: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalAmount: number;
  paid: number;
  paymentStatus: string;
  bookedDate: string;
  bookedDateObj: Date;
  status: string; // Changed from "active" or "pending" to "confirmed"
  bookingType?: "Customized" | "Requested" | "Standard";
  tourType?: "Joiner" | "Private";
  itineraryDetails?: ItineraryDay[];
  modeOfPayment?: "Cash" | "Gcash" | "";
  paymentHistory?: PaymentSubmission[];
  totalPaid?: number;
  tripStatus?: string;
  bookingSource?: "Standard" | "Customized"; // Added for compatibility with Approvals
};

type ItineraryDay = {
  day: number;
  title: string;
  activities: {
    time: string;
    icon: any;
    title: string;
    description: string;
    location?: string;
  }[];
};

interface BookingsProps {
  onMoveToApprovals: (booking: Booking) => void;
  onMoveToRequested: (booking: Booking) => void;
  onMoveToHistory: (booking: Booking, status: "completed" | "cancelled", cancellationReason?: string) => void;
  createdBookings?: Booking[];
  onBookingsCountChange?: (count: number) => void;
  // Add prop to receive bookings from Approvals
  approvedBookings?: any[];
}

export function Bookings({ onMoveToApprovals, onMoveToRequested, onMoveToHistory, createdBookings = [], onBookingsCountChange, approvedBookings = [] }: BookingsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbs();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  
  // View state
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [travelDateFrom, setTravelDateFrom] = useState("");
  const [travelDateTo, setTravelDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for standard bookings from UserStandardItinerary
  const [standardBookingsFromUser, setStandardBookingsFromUser] = useState<Booking[]>([]);

  // Edit payment state
  const [editingPayment, setEditingPayment] = useState(false);

  // Edit modal states for Standard bookings
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [editFormData, setEditFormData] = useState({
    customerName: "",
    email: "",
    mobile: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
  });

  // Modal states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [moveToApprovalsDialogOpen, setMoveToApprovalsDialogOpen] = useState(false);
  const [moveToRequestedDialogOpen, setMoveToRequestedDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [bookingToComplete, setBookingToComplete] = useState<Booking | null>(null);
  const [bookingToMoveToApprovals, setBookingToMoveToApprovals] = useState<Booking | null>(null);
  const [bookingToMoveToRequested, setBookingToMoveToRequested] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  // Payment detail modal state
  const [selectedPayment, setSelectedPayment] = useState<PaymentSubmission | null>(null);
  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);

  // Payment verification states
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Payment settings from localStorage (admin EditProfile)
  const [paymentSettings, setPaymentSettings] = useState(() => {
    const saved = localStorage.getItem('paymentSettings');
    return saved ? JSON.parse(saved) : {
      accountName: "4B'S TRAVEL AND TOURS",
      gcashMobile: '0994 631 1233',
      gcashQrCode: ''
    };
  });

  // Helper function to convert ApprovalBooking to Booking format
  const convertApprovalToBooking = (approvalBooking: any): Booking => {
    const totalAmount = parseInt(approvalBooking.total.replace(/[₱,]/g, '')) || 0;
    const paid = approvalBooking.paymentStatus === "Paid" ? totalAmount : 
                 approvalBooking.paymentStatus === "Partial" ? totalAmount / 2 : 0;
    const totalPaid = paid;
    
    // Parse dates from the format "February 10, 2026 – February 13, 2026"
    let startDate, endDate;
    if (approvalBooking.dates && approvalBooking.dates.includes(' – ')) {
      const dateParts = approvalBooking.dates.split(' – ');
      startDate = dateParts[0] ? new Date(dateParts[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      endDate = dateParts[1] ? new Date(dateParts[1]).toISOString().split('T')[0] : startDate;
    } else {
      // Handle cases where dates might be in different format
      startDate = approvalBooking.startDate || new Date().toISOString().split('T')[0];
      endDate = approvalBooking.endDate || startDate;
    }
    
    // Determine booking type from bookingSource
    let bookingType: "Customized" | "Requested" | "Standard" = "Standard";
    if (approvalBooking.bookingSource === "Customized") {
      bookingType = "Customized";
    } else if (approvalBooking.bookingType === "Requested") {
      bookingType = "Requested";
    }
    
    return {
      id: approvalBooking.id,
      customer: approvalBooking.customer,
      email: approvalBooking.email,
      mobile: approvalBooking.mobile,
      destination: approvalBooking.destination,
      itinerary: approvalBooking.destination || approvalBooking.itinerary || "Itinerary",
      startDate: startDate,
      endDate: endDate,
      travelers: approvalBooking.travelers || 1,
      totalAmount: totalAmount,
      paid: paid,
      paymentStatus: approvalBooking.paymentStatus || "Unpaid",
      bookedDate: approvalBooking.bookedDate || new Date().toISOString().split('T')[0],
      bookedDateObj: new Date(approvalBooking.bookedDate || new Date()),
      status: "confirmed",
      bookingType: bookingType,
      tourType: approvalBooking.tourType || "Private",
      modeOfPayment: approvalBooking.modeOfPayment || "",
      paymentHistory: approvalBooking.paymentHistory || [],
      totalPaid: totalPaid,
      bookingSource: approvalBooking.bookingSource || "Standard",
    };
  };

  const [bookings, setBookings] = useState<Booking[]>([
    // BV-2025-001 - Maria Santos - Boracay
    {
      id: "BV-2025-001",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Boracay, Aklan",
      itinerary: "Boracay 5-Day Beach Paradise",
      startDate: "2025-12-20",
      endDate: "2025-12-25",
      travelers: 4,
      totalAmount: 85500,
      paid: 0,
      paymentStatus: "Unpaid",
      bookedDate: "2025-11-10",
      bookedDateObj: new Date("2025-11-10"),
      status: "confirmed",
      bookingType: "Standard",
      tourType: "Private",
      modeOfPayment: "",
      paymentHistory: [],
      totalPaid: 0,
      bookingSource: "Standard",
      itineraryDetails: [
        {
          day: 1,
          title: "Arrival & Beach Welcome",
          activities: [
            { time: "10:00 AM", icon: Plane, title: "Arrival at Caticlan Airport", description: "Transfer to Boracay Island", location: "Caticlan Airport" },
            { time: "12:00 PM", icon: Hotel, title: "Resort Check-in", description: "Beachfront resort at Station 2", location: "White Beach" },
            { time: "3:00 PM", icon: Camera, title: "Beach Exploration", description: "Relax at White Beach", location: "Station 2" },
            { time: "6:00 PM", icon: UtensilsCrossed, title: "Welcome Dinner", description: "Seafood dinner by the beach", location: "D'Mall Area" },
          ],
        },
        {
          day: 2,
          title: "Island Hopping Adventure",
          activities: [
            { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Resort breakfast buffet", location: "Resort" },
            { time: "9:00 AM", icon: Plane, title: "Island Hopping Tour", description: "Visit Crystal Cove, Crocodile Island", location: "Boracay Islands" },
            { time: "12:00 PM", icon: UtensilsCrossed, title: "Beach Lunch", description: "Fresh catch of the day", location: "Puka Beach" },
            { time: "3:00 PM", icon: Camera, title: "Snorkeling", description: "Underwater adventure", location: "Coral Garden" },
          ],
        },
      ],
    },
    // BV-2025-002 - Juan Dela Cruz - El Nido
    {
      id: "BV-2025-002",
      customer: "Juan Dela Cruz",
      email: "juan.delacruz@email.com",
      mobile: "+63 918 234 5678",
      destination: "El Nido, Palawan",
      itinerary: "El Nido 5-Day Exploration",
      startDate: "2026-01-15",
      endDate: "2026-01-20",
      travelers: 2,
      totalAmount: 62000,
      paid: 31000,
      paymentStatus: "Partial",
      bookedDate: "2025-11-08",
      bookedDateObj: new Date("2025-11-08"),
      status: "confirmed",
      bookingType: "Customized",
      tourType: "Private",
      modeOfPayment: "Gcash",
      paymentHistory: [
        {
          id: "PAY-2025-002-1",
          paymentType: "Partial Payment",
          amount: 31000,
          modeOfPayment: "Gcash",
          proofOfPayment: "https://example.com/proof1.jpg",
          submittedAt: "2025-11-08T10:30:00Z",
          status: "pending"
        }
      ],
      totalPaid: 31000,
      bookingSource: "Customized",
      itineraryDetails: [
        {
          day: 1,
          title: "Arrival & Town Exploration",
          activities: [
            { time: "11:00 AM", icon: Plane, title: "Arrival at El Nido Airport", description: "Airport transfer to hotel", location: "El Nido Airport" },
            { time: "1:00 PM", icon: Hotel, title: "Hotel Check-in", description: "Beach resort check-in", location: "Corong-Corong Beach" },
            { time: "4:00 PM", icon: Camera, title: "Town Walk", description: "Explore El Nido town", location: "El Nido Town Proper" },
            { time: "7:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Local Filipino cuisine", location: "El Nido Town" },
          ],
        },
        {
          day: 2,
          title: "Tour A - Lagoons & Beaches",
          activities: [
            { time: "7:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Packed breakfast", location: "Hotel" },
            { time: "8:00 AM", icon: Plane, title: "Big Lagoon", description: "Kayaking in crystal waters", location: "Miniloc Island" },
            { time: "10:00 AM", icon: Camera, title: "Small Lagoon", description: "Swimming and snorkeling", location: "Miniloc Island" },
            { time: "12:00 PM", icon: UtensilsCrossed, title: "Beach Lunch", description: "BBQ lunch on the beach", location: "Shimizu Island" },
            { time: "2:00 PM", icon: Camera, title: "Secret Lagoon", description: "Hidden lagoon exploration", location: "Secret Beach" },
          ],
        },
      ],
    },
    // BV-2025-003 - Ana Reyes - Baguio
    {
      id: "BV-2025-003",
      customer: "Ana Reyes",
      email: "ana.reyes@email.com",
      mobile: "+63 919 345 6789",
      destination: "Baguio City, Benguet",
      itinerary: "Baguio 3-Day Summer Escape",
      startDate: "2025-12-28",
      endDate: "2025-12-30",
      travelers: 3,
      totalAmount: 38750,
      paid: 38750,
      paymentStatus: "Paid",
      bookedDate: "2025-11-01",
      bookedDateObj: new Date("2025-11-01"),
      status: "confirmed",
      bookingType: "Standard",
      tourType: "Joiner",
      modeOfPayment: "Cash",
      paymentHistory: [
        {
          id: "PAY-2025-003-1",
          paymentType: "Full Payment",
          amount: 38750,
          modeOfPayment: "Cash",
          cashConfirmation: "https://example.com/cash1.jpg",
          submittedAt: "2025-11-01T14:20:00Z",
          status: "verified",
          verifiedBy: "Admin User",
          verifiedAt: "2025-11-01T15:00:00Z"
        }
      ],
      totalPaid: 38750,
      bookingSource: "Standard",
      itineraryDetails: [
        {
          day: 1,
          title: "Arrival & City Tour",
          activities: [
            { time: "8:00 AM", icon: Car, title: "Departure from Manila", description: "Comfortable bus ride", location: "Manila" },
            { time: "2:00 PM", icon: Hotel, title: "Hotel Check-in", description: "City center hotel", location: "Baguio City" },
            { time: "3:30 PM", icon: Camera, title: "Burnham Park", description: "Boat ride and park tour", location: "Burnham Park" },
            { time: "5:00 PM", icon: Camera, title: "Session Road", description: "Shopping and street food", location: "Session Road" },
          ],
        },
        {
          day: 2,
          title: "Nature & Culture",
          activities: [
            { time: "6:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Hotel breakfast", location: "Hotel" },
            { time: "7:30 AM", icon: Camera, title: "Mines View Park", description: "Panoramic mountain views", location: "Mines View Park" },
            { time: "9:00 AM", icon: Camera, title: "Botanical Garden", description: "Igorot village visit", location: "Botanical Garden" },
            { time: "11:00 AM", icon: UtensilsCrossed, title: "Strawberry Farm", description: "Strawberry picking & lunch", location: "La Trinidad" },
          ],
        },
      ],
    },
    // BV-2025-004 - Carlos Mendoza - Oslob
    {
      id: "BV-2025-004",
      customer: "Carlos Mendoza",
      email: "carlos.mendoza@email.com",
      mobile: "+63 920 456 7890",
      destination: "Oslob, Cebu",
      itinerary: "Oslob 3-Day Whale Shark Experience",
      startDate: "2026-02-10",
      endDate: "2026-02-13",
      travelers: 2,
      totalAmount: 45200,
      paid: 22600,
      paymentStatus: "Partial",
      bookedDate: "2025-11-05",
      bookedDateObj: new Date("2025-11-05"),
      status: "confirmed",
      bookingType: "Customized",
      tourType: "Private",
      modeOfPayment: "Gcash",
      paymentHistory: [
        {
          id: "PAY-2025-004-1",
          paymentType: "Partial Payment",
          amount: 22600,
          modeOfPayment: "Gcash",
          proofOfPayment: "https://example.com/proof2.jpg",
          submittedAt: "2025-11-05T09:15:00Z",
          status: "pending"
        }
      ],
      totalPaid: 22600,
      bookingSource: "Customized",
      itineraryDetails: [
        {
          day: 1,
          title: "Arrival & Beach Relaxation",
          activities: [
            { time: "10:00 AM", icon: Plane, title: "Arrival at Mactan Airport", description: "Transfer to Oslob", location: "Mactan-Cebu Airport" },
            { time: "1:00 PM", icon: Hotel, title: "Resort Check-in", description: "Beachfront resort", location: "Oslob" },
            { time: "3:00 PM", icon: Camera, title: "Beach Time", description: "Relax by the sea", location: "Oslob Beach" },
            { time: "6:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Fresh seafood", location: "Resort Restaurant" },
          ],
        },
        {
          day: 2,
          title: "Whale Shark Encounter",
          activities: [
            { time: "5:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Light breakfast", location: "Resort" },
            { time: "6:00 AM", icon: Camera, title: "Whale Shark Watching", description: "Swim with whale sharks", location: "Oslob Whale Shark Sanctuary" },
            { time: "9:00 AM", icon: Camera, title: "Tumalog Falls", description: "Waterfall visit", location: "Tumalog Falls" },
            { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Local restaurant", location: "Oslob Town" },
            { time: "2:00 PM", icon: Camera, title: "Sumilon Island", description: "Island hopping", location: "Sumilon Island" },
          ],
        },
      ],
    },
    // BV-2025-005 - Elena Rodriguez - Siargao
    {
      id: "BV-2025-005",
      customer: "Elena Rodriguez",
      email: "elena.rodriguez@email.com",
      mobile: "+63 921 567 8901",
      destination: "Siargao Island, Surigao del Norte",
      itinerary: "Siargao 5-Day Surf & Island Adventure",
      startDate: "2025-12-10",
      endDate: "2025-12-15",
      travelers: 3,
      totalAmount: 72000,
      paid: 0,
      paymentStatus: "Unpaid",
      bookedDate: "2025-10-20",
      bookedDateObj: new Date("2025-10-20"),
      status: "confirmed",
      bookingType: "Requested",
      tourType: "Private",
      modeOfPayment: "",
      paymentHistory: [],
      totalPaid: 0,
      bookingSource: "Customized",
      itineraryDetails: [
        {
          day: 1,
          title: "Arrival & Surf Lesson",
          activities: [
            { time: "12:00 PM", icon: Plane, title: "Arrival at Siargao Airport", description: "Transfer to resort", location: "Siargao Airport" },
            { time: "2:00 PM", icon: Hotel, title: "Resort Check-in", description: "Beachfront surf resort", location: "General Luna" },
            { time: "4:00 PM", icon: Camera, title: "Beginner Surf Lesson", description: "2-hour surf instruction", location: "Cloud 9" },
            { time: "7:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Beachfront dining", location: "General Luna" },
          ],
        },
        {
          day: 2,
          title: "Island Hopping Tour",
          activities: [
            { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Resort breakfast", location: "Resort" },
            { time: "9:00 AM", icon: Plane, title: "Naked Island", description: "Sandbar paradise", location: "Naked Island" },
            { time: "10:30 AM", icon: Camera, title: "Daku Island", description: "Beach lunch stop", location: "Daku Island" },
            { time: "2:00 PM", icon: Camera, title: "Guyam Island", description: "Coconut island visit", location: "Guyam Island" },
          ],
        },
      ],
    },
    // BV-2025-006 - Miguel Santos - Vigan
    {
      id: "BV-2025-006",
      customer: "Miguel Santos",
      email: "miguel.santos@email.com",
      mobile: "+63 922 678 9012",
      destination: "Vigan, Ilocos Sur",
      itinerary: "Vigan 3-Day Heritage Tour",
      startDate: "2025-11-05",
      endDate: "2025-11-08",
      travelers: 4,
      totalAmount: 52000,
      paid: 0,
      paymentStatus: "Unpaid",
      bookedDate: "2025-10-01",
      bookedDateObj: new Date("2025-10-01"),
      status: "confirmed",
      bookingType: "Standard",
      tourType: "Private",
      modeOfPayment: "",
      paymentHistory: [],
      totalPaid: 0,
      bookingSource: "Standard",
      itineraryDetails: [
        {
          day: 1,
          title: "Arrival & Heritage Walk",
          activities: [
            { time: "8:00 AM", icon: Car, title: "Departure from Manila", description: "Comfortable van transfer", location: "Manila" },
            { time: "4:00 PM", icon: Hotel, title: "Heritage Hotel Check-in", description: "Spanish colonial hotel", location: "Calle Crisologo" },
            { time: "6:00 PM", icon: Camera, title: "Kalesa Ride", description: "Horse-drawn carriage tour", location: "Heritage Village" },
            { time: "8:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Ilocano cuisine", location: "Cafe Leona" },
          ],
        },
        {
          day: 2,
          title: "Cultural Exploration",
          activities: [
            { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Traditional Ilocano breakfast", location: "Hotel" },
            { time: "8:30 AM", icon: Camera, title: "Bantay Bell Tower", description: "Historic watchtower", location: "Bantay" },
            { time: "10:00 AM", icon: Camera, title: "Pottery Making", description: "Jar-making demonstration", location: "Pagburnayan" },
            { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Empanada tasting", location: "Plaza Burgos" },
            { time: "2:00 PM", icon: Camera, title: "Crisologo Museum", description: "Historical artifacts", location: "Calle Crisologo" },
          ],
        },
      ],
    },
  ]);

  // Handle redirection
  useEffect(() => {
    if (location.state?.scrollToId && location.state?.highlightBooking) {
      const bookingId = location.state.scrollToId;
      const bookingExists = bookings.some(b => b.id === bookingId);
      
      if (bookingExists) {
        setTimeout(() => {
          const element = document.getElementById(`booking-${bookingId}`);
          if (element) {
            const headerOffset = 120;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
            
            element.classList.add('booking-highlight');
            
            element.style.transform = 'scale(1.01)';
            element.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            setTimeout(() => {
              element.style.transform = 'scale(1)';
              setTimeout(() => {
                element.classList.remove('booking-highlight');
              }, 2000);
            }, 800);
            
            navigate(location.pathname, { replace: true, state: {} });
          }
        }, 300);
      }
    }
  }, [location.state, bookings, navigate, location.pathname]);

  // Add CSS for highlight effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .booking-highlight {
        animation: highlight 2s ease-in-out;
        border-radius: 1rem;
      }
      
      @keyframes highlight {
        0%, 100% {
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 3px rgba(10, 122, 255, 0.3), 0 4px 6px rgba(10, 122, 255, 0.1);
          transform: scale(1.005);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load standard bookings from localStorage that were created in UserStandardItinerary
  useEffect(() => {
    const savedAdminBookings = localStorage.getItem('adminStandardBookings');
    if (savedAdminBookings) {
      const adminBookings = JSON.parse(savedAdminBookings);
      const converted: Booking[] = adminBookings.map((booking: any) => {
        const totalPaid = booking.totalPaid || 0;
        const totalAmount = parseInt(booking.amount.replace(/[₱,]/g, ''));
        let paymentStatus = "Unpaid";
        
        if (totalPaid >= totalAmount) {
          paymentStatus = "Paid";
        } else if (totalPaid > 0) {
          paymentStatus = "Partial";
        }

        return {
          id: booking.id,
          customer: booking.customer,
          email: booking.email,
          mobile: booking.mobile,
          destination: booking.destination,
          itinerary: booking.itinerary,
          startDate: booking.dates.split(' – ')[0],
          endDate: booking.dates.split(' – ')[1] || booking.dates.split(' – ')[0],
          travelers: booking.travelers,
          totalAmount: totalAmount,
          paid: totalPaid,
          paymentStatus: paymentStatus,
          bookedDate: booking.bookingDate,
          bookedDateObj: new Date(booking.bookingDate),
          status: "confirmed",
          bookingType: "Standard" as const,
          tourType: booking.tourType,
          modeOfPayment: booking.paymentHistory && booking.paymentHistory.length > 0 
            ? booking.paymentHistory[booking.paymentHistory.length - 1].modeOfPayment 
            : "",
          paymentHistory: booking.paymentHistory || [],
          totalPaid: totalPaid,
          bookingSource: "Standard",
        };
      });
      setStandardBookingsFromUser(converted);
    }
  }, []);

  // Handle approved bookings from Approvals page
  useEffect(() => {
    if (approvedBookings && approvedBookings.length > 0) {
      const convertedBookings = approvedBookings.map(convertApprovalToBooking);
      
      setBookings(prevBookings => {
        const existingIds = new Set(prevBookings.map(b => b.id));
        const newBookings = convertedBookings.filter(b => !existingIds.has(b.id));
        return [...newBookings, ...prevBookings];
      });
    }
  }, [approvedBookings]);

  // Merge created bookings from Itinerary page and standard bookings from users
  useEffect(() => {
    const allNewBookings = [...createdBookings, ...standardBookingsFromUser];
    if (allNewBookings.length > 0) {
      setBookings(prevBookings => {
        const existingIds = new Set(prevBookings.map(b => b.id));
        const newBookings = allNewBookings.filter(b => !existingIds.has(b.id));
        
        const confirmedNewBookings = newBookings.map(b => ({
          ...b,
          status: "confirmed"
        }));
        
        return [...confirmedNewBookings, ...prevBookings];
      });
    }
  }, [createdBookings, standardBookingsFromUser]);

  // Sync payment updates from user side periodically
  useEffect(() => {
    const syncPaymentData = () => {
      const savedAdminBookings = localStorage.getItem('adminStandardBookings');
      if (savedAdminBookings) {
        const adminBookings = JSON.parse(savedAdminBookings);
        
        setBookings(prevBookings => {
          return prevBookings.map(booking => {
            const updatedBooking = adminBookings.find((ab: any) => ab.id === booking.id);
            if (updatedBooking && updatedBooking.paymentHistory) {
              const verifiedPayments = updatedBooking.paymentHistory.filter((p: any) => p.status === "verified");
              const totalPaid = verifiedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
              const totalAmount = booking.totalAmount;
              let paymentStatus = "Unpaid";
              
              if (totalPaid >= totalAmount) {
                paymentStatus = "Paid";
              } else if (totalPaid > 0) {
                paymentStatus = "Partial";
              }

              return {
                ...booking,
                paid: totalPaid,
                totalPaid: totalPaid,
                paymentStatus: paymentStatus,
                paymentHistory: updatedBooking.paymentHistory,
                modeOfPayment: updatedBooking.paymentHistory.length > 0 
                  ? updatedBooking.paymentHistory[updatedBooking.paymentHistory.length - 1].modeOfPayment 
                  : booking.modeOfPayment,
                status: "confirmed",
              };
            }
            return booking;
          });
        });
      }
    };

    syncPaymentData();
    const interval = setInterval(syncPaymentData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Check for completed bookings (past travel dates) automatically
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedBookings = bookings.filter(booking => {
      const endDate = new Date(booking.endDate);
      endDate.setHours(0, 0, 0, 0);
      return endDate < today;
    });
    
    if (completedBookings.length > 0) {
      completedBookings.forEach(booking => {
        onMoveToHistory(booking, "completed");
      });
      
      setBookings(prevBookings => 
        prevBookings.filter(booking => {
          const endDate = new Date(booking.endDate);
          endDate.setHours(0, 0, 0, 0);
          return endDate >= today;
        })
      );
    }
  }, [bookings, onMoveToHistory]);

  // Update active bookings count in parent
  useEffect(() => {
    if (onBookingsCountChange) {
      onBookingsCountChange(bookings.length);
    }
  }, [bookings, onBookingsCountChange]);

  // Update breadcrumbs based on view mode
  useEffect(() => {
    if (viewMode === "detail" && selectedBookingId) {
      const currentBooking = bookings.find(b => b.id === selectedBookingId);
      if (currentBooking) {
        setBreadcrumbs([
          { label: "Home", path: "/" },
          { label: "Bookings", path: "/bookings" },
          { label: `Booking ${currentBooking.id}` }
        ]);
      }
    } else {
      resetBreadcrumbs();
    }
  }, [viewMode, selectedBookingId, bookings, setBreadcrumbs, resetBreadcrumbs]);

  const itineraryData: Record<string, ItineraryDay[]> = {};

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  const selectedItinerary = selectedBooking?.itineraryDetails || (selectedBookingId ? itineraryData[selectedBookingId] || [] : []);

  const activeFiltersCount = 
    (dateFrom || dateTo ? 1 : 0) + 
    (travelDateFrom || travelDateTo ? 1 : 0) + 
    (minAmount || maxAmount ? 1 : 0);

  const getFilteredBookings = () => {
    let filtered = bookings;

    // Filter to ensure only confirmed bookings are shown
    filtered = filtered.filter(b => b.status === "confirmed");

    if (selectedStatus !== "all") {
      filtered = filtered.filter(b => b.paymentStatus.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Apply booking type filter
    if (selectedTypeFilter) {
      filtered = filtered.filter(b => b.bookingType === selectedTypeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (dateFrom || dateTo) {
      filtered = filtered.filter(b => {
        const bookingDate = b.bookedDateObj;
        if (dateFrom && dateTo) {
          return bookingDate >= new Date(dateFrom) && bookingDate <= new Date(dateTo);
        } else if (dateFrom) {
          return bookingDate >= new Date(dateFrom);
        } else if (dateTo) {
          return bookingDate <= new Date(dateTo);
        }
        return true;
      });
    }

    if (travelDateFrom || travelDateTo) {
      filtered = filtered.filter(b => {
        const travelDate = new Date(b.startDate);
        if (travelDateFrom && travelDateTo) {
          return travelDate >= new Date(travelDateFrom) && travelDate <= new Date(travelDateTo);
        } else if (travelDateFrom) {
          return travelDate >= new Date(travelDateFrom);
        } else if (travelDateTo) {
          return travelDate <= new Date(travelDateTo);
        }
        return true;
      });
    }

    if (minAmount || maxAmount) {
      filtered = filtered.filter(b => {
        if (minAmount && maxAmount) {
          return b.totalAmount >= Number(minAmount) && b.totalAmount <= Number(maxAmount);
        } else if (minAmount) {
          return b.totalAmount >= Number(minAmount);
        } else if (maxAmount) {
          return b.totalAmount <= Number(maxAmount);
        }
        return true;
      });
    }

    if (sortOrder === "newest") {
      filtered = [...filtered].sort((a, b) => b.bookedDateObj.getTime() - a.bookedDateObj.getTime());
    } else if (sortOrder === "oldest") {
      filtered = [...filtered].sort((a, b) => a.bookedDateObj.getTime() - b.bookedDateObj.getTime());
    }

    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  // Calculate paginated bookings
  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  // Reset to page 1 when filters/search/sort/tab changes
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[#10B981]/20";
      case "Partial":
        return "bg-[rgba(255,184,77,0.1)] text-[#FFB84D] border-[#FFB84D]/20";
      case "Unpaid":
        return "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border-[#FF6B6B]/20";
      default:
        return "bg-[#F8FAFB] text-[#64748B] border-[#E5E7EB]";
    }
  };

  const getTripStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[#10B981]/20";
      case "ongoing":
        return "bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border-[#0A7AFF]/20";
      default:
        return "bg-[#F8FAFB] text-[#64748B] border-[#E5E7EB]";
    }
  };

  const getPaymentVerificationStatusColor = (status?: string) => {
    switch (status) {
      case "verified":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[#10B981]/20";
      case "rejected":
        return "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border-[#FF6B6B]/20";
      case "pending":
      default:
        return "bg-[rgba(255,184,77,0.1)] text-[#FFB84D] border-[#FFB84D]/20";
    }
  };

  const totalBookings = bookings.length;
  const activeBookingsCount = filteredBookings.length;
  const customizedCount = filteredBookings.filter(b => b.bookingType === "Customized").length;
  const standardCount = filteredBookings.filter(b => b.bookingType === "Standard").length;
  const requestedCount = filteredBookings.filter(b => b.bookingType === "Requested").length;

  const getActiveBookingsLabel = () => {
    switch (selectedStatus) {
      case "paid":
        return "Paid Bookings";
      case "partial":
        return "Partial Bookings";
      case "unpaid":
        return "Unpaid Bookings";
      default:
        return "Active Bookings";
    }
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (type: string | null) => {
    if (selectedTypeFilter === type) {
      setSelectedTypeFilter(null);
    } else {
      setSelectedTypeFilter(type);
    }
    setCurrentPage(1);
  };

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    handleFilterChange();
  };

  const handleApplyFilters = () => {
    setFilterOpen(false);
    handleFilterChange();
  };

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setTravelDateFrom("");
    setTravelDateTo("");
    setMinAmount("");
    setMaxAmount("");
    handleFilterChange();
  };

  const handleExportPDF = () => {
    const exportData = filteredBookings.map(booking => ({
      id: booking.id,
      customer: booking.customer,
      email: booking.email,
      mobile: booking.mobile,
      destination: booking.destination,
      startdate: new Date(booking.startDate).toLocaleDateString(),
      enddate: new Date(booking.endDate).toLocaleDateString(),
      travelers: `${booking.travelers} pax`,
      totalamount: `₱${booking.totalAmount.toLocaleString()}`,
      paymentstatus: booking.paymentStatus,
      bookingtype: booking.bookingType || 'N/A',
      status: booking.status,
    }));
    exportToPDF(exportData, "Bookings Report", ["ID", "Customer", "Email", "Mobile", "Destination", "Start Date", "End Date", "Travelers", "Total Amount", "Payment Status", "Booking Type", "Status"]);
    toast.success("Exporting bookings as PDF...");
  };

  const handleExportExcel = () => {
    const exportData = filteredBookings.map(booking => ({
      id: booking.id,
      customer: booking.customer,
      email: booking.email,
      mobile: booking.mobile,
      destination: booking.destination,
      startdate: new Date(booking.startDate).toLocaleDateString(),
      enddate: new Date(booking.endDate).toLocaleDateString(),
      travelers: `${booking.travelers} pax`,
      totalamount: `₱${booking.totalAmount.toLocaleString()}`,
      paymentstatus: booking.paymentStatus,
      bookingtype: booking.bookingType || 'N/A',
      status: booking.status,
    }));
    exportToExcel(exportData, "Bookings Report", ["ID", "Customer", "Email", "Mobile", "Destination", "Start Date", "End Date", "Travelers", "Total Amount", "Payment Status", "Booking Type", "Status"]);
    toast.success("Exporting bookings as Excel...");
  };

  const handleEditBooking = (booking: Booking) => {
    setBookingToEdit(booking);
    setEditFormData({
      customerName: booking.customer,
      email: booking.email,
      mobile: booking.mobile,
      travelDateFrom: booking.startDate,
      travelDateTo: booking.endDate,
      travelers: booking.travelers.toString(),
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!bookingToEdit || !editFormData.customerName || !editFormData.email || !editFormData.mobile || !editFormData.travelDateFrom || !editFormData.travelDateTo) {
      alert("Please fill in all required fields");
      return;
    }

    const updatedBookings = bookings.map(b => {
      if (b.id === bookingToEdit.id) {
        return {
          ...b,
          customer: editFormData.customerName,
          email: editFormData.email,
          mobile: editFormData.mobile,
          startDate: editFormData.travelDateFrom,
          endDate: editFormData.travelDateTo,
          travelers: parseInt(editFormData.travelers),
          totalAmount: b.totalAmount / b.travelers * parseInt(editFormData.travelers),
          status: "confirmed",
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    setEditModalOpen(false);
    setBookingToEdit(null);
    setEditFormData({
      customerName: "",
      email: "",
      mobile: "",
      travelDateFrom: "",
      travelDateTo: "",
      travelers: "1",
    });
    toast.success(`Booking ${bookingToEdit.id} updated successfully!`);
  };

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setViewMode("detail");
    setEditingPayment(false);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBookingId(null);
    setEditingPayment(false);
  };

  const handleMoveToApprovalsClick = (booking: Booking) => {
    setBookingToMoveToApprovals(booking);
    setMoveToApprovalsDialogOpen(true);
  };

  const handleConfirmMoveToApprovals = () => {
    if (bookingToMoveToApprovals) {
      setBookings(bookings.filter(b => b.id !== bookingToMoveToApprovals.id));
      onMoveToApprovals(bookingToMoveToApprovals);
      toast.success(`Booking ${bookingToMoveToApprovals.id} moved to Booking Approval successfully!`);
      setMoveToApprovalsDialogOpen(false);
      setBookingToMoveToApprovals(null);
      
      if (viewMode === "detail") {
        setViewMode("list");
        setSelectedBookingId(null);
      }
    }
  };

  const handleMoveToRequestedClick = (booking: Booking) => {
    setBookingToMoveToRequested(booking);
    setMoveToRequestedDialogOpen(true);
  };

  const handleConfirmMoveToRequested = () => {
    if (bookingToMoveToRequested) {
      setBookings(bookings.filter(b => b.id !== bookingToMoveToRequested.id));
      onMoveToRequested(bookingToMoveToRequested);
      toast.success(`Booking ${bookingToMoveToRequested.id} moved to Requested Bookings successfully!`);
      setMoveToRequestedDialogOpen(false);
      setBookingToMoveToRequested(null);
      
      if (viewMode === "detail") {
        setViewMode("list");
        setSelectedBookingId(null);
      }
    }
  };

  const handleCompleteClick = (booking: Booking) => {
    setBookingToComplete(booking);
    setCompleteDialogOpen(true);
  };

  const handleConfirmComplete = () => {
    if (bookingToComplete) {
      setBookings(bookings.filter(b => b.id !== bookingToComplete.id));
      onMoveToHistory(bookingToComplete, "completed");
      toast.success(`Booking ${bookingToComplete.id} marked as completed successfully!`);
      setCompleteDialogOpen(false);
      setBookingToComplete(null);
      
      if (viewMode === "detail") {
        setViewMode("list");
        setSelectedBookingId(null);
      }
    }
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancellationReason("");
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      setBookings(bookings.filter(b => b.id !== bookingToCancel.id));
      onMoveToHistory(bookingToCancel, "cancelled", cancellationReason);
      toast.success(`Booking ${bookingToCancel.id} cancelled successfully!`);
      setCancelDialogOpen(false);
      
      const cancelledBookingId = bookingToCancel.id;
      setBookingToCancel(null);
      setCancellationReason("");
      
      if (viewMode === "detail") {
        setViewMode("list");
        setSelectedBookingId(null);
      }
      
      navigate("/history", {
        state: {
          scrollToId: cancelledBookingId,
          activeTab: "cancelled"
        }
      });
    }
  };

  const handlePaymentStatusChange = (bookingId: string, newStatus: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId 
        ? { 
            ...b, 
            paymentStatus: newStatus,
            paid: newStatus === "Paid" ? b.totalAmount : newStatus === "Partial" ? b.totalAmount / 2 : 0,
            status: "confirmed",
          }
        : b
    ));
  };

  const handlePaidAmountChange = (bookingId: string, newAmount: number) => {
    setBookings(bookings.map(b => 
      b.id === bookingId 
        ? { ...b, paid: newAmount }
        : b
    ));
  };

  // Handle payment history item click
  const handlePaymentItemClick = (payment: PaymentSubmission) => {
    setSelectedPayment(payment);
    setPaymentDetailModalOpen(true);
  };

  // Handle payment verification
  const handleVerifyPayment = (payment: PaymentSubmission) => {
    const updatedBookings = bookings.map(booking => {
      if (booking.paymentHistory) {
        const updatedPaymentHistory = booking.paymentHistory.map(p => 
          p.id === payment.id 
            ? { 
                ...p, 
                status: "verified" as const,
                verifiedBy: "Admin User",
                verifiedAt: new Date().toISOString()
              }
            : p
        );
        
        const verifiedPayments = updatedPaymentHistory.filter(p => p.status === "verified");
        const totalPaid = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let paymentStatus: "Paid" | "Partial" | "Unpaid" = "Unpaid";
        if (totalPaid >= booking.totalAmount) {
          paymentStatus = "Paid";
        } else if (totalPaid > 0) {
          paymentStatus = "Partial";
        }
        
        return {
          ...booking,
          paymentHistory: updatedPaymentHistory,
          totalPaid: totalPaid,
          paymentStatus: paymentStatus,
          paid: totalPaid,
          status: "confirmed",
        };
      }
      return booking;
    });

    setBookings(updatedBookings);
    
    const adminBookings = localStorage.getItem('adminStandardBookings');
    if (adminBookings) {
      const parsedAdminBookings = JSON.parse(adminBookings);
      const updatedAdminBookings = parsedAdminBookings.map((b: any) => {
        const updatedBooking = updatedBookings.find(ub => ub.id === b.id);
        if (updatedBooking) {
          const verifiedPayments = updatedBooking.paymentHistory?.filter((p: any) => p.status === "verified") || [];
          const totalPaid = verifiedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
          
          return {
            ...b,
            paymentHistory: updatedBooking.paymentHistory,
            totalPaid: totalPaid,
            paymentStatus: updatedBooking.paymentStatus
          };
        }
        return b;
      });
      localStorage.setItem('adminStandardBookings', JSON.stringify(updatedAdminBookings));
    }
    
    setPaymentDetailModalOpen(false);
    toast.success("Payment verified successfully!");
  };

  // Handle payment rejection
  const handleRejectPayment = (payment: PaymentSubmission) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    const updatedBookings = bookings.map(booking => {
      if (booking.paymentHistory) {
        const updatedPaymentHistory = booking.paymentHistory.map(p => 
          p.id === payment.id 
            ? { 
                ...p, 
                status: "rejected" as const,
                verifiedBy: "Admin User",
                verifiedAt: new Date().toISOString(),
                rejectionReason: rejectionReason
              }
            : p
        );
        
        const verifiedPayments = updatedPaymentHistory.filter(p => p.status === "verified");
        const totalPaid = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let paymentStatus: "Paid" | "Partial" | "Unpaid" = "Unpaid";
        if (totalPaid >= booking.totalAmount) {
          paymentStatus = "Paid";
        } else if (totalPaid > 0) {
          paymentStatus = "Partial";
        }
        
        return {
          ...booking,
          paymentHistory: updatedPaymentHistory,
          totalPaid: totalPaid,
          paymentStatus: paymentStatus,
          paid: totalPaid,
          status: "confirmed",
        };
      }
      return booking;
    });

    setBookings(updatedBookings);
    
    const adminBookings = localStorage.getItem('adminStandardBookings');
    if (adminBookings) {
      const parsedAdminBookings = JSON.parse(adminBookings);
      const updatedAdminBookings = parsedAdminBookings.map((b: any) => {
        const updatedBooking = updatedBookings.find(ub => ub.id === b.id);
        if (updatedBooking) {
          const verifiedPayments = updatedBooking.paymentHistory?.filter((p: any) => p.status === "verified") || [];
          const totalPaid = verifiedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
          
          let paymentStatus = "Unpaid";
          const totalAmount = parseInt(b.amount.replace(/[₱,]/g, ''));
          
          if (totalPaid >= totalAmount) {
            paymentStatus = "Paid";
          } else if (totalPaid > 0) {
            paymentStatus = "Partial";
          }
          
          return {
            ...b,
            paymentHistory: updatedBooking.paymentHistory,
            totalPaid: totalPaid,
            paymentStatus: paymentStatus
          };
        }
        return b;
      });
      localStorage.setItem('adminStandardBookings', JSON.stringify(updatedAdminBookings));
    }
    
    setVerificationModalOpen(false);
    setPaymentDetailModalOpen(false);
    setRejectionReason("");
    toast.success("Payment rejected successfully! Amount returned to outstanding balance.");
  };

  // Open verification modal
  const handleOpenVerificationModal = (payment: PaymentSubmission) => {
    setSelectedPayment(payment);
    setVerificationModalOpen(true);
  };

  // Calculate payment progress
  const calculatePaymentProgress = (booking: Booking) => {
    const totalAmount = booking.totalAmount;
    const paidAmount = booking.totalPaid || 0;
    const balance = totalAmount - paidAmount;
    const progressPercent = Math.round((paidAmount / totalAmount) * 100);
    
    return { totalAmount, paidAmount, balance, progressPercent };
  };

  // Get pending payments count
  const getPendingPaymentsCount = (booking: Booking) => {
    if (!booking.paymentHistory) return 0;
    return booking.paymentHistory.filter(payment => payment.status === "pending").length;
  };

  // Render detailed booking view
  if (viewMode === "detail" && selectedBooking) {
    const { totalAmount, paidAmount, balance, progressPercent } = calculatePaymentProgress(selectedBooking);
    const paymentSectionState = selectedBooking.paymentStatus === "Paid" ? "fullyPaid" : 
                               selectedBooking.paymentStatus === "Partial" ? "partial" : "unpaid";
    const pendingPaymentsCount = getPendingPaymentsCount(selectedBooking);

    return (
      <div className="space-y-6">
        {/* Header with back button */} 
        <div className="flex items-center gap-4 mb-6">   
          <button     
            onClick={() => navigate(-1)}     
            className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] dark:bg-gray-800 dark:border-gray-700 dark:hover:border-[#0A7AFF] dark:hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"   
          >     
            <ChevronLeft className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />   
          </button>   
          <div>     
            <h2 className="text-[#1A2B4F] dark:text-white font-semibold">{selectedBooking.destination}</h2>     
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Booking Details</p>   
          </div> 
        </div>

        {/* Booking Header Card */}
        <div className="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] rounded-2xl p-8 text-white shadow-lg">
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
              <p className="font-medium">{formatDateRange(selectedBooking.startDate, selectedBooking.endDate)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Users className="w-5 h-5 mb-2 text-white/80" />
              <p className="text-white/80 text-xs mb-1">Travelers</p>
              <p className="font-medium">{selectedBooking.travelers} {selectedBooking.travelers > 1 ? 'People' : 'Person'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <CreditCard className="w-5 h-5 mb-2 text-white/80" />
              <p className="text-white/80 text-xs mb-1">Total Amount</p>
              <p className="font-medium">₱{selectedBooking.totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Clock className="w-5 h-5 mb-2 text-white/80" />
              <p className="text-white/80 text-xs mb-1">Booked On</p>
              <p className="font-medium">{selectedBooking.bookedDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Customer Info & Actions */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFB] to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#1A2B4F]">Customer Information</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Full Name</p>
                  <p className="text-[#1A2B4F] font-medium">{selectedBooking.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Email Address</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0A7AFF]" />
                    <p className="text-[#334155]">{selectedBooking.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Mobile Number</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#14B8A6]" />
                    <p className="text-[#334155]">{selectedBooking.mobile}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information - ADMIN VERSION */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
              <div className="relative p-6 border-b border-[#E5E7EB]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 via-[#14B8A6]/5 to-[#0A7AFF]/5" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A2B4F] text-lg">Payment Information</h3>
                      <p className="text-sm text-[#64748B]">Track customer payment progress</p>
                    </div>
                  </div>
                  {pendingPaymentsCount > 0 && (
                    <div className="bg-[#FFB84D] text-white text-xs font-medium px-2 py-1 rounded-full">
                      {pendingPaymentsCount} Pending
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* UNPAID STATE */}
                {paymentSectionState === "unpaid" && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#F8FAFB] to-[#E5E7EB] rounded-full flex items-center justify-center">
                      <Wallet className="w-8 h-8 text-[#64748B]" />
                    </div>
                    <h4 className="text-lg font-semibold text-[#1A2B4F] mb-2">No Payments Made</h4>
                    <p className="text-sm text-[#64748B] mb-6">
                      Customer has not made any payments yet
                    </p>
                    
                    <div className="bg-gradient-to-br from-[#F8FAFB] to-[#F1F5F9] rounded-2xl p-5 border border-[#E5E7EB] mb-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#64748B]">Total Package Cost</span>
                          <span className="font-bold text-[#1A2B4F] text-lg">₱{totalAmount.toLocaleString()}</span>
                        </div>
                        
                        <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
                        
                        <div className="flex justify-between items-center pt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                            <span className="text-sm font-medium text-[#1A2B4F]">Outstanding Balance</span>
                          </div>
                          <span className="font-bold text-[#EF4444] text-lg">
                            ₱{balance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PARTIAL PAYMENT STATE */}
                {paymentSectionState === "partial" && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64" cy="64" r="56"
                            stroke="#E5E7EB"
                            strokeWidth="10"
                            fill="none"
                          />
                          <circle
                            cx="64" cy="64" r="56"
                            stroke="url(#progressGradient)"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${progressPercent * 3.52} 352`}
                            className="transition-all duration-1000 ease-out"
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#14B8A6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-[#1A2B4F]">{progressPercent}%</span>
                          <span className="text-xs text-[#64748B]">Paid</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div 
                          className="bg-gradient-to-r from-[#10B981]/10 to-[#14B8A6]/10 rounded-xl p-3 border border-[#10B981]/20"
                          style={{ 
                            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))',
                            borderColor: 'rgba(16, 185, 129, 0.2)'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 
                              className="w-3.5 h-3.5 text-[#10B981]" 
                              style={{ color: '#10B981' }}
                            />
                            <span 
                              className="text-xs font-medium text-[#10B981]"
                              style={{ color: '#10B981' }}
                            >
                              Amount Paid
                            </span>
                          </div>
                          <p 
                            className="text-lg font-bold text-[#10B981]"
                            style={{ color: '#10B981' }}
                          >
                            ₱{paidAmount.toLocaleString()}
                          </p>
                        </div>
                        <div 
                          className="bg-gradient-to-r from-[#EF4444]/10 to-[#F87171]/10 rounded-xl p-3 border border-[#EF4444]/20"
                          style={{ 
                            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1))',
                            borderColor: 'rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Wallet 
                              className="w-3.5 h-3.5 text-[#EF4444]" 
                              style={{ color: '#EF4444' }}
                            />
                            <span 
                              className="text-xs font-medium text-[#EF4444]"
                              style={{ color: '#EF4444' }}
                            >
                              Remaining Balance
                            </span>
                          </div>
                          <p 
                            className="text-lg font-bold text-[#EF4444]"
                            style={{ color: '#EF4444' }}
                          >
                            ₱{balance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#F8FAFB] to-[#F1F5F9] rounded-2xl p-5 border border-[#E5E7EB]">
                      <div className="flex items-center gap-2 mb-4">
                        <Receipt className="w-5 h-5 text-[#64748B]" />
                        <h4 className="font-semibold text-[#1A2B4F]">Payment Breakdown</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#64748B]">Total Package Cost</span>
                          <span className="font-bold text-[#1A2B4F] text-lg">₱{totalAmount.toLocaleString()}</span>
                        </div>
                        
                        <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                            <span className="text-sm text-[#64748B]">Total Paid</span>
                          </div>
                          <span className="font-semibold text-[#10B981]">- ₱{paidAmount.toLocaleString()}</span>
                        </div>
                        
                        <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
                        
                        <div className="flex justify-between items-center pt-1">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"
                              style={{ backgroundColor: '#EF4444' }}
                            />
                            <span className="text-sm font-medium text-[#1A2B4F]">Outstanding Balance</span>
                          </div>
                          <span className="font-bold text-[#EF4444] text-lg" style={{ color: '#EF4444' }}>
                            ₱{balance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#0A7AFF]" />
                          <span className="text-sm font-medium text-[#1A2B4F]">Payment Progress</span>
                        </div>
                        <span className="text-sm font-bold text-[#1A2B4F]">{progressPercent}%</span>
                      </div>
                      
                      <div className="relative">
                        <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#10B981] via-[#14B8A6] to-[#0A7AFF] rounded-full transition-all duration-1000 relative"
                          style={{ 
                            width: `${progressPercent}%`,
                            background: 'linear-gradient(to right, #10B981, #14B8A6, #0A7AFF)'
                          }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
                          </div>
                        </div>
                        
                        <div className="absolute top-0 left-0 right-0 h-3 flex items-center pointer-events-none">
                          {[25, 50, 75].map((milestone) => (
                            <div 
                              key={milestone}
                              className="absolute w-0.5 h-3 bg-[#CBD5E1]/50"
                              style={{ left: `${milestone}%` }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-[#94A3B8]">
                        <span>₱0</span>
                        <span>₱{(totalAmount / 2).toLocaleString()}</span>
                        <span>₱{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedBooking.paymentHistory && selectedBooking.paymentHistory.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#64748B]" />
                            <h4 className="font-semibold text-[#1A2B4F]">Recent Payments</h4>
                          </div>
                          <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">{selectedBooking.paymentHistory.length} transactions</span>
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedBooking.paymentHistory.map((payment, index) => (
                            <div 
                              key={payment.id}
                              onClick={() => handlePaymentItemClick(payment)}
                              className="group bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-md cursor-pointer transition-all duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    payment.modeOfPayment === "Gcash" 
                                      ? "bg-[#0A7AFF]/10 text-[#0A7AFF]" 
                                      : "bg-[#10B981]/10 text-[#10B981]"
                                  }`}>
                                    {payment.modeOfPayment === "Gcash" ? (
                                      <Smartphone className="w-5 h-5" />
                                    ) : (
                                      <Banknote className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-[#1A2B4F]">
                                      Payment #{index + 1}
                                    </p>
                                    <p className="text-xs text-[#94A3B8]">
                                      {new Date(payment.submittedAt).toLocaleDateString('en-PH', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="font-bold text-[#10B981]">₱{payment.amount.toLocaleString()}</p>
                                    <div className="flex items-center gap-1 justify-end">
                                      {payment.status === "verified" ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                          <span className="text-xs text-[#10B981]">Verified</span>
                                        </>
                                      ) : payment.status === "rejected" ? (
                                        <>
                                          <X className="w-3 h-3 text-[#FF6B6B]" />
                                          <span className="text-xs text-[#FF6B6B]">Rejected</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3 h-3 text-[#FFB84D]" />
                                          <span className="text-xs text-[#FFB84D]">Pending</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#0A7AFF] transition-colors" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* FULLY PAID STATE */}
                {paymentSectionState === "fullyPaid" && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#10B981] to-[#14B8A6] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-[#1A2B4F] mb-2">Fully Paid</h4>
                    <p className="text-sm text-[#64748B] mb-6">This booking has been completely paid.</p>
                    
                    <div className="bg-gradient-to-br from-[#10B981]/10 to-[#14B8A6]/10 rounded-xl p-4 border border-[#10B981]/20 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#64748B]">Total Amount Paid</span>
                        <span className="text-xl font-bold text-[#10B981]">₱{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {selectedBooking.paymentHistory && selectedBooking.paymentHistory.length > 0 && (
                      <div className="text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#64748B]" />
                            <h4 className="font-semibold text-[#1A2B4F]">Payment History</h4>
                          </div>
                          <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">{selectedBooking.paymentHistory.length} transactions</span>
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedBooking.paymentHistory.map((payment, index) => (
                            <div 
                              key={payment.id}
                              onClick={() => handlePaymentItemClick(payment)}
                              className="group bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-md cursor-pointer transition-all duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    payment.modeOfPayment === "Gcash" 
                                      ? "bg-[#0A7AFF]/10 text-[#0A7AFF]" 
                                      : "bg-[#10B981]/10 text-[#10B981]"
                                  }`}>
                                    {payment.modeOfPayment === "Gcash" ? (
                                      <Smartphone className="w-5 h-5" />
                                    ) : (
                                      <Banknote className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-[#1A2B4F]">
                                      Payment #{index + 1}
                                    </p>
                                    <p className="text-xs text-[#94A3B8]">
                                      {new Date(payment.submittedAt).toLocaleDateString('en-PH', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                    {payment.status && (
                                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getPaymentVerificationStatusColor(payment.status)}`}>
                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="font-bold text-[#10B981]">₱{payment.amount.toLocaleString()}</p>
                                    <div className="flex items-center gap-1 justify-end">
                                      {payment.status === "verified" ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                          <span className="text-xs text-[#10B981]">Verified</span>
                                        </>
                                      ) : payment.status === "rejected" ? (
                                        <>
                                          <X className="w-3 h-3 text-[#FF6B6B]" />
                                          <span className="text-xs text-[#FF6B6B]">Rejected</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3 h-3 text-[#FFB84D]" />
                                          <span className="text-xs text-[#FFB84D]">Pending</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#0A7AFF] transition-colors" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const bookingData = {
                      id: selectedBooking.id,
                      customer: selectedBooking.customer,
                      email: selectedBooking.email,
                      mobile: selectedBooking.mobile,
                      destination: selectedBooking.destination,
                      dates: formatDateRange(selectedBooking.startDate, selectedBooking.endDate),
                      travelers: selectedBooking.travelers,
                      total: `₱${selectedBooking.totalAmount.toLocaleString()}`,
                      bookedDate: selectedBooking.bookedDate,
                      status: selectedBooking.status,
                    };
                    exportBookingDetailToPDF(bookingData, selectedItinerary);
                    toast.success("Exporting booking as PDF...");
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] flex items-center justify-center gap-2 text-sm text-[#334155] hover:text-[#FF6B6B] font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => {
                    const bookingData = {
                      id: selectedBooking.id,
                      customer: selectedBooking.customer,
                      email: selectedBooking.email,
                      mobile: selectedBooking.mobile,
                      destination: selectedBooking.destination,
                      dates: formatDateRange(selectedBooking.startDate, selectedBooking.endDate),
                      travelers: selectedBooking.travelers,
                      total: `₱${selectedBooking.totalAmount.toLocaleString()}`,
                      bookedDate: selectedBooking.bookedDate,
                      status: selectedBooking.status,
                    };
                    exportBookingDetailToExcel(bookingData, selectedItinerary);
                    toast.success("Exporting booking as Excel...");
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.05)] flex items-center justify-center gap-2 text-sm text-[#334155] hover:text-[#10B981] font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>

              {selectedBooking.bookingType === "Standard" ? (
                <button
                  onClick={() => handleEditBooking(selectedBooking)}
                  className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,122,255,0.35)] transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Booking
                </button>
              ) : selectedBooking.bookingType === "Requested" ? (
                <button
                  onClick={() => handleMoveToRequestedClick(selectedBooking)}
                  className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,122,255,0.35)] transition-all"
                >
                  <Package className="w-4 h-4" />
                  Move to Requested
                </button>
              ) : (
                <button
                  onClick={() => handleMoveToApprovalsClick(selectedBooking)}
                  className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,122,255,0.35)] transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Move to Approvals
                </button>
              )}
              {selectedBooking.tripStatus !== "completed" && selectedBooking.paymentStatus === "Paid" && (
                <button
                  onClick={() => handleCompleteClick(selectedBooking)}
                  className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#10B981]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Complete
                </button>
              )}
              <button
                onClick={() => handleCancelClick(selectedBooking)}
                className="w-full h-11 px-4 rounded-xl border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white flex items-center justify-center gap-2 font-medium transition-all"
              >
                <X className="w-4 h-4" />
                Cancel Booking
              </button>
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
            <ItineraryDetailDisplay itinerary={selectedItinerary} />
          </div>
        </div>

        {/* Payment Detail Modal */}
        <Dialog open={paymentDetailModalOpen} onOpenChange={setPaymentDetailModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0A7AFF]" />
                Payment Details
              </DialogTitle>
              <DialogDescription>
                Comprehensive information about the selected payment
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6 p-6">
                <div className="bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] rounded-xl p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedPayment.paymentType}</h3>
                      <p className="text-white/80 text-sm">
                        {new Date(selectedPayment.submittedAt).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-sm">Amount Paid</p>
                      <p className="text-2xl font-bold">₱{selectedPayment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-[#64748B]">Payment ID</Label>
                      <p className="text-sm font-medium text-[#1A2B4F]">{selectedPayment.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#64748B]">Payment Type</Label>
                      <p className="text-sm font-medium text-[#1A2B4F]">{selectedPayment.paymentType}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-[#64748B]">Mode of Payment</Label>
                      <div className="flex items-center gap-2">
                        {selectedPayment.modeOfPayment === "Cash" ? (
                          <Banknote className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-[#0A7AFF]" />
                        )}
                        <p className="text-sm font-medium text-[#1A2B4F]">{selectedPayment.modeOfPayment}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-[#64748B]">Status</Label>
                      <div className="flex items-center gap-2">
                        {selectedPayment.status === "verified" ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : selectedPayment.status === "rejected" ? (
                          <X className="w-4 h-4 text-[#FF6B6B]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#FFB84D]" />
                        )}
                        <p className={`text-sm font-medium ${
                          selectedPayment.status === "verified" 
                            ? "text-[#10B981]" 
                            : selectedPayment.status === "rejected" 
                            ? "text-[#FF6B6B]"
                            : "text-[#FFB84D]"
                        }`}>
                          {selectedPayment.status ? selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1) : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedPayment.status === "verified" || selectedPayment.status === "rejected") && (
                  <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-[#10B981]" />
                      <h4 className="text-sm font-medium text-[#1A2B4F]">Payment Verification</h4>
                    </div>
                    <div className="space-y-2 text-sm text-[#64748B]">
                      <div className="flex justify-between">
                        <span>Verified By:</span>
                        <span className="font-medium text-[#1A2B4F]">{selectedPayment.verifiedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verified At:</span>
                        <span className="font-medium text-[#1A2B4F]">
                          {selectedPayment.verifiedAt ? new Date(selectedPayment.verifiedAt).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </span>
                      </div>
                      {selectedPayment.status === "rejected" && selectedPayment.rejectionReason && (
                        <div className="flex justify-between">
                          <span>Rejection Reason:</span>
                          <span className="font-medium text-[#FF6B6B] text-right max-w-xs">
                            {selectedPayment.rejectionReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-[#1A2B4F] mb-3 block">
                    Proof of Payment
                  </Label>
                  
                  {selectedPayment.proofOfPayment || selectedPayment.cashConfirmation ? (
                    <div className="space-y-4">
                      <div className="border-2 border-[#E5E7EB] rounded-xl overflow-hidden">
                        <img 
                          src={selectedPayment.proofOfPayment || selectedPayment.cashConfirmation} 
                          alt="Proof of payment" 
                          className="w-full max-h-96 object-contain bg-[#F8FAFB] mx-auto"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-[#E5E7EB] rounded-xl">
                      <AlertCircle className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
                      <p className="text-sm text-[#64748B]">No proof of payment available</p>
                      <p className="text-xs text-[#64748B] mt-1">Payment was made without uploaded proof</p>
                    </div>
                  )}
                </div>

                {selectedPayment.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
                    <button
                      onClick={() => handleVerifyPayment(selectedPayment)}
                      className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#14B8A6] text-white font-medium hover:from-[#0DA271] hover:to-[#0F9B8E] transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify Payment
                    </button>
                    <button
                      onClick={() => handleOpenVerificationModal(selectedPayment)}
                      className="flex-1 h-11 px-4 rounded-xl border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject Payment
                    </button>
                  </div>
                )}

                <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                  <h4 className="text-sm font-medium text-[#1A2B4F] mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0A7AFF]" />
                    Transaction Timeline
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1A2B4F]">Payment Submitted</p>
                        <p className="text-xs text-[#64748B]">
                          {new Date(selectedPayment.submittedAt).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {selectedPayment.status === "verified" && selectedPayment.verifiedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1A2B4F]">Payment Verified</p>
                          <p className="text-xs text-[#64748B]">
                            {new Date(selectedPayment.verifiedAt).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedPayment.status === "rejected" && selectedPayment.verifiedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#FF6B6B] rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1A2B4F]">Payment Rejected</p>
                          <p className="text-xs text-[#64748B]">
                            {new Date(selectedPayment.verifiedAt).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Verification Modal */}
        <Dialog open={verificationModalOpen} onOpenChange={setVerificationModalOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#FF6B6B]" />
                Reject Payment
              </DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this payment submission.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 px-6 py-8">
              <div>
                <Label htmlFor="rejection-reason" className="text-[#1A2B4F] mb-2 block">
                  Reason for Rejection
                </Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px] rounded-xl border-2 border-[#E5E7EB] focus:border-[#FF6B6B] focus:ring-4 focus:ring-[rgba(255,107,107,0.1)] transition-all"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-[#E5E7EB] bg-[#F8FAFB]">
              <button
                onClick={() => {
                  setVerificationModalOpen(false);
                  setRejectionReason("");
                }}
                className="flex-1 h-11 px-4 rounded-xl border border-[#E5E7EB] text-[#64748B] font-medium hover:bg-[#F8FAFB] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedPayment && handleRejectPayment(selectedPayment)}
                disabled={!rejectionReason.trim()}
                className="flex-1 h-11 px-4 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#FF5252] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject Payment
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Complete Trip Modal */}
        <ConfirmationModal
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
          title="Mark Trip as Complete"
          description="Confirm that this trip has been successfully completed."
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#10B981] to-[#34D399]"
          iconShadow="shadow-[#10B981]/20"
          contentGradient="bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.12)]"
          contentBorder="border-[rgba(16,185,129,0.2)]"
          content={
            bookingToComplete && (
              <>
                <p className="text-sm text-[#334155] leading-relaxed mb-4">
                  Are you sure you want to mark the trip for <span className="font-semibold text-[#10B981]">{bookingToComplete.customer}</span> as completed?
                </p>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgba(16,185,129,0.2)]">
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Booking ID</p>
                    <p className="text-sm font-semibold text-[#0A7AFF]">{bookingToComplete.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Destination</p>
                    <p className="text-sm font-medium text-[#334155]">{bookingToComplete.destination}</p>
                  </div>
                </div>
              </>
            )
          }
          onConfirm={handleConfirmComplete}
          onCancel={() => setCompleteDialogOpen(false)}
          confirmText="Mark as Complete"
          cancelText="Cancel"
          confirmVariant="success"
        />

        {/* Cancel Booking Dialog */}
        <ConfirmationModal
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          title="Cancel Booking"
          description="Confirm that you want to cancel this booking. This action will move the booking to history."
          icon={<X className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
          iconShadow="shadow-[#FF6B6B]/20"
          contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(255,107,107,0.12)]"
          contentBorder="border-[rgba(255,107,107,0.2)]"
          content={
            bookingToCancel && (
              <>
                <p className="text-sm text-[#334155] leading-relaxed mb-4">
                  Are you sure you want to cancel the booking for <span className="font-semibold text-[#FF6B6B]">{bookingToCancel.customer}</span>?
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4 pb-3 border-b border-[rgba(255,107,107,0.2)]">
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Booking ID</p>
                    <p className="text-sm font-semibold text-[#0A7AFF]">{bookingToCancel.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Destination</p>
                    <p className="text-sm font-medium text-[#334155]">{bookingToCancel.destination}</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cancellation-reason" className="text-[#1A2B4F] mb-2 block">
                    Reason for Cancellation
                  </Label>
                  <Textarea
                    id="cancellation-reason"
                    placeholder="Enter reason for cancellation..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="min-h-[80px] rounded-xl border-2 border-[#E5E7EB] focus:border-[#FF6B6B] focus:ring-4 focus:ring-[rgba(255,107,107,0.1)] transition-all"
                    rows={3}
                  />
                </div>
              </>
            )
          }
          onConfirm={handleConfirmCancel}
          onCancel={() => {
            setCancelDialogOpen(false);
            setCancellationReason("");
          }}
          confirmText="Cancel Booking"
          cancelText="Go Back"
          confirmVariant="destructive"
        />

        {/* Edit Standard Booking Modal */}
        <ConfirmationModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          title="Edit Booking"
          description="Update the booking details for this standard itinerary."
          icon={<Edit className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
          iconShadow="shadow-[#0A7AFF]/20"
          contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
          contentBorder="border-[rgba(10,122,255,0.2)]"
          content={
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-customerName" className="text-[#1A2B4F] mb-2 block">
                  Customer Name <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="edit-customerName"
                  value={editFormData.customerName}
                  onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-[#1A2B4F] mb-2 block">
                  Email Address <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="customer@email.com"
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
              <div>
                <Label htmlFor="edit-mobile" className="text-[#1A2B4F] mb-2 block">
                  Mobile Number <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="edit-mobile"
                  type="tel"
                  value={editFormData.mobile}
                  onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  placeholder="+63 9XX XXX XXXX"
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-travelDateFrom" className="text-[#1A2B4F] mb-2 block">
                    Travel Start Date <span className="text-[#FF6B6B]">*</span>
                  </Label>
                  <Input
                    id="edit-travelDateFrom"
                    type="date"
                    value={editFormData.travelDateFrom}
                    onChange={(e) => setEditFormData({ ...editFormData, travelDateFrom: e.target.value })}
                    className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-travelDateTo" className="text-[#1A2B4F] mb-2 block">
                    Travel End Date <span className="text-[#FF6B6B]">*</span>
                  </Label>
                  <Input
                    id="edit-travelDateTo"
                    type="date"
                    value={editFormData.travelDateTo}
                    onChange={(e) => setEditFormData({ ...editFormData, travelDateTo: e.target.value })}
                    className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-travelers" className="text-[#1A2B4F] mb-2 block">
                  Number of Travelers <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="edit-travelers"
                  type="number"
                  min="1"
                  value={editFormData.travelers}
                  onChange={(e) => setEditFormData({ ...editFormData, travelers: e.target.value })}
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
            </div>
          }
          onConfirm={handleSaveEdit}
          onCancel={() => {
            setEditModalOpen(false);
            setBookingToEdit(null);
            setEditFormData({
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

        {/* Move to Requested Dialog */}
        <Dialog open={moveToRequestedDialogOpen} onOpenChange={setMoveToRequestedDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Move to Requested #{bookingToMoveToRequested?.id}
              </DialogTitle>
              <DialogDescription>
                This booking will be moved to the Requested tab in Itinerary page.
              </DialogDescription>
            </DialogHeader>
            
            {bookingToMoveToRequested && (
              <div className="px-8 py-6">
                <div className="bg-gradient-to-br from-[rgba(10,122,255,0.08)] to-[rgba(20,184,166,0.12)] border border-[rgba(10,122,255,0.2)] rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A7AFF]/10 rounded-full blur-3xl"></div>
                  <div className="relative">
                    <p className="text-sm text-[#334155] leading-relaxed mb-4">
                      Move booking for <span className="font-semibold text-[#0A7AFF]">{bookingToMoveToRequested.customer}</span> to Requested Itinerary tab?
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgba(10,122,255,0.2)]">
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Booking ID</p>
                        <p className="text-sm font-semibold text-[#0A7AFF]">{bookingToMoveToRequested.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Destination</p>
                        <p className="text-sm font-medium text-[#334155]">{bookingToMoveToRequested.destination}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Travel Date</p>
                        <p className="text-sm font-medium text-[#334155]">{formatDateRange(bookingToMoveToRequested.startDate, bookingToMoveToRequested.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Total Amount</p>
                        <p className="text-sm font-semibold text-[#1A2B4F]">₱{bookingToMoveToRequested.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <ShadcnButton
                variant="outline"
                onClick={() => setMoveToRequestedDialogOpen(false)}
                className="h-11 px-6 rounded-xl border-[#E5E7EB] hover:bg-[#F8FAFB]"
              >
                Cancel
              </ShadcnButton>
              <ShadcnButton
                onClick={handleConfirmMoveToRequested}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] hover:from-[#0865CC] hover:to-[#0F9B8E] shadow-lg shadow-[#0A7AFF]/25 text-white"
              >
                <Package className="w-4 h-4 mr-2" />
                Move to Requested
              </ShadcnButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move to Approvals Confirmation Modal */}
        <ConfirmationModal
          open={moveToApprovalsDialogOpen}
          onOpenChange={setMoveToApprovalsDialogOpen}
          title="Move to Approvals"
          description="This booking will be moved to the Approvals page for review."
          icon={<RotateCcw className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
          iconShadow="shadow-[#0A7AFF]/20"
          contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.08)] to-[rgba(20,184,166,0.12)]"
          contentBorder="border-[rgba(10,122,255,0.2)]"
          content={
            bookingToMoveToApprovals && (
              <>
                <p className="text-sm text-[#334155] leading-relaxed mb-4">
                  Move booking for <span className="font-semibold text-[#0A7AFF]">{bookingToMoveToApprovals.customer}</span> to Approvals for re-review?
                </p>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgba(10,122,255,0.2)]">
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Booking ID</p>
                    <p className="text-sm font-semibold text-[#0A7AFF]">{bookingToMoveToApprovals.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Destination</p>
                    <p className="text-sm font-medium text-[#334155]">{bookingToMoveToApprovals.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Travel Date</p>
                    <p className="text-sm font-medium text-[#334155]">{formatDateRange(bookingToMoveToApprovals.startDate, bookingToMoveToApprovals.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Total Amount</p>
                    <p className="text-sm font-semibold text-[#1A2B4F]">₱{bookingToMoveToApprovals.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </>
            )
          }
          onConfirm={handleConfirmMoveToApprovals}
          onCancel={() => setMoveToApprovalsDialogOpen(false)}
          confirmText="Move to Approvals"
          cancelText="Cancel"
          confirmVariant="default"
        />
      </div>
    );
  }

  // Render list view
  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b-2 border-[#E5E7EB]">
        <button
          onClick={() => {
            setSelectedStatus("all");
            handleFilterChange();
          }}
          className={`px-5 h-11 text-sm transition-colors ${
            selectedStatus === "all"
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setSelectedStatus("paid");
            handleFilterChange();
          }}
          className={`px-5 h-11 text-sm transition-colors ${
            selectedStatus === "paid"
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          Paid
        </button>
        <button
          onClick={() => {
            setSelectedStatus("partial");
            handleFilterChange();
          }}
          className={`px-5 h-11 text-sm transition-colors ${
            selectedStatus === "partial"
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          Partial Payment
        </button>
        <button
          onClick={() => {
            setSelectedStatus("unpaid");
            handleFilterChange();
          }}
          className={`px-5 h-11 text-sm transition-colors ${
            selectedStatus === "unpaid"
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          Unpaid
        </button>
      </div>

      {/* Booking Type Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div onClick={() => handleStatCardClick(null)} className="cursor-pointer">
          <StatCard
            icon={BookOpen}
            label={getActiveBookingsLabel()}
            value={activeBookingsCount}
            gradientFrom="#8B5CF6"
            gradientTo="#A78BFA"
            selected={selectedTypeFilter === null}
          />
        </div>
        <div onClick={() => handleStatCardClick("Customized")} className="cursor-pointer">
          <StatCard
            icon={Briefcase}
            label="Customized"
            value={customizedCount}
            gradientFrom="#0A7AFF"
            gradientTo="#3B9EFF"
            selected={selectedTypeFilter === "Customized"}
          />
        </div>
        <div onClick={() => handleStatCardClick("Standard")} className="cursor-pointer">
          <StatCard
            icon={FileCheck}
            label="Standard"
            value={standardCount}
            gradientFrom="#10B981"
            gradientTo="#14B8A6"
            selected={selectedTypeFilter === "Standard"}
          />
        </div>
        <div onClick={() => handleStatCardClick("Requested")} className="cursor-pointer">
          <StatCard
            icon={ClipboardList}
            label="Requested"
            value={requestedCount}
            gradientFrom="#FFB84D"
            gradientTo="#FF9800"
            selected={selectedTypeFilter === "Requested"}
          />
        </div>
      </div>

      <ContentCard 
        title={`Confirmed Bookings (${totalBookings})`}
        footer={
          filteredBookings.length > 0 ? (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredBookings.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              showingStart={filteredBookings.length > 0 ? indexOfFirstBooking + 1 : 0}
              showingEnd={Math.min(indexOfLastBooking, filteredBookings.length)}
            />
          ) : undefined
        }
      >
        <SearchFilterToolbar
          searchPlaceholder="Search by booking ID, customer name, or destination..."
          searchValue={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            handleFilterChange();
          }}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          activeFiltersCount={activeFiltersCount}
          filterContent={
            <BookingFilterContent
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
              travelDateFrom={travelDateFrom}
              onTravelDateFromChange={setTravelDateFrom}
              travelDateTo={travelDateTo}
              onTravelDateToChange={setTravelDateTo}
              minAmount={minAmount}
              onMinAmountChange={setMinAmount}
              maxAmount={maxAmount}
              onMaxAmountChange={setMaxAmount}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          }
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#64748B]">No confirmed bookings to display</p>
            </div>
          ) : (
            currentBookings.map((booking) => (
              <div 
                key={booking.id}
                id={`booking-${booking.id}`}
                onClick={() => handleViewDetails(booking.id)}
                className="p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)] cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                      <span className="text-white text-lg">🎫</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg text-[#1A2B4F] font-semibold">Booking #{booking.id}</h3>
                        {/* Updated to show all badges */}
                        {booking.paymentStatus && (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        )}
                        {booking.tripStatus && (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getTripStatusColor(booking.tripStatus)}`}>
                            {booking.tripStatus.charAt(0).toUpperCase() + booking.tripStatus.slice(1)}
                          </span>
                        )}
                        {booking.bookingType && (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                            booking.bookingType === "Customized"
                              ? "bg-[rgba(255,127,110,0.1)] text-[#FF7F6E] border-[rgba(255,127,110,0.2)]"
                              : booking.bookingType === "Standard"
                              ? "bg-[rgba(139,125,107,0.1)] text-[#8B7D6B] border-[rgba(139,125,107,0.2)]"
                              : "bg-[rgba(236,72,153,0.1)] text-[#EC4899] border-[rgba(236,72,153,0.2)]"
                          }`}>
                            {booking.bookingType}
                          </span>
                        )}
                        {booking.tourType && (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                            booking.tourType === "Joiner"
                              ? "bg-[rgba(255,152,0,0.1)] text-[#FF9800] border-[rgba(255,152,0,0.2)]"
                              : "bg-[rgba(167,139,250,0.1)] text-[#A78BFA] border-[rgba(167,139,250,0.2)]"
                          }`}>
                            {booking.tourType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(booking.id);
                    }}
                    className="h-9 px-4 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAFB] hover:border-[#0A7AFF] text-[#334155] flex items-center gap-2 text-sm font-medium transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>

                {/* Customer Info */}
                <div className="mb-4 pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#64748B]" />
                    <span className="text-sm text-[#334155] font-medium">{booking.customer}</span>
                    <span className="text-sm text-[#64748B]">•</span>
                    <span className="text-sm text-[#64748B]">{booking.email}</span>
                    <span className="text-sm text-[#64748B]">•</span>
                    <span className="text-sm text-[#64748B]">{booking.mobile}</span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-5 gap-4 mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0A7AFF]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Destination</p>
                      <p className="text-sm text-[#334155] font-medium">{booking.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#14B8A6]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Travel Dates</p>
                      <p className="text-sm text-[#334155] font-medium">{formatDateRange(booking.startDate, booking.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#64748B]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Travelers</p>
                      <p className="text-sm text-[#334155] font-medium">{booking.travelers} {booking.travelers > 1 ? 'People' : 'Person'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#10B981] text-lg">₱</span>
                    <div>
                      <p className="text-xs text-[#64748B]">Paid / Total</p>
                      <p className="text-sm text-[#334155] font-medium">₱{booking.paid.toLocaleString()} / ₱{booking.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#64748B]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Booked On</p>
                      <p className="text-sm text-[#334155] font-medium">{booking.bookedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ContentCard>
    </div>
  );
}