import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Car,
  MapPin,
  BookOpen,
  Briefcase,
  FileCheck,
  ClipboardList,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Users,
  Clock,
  CreditCard,
  Mail,
  Phone,
  User,
  Download,
} from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import {
  SearchFilterToolbar,
  SortOrder,
} from "../components/SearchFilterToolbar";
import { HistoryFilterContent } from "../components/filters/HistoryFilterContent";
import { StatCard } from "../components/StatCard";
import { Pagination } from "../components/Pagination";
import { ItineraryDetailDisplay } from "../components/ItineraryDetailDisplay";
import { useAdminBookings, useBookingDetail } from "../hooks/useBookings";
import { queryKeys } from "../utils/lib/queryKeys";
import {
  exportToPDF,
  exportToExcel,
  exportBookingDetailToPDF,
  exportBookingDetailToExcel,
} from "../utils/exportUtils";
import { formatDateRange } from "../App";
import { capitalize } from "../utils/helpers/capitalize";
import { toast } from "sonner";
import { useBreadcrumbs } from "../components/BreadcrumbContext";

interface HistoryProps {
  onHistoryCountChange?: (count: number) => void;
}

export function History({ onHistoryCountChange }: HistoryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbs();

  const [activeTab, setActiveTab] = useState<"completed" | "cancelled">(
    "completed"
  );
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  // API query params
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    status: "COMPLETED" as "COMPLETED" | "CANCELLED",
  });

  // Fetch bookings with server-side filtering
  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
  } = useAdminBookings(queryParams);

  // Fetch detailed booking when in detail view
  const { data: bookingDetailData, isLoading: isLoadingDetail } =
    useBookingDetail(selectedBookingId || "", {
      enabled: !!selectedBookingId && viewMode === "detail",
      queryKey: [queryKeys.bookings.detail],
    });

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(
    null
  );

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);

  // Applied filters (used for querying)
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [completedDateFrom, setCompletedDateFrom] = useState("");
  const [completedDateTo, setCompletedDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Pending filters (used inside the filter UI until 'Apply' is pressed)
  const [pendingDateFrom, setPendingDateFrom] = useState("");
  const [pendingDateTo, setPendingDateTo] = useState("");
  const [pendingCompletedDateFrom, setPendingCompletedDateFrom] = useState("");
  const [pendingCompletedDateTo, setPendingCompletedDateTo] = useState("");
  const [pendingMinAmount, setPendingMinAmount] = useState("");
  const [pendingMaxAmount, setPendingMaxAmount] = useState("");

  // When opening the filter panel, initialize pending values from applied ones
  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setPendingDateFrom(dateFrom);
      setPendingDateTo(dateTo);
      setPendingCompletedDateFrom(completedDateFrom);
      setPendingCompletedDateTo(completedDateTo);
      setPendingMinAmount(minAmount);
      setPendingMaxAmount(maxAmount);
    }
    setFilterOpen(open);
  };

  const transformBooking = (apiBooking: any) => {
    const totalAmount = parseFloat(apiBooking.totalPrice) || 0;

    const startDate = apiBooking.startDate || apiBooking.itinerary?.startDate;
    const endDate = apiBooking.endDate || apiBooking.itinerary?.endDate;

    const customerName = apiBooking.customerName || "Unknown Customer";
    const customerEmail = apiBooking.customerEmail || "";
    const customerMobile = apiBooking.customerMobile || "N/A";

    return {
      id: apiBooking.id,
      bookingCode: apiBooking.bookingCode,
      customer: customerName,
      email: customerEmail,
      mobile: customerMobile,
      destination: apiBooking.destination || apiBooking.itinerary?.destination,
      itinerary: apiBooking.destination || apiBooking.itinerary?.destination,
      startDate: startDate,
      endDate: endDate,
      travelers: apiBooking.travelers || apiBooking.itinerary?.travelers || 1,
      totalAmount: totalAmount,
      bookedDate: apiBooking.bookedDate || apiBooking.createdAt,
      bookedDateObj: new Date(apiBooking.bookedDate || apiBooking.createdAt),
      status: apiBooking.status,
      bookingType: apiBooking.type,
      completedDate: apiBooking.completedAt
        ? new Date(apiBooking.completedAt).toISOString().split("T")[0]
        : null,
      cancelledDate: apiBooking.cancelledAt
        ? new Date(apiBooking.cancelledAt).toISOString().split("T")[0]
        : null,
      cancellationReason: apiBooking.cancellationReason,
    };
  };

  const transformDetailedBooking = (apiBooking: any) => {
    const totalAmount = parseFloat(apiBooking.totalPrice) || 0;

    const customerName =
      apiBooking.customerName ||
      `${apiBooking.user?.firstName || ""} ${
        apiBooking.user?.lastName || ""
      }`.trim() ||
      "Unknown Customer";

    return {
      id: apiBooking.id,
      bookingCode: apiBooking.bookingCode,
      customer: customerName,
      email: apiBooking.customerEmail || apiBooking.user?.email || "",
      mobile: apiBooking.customerMobile || "N/A",
      destination: apiBooking.destination || apiBooking.itinerary?.destination,
      itinerary: apiBooking.destination || apiBooking.itinerary?.destination,
      startDate: apiBooking.startDate || apiBooking.itinerary?.startDate,
      endDate: apiBooking.endDate || apiBooking.itinerary?.endDate,
      travelers: apiBooking.travelers || apiBooking.itinerary?.travelers || 1,
      totalAmount: totalAmount,
      bookedDate: apiBooking.bookedDate || apiBooking.createdAt,
      bookedDateObj: new Date(apiBooking.bookedDate || apiBooking.createdAt),
      status: apiBooking.status,
      bookingType: apiBooking.type,
      completedDate: apiBooking.completedAt
        ? new Date(apiBooking.completedAt).toISOString().split("T")[0]
        : null,
      cancelledDate: apiBooking.cancelledAt
        ? new Date(apiBooking.cancelledAt).toISOString().split("T")[0]
        : null,
      cancellationReason: apiBooking.cancellationReason,
      itineraryDetails:
        apiBooking.itinerary?.days?.map((day: any) => ({
          day: day.dayNumber,
          title: `Day ${day.dayNumber}`,
          activities:
            day.activities?.map((act: any) => ({
              time: act.time,
              icon: getActivityIcon(act.title),
              title: act.title,
              description: act.description || "",
              location: act.location || "",
            })) || [],
        })) || [],
    };
  };

  const getActivityIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("flight") || lowerTitle.includes("arrival"))
      return Plane;
    if (lowerTitle.includes("hotel") || lowerTitle.includes("check-in"))
      return Hotel;
    if (lowerTitle.includes("photo") || lowerTitle.includes("view"))
      return Camera;
    if (
      lowerTitle.includes("lunch") ||
      lowerTitle.includes("dinner") ||
      lowerTitle.includes("breakfast")
    )
      return UtensilsCrossed;
    if (lowerTitle.includes("transfer") || lowerTitle.includes("drive"))
      return Car;
    return MapPin;
  };

  const bookings = bookingsData?.data?.map(transformBooking) || [];
  const selectedBooking = useMemo(() => {
    return bookingDetailData?.data
      ? transformDetailedBooking(bookingDetailData.data)
      : null;
  }, [bookingDetailData?.data?.id]);

  // Update breadcrumbs
  useEffect(() => {
    if (viewMode === "detail" && selectedBooking) {
      setBreadcrumbs([
        { label: "Home", path: "/" },
        { label: "History", path: "/history" },
        {
          label: `${
            selectedBooking.status === "COMPLETED" ? "Completed" : "Cancelled"
          } Booking ${selectedBooking.bookingCode}`,
        },
      ]);
    } else {
      resetBreadcrumbs();
    }
  }, [
    viewMode,
    selectedBooking?.id,
    selectedBooking?.status,
    setBreadcrumbs,
    resetBreadcrumbs,
  ]);

  // Update history count
  useEffect(() => {
    if (onHistoryCountChange && bookingsData?.meta?.total) {
      onHistoryCountChange(bookingsData.meta.total);
    }
  }, [bookingsData?.meta?.total, onHistoryCountChange]);

  // Build API query params based on filters and active tab
  useEffect(() => {
    const params: any = {
      page: 1,
      limit: 10,
      status: activeTab === "completed" ? "COMPLETED" : "CANCELLED",
    };

    // Search query
    if (searchQuery) {
      params.q = searchQuery;
    }

    // Booking type filter
    if (selectedTypeFilter) {
      params.type = selectedTypeFilter;
    }

    // Booked date range filter
    if (dateFrom && dateTo) {
      params.dateFrom = dateFrom;
      params.dateTo = dateTo;
    }

    // Sort
    if (sortOrder === "newest") {
      params.sort = "createdAt:desc";
    } else if (sortOrder === "oldest") {
      params.sort = "createdAt:asc";
    }

    setQueryParams(params);
  }, [searchQuery, selectedTypeFilter, dateFrom, dateTo, sortOrder, activeTab]);

  // Client-side filtering for completed/cancelled dates and amounts
  const getFilteredBookings = () => {
    let filtered = bookings;

    // Completed/cancelled date filter (client-side for now)
    if (completedDateFrom || completedDateTo) {
      filtered = filtered.filter((b) => {
        const statusDate =
          activeTab === "completed" ? b.completedDate : b.cancelledDate;
        if (!statusDate) return false;
        const date = new Date(statusDate);
        if (completedDateFrom && completedDateTo) {
          return (
            date >= new Date(completedDateFrom) &&
            date <= new Date(completedDateTo)
          );
        } else if (completedDateFrom) {
          return date >= new Date(completedDateFrom);
        } else if (completedDateTo) {
          return date <= new Date(completedDateTo);
        }
        return true;
      });
    }

    // Amount filter (client-side for now)
    if (minAmount || maxAmount) {
      filtered = filtered.filter((b) => {
        if (minAmount && maxAmount) {
          return (
            b.totalAmount >= Number(minAmount) &&
            b.totalAmount <= Number(maxAmount)
          );
        } else if (minAmount) {
          return b.totalAmount >= Number(minAmount);
        } else if (maxAmount) {
          return b.totalAmount <= Number(maxAmount);
        }
        return true;
      });
    }

    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  // Use API pagination
  const totalItems = bookingsData?.meta?.total || 0;
  const totalPages = bookingsData?.meta?.totalPages || 1;
  const currentPage = bookingsData?.meta?.page || 1;
  const itemsPerPage = bookingsData?.meta?.limit || 10;

  // Calculate display indices
  const indexOfFirstBooking = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastBooking = Math.min(currentPage * itemsPerPage, totalItems);

  // Use filtered bookings for display
  const currentBookings = filteredBookings;

  // Statistics
  const customizedCount = filteredBookings.filter(
    (b) => b.bookingType === "CUSTOMIZED"
  ).length;
  const standardCount = filteredBookings.filter(
    (b) => b.bookingType === "STANDARD"
  ).length;
  const requestedCount = filteredBookings.filter(
    (b) => b.bookingType === "REQUESTED"
  ).length;

  const activeFiltersCount =
    (dateFrom || dateTo ? 1 : 0) +
    (completedDateFrom || completedDateTo ? 1 : 0) +
    (minAmount || maxAmount ? 1 : 0);

  // Handlers
  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBookingId(null);
  };

  const handleStatCardClick = (type: string | null) => {
    setSelectedTypeFilter(selectedTypeFilter === type ? null : type);
  };

  // Apply pending filters to the actual applied filter state
  const handleApplyFilters = () => {
    setDateFrom(pendingDateFrom);
    setDateTo(pendingDateTo);
    setCompletedDateFrom(pendingCompletedDateFrom);
    setCompletedDateTo(pendingCompletedDateTo);
    setMinAmount(pendingMinAmount);
    setMaxAmount(pendingMaxAmount);
    setFilterOpen(false);
  };

  // Reset pending filters inside the modal
  const handleResetFilters = () => {
    setPendingDateFrom("");
    setPendingDateTo("");
    setPendingCompletedDateFrom("");
    setPendingCompletedDateTo("");
    setPendingMinAmount("");
    setPendingMaxAmount("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[#10B981]/20";
      case "CANCELLED":
        return "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border-[#FF6B6B]/20";
      default:
        return "bg-[#F8FAFB] text-[#64748B] border-[#E5E7EB]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "✓";
      case "CANCELLED":
        return "✗";
      default:
        return "•";
    }
  };

  // Handle tab change
  const handleTabChange = (tab: "completed" | "cancelled") => {
    setActiveTab(tab);
    setViewMode("list");
    setSelectedBookingId(null);
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

  // Detail view
  if (viewMode === "detail") {
    if (isLoadingDetail) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A7AFF]" />
        </div>
      );
    }

    if (!selectedBooking) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-[#FF6B6B] mb-4" />
          <h3 className="text-lg font-semibold text-[#1A2B4F] mb-2">
            Booking not found
          </h3>
          <button
            onClick={handleBackToList}
            className="px-4 py-2 bg-[#0A7AFF] text-white rounded-lg hover:bg-[#0865CC]"
          >
            Back to List
          </button>
        </div>
      );
    }

    const isCompleted = selectedBooking.status === "COMPLETED";

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToList}
            className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-[#64748B]" />
          </button>
          <div>
            <h2 className="text-[#1A2B4F] font-semibold">
              {selectedBooking.destination}
            </h2>
            <p className="text-sm text-[#64748B]">
              {isCompleted ? "Completed Booking" : "Cancelled Booking"}
            </p>
          </div>
        </div>

        {/* Booking Header Card */}
        <div
          className={`rounded-2xl p-8 text-white shadow-lg ${
            isCompleted
              ? "bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
              : "bg-gradient-to-br from-[#FF6B6B] to-[#FF8C8C]"
          }`}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">
                {selectedBooking.destination}
              </h1>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-4 h-4" />
                <span className="text-lg">{selectedBooking.destination}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Booking Code</p>
              <p className="text-2xl font-semibold">
                {selectedBooking.bookingCode}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Calendar className="w-5 h-5 mb-2 text-white/80" />
              <p className="text-white/80 text-xs mb-1">Travel Dates</p>
              <p className="font-medium">
                {formatDateRange(
                  selectedBooking.startDate,
                  selectedBooking.endDate
                )}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Users className="w-5 h-5 mb-2 text-white/80" />
              <p className="text-white/80 text-xs mb-1">Travelers</p>
              <p className="font-medium">
                {selectedBooking.travelers}{" "}
                {selectedBooking.travelers > 1 ? "People" : "Person"}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <CreditCard className="w-5 h-5 mb-2 text-white/80" />
              <p className="text-white/80 text-xs mb-1">Total Amount</p>
              <p className="font-medium">
                ₱{selectedBooking.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Clock className="w-5 h-5 mb-2 text-white/80" />
              <p className="text-white/80 text-xs mb-1">Booked On</p>
              <p className="font-medium">{selectedBooking.bookedDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFB] to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#1A2B4F]">
                    Customer Information
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Full Name</p>
                  <p className="text-[#1A2B4F] font-medium">
                    {selectedBooking.customer}
                  </p>
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

            {/* Status Information */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFB] to-white">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                      isCompleted
                        ? "bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
                        : "bg-gradient-to-br from-[#FF6B6B] to-[#FF8C8C]"
                    }`}
                  >
                    <span className="text-white text-lg">
                      {isCompleted ? "✓" : "✗"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#1A2B4F]">
                    Booking Status
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isCompleted
                      ? "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]"
                      : "bg-[rgba(255,107,107,0.05)] border-[rgba(255,107,107,0.2)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#64748B]">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCompleted
                          ? "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
                          : "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border border-[rgba(255,107,107,0.2)]"
                      }`}
                    >
                      {isCompleted ? "✓ Completed" : "✗ Cancelled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748B]">
                      {isCompleted ? "Completed On" : "Cancelled On"}
                    </span>
                    <span className="text-xs font-medium text-[#334155]">
                      {isCompleted
                        ? selectedBooking.completedDate
                        : selectedBooking.cancelledDate}
                    </span>
                  </div>
                </div>
                {!isCompleted && selectedBooking.cancellationReason && (
                  <div className="p-4 rounded-xl border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.05)]">
                    <p className="text-xs text-[#64748B] mb-2">
                      Cancellation Reason
                    </p>
                    <p className="text-sm text-[#334155] leading-relaxed">
                      {selectedBooking.cancellationReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const bookingData = {
                      id: selectedBooking.id,
                      customer: selectedBooking.customer,
                      email: selectedBooking.email,
                      mobile: selectedBooking.mobile,
                      destination: selectedBooking.destination,
                      dates: formatDateRange(
                        selectedBooking.startDate,
                        selectedBooking.endDate
                      ),
                      travelers: selectedBooking.travelers,
                      total: `₱${selectedBooking.totalAmount.toLocaleString()}`,
                      bookedDate: selectedBooking.bookedDate,
                      status: selectedBooking.status,
                    };
                    exportBookingDetailToPDF(
                      bookingData,
                      selectedBooking.itineraryDetails
                    );
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
                      dates: formatDateRange(
                        selectedBooking.startDate,
                        selectedBooking.endDate
                      ),
                      travelers: selectedBooking.travelers,
                      total: `₱${selectedBooking.totalAmount.toLocaleString()}`,
                      bookedDate: selectedBooking.bookedDate,
                      status: selectedBooking.status,
                    };
                    exportBookingDetailToExcel(
                      bookingData,
                      selectedBooking.itineraryDetails
                    );
                    toast.success("Exporting booking as Excel...");
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.05)] flex items-center justify-center gap-2 text-sm text-[#334155] hover:text-[#10B981] font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>

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
            {selectedBooking.itineraryDetails &&
            selectedBooking.itineraryDetails.length > 0 ? (
              <ItineraryDetailDisplay
                itinerary={selectedBooking.itineraryDetails}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
                <MapPin className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1A2B4F] mb-2">
                  No Itinerary Available
                </h3>
                <p className="text-sm text-[#64748B]">
                  The itinerary details for this booking are not yet available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
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
      {/* Booking Type Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div
          onClick={() => handleStatCardClick(null)}
          className="cursor-pointer"
        >
          <StatCard
            icon={BookOpen}
            label={
              activeTab === "completed"
                ? "Completed Bookings"
                : "Cancelled Bookings"
            }
            value={filteredBookings.length}
            gradientFrom={activeTab === "completed" ? "#10B981" : "#FF6B6B"}
            gradientTo={activeTab === "completed" ? "#14B8A6" : "#FF8C8C"}
            selected={selectedTypeFilter === null}
          />
        </div>
        <div
          onClick={() => handleStatCardClick("CUSTOMIZED")}
          className="cursor-pointer"
        >
          <StatCard
            icon={Briefcase}
            label="Customized"
            value={customizedCount}
            gradientFrom="#0A7AFF"
            gradientTo="#3B9EFF"
            selected={selectedTypeFilter === "CUSTOMIZED"}
          />
        </div>
        <div
          onClick={() => handleStatCardClick("STANDARD")}
          className="cursor-pointer"
        >
          <StatCard
            icon={FileCheck}
            label="Standard"
            value={standardCount}
            gradientFrom="#10B981"
            gradientTo="#14B8A6"
            selected={selectedTypeFilter === "STANDARD"}
          />
        </div>
        <div
          onClick={() => handleStatCardClick("REQUESTED")}
          className="cursor-pointer"
        >
          <StatCard
            icon={ClipboardList}
            label="Requested"
            value={requestedCount}
            gradientFrom="#FFB84D"
            gradientTo="#FF9800"
            selected={selectedTypeFilter === "REQUESTED"}
          />
        </div>
      </div>

      <ContentCard
        title={`${
          activeTab === "completed" ? "Completed" : "Cancelled"
        } Bookings (${totalItems})`}
        footer={
          totalItems > 0 ? (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setQueryParams({ ...queryParams, page })}
              showingStart={indexOfFirstBooking}
              showingEnd={indexOfLastBooking}
            />
          ) : undefined
        }
      >
        <SearchFilterToolbar
          searchPlaceholder="Search by booking ID, customer, or destination..."
          searchValue={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
          }}
          sortOrder={sortOrder}
          onSortChange={(order) => {
            setSortOrder(order);
          }}
          filterOpen={filterOpen}
          onFilterOpenChange={handleFilterOpenChange}
          activeFiltersCount={activeFiltersCount}
          filterContent={
            <HistoryFilterContent
              dateFrom={pendingDateFrom}
              onDateFromChange={setPendingDateFrom}
              dateTo={pendingDateTo}
              onDateToChange={setPendingDateTo}
              completedDateFrom={pendingCompletedDateFrom}
              onCompletedDateFromChange={setPendingCompletedDateFrom}
              completedDateTo={pendingCompletedDateTo}
              onCompletedDateToChange={setPendingCompletedDateTo}
              minAmount={pendingMinAmount}
              onMinAmountChange={setPendingMinAmount}
              maxAmount={pendingMaxAmount}
              onMaxAmountChange={setPendingMaxAmount}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          }
          onExportPDF={() => {
            const exportData = filteredBookings.map((booking) => ({
              id: booking.id,
              customer: booking.customer,
              email: booking.email,
              mobile: booking.mobile,
              destination: booking.destination,
              startdate: new Date(booking.startDate).toLocaleDateString(),
              enddate: new Date(booking.endDate).toLocaleDateString(),
              travelers: `${booking.travelers} pax`,
              totalamount: `₱${booking.totalAmount.toLocaleString()}`,
              bookingtype: booking.bookingType || "N/A",
              status: booking.status,
              completeddate:
                booking.completedDate || booking.cancelledDate || "N/A",
            }));
            const titleSuffix =
              activeTab === "completed"
                ? "Completed Bookings"
                : "Cancelled Bookings";
            exportToPDF(exportData, `History - ${titleSuffix}`, [
              "ID",
              "Customer",
              "Email",
              "Mobile",
              "Destination",
              "Start Date",
              "End Date",
              "Travelers",
              "Total Amount",
              "Booking Type",
              "Status",
              "Completed Date",
            ]);
            toast.success(`Exporting ${activeTab} bookings as PDF...`);
          }}
          onExportExcel={() => {
            const exportData = filteredBookings.map((booking) => ({
              id: booking.id,
              customer: booking.customer,
              email: booking.email,
              mobile: booking.mobile,
              destination: booking.destination,
              startdate: new Date(booking.startDate).toLocaleDateString(),
              enddate: new Date(booking.endDate).toLocaleDateString(),
              travelers: `${booking.travelers} pax`,
              totalamount: `₱${booking.totalAmount.toLocaleString()}`,
              bookingtype: booking.bookingType || "N/A",
              status: booking.status,
              completeddate:
                booking.completedDate || booking.cancelledDate || "N/A",
            }));
            const titleSuffix =
              activeTab === "completed"
                ? "Completed Bookings"
                : "Cancelled Bookings";
            exportToExcel(exportData, `History - ${titleSuffix}`, [
              "ID",
              "Customer",
              "Email",
              "Mobile",
              "Destination",
              "Start Date",
              "End Date",
              "Travelers",
              "Total Amount",
              "Booking Type",
              "Status",
              "Completed Date",
            ]);
            toast.success(`Exporting ${activeTab} bookings as Excel...`);
          }}
        />

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#64748B]">
                No {activeTab} bookings to display
              </p>
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
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        booking.status === "COMPLETED"
                          ? "bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
                          : "bg-gradient-to-br from-[#FF6B6B] to-[#FF8C8C]"
                      }`}
                    >
                      <span className="text-white text-lg">
                        {booking.status === "COMPLETED" ? "✓" : "✗"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg text-[#1A2B4F] font-semibold">
                          {booking.bookingCode}
                        </h3>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}{" "}
                          {booking.status === "COMPLETED"
                            ? "Completed"
                            : "Cancelled"}
                        </span>
                        {booking.bookingType && (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                              booking.bookingType === "CUSTOMIZED"
                                ? "bg-[rgba(255,127,110,0.1)] text-[#FF7F6E] border-[rgba(255,127,110,0.2)]"
                                : booking.bookingType === "STANDARD"
                                ? "bg-[rgba(139,125,107,0.1)] text-[#8B7D6B] border-[rgba(139,125,107,0.2)]"
                                : "bg-[rgba(236,72,153,0.1)] text-[#EC4899] border-[rgba(236,72,153,0.2)]"
                            }`}
                          >
                            {capitalize(booking.bookingType)}
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
                    View Details
                  </button>
                </div>

                {/* Customer Info */}
                <div className="mb-4 pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#64748B]" />
                    <span className="text-sm text-[#334155] font-medium">
                      {booking.customer}
                    </span>
                    <span className="text-sm text-[#64748B]">•</span>
                    <span className="text-sm text-[#64748B]">
                      {booking.email}
                    </span>
                    <span className="text-sm text-[#64748B]">•</span>
                    <span className="text-sm text-[#64748B]">
                      {booking.mobile}
                    </span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-5 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0A7AFF]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Destination</p>
                      <p className="text-sm text-[#334155] font-medium">
                        {booking.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#14B8A6]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Travel Dates</p>
                      <p className="text-sm text-[#334155] font-medium">
                        {formatDateRange(booking.startDate, booking.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#64748B]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Travelers</p>
                      <p className="text-sm text-[#334155] font-medium">
                        {booking.travelers}{" "}
                        {booking.travelers > 1 ? "People" : "Person"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#10B981] text-lg">₱</span>
                    <div>
                      <p className="text-xs text-[#64748B]">Total Amount</p>
                      <p className="text-sm text-[#334155] font-medium">
                        ₱{booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#64748B]" />
                    <div>
                      <p className="text-xs text-[#64748B]">
                        {booking.status === "COMPLETED"
                          ? "Completed On"
                          : "Cancelled On"}
                      </p>
                      <p className="text-sm text-[#334155] font-medium">
                        {booking.status === "COMPLETED"
                          ? booking.completedDate
                          : booking.cancelledDate}
                      </p>
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
