import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, BookOpen, Briefcase, FileCheck, ClipboardList } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { StatCard } from "../../components/StatCard";
import { BookingListCard } from "../../components/BookingListCard";
import { Pagination } from "../../components/Pagination";
import { FAQAssistant } from "../../components/FAQAssistant";

interface CompletedTrip {
  id: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  dates: string;
  amount: string;
  rating?: number;
  image: string;
  travelers: number;
  bookingType: "Standard" | "Customized" | "Requested";
  status: "completed" | "cancelled";
  bookedDate: string;
  completedDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
}

export function UserHistory() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"completed" | "cancelled">("completed");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  const itemsPerPage = 6;

  const completedTrips: CompletedTrip[] = [
    {
      id: "BV-2024-098",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Boracay, Aklan",
      dates: "August 10, 2024 – August 15, 2024",
      amount: "₱75,000",
      travelers: 4,
      bookingType: "Standard",
      status: "completed",
      bookedDate: "July 15, 2024",
      completedDate: "August 16, 2024",
      image: "https://images.unsplash.com/photo-1675760134774-0d6972b51e32",
    },
    {
      id: "BV-2024-087",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Puerto Princesa, Palawan",
      dates: "July 5, 2024 – July 9, 2024",
      amount: "₱45,000",
      travelers: 2,
      bookingType: "Customized",
      status: "completed",
      bookedDate: "June 10, 2024",
      completedDate: "July 10, 2024",
      image: "https://images.unsplash.com/photo-1632307918787-8cb52566dd35",
    },
    {
      id: "BV-2024-076",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Baguio City, Benguet",
      dates: "June 15, 2024 – June 18, 2024",
      amount: "₱28,500",
      travelers: 3,
      bookingType: "Standard",
      status: "completed",
      bookedDate: "May 20, 2024",
      completedDate: "June 19, 2024",
      image: "https://images.unsplash.com/photo-1677215552516-1f2a2aa46915",
    },
    {
      id: "BV-2024-065",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Siargao Island, Surigao del Norte",
      dates: "May 10, 2024 – May 15, 2024",
      amount: "₱58,000",
      travelers: 2,
      bookingType: "Requested",
      status: "completed",
      bookedDate: "April 5, 2024",
      completedDate: "May 16, 2024",
      image: "https://images.unsplash.com/photo-1583416750470-965b2707b355",
    },
    {
      id: "BV-2024-054",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Vigan, Ilocos Sur",
      dates: "April 20, 2024 – April 23, 2024",
      amount: "₱32,000",
      travelers: 3,
      bookingType: "Standard",
      status: "completed",
      bookedDate: "March 15, 2024",
      completedDate: "April 24, 2024",
      image: "https://images.unsplash.com/photo-1601991956120-c19c7e5b5f02",
    },
    {
      id: "BV-2024-043",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Batanes Islands",
      dates: "March 10, 2024 – March 16, 2024",
      amount: "₱95,000",
      travelers: 2,
      bookingType: "Customized",
      status: "completed",
      bookedDate: "February 1, 2024",
      completedDate: "March 17, 2024",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
    },
    {
      id: "BV-2024-032",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Coron, Palawan",
      dates: "February 14, 2024 – February 18, 2024",
      amount: "₱52,000",
      travelers: 4,
      bookingType: "Standard",
      status: "completed",
      bookedDate: "January 10, 2024",
      completedDate: "February 19, 2024",
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a",
    },
    {
      id: "BV-2024-021",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Davao City, Davao del Sur",
      dates: "January 20, 2024 – January 24, 2024",
      amount: "₱38,500",
      travelers: 3,
      bookingType: "Requested",
      status: "completed",
      bookedDate: "December 15, 2023",
      completedDate: "January 25, 2024",
      image: "https://images.unsplash.com/photo-1573790387788-16b7174e6303",
    },
  ];

  const cancelledTrips: CompletedTrip[] = [
    {
      id: "BV-2024-089",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Sagada, Mountain Province",
      dates: "September 1, 2024 – September 5, 2024",
      amount: "₱42,000",
      travelers: 2,
      bookingType: "Standard",
      status: "cancelled",
      bookedDate: "August 1, 2024",
      cancelledDate: "August 20, 2024",
      cancellationReason: "Personal emergency - family matter that required immediate attention",
      image: "https://images.unsplash.com/photo-1578836537282-3171d77f8632",
    },
    {
      id: "BV-2024-067",
      customer: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      destination: "Cebu City, Cebu",
      dates: "July 25, 2024 – July 28, 2024",
      amount: "₱35,000",
      travelers: 3,
      bookingType: "Customized",
      status: "cancelled",
      bookedDate: "June 20, 2024",
      cancelledDate: "July 10, 2024",
      cancellationReason: "Change in work schedule - unexpected business commitment",
      image: "https://images.unsplash.com/photo-1573808645321-beaa7ab67839",
    },
  ];

  const allTrips = activeTab === "completed" ? completedTrips : cancelledTrips;
  
  // Apply booking type filter
  const filteredTrips = selectedTypeFilter 
    ? allTrips.filter(t => t.bookingType === selectedTypeFilter)
    : allTrips;
  
  // Calculate paginated trips
  const indexOfLastTrip = currentPage * itemsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - itemsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);

  // Calculate stats based on active tab
  const statusTripsCount = allTrips.length;
  const customizedCount = allTrips.filter(t => t.bookingType === "Customized").length;
  const standardCount = allTrips.filter(t => t.bookingType === "Standard").length;
  const requestedCount = allTrips.filter(t => t.bookingType === "Requested").length;

  const handleViewDetails = (bookingId: string) => {
    navigate(`/user/history/${bookingId}`);
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
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b-2 border-[#E5E7EB]">
        <button 
          onClick={() => {
            setActiveTab("completed");
            setCurrentPage(1);
          }}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "completed" 
              ? "font-semibold text-[#10B981] border-b-[3px] border-[#10B981] -mb-[2px]" 
              : "font-medium text-[#64748B] hover:text-[#10B981] hover:bg-[rgba(16,185,129,0.05)]"
          }`}
        >
          Completed
        </button>
        <button 
          onClick={() => {
            setActiveTab("cancelled");
            setCurrentPage(1);
          }}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "cancelled" 
              ? "font-semibold text-[#FF6B6B] border-b-[3px] border-[#FF6B6B] -mb-[2px]" 
              : "font-medium text-[#64748B] hover:text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)]"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div onClick={() => handleStatCardClick(null)} className="cursor-pointer">
          <StatCard
            icon={BookOpen}
            label={activeTab === "completed" ? "Completed Trips" : "Cancelled Trips"}
            value={statusTripsCount.toString()}
            gradientFrom={activeTab === "completed" ? "#10B981" : "#FF6B6B"}
            gradientTo={activeTab === "completed" ? "#14B8A6" : "#FF8C8C"}
            selected={selectedTypeFilter === null}
          />
        </div>
        <div onClick={() => handleStatCardClick("Customized")} className="cursor-pointer">
          <StatCard
            icon={Briefcase}
            label="Customized"
            value={customizedCount.toString()}
            gradientFrom="#0A7AFF"
            gradientTo="#3B9EFF"
            selected={selectedTypeFilter === "Customized"}
          />
        </div>
        <div onClick={() => handleStatCardClick("Standard")} className="cursor-pointer">
          <StatCard
            icon={FileCheck}
            label="Standard"
            value={standardCount.toString()}
            gradientFrom="#10B981"
            gradientTo="#14B8A6"
            selected={selectedTypeFilter === "Standard"}
          />
        </div>
        <div onClick={() => handleStatCardClick("Requested")} className="cursor-pointer">
          <StatCard
            icon={ClipboardList}
            label="Requested"
            value={requestedCount.toString()}
            gradientFrom="#FFB84D"
            gradientTo="#FF9800"
            selected={selectedTypeFilter === "Requested"}
          />
        </div>
      </div>

      {/* Trips List */}
      <ContentCard 
        title={`${activeTab === "completed" ? "Completed" : "Cancelled"} Trips (${filteredTrips.length})`}
        icon={Archive}
      >
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Archive className="w-10 h-10 text-primary opacity-50" />
            </div>
            <h3 className="text-lg text-card-foreground mb-2">
              No {activeTab} trips yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Your {activeTab} trips will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentTrips.map((trip) => (
                <BookingListCard
                  key={trip.id}
                  booking={{
                    id: trip.id,
                    customer: trip.customer,
                    email: trip.email,
                    mobile: trip.mobile,
                    destination: trip.destination,
                    dates: trip.dates,
                    travelers: trip.travelers,
                    total: trip.amount,
                    bookedDate: trip.bookedDate,
                    bookingType: trip.bookingType,
                  }}
                  onViewDetails={handleViewDetails}
                  variant={trip.status === "cancelled" ? "rejected" : "default"}
                  statusBadge={
                    <>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {getStatusIcon(trip.status)} {trip.status === "completed" ? "Completed" : "Cancelled"}
                      </span>
                      {trip.bookingType && (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getBookingTypeColor(trip.bookingType)}`}>
                          {trip.bookingType}
                        </span>
                      )}
                    </>
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {filteredTrips.length > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredTrips.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </ContentCard>
      <FAQAssistant />
    </div>
  );
}