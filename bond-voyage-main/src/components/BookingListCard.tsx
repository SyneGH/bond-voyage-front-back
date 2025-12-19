import { MapPin, Calendar, Users, Clock, Eye, AlertTriangle, XCircle, CheckCircle, Share2 } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

interface BookingListCardProps {
  booking: {
    id: string;
    customer: string;
    email: string;
    mobile: string;
    destination: string;
    dates: string;
    travelers: number;
    total: string;
    bookedDate: string;
    urgent?: boolean;
    rejectionReason?: string;
    rejectionResolution?: string;
    resolutionStatus?: "resolved" | "unresolved";
    statusBadges?: React.ReactNode;
    bookingType?: "Customized" | "Standard" | "Requested";
    tourType?: "Joiner" | "Private";
  };
  onViewDetails: (bookingId: string) => void;
  onShare?: (bookingId: string) => void;
  actionButtons?: React.ReactNode;
  additionalBadges?: React.ReactNode;
  statusBadge?: React.ReactNode;
  variant?: "default" | "rejected";
  onMarkAsResolved?: (bookingId: string) => void;
  onMarkAsUnresolved?: (bookingId: string) => void;
  pendingStatusMessage?: React.ReactNode;
  userSide?: boolean;
}

export function BookingListCard({ 
  booking, 
  onViewDetails, 
  onShare,
  actionButtons,
  additionalBadges,
  statusBadge,
  variant = "default",
  onMarkAsResolved,
  onMarkAsUnresolved,
  pendingStatusMessage,
  userSide = false,
}: BookingListCardProps) {
  return (
    <div 
      onClick={() => onViewDetails(booking.id)}
      className="p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)] cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            variant === "rejected" 
              ? "bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]" 
              : "bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
          }`}>
            <span className="text-white text-lg">🎫</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg text-[#1A2B4F] font-semibold">Booking #{booking.id}</h3>
              {booking.tourType && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  booking.tourType === "Joiner"
                    ? "bg-[rgba(255,152,0,0.1)] text-[#FF9800] border border-[rgba(255,152,0,0.2)]"
                    : "bg-[rgba(167,139,250,0.1)] text-[#A78BFA] border border-[rgba(167,139,250,0.2)]"
                }`}>
                  {booking.tourType}
                </span>
              )}
              {booking.urgent && variant !== "rejected" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] text-xs font-medium border border-[rgba(255,107,107,0.2)]">
                  <AlertTriangle className="w-3 h-3" />
                  Urgent
                </span>
              )}
              {booking.statusBadges}
              {additionalBadges}
              {statusBadge}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
         
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(booking.id);
            }}
            className="h-9 px-4 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAFB] hover:border-[#0A7AFF] text-[#334155] flex items-center gap-2 text-sm font-medium transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button> 
          {onShare && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onShare(booking.id);
              }}
              className="h-9 w-9 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAFB] hover:border-[#0A7AFF] text-[#334155] flex items-center justify-center transition-all cursor-pointer"
              title="Share booking"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Users className="w-4 h-4 text-[#64748B]" />
          <span className="text-sm text-[#334155] font-medium">
            {(() => {
              const names = booking.customer.split(', ').map(n => n.trim());
              if (names.length >= 4) {
                const othersCount = names.length - 2;
                const hiddenNames = names.slice(2);
                return (
                  <>
                    {names[0]}, {names[1]} and{' '}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help underline decoration-dotted">
                          {othersCount} other{othersCount > 1 ? 's' : ''}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          {hiddenNames.map((name, idx) => (
                            <div key={idx}>{name}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </>
                );
              }
              return booking.customer;
            })()}
          </span>
          {booking.email && (
            <>
              <span className="text-sm text-[#64748B]">•</span>
              <span className="text-sm text-[#64748B]">{booking.email}</span>
            </>
          )}
          {booking.mobile && (
            <>
              <span className="text-sm text-[#64748B]">•</span>
              <span className="text-sm text-[#64748B]">{booking.mobile}</span>
            </>
          )}
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
          <span className="text-[#10B981] text-lg">₱</span>
          <div>
            <p className="text-xs text-[#64748B]">Total</p>
            <p className="text-sm text-[#334155] font-medium">{booking.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#64748B]" />
          <div>
            <p className="text-xs text-[#64748B]">{booking.bookingType ? "Booked On" : "Created On"}</p>
            <p className="text-sm text-[#334155] font-medium">{booking.bookedDate}</p>
          </div>
        </div>
      </div>

      {/* Status Message for Pending - Below Trip Details */}
      {pendingStatusMessage && (
        <div className="mb-4">
          {pendingStatusMessage}
        </div>
      )}

      {/* Rejection Info for Rejected Bookings */}
      {variant === "rejected" && booking.rejectionReason && booking.rejectionResolution && (
        <div className="mb-4 p-4 rounded-xl bg-[rgba(255,107,107,0.05)] border border-[rgba(255,107,107,0.2)]">
          <div className="mb-3">
            <p className="text-xs font-semibold text-[#FF6B6B] mb-1">Rejection Reason:</p>
            <p className="text-sm text-[#334155]">{booking.rejectionReason}</p>
          </div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-[#FF6B6B] mb-1">Required Action:</p>
            <p className="text-sm text-[#334155]">{booking.rejectionResolution}</p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,107,107,0.2)]">
            <p className="text-xs font-semibold text-[#64748B]">Client Action Status:</p>
            {booking.resolutionStatus === "resolved" ? (
              userSide ? (
                <div className="px-3 py-1.5 rounded-lg bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium border border-[rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Resolved - Waiting for Admin to Review the Action/Resolution Made
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsUnresolved && onMarkAsUnresolved(booking.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)] transition-all"
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Resolved - Click to mark Unresolved
                </button>
              )
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsResolved && onMarkAsResolved(booking.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-[rgba(255,152,0,0.1)] text-[#FF9800] text-xs font-medium border border-[rgba(255,152,0,0.2)] hover:bg-[rgba(255,152,0,0.15)] transition-all"
              >
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Unresolved - Click to mark Resolved
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {actionButtons && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB]"
        >
          {actionButtons}
        </div>
      )}
    </div>
  );
}