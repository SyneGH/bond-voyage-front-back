import { useParams, useNavigate } from "react-router-dom";
import { Plane, Hotel, Camera, UtensilsCrossed, Car, Download, QrCode, Keyboard, CreditCard, User, Phone, Mail, Banknote, Smartphone, Upload, X, CheckCircle2, ChevronLeft, MapPin, Calendar as CalendarIcon, Users, Clock, Pen, Save, Copy, Shield, AlertCircle, TrendingUp, Wallet, Receipt, ChevronRight, Sparkles } from "lucide-react";

import { ItineraryDetailDisplay } from "../../components/ItineraryDetailDisplay";
import { exportBookingDetailToPDF, exportBookingDetailToExcel } from "../../utils/exportUtils";
import { toast } from "sonner@2.0.3";
import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import html2canvas from "html2canvas";
import confetti from 'canvas-confetti';
import { useProfile } from "../../components/ProfileContext";
import { FAQAssistant } from "../../components/FAQAssistant";

interface PaymentSubmission {
  id: string;
  paymentType: "Full Payment" | "Partial Payment";
  amount: number;
  modeOfPayment: "Cash" | "Gcash";
  proofOfPayment?: string;
  cashConfirmation?: string;
  submittedAt: string;
}

interface Booking {
  id: string;
  customer: string;
  email: string;
  mobile: string;
  destination: string;
  dates: string;
  travelers: number;
  amount: string;
  status: "confirmed" | "pending" | "cancelled";
  bookingDate: string;
  image: string;
  itinerary: string;
  bookingType: "Standard" | "Customized";
  paymentType?: "Full Payment" | "Partial Payment" | "";
  modeOfPayment?: "Cash" | "Gcash" | "";
  amountPaid?: number;
  proofOfPayment?: string;
  paymentHistory?: PaymentSubmission[];
  totalPaid?: number;
  // Add payment status
  paymentStatus: "Paid" | "Partial" | "Unpaid";
}

const bookingsData: Booking[] = [
  {
    id: "BV-2025-001",
    customer: "Maria Santos",
    email: "maria.santos@email.com",
    mobile: "+63 917 123 4567",
    destination: "Boracay, Aklan",
    dates: "December 20, 2025 – December 25, 2025",
    travelers: 4,
    amount: "₱85,500",
    status: "confirmed",
    bookingDate: "November 10, 2025",
    image: "https://images.unsplash.com/photo-1675760134774-0d6972b51e32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3JhY2F5JTIwYmVhY2glMjBzdW5zZXR8ZW58MXx8fHwxNzYyODQ2MjMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    itinerary: "Boracay 5-Day Beach Paradise",
    bookingType: "Standard",
    paymentStatus: "Unpaid",
    totalPaid: 0,
    paymentHistory: []
  },
  {
    id: "BV-2025-002",
    customer: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    mobile: "+63 918 234 5678",
    destination: "El Nido, Palawan",
    dates: "January 15, 2026 – January 20, 2026",
    travelers: 2,
    amount: "₱62,000",
    status: "confirmed",
    bookingDate: "November 8, 2025",
    image: "https://images.unsplash.com/photo-1632307918787-8cb52566dd35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWxhd2FuJTIwZWwlMjBuaWRvJTIwaXNsYW5kfGVufDF8fHx8MTc2Mjg0NjIzM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    itinerary: "El Nido 5-Day Exploration",
    bookingType: "Customized",
    paymentStatus: "Partial",
    totalPaid: 31000,
    paymentHistory: [
      {
        id: "PAY-2025-002-1",
        paymentType: "Partial Payment",
        amount: 31000,
        modeOfPayment: "Gcash",
        proofOfPayment: "https://example.com/proof1.jpg",
        submittedAt: "2025-11-08T10:30:00Z"
      }
    ]
  },
  {
    id: "BV-2025-003",
    customer: "Ana Reyes",
    email: "ana.reyes@email.com",
    mobile: "+63 919 345 6789",
    destination: "Baguio City, Benguet",
    dates: "November 28, 2025 – November 30, 2025",
    travelers: 3,
    amount: "₱38,750",
    status: "pending",
    bookingDate: "November 1, 2025",
    image: "https://images.unsplash.com/photo-1677215552516-1f2a2aa46915?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWd1aW8lMjBjaXR5JTIwbW91bnRhaW5zfGVufDF8fHx8MTc2Mjg0NjIzNXww&ixlib=rb-4.1.0&q=80&w=1080",
    itinerary: "Baguio 3-Day Summer Escape",
    bookingType: "Standard",
    paymentStatus: "Paid",
    totalPaid: 38750,
    paymentHistory: [
      {
        id: "PAY-2025-003-1",
        paymentType: "Full Payment",
        amount: 38750,
        modeOfPayment: "Cash",
        cashConfirmation: "https://example.com/cash1.jpg",
        submittedAt: "2025-11-01T14:20:00Z"
      }
    ]
  },
  {
    id: "BV-2025-004",
    customer: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    mobile: "+63 920 456 7890",
    destination: "Oslob 3-Day Whale Shark Experience",
    dates: "February 10, 2026 – February 13, 2026",
    travelers: 2,
    amount: "₱45,200",
    status: "confirmed",
    bookingDate: "November 5, 2025",
    image: "https://images.unsplash.com/photo-1573808645321-beaa7ab67839?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWJ1JTIwb3Nsb2IlMjB3aGFsZSUyMHNoYXJrfGVufDF8fHx8MTc2Mjg0NjIzM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    itinerary: "Siargao 5-Day Surf & Island Adventures",
    bookingType: "Customized",
    paymentStatus: "Partial",
    totalPaid: 22600,
    paymentHistory: [
      {
        id: "PAY-2025-004-1",
        paymentType: "Partial Payment",
        amount: 22600,
        modeOfPayment: "Gcash",
        proofOfPayment: "https://example.com/proof2.jpg",
        submittedAt: "2025-11-05T09:15:00Z"
      }
    ]
  },
  {
  id: "BV-2025-005",
  customer: "Elena Rodriguez",
  email: "elena.rodriguez@email.com",
  mobile: "+63 921 567 8901",
  destination: "Siargao Island, Surigao del Norte",
  dates: "December 10, 2025 – December 15, 2025",
  travelers: 3,
  amount: "₱72,000",
  status: "confirmed",
  bookingDate: "October 20, 2025",
  image: "https://images.unsplash.com/photo-1721300931970-290ebc02b836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWFyZ2FvJTIwaXNsYW5kJTIwc3VyZmluZ3xlbnwxfHx8fDE3NjM0NTc4NDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  itinerary: "5 Days / 4 Nights",
  bookingType: "Requested",
  paymentStatus: "Unpaid",
  totalPaid: 0,
  paymentHistory: []
  }
];

