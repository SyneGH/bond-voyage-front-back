import {
  Calendar,
  MapPin,
  User,
  Users,
  Eye,
  Edit,
  RotateCcw,
  X,
  ChevronLeft,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  Package,
  Clock,
  Download,
  AlertCircle,
  Loader2,
  Wallet,
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Car,
  Briefcase,
  FileCheck,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button as ShadcnButton } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ConfirmationModal } from "../components/ConfirmationModal";
import {
  SearchFilterToolbar,
  SortOrder,
} from "../components/SearchFilterToolbar";
import { BookingFilterContent } from "../components/filters/BookingFilterContent";
import { ContentCard } from "../components/ContentCard";
import { ItineraryDetailDisplay } from "../components/ItineraryDetailDisplay";
import { StatCard } from "../components/StatCard";
import { formatDateRange } from "../App";
import { Pagination } from "../components/Pagination";
import { toast } from "sonner";
import { useBreadcrumbs } from "../components/BreadcrumbContext";
import {
  exportToPDF,
  exportToExcel,
  exportBookingDetailToPDF,
  exportBookingDetailToExcel,
} from "../utils/exportUtils";
import {
  useAdminBookings,
  useBookingDetail,
  useUpdateBookingStatus,
  useUpdateBooking,
  useCancelBooking,
} from "../hooks/useBookings";
import { useUpdatePaymentStatus } from "../hooks/usePayments";
import { queryKeys } from "../utils/lib/queryKeys";
import { capitalize } from "../utils/helpers/capitalize";
import { PaymentSection } from "../components/PaymentSection";
import { BookingDetailView } from "../components/BookingDetailView";

interface BookingsProps {
  onMoveToApprovals: (booking: any) => void;
  onMoveToRequested: (booking: any) => void;
  onMoveToHistory: (
    booking: any,
    status: "completed" | "cancelled",
    cancellationReason?: string
  ) => void;
  onBookingsCountChange?: (count: number) => void;
}

