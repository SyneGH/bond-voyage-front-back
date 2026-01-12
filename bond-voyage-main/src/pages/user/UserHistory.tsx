import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  BookOpen,
  Briefcase,
  FileCheck,
  ClipboardList,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { StatCard } from "../../components/StatCard";
import { BookingListCard } from "../../components/BookingListCard";
import { Pagination } from "../../components/Pagination";
import { FAQAssistant } from "../../components/FAQAssistant";
import { useMyBookings } from "../../hooks/useBookings";

interface TransformedTrip {
  id: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  dates: string;
  amount: string;
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
  const [activeTab, setActiveTab] = useState<"completed" | "cancelled">(
    "completed"
  );
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(
    null
  );
  const itemsPerPage = 6;

  // API query params
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 6,
    status: "COMPLETED" as "COMPLETED" | "CANCELLED",
  });

  // Fetch bookings with server-side filtering
  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
  } = useMyBookings(queryParams);

  // Transform API data
  const transformBooking = (apiBooking: any): TransformedTrip => {
    const totalAmount =
      parseFloat(apiBooking.total?.replace(/[₱,]/g, "") || apiBooking.total) ||
      0;

    const dates = apiBooking.dates?.split(" - ") || [];
    const startDate = dates[0] || new Date().toISOString().split("T")[0];
    const endDate = dates[1] || startDate;

    return {
      id: apiBooking.id,
      customer: apiBooking.customer || "Unknown Customer",
      email: apiBooking.email || "",
      mobile: apiBooking.mobile || "N/A",
      destination: apiBooking.destination,
      dates: apiBooking.dates,
      amount: apiBooking.total,
      travelers: apiBooking.travelers,
      bookingType: apiBooking.bookingType,
      status:
        apiBooking.statusBadges === "COMPLETED" ? "completed" : "cancelled",
      bookedDate: new Date(apiBooking.bookedDate).toLocaleDateString(),
      completedDate: apiBooking.completedDate
        ? new Date(apiBooking.completedDate).toLocaleDateString()
        : undefined,
      cancelledDate: apiBooking.cancelledDate
        ? new Date(apiBooking.cancelledDate).toLocaleDateString()
        : undefined,
      cancellationReason: apiBooking.cancellationReason,
    };
  };

  const bookings = bookingsData?.data?.map(transformBooking) || [];

  // Build API query params based on filters and active tab
  useEffect(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      status: activeTab === "completed" ? "COMPLETED" : "CANCELLED",
    };

    // Booking type filter
    if (selectedTypeFilter) {
      params.type = selectedTypeFilter.toUpperCase();
    }

    setQueryParams(params);
  }, [currentPage, selectedTypeFilter, activeTab]);

  // Apply booking type filter (client-side for consistency with existing UI)
  const filteredTrips = selectedTypeFilter
    ? bookings.filter((t) => t.bookingType === selectedTypeFilter)
    : bookings;

  // Use API pagination
  const totalItems = bookingsData?.meta?.total || 0;
  const totalPages = bookingsData?.meta?.totalPages || 1;

  // Calculate stats based on filtered bookings
  const statusTripsCount = filteredTrips.length;
  const customizedCount = filteredTrips.filter(
    (t) => t.bookingType === "Customized"
  ).length;
  const standardCount = filteredTrips.filter(
    (t) => t.bookingType === "Standard"
  ).length;
  const requestedCount = filteredTrips.filter(
    (t) => t.bookingType === "Requested"
  ).length;

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

  // Handle tab change
  const handleTabChange = (tab: "completed" | "cancelled") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedTypeFilter(null);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A7AFF]" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-[#FF6B6B] mb-4" />
        <h3 className="text-lg font-semibold text-[#1A2B4F] mb-2">
          Failed to load history
        </h3>
        <p className="text-sm text-[#64748B] mb-4">Please try again later</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#0A7AFF] text-white rounded-lg hover:bg-[#0865CC]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b-2 border-[#E5E7EB]">
        <button
          onClick={() => handleTabChange("completed")}
          className={`px-5 h-11 text-sm transition-colors ${
            activeTab === "completed"
              ? "font-semibold text-[#10B981] border-b-[3px] border-[#10B981] -mb-[2px]"
              : "font-medium text-[#64748B] hover:text-[#10B981] hover:bg-[rgba(16,185,129,0.05)]"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => handleTabChange("cancelled")}
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
        <div
          onClick={() => handleStatCardClick(null)}
          className="cursor-pointer"
        >
          <StatCard
            icon={BookOpen}
            label={
              activeTab === "completed" ? "Completed Trips" : "Cancelled Trips"
            }
            value={statusTripsCount.toString()}
            gradientFrom={activeTab === "completed" ? "#10B981" : "#FF6B6B"}
            gradientTo={activeTab === "completed" ? "#14B8A6" : "#FF8C8C"}
            selected={selectedTypeFilter === null}
          />
        </div>
        <div
          onClick={() => handleStatCardClick("Customized")}
          className="cursor-pointer"
        >
          <StatCard
            icon={Briefcase}
            label="Customized"
            value={customizedCount.toString()}
            gradientFrom="#0A7AFF"
            gradientTo="#3B9EFF"
            selected={selectedTypeFilter === "Customized"}
          />
        </div>
        <div
          onClick={() => handleStatCardClick("Standard")}
          className="cursor-pointer"
        >
          <StatCard
            icon={FileCheck}
            label="Standard"
            value={standardCount.toString()}
            gradientFrom="#10B981"
            gradientTo="#14B8A6"
            selected={selectedTypeFilter === "Standard"}
          />
        </div>
        <div
          onClick={() => handleStatCardClick("Requested")}
          className="cursor-pointer"
        >
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
        title={`${
          activeTab === "completed" ? "Completed" : "Cancelled"
        } Trips (${totalItems})`}
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
              {filteredTrips.map((trip) => (
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
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {getStatusIcon(trip.status)}{" "}
                        {trip.status === "completed"
                          ? "Completed"
                          : "Cancelled"}
                      </span>
                      {trip.bookingType && (
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getBookingTypeColor(
                            trip.bookingType
                          )}`}
                        >
                          {trip.bookingType}
                        </span>
                      )}
                    </>
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {totalItems > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
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