const itineraryData: Record<string, any> = {
  "BV-2025-001": {
    id: "BV-2025-001",
    destination: "Boracay, Aklan",
    duration: "5 Days / 4 Nights",
    description: "Experience the pristine white beaches and crystal-clear waters of Boracay",
    destinations: ["Boracay Island", "White Beach", "Puka Beach"],
    days: [
      {
        day: 1,
        title: "Arrival & Beach Sunset",
        description: "Check-in and relax at the beach",
        activities: [
          { time: "10:00", activity: "Arrival at Caticlan Airport", location: "Caticlan Airport" },
          { time: "11:30", activity: "Transfer to Boracay", location: "D'Mall Area" },
          { time: "14:00", activity: "Hotel Check-in", location: "Station 2" },
          { time: "18:00", activity: "Sunset at White Beach", location: "White Beach" },
          { time: "20:00", activity: "Welcome Dinner", location: "Beachfront Restaurant" },
        ]
      },
      {
        day: 2,
        title: "Island Hopping Adventure",
        description: "Explore nearby islands",
        activities: [
          { time: "07:00", activity: "Breakfast", location: "Resort" },
          { time: "09:00", activity: "Island Hopping Tour", location: "Crystal Cove, Crocodile Island" },
          { time: "13:00", activity: "Lunch on Island", location: "Puka Beach" },
          { time: "17:00", activity: "Return to Resort", location: "Resort" },
          { time: "19:00", activity: "Dinner at D'Mall", location: "D'Mall" },
        ]
      },
      {
        day: 3,
        title: "Beach Activities & Water Sports",
        description: "Adventure and fun in the sun",
        activities: [
          { time: "08:00", activity: "Breakfast", location: "Resort" },
          { time: "10:00", activity: "Water Sports - Parasailing, Banana Boat", location: "White Beach" },
          { time: "13:00", activity: "Lunch", location: "Station 1" },
          { time: "15:00", activity: "Shopping at D'Mall", location: "D'Mall" },
          { time: "19:00", activity: "Dinner", location: "Beachfront Restaurant" },
        ]
      },
      {
        day: 4,
        title: "Relaxation Day",
        description: "Spa and leisure",
        activities: [
          { time: "08:00", activity: "Breakfast", location: "Resort" },
          { time: "10:00", activity: "Beach Relaxation", location: "White Beach" },
          { time: "14:00", activity: "Spa Treatment", location: "Resort Spa" },
          { time: "19:00", activity: "Farewell Dinner", location: "Beachfront Restaurant" },
        ]
      },
      {
        day: 5,
        title: "Departure",
        description: "Safe travels",
        activities: [
          { time: "07:00", activity: "Breakfast", location: "Resort" },
          { time: "09:00", activity: "Check-out", location: "Resort" },
          { time: "10:00", activity: "Transfer to Airport", location: "Caticlan Airport" },
          { time: "12:00", activity: "Departure Flight", location: "Caticlan Airport" },
        ]
      },
    ],
    inclusions: ["Accommodation (4 nights)", "Daily Breakfast", "Island Hopping Tour", "Airport Transfers", "Tour Guide"],
    exclusions: ["Airfare", "Lunch & Dinner", "Personal Expenses", "Optional Activities"],
    pricing: {
      basePrice: 85500,
      breakdown: [
        { item: "Accommodation (4 nights)", amount: 45000 },
        { item: "Island Hopping Tour", amount: 15500 },
        { item: "Transportation & Transfers", amount: 12000 },
        { item: "Tour Guide Services", amount: 8000 },
        { item: "Activities Package", amount: 5000 },
      ]
    }
  },
  "BV-2025-002": {
    id: "BV-2025-002",
    destination: "El Nido, Palawan",
    duration: "5 Days / 4 Nights",
    description: "Discover the stunning lagoons and limestone cliffs of El Nido",
    destinations: ["El Nido", "Big Lagoon", "Small Lagoon", "Secret Lagoon"],
    days: [
      {
        day: 1,
        title: "Arrival & Town Exploration",
        description: "Settle in and explore El Nido town",
        activities: [
          { time: "09:00", activity: "Arrival at Puerto Princesa", location: "Puerto Princesa Airport" },
          { time: "14:00", activity: "Transfer to El Nido", location: "El Nido Town" },
          { time: "17:00", activity: "Hotel Check-in", location: "Resort" },
          { time: "19:00", activity: "Town Walk & Dinner", location: "El Nido Town" },
        ]
      },
      {
        day: 2,
        title: "Island Hopping Tour A",
        description: "Big Lagoon, Small Lagoon, Shimizu Island",
        activities: [
          { time: "07:00", activity: "Breakfast", location: "Resort" },
          { time: "09:00", activity: "Tour A - Big Lagoon", location: "Big Lagoon" },
          { time: "11:00", activity: "Small Lagoon", location: "Small Lagoon" },
          { time: "13:00", activity: "Beach BBQ Lunch", location: "Shimizu Island" },
          { time: "16:00", activity: "Return to Resort", location: "Resort" },
        ]
      },
      {
        day: 3,
        title: "Island Hopping Tour C",
        description: "Hidden Beach, Secret Beach, Matinloc Shrine",
        activities: [
          { time: "07:00", activity: "Breakfast", location: "Resort" },
          { time: "09:00", activity: "Tour C - Hidden Beach", location: "Hidden Beach" },
          { time: "11:30", activity: "Secret Beach", location: "Secret Beach" },
          { time: "13:00", activity: "Lunch", location: "Helicopter Island" },
          { time: "15:00", activity: "Matinloc Shrine", location: "Matinloc Island" },
          { time: "17:00", activity: "Return to Resort", location: "Resort" },
        ]
      },
      {
        day: 4,
        title: "Free Day & Sunset Viewing",
        description: "Leisure and relaxation",
        activities: [
          { time: "08:00", activity: "Breakfast", location: "Resort" },
          { time: "10:00", activity: "Beach Relaxation or Optional Activities", location: "Resort/Town" },
          { time: "17:30", activity: "Sunset at Las Cabanas Beach", location: "Las Cabanas" },
          { time: "19:30", activity: "Farewell Dinner", location: "Beachfront Restaurant" },
        ]
      },
      {
        day: 5,
        title: "Departure",
        description: "Journey home",
        activities: [
          { time: "06:00", activity: "Early Breakfast", location: "Resort" },
          { time: "07:00", activity: "Check-out & Transfer to Puerto Princesa", location: "Puerto Princesa" },
          { time: "13:00", activity: "Departure Flight", location: "Puerto Princesa Airport" },
        ]
      },
    ],
    inclusions: ["Accommodation (4 nights)", "Daily Breakfast", "Island Tours A & C", "Van Transfers", "Tour Guide"],
    exclusions: ["Airfare", "Eco-tourism Fees", "Lunch & Dinner", "Optional Tours"],
    pricing: {
      basePrice: 62000,
      breakdown: [
        { item: "Accommodation (4 nights)", amount: 32000 },
        { item: "Island Tours A & C", amount: 12000 },
        { item: "Van Transfer (Round Trip)", amount: 10000 },
        { item: "Tour Guide Services", amount: 5000 },
        { item: "Environmental Fees", amount: 3000 },
      ]
    }
  },
  "BV-2025-003": {
    id: "BV-2025-003",
    destination: "Baguio City, Benguet",
    duration: "3 Days / 2 Nights",
    description: "Enjoy the cool mountain breeze and scenic views of the Summer Capital",
    destinations: ["Baguio City", "Mines View Park", "Burnham Park"],
    days: [
      {
        day: 1,
        title: "City Tour",
        description: "Explore Baguio's famous landmarks",
        activities: [
          { time: "08:00", activity: "Arrival & Check-in", location: "Hotel" },
          { time: "10:00", activity: "Mines View Park", location: "Mines View" },
          { time: "12:00", activity: "Lunch at Good Taste", location: "Good Taste Restaurant" },
          { time: "14:00", activity: "The Mansion & Wright Park", location: "The Mansion" },
          { time: "16:00", activity: "Burnham Park Boat Ride", location: "Burnham Park" },
          { time: "19:00", activity: "Dinner at Hill Station", location: "Hill Station" },
        ]
      },
      {
        day: 2,
        title: "Nature & Culture",
        description: "Experience Baguio's natural beauty",
        activities: [
          { time: "07:00", activity: "Breakfast", location: "Hotel" },
          { time: "09:00", activity: "Strawberry Farm Picking", location: "La Trinidad" },
          { time: "11:00", activity: "BenCab Museum", location: "Tuba" },
          { time: "13:00", activity: "Lunch at Café by the Ruins", location: "Café by the Ruins" },
          { time: "15:00", activity: "Session Road Shopping", location: "Session Road" },
          { time: "18:00", activity: "Night Market", location: "Harrison Road" },
        ]
      },
      {
        day: 3,
        title: "Departure",
        description: "Last day in the city",
        activities: [
          { time: "07:00", activity: "Breakfast", location: "Hotel" },
          { time: "09:00", activity: "Check-out & Baguio Cathedral", location: "Baguio Cathedral" },
          { time: "11:00", activity: "Last Minute Shopping", location: "SM Baguio" },
          { time: "13:00", activity: "Departure", location: "Baguio City" },
        ]
      },
    ],
    inclusions: ["Accommodation (2 nights)", "Daily Breakfast", "City Tour", "Transportation"],
    exclusions: ["Airfare/Bus Fare", "Lunch & Dinner", "Entrance Fees", "Personal Expenses"],
    pricing: {
      basePrice: 38750,
      breakdown: [
        { item: "Accommodation (2 nights)", amount: 18000 },
        { item: "City Tour Package", amount: 9750 },
        { item: "Transportation", amount: 7000 },
        { item: "Tour Guide Services", amount: 4000 },
      ]
    }
  },
  "BV-2025-004": {
    id: "BV-2025-004",
    destination: "Oslob, Cebu",
    duration: "3 Days / 2 Nights",
    description: "Swim with whale sharks and explore Cebu's southern treasures",
    destinations: ["Oslob", "Tumalog Falls", "Sumilon Island"],
    days: [
      {
        day: 1,
        title: "Whale Shark Encounter",
        description: "Once in a lifetime experience",
        activities: [
          { time: "04:00", activity: "Early Pickup from Hotel", location: "Cebu City" },
          { time: "07:00", activity: "Whale Shark Watching", location: "Oslob" },
          { time: "09:00", activity: "Tumalog Falls", location: "Tumalog Falls" },
          { time: "11:00", activity: "Lunch", location: "Local Restaurant" },
          { time: "13:00", activity: "Check-in at Resort", location: "Oslob Resort" },
          { time: "15:00", activity: "Beach Relaxation", location: "Resort Beach" },
          { time: "19:00", activity: "Dinner", location: "Resort Restaurant" },
        ]
      },
      {
        day: 2,
        title: "Island Hopping & Heritage Tour",
        description: "Sumilon Island and Simala Shrine",
        activities: [
          { time: "07:00", activity: "Breakfast", location: "Resort" },
          { time: "08:00", activity: "Sumilon Island Hopping", location: "Sumilon Island" },
          { time: "13:00", activity: "Lunch on Island", location: "Sumilon" },
          { time: "15:00", activity: "Return to Resort", location: "Resort" },
          { time: "16:30", activity: "Simala Shrine Visit", location: "Simala Shrine" },
          { time: "19:00", activity: "Dinner", location: "Local Restaurant" },
        ]
      },
      {
        day: 3,
        title: "Departure",
        description: "Return to Cebu City",
        activities: [
          { time: "07:00", activity: "Breakfast", location: "Resort" },
          { time: "09:00", activity: "Check-out", location: "Resort" },
          { time: "10:00", activity: "Travel to Cebu City", location: "Cebu City" },
          { time: "14:00", activity: "Drop-off at Hotel/Airport", location: "Cebu" },
        ]
      },
    ],
    inclusions: ["Accommodation (2 nights)", "Daily Breakfast", "Whale Shark Watching", "Sumilon Island Tour", "Transportation"],
    exclusions: ["Airfare", "Lunch & Dinner", "Environmental Fees", "Optional Activities"],
    pricing: {
      basePrice: 45200,
      breakdown: [
        { item: "Accommodation (2 nights)", amount: 16000 },
        { item: "Whale Shark Experience", amount: 12000 },
        { item: "Sumilon Island Tour", amount: 8000 },
        { item: "Transportation (Round Trip)", amount: 6200 },
        { item: "Tour Guide Services", amount: 3000 },
      ]
    }
  },
  "BV-2025-005": {
  id: "BV-2025-005",
  destination: "Siargao Island, Surigao del Norte",
  duration: "5 Days / 4 Nights",
  description: "Experience the surfing capital of the Philippines with pristine beaches and vibrant island life",
  destinations: ["Cloud 9", "General Luna", "Sohoton Cove", "Magpupungko Rock Pools"],
  days: [
    {
      day: 1,
      title: "Arrival & Island Orientation",
      description: "Settle in and explore General Luna",
      activities: [
        { time: "08:00", activity: "Arrival at Sayak Airport", location: "Sayak Airport" },
        { time: "09:30", activity: "Transfer to Resort", location: "General Luna" },
        { time: "11:00", activity: "Resort Check-in", location: "Beach Resort" },
        { time: "14:00", activity: "Island Orientation Tour", location: "General Luna" },
        { time: "18:00", activity: "Sunset at Cloud 9 Boardwalk", location: "Cloud 9" },
        { time: "19:30", activity: "Welcome Dinner", location: "Beachfront Restaurant" },
      ]
    },
    {
      day: 2,
      title: "Surfing Lessons & Beach Hopping",
      description: "Learn to surf and explore nearby islands",
      activities: [
        { time: "07:00", activity: "Breakfast", location: "Resort" },
        { time: "08:30", activity: "Surfing Lessons at Cloud 9", location: "Cloud 9" },
        { time: "12:00", activity: "Lunch", location: "Local Restaurant" },
        { time: "14:00", activity: "Beach Hopping Tour", location: "Guyam, Daku, Naked Islands" },
        { time: "17:00", activity: "Return to Resort", location: "Resort" },
        { time: "19:00", activity: "Dinner", location: "General Luna" },
      ]
    },
    {
      day: 3,
      title: "Sohoton Cove Adventure",
      description: "Explore caves and lagoons",
      activities: [
        { time: "06:00", activity: "Early Breakfast", location: "Resort" },
        { time: "07:00", activity: "Boat to Sohoton Cove", location: "Sohoton Cove" },
        { time: "09:00", activity: "Cave Exploration", location: "Sohoton Caves" },
        { time: "11:00", activity: "Swimming with Jellyfish", location: "Jellyfish Sanctuary" },
        { time: "13:00", activity: "Lunch on Island", location: "Sohoton" },
        { time: "15:00", activity: "Lagoon Hopping", location: "Sohoton Lagoons" },
        { time: "17:00", activity: "Return to Resort", location: "Resort" },
      ]
    },
    {
      day: 4,
      title: "Magpupungko & Free Time",
      description: "Tidal pools and leisure",
      activities: [
        { time: "08:00", activity: "Breakfast", location: "Resort" },
        { time: "09:30", activity: "Magpupungko Rock Pools", location: "Pilar" },
        { time: "12:00", activity: "Lunch", location: "Local Restaurant" },
        { time: "14:00", activity: "Free Time for Shopping or Relaxation", location: "General Luna" },
        { time: "18:00", activity: "Farewell Dinner", location: "Beachfront Restaurant" },
      ]
    },
    {
      day: 5,
      title: "Departure",
      description: "Last surf and departure",
      activities: [
        { time: "07:00", activity: "Breakfast", location: "Resort" },
        { time: "08:30", activity: "Optional Morning Surf Session", location: "Cloud 9" },
        { time: "10:30", activity: "Check-out", location: "Resort" },
        { time: "11:30", activity: "Transfer to Airport", location: "Sayak Airport" },
        { time: "13:00", activity: "Departure Flight", location: "Sayak Airport" },
      ]
    },
  ],
  inclusions: ["Accommodation (4 nights)", "Daily Breakfast", "Surfing Lessons", "Island Hopping Tours", "Sohoton Cove Tour", "Airport Transfers"],
  exclusions: ["Airfare", "Lunch & Dinner", "Surfboard Rental", "Personal Expenses"],
  pricing: {
    basePrice: 72000,
    breakdown: [
      { item: "Accommodation (4 nights)", amount: 35000 },
      { item: "Surfing Lessons & Equipment", amount: 8000 },
      { item: "Sohoton Cove Tour", amount: 12000 },
      { item: "Island Hopping Tours", amount: 9000 },
      { item: "Transportation & Transfers", amount: 8000 },
    ]
  }
},
};

