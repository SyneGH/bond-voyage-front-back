import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Plane, Hotel, Camera, UtensilsCrossed, Car, Package, BookOpen, Briefcase, FileCheck, ClipboardList } from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { BookingListCard } from "../components/BookingListCard";
import { BookingDetailView } from "../components/BookingDetailView";
import { SearchFilterToolbar, SortOrder } from "../components/SearchFilterToolbar";
import { HistoryFilterContent } from "../components/filters/HistoryFilterContent";
import { StatCard } from "../components/StatCard";
import { Pagination } from "../components/Pagination";
import type { HistoryBooking } from "../App";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";
import { toast } from "sonner@2.0.3";

interface HistoryProps {
  historyBookings: HistoryBooking[];
  setHistoryBookings: React.Dispatch<React.SetStateAction<HistoryBooking[]>>;
}

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

export function History({ historyBookings, setHistoryBookings }: HistoryProps) {
  const location = useLocation();
  const bookingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [activeTab, setActiveTab] = useState<"completed" | "cancelled">("completed");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // Reset view mode on component mount
  useEffect(() => {
    return () => {
      setViewMode("list");
      setSelectedBookingId(null);
    };
  }, []);
  
  // Search and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  
  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [completedDateFrom, setCompletedDateFrom] = useState("");
  const [completedDateTo, setCompletedDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter by booking type
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);

  // Handle navigation from Bookings with scroll-to functionality
  useEffect(() => {
    if (location.state?.scrollToId) {
      const { scrollToId, activeTab: stateActiveTab } = location.state;
      
      // Set the active tab if provided
      if (stateActiveTab) {
        setActiveTab(stateActiveTab);
      }
      
      // Scroll to the booking after a short delay to ensure rendering
      setTimeout(() => {
        const element = bookingRefs.current[scrollToId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Add a highlight animation
          element.style.boxShadow = '0 0 0 4px rgba(255, 107, 107, 0.3)';
          element.style.transition = 'box-shadow 0.3s ease';
          
          setTimeout(() => {
            element.style.boxShadow = '';
          }, 2000);
        }
      }, 300);
      
      // Clear the state to prevent re-scrolling on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, historyBookings]);

  // Itinerary data for detailed view - Added for BV-2024-098 and BV-2024-087
  const itineraryData: Record<string, ItineraryDay[]> = {
    "BV-2024-098": [
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
          { time: "5:00 PM", icon: Hotel, title: "Return to Resort", description: "Free time for rest and relaxation", location: "Resort" },
          { time: "7:00 PM", icon: UtensilsCrossed, title: "Dinner at D'Mall", description: "Explore local restaurants", location: "D'Mall" },
        ],
      },
      {
        day: 3,
        title: "Beach Activities & Water Sports",
        activities: [
          { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast buffet at resort", location: "Resort" },
          { time: "10:00 AM", icon: Camera, title: "Beach Activities", description: "Parasailing, banana boat, jet ski", location: "White Beach" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Beachfront dining", location: "Station 1" },
          { time: "3:00 PM", icon: Package, title: "Free Time", description: "Shopping at D'Mall or beach relaxation", location: "D'Mall / Beach" },
        ],
      },
      {
        day: 4,
        title: "Relaxation Day",
        activities: [
          { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Leisurely breakfast at resort", location: "Resort" },
          { time: "10:00 AM", icon: Camera, title: "Beach Relaxation", description: "Sunbathing and swimming", location: "White Beach" },
          { time: "2:00 PM", icon: Package, title: "Spa Treatment", description: "Optional massage and spa services", location: "Resort Spa" },
          { time: "7:00 PM", icon: UtensilsCrossed, title: "Farewell Dinner", description: "Special seafood feast", location: "Beachfront Restaurant" },
        ],
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Final breakfast at resort", location: "Resort" },
          { time: "9:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out and luggage transfer", location: "Resort" },
          { time: "10:00 AM", icon: Car, title: "Transfer to Airport", description: "Boat and van transfer to Caticlan", location: "Caticlan Airport" },
          { time: "12:00 PM", icon: Plane, title: "Departure", description: "Flight back home", location: "Caticlan Airport" },
        ],
      },
    ],
    "BV-2024-087": [
      {
        day: 1,
        title: "Arrival & City Orientation",
        activities: [
          { time: "9:00 AM", icon: Plane, title: "Arrival at Puerto Princesa", description: "Meet tour coordinator at airport", location: "Puerto Princesa Airport" },
          { time: "10:30 AM", icon: Car, title: "Transfer to Hotel", description: "Check-in at city hotel", location: "City Center" },
          { time: "2:00 PM", icon: Camera, title: "City Tour", description: "Visit Plaza Cuartel, Cathedral, Baywalk", location: "Puerto Princesa City" },
          { time: "6:00 PM", icon: UtensilsCrossed, title: "Welcome Dinner", description: "Local cuisine at waterfront restaurant", location: "Baywalk" },
        ],
      },
      {
        day: 2,
        title: "Underground River Tour",
        activities: [
          { time: "6:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Packed breakfast for early departure", location: "Hotel" },
          { time: "7:00 AM", icon: Car, title: "Travel to Sabang", description: "2-hour drive to Underground River", location: "Sabang Wharf" },
          { time: "9:30 AM", icon: Plane, title: "Underground River Tour", description: "UNESCO World Heritage Site exploration", location: "Puerto Princesa Underground River" },
          { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch at Sabang", description: "Beachside lunch", location: "Sabang Beach" },
          { time: "3:00 PM", icon: Car, title: "Return to City", description: "Drive back to Puerto Princesa", location: "City Center" },
          { time: "7:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Free choice dining", location: "City Center" },
        ],
      },
      {
        day: 3,
        title: "Island Hopping Adventure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel", location: "Hotel" },
          { time: "8:00 AM", icon: Plane, title: "Honda Bay Island Hopping", description: "Visit Luli Island, Cowrie Island, Starfish Island", location: "Honda Bay" },
          { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch on Island", description: "Fresh seafood lunch", location: "Cowrie Island" },
          { time: "4:00 PM", icon: Car, title: "Return to Hotel", description: "Transfer back to city", location: "Hotel" },
          { time: "7:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Enjoy local delicacies", location: "City Center" },
        ],
      },
      {
        day: 4,
        title: "Departure Day",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Final breakfast", location: "Hotel" },
          { time: "9:00 AM", icon: Package, title: "Free Time", description: "Last minute shopping or relaxation", location: "City Center" },
          { time: "11:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out", location: "Hotel" },
          { time: "12:00 PM", icon: Car, title: "Airport Transfer", description: "Transfer to airport", location: "Puerto Princesa Airport" },
          { time: "2:00 PM", icon: Plane, title: "Departure", description: "Flight back home", location: "Puerto Princesa Airport" },
        ],
      },
    ],
  };

  // Count active filters
  const activeFiltersCount = 
    (dateFrom || dateTo ? 1 : 0) + 
    (completedDateFrom || completedDateTo ? 1 : 0) + 
    (minAmount || maxAmount ? 1 : 0);

  // Export functions
  const handleExportPDF = () => {
    const exportData = filteredBookings.map(booking => ({
      id: booking.id,
      customer: booking.customer,
      email: booking.email,
      mobile: booking.mobile,
      destination: booking.destination,
      dates: booking.dates,
      travelers: `${booking.travelers} pax`,
      totalamount: booking.totalAmount,
      status: booking.status,
      bookingtype: booking.bookingType || 'N/A',
      completeddate: booking.completedDate || booking.cancelledDate || 'N/A',
    }));
    const titleSuffix = activeTab === "completed" ? "Completed Bookings" : "Cancelled Bookings";
    exportToPDF(exportData, `History - ${titleSuffix}`, ["ID", "Customer", "Email", "Mobile", "Destination", "Dates", "Travelers", "Total Amount", "Status", "Booking Type", "Completed Date"]);
    toast.success(`Exporting ${activeTab} bookings as PDF...`);
  };

  const handleExportExcel = () => {
    const exportData = filteredBookings.map(booking => ({
      id: booking.id,
      customer: booking.customer,
      email: booking.email,
      mobile: booking.mobile,
      destination: booking.destination,
      dates: booking.dates,
      travelers: `${booking.travelers} pax`,
      totalamount: booking.totalAmount,
      status: booking.status,
      bookingtype: booking.bookingType || 'N/A',
      completeddate: booking.completedDate || booking.cancelledDate || 'N/A',
    }));
    const titleSuffix = activeTab === "completed" ? "Completed Bookings" : "Cancelled Bookings";
    exportToExcel(exportData, `History - ${titleSuffix}`, ["ID", "Customer", "Email", "Mobile", "Destination", "Dates", "Travelers", "Total Amount", "Status", "Booking Type", "Completed Date"]);
    toast.success(`Exporting ${activeTab} bookings as Excel...`);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCompletedDateFrom("");
    setCompletedDateTo("");
    setMinAmount("");
    setMaxAmount("");
  };

  // Filter bookings based on active tab, search, filters, and sort
  const getFilteredAndSortedBookings = () => {
    let filtered = historyBookings.filter(b => b.status === activeTab);

    // Apply booking type filter
    if (selectedTypeFilter) {
      filtered = filtered.filter(b => b.bookingType === selectedTypeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply date range filter (booked date)
    if (dateFrom || dateTo) {
      filtered = filtered.filter(b => {
        const bookedDate = new Date(b.bookedDate);
        if (dateFrom && dateTo) {
          return bookedDate >= new Date(dateFrom) && bookedDate <= new Date(dateTo);
        } else if (dateFrom) {
          return bookedDate >= new Date(dateFrom);
        } else if (dateTo) {
          return bookedDate <= new Date(dateTo);
        }
        return true;
      });
    }

    // Apply completed/cancelled date range filter
    if (completedDateFrom || completedDateTo) {
      filtered = filtered.filter(b => {
        const statusDate = b.completedDate || b.cancelledDate;
        if (!statusDate) return false;
        const date = new Date(statusDate);
        if (completedDateFrom && completedDateTo) {
          return date >= new Date(completedDateFrom) && date <= new Date(completedDateTo);
        } else if (completedDateFrom) {
          return date >= new Date(completedDateFrom);
        } else if (completedDateTo) {
          return date <= new Date(completedDateTo);
        }
        return true;
      });
    }

    // Apply amount range filter
    if (minAmount || maxAmount) {
      filtered = filtered.filter(b => {
        const amount = parseFloat(b.totalAmount.replace(/[₱,]/g, ''));
        const min = minAmount ? parseFloat(minAmount) : 0;
        const max = maxAmount ? parseFloat(maxAmount) : Infinity;
        return amount >= min && amount <= max;
      });
    }

    // Apply sorting
    if (sortOrder === "newest") {
      // Sort by booked date (newest first)
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.bookedDate);
        const dateB = new Date(b.bookedDate);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (sortOrder === "oldest") {
      // Sort by booked date (oldest first)
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.bookedDate);
        const dateB = new Date(b.bookedDate);
        return dateA.getTime() - dateB.getTime();
      });
    }

    return filtered;
  };

  const filteredBookings = getFilteredAndSortedBookings();

  // Calculate paginated bookings
  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  // Reset to page 1 when filters/search/sort/tab changes
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (type: string | null) => {
    if (selectedTypeFilter === type) {
      setSelectedTypeFilter(null); // Deselect if clicking the same filter
    } else {
      setSelectedTypeFilter(type);
    }
    setCurrentPage(1);
  };

  // Booking Type Statistics (synced with completed/cancelled tab)
  const statusBookingsCount = filteredBookings.length;
  const customizedCount = filteredBookings.filter(b => b.bookingType === "Customized").length;
  const standardCount = filteredBookings.filter(b => b.bookingType === "Standard").length;
  const requestedCount = filteredBookings.filter(b => b.bookingType === "Requested").length;

  // Generate dynamic label based on active tab
  const getStatusBookingsLabel = () => {
    return activeTab === "completed" ? "Completed Bookings" : "Cancelled Bookings";
  };

  // Get current booking for detailed view
  const selectedBooking = historyBookings.find(b => b.id === selectedBookingId);
  const selectedItinerary = selectedBookingId ? itineraryData[selectedBookingId] || [] : [];

  // View booking details
  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBookingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[rgba(16,185,129,0.2)]";
      case "cancelled":
        return "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border-[rgba(255,107,107,0.2)]";
      default:
        return "bg-[rgba(100,116,139,0.1)] text-[#64748B] border-[rgba(100,116,139,0.2)]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "cancelled":
        return "✗";
      default:
        return "•";
    }
  };

  // Render detailed booking view
  if (viewMode === "detail" && selectedBooking) {
    // Transform HistoryBooking to format expected by BookingDetailView
    const bookingForDetail = {
      id: selectedBooking.id,
      customer: selectedBooking.customer,
      email: selectedBooking.email,
      mobile: selectedBooking.mobile,
      destination: selectedBooking.destination,
      itinerary: selectedBooking.itinerary,
      dates: selectedBooking.dates,
      travelers: selectedBooking.travelers,
      total: selectedBooking.totalAmount,
      bookedDate: selectedBooking.bookedDate,
    };

    const headerVariant = selectedBooking.status === "completed" ? "completed" : "cancelled";

    // Custom action content for History view
    const actionContent = (
      <div className="space-y-3">
        <div className={`p-4 rounded-xl border ${
          selectedBooking.status === "completed"
            ? "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]"
            : "bg-[rgba(255,107,107,0.05)] border-[rgba(255,107,107,0.2)]"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#64748B]">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              selectedBooking.status === "completed"
                ? "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
                : "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border border-[rgba(255,107,107,0.2)]"
            }`}>
              {selectedBooking.status === "completed" ? "✓ Completed" : "✗ Cancelled"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B]">
              {selectedBooking.status === "completed" ? "Completed On" : "Cancelled On"}
            </span>
            <span className="text-xs font-medium text-[#334155]">
              {selectedBooking.status === "completed" ? selectedBooking.completedDate : selectedBooking.cancelledDate}
            </span>
          </div>
        </div>
        {selectedBooking.status === "cancelled" && selectedBooking.cancellationReason && (
          <div className="p-4 rounded-xl border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.05)]">
            <p className="text-xs text-[#64748B] mb-2">Cancellation Reason</p>
            <p className="text-sm text-[#334155] leading-relaxed">{selectedBooking.cancellationReason}</p>
          </div>
        )}
      </div>
    );

    return (
      <BookingDetailView
        booking={bookingForDetail}
        itinerary={selectedItinerary}
        onBack={handleBackToList}
        actionButtons={actionContent}
        breadcrumbPage="History"
        headerVariant={headerVariant}
        showPaymentDetails={false}
        useBackButtonHeader={true}
        backButtonSubtitle={selectedBooking.status === "completed" ? "Completed Booking" : "Cancelled Booking"}
      />
    );
  }

  // Render list view
  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b-2 border-[#E5E7EB]">
        <button 
          onClick={() => setActiveTab("completed")}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "completed" 
              ? "font-semibold text-[#10B981] border-b-[3px] border-[#10B981] -mb-[2px]" 
              : "font-medium text-[#64748B] hover:text-[#10B981] hover:bg-[rgba(16,185,129,0.05)]"
          }`}
        >
          Completed
        </button>
        <button 
          onClick={() => setActiveTab("cancelled")}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "cancelled" 
              ? "font-semibold text-[#FF6B6B] border-b-[3px] border-[#FF6B6B] -mb-[2px]" 
              : "font-medium text-[#64748B] hover:text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)]"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Booking Type Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div onClick={() => handleStatCardClick(null)} className="cursor-pointer">
          <StatCard
            icon={BookOpen}
            label={getStatusBookingsLabel()}
            value={statusBookingsCount}
            gradientFrom={activeTab === "completed" ? "#10B981" : "#FF6B6B"}
            gradientTo={activeTab === "completed" ? "#14B8A6" : "#FF8C8C"}
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
        title={`${activeTab === "completed" ? "Completed" : "Cancelled"} Bookings (${filteredBookings.length})`}
      >
        <SearchFilterToolbar
          searchPlaceholder="Search by booking ID, customer, or destination..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          activeFiltersCount={activeFiltersCount}
          filterContent={
            <HistoryFilterContent
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
              completedDateFrom={completedDateFrom}
              onCompletedDateFromChange={setCompletedDateFrom}
              completedDateTo={completedDateTo}
              onCompletedDateToChange={setCompletedDateTo}
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
        
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#64748B]">
                No {activeTab} bookings to display
              </p>
            </div>
          ) : (
            currentBookings.map((booking) => {
              const bookingForCard = {
                id: booking.id,
                customer: booking.customer,
                email: booking.email,
                mobile: booking.mobile,
                destination: booking.destination,
                dates: booking.dates,
                travelers: booking.travelers,
                total: booking.totalAmount,
                bookedDate: booking.bookedDate,
                bookingType: booking.bookingType,
              };

              const getBookingTypeColor = (type: string) => {
                switch (type) {
                  case "Customized":
                    return "bg-[rgba(255,127,110,0.1)] text-[#FF7F6E] border-[rgba(255,127,110,0.2)]";
                  case "Standard":
                    return "bg-[rgba(139,125,107,0.1)] text-[#8B7D6B] border-[rgba(139,125,107,0.2)]";
                  case "Requested":
                    return "bg-[rgba(236,72,153,0.1)] text-[#EC4899] border-[rgba(236,72,153,0.2)]";
                  default:
                    return "bg-[rgba(100,116,139,0.1)] text-[#64748B] border-[rgba(100,116,139,0.2)]";
                }
              };

              return (
                <div key={booking.id} ref={(el) => (bookingRefs.current[booking.id] = el)}>
                  <BookingListCard
                    booking={bookingForCard}
                    onViewDetails={handleViewDetails}
                    variant={booking.status === "cancelled" ? "rejected" : "default"}
                    statusBadge={
                      <>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)} {booking.status === "completed" ? "Completed" : "Cancelled"}
                        </span>
                        {booking.bookingType && (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getBookingTypeColor(booking.bookingType)}`}>
                            {booking.bookingType}
                          </span>
                        )}
                      </>
                    }
                  />
                </div>
              );
            })
          )}
        </div>
        
        {/* Pagination */}
        {filteredBookings.length > itemsPerPage && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredBookings.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </ContentCard>
    </div>
  );
}