export function Bookings({
  onMoveToApprovals,
  onMoveToRequested,
  onMoveToHistory,
  onBookingsCountChange,
}: BookingsProps) {
  const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbs();

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
  });

  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
  } = useAdminBookings(queryParams);

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  const { data: bookingDetailData, isLoading: isLoadingDetail } =
    useBookingDetail(selectedBookingId || "", {
      enabled: !!selectedBookingId && viewMode === "detail",
      queryKey: [queryKeys.bookings.detail],
    });

  const [filterOpen, setFilterOpen] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [travelDateFrom, setTravelDateFrom] = useState("");
  const [travelDateTo, setTravelDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [pendingDateFrom, setPendingDateFrom] = useState("");
  const [pendingDateTo, setPendingDateTo] = useState("");
  const [pendingTravelDateFrom, setPendingTravelDateFrom] = useState("");
  const [pendingTravelDateTo, setPendingTravelDateTo] = useState("");
  const [pendingMinAmount, setPendingMinAmount] = useState("");
  const [pendingMaxAmount, setPendingMaxAmount] = useState("");

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(
    null
  );

  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setPendingDateFrom(dateFrom);
      setPendingDateTo(dateTo);
      setPendingTravelDateFrom(travelDateFrom);
      setPendingTravelDateTo(travelDateTo);
      setPendingMinAmount(minAmount);
      setPendingMaxAmount(maxAmount);
    }

    setFilterOpen(open);
  };

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [moveToApprovalsDialogOpen, setMoveToApprovalsDialogOpen] =
    useState(false);
  const [moveToRequestedDialogOpen, setMoveToRequestedDialogOpen] =
    useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [bookingToComplete, setBookingToComplete] = useState<any>(null);
  const [bookingToMoveToApprovals, setBookingToMoveToApprovals] =
    useState<any>(null);
  const [bookingToMoveToRequested, setBookingToMoveToRequested] =
    useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "1",
  });

  const updateBookingStatus = useUpdateBookingStatus(selectedBookingId || "");
  const updateBooking = useUpdateBooking(selectedBookingId || "");
  const cancelBooking = useCancelBooking(selectedBookingId || "");
  const updatePaymentStatus = useUpdatePaymentStatus(selectedPayment?.id || "");

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
      paid: 0, // This will be calculated from actual payments
      totalPaid: 0, // This will be calculated from actual payments
      paymentStatus: apiBooking.paymentStatus || "PENDING", // ✅ Use actual status from API
      bookedDate: apiBooking.bookedDate || apiBooking.createdAt,
      bookedDateObj: new Date(apiBooking.bookedDate || apiBooking.createdAt),
      status: apiBooking.status,
      bookingType: apiBooking.type,
      tourType:
        apiBooking.tourType || apiBooking.itinerary?.tourType || "PRIVATE",
      rejectionReason: apiBooking.rejectionReason,
      rejectionResolution: apiBooking.rejectionResolution,
      resolutionStatus: apiBooking.isResolved ? "resolved" : "unresolved",
      paymentHistory: [],
      bookingSource: apiBooking.type,
      itineraryDetails: [],
    };
  };

  const bookings = bookingsData?.data?.map(transformBooking) || [];
  const selectedBooking = useMemo(() => {
    return bookingDetailData?.data
      ? transformBooking(bookingDetailData.data)
      : null;
  }, [bookingDetailData?.data]);

  // Update breadcrumbs
  useEffect(() => {
    if (viewMode === "detail" && selectedBooking) {
      setBreadcrumbs([
        { label: "Home", path: "/" },
        { label: "Bookings", path: "/bookings" },
        { label: `Booking ${selectedBooking.bookingCode}` },
      ]);
    } else {
      resetBreadcrumbs();
    }
  }, [viewMode, selectedBooking?.id, setBreadcrumbs, resetBreadcrumbs]);

  useEffect(() => {
    if (onBookingsCountChange && bookingsData?.meta?.total) {
      onBookingsCountChange(bookingsData.meta.total);
    }
  }, [bookingsData?.meta?.total, onBookingsCountChange]);

  useEffect(() => {
    const params: any = {
      page: 1,
      limit: 10,
    };

    if (searchQuery) {
      params.q = searchQuery;
    }

    if (selectedTypeFilter) {
      params.type = selectedTypeFilter;
    }

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
  }, [searchQuery, selectedTypeFilter, dateFrom, dateTo, sortOrder]);

  const getFilteredBookings = () => {
    let filtered = bookings;

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (b) => b.paymentStatus?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (travelDateFrom || travelDateTo) {
      filtered = filtered.filter((b) => {
        const travelDate = new Date(b.startDate);
        if (travelDateFrom && travelDateTo) {
          return (
            travelDate >= new Date(travelDateFrom) &&
            travelDate <= new Date(travelDateTo)
          );
        } else if (travelDateFrom) {
          return travelDate >= new Date(travelDateFrom);
        } else if (travelDateTo) {
          return travelDate <= new Date(travelDateTo);
        }
        return true;
      });
    }

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

  const totalItems = bookingsData?.meta?.total || 0;
  const totalPages = bookingsData?.meta?.totalPages || 1;
  const currentPage = bookingsData?.meta?.page || 1;
  const itemsPerPage = bookingsData?.meta?.limit || 10;

  const indexOfFirstBooking = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastBooking = Math.min(currentPage * itemsPerPage, totalItems);

  const currentBookings = filteredBookings;

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
    (travelDateFrom || travelDateTo ? 1 : 0) +
    (minAmount || maxAmount ? 1 : 0);

  const getPendingPaymentsCount = (booking: any) => {
    if (!booking.paymentHistory) return 0;
    return booking.paymentHistory.filter((p: any) => p.status === "pending")
      .length;
  };

  const calculatePaymentProgress = (booking: any) => {
    const totalAmount = booking.totalAmount;
    const paidAmount = booking.totalPaid || 0;
    const balance = totalAmount - paidAmount;
    const progressPercent = Math.round((paidAmount / totalAmount) * 100);

    return { totalAmount, paidAmount, balance, progressPercent };
  };

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBookingId(null);
  };

  const handleEditBooking = (booking: any) => {
    setBookingToEdit(booking);
    setEditFormData({
      destination: booking.destination,
      startDate: booking.startDate,
      endDate: booking.endDate,
      travelers: booking.travelers.toString(),
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!bookingToEdit) return;

    try {
      await updateBooking.mutateAsync({
        destination: editFormData.destination,
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        travelers: parseInt(editFormData.travelers),
      });

      toast.success("Booking updated successfully!");
      setEditModalOpen(false);
      setBookingToEdit(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update booking");
    }
  };

  const handleCompleteClick = (booking: any) => {
    setBookingToComplete(booking);
    setCompleteDialogOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (!bookingToComplete) return;

    try {
      setSelectedBookingId(bookingToComplete.id);
      await updateBookingStatus.mutateAsync({
        status: "COMPLETED",
      });

      onMoveToHistory(bookingToComplete, "completed");
      toast.success("Booking marked as completed!");
      setCompleteDialogOpen(false);
      setBookingToComplete(null);
      refetch();

      if (viewMode === "detail") {
        handleBackToList();
      }
    } catch (error) {
      toast.error("Failed to complete booking");
    }
  };

  const handleCancelClick = (booking: any) => {
    setBookingToCancel(booking);
    setCancellationReason("");
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      setSelectedBookingId(bookingToCancel.id);
      await updateBookingStatus.mutateAsync({
        status: "CANCELLED",
      });

      onMoveToHistory(bookingToCancel, "cancelled", cancellationReason);
      toast.success("Booking cancelled successfully!");
      setCancelDialogOpen(false);
      setBookingToCancel(null);
      setCancellationReason("");
      refetch();

      if (viewMode === "detail") {
        handleBackToList();
      }
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  const handleMoveToApprovalsClick = (booking: any) => {
    setBookingToMoveToApprovals(booking);
    setMoveToApprovalsDialogOpen(true);
  };

  const handleConfirmMoveToApprovals = async () => {
    if (!bookingToMoveToApprovals) return;

    try {
      setSelectedBookingId(bookingToMoveToApprovals.id);
      await updateBookingStatus.mutateAsync({
        status: "PENDING",
      });

      onMoveToApprovals(bookingToMoveToApprovals);
      toast.success("Booking moved to approvals!");
      setMoveToApprovalsDialogOpen(false);
      setBookingToMoveToApprovals(null);
      refetch();

      if (viewMode === "detail") {
        handleBackToList();
      }
    } catch (error) {
      toast.error("Failed to move booking");
    }
  };

  const handleMoveToRequestedClick = (booking: any) => {
    setBookingToMoveToRequested(booking);
    setMoveToRequestedDialogOpen(true);
  };

  const handleConfirmMoveToRequested = async () => {
    if (!bookingToMoveToRequested) return;

    onMoveToRequested(bookingToMoveToRequested);
    toast.success("Booking moved to requested!");
    setMoveToRequestedDialogOpen(false);
    setBookingToMoveToRequested(null);
    refetch();

    if (viewMode === "detail") {
      handleBackToList();
    }
  };

  // Payment handlers
  const handlePaymentItemClick = (payment: any) => {
    setSelectedPayment(payment);
    setPaymentDetailModalOpen(true);
  };

  const handleVerifyPayment = async (payment: any) => {
    try {
      await updatePaymentStatus.mutateAsync({
        status: "VERIFIED",
      });

      toast.success("Payment verified successfully!");
      setPaymentDetailModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to verify payment");
    }
  };

  const handleRejectPayment = async (payment: any) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await updatePaymentStatus.mutateAsync({
        status: "REJECTED",
        rejectionReason: rejectionReason,
      });

      toast.success("Payment rejected successfully!");
      setVerificationModalOpen(false);
      setPaymentDetailModalOpen(false);
      setRejectionReason("");
      refetch();
    } catch (error) {
      toast.error("Failed to reject payment");
    }
  };

  const handleOpenVerificationModal = (payment: any) => {
    setSelectedPayment(payment);
    setVerificationModalOpen(true);
  };

  const handleFilterChange = () => {
    // Filters are now handled by the useEffect that updates queryParams
    // This is kept for compatibility but doesn't need to do anything
  };

  // Apply pending filters to the actual applied filter state
  const handleApplyFilters = () => {
    setDateFrom(pendingDateFrom);
    setDateTo(pendingDateTo);
    setTravelDateFrom(pendingTravelDateFrom);
    setTravelDateTo(pendingTravelDateTo);
    setMinAmount(pendingMinAmount);
    setMaxAmount(pendingMaxAmount);

    setFilterOpen(false);
    // The useEffect will automatically update the API query when applied filters change
  };

  // Reset pending filters inside the modal (does not affect applied filters until Apply is pressed)
  const handleResetFilters = () => {
    setPendingDateFrom("");
    setPendingDateTo("");
    setPendingTravelDateFrom("");
    setPendingTravelDateTo("");
    setPendingMinAmount("");
    setPendingMaxAmount("");
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
          Failed to load bookings
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

    return (
      <BookingDetailView
        booking={{
          id: selectedBooking.id,
          bookingCode: selectedBooking.bookingCode,
          customer: selectedBooking.customer,
          email: selectedBooking.email,
          mobile: selectedBooking.mobile,
          destination: selectedBooking.destination,
          itinerary: selectedBooking.itinerary || selectedBooking.destination,
          dates: formatDateRange(
            selectedBooking.startDate,
            selectedBooking.endDate
          ),
          travelers: selectedBooking.travelers,
          total: `₱${selectedBooking.totalAmount.toLocaleString()}`,
          totalAmount: selectedBooking.totalAmount, // ✅ ADD THIS LINE
          paid: selectedBooking.paid || selectedBooking.totalPaid || 0, // ✅ ADD THIS LINE
          paymentStatus: selectedBooking.paymentStatus, // ✅ This is already correct
          bookedDate: selectedBooking.bookedDate,
          tripStatus: selectedBooking.status,
          rejectionReason: selectedBooking.rejectionReason || "",
          rejectionResolution: selectedBooking.rejectionResolution || "",
          resolutionStatus: selectedBooking.resolutionStatus || "unresolved",
        }}
        itinerary={bookingDetailData?.data?.itinerary}
        onBack={handleBackToList}
        onSendToClient={() => {
          toast.info("This booking is already confirmed");
        }}
        onCancelBooking={() => handleCancelClick(selectedBooking)}
        onUpdateStatus={(status: any, reason: any, resolution: any) => {
          // Handle status update if needed
          toast.info("Status update functionality coming soon");
        }}
        actionButtons={
          <div className="space-y-3">
            {/* Export Buttons */}
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

            {/* Edit/Move Buttons */}
            {selectedBooking.bookingType === "STANDARD" ? (
              <button
                onClick={() => handleEditBooking(selectedBooking)}
                className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </button>
            ) : selectedBooking.bookingType === "REQUESTED" ? (
              <button
                onClick={() => handleMoveToRequestedClick(selectedBooking)}
                className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                <Package className="w-4 h-4" />
                Move to Requested
              </button>
            ) : (
              <button
                onClick={() => handleMoveToApprovalsClick(selectedBooking)}
                className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Move to Approvals
              </button>
            )}

            {/* Complete Button */}
            {selectedBooking.status !== "COMPLETED" &&
              selectedBooking.paymentStatus === "Paid" && (
                <button
                  onClick={() => handleCompleteClick(selectedBooking)}
                  className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#10B981] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#10B981]/25 hover:-translate-y-0.5 hover:shadow-xl transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Complete
                </button>
              )}

            {/* Cancel Button */}
            <button
              onClick={() => handleCancelClick(selectedBooking)}
              className="w-full h-11 px-4 rounded-xl border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white flex items-center justify-center gap-2 font-medium transition-all"
            >
              <X className="w-4 h-4" />
              Cancel Booking
            </button>
          </div>
        }
        breadcrumbPage="Bookings"
        isRequestedItinerary={false}
      />
    );
  }

  // List view
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
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
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
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
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
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
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
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          Unpaid
        </button>
      </div>

      {/* Booking Type Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div
          onClick={() =>
            setSelectedTypeFilter(selectedTypeFilter === null ? null : null)
          }
          className="cursor-pointer"
        >
          <StatCard
            icon={BookOpen}
            label="Active Bookings"
            value={filteredBookings.length}
            gradientFrom="#8B5CF6"
            gradientTo="#A78BFA"
            selected={selectedTypeFilter === null}
          />
        </div>
        <div
          onClick={() =>
            setSelectedTypeFilter(
              selectedTypeFilter === "CUSTOMIZED" ? null : "CUSTOMIZED"
            )
          }
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
          onClick={() =>
            setSelectedTypeFilter(
              selectedTypeFilter === "STANDARD" ? null : "STANDARD"
            )
          }
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
          onClick={() =>
            setSelectedTypeFilter(
              selectedTypeFilter === "REQUESTED" ? null : "REQUESTED"
            )
          }
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
        title={`Confirmed Bookings (${totalItems})`}
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
          searchPlaceholder="Search by booking ID, customer name, or destination..."
          searchValue={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            // The useEffect will trigger API call with search query
          }}
          sortOrder={sortOrder}
          onSortChange={(order) => {
            setSortOrder(order);
          }}
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          activeFiltersCount={activeFiltersCount}
          filterContent={
            <BookingFilterContent
              dateFrom={pendingDateFrom}
              onDateFromChange={setPendingDateFrom}
              dateTo={pendingDateTo}
              onDateToChange={setPendingDateTo}
              travelDateFrom={pendingTravelDateFrom}
              onTravelDateFromChange={setPendingTravelDateFrom}
              travelDateTo={pendingTravelDateTo}
              onTravelDateToChange={setPendingTravelDateTo}
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
              paymentstatus: booking.paymentStatus,
              bookingtype: booking.bookingType || "N/A",
              status: booking.status,
            }));
            exportToPDF(exportData, "Bookings Report", [
              "ID",
              "Customer",
              "Email",
              "Mobile",
              "Destination",
              "Start Date",
              "End Date",
              "Travelers",
              "Total Amount",
              "Payment Status",
              "Booking Type",
              "Status",
            ]);
            toast.success("Exporting bookings as PDF...");
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
              paymentstatus: booking.paymentStatus,
              bookingtype: booking.bookingType || "N/A",
              status: booking.status,
            }));
            exportToExcel(exportData, "Bookings Report", [
              "ID",
              "Customer",
              "Email",
              "Mobile",
              "Destination",
              "Start Date",
              "End Date",
              "Travelers",
              "Total Amount",
              "Payment Status",
              "Booking Type",
              "Status",
            ]);
            toast.success("Exporting bookings as Excel...");
          }}
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
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                      <span className="text-white text-lg">🎫</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg text-[#1A2B4F] font-semibold">
                          {booking.bookingCode}
                        </h3>
                        {booking.paymentStatus && (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus}
                          </span>
                        )}
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
                        {booking.tourType && (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                              booking.tourType === "JOINER"
                                ? "bg-[rgba(255,152,0,0.1)] text-[#FF9800] border-[rgba(255,152,0,0.2)]"
                                : "bg-[rgba(167,139,250,0.1)] text-[#A78BFA] border-[rgba(167,139,250,0.2)]"
                            }`}
                          >
                            {capitalize(booking.tourType)}
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
                <div className="grid grid-cols-5 gap-4 mb-5">
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
                      <p className="text-xs text-[#64748B]">Paid / Total</p>
                      <p className="text-sm text-[#334155] font-medium">
                        ₱{booking.paid.toLocaleString()} / ₱
                        {booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#64748B]" />
                    <div>
                      <p className="text-xs text-[#64748B]">Booked On</p>
                      <p className="text-sm text-[#334155] font-medium">
                        {booking.bookedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ContentCard>

      {/* Edit Booking Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#0A7AFF]" />
              Edit Booking
            </DialogTitle>
            <DialogDescription>
              Update the booking details for this standard itinerary.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={editFormData.destination}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    destination: e.target.value,
                  })
                }
                placeholder="Enter destination"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="travelers">Number of Travelers</Label>
              <Input
                id="travelers"
                type="number"
                min="1"
                value={editFormData.travelers}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    travelers: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <ShadcnButton
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setBookingToEdit(null);
              }}
            >
              Cancel
            </ShadcnButton>
            <ShadcnButton onClick={handleSaveEdit}>Save Changes</ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Modal */}
      <ConfirmationModal
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Booking"
        description="Confirm that you want to cancel this booking."
        icon={<X className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
        iconShadow="shadow-[#FF6B6B]/20"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(255,107,107,0.12)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          bookingToCancel && (
            <>
              <p className="text-sm text-[#334155] mb-4">
                Are you sure you want to cancel the booking for{" "}
                <span className="font-semibold text-[#FF6B6B]">
                  {bookingToCancel.customer}
                </span>
                ?
              </p>
              <div>
                <Label htmlFor="cancellation-reason">
                  Reason for Cancellation
                </Label>
                <Textarea
                  id="cancellation-reason"
                  placeholder="Enter reason..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
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

      {/* Complete Booking Modal */}
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
            <p className="text-sm text-[#334155]">
              Are you sure you want to mark the trip for{" "}
              <span className="font-semibold text-[#10B981]">
                {bookingToComplete.customer}
              </span>{" "}
              as completed?
            </p>
          )
        }
        onConfirm={handleConfirmComplete}
        onCancel={() => setCompleteDialogOpen(false)}
        confirmText="Mark as Complete"
        cancelText="Cancel"
        confirmVariant="success"
      />

      {/* Move to Approvals Modal */}
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
            <p className="text-sm text-[#334155]">
              Move booking for{" "}
              <span className="font-semibold text-[#0A7AFF]">
                {bookingToMoveToApprovals.customer}
              </span>{" "}
              to Approvals for re-review?
            </p>
          )
        }
        onConfirm={handleConfirmMoveToApprovals}
        onCancel={() => setMoveToApprovalsDialogOpen(false)}
        confirmText="Move to Approvals"
        cancelText="Cancel"
        confirmVariant="default"
      />

      {/* Move to Requested Modal */}
      <Dialog
        open={moveToRequestedDialogOpen}
        onOpenChange={setMoveToRequestedDialogOpen}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              Move to Requested
            </DialogTitle>
            <DialogDescription>
              This booking will be moved to the Requested tab.
            </DialogDescription>
          </DialogHeader>

          {bookingToMoveToRequested && (
            <div className="py-4">
              <p className="text-sm text-[#334155]">
                Move booking for{" "}
                <span className="font-semibold text-[#0A7AFF]">
                  {bookingToMoveToRequested.customer}
                </span>{" "}
                to Requested Itinerary tab?
              </p>
            </div>
          )}

          <DialogFooter>
            <ShadcnButton
              variant="outline"
              onClick={() => setMoveToRequestedDialogOpen(false)}
            >
              Cancel
            </ShadcnButton>
            <ShadcnButton onClick={handleConfirmMoveToRequested}>
              <Package className="w-4 h-4 mr-2" />
              Move to Requested
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Detail Modal */}
      <Dialog
        open={paymentDetailModalOpen}
        onOpenChange={setPaymentDetailModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0A7AFF]" />
              Payment Details
            </DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] rounded-xl p-4 text-white">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedPayment.paymentType}
                    </h3>
                    <p className="text-sm text-white/80">
                      {new Date(
                        selectedPayment.submittedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Amount</p>
                    <p className="text-2xl font-bold">
                      ₱{selectedPayment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPayment.proofOfPayment && (
                <div>
                  <Label>Proof of Payment</Label>
                  <img
                    src={selectedPayment.proofOfPayment}
                    alt="Proof of payment"
                    className="w-full rounded-lg border"
                  />
                </div>
              )}

              {selectedPayment.status === "pending" && (
                <div className="flex gap-3">
                  <ShadcnButton
                    onClick={() => handleVerifyPayment(selectedPayment)}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Verify Payment
                  </ShadcnButton>
                  <ShadcnButton
                    variant="destructive"
                    onClick={() => handleOpenVerificationModal(selectedPayment)}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Payment
                  </ShadcnButton>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Rejection Modal */}
      <Dialog
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#FF6B6B]" />
              Reject Payment
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <ShadcnButton
              variant="outline"
              onClick={() => {
                setVerificationModalOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </ShadcnButton>
            <ShadcnButton
              variant="destructive"
              onClick={() =>
                selectedPayment && handleRejectPayment(selectedPayment)
              }
              disabled={!rejectionReason.trim()}
            >
              <X className="w-4 h-4 mr-2" />
              Reject Payment
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
