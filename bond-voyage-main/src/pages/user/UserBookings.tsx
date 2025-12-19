import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, DollarSign, BookOpen, Briefcase, FileCheck, ClipboardList, Eye, MapPin, Users, Clock, User, Mail, Phone } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { StatCard } from "../../components/StatCard";
import { BookingListCard } from "../../components/BookingListCard";
import { FAQAssistant } from "../../components/FAQAssistant";

interface PaymentSubmission {
  id: string;
  paymentType: "Full Payment" | "Partial Payment";
  amount: number;
  modeOfPayment: "Cash" | "Gcash";
  proofOfPayment?: string;
  cashConfirmation?: string;
  submittedAt: string;
}

interface Booking {
  id: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  dates: string;
  travelers: number;
  amount: string;
  paymentStatus: "Paid" | "Partial" | "Unpaid";
  tripStatus: "in progress" | "completed" | "upcoming";
  bookingDate: string;
  image: string;
  itinerary: string;
  bookingType: "Standard" | "Customized" | "Requested";
  tourType?: "Joiner" | "Private";
  totalPaid?: number;
  paymentHistory?: PaymentSubmission[];
}

export function UserBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [activeTab, setActiveTab] = useState<"All" | "Paid" | "Partial" | "Unpaid">("All");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  const [standardBookings, setStandardBookings] = useState<Booking[]>([]);
  
  // Load standard bookings from localStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('userStandardBookings');
    if (savedBookings) {
      setStandardBookings(JSON.parse(savedBookings));
    }
  }, []);

  // Scroll to new booking if redirected from UserStandardItinerary
  useEffect(() => {
    if (location.state?.newBookingId) {
      const bookingId = location.state.newBookingId;
      
      // Wait for the component to render
      setTimeout(() => {
        const element = bookingRefs.current[bookingId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          element.style.animation = 'highlight 2s ease-in-out';
          
          // Remove animation after completion
          setTimeout(() => {
            element.style.animation = '';
          }, 2000);
        }
      }, 300);

      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);
  
  const defaultBookings: Booking[] = [
    {
      id: "BV-2025-001",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Boracay, Aklan",
      dates: "December 20, 2025 – December 25, 2025",
      travelers: 4,
      amount: "₱85,500",
      paymentStatus: "Unpaid",
      tripStatus: "upcoming",
      bookingDate: "November 10, 2025",
      image: "https://images.unsplash.com/photo-1684419206253-3a934ec0bd6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3JhY2F5JTIwYmVhY2glMjBwaGlsaXBwaW5lc3xlbnwxfHx8fDE3NjM0NTc4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      itinerary: "5 Days / 4 Nights",
      bookingType: "Standard",
      tourType: "Private",
      totalPaid: 0,
      paymentHistory: []
    },
    {
      id: "BV-2025-002",
      customer: "Juan Dela Cruz",
      email: "juan.delacruz@email.com",
      mobile: "+63 918 234 5678",
      destination: "El Nido, Palawan",
      dates: "January 15, 2026 – January 20, 2026",
      travelers: 2,
      amount: "₱62,000",
      paymentStatus: "Partial",
      tripStatus: "upcoming",
      bookingDate: "November 8, 2025",
      image: "https://images.unsplash.com/photo-1695051702427-1c24ce3682e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbCUyMG5pZG8lMjBwYWxhd2FufGVufDF8fHx8MTc2MzQ1Nzg0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      itinerary: "5 Days / 4 Nights",
      bookingType: "Customized",
      totalPaid: 31000,
      paymentHistory: [
        {
          id: "PAY-2025-002-1",
          paymentType: "Partial Payment",
          amount: 31000,
          modeOfPayment: "Gcash",
          proofOfPayment: "https://example.com/proof1.jpg",
          submittedAt: "2025-11-08T10:30:00Z"
        }
      ]
    },
    {
      id: "BV-2025-003",
      customer: "Ana Reyes",
      email: "ana.reyes@email.com",
      mobile: "+63 919 345 6789",
      destination: "Baguio City, Benguet",
      dates: "November 28, 2025 – November 30, 2025",
      travelers: 3,
      amount: "₱38,750",
      paymentStatus: "Paid",
      tripStatus: "in progress",
      bookingDate: "November 1, 2025",
      image: "https://images.unsplash.com/photo-1587811448180-a07307dc45b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWd1aW8lMjBjaXR5JTIwcGhpbGlwcGluZXN8ZW58MXx8fHwxNzYzNDU3ODQ0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      itinerary: "3 Days / 2 Nights",
      bookingType: "Standard",
      tourType: "Joiner",
      totalPaid: 38750,
      paymentHistory: [
        {
          id: "PAY-2025-003-1",
          paymentType: "Full Payment",
          amount: 38750,
          modeOfPayment: "Cash",
          cashConfirmation: "https://example.com/cash1.jpg",
          submittedAt: "2025-11-01T14:20:00Z"
        }
      ]
    },
    {
      id: "BV-2025-004",
      customer: "Carlos Mendoza",
      email: "carlos.mendoza@email.com",
      mobile: "+63 920 456 7890",
      destination: "Oslob, Cebu",
      dates: "February 10, 2026 – February 13, 2026",
      travelers: 2,
      amount: "₱45,200",
      paymentStatus: "Partial",
      tripStatus: "upcoming",
      bookingDate: "November 5, 2025",
      image: "https://images.unsplash.com/photo-1573808645321-beaa7ab67839?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2xvYiUyMGNlYnUlMjB3aGFsZSUyMHNoYXJrfGVufDF8fHx8MTc2MzQ1Nzg0NHww&ixlib=rb-4.1.0&q=80&w=1080",
      itinerary: "3 Days / 2 Nights",
      bookingType: "Customized",
      totalPaid: 22600,
      paymentHistory: [
        {
          id: "PAY-2025-004-1",
          paymentType: "Partial Payment",
          amount: 22600,
          modeOfPayment: "Gcash",
          proofOfPayment: "https://example.com/proof2.jpg",
          submittedAt: "2025-11-05T09:15:00Z"
        }
      ]
    },
    {
      id: "BV-2025-005",
      customer: "Elena Rodriguez",
      email: "elena.rodriguez@email.com",
      mobile: "+63 921 567 8901",
      destination: "Siargao Island, Surigao del Norte",
      dates: "December 10, 2025 – December 15, 2025",
      travelers: 3,
      amount: "₱72,000",
      paymentStatus: "Unpaid",
      tripStatus: "upcoming",
      bookingDate: "October 20, 2025",
      image: "https://images.unsplash.com/photo-1721300931970-290ebc02b836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWFyZ2FvJTIwaXNsYW5kJTIwc3VyZmluZ3xlbnwxfHx8fDE3NjM0NTc4NDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      itinerary: "5 Days / 4 Nights",
      bookingType: "Requested",
      totalPaid: 0,
      paymentHistory: []
    },
  ];

  // Combine default bookings with standard bookings from localStorage
  const bookings = [...standardBookings, ...defaultBookings];

  let filteredBookings = activeTab === "All" 
    ? bookings 
    : bookings.filter(b => {
        if (activeTab === "Partial") return b.paymentStatus === "Partial";
        return b.paymentStatus === activeTab;
      });

  // Apply booking type filter
  if (selectedTypeFilter) {
    filteredBookings = filteredBookings.filter(b => b.bookingType === selectedTypeFilter);
  }

  // Calculate stats based on active tab
  const tabBookingsCount = filteredBookings.length;
  const customizedCount = filteredBookings.filter(b => b.bookingType === "Customized").length;
  const standardCount = filteredBookings.filter(b => b.bookingType === "Standard").length;
  const requestedCount = filteredBookings.filter(b => b.bookingType === "Requested").length;

  const handleViewDetails = (bookingId: string) => {
    navigate(`/user/bookings/${bookingId}`);
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (type: string | null) => {
    if (selectedTypeFilter === type) {
      setSelectedTypeFilter(null); // Deselect if clicking the same filter
    } else {
      setSelectedTypeFilter(type);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[rgba(16,185,129,0.2)]";
      case "Partial":
        return "bg-[rgba(255,152,0,0.1)] text-[#FF9800] border-[rgba(255,152,0,0.2)]";
      case "Unpaid":
        return "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border-[rgba(255,107,107,0.2)]";
      default:
        return "bg-[rgba(100,116,139,0.1)] text-[#64748B] border-[rgba(100,116,139,0.2)]";
    }
  };

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case "in progress":
        return "bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]";
      case "completed":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[rgba(16,185,129,0.2)]";
      case "upcoming":
        return "bg-[rgba(168,85,247,0.1)] text-[#A855F7] border-[rgba(168,85,247,0.2)]";
      default:
        return "bg-[rgba(100,116,139,0.1)] text-[#64748B] border-[rgba(100,116,139,0.2)]";
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case "All":
        return "Active Bookings";
      case "Paid":
        return "Paid Bookings";
      case "Partial":
        return "Partial Bookings";
      case "Unpaid":
        return "Unpaid Bookings";
      default:
        return "Bookings";
    }
  };

  const getTabColor = () => {
    switch (activeTab) {
      case "Paid":
        return { from: "#10B981", to: "#14B8A6" };
      case "Partial":
        return { from: "#FF9800", to: "#FFB84D" };
      case "Unpaid":
        return { from: "#FF6B6B", to: "#FF8C8C" };
      default:
        return { from: "#0A7AFF", to: "#3B9EFF" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b-2 border-[#E5E7EB]">
        <button 
          onClick={() => setActiveTab("All")}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "All" 
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]" 
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          All
        </button>
        <button 
          onClick={() => setActiveTab("Paid")}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "Paid" 
              ? "font-semibold text-[#10B981] border-b-[3px] border-[#10B981] -mb-[2px]" 
              : "font-medium text-[#64748B] hover:text-[#10B981] hover:bg-[rgba(16,185,129,0.05)]"
          }`}
        >
          Paid
        </button>
        <button 
          onClick={() => setActiveTab("Partial")}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "Partial" 
              ? "font-semibold text-[#FF9800] border-b-[3px] border-[#FF9800] -mb-[2px]" 
              : "font-medium text-[#64748B] hover:text-[#FF9800] hover:bg-[rgba(255,152,0,0.05)]"
          }`}
        >
          Partial Payment
        </button>
        <button 
          onClick={() => setActiveTab("Unpaid")}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "Unpaid" 
              ? "font-semibold text-[#FF6B6B] border-b-[3px] border-[#FF6B6B] -mb-[2px]" 
              : "font-medium text-[#64748B] hover:text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)]"
          }`}
        >
          Unpaid
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div onClick={() => handleStatCardClick(null)} className="cursor-pointer">
          <StatCard
            icon={BookOpen}
            label={getTabLabel()}
            value={tabBookingsCount}
            gradientFrom={getTabColor().from}
            gradientTo={getTabColor().to}
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

      {/* Bookings List */}
      <ContentCard title={`Your Bookings (${filteredBookings.length})`} icon={Calendar}>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-primary opacity-50" />
            </div>
            <h3 className="text-lg text-card-foreground mb-2">No bookings found</h3>
            <p className="text-sm text-muted-foreground">
              No {activeTab} bookings at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                ref={(el) => (bookingRefs.current[booking.id] = el)}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg text-[#1A2B4F] font-semibold">Booking #{booking.id}</h3>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus === "Partial" ? "Partial" : booking.paymentStatus}
                        </span>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                          booking.bookingType === "Customized"
                            ? "bg-[rgba(255,127,110,0.1)] text-[#FF7F6E] border-[rgba(255,127,110,0.2)]"
                            : booking.bookingType === "Standard"
                            ? "bg-[rgba(139,125,107,0.1)] text-[#8B7D6B] border-[rgba(139,125,107,0.2)]"
                            : "bg-[rgba(236,72,153,0.1)] text-[#EC4899] border-[rgba(236,72,153,0.2)]"
                        }`}>
                          {booking.bookingType}
                        </span>
                        {booking.bookingType === "Standard" && booking.tourType && (
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

                {/* Customer Info with Icons - Only for Customer Name */}
                <div className="mb-4 pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0A7AFF]" />
                      <span className="text-sm text-[#334155] font-medium">{booking.customer}</span>
                    </div>
                    <span className="text-sm text-[#64748B]">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#64748B]">{booking.email}</span>
                    </div>
                    <span className="text-sm text-[#64748B]">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#64748B]">{booking.mobile}</span>
                    </div>
                  </div>
                </div>

                {/* Trip Details with Icons - Matching UserHistory.tsx design */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
                      <p className="text-sm text-[#334155] font-medium">{booking.dates}</p>
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
                    <DollarSign className="w-4 h-4 text-[#10B981]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Total</p>
                      <p className="text-sm text-[#334155] font-medium">{booking.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#64748B]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Booked On</p>
                      <p className="text-sm text-[#334155] font-medium">{booking.bookingDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
      <FAQAssistant />
    </div>
  );
}