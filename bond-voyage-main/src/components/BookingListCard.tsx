import { MapPin, Calendar, Users, Clock, Eye } from "lucide-react";
import { capitalize } from "../utils/helpers/capitalize";
import { formatDateRange } from "../App";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Booking } from "../types/types";

interface BookingListCardProps {
  booking: Booking;
  onViewDetails: (bookingId: string) => void;
  context?: "approvals" | "rejected" | "active" | "cancelled";
  activeTab?: "all" | "byDate" | "rejected";
  showViewDetailsButton?: boolean;
  highlightOnClick?: boolean;
}

export function BookingListCard({
  booking,
  onViewDetails,
  context = "approvals",
  activeTab,
  showViewDetailsButton = true,
  highlightOnClick = true,
}: BookingListCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(booking.id);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(booking.id);
  };

  const getStatusBadge = () => {
    if (context === "rejected") {
      return (
        <>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] text-xs font-medium border border-[rgba(255,107,107,0.2)]">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
          {booking.resolutionStatus === "resolved" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium border border-[rgba(16,185,129,0.2)]">
              <CheckCircle className="w-3 h-3" />
              Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(255,152,0,0.1)] text-[#FF9800] text-xs font-medium border border-[rgba(255,152,0,0.2)]">
              <AlertTriangle className="w-3 h-3" />
              Unresolved
            </span>
          )}
        </>
      );
    }

    switch (booking.status?.toLowerCase()) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium border border-[rgba(16,185,129,0.2)]">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(255,152,0,0.1)] text-[#FF9800] text-xs font-medium border border-[rgba(255,152,0,0.2)]">
            <AlertTriangle className="w-3 h-3" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] text-xs font-medium border border-[rgba(255,107,107,0.2)]">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getBookingTypeBadge = () => {
    if (!booking.bookingType) return null;

    const baseClasses =
      "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border";

    switch (booking.bookingType.toUpperCase()) {
      case "CUSTOMIZED":
        return (
          <span
            className={`${baseClasses} bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] border-[rgba(139,92,246,0.2)]`}
          >
            {capitalize(booking.bookingType)}
          </span>
        );
      case "STANDARD":
        return (
          <span
            className={`${baseClasses} bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[rgba(16,185,129,0.2)]`}
          >
            {capitalize(booking.bookingType)}
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-[rgba(255,152,0,0.1)] text-[#FF9800] border-[rgba(255,152,0,0.2)]`}
          >
            {capitalize(booking.bookingType)}
          </span>
        );
    }
  };

  const getTourTypeBadge = () => {
    if (!booking.tourType) return null;

    const baseClasses =
      "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border";

    switch (booking.tourType.toUpperCase()) {
      case "JOINER":
        return (
          <span
            className={`${baseClasses} bg-[rgba(255,152,0,0.1)] text-[#FF9800] border-[rgba(255,152,0,0.2)]`}
          >
            {capitalize(booking.tourType)}
          </span>
        );
      case "PRIVATE":
      default:
        return (
          <span
            className={`${baseClasses} bg-[rgba(167,139,250,0.1)] text-[#A78BFA] border-[rgba(167,139,250,0.2)]`}
          >
            {capitalize(booking.tourType)}
          </span>
        );
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] transition-all duration-200 cursor-pointer ${
        highlightOnClick ? "hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)]" : ""
      }`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
            <span className="text-white text-lg">🎫</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg text-[#1A2B4F] font-semibold">
                Booking {booking.bookingCode}
              </h3>
              {getStatusBadge()}
              {getBookingTypeBadge()}
              {getTourTypeBadge()}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <span className="font-medium text-[#334155]">
                {booking.customer}
              </span>
              <span>•</span>
              <span>{booking.email}</span>
              {booking.mobile && booking.mobile !== "N/A" && (
                <>
                  <span>•</span>
                  <span>{booking.mobile}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {showViewDetailsButton && (
          <button
            onClick={handleButtonClick}
            className="h-9 px-4 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAFB] hover:border-[#0A7AFF] text-[#334155] flex items-center gap-2 text-sm font-medium transition-all"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        )}
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-5 gap-4 pt-4 border-t border-[#E5E7EB]">
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
              {booking.travelers} {booking.travelers > 1 ? "People" : "Person"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#10B981] text-lg font-bold">₱</span>
          <div>
            <p className="text-xs text-[#64748B]">Total Amount</p>
            <p className="text-sm text-[#334155] font-medium">
              {booking.total}
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

      {/* Additional Info for Rejected Bookings */}
      {context === "rejected" && booking.rejectionReason && (
        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6B6B] mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#FF6B6B]">
                Rejection Reason:
              </p>
              <p className="text-xs text-[#64748B]">
                {booking.rejectionReason}
              </p>
              {booking.rejectionResolution && (
                <>
                  <p className="text-xs font-semibold text-[#FF6B6B] mt-2">
                    Required Action:
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {booking.rejectionResolution}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
