import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  ChevronLeft,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";

import { ItineraryDetailDisplay } from "../../components/ItineraryDetailDisplay";
import {
  exportBookingDetailToPDF,
  exportBookingDetailToExcel,
} from "../../utils/exportUtils";
import { toast } from "sonner";
import { useMemo } from "react";
import { FAQAssistant } from "../../components/FAQAssistant";
import { useBookingDetail } from "../../hooks/useBookings";
import { useProfile } from "../../hooks/useAuth";
import { UserPaymentSection } from "./UserPaymentSection";

export function UserBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // API Hooks
  const {
    data: bookingResponse,
    isLoading: bookingLoading,
    error: bookingError,
  } = useBookingDetail(id!);
  const { data: profileResponse } = useProfile();

  // Extract data from API response
  const booking = bookingResponse?.data;
  const user = profileResponse?.data?.user;

  // Calculate payment totals - will be handled by UserPaymentSection
  const totalAmount = booking ? parseFloat(booking.totalPrice.toString()) : 0;

  const handleBack = () => {
    navigate("/user/bookings");
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format date range
  const formatDateRange = () => {
    if (!booking || !booking.startDate || !booking.endDate) return "";
    return `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`;
  };

  // Get customer name with fallback
  const getCustomerName = () => {
    if (booking?.customerName) return booking.customerName;
    if (user) return `${user.firstName} ${user.lastName}`;
    return "Unknown Customer";
  };

  // Get customer email with fallback
  const getCustomerEmail = () => {
    if (booking?.customerEmail) return booking.customerEmail;
    if (user?.email) return user.email;
    return "Not provided";
  };

  // Get customer mobile with fallback
  const getCustomerMobile = () => {
    if (booking?.customerMobile) return booking.customerMobile;
    if (user?.mobile) return user.mobile;
    return "Not provided";
  };

  // Loading state
  if (bookingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0A7AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (bookingError || !booking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl text-card-foreground mb-2">
            Booking Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The booking you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/user/bookings")}
            className="px-6 py-2.5 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white hover:shadow-lg transition-all"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] dark:bg-gray-800 dark:border-gray-700 dark:hover:border-[#0A7AFF] dark:hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
        </button>
        <div>
          <h2 className="text-[#1A2B4F] dark:text-white font-semibold">
            {booking.destination}
          </h2>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Booking Details
          </p>
        </div>
      </div>

      {/* Booking Header Card */}
      <div className="bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold">{booking.destination}</h1>
              {/* Booking Status Badge */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === "CONFIRMED"
                    ? "bg-[#10B981] text-white"
                    : booking.status === "PENDING"
                    ? "bg-[#F59E0B] text-white"
                    : booking.status === "COMPLETED"
                    ? "bg-[#10B981] text-white"
                    : "bg-[#EF4444] text-white"
                }`}
              >
                {booking.status}
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-lg">{booking.destination}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Booking Code</p>
            <p className="text-2xl font-semibold">{booking.bookingCode}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <CalendarIcon className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Travel Dates</p>
            <p className="font-medium">{formatDateRange()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Users className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Travelers</p>
            <p className="font-medium">
              {booking.travelers} {booking.travelers > 1 ? "People" : "Person"}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <CreditCard className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Total Amount</p>
            <p className="font-medium">₱{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Clock className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Booked On</p>
            <p className="font-medium">{formatDate(booking.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-linear-to-br from-[#F8FAFB] to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
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
                  {getCustomerName()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0A7AFF]" />
                  <p className="text-[#334155]">{getCustomerEmail()}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Mobile Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#14B8A6]" />
                  <p className="text-[#334155]">{getCustomerMobile()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Use UserPaymentSection component */}
          <UserPaymentSection
            booking={{
              id: booking.id,
              totalAmount: totalAmount,
              totalPaid: 0, // Will be calculated by UserPaymentSection via useBookingPayments
              paymentStatus: booking.paymentStatus,
            }}
          />

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const bookingData = {
                    id: booking.id,
                    customer: getCustomerName(),
                    email: getCustomerEmail(),
                    mobile: getCustomerMobile(),
                    destination: booking.destination,
                    dates: formatDateRange(),
                    travelers: booking.travelers,
                    total: `₱${totalAmount.toLocaleString()}`,
                    bookedDate: formatDate(booking.createdAt),
                  };
                  const itineraryDays = booking.itinerary?.days || [];
                  exportBookingDetailToPDF(bookingData, itineraryDays);
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
                    id: booking.id,
                    customer: getCustomerName(),
                    email: getCustomerEmail(),
                    mobile: getCustomerMobile(),
                    destination: booking.destination,
                    dates: formatDateRange(),
                    travelers: booking.travelers,
                    total: `₱${totalAmount.toLocaleString()}`,
                    bookedDate: formatDate(booking.createdAt),
                  };
                  const itineraryDays = booking.itinerary?.days || [];
                  exportBookingDetailToExcel(bookingData, itineraryDays);
                  toast.success("Exporting booking as Excel...");
                }}
                className="h-9 px-3 rounded-lg border border-[#E5E7EB] hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.05)] flex items-center justify-center gap-2 text-sm text-[#334155] hover:text-[#10B981] font-medium transition-all"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
            <button
              onClick={handleBack}
              className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] flex items-center justify-center gap-2 text-[#334155] font-medium transition-all"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Right Column - Itinerary */}
        <div className="col-span-2">
          {booking.itinerary &&
          booking.itinerary.days &&
          booking.itinerary.days.length > 0 ? (
            <ItineraryDetailDisplay
              itineraryData={{
                id: booking.id,
                destination: booking.destination,
                duration: `${booking.itinerary.days.length} Days`,
                description: "",
                destinations: [booking.destination],
                days: booking.itinerary.days.map((day) => ({
                  day: day.dayNumber,
                  title: `Day ${day.dayNumber}`,
                  description: "",
                  activities: day.activities.map((activity) => ({
                    time: activity.time,
                    activity: activity.title,
                    location: activity.description || activity.location || "",
                  })),
                })),
                inclusions: [],
                exclusions: [],
                pricing: {
                  basePrice: totalAmount,
                  breakdown: [],
                },
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#F8FAFB] flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-[#64748B]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A2B4F] mb-2">
                  No Itinerary Available
                </h3>
                <p className="text-sm text-[#64748B]">
                  The itinerary for this booking hasn't been created yet
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <FAQAssistant />
    </div>
  );
}
