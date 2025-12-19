import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Eye, Search, ArrowLeft, MapPin, Calendar, DollarSign, Users, Plane, Hotel, Camera, UtensilsCrossed, Car, Package, Send, ChevronLeft } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { SearchFilterToolbar, SortOrder } from "../../components/SearchFilterToolbar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { toast } from "sonner@2.0.3";
import { FAQAssistant } from "../../components/FAQAssistant";

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

interface StandardItinerary {
  id: number;
  title: string;
  destination: string;
  days: number;
  category: string;
  pricePerPax: number;
  image: string;
}

interface BookingFormData {
  customerName: string;
  email: string;
  mobile: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  tourType: "Joiner" | "Private";
}

export function UserStandardItinerary() {
  const navigate = useNavigate();
  const location = useLocation();
  const standardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const [selectedStandardId, setSelectedStandardId] = useState<number | null>(null);
  const [standardBookingModalOpen, setStandardBookingModalOpen] = useState(false);
  const [selectedStandardForBooking, setSelectedStandardForBooking] = useState<number | null>(null);
  const [createBookingConfirmOpen, setCreateBookingConfirmOpen] = useState(false);

  // Booking form data
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    customerName: "Maria Santos",
    email: "maria.santos@email.com",
    mobile: "+63 917 123 4567",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    tourType: "" as any,
  });

  // Standard itinerary templates
  const defaultTemplates: StandardItinerary[] = [
    {
      id: 1,
      title: "Boracay 5-Day Beach Escape",
      destination: "Boracay, Aklan",
      days: 5,
      category: "Standard",
      pricePerPax: 5700,
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCb3JhY2F5JTIwYmVhY2glMjBQaGlsaXBwaW5lc3xlbnwxfHx8fDE3NjAyNjEwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      title: "Baguio 4-Day Summer Capital",
      destination: "Baguio City, Benguet",
      days: 4,
      category: "Standard",
      pricePerPax: 4875,
      image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYWd1aW8lMjBQaGlsaXBwaW5lcyUyMG1vdW50YWluc3xlbnwxfHx8fDE3NjAyNjEwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 5,
      title: "Cebu 5-Day Heritage Tour",
      destination: "Cebu City, Cebu",
      days: 5,
      category: "Standard",
      pricePerPax: 4800,
      image: "https://images.unsplash.com/photo-1580837119756-563d608dd119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDZWJ1JTIwUGhpbGlwcGluZXMlMjBjaXR5fGVufDF8fHx8MTc2MDI2MTA3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const templates = defaultTemplates;

  // Standard Itinerary Details Data
  const defaultItineraryDetails: Record<number, ItineraryDay[]> = {
    1: [ // Boracay 5-Day Beach Escape
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
          { time: "5:00 PM", icon: Hotel, title: "Return to Resort", description: "Free time for rest", location: "Resort" },
        ],
      },
      {
        day: 3,
        title: "Water Sports & Activities",
        activities: [
          { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Buffet breakfast at resort", location: "Resort" },
          { time: "10:00 AM", icon: Camera, title: "Water Sports", description: "Parasailing, jet ski, banana boat", location: "White Beach" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Beachfront dining", location: "Station 1" },
          { time: "3:00 PM", icon: Package, title: "Free Time", description: "Shopping or beach relaxation", location: "D'Mall" },
        ],
      },
      {
        day: 4,
        title: "Relaxation Day",
        activities: [
          { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Leisurely breakfast", location: "Resort" },
          { time: "10:00 AM", icon: Camera, title: "Beach Time", description: "Sunbathing and swimming", location: "White Beach" },
          { time: "2:00 PM", icon: Package, title: "Spa Treatment", description: "Optional massage services", location: "Resort Spa" },
          { time: "7:00 PM", icon: UtensilsCrossed, title: "Farewell Dinner", description: "Special seafood feast", location: "Beachfront Restaurant" },
        ],
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Final breakfast at resort", location: "Resort" },
          { time: "9:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out", location: "Resort" },
          { time: "10:00 AM", icon: Car, title: "Transfer to Airport", description: "Boat and van transfer", location: "Caticlan Airport" },
          { time: "12:00 PM", icon: Plane, title: "Departure", description: "Flight back home", location: "Caticlan Airport" },
        ],
      },
    ],
    3: [ // Baguio 4-Day Summer Capital
      {
        day: 1,
        title: "Arrival & City Tour",
        activities: [
          { time: "8:00 AM", icon: Car, title: "Departure from Manila", description: "Travel to Baguio City", location: "Manila" },
          { time: "2:00 PM", icon: Hotel, title: "Check-in", description: "Check-in at hotel", location: "Baguio City" },
          { time: "4:00 PM", icon: Camera, title: "Burnham Park", description: "Boat rides and biking", location: "Burnham Park" },
          { time: "6:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Try local delicacies", location: "Session Road" },
        ],
      },
      {
        day: 2,
        title: "Nature & Heritage",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel", location: "Hotel" },
          { time: "9:00 AM", icon: Camera, title: "Botanical Garden", description: "Nature walk and photo ops", location: "Botanical Garden" },
          { time: "11:00 AM", icon: Camera, title: "Mines View Park", description: "Scenic mountain views", location: "Mines View Park" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Local restaurant", location: "City Center" },
          { time: "3:00 PM", icon: Package, title: "Good Shepherd", description: "Buy pasalubong and souvenirs", location: "Good Shepherd Convent" },
        ],
      },
      {
        day: 3,
        title: "Adventure Day",
        activities: [
          { time: "6:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Packed breakfast", location: "Hotel" },
          { time: "7:00 AM", icon: Plane, title: "Strawberry Farm", description: "Strawberry picking experience", location: "La Trinidad" },
          { time: "10:00 AM", icon: Camera, title: "Lion's Head", description: "Iconic landmark visit", location: "Kennon Road" },
          { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Mountain view restaurant", location: "Camp John Hay" },
          { time: "3:00 PM", icon: Package, title: "Shopping Time", description: "Night market preparation", location: "Session Road" },
        ],
      },
      {
        day: 4,
        title: "Departure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Last breakfast in Baguio", location: "Hotel" },
          { time: "9:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out", location: "Hotel" },
          { time: "10:00 AM", icon: Car, title: "Return to Manila", description: "Travel back to Manila", location: "Baguio City" },
        ],
      },
    ],
    5: [ // Cebu 5-Day Heritage Tour
      {
        day: 1,
        title: "Arrival & City Orientation",
        activities: [
          { time: "10:00 AM", icon: Plane, title: "Arrival at Mactan Airport", description: "Meet tour coordinator", location: "Mactan-Cebu Airport" },
          { time: "12:00 PM", icon: Hotel, title: "Check-in", description: "Check-in at city hotel", location: "Cebu City" },
          { time: "2:00 PM", icon: Camera, title: "City Tour", description: "Visit Magellan's Cross, Basilica", location: "Downtown Cebu" },
          { time: "6:00 PM", icon: UtensilsCrossed, title: "Welcome Dinner", description: "Lechon dinner", location: "Ayala Center" },
        ],
      },
      {
        day: 2,
        title: "Historical Sites",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel", location: "Hotel" },
          { time: "9:00 AM", icon: Camera, title: "Fort San Pedro", description: "Spanish-era fortress", location: "Fort San Pedro" },
          { time: "11:00 AM", icon: Camera, title: "Yap-Sandiego House", description: "Ancestral house tour", location: "Parian District" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Traditional Cebuano food", location: "Carbon Market Area" },
          { time: "3:00 PM", icon: Package, title: "Heritage Walk", description: "Explore colonial streets", location: "Colon Street" },
        ],
      },
      {
        day: 3,
        title: "Island Adventure",
        activities: [
          { time: "6:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Packed breakfast", location: "Hotel" },
          { time: "7:00 AM", icon: Plane, title: "Island Hopping", description: "Malapascua or Bantayan Island", location: "Northern Cebu" },
          { time: "12:00 PM", icon: UtensilsCrossed, title: "Beach Lunch", description: "Fresh seafood", location: "Island" },
          { time: "5:00 PM", icon: Car, title: "Return to City", description: "Transfer back to hotel", location: "Cebu City" },
        ],
      },
      {
        day: 4,
        title: "Nature & Waterfalls",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel", location: "Hotel" },
          { time: "9:00 AM", icon: Camera, title: "Kawasan Falls", description: "Canyoneering adventure", location: "Badian" },
          { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Waterfall-side dining", location: "Kawasan" },
          { time: "4:00 PM", icon: Car, title: "Return to City", description: "Drive back to Cebu", location: "Cebu City" },
        ],
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Final breakfast", location: "Hotel" },
          { time: "9:00 AM", icon: Package, title: "Last Minute Shopping", description: "Buy pasalubong", location: "SM Seaside" },
          { time: "11:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out", location: "Hotel" },
          { time: "12:00 PM", icon: Car, title: "Airport Transfer", description: "Transfer to airport", location: "Mactan Airport" },
          { time: "2:00 PM", icon: Plane, title: "Departure", description: "Flight back home", location: "Mactan-Cebu Airport" },
        ],
      },
    ],
  };

  const standardItineraryDetails: Record<number, ItineraryDay[]> = defaultItineraryDetails;

  // Filtered and sorted templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedTemplates = (() => {
    const sorted = [...filteredTemplates];
    if (sortOrder === "asc") {
      return sorted.sort((a, b) => a.destination.localeCompare(b.destination));
    } else if (sortOrder === "desc") {
      return sorted.sort((a, b) => b.destination.localeCompare(a.destination));
    }
    return sorted;
  })();

  const handleViewDetails = (id: number) => {
    setSelectedStandardId(id);
    setViewMode("detail");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
    setSelectedStandardId(null);
  };

  const handleBookNow = (id: number) => {
    setSelectedStandardForBooking(id);
    setStandardBookingModalOpen(true);
  };

  const handleCreateStandardBooking = () => {
    if (!selectedStandardForBooking) return;

    // Validation
    if (!bookingFormData.travelDateFrom || !bookingFormData.travelDateTo || !bookingFormData.tourType) {
      toast.error("Please fill in all required fields", {
        description: "Travel dates and tour type are required"
      });
      return;
    }

    // Validate date range
    const startDate = new Date(bookingFormData.travelDateFrom);
    const endDate = new Date(bookingFormData.travelDateTo);
    
    if (endDate <= startDate) {
      toast.error("Invalid date range", {
        description: "End date must be after start date"
      });
      return;
    }

    setStandardBookingModalOpen(false);
    setCreateBookingConfirmOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedStandardForBooking) return;

    const selectedTemplate = templates.find(t => t.id === selectedStandardForBooking);
    if (!selectedTemplate) return;

    // Calculate total amount
    const travelers = parseInt(bookingFormData.travelers) || 1;
    const totalAmount = selectedTemplate.pricePerPax * travelers;

    // Generate booking ID
    const currentYear = new Date().getFullYear();
    const bookingId = `BV-${currentYear}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

    // Format dates
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    const dateRange = `${formatDate(bookingFormData.travelDateFrom)} – ${formatDate(bookingFormData.travelDateTo)}`;

    // Create booking object
    const newBooking = {
      id: bookingId,
      customer: bookingFormData.customerName,
      email: bookingFormData.email,
      mobile: bookingFormData.mobile,
      destination: selectedTemplate.destination,
      dates: dateRange,
      travelers: travelers,
      amount: `₱${totalAmount.toLocaleString()}`,
      paymentStatus: "Unpaid" as const,
      tripStatus: "upcoming" as const,
      bookingDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      image: selectedTemplate.image,
      itinerary: `${selectedTemplate.days} Days`,
      bookingType: "Standard" as const,
      tourType: bookingFormData.tourType,
    };

    // Store in localStorage for UserBookings (user side)
    const existingUserBookings = JSON.parse(localStorage.getItem('userStandardBookings') || '[]');
    existingUserBookings.push(newBooking);
    localStorage.setItem('userStandardBookings', JSON.stringify(existingUserBookings));

    // Store in localStorage for Bookings (admin side) with same booking ID
    const existingAdminBookings = JSON.parse(localStorage.getItem('adminStandardBookings') || '[]');
    existingAdminBookings.push(newBooking);
    localStorage.setItem('adminStandardBookings', JSON.stringify(existingAdminBookings));

    setCreateBookingConfirmOpen(false);
    
    toast.success("Booking Created Successfully!", {
      description: `Your booking ${bookingId} has been created`
    });

    // Reset form
    setBookingFormData({
      customerName: "Maria Santos",
      email: "maria.santos@email.com",
      mobile: "+63 917 123 4567",
      travelDateFrom: "",
      travelDateTo: "",
      travelers: "1",
      tourType: "" as any,
    });

    // Navigate to UserBookings with booking ID to scroll to
    setTimeout(() => {
      navigate("/user/bookings", { state: { newBookingId: bookingId } });
    }, 1500);
  };

  const selectedTemplate = selectedStandardId !== null ? templates.find(t => t.id === selectedStandardId) : null;
  const selectedItineraryDetails = selectedStandardId !== null ? standardItineraryDetails[selectedStandardId] : [];

  if (viewMode === "detail" && selectedTemplate && selectedItineraryDetails) {
    // Detail View
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToGrid}
            className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] dark:border-[#2A3441] hover:border-[#0A7AFF] dark:hover:border-[#2596be] hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(37,150,190,0.1)] flex items-center justify-center transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#64748B] dark:text-[#E5E7EB]" />
          </button>
          <div>
            <h2 className="text-[#1A2B4F] dark:text-white font-semibold">{selectedTemplate.title}</h2>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Standard Itinerary Package</p>
          </div>
        </div>

        {/* Hero Image and Overview */}
        <div className="rounded-2xl border-2 border-[#E5E7EB] dark:border-[#2A3441] overflow-hidden bg-white dark:bg-[#1A1F2E] shadow-sm">
          <div className="h-[300px] relative overflow-hidden">
            <ImageWithFallback 
              src={selectedTemplate.image} 
              alt={selectedTemplate.destination}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-white text-3xl font-semibold mb-2">{selectedTemplate.title}</h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{selectedTemplate.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{selectedTemplate.days} Days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">₱{selectedTemplate.pricePerPax.toLocaleString()} per pax</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleBookNow(selectedTemplate.id)}
                  className="h-10 px-5 rounded-[20px] text-white text-sm font-medium shadow-lg flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}
                >
                  <Send className="w-4 h-4" />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Day-by-Day Itinerary */}
        <div className="rounded-2xl border-2 border-[#E5E7EB] dark:border-[#2A3441] bg-white dark:bg-[#1A1F2E] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] dark:from-[#2596be] dark:to-[#25bce0] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20 dark:shadow-[#2596be]/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A2B4F] dark:text-white">Day-by-Day Itinerary</h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{selectedTemplate.days}-day comprehensive travel plan</p>
            </div>
          </div>

          <div className="space-y-6">
            {selectedItineraryDetails.map((day) => (
              <div key={day.day} className="border-l-4 border-[#0A7AFF] dark:border-[#2596be] pl-6 relative">
                {/* Day Header */}
                <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] dark:from-[#2596be] dark:to-[#25bce0] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/30 dark:shadow-[#2596be]/30">
                  <span className="text-white text-sm font-semibold">{day.day}</span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-[#1A2B4F] dark:text-white">Day {day.day}: {day.title}</h4>
                </div>

                {/* Activities */}
                <div className="space-y-3 mb-6">
                  {day.activities.map((activity, idx) => {
                    const IconComponent = activity.icon;
                    return (
                      <div
                        key={idx}
                        className="flex gap-4 p-4 rounded-xl bg-[#F8FAFB] dark:bg-[#0F1419] hover:bg-white dark:hover:bg-[#1A1F2E] hover:shadow-sm border border-transparent hover:border-[#E5E7EB] dark:hover:border-[#2A3441] transition-all"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A7AFF]/10 to-[#14B8A6]/10 dark:from-[#2596be]/20 dark:to-[#14B8A6]/20 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-[#0A7AFF] dark:text-[#2596be]" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <h5 className="font-medium text-[#1A2B4F] dark:text-white">{activity.title}</h5>
                            <span className="flex-shrink-0 text-sm text-[#0A7AFF] dark:text-[#2596be] font-medium">{activity.time}</span>
                          </div>
                          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-1">{activity.description}</p>
                          {activity.location && (
                            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border-2 border-[#E5E7EB] dark:border-[#2A3441] bg-white dark:bg-[#1A1F2E] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#10B981]/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A2B4F] dark:text-white">What's Included</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Standard package inclusions</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                All accommodation bookings
              </li>
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Daily breakfast
              </li>
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                All transfers and tours
              </li>
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Tour guide services
              </li>
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Travel insurance
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-[#E5E7EB] dark:border-[#2A3441] bg-white dark:bg-[#1A1F2E] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FFB84D] flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A2B4F] dark:text-white">Important Notes</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Please take note</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
                Valid ID required for all travelers
              </li>
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
                Itinerary subject to weather conditions
              </li>
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
                Booking must be confirmed 7 days prior
              </li>
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
                Cancellation policy applies
              </li>
              <li className="flex items-center gap-2 text-sm text-[#334155] dark:text-[#E5E7EB]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
                Additional fees may apply for add-ons
              </li>
            </ul>
          </div>
        </div>

        {/* Booking Modal */}
        {standardBookingModalOpen && (
          <Dialog open={standardBookingModalOpen} onOpenChange={setStandardBookingModalOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-[#0A7AFF] dark:text-[#2596be]" />
                  Book Standard Itinerary
                </DialogTitle>
                <DialogDescription>
                  Complete the booking form for {selectedTemplate.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 px-6 pb-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">Customer Name</Label>
                    <Input
                      value={bookingFormData.customerName}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, customerName: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">Email</Label>
                    <Input
                      type="email"
                      value={bookingFormData.email}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, email: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 text-card-foreground">Mobile Number</Label>
                  <Input
                    value={bookingFormData.mobile}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, mobile: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">Travel Date From <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={bookingFormData.travelDateFrom}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, travelDateFrom: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">Travel Date To <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={bookingFormData.travelDateTo}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, travelDateTo: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">Number of Travelers</Label>
                    <Input
                      type="number"
                      min="1"
                      value={bookingFormData.travelers}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, travelers: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">Tour Type <span className="text-red-500">*</span></Label>
                    <Select
                      value={bookingFormData.tourType}
                      onValueChange={(value: "Joiner" | "Private") => setBookingFormData({ ...bookingFormData, tourType: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select tour type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Joiner">Joiner</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="p-4 bg-gradient-to-br from-[rgba(10,122,255,0.08)] to-[rgba(20,184,166,0.08)] dark:from-[rgba(37,150,190,0.15)] dark:to-[rgba(20,184,166,0.15)] rounded-xl border-2 border-[rgba(10,122,255,0.2)] dark:border-[rgba(37,150,190,0.3)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Price per pax:</span>
                    <span className="text-sm font-semibold text-[#1A2B4F] dark:text-white">₱{selectedTemplate.pricePerPax.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Number of travelers:</span>
                    <span className="text-sm font-semibold text-[#1A2B4F] dark:text-white">{bookingFormData.travelers}</span>
                  </div>
                  <div className="h-px bg-[#E5E7EB] dark:bg-[#2A3441] my-3"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-[#1A2B4F] dark:text-white">Total Amount:</span>
                    <span className="text-lg font-bold text-[#0A7AFF] dark:text-[#2596be]">
                      ₱{(selectedTemplate.pricePerPax * parseInt(bookingFormData.travelers || "1")).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setStandardBookingModalOpen(false)}
                    className="px-6 py-3 border border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStandardBooking}
                    className="px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))',
                      color: 'white'
                    }}
                  >
                    Submit Booking
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Booking Confirmation Modal */}
        <ConfirmationModal
          open={createBookingConfirmOpen}
          onOpenChange={setCreateBookingConfirmOpen}
          title="Confirm Booking"
          description="Review your booking details before confirming"
          icon={<Send className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] dark:from-[#2596be] dark:to-[#25bce0]"
          iconShadow="shadow-[#0A7AFF]/20 dark:shadow-[#2596be]/30"
          contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.08)] to-[rgba(20,184,166,0.08)] dark:from-[rgba(37,150,190,0.15)] dark:to-[rgba(20,184,166,0.15)]"
          contentBorder="border-[rgba(10,122,255,0.2)] dark:border-[rgba(37,150,190,0.3)]"
          content={
            <div className="space-y-3">
              <p className="text-sm text-[#334155] dark:text-[#E5E7EB] leading-relaxed">
                Create booking for <span className="font-semibold text-[#0A7AFF] dark:text-[#2596be]">{selectedTemplate.title}</span>?
              </p>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] space-y-1">
                <div>• Travelers: {bookingFormData.travelers}</div>
                <div>• Tour Type: {bookingFormData.tourType}</div>
                <div>• Total: ₱{(selectedTemplate.pricePerPax * parseInt(bookingFormData.travelers || "1")).toLocaleString()}</div>
                <div>• Payment Status: Unpaid</div>
              </div>
            </div>
          }
          onConfirm={handleConfirmBooking}
          onCancel={() => setCreateBookingConfirmOpen(false)}
          confirmText="Confirm Booking"
          cancelText="Cancel"
          confirmVariant="default"
        />
      </div>
    );
  }

  // Grid View
  return (
    <div className="space-y-6">
      {/* Header with back button */}
<div className="flex items-center gap-4 mb-6">
  <button
    onClick={() => navigate('/user/travels')}
    className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] dark:bg-gray-800 dark:border-gray-700 dark:hover:border-[#0A7AFF] dark:hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
  >
    <ChevronLeft className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
  </button>
  <div>
    <h2 className="text-[#1A2B4F] dark:text-white font-semibold">Back to Travels</h2>
  </div>
</div>

      <ContentCard 
        title="Standard Itinerary Packages" 
        icon={BookOpen}
      >
        {/* Search and Filter */}
        <div className="mb-6">
          <SearchFilterToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            searchPlaceholder="Search by destination or title..."
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sortedTemplates.map((template) => (
    <div
      key={template.id}
      ref={(el) => (standardRefs.current[template.id] = el)}
      className="group rounded-2xl border-2 border-[#E5E7EB] dark:border-[#2A3441] bg-white dark:bg-[#1A1F2E] overflow-hidden hover:border-[#0A7AFF] dark:hover:border-[#2596be] hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="h-48 relative overflow-hidden">
        <ImageWithFallback
          src={template.image}
          alt={template.destination}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
            {template.days} Days
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-[#1A2B4F] dark:text-white mb-2 group-hover:text-[#0A7AFF] dark:group-hover:text-[#2596be] transition-colors">
          {template.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8] mb-4">
          <MapPin className="w-4 h-4" />
          <span>{template.destination}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-1">Starting from</p>
            <p className="text-lg font-bold text-[#0A7AFF] dark:text-[#2596be]">
              ₱{template.pricePerPax.toLocaleString()}
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">per person</p>
          </div>
          {/* View Details Button */}
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(template.id);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] dark:from-[#2596be] dark:to-[#25bce0] text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
        </div>

      </div>
    </div>
  ))}
  <FAQAssistant />
</div>

{sortedTemplates.length === 0 && (
  <div className="text-center py-12">
    <div className="w-16 h-16 rounded-full bg-[#F8FAFB] dark:bg-[#0F1419] flex items-center justify-center mx-auto mb-4">
      <Search className="w-8 h-8 text-[#64748B] dark:text-[#94A3B8]" />
    </div>
    <p className="text-[#64748B] dark:text-[#94A3B8]">No itineraries found</p>
  </div>
)}
      </ContentCard>
    </div>
  );
}
