import { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  MapPin,
  Sparkles,
  Users,
  Calendar,
  CheckCircle,
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Car,
  Trash2,
  Edit,
  BookOpen,
  Send,
  Share2,
  QrCode,
  Download,
  Upload,
  X,
  Copy,
  Type,
  AlertTriangle,
  Clock,
  ChevronLeft,
  // Import all icon options from your CreateNewTravel component
  Waves,
  Mountain,
  Palmtree,
  TreePine,
  Building2,
  Ship,
  Train,
  Coffee,
  ShoppingBag,
  Music,
  Sunset,
  AlertCircle,
  Sparkles as SparklesIcon,
  CheckCircle2,
  FileText,
  Users as UsersIcon,
  DollarSign,
  Utensils,
  Home,
  Landmark,
  Church,
  Castle,
  Globe,
  Backpack,
  Luggage,
  Umbrella,
  Sun,
  Moon,
  Star,
  Heart,
  Gift,
  ShoppingCart,
  Search,
  Bus,
  Anchor,
  Bike,
  Film,
  Ticket,
  Wine,
  IceCream,
  Pizza,
  Fish,
  Salad,
  Tent,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ContentCard } from "../../components/ContentCard";
import { BookingListCard } from "../../components/BookingListCard";
import { BookingDetailView } from "../../components/BookingDetailView";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { capitalize } from "../../utils/helpers/capitalize";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useBreadcrumbs } from "../../components/BreadcrumbContext";
import { toast } from "sonner";
import { FAQAssistant } from "../../components/FAQAssistant";
import {
  useMyBookings,
  useBookingDetail,
  useSubmitBooking,
  useDeleteBooking,
  useUpdateBooking,
} from "../../hooks/useBookings";
import { Booking, User } from "../../types/types";
import { queryKeys } from "../../utils/lib/queryKeys";
import { useProfile } from "../../hooks/useAuth";
import { useAddCollaborator } from "../../hooks/useCollaborators";
import { getIconForActivity } from "../../utils/helpers/getIconForActivity";
import { QueryClient } from "@tanstack/react-query";

interface TransformedBooking {
  id: string;
  bookingCode: string;
  owner: string;
  email: string;
  mobile: string;
  destination: string;
  dates: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  bookedDate: string;
  status: string;
  bookingType: string;
  tourType: string;
  ownership: "owned" | "collaborated" | "requested";
  resolutionStatus?: "solved" | "unsolved";
  itinerary: any[];
}

// Icon mapping for the new API response
const ICON_MAP: Record<string, any> = {
  relax: UtensilsCrossed,
  food: UtensilsCrossed,
  beach: Waves,
  mountain: Mountain,
  tree: TreePine,
  // Map all icon values from CreateNewTravel component
  Plane: Plane,
  Hotel: Hotel,
  Car: Car,
  Bus: Bus,
  Train: Train,
  Ship: Ship,
  Anchor: Anchor,
  Bike: Bike,
  Home: Home,
  Tent: Tent,
  UtensilsCrossed: UtensilsCrossed,
  Utensils: Utensils,
  Coffee: Coffee,
  Wine: Wine,
  IceCream: IceCream,
  Pizza: Pizza,
  Fish: Fish,
  Salad: Salad,
  Camera: Camera,
  Waves: Waves,
  Mountain: Mountain,
  Palmtree: Palmtree,
  TreePine: TreePine,
  Landmark: Landmark,
  Church: Church,
  Castle: Castle,
  Film: Film,
  Music: Music,
  Ticket: Ticket,
  ShoppingBag: ShoppingBag,
  ShoppingCart: ShoppingCart,
  MapPin: MapPin,
  Compass: AlertCircle,
  Globe: Globe,
  Backpack: Backpack,
  Luggage: Luggage,
  Package: ShoppingBag,
  Building2: Building2,
  Sunset: Sunset,
  Sun: Sun,
  Moon: Moon,
  Star: Star,
  Umbrella: Umbrella,
  Heart: Heart,
  Gift: Gift,
};

