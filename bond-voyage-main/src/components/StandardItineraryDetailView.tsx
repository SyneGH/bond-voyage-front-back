import { ArrowLeft, MapPin, Calendar, Users, Edit, Plane, Hotel, Camera, UtensilsCrossed, Car, Package } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ItineraryActivity {
  time: string;
  icon: any;
  title: string;
  description: string;
  location?: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

interface StandardItineraryDetailViewProps {
  itinerary: {
    id: number;
    title: string;
    destination: string;
    days: number;
    category: string;
    image: string;
    pricePerPax?: number;
  };
  itineraryDetails: ItineraryDay[];
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function StandardItineraryDetailView({ itinerary, itineraryDetails, onBack, onEdit, onDelete }: StandardItineraryDetailViewProps) {
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#64748B]" />
        </button>
        <div>
          <h2 className="text-[#1A2B4F] font-semibold">{itinerary.title}</h2>
          <p className="text-sm text-[#64748B]">Standard Itinerary</p>
        </div>
      </div>

      {/* Hero Image and Overview */}
      <div className="rounded-2xl border-2 border-[#E5E7EB] overflow-hidden bg-white shadow-sm">
        <div className="h-[300px] relative overflow-hidden">
          <ImageWithFallback 
            src={itinerary.image} 
            alt={itinerary.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-white text-3xl font-semibold mb-2">{itinerary.title}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{itinerary.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{itinerary.days} Days</span>
                  </div>
                  {itinerary.pricePerPax && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">₱</span>
                      <span className="text-sm">₱{itinerary.pricePerPax.toLocaleString()} per pax</span>
                    </div>
                  )}
                </div>
              </div>
              {onEdit && (
                <button 
                  onClick={onEdit}
                  className="h-10 px-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-Day Itinerary */}
      <div className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A2B4F]">Day-by-Day Itinerary</h3>
            <p className="text-sm text-[#64748B]">{itinerary.days}-day comprehensive travel plan</p>
          </div>
        </div>

        <div className="space-y-6">
          {itineraryDetails.map((day) => (
            <div key={day.day} className="border-l-4 border-[#0A7AFF] pl-6 relative">
              {/* Day Header */}
              <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/30">
                <span className="text-white text-sm font-semibold">{day.day}</span>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-[#1A2B4F]">Day {day.day}: {day.title}</h4>
              </div>

              {/* Activities */}
              <div className="space-y-3 mb-6">
                {day.activities.map((activity, idx) => {
                  const IconComponent = activity.icon;
                  return (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 rounded-xl bg-[#F8FAFB] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#E5E7EB] transition-all"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A7AFF]/10 to-[#14B8A6]/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-[#0A7AFF]" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h5 className="font-medium text-[#1A2B4F]">{activity.title}</h5>
                          <span className="flex-shrink-0 text-sm text-[#0A7AFF] font-medium">{activity.time}</span>
                        </div>
                        <p className="text-sm text-[#64748B] mb-1">{activity.description}</p>
                        {activity.location && (
                          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#10B981]/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A2B4F]">What's Included</h3>
              <p className="text-xs text-[#64748B]">Standard package inclusions</p>
            </div>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              All accommodation bookings
            </li>
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Daily breakfast
            </li>
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              All transfers and tours
            </li>
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Tour guide services
            </li>
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Travel insurance
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FFB84D] flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A2B4F]">Important Notes</h3>
              <p className="text-xs text-[#64748B]">Please take note</p>
            </div>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
              Valid ID required for all travelers
            </li>
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
              Itinerary subject to weather conditions
            </li>
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
              Booking must be confirmed 7 days prior
            </li>
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
              Cancellation policy applies
            </li>
            <li className="flex items-center gap-2 text-sm text-[#334155]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
              Additional fees may apply for add-ons
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
