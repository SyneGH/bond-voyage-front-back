import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Clock,
  Phone,
  Mail,
  User,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ItineraryDetailDisplay } from "./ItineraryDetailDisplay";
import { Itinerary } from "../types/types";
import { PaymentSection } from "./PaymentSection";

type ItineraryDay = {
  dayNumber: number;
  title: string;
  activities: {
    time: string;
    icon: any;
    title: string;
    description: string;
    location?: string;
  }[];
};

interface BookingDetailViewProps {
  booking: {
    id: string;
    bookingCode: string;
    customer: string;
    email: string;
    mobile: string;
    destination: string;
    itinerary?: string;
    dates: string;
    travelers: number;
    total?: string;
    totalAmount?: number;
    paid?: number;
    paymentStatus?: string;
    bookedDate: string;
    urgent?: boolean;
    tripStatus?: string;
    rejectionReason?: string;
    rejectionResolution?: string;
    resolutionStatus?: string;
  };
  itinerary: Itinerary;
  onBack: () => void;
  actionButtons?: React.ReactNode;
  breadcrumbPage?: string;
  headerVariant?: "default" | "approval" | "completed" | "cancelled";
  showPaymentDetails?: boolean;
  onPaymentStatusChange?: (bookingId: string, newStatus: string) => void;
  onPaidAmountChange?: (bookingId: string, newAmount: number) => void;
  isRequestedItinerary?: boolean;
  useBackButtonHeader?: boolean;
  backButtonSubtitle?: string;
  useBreadcrumbs?: boolean;
}

export function BookingDetailView({
  booking,
  itinerary,
  onBack,
  actionButtons,
  breadcrumbPage = "",
  headerVariant = "default",
  showPaymentDetails = false,
  onPaymentStatusChange,
  onPaidAmountChange,
  isRequestedItinerary = false,
  useBackButtonHeader = false,
  backButtonSubtitle = "",
  useBreadcrumbs = false,
}: BookingDetailViewProps) {
  const getHeaderGradient = () => {
    switch (headerVariant) {
      case "approval":
        return "bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]";
      case "completed":
        return "bg-gradient-to-br from-[#10B981] to-[#14B8A6]";
      case "cancelled":
        return "bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]";
      default:
        return "bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]";
    }
  };

  const totalDisplay =
    booking.total ||
    (booking.totalAmount ? `₱${booking.totalAmount.toLocaleString()}` : "N/A");

  return (
    <div className="space-y-6">
      {/* Conditional Header - Different styles based on view type */}
      {useBreadcrumbs ? (
        /* Breadcrumb Navigation for specific views that need it */
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={onBack}
            className="text-[#0A7AFF] hover:text-[#0865CC] font-medium transition-colors"
          >
            {breadcrumbPage}
          </button>
          <ChevronRight className="w-4 h-4 text-[#64748B]" />
          <span className="text-[#334155] font-medium">{booking.id}</span>
        </div>
      ) : (
        /* Header with back button - Default for most views */
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-[#64748B]" />
          </button>
          <div>
            <h2 className="text-[#1A2B4F] font-semibold">
              {booking.itinerary || booking.destination}
            </h2>
            <p className="text-sm text-[#64748B]">
              {backButtonSubtitle ||
                (isRequestedItinerary
                  ? "Requested Itinerary"
                  : "Booking Details")}
            </p>
          </div>
        </div>
      )}

      {/* Booking Header Card */}
      <div
        className={`rounded-2xl p-8 text-white shadow-lg ${getHeaderGradient()}`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold">
                {booking.itinerary || booking.destination}
              </h1>
              {booking.urgent && (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium border bg-[rgba(255,107,107,0.2)] border-[rgba(255,107,107,0.3)] text-white backdrop-blur-sm">
                  🔥 Urgent
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-lg">{booking.destination}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Booking ID</p>
            <p className="text-2xl font-semibold">{booking.bookingCode}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Calendar className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Travel Dates</p>
            <p className="font-medium">{booking.dates}</p>
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
            <p className="font-medium">
              {booking.totalAmount
                ? `₱${booking.totalAmount.toLocaleString()}`
                : totalDisplay}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Clock className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">
              {isRequestedItinerary ? "Created On" : "Booked On"}
            </p>
            <p className="font-medium">{booking.bookedDate}</p>
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
                <p className="text-[#1A2B4F] font-medium">{booking.customer}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0A7AFF]" />
                  <p className="text-[#334155]">{booking.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Mobile Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#14B8A6]" />
                  <p className="text-[#334155]">{booking.mobile}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <PaymentSection booking={booking} />

          {/* Actions */}
          {actionButtons && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 space-y-3">
              {actionButtons}
            </div>
          )}
        </div>

        {/* Right Column - Itinerary */}
        <div className="col-span-2">
          <ItineraryDetailDisplay itinerary={itinerary.days} />
        </div>
      </div>

      {/* Rejection Info for Rejected Bookings */}
      {booking.rejectionReason && booking.rejectionResolution && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB] bg-linear-to-br from-[rgba(255,107,107,0.05)] to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#FF6B6B] to-[#FF5252] flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-[#FF6B6B]">
                Rejection Details
              </h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#FF6B6B] mb-1">
                Rejection Reason:
              </p>
              <p className="text-sm text-[#334155]">
                {booking.rejectionReason}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#FF6B6B] mb-1">
                Required Action:
              </p>
              <p className="text-sm text-[#334155]">
                {booking.rejectionResolution}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
