import { createContext, useContext, useState, ReactNode } from "react";

// Define booking types
export interface GeneratedTripBooking {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  status: "in-progress" | "pending" | "rejected";
  bookingType: "Customized" | "Standard";
  bookingSource?: "Generated" | "Customized";
  ownership: "owned" | "collaborated";
  owner: string;
  collaborators: string[];
  createdOn: string;
  itinerary?: any;
  rejectionReason?: string;
  rejectionResolution?: string;
  resolutionStatus?: "resolved" | "unresolved";
}

export interface PendingApprovalBooking {
  id: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  duration: string;
  dates: string;
  total: string;
  travelers: number;
  urgent: boolean;
  bookedDate: string;
  bookingSource?: "Generated" | "Customized";
  rejectionReason?: string;
  rejectionResolution?: string;
}

interface BookingContextType {
  // User Side - Travels
  userTravels: GeneratedTripBooking[];
  addUserTravel: (travel: GeneratedTripBooking) => void;
  updateUserTravel: (id: string, updates: Partial<GeneratedTripBooking>) => void;
  moveUserTravelToPending: (id: string) => void;
  deleteUserTravel: (id: string) => void;
  
  // Admin Side - Approvals
  pendingApprovals: PendingApprovalBooking[];
  addPendingApproval: (booking: PendingApprovalBooking) => void;
  removePendingApproval: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [userTravels, setUserTravels] = useState<GeneratedTripBooking[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalBooking[]>([]);

  const addUserTravel = (travel: GeneratedTripBooking) => {
    setUserTravels(prev => [travel, ...prev]);
  };

  const updateUserTravel = (id: string, updates: Partial<GeneratedTripBooking>) => {
    setUserTravels(prev => prev.map(travel => 
      travel.id === id ? { ...travel, ...updates } : travel
    ));
  };

  const moveUserTravelToPending = (id: string) => {
    const travel = userTravels.find(t => t.id === id);
    if (travel) {
      // Update user travel status to pending
      updateUserTravel(id, { status: "pending" });
      
      // Create approval booking and add to admin approvals
      const approvalBooking: PendingApprovalBooking = {
        id: travel.id,
        customer: travel.owner,
        email: "user@email.com", // Would come from user profile
        mobile: "+63 XXX XXX XXXX", // Would come from user profile
        destination: travel.destination,
        duration: calculateDuration(travel.startDate, travel.endDate),
        dates: formatDateRange(travel.startDate, travel.endDate),
        total: travel.budget,
        travelers: travel.travelers,
        urgent: isUrgent(travel.startDate),
        bookedDate: travel.createdOn,
        bookingSource: travel.bookingSource,
      };
      
      addPendingApproval(approvalBooking);
    }
  };

  const deleteUserTravel = (id: string) => {
    setUserTravels(prev => prev.filter(travel => travel.id !== id));
  };

  const addPendingApproval = (booking: PendingApprovalBooking) => {
    setPendingApprovals(prev => [booking, ...prev]);
  };

  const removePendingApproval = (id: string) => {
    setPendingApprovals(prev => prev.filter(booking => booking.id !== id));
  };

  // Helper functions
  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const isUrgent = (startDate: string): boolean => {
    const start = new Date(startDate);
    const today = new Date();
    const daysUntilTrip = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilTrip <= 7;
  };

  return (
    <BookingContext.Provider
      value={{
        userTravels,
        addUserTravel,
        updateUserTravel,
        moveUserTravelToPending,
        deleteUserTravel,
        pendingApprovals,
        addPendingApproval,
        removePendingApproval,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
}