export function UserBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  const { profileData } = useProfile();

  // Payment states
  const [paymentType, setPaymentType] = useState<"" | "Full Payment" | "Partial Payment">("");
  const [modeOfPayment, setModeOfPayment] = useState<"" | "Cash" | "Gcash">("");
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [gcashModalOpen, setGcashModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [cashConfirmation, setCashConfirmation] = useState<File | null>(null);
  const [cashConfirmationPreview, setCashConfirmationPreview] = useState<string>("");
  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qr'); // 'qr' or 'manual'
  const [cashTab, setCashTab] = useState('receipt'); // 'receipt' or 'upload'
  const [isProcessing, setIsProcessing] = useState(false);
  // Add this new state
  const [selectedPayment, setSelectedPayment] = useState<PaymentSubmission | null>(null);
  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);

  // Add these new states at the top with other state declarations
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [pendingCancelAction, setPendingCancelAction] = useState<(() => void) | null>(null);

  // Payment settings from localStorage (admin EditProfile)
  const [paymentSettings, setPaymentSettings] = useState(() => {
    const saved = localStorage.getItem('paymentSettings');
    return saved ? JSON.parse(saved) : {
      accountName: "4B'S TRAVEL AND TOURS",
      gcashMobile: '0994 631 1233',
      gcashQrCode: ''
    };
  });

  // Find booking from localStorage or default data
  const [bookingData, setBookingData] = useState<Booking | null>(null);

  useEffect(() => {
    // Load from localStorage or default
    const savedBookings = localStorage.getItem('userStandardBookings');
    let found: Booking | undefined;
    
    if (savedBookings) {
      const parsedBookings = JSON.parse(savedBookings);
      found = parsedBookings.find((b: any) => b.id === id);
    }
    
    if (!found) {
      found = bookingsData.find(b => b.id === id);
    }

    if (found) {
      setBookingData(found);
    }
  }, [id]);

  const booking = bookingData;
  const itinerary = id ? itineraryData[id] : null;

  // Add this function to handle cancel actions
  const handleCancelWithConfirmation = (action: () => void) => {
    if (proofOfPayment || cashConfirmation) {
      // Show confirmation modal if there's an uploaded file
      setPendingCancelAction(() => action);
      setShowCancelConfirmation(true);
    } else {
      // Proceed directly if no files uploaded
      action();
    }
  };

  // Add this function to handle confirmed cancellation
  const handleConfirmedCancel = () => {
    if (pendingCancelAction) {
      // Clear all uploaded files
      setProofOfPayment(null);
      setProofPreview("");
      setCashConfirmation(null);
      setCashConfirmationPreview("");
      
      // Execute the pending cancel action
      pendingCancelAction();
      
      // Reset states
      setPendingCancelAction(null);
      setShowCancelConfirmation(false);
      
      toast.info("Payment process cancelled and uploaded files cleared");
    }
  };

  // Add this function to handle cancellation of the cancellation
  const handleCancelCancellation = () => {
    setPendingCancelAction(null);
    setShowCancelConfirmation(false);
    toast("Payment process continued");
  };

  // Handle payment history item click
  const handlePaymentItemClick = (payment: PaymentSubmission) => {
    setSelectedPayment(payment);
    setPaymentDetailModalOpen(true);
  };

  // GCash-themed Confetti Function
  const launchGCashConfetti = () => {
    const colors = ['#0A7AFF', '#00B2FF', '#10B981', '#FFFFFF', '#FFD700'];
    
    confetti({
      particleCount: 150,
      angle: 90,
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
      colors: colors,
      shapes: ['circle', 'square']
    });
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    toast.success("GCash number copied to clipboard!");
  };

  // Enhanced Amount Input Validation
  const handlePartialAmountChange = (value: string) => {
    if (!editingPayment) return;
    
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimal points
    const decimalCount = (numericValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;
    
    // Parse the numeric value
    const amount = parseFloat(numericValue) || 0;
    
    // Validation rules
    if (amount === 0 && numericValue !== '') {
      toast.error("Amount cannot be 0");
      return;
    }
    
    if (amount > balance) {
      toast.error(`Amount cannot exceed remaining balance of ₱${balance.toLocaleString()}`);
      return;
    }
    
    if (amount < 0) {
      toast.error("Amount cannot be negative");
      return;
    }
    
    // Set the validated value
    setPartialAmount(numericValue);
  };

  // Submit payment to admin
  const handleSubmitPayment = () => {
    if (!booking || !paymentType || !modeOfPayment) {
      toast.error("Please complete all payment fields");
      return;
    }

    if (paymentType === "Partial Payment") {
      const amount = parseFloat(partialAmount) || 0;
      
      // Additional validation
      if (amount === 0) {
        toast.error("Amount cannot be 0");
        return;
      }
      
      if (amount > balance) {
        toast.error(`Amount cannot exceed remaining balance of ₱${balance.toLocaleString()}`);
        return;
      }
      
      if (amount < 1) {
        toast.error("Minimum payment amount is ₱1");
        return;
      }
    }

    const totalAmount = parseFloat(booking.amount.replace(/[₱,]/g, ''));
    const currentTotalPaid = booking.totalPaid || 0;
    const paymentAmount = paymentType === "Full Payment" 
      ? totalAmount - currentTotalPaid 
      : parseFloat(partialAmount);

    // Create payment submission
    const submission: PaymentSubmission = {
      id: `PAY-${Date.now()}`,
      paymentType,
      amount: paymentAmount,
      modeOfPayment,
      proofOfPayment: modeOfPayment === "Gcash" ? proofPreview : undefined,
      cashConfirmation: modeOfPayment === "Cash" ? cashConfirmationPreview : undefined,
      submittedAt: new Date().toISOString(),
    };

    const updatedPaymentHistory = [...(booking.paymentHistory || []), submission];
    const updatedTotalPaid = currentTotalPaid + paymentAmount;

    // Determine new payment status
    let newPaymentStatus: "Paid" | "Partial" | "Unpaid" = "Unpaid";
    if (updatedTotalPaid >= totalAmount) {
      newPaymentStatus = "Paid";
    } else if (updatedTotalPaid > 0) {
      newPaymentStatus = "Partial";
    }

    const updates = {
      paymentHistory: updatedPaymentHistory,
      totalPaid: updatedTotalPaid,
      paymentStatus: newPaymentStatus
    };

    const updatedBooking = { ...booking, ...updates };
    setBookingData(updatedBooking);

    // Save to user bookings localStorage
    const savedBookings = localStorage.getItem('userStandardBookings');
    if (savedBookings) {
      const parsedBookings = JSON.parse(savedBookings);
      const updatedBookings = parsedBookings.map((b: Booking) =>
        b.id === booking.id ? updatedBooking : b
      );
      localStorage.setItem('userStandardBookings', JSON.stringify(updatedBookings));
    }

    // Sync to admin bookings localStorage
    const adminBookings = localStorage.getItem('adminStandardBookings');
    if (adminBookings) {
      const parsedAdminBookings = JSON.parse(adminBookings);
      const updatedAdminBookings = parsedAdminBookings.map((b: any) =>
        b.id === booking.id ? { ...b, ...updates } : b
      );
      localStorage.setItem('adminStandardBookings', JSON.stringify(updatedAdminBookings));
    }

    // Reset form if partial payment
    if (paymentType === "Partial Payment") {
      setPaymentType("");
      setModeOfPayment("");
      setPartialAmount("");
      setProofOfPayment(null);
      setProofPreview("");
      setCashConfirmation(null);
      setCashConfirmationPreview("");
    }

    setEditingPayment(false);
    
    toast.success("Payment submitted successfully!");
  };

  const handlePaymentTypeChange = (value: "" | "Full Payment" | "Partial Payment") => {
    if (!editingPayment) return;
    setPaymentType(value);
    
    if (value !== "Partial Payment") {
      setPartialAmount("");
    }
  };

  const handleModeOfPaymentClick = (mode: "Cash" | "Gcash") => {
    if (!editingPayment) return;
    setModeOfPayment(mode);

    if (mode === "Cash") {
      setCashTab('receipt'); // Always start with receipt tab
      setReceiptModalOpen(true);
    } else if (mode === "Gcash") {
      setGcashModalOpen(true);
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setProofOfPayment(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProofPreview(result);
      };
      reader.readAsDataURL(file);
      toast.success("Proof of payment uploaded successfully!");
    }
  };

  const handleCashConfirmationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCashConfirmation(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCashConfirmationPreview(result);
      };
      reader.readAsDataURL(file);
      toast.success("Payment confirmation uploaded successfully!");
    } else {
      toast.error("Please upload an image file");
    }
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      // Add loading toast
      toast.loading("Preparing receipt download...");

      // Wait a bit to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(receiptRef.current, {
        scale: 3, // Higher resolution for better quality
        backgroundColor: '#ffffff',
        useCORS: true, // Enable CORS for external images
        allowTaint: true, // Allow cross-origin images
        logging: false, // Disable console logging
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight,
        windowWidth: 10000,
        windowHeight: receiptRef.current.scrollHeight,
        imageTimeout: 0, // No timeout for image loading
        removeContainer: false,
      });

      const link = document.createElement('a');
      link.download = `Cash-Receipt-${booking?.id}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality
      link.click();

      // Dismiss loading toast
      toast.dismiss();
      toast.success("Receipt downloaded successfully!");
      setReceiptModalOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download receipt");
      console.error("Download error:", error);
    }
  };

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl text-card-foreground mb-2">Booking Not Found</h2>
          <p className="text-muted-foreground mb-6">The booking you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate("/user/bookings")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white hover:shadow-lg transition-all"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate("/user/bookings");
  };

  const totalAmount = parseFloat(booking.amount.replace(/[₱,]/g, ''));
  const partialAmountNum = parseFloat(partialAmount) || 0;
  const balance = totalAmount - (booking.totalPaid || 0);
  const progressPercent = Math.round(((booking.totalPaid || 0) / totalAmount) * 100);

  // Determine which payment state to show based on paymentStatus
  const getPaymentSectionState = () => {
    if (booking.paymentStatus === "Paid") {
      return "fullyPaid";
    } else if (booking.paymentStatus === "Partial") {
      return "partial";
    } else {
      return "unpaid";
    }
  };

  const paymentSectionState = getPaymentSectionState();

  const getInitials = () => {
  const words = profileData.companyName.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return profileData.companyName.substring(0, 2).toUpperCase();
};

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
          <h2 className="text-[#1A2B4F] dark:text-white font-semibold">{booking.itinerary}</h2>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Booking Details</p>
        </div>
      </div>

      {/* Booking Header Card */}
      <div className="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold">{booking.itinerary}</h1>
              {/* Payment Status Badge */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.paymentStatus === "Paid" 
                  ? "bg-[#10B981] text-white" 
                  : booking.paymentStatus === "Partial"
                  ? "bg-[#F59E0B] text-white"
                  : "bg-[#EF4444] text-white"
              }`}>
                {booking.paymentStatus === "Paid" ? "Paid" : 
                 booking.paymentStatus === "Partial" ? "Partial Payment" : "Unpaid"}
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-lg">{booking.destination}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Booking ID</p>
            <p className="text-2xl font-semibold">{booking.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <CalendarIcon className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Travel Dates</p>
            <p className="font-medium">{booking.dates}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Users className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Travelers</p>
            <p className="font-medium">{booking.travelers} {booking.travelers > 1 ? 'People' : 'Person'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <CreditCard className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Total Amount</p>
            <p className="font-medium">{booking.amount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Clock className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-white/80 text-xs mb-1">Booked On</p>
            <p className="font-medium">{booking.bookingDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFB] to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-[#1A2B4F]">Customer Information</h3>
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
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
            {/* Header with gradient accent */}
            <div className="relative p-6 border-b border-[#E5E7EB]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 via-[#14B8A6]/5 to-[#0A7AFF]/5" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A2B4F] text-lg">Payment Information</h3>
                    <p className="text-sm text-[#64748B]">Track your payment progress</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* UNPAID STATE - Initial state with no payments made */}
              {paymentSectionState === "unpaid" && (
                <>
                  {balance > 0 ? (
                    editingPayment ? (
                      /* EDITING STATE - Original form fields */
                      <>
                        {/* Payment Type Dropdown */}
                        <div>
                          <Label htmlFor="payment-type" className="text-[#1A2B4F] mb-2 block">Payment Type</Label>
                          <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
                            <SelectTrigger id="payment-type" className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10">
                              <SelectValue placeholder="Choose payment type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full Payment">Full Payment</SelectItem>
                              <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* For Full Payment - Show mode of payment immediately */}
                        {paymentType === "Full Payment" && (
                          <div>
                            <Label className="text-[#1A2B4F] mb-2 block">Mode of Payment</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => handleModeOfPaymentClick("Cash")}
                                className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                                  modeOfPayment === "Cash"
                                    ? "border-[#10B981] bg-[rgba(16,185,129,0.1)] text-[#10B981]"
                                    : "border-[#E5E7EB] text-[#64748B] hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.05)]"
                                }`}
                              >
                                <Banknote className="w-5 h-5" />
                                Cash
                              </button>
                              <button
                                onClick={() => handleModeOfPaymentClick("Gcash")}
                                className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                                  modeOfPayment === "Gcash"
                                    ? "border-[#0A7AFF] bg-[rgba(10,122,255,0.1)] text-[#0A7AFF]"
                                    : "border-[#E5E7EB] text-[#64748B] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
                                }`}
                              >
                                <Smartphone className="w-5 h-5" />
                                Gcash
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Amount Input for Partial Payment with Enhanced Validation */}
                        {paymentType === "Partial Payment" && (
                          <div>
                            <Label htmlFor="amount" className="text-[#1A2B4F] mb-2 block">
                              Amount
                              <span className="text-[#FF6B6B] ml-1">*</span>
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">₱</span>
                              <Input
                                id="amount"
                                type="text" // Changed to text to handle formatting
                                value={partialAmount}
                                onChange={(e) => handlePartialAmountChange(e.target.value)}
                                placeholder="0.00"
                                className={`h-11 pl-8 border-2 focus:ring-[#0A7AFF]/10 transition-all ${
                                  partialAmount && (parseFloat(partialAmount) === 0 || parseFloat(partialAmount) > balance)
                                    ? "border-[#FF6B6B] focus:border-[#FF6B6B]"
                                    : partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) <= balance
                                    ? "border-[#10B981] focus:border-[#10B981]"
                                    : "border-[#E5E7EB] focus:border-[#0A7AFF]"
                                }`}
                                onBlur={(e) => {
                                  // Format the value on blur
                                  if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                    const formatted = parseFloat(e.target.value).toFixed(2);
                                    setPartialAmount(formatted);
                                  }
                                }}
                              />
                            </div>
                            
                            {/* Validation Messages */}
                            <div className="mt-2 space-y-1">
                              {partialAmount && parseFloat(partialAmount) === 0 && (
                                <p className="text-xs text-[#FF6B6B] flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Amount cannot be 0
                                </p>
                              )}
                              {partialAmount && parseFloat(partialAmount) > balance && (
                                <p className="text-xs text-[#FF6B6B] flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Amount exceeds remaining balance
                                </p>
                              )}
                              {partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) <= balance && (
                                <p className="text-xs text-[#10B981] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Valid amount
                                </p>
                              )}
                            </div>

                            {/* Mode of Payment for Partial Payment - Only show when amount is valid */}
                            {partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) <= balance && (
                              <div className="mt-4">
                                <Label className="text-[#1A2B4F] mb-2 block">Mode of Payment</Label>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    onClick={() => handleModeOfPaymentClick("Cash")}
                                    className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                                      modeOfPayment === "Cash"
                                        ? "border-[#10B981] bg-[rgba(16,185,129,0.1)] text-[#10B981]"
                                        : "border-[#E5E7EB] text-[#64748B] hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.05)]"
                                    }`}
                                  >
                                    <Banknote className="w-5 h-5" />
                                    Cash
                                  </button>
                                  <button
                                    onClick={() => handleModeOfPaymentClick("Gcash")}
                                    className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                                      modeOfPayment === "Gcash"
                                        ? "border-[#0A7AFF] bg-[rgba(10,122,255,0.1)] text-[#0A7AFF]"
                                        : "border-[#E5E7EB] text-[#64748B] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
                                    }`}
                                  >
                                    <Smartphone className="w-5 h-5" />
                                    Gcash
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cash Payment Confirmation Upload - Only show when there's an uploaded file */}
                        {modeOfPayment === "Cash" && cashConfirmationPreview && (
                          <div>
                            <Label className="text-[#1A2B4F] mb-2 block">Proof of Payment</Label>
                            <div className="relative border-2 border-[#E5E7EB] rounded-xl overflow-hidden">
                              <img 
                                src={cashConfirmationPreview} 
                                alt="Cash payment confirmation" 
                                className="w-full max-h-96 object-contain bg-[#F8FAFB]"
                              />
                              <button
                                onClick={() => {
                                  setCashConfirmation(null);
                                  setCashConfirmationPreview("");
                                }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center hover:bg-[#FF5252] transition-all shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-[#10B981] mt-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Payment confirmation uploaded
                            </p>
                          </div>
                        )}

                        {/* Gcash Proof of Payment Preview */}
                        {modeOfPayment === "Gcash" && proofPreview && (
                          <div>
                            <Label className="text-[#1A2B4F] mb-2 block">Proof of Payment</Label>
                            <div className="relative border-2 border-[#E5E7EB] rounded-xl overflow-hidden">
                              <img 
                                src={proofPreview} 
                                alt="Gcash proof of payment" 
                                className="w-full max-h-96 object-contain bg-[#F8FAFB]"
                              />
                              <button
                                onClick={() => {
                                  setProofOfPayment(null);
                                  setProofPreview("");
                                }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center hover:bg-[#FF5252] transition-all shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-[#10B981] mt-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Proof of payment uploaded
                            </p>
                          </div>
                        )}

                        {/* Payment Summary in Edit Mode */}
                        <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#64748B]">Total Amount</span>
                            <span className="font-semibold text-[#1A2B4F]">{booking.amount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#64748B]">Amount to Pay</span>
                            <span className="font-semibold text-[#10B981]">
                              {paymentType === "Partial Payment"
                                ? `₱${partialAmountNum.toLocaleString()}`
                                : paymentType === "Full Payment"
                                  ? `₱${balance.toLocaleString()}`
                                  : `₱${balance.toLocaleString()}`
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB]">
                            <span className="text-sm font-medium text-[#1A2B4F]">Balance After</span>
                            <span className="font-semibold text-[#FF6B6B]">
                              ₱{(balance - (paymentType === "Partial Payment" ? partialAmountNum : paymentType === "Full Payment" ? balance : 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Submit Button with Enhanced Validation */}
                        {paymentType && modeOfPayment && (
                          <div className="pt-4 border-t border-[#E5E7EB]">
                            <button
                              onClick={handleSubmitPayment}
                              disabled={
                                (modeOfPayment === "Gcash" && !proofOfPayment) ||
                                (modeOfPayment === "Cash" && !cashConfirmation) ||
                                (paymentType === "Partial Payment" && (
                                  !partialAmount || 
                                  parseFloat(partialAmount) === 0 || 
                                  parseFloat(partialAmount) > balance
                                ))
                              }
                              className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#10B981]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                            >
                              <Save className="w-4 h-4" />
                              Submit Payment
                            </button>
                          </div>
                        )}

                        {/* Cancel Edit Button */}
                        <button
                          onClick={() => handleCancelWithConfirmation(() => {
                            setEditingPayment(false);
                            setPaymentType("");
                            setModeOfPayment("");
                            setPartialAmount("");
                            setProofOfPayment(null);
                            setProofPreview("");
                            setCashConfirmation(null);
                            setCashConfirmationPreview("");
                          })}
                          className="w-full h-10 px-4 rounded-xl border border-[#E5E7EB] text-[#64748B] font-medium hover:bg-[#F8FAFB] transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      /* INITIAL STATE - No payments made yet */
                      <>
                        {/* Empty state for unpaid bookings */}
                        <div className="text-center py-8">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#F8FAFB] to-[#E5E7EB] rounded-full flex items-center justify-center">
                            <Wallet className="w-8 h-8 text-[#64748B]" />
                          </div>
                          <h4 className="text-lg font-semibold text-[#1A2B4F] mb-2">No Payments Made</h4>
                          <p className="text-sm text-[#64748B] mb-6">
                            Start your payment process to secure your booking
                          </p>
                          
                          {/* Payment Summary Card */}
                          <div className="bg-gradient-to-br from-[#F8FAFB] to-[#F1F5F9] rounded-2xl p-5 border border-[#E5E7EB] mb-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-[#64748B]">Total Package Cost</span>
                                <span className="font-bold text-[#1A2B4F] text-lg">{booking.amount}</span>
                              </div>
                              
                              <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
                              
                              <div className="flex justify-between items-center pt-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                                  <span className="text-sm font-medium text-[#1A2B4F]">Outstanding Balance</span>
                                </div>
                                <span className="font-bold text-[#EF4444] text-lg">
                                  ₱{balance.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Make Payment CTA */}
                          <button
                            onClick={() => setEditingPayment(true)}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#0A7AFF] via-[#0A7AFF] to-[#14B8A6] text-white font-semibold shadow-lg shadow-[#0A7AFF]/30 hover:shadow-xl hover:shadow-[#0A7AFF]/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                          >
                            Make First Payment
                          </button>
                        </div>
                      </>
                    )
                  ) : (
                    /* This case shouldn't happen for unpaid status, but included for safety */
                    <div className="text-center py-8">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#10B981] to-[#14B8A6] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-[#1A2B4F] mb-2">Fully Paid</h4>
                      <p className="text-sm text-[#64748B] mb-6">This booking has been completely paid.</p>
                    </div>
                  )}
                </>
              )}

              {/* PARTIAL PAYMENT STATE - Ongoing payments */}
              {paymentSectionState === "partial" && (
                <>
                  {balance > 0 ? (
                    editingPayment ? (
                      /* EDITING STATE - Same as unpaid editing state */
                      <>
                        {/* Payment Type Dropdown */}
                        <div>
                          <Label htmlFor="payment-type" className="text-[#1A2B4F] mb-2 block">Payment Type</Label>
                          <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
                            <SelectTrigger id="payment-type" className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10">
                              <SelectValue placeholder="Choose payment type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full Payment">Full Payment</SelectItem>
                              <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* For Full Payment - Show mode of payment immediately */}
                        {paymentType === "Full Payment" && (
                          <div>
                            <Label className="text-[#1A2B4F] mb-2 block">Mode of Payment</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => handleModeOfPaymentClick("Cash")}
                                className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                                  modeOfPayment === "Cash"
                                    ? "border-[#10B981] bg-[rgba(16,185,129,0.1)] text-[#10B981]"
                                    : "border-[#E5E7EB] text-[#64748B] hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.05)]"
                                }`}
                              >
                                <Banknote className="w-5 h-5" />
                                Cash
                              </button>
                              <button
                                onClick={() => handleModeOfPaymentClick("Gcash")}
                                className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                                  modeOfPayment === "Gcash"
                                    ? "border-[#0A7AFF] bg-[rgba(10,122,255,0.1)] text-[#0A7AFF]"
                                    : "border-[#E5E7EB] text-[#64748B] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
                                }`}
                              >
                                <Smartphone className="w-5 h-5" />
                                Gcash
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Amount Input for Partial Payment with Enhanced Validation */}
                        {paymentType === "Partial Payment" && (
                          <div>
                            <Label htmlFor="amount" className="text-[#1A2B4F] mb-2 block">
                              Amount
                              <span className="text-[#FF6B6B] ml-1">*</span>
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">₱</span>
                              <Input
                                id="amount"
                                type="text"
                                value={partialAmount}
                                onChange={(e) => handlePartialAmountChange(e.target.value)}
                                placeholder="0.00"
                                className={`h-11 pl-8 border-2 focus:ring-[#0A7AFF]/10 transition-all ${
                                  partialAmount && (parseFloat(partialAmount) === 0 || parseFloat(partialAmount) > balance)
                                    ? "border-[#FF6B6B] focus:border-[#FF6B6B]"
                                    : partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) <= balance
                                    ? "border-[#10B981] focus:border-[#10B981]"
                                    : "border-[#E5E7EB] focus:border-[#0A7AFF]"
                                }`}
                                onBlur={(e) => {
                                  if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                    const formatted = parseFloat(e.target.value).toFixed(2);
                                    setPartialAmount(formatted);
                                  }
                                }}
                              />
                            </div>
                            
                            {/* Validation Messages */}
                            <div className="mt-2 space-y-1">
                              {partialAmount && parseFloat(partialAmount) === 0 && (
                                <p className="text-xs text-[#FF6B6B] flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Amount cannot be 0
                                </p>
                              )}
                              {partialAmount && parseFloat(partialAmount) > balance && (
                                <p className="text-xs text-[#FF6B6B] flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Amount exceeds remaining balance
                                </p>
                              )}
                              {partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) <= balance && (
                                <p className="text-xs text-[#10B981] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Valid amount
                                </p>
                              )}
                            </div>

                            {/* Mode of Payment for Partial Payment - Only show when amount is valid */}
                            {partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) <= balance && (
                              <div className="mt-4">
                                <Label className="text-[#1A2B4F] mb-2 block">Mode of Payment</Label>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    onClick={() => handleModeOfPaymentClick("Cash")}
                                    className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                                      modeOfPayment === "Cash"
                                        ? "border-[#10B981] bg-[rgba(16,185,129,0.1)] text-[#10B981]"
                                        : "border-[#E5E7EB] text-[#64748B] hover:border-[#10B981] hover:bg-[rgba(16,185,129,0.05)]"
                                    }`}
                                  >
                                    <Banknote className="w-5 h-5" />
                                    Cash
                                  </button>
                                  <button
                                    onClick={() => handleModeOfPaymentClick("Gcash")}
                                    className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                                      modeOfPayment === "Gcash"
                                        ? "border-[#0A7AFF] bg-[rgba(10,122,255,0.1)] text-[#0A7AFF]"
                                        : "border-[#E5E7EB] text-[#64748B] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
                                    }`}
                                  >
                                    <Smartphone className="w-5 h-5" />
                                    Gcash
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cash Payment Confirmation Upload - Only show when there's an uploaded file */}
                        {modeOfPayment === "Cash" && cashConfirmationPreview && (
                          <div>
                            <Label className="text-[#1A2B4F] mb-2 block">Proof of Payment</Label>
                            <div className="relative border-2 border-[#E5E7EB] rounded-xl overflow-hidden">
                              <img 
                                src={cashConfirmationPreview} 
                                alt="Cash payment confirmation" 
                                className="w-full max-h-96 object-contain bg-[#F8FAFB]"
                              />
                              <button
                                onClick={() => {
                                  setCashConfirmation(null);
                                  setCashConfirmationPreview("");
                                }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center hover:bg-[#FF5252] transition-all shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-[#10B981] mt-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Payment confirmation uploaded
                            </p>
                          </div>
                        )}

                        {/* Gcash Proof of Payment Preview */}
                        {modeOfPayment === "Gcash" && proofPreview && (
                          <div>
                            <Label className="text-[#1A2B4F] mb-2 block">Proof of Payment</Label>
                            <div className="relative border-2 border-[#E5E7EB] rounded-xl overflow-hidden">
                              <img 
                                src={proofPreview} 
                                alt="Gcash proof of payment" 
                                className="w-full max-h-96 object-contain bg-[#F8FAFB]"
                              />
                              <button
                                onClick={() => {
                                  setProofOfPayment(null);
                                  setProofPreview("");
                                }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center hover:bg-[#FF5252] transition-all shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-[#10B981] mt-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Proof of payment uploaded
                            </p>
                          </div>
                        )}

                        {/* Payment Summary in Edit Mode */}
                        <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#64748B]">Total Amount</span>
                            <span className="font-semibold text-[#1A2B4F]">{booking.amount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#64748B]">Amount to Pay</span>
                            <span className="font-semibold text-[#10B981]">
                              {paymentType === "Partial Payment"
                                ? `₱${partialAmountNum.toLocaleString()}`
                                : paymentType === "Full Payment"
                                  ? `₱${balance.toLocaleString()}`
                                  : `₱${balance.toLocaleString()}`
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB]">
                            <span className="text-sm font-medium text-[#1A2B4F]">Balance After</span>
                            <span className="font-semibold text-[#FF6B6B]">
                              ₱{(balance - (paymentType === "Partial Payment" ? partialAmountNum : paymentType === "Full Payment" ? balance : 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Submit Button with Enhanced Validation */}
                        {paymentType && modeOfPayment && (
                          <div className="pt-4 border-t border-[#E5E7EB]">
                            <button
                              onClick={handleSubmitPayment}
                              disabled={
                                (modeOfPayment === "Gcash" && !proofOfPayment) ||
                                (modeOfPayment === "Cash" && !cashConfirmation) ||
                                (paymentType === "Partial Payment" && (
                                  !partialAmount || 
                                  parseFloat(partialAmount) === 0 || 
                                  parseFloat(partialAmount) > balance
                                ))
                              }
                              className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#10B981]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                            >
                              <Save className="w-4 h-4" />
                              Submit Payment
                            </button>
                          </div>
                        )}

                        {/* Cancel Edit Button */}
                        <button
                          onClick={() => handleCancelWithConfirmation(() => {
                            setEditingPayment(false);
                            setPaymentType("");
                            setModeOfPayment("");
                            setPartialAmount("");
                            setProofOfPayment(null);
                            setProofPreview("");
                            setCashConfirmation(null);
                            setCashConfirmationPreview("");
                          })}
                          className="w-full h-10 px-4 rounded-xl border border-[#E5E7EB] text-[#64748B] font-medium hover:bg-[#F8FAFB] transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      /* NON-EDITING STATE - Enhanced Visual Display for Partial Payments */
                      <>
                        {/* Circular Progress & Stats */}
                        <div className="flex items-center gap-3">
                          {/* Circular Progress - Left Side (Larger) */}
                          <div className="relative flex-shrink-0">
                            <svg className="w-32 h-32 transform -rotate-90">
                              <circle
                                cx="64" cy="64" r="56"
                                stroke="#E5E7EB"
                                strokeWidth="10"
                                fill="none"
                              />
                              <circle
                                cx="64" cy="64" r="56"
                                stroke="url(#progressGradient)"
                                strokeWidth="10"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${progressPercent * 3.52} 352`}
                                className="transition-all duration-1000 ease-out"
                              />
                              <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#10B981" />
                                  <stop offset="100%" stopColor="#14B8A6" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-[#1A2B4F]">{progressPercent}%</span>
                              <span className="text-xs text-[#64748B]">Paid</span>
                            </div>
                          </div>
                          {/* Quick Stats - Right Side */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div 
                              className="bg-gradient-to-r from-[#10B981]/10 to-[#14B8A6]/10 rounded-xl p-3 border border-[#10B981]/20"
                              style={{ 
                                background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))',
                                borderColor: 'rgba(16, 185, 129, 0.2)'
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 
                                  className="w-3.5 h-3.5 text-[#10B981]" 
                                  style={{ color: '#10B981' }}
                                />
                                <span 
                                  className="text-xs font-medium text-[#10B981]"
                                  style={{ color: '#10B981' }}
                                >
                                  Amount Paid
                                </span>
                              </div>
                              <p 
                                className="text-lg font-bold text-[#10B981]"
                                style={{ color: '#10B981' }}
                              >
                                ₱{(booking.totalPaid || 0).toLocaleString()}
                              </p>
                            </div>
                            <div 
                              className="bg-gradient-to-r from-[#EF4444]/10 to-[#F87171]/10 rounded-xl p-3 border border-[#EF4444]/20"
                              style={{ 
                                background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1))',
                                borderColor: 'rgba(239, 68, 68, 0.2)'
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Wallet 
                                  className="w-3.5 h-3.5 text-[#EF4444]" 
                                  style={{ color: '#EF4444' }}
                                />
                                <span 
                                  className="text-xs font-medium text-[#EF4444]"
                                  style={{ color: '#EF4444' }}
                                >
                                  Remaining Balance
                                </span>
                              </div>
                              <p 
                                className="text-lg font-bold text-[#EF4444]"
                                style={{ color: '#EF4444' }}
                              >
                                ₱{balance.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Breakdown Card */}
                        <div className="bg-gradient-to-br from-[#F8FAFB] to-[#F1F5F9] rounded-2xl p-5 border border-[#E5E7EB]">
                          <div className="flex items-center gap-2 mb-4">
                            <Receipt className="w-5 h-5 text-[#64748B]" />
                            <h4 className="font-semibold text-[#1A2B4F]">Payment Breakdown</h4>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[#64748B]">Total Package Cost</span>
                              <span className="font-bold text-[#1A2B4F] text-lg">{booking.amount}</span>
                            </div>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                                <span className="text-sm text-[#64748B]">Total Paid</span>
                              </div>
                              <span className="font-semibold text-[#10B981]">- ₱{(booking.totalPaid || 0).toLocaleString()}</span>
                            </div>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
                            
                            <div className="flex justify-between items-center pt-1">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"
                                  style={{ backgroundColor: '#EF4444' }}
                                />
                                <span className="text-sm font-medium text-[#1A2B4F]">Outstanding Balance</span>
                              </div>
                              <span className="font-bold text-[#EF4444] text-lg" style={{ color: '#EF4444' }}>
                                ₱{balance.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Linear Progress with milestones */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-[#0A7AFF]" />
                              <span className="text-sm font-medium text-[#1A2B4F]">Payment Progress</span>
                            </div>
                            <span className="text-sm font-bold text-[#1A2B4F]">{progressPercent}%</span>
                          </div>
                          
                          <div className="relative">
                            <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#10B981] via-[#14B8A6] to-[#0A7AFF] rounded-full transition-all duration-1000 relative"
                              style={{ 
                                width: `${progressPercent}%`,
                                background: 'linear-gradient(to right, #10B981, #14B8A6, #0A7AFF)'
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
                            </div>
                            </div>
                            
                            {/* Milestone markers */}
                            <div className="absolute top-0 left-0 right-0 h-3 flex items-center pointer-events-none">
                              {[25, 50, 75].map((milestone) => (
                                <div 
                                  key={milestone}
                                  className="absolute w-0.5 h-3 bg-[#CBD5E1]/50"
                                  style={{ left: `${milestone}%` }}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-[#94A3B8]">
                            <span>₱0</span>
                            <span>₱{(totalAmount / 2).toLocaleString()}</span>
                            <span>₱{totalAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Payment History */}
                        {booking.paymentHistory && booking.paymentHistory.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#64748B]" />
                                <h4 className="font-semibold text-[#1A2B4F]">Recent Payments</h4>
                              </div>
                              <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">{booking.paymentHistory.length} transactions</span>
                            </div>
                            
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {booking.paymentHistory.map((payment, index) => (
                                <div 
                                  key={payment.id}
                                  onClick={() => handlePaymentItemClick(payment)}
                                  className="group bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-md cursor-pointer transition-all duration-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        payment.modeOfPayment === "Gcash" 
                                          ? "bg-[#0A7AFF]/10 text-[#0A7AFF]" 
                                          : "bg-[#10B981]/10 text-[#10B981]"
                                      }`}>
                                        {payment.modeOfPayment === "Gcash" ? (
                                          <Smartphone className="w-5 h-5" />
                                        ) : (
                                          <Banknote className="w-5 h-5" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-[#1A2B4F]">
                                          Payment #{index + 1}
                                        </p>
                                        <p className="text-xs text-[#94A3B8]">
                                          {new Date(payment.submittedAt).toLocaleDateString('en-PH', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <p className="font-bold text-[#10B981]">₱{payment.amount.toLocaleString()}</p>
                                        <div className="flex items-center gap-1 justify-end">
                                          <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                          <span className="text-xs text-[#10B981]">Verified</span>
                                        </div>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#0A7AFF] transition-colors" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Make Payment CTA */}
                        <button
                          onClick={() => setEditingPayment(true)}
                          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#0A7AFF] via-[#0A7AFF] to-[#14B8A6] text-white font-semibold shadow-lg shadow-[#0A7AFF]/30 hover:shadow-xl hover:shadow-[#0A7AFF]/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                          Make a Payment
                        </button>
                      </>
                    )
                  ) : (
                    /* This case shouldn't happen for partial status, but included for safety */
                    <div className="text-center py-8">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#10B981] to-[#14B8A6] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-[#1A2B4F] mb-2">Fully Paid</h4>
                      <p className="text-sm text-[#64748B] mb-6">This booking has been completely paid.</p>
                    </div>
                  )}
                </>
              )}

              {/* FULLY PAID STATE */}
              {paymentSectionState === "fullyPaid" && (
                /* FULLY PAID STATE */
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#10B981] to-[#14B8A6] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-[#1A2B4F] mb-2">Fully Paid</h4>
                  <p className="text-sm text-[#64748B] mb-6">This booking has been completely paid.</p>
                  
                  {/* Payment Summary for Fully Paid */}
                  <div className="bg-gradient-to-br from-[#10B981]/10 to-[#14B8A6]/10 rounded-xl p-4 border border-[#10B981]/20 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B]">Total Amount Paid</span>
                      <span className="text-xl font-bold text-[#10B981]">{booking.amount}</span>
                    </div>
                  </div>
                  
                  {/* Payment History - Still show even when fully paid */}
                  {booking.paymentHistory && booking.paymentHistory.length > 0 && (
                    <div className="text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#64748B]" />
                          <h4 className="font-semibold text-[#1A2B4F]">Payment History</h4>
                        </div>
                        <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">{booking.paymentHistory.length} transactions</span>
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {booking.paymentHistory.map((payment, index) => (
                          <div 
                            key={payment.id}
                            onClick={() => handlePaymentItemClick(payment)}
                            className="group bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-md cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  payment.modeOfPayment === "Gcash" 
                                    ? "bg-[#0A7AFF]/10 text-[#0A7AFF]" 
                                    : "bg-[#10B981]/10 text-[#10B981]"
                                }`}>
                                  {payment.modeOfPayment === "Gcash" ? (
                                    <Smartphone className="w-5 h-5" />
                                  ) : (
                                    <Banknote className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#1A2B4F]">
                                    Payment #{index + 1}
                                  </p>
                                  <p className="text-xs text-[#94A3B8]">
                                    {new Date(payment.submittedAt).toLocaleDateString('en-PH', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-bold text-[#10B981]">₱{payment.amount.toLocaleString()}</p>
                                  <div className="flex items-center gap-1 justify-end">
                                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                    <span className="text-xs text-[#10B981]">Verified</span>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#0A7AFF] transition-colors" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const bookingData = {
                    id: booking.id,
                    customer: booking.customer,
                    email: booking.email,
                    mobile: booking.mobile,
                    destination: booking.destination,
                    dates: booking.dates,
                    travelers: booking.travelers,
                    total: booking.amount,
                    bookedDate: booking.bookingDate,
                  };
                  const itineraryDays = itinerary?.days || [];
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
                    customer: booking.customer,
                    email: booking.email,
                    mobile: booking.mobile,
                    destination: booking.destination,
                    dates: booking.dates,
                    travelers: booking.travelers,
                    total: booking.amount,
                    bookedDate: booking.bookingDate,
                  };
                  const itineraryDays = itinerary?.days || [];
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
          {itinerary ? (
            <ItineraryDetailDisplay itineraryData={itinerary} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No itinerary details available
            </div>
          )}
        </div>
      </div>

      {/* Cash Receipt Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={(open) => {
        if (!open && cashConfirmation) {
          // If trying to close with uploaded file, show confirmation
          handleCancelWithConfirmation(() => setReceiptModalOpen(false));
        } else {
          // Otherwise close directly
          setReceiptModalOpen(open);
        }
      }}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Modern Cash Header - Same design as GCash */}
          <div className="bg-white p-6 text-[#1A2B4F] relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-16 h-15 rounded-xl flex items-center justify-center">
                <div className="w-16 h-13 flex items-center justify-center">
                  <Banknote className="w-14 h-14 text-[#10B981]" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-[#1A2B4F] text-xl font-bold">Cash Payment</DialogTitle>
                <DialogDescription className="text-[#64748B]">
                  Secure in-person payment
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-[#10B981] flex-1 overflow-y-auto p-8"
            style={{ backgroundColor: '#10B981' }}
          >
            {/* White Background Container */}
            <div className="bg-white rounded-2xl">
              <div className="p-4 space-y-4">
                {/* Cash Logo Text - Centered */}
                <div className="flex justify-center py-2">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Banknote className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A2B4F]">Cash Payment</h2>
                    <p className="text-sm text-[#64748B]">In-person payment method</p>
                  </div>
                </div>

                {/* Payment Method Tabs - Same design as GCash */}
                <div className="flex gap-2 bg-[#F8FAFB] p-1 rounded-xl max-w-xs mx-auto">
                  <button
                    onClick={() => setCashTab('receipt')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      cashTab === 'receipt'
                        ? 'bg-white text-[#10B981] shadow-sm'
                        : 'text-[#64748B] hover:text-[#1A2B4F]'
                    }`}
                    style={cashTab === 'receipt' ? { color: '#10B981' } : {}}
                  >
                    <Receipt className="w-5 h-5" />
                    <span>Receipt</span>
                  </button>
                  <button
                    onClick={() => setCashTab('upload')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      cashTab === 'upload'
                        ? 'bg-white text-[#10B981] shadow-sm'
                        : 'text-[#64748B] hover:text-[#1A2B4F]'
                    }`}
                    style={cashTab === 'upload' ? { color: '#10B981' } : {}}
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </button>
                </div>

                {/* Receipt Tab Content */}
                {cashTab === 'receipt' && (
                  <div className="space-y-4">
                    {/* Receipt Content */}
                    <div ref={receiptRef} style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0.75rem',
                      border: '1px solid #E5E7EB',
                      overflow: 'hidden'
                    }}>
                      {/* Receipt Header */}
<div style={{
  position: 'relative',
  background: 'linear-gradient(to bottom right, #10b981, #14b8a6, #06b6d4)',
  padding: '2rem',
  textAlign: 'center',
  color: '#ffffff',
  borderTopLeftRadius: '0.75rem',
  borderTopRightRadius: '0.75rem',
  overflow: 'hidden'
}}>
  {/* Decorative background elements */}
  <div style={{
    position: 'absolute',
    top: 0,
    right: 0,
    width: '8rem',
    height: '8rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    marginRight: '-4rem',
    marginTop: '-4rem'
  }}></div>
  <div style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '6rem',
    height: '6rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    marginLeft: '-3rem',
    marginBottom: '-3rem'
  }}></div>
  
  {/* Icon container - Updated to match EditProfile styling */}
  <div style={{
    position: 'relative',
    width: '6rem',
    height: '6rem',
    margin: '0 auto 1.25rem',
    borderRadius: '50%',
    border: '4px solid #ffffff',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #10b981, #14b8a6)'
  }}>
    {profileData.profilePicture ? (
      <img 
        src={profileData.profilePicture} 
        alt="Company Logo" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    ) : (
      <span style={{
        color: '#ffffff',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        {getInitials()}
      </span>
    )}
  </div>
  
  {/* Company name */}
  <h3 style={{
    position: 'relative',
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
    letterSpacing: '-0.025em',
    filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))',
    color: '#ffffff'
  }}>
    4B'S TRAVEL AND TOURS
  </h3>
  
  {/* Subtitle */}
  <div style={{
    position: 'relative',
    display: 'inline-block'
  }}>
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      paddingLeft: '1.25rem',
      paddingRight: '1.25rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      borderRadius: '9999px',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }}>
      <p style={{
        color: '#ffffff',
        fontSize: '0.875rem',
        fontWeight: '500',
        letterSpacing: '0.025em',
        margin: 0
      }}>
        Official Payment Receipt
      </p>
    </div>
  </div>
  
  {/* Bottom wave decoration */}
  <div style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }}></div>
</div>

                      {/* Receipt Body */}
                      <div style={{ padding: '1.5rem' }}>
                        {/* Receipt Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '500' }}>Booking ID</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1A2B4F', backgroundColor: '#F1F5F9', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>{booking.id}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Customer Name</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1A2B4F' }}>{booking.customer}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Destination</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1A2B4F', textAlign: 'right' }}>{booking.destination}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Payment Type</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1A2B4F' }}>{paymentType}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Date Generated</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1A2B4F' }}>
                              {new Date().toLocaleDateString('en-PH', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          {/* Amount Section */}
                          <div style={{
                            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748B' }}>Amount to Pay</span>
                              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>
                                {paymentType === "Partial Payment" 
                                  ? `₱${partialAmountNum.toLocaleString()}` 
                                  : paymentType === "Full Payment"
                                    ? `₱${balance.toLocaleString()}`
                                    : booking.amount
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Receipt Footer */}
                      <div style={{
                        backgroundColor: '#F8FAFB',
                        borderTop: '1px solid #E5E7EB',
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#64748B',
                          margin: 0
                        }}>
                          📍 Present this receipt at 4B'S TRAVEL AND TOURS office
                        </p>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                      <h4 className="text-lg font-semibold text-[#1A2B4F] mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#10B981]" />
                        How to Complete Cash Payment
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Step 1 */}
                        <div className="flex items-start gap-4 p-3 bg-[#F8FAFB] rounded-xl border border-[#E5E7EB]">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            1
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-[#1A2B4F] text-sm mb-1">Download Digital Receipt</h5>
                            <p className="text-xs text-[#64748B]">
                              Click the "Download Receipt" button below to save your payment receipt
                            </p>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-start gap-4 p-3 bg-[#F8FAFB] rounded-xl border border-[#E5E7EB]">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            2
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-[#1A2B4F] text-sm mb-1">Visit 4B'S TRAVEL AND TOURS</h5>
                            <p className="text-xs text-[#64748B]">
                              Bring the downloaded receipt and exact payment amount to our office
                            </p>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-4 p-3 bg-[#F8FAFB] rounded-xl border border-[#E5E7EB]">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            3
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-[#1A2B4F] text-sm mb-1">Pay in Person</h5>
                            <p className="text-xs text-[#64748B]">
                              Present your digital receipt and pay the exact amount in cash to our admin staff
                            </p>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex items-start gap-4 p-3 bg-[#F8FAFB] rounded-xl border border-[#E5E7EB]">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            4
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-[#1A2B4F] text-sm mb-1">Receive Official Receipt</h5>
                            <p className="text-xs text-[#64748B]">
                              Wait for the admin to process your payment and provide an official receipt
                            </p>
                          </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex items-start gap-4 p-3 bg-[#F8FAFB] rounded-xl border border-[#E5E7EB]">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            5
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-[#1A2B4F] text-sm mb-1">Upload Proof of Payment</h5>
                            <p className="text-xs text-[#64748B]">
                              Take a clear photo of the official receipt and upload it as proof of payment
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-[#FFF3E0] border border-[#FFB74D] rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#FF9800] flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-[#1A2B4F]">Important Reminders</h5>
                          <div className="text-xs text-[#64748B] space-y-1">
                            <p>• Keep your digital receipt safe until payment is completed</p>
                            <p>• Bring valid ID for verification at the office</p>
                            <p>• Ensure receipt photo is clear and all details are visible when uploading</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Tab Content */}
                {cashTab === 'upload' && (
                  <div className="space-y-4">

                    {/* Upload Section with Smart Preview */}
                    <div className="space-y-3">
                      <Label htmlFor="cash-proof-upload" className="text-[#1A2B4F] font-semibold block">
                        Upload Proof of Payment *
                      </Label>
                      
                      {cashConfirmationPreview ? (
                        <div className="space-y-3">
                          <div className="relative border-2 border-[#E5E7EB] rounded-xl overflow-hidden group">
                            <img 
                              src={cashConfirmationPreview} 
                              alt="Cash payment confirmation" 
                              className="w-full max-h-96 object-contain bg-[#F8FAFB] mx-auto"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label htmlFor="change-cash-proof" className="cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all">
                                  <Pen className="w-4 h-4 text-[#10B981]" style={{ color: '#10B981' }} />
                                </div>
                              </label>
                              <button
                                onClick={() => {
                                  setCashConfirmation(null);
                                  setCashConfirmationPreview("");
                                }}
                                className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all"
                              >
                                <X className="w-4 h-4 text-[#FF6B6B]" />
                              </button>
                            </div>
                          </div>
                          <Input
                            id="change-cash-proof"
                            type="file"
                            accept="image/*"
                            onChange={handleCashConfirmationUpload}
                            className="hidden"
                          />
                          <div className="flex items-center gap-2 text-sm text-[#10B981] bg-[#10B981]/10 rounded-lg p-3">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Proof of Payment uploaded successfully</span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            id="cash-proof-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleCashConfirmationUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="cash-proof-upload"
                            className="flex flex-col items-center justify-center gap-3 h-32 px-4 rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white cursor-pointer transition-all hover:border-[#10B981] hover:bg-[#F8FAFB] group"
                          >
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-[#64748B] mx-auto mb-2 group-hover:text-[#10B981] transition-colors" />
                              <p className="text-sm font-medium text-[#64748B] group-hover:text-[#10B981] transition-colors">Tap to Upload</p>
                              <p className="text-xs text-[#64748B] mt-1">PNG, JPG up to 5MB</p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Secure Note */}
                    <div className="bg-[#F8FAFB] rounded-xl p-3 border-l-4 border-l-[#10B981]" style={{ borderLeftColor: '#10B981' }}>
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                        <div>
                          <p className="text-sm font-medium text-[#1A2B4F] mb-1">Secure Transaction</p>
                          <div className="text-xs text-[#64748B] space-y-0.5">
                            <p>• Ensure the receipt is clear and readable</p>
                            <p>• Verify all payment details are visible</p>
                            <p>• Keep the original receipt for your records</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Action Buttons at Bottom - Same Row */}
          <div className="p-6 border-t border-[#E5E7EB] bg-white shrink-0">
            <div className="flex gap-3">
              <button
                onClick={() => handleCancelWithConfirmation(() => setReceiptModalOpen(false))}
                className="flex-1 h-11 px-4 rounded-xl border border-[#E5E7EB] text-[#64748B] font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              {cashTab === 'receipt' ? (
                <button
                  onClick={downloadReceipt}
                  className="flex-1 h-11 px-4 rounded-xl bg-[#10B981] text-white font-medium hover:bg-[#0DA271] transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!cashConfirmation) {
                      toast.error("Please upload proof of payment");
                      return;
                    }
                    
                    // Show success message
                    toast.success("Payment proof submitted successfully!");
                    
                    // Close modal
                    setReceiptModalOpen(false);
                  }}
                  disabled={!cashConfirmation}
                  className="flex-1 h-11 px-4 rounded-xl bg-[#10B981] text-white font-medium hover:bg-[#0DA271] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#10B981' }}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* GCash Payment Modal */}
      <Dialog open={gcashModalOpen} onOpenChange={(open) => {
        if (!open && proofOfPayment) {
          // If trying to close with uploaded file, show confirmation
          handleCancelWithConfirmation(() => setGcashModalOpen(false));
        } else {
          // Otherwise close directly
          setGcashModalOpen(open);
        }
      }}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Modern GCash Header */}
          <div className="bg-white p-6 text-[#1A2B4F] relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-16 h-15 rounded-xl flex items-center justify-center">
                <img 
                  src="/gcash_logo.png" 
                  alt="GCash Logo" 
                  className="w-16 h-13 object-contain"
                />
              </div>
              <div>
                <DialogTitle className="text-[#1A2B4F] text-xl font-bold">GCash Payment</DialogTitle>
                <DialogDescription className="text-blue-100">
                  Fast and secure mobile payment
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-[#0009ff] flex-1 overflow-y-auto p-8"
            style={{ backgroundColor: '#0009ff' }}
          >
            {/* White Background Container */}
            <div className="bg-white rounded-2xl">
              <div className="p-4 space-y-4">
                {/* GCash Logo Text - Centered */}
                <div className="flex flex-col items-center justify-center pt-4 pb-1 space-y-2">
                  <img
                    src="/gcash_logotext.png"
                    alt="GCash"
                    className="h-14 object-contain"
                  />
                  <p className="text-sm text-[#64748B]">Cashless mobile payment</p>
                </div>

                {/* Payment Method Tabs */}
                <div className="flex gap-2 bg-[#F8FAFB] p-1 rounded-xl max-w-xs mx-auto">
                  <button
                    onClick={() => setPaymentMethod('qr')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === 'qr'
                        ? 'bg-white text-[#0009ff] shadow-sm'
                        : 'text-[#64748B] hover:text-[#1A2B4F]'
                    }`}
                    style={paymentMethod === 'qr' ? { color: '#0009ff' } : {}}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>QR Code</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('manual')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === 'manual'
                        ? 'bg-white text-[#0009ff] shadow-sm'
                        : 'text-[#64748B] hover:text-[#1A2B4F]'
                    }`}
                    style={paymentMethod === 'manual' ? { color: '#0009ff' } : {}}
                  >
                    <Keyboard className="w-5 h-5" />
                    <span>Manual</span>
                  </button>
                </div>
                
                {/* QR Code Section */}
                {paymentMethod === 'qr' && (
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-2xl border-2 border-[#E5E7EB] shadow-sm">
                      {paymentSettings.gcashQrCode ? (
                        <div className="w-48 h-48 rounded-xl overflow-hidden">
                          <img 
                            src={paymentSettings.gcashQrCode} 
                            alt="GCash QR Code" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-[#F8FAFB] rounded-xl flex items-center justify-center border-2 border-dashed border-[#E5E7EB]">
                          <div className="text-center">
                            <Smartphone className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">GCash QR</p>
                            <p className="text-xs text-[#64748B] mt-1">Scan to Pay</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB]">
                    <span className="text-sm text-[#64748B]">Account Name</span>
                    <span className="text-sm font-semibold text-[#1A2B4F]">{paymentSettings.accountName || "4B'S TRAVEL AND TOURS"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB]">
                    <span className="text-sm text-[#64748B]">GCash Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1A2B4F]">{paymentSettings.gcashMobile}</span>
                      <button
                        onClick={() => copyToClipboard(paymentSettings.gcashMobile)}
                        className="w-8 h-8 rounded-lg border border-[#E5E7EB] hover:bg-[#0A7AFF] hover:border-[#0A7AFF] hover:text-white transition-all flex items-center justify-center group"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#1A2B4F]">Amount to Pay</span>
                    <span className="text-lg font-bold text-[#10B981]">
                      {paymentType === "Partial Payment" 
                        ? `₱${partialAmountNum.toLocaleString()}` 
                        : paymentType === "Full Payment"
                          ? `₱${balance.toLocaleString()}`
                          : booking.amount
                      }
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-[#1A2B4F] mb-3">How to Pay:</h4>
                  {paymentMethod === 'qr' ? (
                    <ol className="text-sm text-[#64748B] space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">1</span>
                        Open your GCash app
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">2</span>
                        Tap the QR Code icon
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">3</span>
                        Scan the QR code above or save the QR code image then upload the image to QR Reader
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">4</span>
                        Verify the recipient then input the exact amount
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">5</span>
                        Complete the transaction
                      </li>
                    </ol>
                  ) : (
                    <ol className="text-sm text-[#64748B] space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">1</span>
                        Open GCash app
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">2</span>
                        Tap "Send Money"
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">3</span>
                        Enter the mobile number above
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">4</span>
                        Verify the recipient then input the exact amount
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#E5E7EB] text-[#64748B] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0">5</span>
                        Complete the transaction
                      </li>
                    </ol>
                  )}
                </div>

                {/* Secure Note */}
                <div className="bg-[#F8FAFB] rounded-xl p-3 border-l-4 border-l-[#0009ff]" style={{ borderLeftColor: '#0009ff' }}>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#0009ff] mt-0.5 shrink-0" style={{ color: '#0009ff' }} />
                    <div>
                      <p className="text-sm font-medium text-[#1A2B4F] mb-1">Secure Transaction</p>
                      <div className="text-xs text-[#64748B] space-y-0.5">
                        <p>• Verify <strong>{paymentSettings.accountName || "4B'S TRAVEL AND TOURS"}</strong> as recipient</p>
                        <p>• Double-check payment amount</p>
                        <p>• Download or take a screenshot of the transaction receipt</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Section with Smart Preview */}
                <div className="space-y-3">
                  <Label htmlFor="proof-upload" className="text-[#1A2B4F] font-semibold block">
                    Upload Proof of Payment *
                  </Label>
                  
                  {proofPreview ? (
                    <div className="space-y-3">
                      <div className="relative border-2 border-[#E5E7EB] rounded-xl overflow-hidden group">
                        <img 
                          src={proofPreview} 
                          alt="Transaction screenshot" 
                          className="w-full max-h-96 object-contain bg-[#F8FAFB] mx-auto"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label htmlFor="change-proof" className="cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all">
                              <Pen className="w-4 h-4 text-[#0009ff]" style={{ color: '#0009ff' }} />
                            </div>
                          </label>
                          <button
                            onClick={() => {
                              setProofOfPayment(null);
                              setProofPreview("");
                            }}
                            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all"
                          >
                            <X className="w-4 h-4 text-[#FF6B6B]" />
                          </button>
                        </div>
                      </div>
                      <Input
                        id="change-proof"
                        type="file"
                        accept="image/*"
                        onChange={handleProofUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-sm text-[#10B981] bg-[#10B981]/10 rounded-lg p-3">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Proof of Payment uploaded successfully</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="proof-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProofUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="proof-upload"
                        className="flex flex-col items-center justify-center gap-3 h-32 px-4 rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white cursor-pointer transition-all hover:border-[#0A7AFF] hover:bg-[#F8FAFB] group"
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-[#64748B] mx-auto mb-2 group-hover:text-[#0A7AFF] transition-colors" />
                          <p className="text-sm font-medium text-[#64748B] group-hover:text-[#0A7AFF] transition-colors">Tap to Upload</p>
                          <p className="text-xs text-[#64748B] mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Spacer for bottom buttons */}
                <div className="h-4"></div>
              </div>
            </div>
          </div>

          {/* Fixed Action Buttons at Bottom */}
          <div className="p-6 border-t border-[#E5E7EB] bg-white shrink-0">
            <div className="flex gap-3">
              <button
                onClick={() => handleCancelWithConfirmation(() => setGcashModalOpen(false))}
                className="flex-1 h-11 px-4 rounded-xl border border-[#E5E7EB] text-[#64748B] font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!proofOfPayment) {
                    toast.error("Please upload proof of payment");
                    return;
                  }
                  
                  // Launch confetti celebration
                  launchGCashConfetti();
                  
                  // Show success message
                  toast.success("Payment proof submitted successfully!");
                  
                  // Close modal after celebration
                  setTimeout(() => {
                    setGcashModalOpen(false);
                  }, 1000);
                }}
                disabled={!proofOfPayment}
                className="flex-1 h-11 px-4 rounded-xl bg-[#0009ff] text-white font-medium hover:bg-[#0057B8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0009ff' }}
              >
                Done
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Detail Modal */}
      <Dialog open={paymentDetailModalOpen} onOpenChange={setPaymentDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0A7AFF]" />
              Payment Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected payment
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6 p-6">
              {/* Payment Header */}
              <div className="bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] rounded-xl p-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedPayment.paymentType}</h3>
                    <p className="text-white/80 text-sm">
                      {new Date(selectedPayment.submittedAt).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm">Amount Paid</p>
                    <p className="text-2xl font-bold">₱{selectedPayment.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-[#64748B]">Payment ID</Label>
                    <p className="text-sm font-medium text-[#1A2B4F]">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-[#64748B]">Payment Type</Label>
                    <p className="text-sm font-medium text-[#1A2B4F]">{selectedPayment.paymentType}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-[#64748B]">Mode of Payment</Label>
                    <div className="flex items-center gap-2">
                      {selectedPayment.modeOfPayment === "Cash" ? (
                        <Banknote className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-[#0A7AFF]" />
                      )}
                      <p className="text-sm font-medium text-[#1A2B4F]">{selectedPayment.modeOfPayment}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-[#64748B]">Status</Label>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <p className="text-sm font-medium text-[#10B981]">Verified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proof of Payment Section */}
              <div>
                <Label className="text-sm font-medium text-[#1A2B4F] mb-3 block">
                  Proof of Payment
                </Label>
                
                {selectedPayment.proofOfPayment || selectedPayment.cashConfirmation ? (
                  <div className="space-y-4">
                    <div className="border-2 border-[#E5E7EB] rounded-xl overflow-hidden">
                      <img 
                        src={selectedPayment.proofOfPayment || selectedPayment.cashConfirmation} 
                        alt="Proof of payment" 
                        className="w-full max-h-96 object-contain bg-[#F8FAFB] mx-auto"
                      />
                    </div>
                    
                    {/* Payment Verification Details */}
                    <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-[#10B981]" />
                        <h4 className="text-sm font-medium text-[#1A2B4F]">Payment Verification</h4>
                      </div>
                      <div className="space-y-2 text-sm text-[#64748B]">
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-medium text-[#1A2B4F]">{selectedPayment.modeOfPayment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount Verified:</span>
                          <span className="font-medium text-[#10B981]">₱{selectedPayment.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Submission Date:</span>
                          <span className="font-medium text-[#1A2B4F]">
                            {new Date(selectedPayment.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-[#E5E7EB] rounded-xl">
                    <AlertCircle className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
                    <p className="text-sm text-[#64748B]">No proof of payment available</p>
                    <p className="text-xs text-[#64748B] mt-1">Payment was made without uploaded proof</p>
                  </div>
                )}
              </div>

              {/* Transaction Timeline */}
              <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <h4 className="text-sm font-medium text-[#1A2B4F] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0A7AFF]" />
                  Transaction Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A2B4F]">Payment Submitted</p>
                      <p className="text-xs text-[#64748B]">
                        {new Date(selectedPayment.submittedAt).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A2B4F]">Payment Verified</p>
                      <p className="text-xs text-[#64748B]">
                        {new Date(selectedPayment.submittedAt).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-[#1A2B4F]">
              <AlertCircle className="w-5 h-5 text-[#FF6B6B]" />
              Cancel Payment Process?
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">
              You have an ongoing payment process with uploaded documents.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 px-6 py-2">
            <div className="bg-[#FFF3F3] border border-[#FFE0E0] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[#1A2B4F]">Important Notice</h4>
                  <div className="text-xs text-[#64748B] space-y-1">
                    <p>• Uploaded proof of payment will be removed</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Uploaded Files Preview in Confirmation */}
            {(proofPreview || cashConfirmationPreview) && (
              <div className="border border-[#E5E7EB] rounded-lg p-4">
                <h5 className="text-sm font-medium text-[#1A2B4F] mb-2">Files to be removed:</h5>
                <div className="space-y-2">
                  {proofPreview && (
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <div className="w-2 h-2 bg-[#FF6B6B] rounded-full"></div>
                      <span>GCash Proof of Payment</span>
                    </div>
                  )}
                  {cashConfirmationPreview && (
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <div className="w-2 h-2 bg-[#FF6B6B] rounded-full"></div>
                      <span>Cash Payment Confirmation</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 px-6 pb-6 pt-4">
            <button
              onClick={handleCancelCancellation}
              className="flex-1 h-11 px-4 rounded-xl border border-[#E5E7EB] text-[#64748B] font-medium hover:bg-[#F8FAFB] transition-all"
            >
              Continue Payment
            </button>
            <button
              onClick={handleConfirmedCancel}
              className="flex-1 h-11 px-4 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#FF5252] transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Yes, Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <FAQAssistant />
    </div>
  );
}