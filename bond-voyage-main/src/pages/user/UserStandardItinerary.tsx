import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Eye,
  Search,
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Car,
  Package,
  Send,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import {
  SearchFilterToolbar,
  SortOrder,
} from "../../components/SearchFilterToolbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { toast } from "sonner";
import { FAQAssistant } from "../../components/FAQAssistant";
import {
  useTourPackages,
  useTourPackageDetail,
} from "../../hooks/useTourPackages"; // Import your hooks
import { useCreateBooking, useSubmitBooking } from "../../hooks/useBookings"; // Import booking mutations
import { queryKeys } from "../../utils/lib/queryKeys";
import { useProfile } from "../../hooks/useAuth";
import { User } from "../../types/types";

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

interface BookingFormData {
  customerName: string;
  email: string;
  mobile: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  tourType: "JOINER" | "PRIVATE";
}

export function UserStandardItinerary() {
  const navigate = useNavigate();
  const location = useLocation();
  const standardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(
    null
  );
  const [standardBookingModalOpen, setStandardBookingModalOpen] =
    useState(false);
  const [selectedStandardForBooking, setSelectedStandardForBooking] = useState<
    string | null
  >(null);
  const [createBookingConfirmOpen, setCreateBookingConfirmOpen] =
    useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Fetch tour packages using the hook
  const {
    data: tourPackagesData,
    isLoading,
    isError,
    error,
  } = useTourPackages({
    page: 1,
    limit: 100,
  });

  const { data: profileResponse, isLoading: profileDataIsLoading } =
    useProfile();

  // Initialize submit booking mutation (conditional based on created booking ID)
  const submitBookingMutation = useSubmitBooking(createdBookingId || "", {
    onSuccess: (response) => {
      setCreateBookingConfirmOpen(false);
      setCreatedBookingId(null);

      toast.success("Booking Submitted Successfully!", {
        description: `Your booking ${response.data?.bookingCode} has been submitted`,
      });

      // Reset form
      setBookingFormData({
        customerName: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        mobile: profileData.mobile,
        travelDateFrom: "",
        travelDateTo: "",
        travelers: "1",
        tourType: "" as any,
      });

      // Navigate to UserBookings with booking ID to scroll to
      setTimeout(() => {
        navigate("/user/bookings", {
          state: { newBookingId: response.data?.bookingCode },
        });
      }, 1500);
    },
    onError: (error: any) => {
      toast.error("Booking Submission Failed", {
        description:
          error?.response?.data?.message ||
          "Failed to submit booking. Please try again.",
      });
    },
  });

  // Initialize create booking mutation
  const createBookingMutation = useCreateBooking({
    onSuccess: (response) => {
      // Store the created booking ID
      setCreatedBookingId(response.data?.id);

      // Automatically submit the booking after creation
      submitBookingMutation.mutate(undefined as any);
    },
    onError: (error: any) => {
      toast.error("Booking Creation Failed", {
        description:
          error?.response?.data?.message ||
          "Failed to create booking. Please try again.",
      });
      setCreateBookingConfirmOpen(false);
    },
  });

  const profileData: User = useMemo(() => {
    return profileResponse?.data?.user
      ? profileResponse.data.user
      : {
          companyName: "",
          id: "",
          email: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          role: "USER",
          avatarUrl: "",
          middleName: "",
          mobile: "",
          isActive: true,
          createdAt: "",
          updatedAt: "",
          lastLogin: "",
          birthday: "",
          employeeId: "",
          customerRating: 0,
        };
  }, [profileResponse?.data?.user]);

  // Fetch selected package details
  const { data: packageDetailData, isLoading: isLoadingDetail } =
    useTourPackageDetail(selectedStandardId || "", {
      enabled: !!selectedStandardId && viewMode === "detail",
      queryKey: queryKeys.tourPackages.detail(selectedStandardId!),
    });

  // Booking form data
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    customerName: "",
    email: "",
    mobile: "",
    travelDateFrom: "",
    travelDateTo: "",
    travelers: "1",
    tourType: "" as any,
  });

  // Auto-populate form with profile data when profile loads
  useEffect(() => {
    if (profileData.firstName && profileData.lastName) {
      setBookingFormData((prev) => ({
        ...prev,
        customerName: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        mobile: profileData.mobile,
      }));
    }
  }, [
    profileData.firstName,
    profileData.lastName,
    profileData.email,
    profileData.mobile,
  ]);

  const templates =
    tourPackagesData?.data?.map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      destination: pkg.destination,
      days: pkg.duration,
      category: pkg.category || "Standard",
      pricePerPax: parseFloat(pkg.price),
      image:
        pkg.thumbUrl ||
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format",
    })) || [];

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

  const handleViewDetails = (id: string) => {
    setSelectedStandardId(id);
    setViewMode("detail");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
    setSelectedStandardId(null);
  };

  const handleBookNow = (id: string) => {
    setSelectedStandardForBooking(id);
    setStandardBookingModalOpen(true);
  };

  const handleCreateStandardBooking = () => {
    if (!selectedStandardForBooking) return;

    // Validation
    if (
      !bookingFormData.travelDateFrom ||
      !bookingFormData.travelDateTo ||
      !bookingFormData.tourType
    ) {
      toast.error("Please fill in all required fields", {
        description: "Travel dates and tour type are required",
      });
      return;
    }

    // Validate date range
    const startDate = new Date(bookingFormData.travelDateFrom);
    const endDate = new Date(bookingFormData.travelDateTo);

    if (endDate <= startDate) {
      toast.error("Invalid date range", {
        description: "End date must be after start date",
      });
      return;
    }

    setStandardBookingModalOpen(false);
    setCreateBookingConfirmOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedStandardForBooking) return;

    const selectedTemplate = templates.find(
      (t) => t.id === selectedStandardForBooking
    );
    if (!selectedTemplate) return;

    // Calculate total amount
    const travelers = parseInt(bookingFormData.travelers) || 1;
    const totalAmount = selectedTemplate.pricePerPax * travelers;

    // Prepare booking payload for API
    const bookingPayload = {
      itineraryId: selectedStandardForBooking, // Using tour package ID as itinerary ID
      destination: selectedTemplate.destination,
      startDate: new Date(bookingFormData.travelDateFrom).toISOString(),
      endDate: new Date(bookingFormData.travelDateTo).toISOString(),
      travelers: travelers,
      totalPrice: totalAmount,
      type: "STANDARD", // Changed from CUSTOMIZED to STANDARD
      tourType: bookingFormData.tourType,
      customerName: bookingFormData.customerName,
      customerEmail: bookingFormData.email,
      customerMobile: bookingFormData.mobile,
    };

    // Call the API mutation
    createBookingMutation.mutate(bookingPayload);
  };

  const selectedTemplate =
    selectedStandardId !== null
      ? templates.find((t) => t.id === selectedStandardId)
      : null;

  // Transform API day data to match component structure
  // Return empty array if no days available
  const selectedItineraryDetails =
    packageDetailData?.data?.days && packageDetailData.data.days.length > 0
      ? packageDetailData.data.days.map((day: any, index: number) => ({
          day: index + 1,
          title: day.title || `Day ${index + 1}`,
          activities:
            day.activities?.map((activity: any) => ({
              time: activity.time || "TBA",
              icon: Camera, // Default icon, you can map this based on activity type
              title: activity.title || "Activity",
              description: activity.description || "",
              location: activity.location || "",
            })) || [],
        }))
      : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A7AFF] dark:text-[#2596be] mx-auto mb-4" />
          <p className="text-[#64748B] dark:text-[#94A3B8]">
            Loading tour packages...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-[#64748B] dark:text-[#94A3B8]">
            Failed to load tour packages
          </p>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-2">
            {error?.message}
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "detail" && selectedTemplate) {
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
            <h2 className="text-[#1A2B4F] dark:text-white font-semibold">
              {selectedTemplate.title}
            </h2>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
              Standard Itinerary Package
            </p>
          </div>
        </div>

        {isLoadingDetail ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#0A7AFF] dark:text-[#2596be]" />
          </div>
        ) : (
          <>
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
                      <h1 className="text-white text-3xl font-semibold mb-2">
                        {selectedTemplate.title}
                      </h1>
                      <div className="flex items-center gap-4 text-white/90">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">
                            {selectedTemplate.destination}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {selectedTemplate.days} Days
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">
                            ₱{selectedTemplate.pricePerPax.toLocaleString()} per
                            pax
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookNow(selectedTemplate.id)}
                      className="h-10 px-5 rounded-[20px] text-white text-sm font-medium shadow-lg flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
                      }}
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
                  <h3 className="font-semibold text-[#1A2B4F] dark:text-white">
                    Day-by-Day Itinerary
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    {selectedTemplate.days}-day comprehensive travel plan
                  </p>
                </div>
              </div>

              {selectedItineraryDetails.length > 0 ? (
                <div className="space-y-6">
                  {selectedItineraryDetails.map((day) => (
                    <div
                      key={day.day}
                      className="border-l-4 border-[#0A7AFF] dark:border-[#2596be] pl-6 relative"
                    >
                      {/* Day Header */}
                      <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] dark:from-[#2596be] dark:to-[#25bce0] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/30 dark:shadow-[#2596be]/30">
                        <span className="text-white text-sm font-semibold">
                          {day.day}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-[#1A2B4F] dark:text-white">
                          Day {day.day}: {day.title}
                        </h4>
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
                                  <h5 className="font-medium text-[#1A2B4F] dark:text-white">
                                    {activity.title}
                                  </h5>
                                  <span className="flex-shrink-0 text-sm text-[#0A7AFF] dark:text-[#2596be] font-medium">
                                    {activity.time}
                                  </span>
                                </div>
                                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-1">
                                  {activity.description}
                                </p>
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
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#F8FAFB] dark:bg-[#0F1419] flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-[#64748B] dark:text-[#94A3B8]" />
                  </div>
                  <p className="text-[#64748B] dark:text-[#94A3B8] mb-2">
                    No itinerary details available
                  </p>
                  <p className="text-sm text-[#94A3B8] dark:text-[#64748B]">
                    Day-by-day itinerary has not been added for this package yet
                  </p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border-2 border-[#E5E7EB] dark:border-[#2A3441] bg-white dark:bg-[#1A1F2E] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#10B981]/20">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A2B4F] dark:text-white">
                      What's Included
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      Standard package inclusions
                    </p>
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
                    <h3 className="font-semibold text-[#1A2B4F] dark:text-white">
                      Important Notes
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      Please take note
                    </p>
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
          </>
        )}

        {/* Booking Modal */}
        {standardBookingModalOpen && (
          <Dialog
            open={standardBookingModalOpen}
            onOpenChange={setStandardBookingModalOpen}
          >
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
                    <Label className="text-sm mb-2 text-card-foreground">
                      Customer Name
                    </Label>
                    <Input
                      value={bookingFormData.customerName}
                      onChange={(e) =>
                        setBookingFormData({
                          ...bookingFormData,
                          customerName: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={bookingFormData.email}
                      onChange={(e) =>
                        setBookingFormData({
                          ...bookingFormData,
                          email: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 text-card-foreground">
                    Mobile Number
                  </Label>
                  <Input
                    value={bookingFormData.mobile}
                    onChange={(e) =>
                      setBookingFormData({
                        ...bookingFormData,
                        mobile: e.target.value,
                      })
                    }
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">
                      Travel Date From <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={bookingFormData.travelDateFrom}
                      onChange={(e) =>
                        setBookingFormData({
                          ...bookingFormData,
                          travelDateFrom: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">
                      Travel Date To <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={bookingFormData.travelDateTo}
                      onChange={(e) =>
                        setBookingFormData({
                          ...bookingFormData,
                          travelDateTo: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">
                      Number of Travelers
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={bookingFormData.travelers}
                      onChange={(e) =>
                        setBookingFormData({
                          ...bookingFormData,
                          travelers: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 text-card-foreground">
                      Tour Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={bookingFormData.tourType}
                      onValueChange={(value: "JOINER" | "PRIVATE") =>
                        setBookingFormData({
                          ...bookingFormData,
                          tourType: value,
                        })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select tour type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JOINER">JOINER</SelectItem>
                        <SelectItem value="PRIVATE">PRIVATE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="p-4 bg-gradient-to-br from-[rgba(10,122,255,0.08)] to-[rgba(20,184,166,0.08)] dark:from-[rgba(37,150,190,0.15)] dark:to-[rgba(20,184,166,0.15)] rounded-xl border-2 border-[rgba(10,122,255,0.2)] dark:border-[rgba(37,150,190,0.3)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                      Price per pax:
                    </span>
                    <span className="text-sm font-semibold text-[#1A2B4F] dark:text-white">
                      ₱{selectedTemplate.pricePerPax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                      Number of travelers:
                    </span>
                    <span className="text-sm font-semibold text-[#1A2B4F] dark:text-white">
                      {bookingFormData.travelers}
                    </span>
                  </div>
                  <div className="h-px bg-[#E5E7EB] dark:bg-[#2A3441] my-3"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-[#1A2B4F] dark:text-white">
                      Total Amount:
                    </span>
                    <span className="text-lg font-bold text-[#0A7AFF] dark:text-[#2596be]">
                      ₱
                      {(
                        selectedTemplate.pricePerPax *
                        parseInt(bookingFormData.travelers || "1")
                      ).toLocaleString()}
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
                    onClick={handleConfirmBooking}
                    disabled={
                      createBookingMutation.isPending ||
                      submitBookingMutation.isPending
                    }
                    className="px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                      color: "white",
                    }}
                  >
                    {createBookingMutation.isPending ||
                    submitBookingMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {createBookingMutation.isPending
                            ? "Creating..."
                            : "Submitting..."}
                        </span>
                      </>
                    ) : (
                      <span>Submit Booking</span>
                    )}
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
                Create booking for{" "}
                <span className="font-semibold text-[#0A7AFF] dark:text-[#2596be]">
                  {selectedTemplate.title}
                </span>
                ?
              </p>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] space-y-1">
                <div>• Travelers: {bookingFormData.travelers}</div>
                <div>• Tour Type: {bookingFormData.tourType}</div>
                <div>
                  • Total: ₱
                  {(
                    selectedTemplate.pricePerPax *
                    parseInt(bookingFormData.travelers || "1")
                  ).toLocaleString()}
                </div>
                <div>• Payment Status: Pending</div>
              </div>
            </div>
          }
          onConfirm={handleConfirmBooking}
          onCancel={() => setCreateBookingConfirmOpen(false)}
          confirmText={
            createBookingMutation.isPending
              ? "Creating..."
              : submitBookingMutation.isPending
              ? "Submitting..."
              : "Confirm Booking"
          }
          cancelText="Cancel"
          confirmVariant="default"
          isLoading={
            createBookingMutation.isPending || submitBookingMutation.isPending
          }
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
          onClick={() => navigate("/user/travels")}
          className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] dark:bg-gray-800 dark:border-gray-700 dark:hover:border-[#0A7AFF] dark:hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
        </button>
        <div>
          <h2 className="text-[#1A2B4F] dark:text-white font-semibold">
            Back to Travels
          </h2>
        </div>
      </div>

      <ContentCard title="Standard Itinerary Packages" icon={BookOpen}>
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
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-1">
                      Starting from
                    </p>
                    <p className="text-lg font-bold text-[#0A7AFF] dark:text-[#2596be]">
                      ₱{template.pricePerPax.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      per person
                    </p>
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
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              No itineraries found
            </p>
          </div>
        )}
      </ContentCard>
    </div>
  );
}