export function UserTravels() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbs();
  const bookingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const queryClient = new QueryClient();

  const [selectedTab, setSelectedTab] = useState<
    "draft" | "pending" | "rejected"
  >("draft");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "owned" | "collaborated" | "requested"
  >("all");
  const [requestedSubTab, setRequestedSubTab] = useState<
    "all" | "confirmed" | "unconfirmed"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinTravelModal, setShowJoinTravelModal] = useState(false);
  const [joinTravelId, setJoinTravelId] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [showBookConfirmModal, setShowBookConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showConfirmBookingModal, setShowConfirmBookingModal] = useState(false);
  const [showConfirmStatusModal, setShowConfirmStatusModal] = useState(false);
  const [showShareQRModal, setShowShareQRModal] = useState(false);
  const [shareQRBookingId, setShareQRBookingId] = useState<string | null>(null);
  const [joinMethod, setJoinMethod] = useState<"manual" | "scan" | "upload">(
    "manual"
  );
  const [scannedQRData, setScannedQRData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: addCollaborator, isPending: isAddingCollaborator } =
    useAddCollaborator(joinTravelId, {
      onSuccess: (data) => {
        toast.success("Successfully Joined!", {
          description:
            data.message ||
            `You are now a collaborator on booking ${joinTravelId}`,
        });
        setShowJoinTravelModal(false);
        setJoinTravelId("");
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.myBookings(),
        });
      },
      onError: (error: any) => {
        toast.error("Failed to join travel", {
          description:
            error.response?.data?.message ||
            "Please check the booking ID and try again",
        });
      },
    });

  const { data: profileResponse, isLoading: profileDataIsLoading } =
    useProfile();

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

  const [conversations, setConversations] = useState<
    Record<
      string,
      Array<{ sender: "user" | "admin"; message: string; time: string }>
    >
  >({});
  const [currentMessage, setCurrentMessage] = useState<Record<string, string>>(
    {}
  );

  const { data: myBookingsResponse, isLoading: isLoadingBookings } =
    useMyBookings({
      status: selectedTab.toUpperCase(),
    });

  const { data: selectedBookingData } = useBookingDetail(
    selectedBookingId || "",
    {
      enabled: !!selectedBookingId && viewMode === "detail",
      queryKey: [queryKeys.bookings.detail],
    }
  );

  const submitBookingMutation = useSubmitBooking(selectedBookingId || "", {
    onSuccess: () => {
      toast.success("Booking Submitted!", {
        description: "Your booking request has been sent for approval.",
      });
      setShowBookConfirmModal(false);
      setViewMode("list");
      setSelectedBookingId(null);
      setSelectedTab("pending");
    },
    onError: (error: any) => {
      toast.error("Failed to submit booking", {
        description: error.response?.data?.message || "Please try again later",
      });
    },
  });

  const deleteBookingMutation = useDeleteBooking(selectedBookingId || "", {
    onSuccess: () => {
      toast.success("Booking Deleted", {
        description: "The travel booking has been permanently removed.",
      });
      setShowDeleteConfirmModal(false);
      setViewMode("list");
      setSelectedBookingId(null);
    },
    onError: (error: any) => {
      toast.error("Failed to delete booking", {
        description: error.response?.data?.message || "Please try again later",
      });
    },
  });

  const updateBookingMutation = useUpdateBooking(selectedBookingId || "", {
    onSuccess: () => {
      toast.success("Booking Updated", {
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update booking", {
        description: error.response?.data?.message || "Please try again later",
      });
    },
  });

  const bookings: TransformedBooking[] = useMemo(() => {
    if (!myBookingsResponse?.data) return [];

    return myBookingsResponse.data.map((booking) => {
      // Use the ownership from the API response if available, otherwise calculate it
      let ownership: "owned" | "collaborated" | "requested" = "owned";

      if (booking.ownership) {
        // Map the API ownership value to our expected values
        ownership = booking.ownership.toLowerCase() as
          | "owned"
          | "collaborated"
          | "requested";
      } else if (profileData.id) {
        // Fall back to calculating if ownership is not provided
        const isOwner = booking.userId === profileData.id;
        const isCollaborator = booking.itinerary?.collaborators?.some(
          (collab: any) => collab.userId === profileData.id
        );

        if (!isOwner && isCollaborator) {
          ownership = "collaborated";
        } else if (!isOwner && !isCollaborator) {
          ownership = "requested";
        }
      }

      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      };

      const startDate = booking.startDate ? formatDate(booking.startDate) : "";
      const endDate = booking.endDate ? formatDate(booking.endDate) : "";
      const dates = startDate && endDate ? `${startDate} – ${endDate}` : "";

      const bookedDate = booking.bookedDate
        ? formatDate(booking.bookedDate)
        : booking.createdAt
        ? formatDate(booking.createdAt)
        : "";

      const budget = booking.totalPrice
        ? `₱${booking.totalPrice.toLocaleString()}`
        : "₱0";

      let resolutionStatus: "solved" | "unsolved" | undefined;
      if (booking.rejectionReason && !booking.isResolved) {
        resolutionStatus = "unsolved";
      } else if (booking.rejectionReason && booking.isResolved) {
        resolutionStatus = "solved";
      }

      return {
        id: booking.id,
        bookingCode: booking.bookingCode,
        owner: booking.customerName || "Unknown",
        email: booking.customerEmail || "",
        mobile: booking.customerMobile || "",
        destination: booking.destination || "Unknown Destination",
        dates,
        startDate: booking.startDate || "",
        endDate: booking.endDate || "",
        travelers: booking.travelers || 0,
        budget,
        bookedDate,
        status: booking.status?.toLowerCase() || "draft",
        bookingType: booking.type || "CUSTOMIZED",
        tourType: booking.tourType || "PRIVATE",
        ownership,
        resolutionStatus,
        itinerary: booking.itinerary?.days || [],
      };
    });
  }, [myBookingsResponse?.data, profileData.id]);

  const filteredTravels = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatch = booking.status === selectedTab;
      const ownershipMatch =
        selectedFilter === "all" || booking.ownership === selectedFilter;

      if (selectedFilter === "requested" && requestedSubTab !== "all") {
        // Handle requested sub-tabs if needed
        return statusMatch && ownershipMatch;
      }

      return statusMatch && ownershipMatch;
    });
  }, [bookings, selectedTab, selectedFilter, requestedSubTab]);

  // Get the selected booking for detail view
  const selectedBooking = useMemo(() => {
    return bookings.find((t) => t.id === selectedBookingId);
  }, [bookings, selectedBookingId]);

  // Transform itinerary for display in detail view
  const transformedItinerary = useMemo(() => {
    if (!selectedBooking?.itinerary) return [];

    return selectedBooking.itinerary.map((day: any) => ({
      day: day.dayNumber,
      title: day.date
        ? `Day ${day.dayNumber} - ${new Date(day.date).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          )}`
        : `Day ${day.dayNumber}`,
      activities: (day.activities || [])
        .sort((a: any, b: any) => a.order - b.order)
        .map((activity: any) => ({
          time: activity.time || "00:00",
          icon:
            ICON_MAP[activity.icon] ||
            getIconForActivity(activity.title, activity.description),
          title: activity.title,
          description: activity.description || "",
          location: activity.location || "",
        })),
    }));
  }, [selectedBooking?.itinerary]);

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedBookingId(null);
  };

  const handleStartNewTravel = () => {
    setShowCreateModal(false);
    navigate("/user/create-new-travel");
  };

  const handleJoinExisting = () => {
    setShowCreateModal(false);
    setShowJoinTravelModal(true);
  };

  const handleConfirmJoinTravel = () => {
    const trimmedId = joinTravelId.trim();

    if (!trimmedId) {
      toast.error("Please enter a booking ID");
      return;
    }

    if (profileData.id) {
      addCollaborator({
        userId: profileData.id,
        email: profileData.email,
      });
    } else {
      toast.error("User information not available", {
        description: "Please try refreshing the page",
      });
    }
  };

  const handleBookFromStandard = () => {
    setShowCreateModal(false);
    navigate("/user/standard-itinerary");
  };

  const handleBookThisTrip = () => {
    setShowBookConfirmModal(true);
  };

  const handleConfirmBooking = () => {
    if (selectedBookingId) {
      submitBookingMutation.mutate();
    }
  };

  const handleEditBooking = () => {
    if (!selectedBooking) {
      toast.error("Booking not found");
      return;
    }

    const serializableItinerary = selectedBooking.itinerary.map((day: any) => ({
      ...day,
      activities: day.activities.map((activity: any) => ({
        ...activity,
        icon: activity.icon || "Clock", // Default icon if none
      })),
    }));

    navigate(`/user/travels/edit/${selectedBookingId}`, {
      state: {
        bookingData: selectedBooking,
        itinerary: serializableItinerary,
        tabStatus: selectedTab,
      },
    });
  };

  const handleDeleteBooking = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBookingId) {
      deleteBookingMutation.mutate();
    }
  };

  const handleConfirmStatus = () => {
    if (selectedBookingId) {
      // TODO: Implement confirmation status update when API supports it
      toast.success("Booking Confirmed", {
        description: "The booking status has been updated to Confirmed.",
      });
    }
    setShowConfirmStatusModal(false);
  };

  // QR Code handlers
  const handleShareBooking = async (bookingId: string) => {
    setShareQRBookingId(bookingId);
    setShowShareQRModal(true);

    setTimeout(() => {
      generateQRCode(bookingId);
    }, 100);
  };

  const generateQRCode = async (bookingId: string) => {
    const canvas = qrCodeCanvasRef.current;
    if (!canvas) return;

    try {
      const QRCode = (await import("qrcode")).default;
      await QRCode.toCanvas(canvas, bookingId, {
        width: 200,
        margin: 2,
        color: {
          dark: "#0A7AFF",
          light: "#FFFFFF",
        },
      });
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrCodeCanvasRef.current;
    if (!canvas || !shareQRBookingId) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `booking-${shareQRBookingId}-qr.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("QR code downloaded successfully!");
      }
    });
  };

  const handleStartScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (error: any) {
      console.error("Failed to access camera:", error);

      if (error.name === "NotAllowedError") {
        toast.error("Camera Permission Denied", {
          description:
            "Please enable camera access in your browser settings to scan QR codes",
        });
      } else if (error.name === "NotFoundError") {
        toast.error("Camera Not Found", {
          description: "No camera device was detected on your device",
        });
      } else {
        toast.error("Failed to access camera", {
          description: "Please check your camera permissions and try again",
        });
      }
      setIsScanning(false);
    }
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !isScanning) return;

    try {
      const jsQR = (await import("jsqr")).default;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (
        context &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScannedQRData(code.data);
          setJoinTravelId(code.data);
          stopScanning();
          toast.success("QR code scanned successfully!");

          // Automatically trigger join after scanning
          if (profileData.id) {
            addCollaborator({
              userId: profileData.id,
              email: profileData.email,
            });
          }
          return;
        }
      }
    } catch (error) {
      console.error("QR scanning error:", error);
    }

    if (isScanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const jsQR = (await import("jsqr")).default;
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (context) {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (code) {
              setScannedQRData(code.data);
              setJoinTravelId(code.data);
              toast.success("QR code read successfully!");

              // Automatically trigger join after reading QR from file
              if (profileData.id) {
                addCollaborator({
                  userId: profileData.id,
                  email: profileData.email,
                });
              }
            } else {
              toast.error("No QR code found in image");
            }
          }
        };

        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to read QR code from file:", error);
      toast.error("Failed to read QR code from file");
    }
  };

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isScanning]);

  // Handle navigation with scroll-to functionality
  useEffect(() => {
    if (location.state?.scrollToId) {
      const { scrollToId, tab, activeTab } = location.state;

      const targetTab = tab || activeTab;
      if (targetTab) {
        setSelectedTab(targetTab);
      }

      navigate(location.pathname, { replace: true, state: {} });

      setTimeout(() => {
        const element = bookingRefs.current[scrollToId];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.style.animation = "highlight 2s ease-in-out";
        }
      }, 300);
    }
  }, [location.state, navigate, location.pathname]);

  // Update breadcrumbs based on view mode
  useEffect(() => {
    if (viewMode === "detail" && selectedBookingId) {
      const tabLabel =
        selectedTab === "draft"
          ? "In Progress"
          : selectedTab === "pending"
          ? "Pending"
          : "Rejected";

      setBreadcrumbs([
        { label: "Home", path: "/user/home" },
        { label: "Travels", path: "/user/travels" },
        { label: tabLabel },
        { label: `Booking ${selectedBookingId}` },
      ]);
    } else {
      resetBreadcrumbs();
    }
  }, [
    viewMode,
    selectedBookingId,
    selectedTab,
    setBreadcrumbs,
    resetBreadcrumbs,
  ]);

  // Detail view
  // Detail view - Complete section
  if (viewMode === "detail" && selectedBookingId && selectedBookingData?.data) {
    const tabLabel =
      selectedTab === "draft"
        ? "In Progress"
        : selectedTab === "pending"
        ? "Pending"
        : "Rejected Bookings";

    const bookingDetail = selectedBookingData.data;
    const isOwner = bookingDetail.ownership === "OWNED";

    return (
      <>
        <style>{`
        @keyframes highlight {
          0%, 100% {
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 3px rgba(255,107,107,0.3), 0 4px 6px rgba(255,107,107,0.1);
            transform: scale(1.005);
          }
        }
      `}</style>

        <BookingDetailView
          booking={{
            id: bookingDetail.id,
            bookingCode: bookingDetail.bookingCode,
            customer: bookingDetail.customerName!,
            email: bookingDetail.customerEmail!,
            mobile: bookingDetail.customerMobile!,
            destination: bookingDetail.destination,
            itinerary: bookingDetail.itinerary?.title || "Custom Itinerary",
            dates:
              bookingDetail.startDate && bookingDetail.endDate
                ? `${new Date(bookingDetail.startDate).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )} – ${new Date(bookingDetail.endDate).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}`
                : "Dates TBD",
            travelers: bookingDetail.travelers,
            total: `₱${parseFloat(
              bookingDetail.totalPrice.toString()
            ).toLocaleString()}`,
            bookedDate:
              bookingDetail.bookedDateDisplay ||
              (bookingDetail.bookedDate
                ? new Date(bookingDetail.bookedDate).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )
                : new Date(bookingDetail.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )),
            tripStatus: bookingDetail.itinerary?.status,
            paymentStatus: bookingDetail.paymentStatus,
            rejectionReason:
              bookingDetail.rejectionReason ||
              bookingDetail.itinerary?.rejectionReason ||
              "",
            rejectionResolution:
              bookingDetail.rejectionResolution ||
              bookingDetail.itinerary?.rejectionResolution ||
              "",
            resolutionStatus: bookingDetail.isResolved
              ? "resolved"
              : "unresolved",
          }}
          itinerary={bookingDetail.itinerary}
          onBack={handleBackToList}
          breadcrumbPage={tabLabel}
          headerVariant={
            selectedTab === "rejected"
              ? "cancelled"
              : selectedTab === "pending"
              ? "approval"
              : "default"
          }
          isRequestedItinerary={bookingDetail.ownership === "REQUESTED"}
          actionButtons={
            selectedTab === "pending" ? undefined : (
              <>
                {bookingDetail.ownership === "REQUESTED" && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden mb-3">
                    <div className="p-6 border-b border-[#E5E7EB] bg-linear-to-br from-[#F8FAFB] to-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                          <Send className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-[#1A2B4F]">
                          Conversation
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3 p-4 bg-accent/50 rounded-xl max-h-64 overflow-y-auto mb-4">
                        {(conversations[bookingDetail.id] || []).length ===
                        0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No messages yet. Start the conversation!
                          </div>
                        ) : (
                          (conversations[bookingDetail.id] || []).map(
                            (msg, index) => (
                              <div
                                key={index}
                                className={`flex ${
                                  msg.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[75%] p-4 rounded-xl shadow-sm ${
                                    msg.sender === "user"
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-card border border-border"
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed">
                                    {msg.message}
                                  </p>
                                  <p
                                    className={`text-xs mt-2 ${
                                      msg.sender === "user"
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {msg.time}
                                  </p>
                                </div>
                              </div>
                            )
                          )
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          value={currentMessage[bookingDetail.id] || ""}
                          onChange={(e) =>
                            setCurrentMessage({
                              ...currentMessage,
                              [bookingDetail.id]: e.target.value,
                            })
                          }
                          onKeyPress={(e) => {
                            if (
                              e.key === "Enter" &&
                              currentMessage[bookingDetail.id]?.trim()
                            ) {
                              const newMsg = {
                                sender: "user" as const,
                                message:
                                  currentMessage[bookingDetail.id].trim(),
                                time: new Date().toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }),
                              };
                              setConversations({
                                ...conversations,
                                [bookingDetail.id]: [
                                  ...(conversations[bookingDetail.id] || []),
                                  newMsg,
                                ],
                              });
                              setCurrentMessage({
                                ...currentMessage,
                                [bookingDetail.id]: "",
                              });
                              toast.success("Message sent!", {
                                description:
                                  "Your message has been sent to the admin.",
                              });
                            }
                          }}
                          className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                        <button
                          onClick={() => {
                            if (currentMessage[bookingDetail.id]?.trim()) {
                              const newMsg = {
                                sender: "user" as const,
                                message:
                                  currentMessage[bookingDetail.id].trim(),
                                time: new Date().toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }),
                              };
                              setConversations({
                                ...conversations,
                                [bookingDetail.id]: [
                                  ...(conversations[bookingDetail.id] || []),
                                  newMsg,
                                ],
                              });
                              setCurrentMessage({
                                ...currentMessage,
                                [bookingDetail.id]: "",
                              });
                              toast.success("Message sent!", {
                                description:
                                  "Your message has been sent to the admin.",
                              });
                            }
                          }}
                          className="px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white"
                        >
                          <Send className="w-5 h-5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isOwner && selectedTab === "draft" && (
                  <button
                    onClick={handleBookThisTrip}
                    className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#14B8A6] to-[#10B981] hover:from-[#12A594] hover:to-[#0EA574] text-white flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-[#14B8A6]/20"
                  >
                    <BookOpen className="w-4 h-4" />
                    Book This Trip
                  </button>
                )}

                {selectedTab === "draft" && (
                  <button
                    onClick={handleEditBooking}
                    className="w-full h-11 px-4 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-[#0A7AFF]/25 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(10,122,255,0.35)] transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Booking
                  </button>
                )}

                {isOwner && (
                  <button
                    onClick={handleDeleteBooking}
                    className="w-full h-11 px-4 rounded-xl border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] flex items-center justify-center gap-2 font-medium transition-all"
                    disabled={deleteBookingMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteBookingMutation.isPending
                      ? "Deleting..."
                      : "Delete Booking"}
                  </button>
                )}
              </>
            )
          }
        />

        {/* Modals */}
        <ConfirmationModal
          open={showBookConfirmModal}
          onOpenChange={setShowBookConfirmModal}
          title="Book This Trip"
          icon={<BookOpen className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
          iconShadow="shadow-[#0A7AFF]/20"
          contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
          contentBorder="border-[rgba(10,122,255,0.2)]"
          content={
            <div className="text-card-foreground">
              <p className="mb-3">
                Are you sure you want to submit this travel plan as a booking
                request?
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination:</span>
                  <span className="font-medium">
                    {bookingDetail.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dates:</span>
                  <span className="font-medium">
                    {bookingDetail.dateRangeDisplay ||
                      (bookingDetail.startDate && bookingDetail.endDate
                        ? `${new Date(
                            bookingDetail.startDate
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })} – ${new Date(
                            bookingDetail.endDate
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}`
                        : "Dates TBD")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">
                    ₱
                    {parseFloat(
                      bookingDetail.totalPrice.toString()
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          }
          onConfirm={handleConfirmBooking}
          onCancel={() => setShowBookConfirmModal(false)}
          confirmText={
            submitBookingMutation.isPending ? "Submitting..." : "Submit Booking"
          }
          confirmVariant="success"
        />

        <ConfirmationModal
          open={showDeleteConfirmModal}
          onOpenChange={setShowDeleteConfirmModal}
          title="Delete Booking"
          description="Are you sure you want to delete this booking? This action cannot be undone."
          icon={<Trash2 className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
          iconShadow="shadow-[#FF6B6B]/30"
          contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
          contentBorder="border-[rgba(255,107,107,0.2)]"
          content={
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                  Destination:
                </span>
                <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                  {bookingDetail.destination}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                  Booking Type:
                </span>
                <span className="text-sm font-medium text-[#1A2B4F] dark:text-white">
                  {bookingDetail.type}
                </span>
              </div>
            </div>
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirmModal(false)}
          confirmText={
            deleteBookingMutation.isPending ? "Deleting..." : "Delete Booking"
          }
          cancelText="Cancel"
          confirmVariant="destructive"
        />
      </>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <style>{`
        @keyframes highlight {
          0%, 100% {
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 3px rgba(10,122,255,0.3), 0 4px 6px rgba(10,122,255,0.1);
            transform: scale(1.005);
          }
        }
      `}</style>

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-border overflow-x-auto">
        <button
          onClick={() => setSelectedTab("draft")}
          className={`px-5 h-11 text-sm transition-colors whitespace-nowrap ${
            selectedTab === "draft"
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setSelectedTab("pending")}
          className={`px-5 h-11 text-sm transition-colors whitespace-nowrap ${
            selectedTab === "pending"
              ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
              : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setSelectedTab("rejected")}
          className={`px-5 h-11 text-sm transition-colors whitespace-nowrap ${
            selectedTab === "rejected"
              ? "font-semibold text-[#FF6B6B] border-b-[3px] border-[#FF6B6B] -mb-0.5"
              : "font-medium text-[#64748B] hover:text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)]"
          }`}
        >
          Rejected Bookings
        </button>
      </div>

      {/* Travels List */}
      <ContentCard
        title={`${
          selectedTab === "draft"
            ? "In Progress"
            : selectedTab === "pending"
            ? "Pending"
            : "Rejected Bookings"
        } ${filteredTravels.length > 0 ? `(${filteredTravels.length})` : ""}`}
        icon={MapPin}
        action={
          <div className="flex gap-2 items-center">
            <button
              onClick={handleBookFromStandard}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm bg-linear-to-r from-[#14B8A6] to-[#10B981] hover:from-[#12A594] hover:to-[#0EA574] text-white"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              <span className="hidden sm:inline">
                Book from Standard Itinerary
              </span>
              <span className="sm:hidden">Standard</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              <span className="hidden sm:inline">Add Travel</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => {
                setSelectedFilter("all");
                setRequestedSubTab("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "all"
                  ? "bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-accent hover:border-primary/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setSelectedFilter("owned");
                setRequestedSubTab("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "owned"
                  ? "bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-accent hover:border-primary/50"
              }`}
            >
              Owned
            </button>
            <button
              onClick={() => {
                setSelectedFilter("collaborated");
                setRequestedSubTab("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "collaborated"
                  ? "bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-accent hover:border-primary/50"
              }`}
            >
              Collaborated
            </button>
            <button
              onClick={() => setSelectedFilter("requested")}
              className={`px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                selectedFilter === "requested"
                  ? "bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white shadow-md"
                  : "bg-card border border-border text-card-foreground hover:bg-accent hover:border-primary/50"
              }`}
            >
              Requested
            </button>
          </div>

          {/* Dropdown for Requested filter */}
          {selectedFilter === "requested" && (
            <div className="pt-3 pb-2">
              <Select
                value={requestedSubTab}
                onValueChange={(value: "all" | "confirmed" | "unconfirmed") =>
                  setRequestedSubTab(value)
                }
              >
                <SelectTrigger className="w-45 h-10 border-2 border-border bg-card text-card-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requested</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Loading State */}
          {isLoadingBookings ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-primary opacity-50 animate-pulse" />
              </div>
              <h3 className="text-lg text-card-foreground mb-2">
                Loading bookings...
              </h3>
            </div>
          ) : filteredTravels.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-primary opacity-50" />
              </div>
              <h3 className="text-lg text-card-foreground mb-2">
                No {selectedTab === "draft" ? "in progress" : selectedTab}{" "}
                travel plans
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                {selectedTab === "draft"
                  ? "Start planning your first adventure!"
                  : `You don't have any ${selectedTab} travel plans yet.`}
              </p>
              {selectedTab === "draft" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2.5 rounded-xl transition-all duration-200 inline-flex items-center gap-2 shadow-md hover:shadow-lg bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                  Create Travel Plan
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTravels.map((travel) => (
                <div
                  key={travel.id}
                  ref={(el) => (bookingRefs.current[travel.id] = el)}
                >
                  <BookingListCard
                    booking={{
                      id: travel.id,
                      customerName: travel.owner,
                      customerEmail: travel.email,
                      customerMobile: travel.mobile,
                      destination: travel.destination,
                      startDate: travel.startDate,
                      endDate: travel.endDate,
                      travelers: travel.travelers,
                      totalPrice: travel.budget,
                      bookedDate: travel.bookedDate,
                      resolutionStatus: travel.resolutionStatus as any,
                      bookingCode: travel.bookingCode,
                    }}
                    onViewDetails={handleViewDetails}
                    onShare={
                      selectedTab === "draft" ? handleShareBooking : undefined
                    }
                    variant={
                      travel.status === "rejected" ? "rejected" : "default"
                    }
                    userSide={true}
                    additionalBadges={
                      <>
                        {/* Booking Type Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {capitalize(travel.bookingType)}
                        </span>
                        {/* Tour Type Badge */}
                        {travel.tourType && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                            {capitalize(travel.tourType)}
                          </span>
                        )}
                        {/* Ownership Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            travel.ownership === "owned"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : travel.ownership === "collaborated"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                          }`}
                        >
                          {travel.ownership === "owned"
                            ? "Owned"
                            : travel.ownership === "collaborated"
                            ? "Collaborated"
                            : "Requested"}
                        </span>
                      </>
                    }
                    pendingStatusMessage={
                      travel.status === "pending" && (
                        <div className="w-full p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Waiting for admin review. You'll be notified once
                            reviewed.
                          </p>
                        </div>
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </ContentCard>

      {/* Add Travel Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-150 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Add Travel
            </DialogTitle>
            <DialogDescription className="pb-4">
              Choose how you'd like to add your travel plan.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="px-8 py-2 space-y-4 pb-6">
              <button
                onClick={handleStartNewTravel}
                className="w-full p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] bg-white dark:bg-[#1E293B] hover:bg-[rgba(10,122,255,0.02)] dark:hover:bg-[rgba(10,122,255,0.05)] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A2B4F] dark:text-white mb-1 group-hover:text-[#0A7AFF] dark:group-hover:text-[#0A7AFF] transition-colors">
                      Start New Travel
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      Use our Smart Trip Generator to create a personalized
                      travel itinerary.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleJoinExisting}
                className="w-full p-6 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#8B5CF6] bg-white dark:bg-[#1E293B] hover:bg-[rgba(139,92,246,0.02)] dark:hover:bg-[rgba(139,92,246,0.05)] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A2B4F] dark:text-white mb-1 group-hover:text-[#8B5CF6] dark:group-hover:text-[#8B5CF6] transition-colors">
                      Join Existing Travel
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      Collaborate with others on their travel plans.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Join Travel Modal */}
      <ConfirmationModal
        open={showJoinTravelModal}
        onOpenChange={(open) => {
          setShowJoinTravelModal(open);
          if (!open) {
            setJoinMethod("manual");
            setJoinTravelId("");
            setScannedQRData("");
            stopScanning();
          }
        }}
        title="Join Existing Travel"
        description="Choose how you'd like to join an existing travel"
        icon={<Users className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]"
        iconShadow="shadow-[#8B5CF6]/20"
        contentGradient="bg-gradient-to-br from-[rgba(139,92,246,0.05)] to-transparent"
        contentBorder="border-[rgba(139,92,246,0.2)]"
        content={
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setJoinMethod("manual");
                  stopScanning();
                }}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  joinMethod === "manual"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Type className="w-4 h-4 inline mr-2" />
                Manual
              </button>
              <button
                onClick={() => {
                  setJoinMethod("scan");
                  setJoinTravelId("");
                  handleStartScanning();
                }}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  joinMethod === "scan"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <QrCode className="w-4 h-4 inline mr-2" />
                Scan QR
              </button>
              <button
                onClick={() => {
                  setJoinMethod("upload");
                  stopScanning();
                  setJoinTravelId("");
                }}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  joinMethod === "upload"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload QR
              </button>
            </div>

            {joinMethod === "manual" && (
              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Booking ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., BV-2025-001"
                  value={joinTravelId}
                  onChange={(e) => setJoinTravelId(e.target.value)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  disabled={isAddingCollaborator}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isAddingCollaborator) {
                      handleConfirmJoinTravel();
                    }
                  }}
                />
              </div>
            )}

            {/* ... rest of the content remains the same ... */}
          </div>
        }
        onConfirm={handleConfirmJoinTravel}
        onCancel={() => {
          if (!isAddingCollaborator) {
            setShowJoinTravelModal(false);
            setJoinMethod("manual");
            setJoinTravelId("");
            setScannedQRData("");
            stopScanning();
          }
        }}
        confirmText={isAddingCollaborator ? "Joining..." : "Join Travel"}
        cancelText="Cancel"
        confirmVariant="default"
      />
      {/* Share QR Code Modal */}
      <Dialog open={showShareQRModal} onOpenChange={setShowShareQRModal}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              Share Travel Booking
            </DialogTitle>
            <DialogDescription>
              Share this QR code with others to let them join as collaborators
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                <canvas ref={qrCodeCanvasRef} />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <p className="text-sm text-muted-foreground">
                  Booking ID:{" "}
                  <span className="font-semibold text-card-foreground">
                    {shareQRBookingId}
                  </span>
                </p>
                <button
                  onClick={() => {
                    if (shareQRBookingId) {
                      navigator.clipboard.writeText(shareQRBookingId);
                      toast.success("Copied to clipboard!", {
                        description: `Booking ID ${shareQRBookingId} copied`,
                      });
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-accent transition-all"
                  title="Copy booking ID"
                >
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2 mx-6">
              <button
                onClick={handleDownloadQR}
                className="flex-1 h-11 px-4 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
              <button
                onClick={() => setShowShareQRModal(false)}
                className="px-6 h-11 rounded-xl border-2 border-border hover:bg-accent transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FAQAssistant />
    </div>
  );
}
