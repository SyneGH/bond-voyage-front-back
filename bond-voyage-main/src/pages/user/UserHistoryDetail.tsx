import { useParams, useNavigate } from "react-router-dom";
import { Plane, Hotel, Camera, UtensilsCrossed, Car, Package } from "lucide-react";
import { BookingDetailView } from "../../components/BookingDetailView";
import { FAQAssistant } from "../../components/FAQAssistant";

interface CompletedTrip {
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

const tripsData: CompletedTrip[] = [
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
  },
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
  },
];

const itineraryData: Record<string, any> = {
  "BV-2024-098": [
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
        { time: "5:00 PM", icon: Hotel, title: "Return to Resort", description: "Free time for rest and relaxation", location: "Resort" },
        { time: "7:00 PM", icon: UtensilsCrossed, title: "Dinner at D'Mall", description: "Explore local restaurants", location: "D'Mall" },
      ],
    },
    {
      day: 3,
      title: "Beach Activities & Water Sports",
      activities: [
        { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast buffet at resort", location: "Resort" },
        { time: "10:00 AM", icon: Camera, title: "Beach Activities", description: "Parasailing, banana boat, jet ski", location: "White Beach" },
        { time: "1:00 PM", icon: UtensilsCrossed, title: "Lunch", description: "Beachfront dining", location: "Station 1" },
        { time: "3:00 PM", icon: Package, title: "Free Time", description: "Shopping at D'Mall or beach relaxation", location: "D'Mall / Beach" },
      ],
    },
    {
      day: 4,
      title: "Relaxation Day",
      activities: [
        { time: "8:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Leisurely breakfast at resort", location: "Resort" },
        { time: "10:00 AM", icon: Camera, title: "Beach Relaxation", description: "Sunbathing and swimming", location: "White Beach" },
        { time: "2:00 PM", icon: Package, title: "Spa Treatment", description: "Optional massage and spa services", location: "Resort Spa" },
        { time: "7:00 PM", icon: UtensilsCrossed, title: "Farewell Dinner", description: "Special seafood feast", location: "Beachfront Restaurant" },
      ],
    },
    {
      day: 5,
      title: "Departure",
      activities: [
        { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Final breakfast at resort", location: "Resort" },
        { time: "9:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out and luggage transfer", location: "Resort" },
        { time: "10:00 AM", icon: Car, title: "Transfer to Airport", description: "Boat and van transfer to Caticlan", location: "Caticlan Airport" },
        { time: "12:00 PM", icon: Plane, title: "Departure", description: "Flight back home", location: "Caticlan Airport" },
      ],
    },
  ],
  "BV-2024-087": [
    {
      day: 1,
      title: "Arrival & City Orientation",
      activities: [
        { time: "9:00 AM", icon: Plane, title: "Arrival at Puerto Princesa", description: "Meet tour coordinator at airport", location: "Puerto Princesa Airport" },
        { time: "10:30 AM", icon: Car, title: "Transfer to Hotel", description: "Check-in at city hotel", location: "City Center" },
        { time: "2:00 PM", icon: Camera, title: "City Tour", description: "Visit Plaza Cuartel, Cathedral, Baywalk", location: "Puerto Princesa City" },
        { time: "6:00 PM", icon: UtensilsCrossed, title: "Welcome Dinner", description: "Local cuisine at waterfront restaurant", location: "Baywalk" },
      ],
    },
    {
      day: 2,
      title: "Underground River Tour",
      activities: [
        { time: "6:00 AM", icon: UtensilsCrossed, title: "Early Breakfast", description: "Packed breakfast for early departure", location: "Hotel" },
        { time: "7:00 AM", icon: Car, title: "Travel to Sabang", description: "2-hour drive to Underground River", location: "Sabang Wharf" },
        { time: "9:30 AM", icon: Plane, title: "Underground River Tour", description: "UNESCO World Heritage Site exploration", location: "Puerto Princesa Underground River" },
        { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch at Sabang", description: "Beachside lunch", location: "Sabang Beach" },
        { time: "3:00 PM", icon: Car, title: "Return to City", description: "Drive back to Puerto Princesa", location: "City Center" },
        { time: "7:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Free choice dining", location: "City Center" },
      ],
    },
    {
      day: 3,
      title: "Island Hopping Adventure",
      activities: [
        { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Breakfast at hotel", location: "Hotel" },
        { time: "8:00 AM", icon: Plane, title: "Honda Bay Island Hopping", description: "Visit Luli Island, Cowrie Island, Starfish Island", location: "Honda Bay" },
        { time: "12:00 PM", icon: UtensilsCrossed, title: "Lunch on Island", description: "Fresh seafood lunch", location: "Cowrie Island" },
        { time: "4:00 PM", icon: Car, title: "Return to Hotel", description: "Transfer back to city", location: "Hotel" },
        { time: "7:00 PM", icon: UtensilsCrossed, title: "Dinner", description: "Enjoy local delicacies", location: "City Center" },
      ],
    },
    {
      day: 4,
      title: "Departure Day",
      activities: [
        { time: "7:00 AM", icon: UtensilsCrossed, title: "Breakfast", description: "Final breakfast", location: "Hotel" },
        { time: "9:00 AM", icon: Package, title: "Free Time", description: "Last minute shopping or relaxation", location: "City Center" },
        { time: "11:00 AM", icon: Hotel, title: "Check-out", description: "Hotel check-out", location: "Hotel" },
        { time: "12:00 PM", icon: Car, title: "Airport Transfer", description: "Transfer to airport", location: "Puerto Princesa Airport" },
        { time: "2:00 PM", icon: Plane, title: "Departure", description: "Flight back home", location: "Puerto Princesa Airport" },
      ],
    },
  ],
};

export function UserHistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const trip = tripsData.find(t => t.id === id);
  const itinerary = id ? itineraryData[id] : null;

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl text-card-foreground mb-2">Trip Not Found</h2>
          <p className="text-muted-foreground mb-6">The trip you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate("/user/history")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white hover:shadow-lg transition-all"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate("/user/history");
  };

  const headerVariant = trip.status === "completed" ? "completed" : "cancelled";

  // Custom action content for History view
  const actionContent = (
    <div className="space-y-3">
      <div className={`p-4 rounded-xl border ${
        trip.status === "completed"
          ? "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]"
          : "bg-[rgba(255,107,107,0.05)] border-[rgba(255,107,107,0.2)]"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#64748B]">Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            trip.status === "completed"
              ? "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
              : "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border border-[rgba(255,107,107,0.2)]"
          }`}>
            {trip.status === "completed" ? "✓ Completed" : "✗ Cancelled"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#64748B]">
            {trip.status === "completed" ? "Completed On" : "Cancelled On"}
          </span>
          <span className="text-xs font-medium text-[#334155]">
            {trip.status === "completed" ? trip.completedDate : trip.cancelledDate}
          </span>
        </div>
      </div>
      {trip.status === "cancelled" && trip.cancellationReason && (
        <div className="p-4 rounded-xl border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.05)]">
          <p className="text-xs text-[#64748B] mb-2">Cancellation Reason</p>
          <p className="text-sm text-[#334155] leading-relaxed">{trip.cancellationReason}</p>
        </div>
      )}
      <FAQAssistant />
    </div>
  );

  return (
    <BookingDetailView
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
      itinerary={itinerary || []}
      onBack={handleBack}
      actionButtons={actionContent}
      breadcrumbPage="History"
      headerVariant={headerVariant}
      showPaymentDetails={false}
    />
  );
}
