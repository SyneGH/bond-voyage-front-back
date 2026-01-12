import {
  Calendar,
  MapPin,
  TrendingUp,
  Plane,
  Star,
  Award,
  Sparkles,
  Clock,
  CheckCircle,
  FileText,
  CloudRain,
  Sun,
  Cloud,
  Search,
  Briefcase,
  UserPlus,
  Send,
  Mail,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile,
  Paperclip,
  X,
  Image as ImageIcon,
  File,
  ChevronRight,
  Check,
  Eye,
  ExternalLink,
  XCircle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../components/StatCard";
import { ContentCard } from "../../components/ContentCard";
import { BookingListCard } from "../../components/BookingListCard";

import { AdventureAvatar } from "../../components/AdventureAvatar";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useBookings } from "../../components/BookingContext";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { useActivityLogs } from "../../hooks/useActivityLogs";
import { useProfile } from "../../hooks/useAuth";
import { queryKeys } from "../../utils/lib/queryKeys";
import {
  getDefaultActivities,
  transformActivityLogs,
} from "../../utils/helpers/transformActivityLogs";
import { useWeather } from "../../hooks/useWeather";
import {
  Coordinates,
  getCurrentLocation,
} from "../../utils/helpers/getCurrentLocation";

export function UserHome() {
  const navigate = useNavigate();
  const { userTravels } = useBookings();
  const [selectedLocation, setSelectedLocation] = useState("Manila");
  const [searchLocation, setSearchLocation] = useState("");
  const [currentTipBatch, setCurrentTipBatch] = useState(0);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>("");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "left"
  );
  const [showTextAlignIndicator, setShowTextAlignIndicator] = useState(false);

  const messageRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: authProfileResponse } = useProfile();
  const { data: activityLogsResponse } = useActivityLogs(
    {
      actorId: authProfileResponse?.data?.user?.id,
      limit: 7,
    },
    {
      enabled: !!authProfileResponse?.data?.user?.id,
      queryKey: [queryKeys.activityLogs.all],
    }
  );

  const recentActivities = useMemo(() => {
    if (!activityLogsResponse?.data) {
      return getDefaultActivities();
    }

    return transformActivityLogs(activityLogsResponse.data);
  }, [activityLogsResponse?.data]);

  const userProfileData = useMemo(() => {
    return authProfileResponse?.data?.user || null;
  }, [authProfileResponse?.data?.user]);

  const getInitials = () => {
    if (!userProfileData) return null;
    if (userProfileData.avatarUrl) return null;
    return (
      userProfileData.firstName[0] + userProfileData.lastName[0]
    ).toUpperCase();
  };

  const [location, setLocation] = useState<Coordinates>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const getLocation = async () => {
      const location = await getCurrentLocation();

      if (location.latitude && location.latitude) setLocation(location);
    };

    getLocation();
  }, []);

  const {
    data: weatherResponse,
    isLoading: weatherLoading,
    error: weatherError,
  } = useWeather({ lat: location.latitude, lng: location.longitude });

  const weatherData = weatherResponse?.data;

  useEffect(() => {
    if (weatherData?.name) {
      setSelectedLocation(weatherData.name);
    }
  }, [weatherData]);

  const ownedTravelCount = userTravels.filter(
    (travel) => travel.ownership === "owned" && travel.status === "in-progress"
  ).length;

  const collaboratedTravelCount = userTravels.filter(
    (travel) =>
      travel.ownership === "collaborated" && travel.status === "in-progress"
  ).length;

  const pendingTravelCount = userTravels.filter(
    (travel) => travel.status === "pending"
  ).length;

  // Mock user profile data - keeping for owned/collaborated travel counts
  const userProfile = {
    firstName: userProfileData ? userProfileData.firstName : "",
    lastName: userProfileData ? userProfileData.lastName : "",
    email: userProfileData ? userProfileData.email : "",
    ownedTravel: ownedTravelCount || 0,
    collaboratedTravel: collaboratedTravelCount || 0,
  };

  // Bookings data from UserBookings.tsx
  const upcomingBookings: any[] = [];

  // Historical completed trips data from UserHistory.tsx
  const completedTripsData = [
    { dates: "October 12, 2024 – October 17, 2024" }, // October
    { dates: "August 5, 2024 – August 7, 2024" }, // August
    { dates: "July 20, 2024 – July 25, 2024" }, // July
  ];

  // Generate booking trends data for last 12 months based on actual data
  const generateBookingTrends = () => {
    const now = new Date();
    const trends = [];

    // Initialize all months with 0 bookings
    const monthCounts: Record<string, number> = {};

    // Count bookings per month from completed trips
    completedTripsData.forEach((trip) => {
      // Extract month and year from dates string (e.g., "Oct 12-17, 2024")
      const monthStr = trip.dates.split(" ")[0]; // "Oct"
      const year = trip.dates.split(", ")[1]; // "2024"
      const monthKey = `${monthStr} ${year}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    // Add upcoming bookings
    upcomingBookings.forEach((booking) => {
      const monthStr = booking.dates.split(" ")[0];
      const year = booking.dates.split(", ")[1];
      const monthKey = `${monthStr} ${year}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    // Create trend data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const monthKey = `${monthName} ${year}`;

      trends.push({
        month: monthName,
        bookings: monthCounts[monthKey] || 0,
      });
    }

    return trends;
  };

  const monthlyData = generateBookingTrends();

  // Current weather forecast (7 days)
  const forecast = [
    { day: "Mon", temp: "28°C", icon: Cloud, condition: "Partly Cloudy" },
    { day: "Tue", temp: "30°C", icon: Sun, condition: "Sunny" },
    { day: "Wed", temp: "27°C", icon: CloudRain, condition: "Rainy" },
    { day: "Thu", temp: "29°C", icon: Cloud, condition: "Cloudy" },
    { day: "Fri", temp: "31°C", icon: Sun, condition: "Sunny" },
    { day: "Sat", temp: "28°C", icon: Cloud, condition: "Cloudy" },
    { day: "Sun", temp: "29°C", icon: Sun, condition: "Sunny" },
  ];

  // Enhanced travel tips - organized in batches of 6
  const allTravelTips = [
    // Batch 1: General Travel Tips
    [
      {
        emoji: "🌴",
        title: "Best Time to Visit Palawan",
        description:
          "December to May offers perfect weather for island hopping and beach activities. Avoid the rainy season from June to November.",
        color: "blue",
        icon: Sun,
      },
      {
        emoji: "💰",
        title: "Budget Travel Tip",
        description:
          "Book your trips 3-4 months in advance to get the best deals on flights and accommodations. Consider traveling during off-peak seasons.",
        color: "green",
        icon: TrendingUp,
      },
      {
        emoji: "🎒",
        title: "Pack Smart",
        description:
          "Bring lightweight, quick-dry clothing and always pack a reusable water bottle to stay hydrated during your adventures.",
        color: "purple",
        icon: CheckCircle,
      },
      {
        emoji: "📸",
        title: "Capture Memories",
        description:
          "Don't forget to bring a waterproof camera or phone case for those amazing underwater shots and beach photography.",
        color: "pink",
        icon: Sparkles,
      },
      {
        emoji: "🗺️",
        title: "Explore Local Culture",
        description:
          "Visit local markets and try authentic Filipino cuisine. Learn basic Tagalog phrases like 'Salamat' (Thank you) to connect with locals.",
        color: "orange",
        icon: MapPin,
      },
      {
        emoji: "🌊",
        title: "Island Hopping Tips",
        description:
          "Start early morning tours to avoid crowds and enjoy the best lighting for photos at pristine beaches and hidden lagoons.",
        color: "cyan",
        icon: Star,
      },
    ],
    // Batch 2: Safety & Health
    [
      {
        emoji: "🏥",
        title: "Health Essentials",
        description:
          "Pack sunscreen (SPF 50+), insect repellent, and basic first aid kit. Stay hydrated and bring electrolyte drinks for hot weather.",
        color: "blue",
        icon: CheckCircle,
      },
      {
        emoji: "🌡️",
        title: "Beat the Heat",
        description:
          "Philippine summers can be intense. Wear light colors, use umbrella for shade, and take breaks in air-conditioned areas.",
        color: "orange",
        icon: Sun,
      },
      {
        emoji: "🚰",
        title: "Water Safety",
        description:
          "Always drink bottled or purified water. Avoid ice in drinks unless you're sure it's from filtered water. Stay safe, stay hydrated!",
        color: "cyan",
        icon: Sparkles,
      },
      {
        emoji: "📱",
        title: "Stay Connected",
        description:
          "Get a local SIM card for affordable data and calls. Download offline maps and important contacts before your trip.",
        color: "purple",
        icon: MapPin,
      },
      {
        emoji: "💊",
        title: "Medicine Checklist",
        description:
          "Bring motion sickness pills for boat rides, antihistamines, pain relievers, and any prescription medications you need.",
        color: "pink",
        icon: TrendingUp,
      },
      {
        emoji: "🔒",
        title: "Secure Your Belongings",
        description:
          "Use hotel safes for valuables, keep copies of important documents, and be aware of your surroundings in crowded areas.",
        color: "green",
        icon: Star,
      },
    ],
    // Batch 3: Local Experience
    [
      {
        emoji: "🍽️",
        title: "Filipino Food Must-Try",
        description:
          "Don't miss Adobo, Sinigang, Lechon, and Halo-Halo! Visit local 'carinderia' for authentic home-cooked Filipino meals.",
        color: "orange",
        icon: Sparkles,
      },
      {
        emoji: "🚕",
        title: "Transportation Tips",
        description:
          "Use Grab or local tricycles for short distances. For longer trips, book van transfers in advance for better rates and comfort.",
        color: "blue",
        icon: MapPin,
      },
      {
        emoji: "💬",
        title: "Learn Basic Filipino",
        description:
          "Locals appreciate effort! Learn: 'Magkano?' (How much?), 'Paki-help' (Please help), 'Masarap!' (Delicious!).",
        color: "green",
        icon: Star,
      },
      {
        emoji: "🎁",
        title: "Shopping Smart",
        description:
          "Buy pasalubong (gifts) at local markets instead of tourist shops. Dried mangoes, barako coffee, and handwoven products are great!",
        color: "purple",
        icon: TrendingUp,
      },
      {
        emoji: "🏖️",
        title: "Beach Etiquette",
        description:
          "Take your trash with you, respect marine life, don't touch corals. Help keep Philippine beaches pristine for future travelers!",
        color: "cyan",
        icon: Sun,
      },
      {
        emoji: "🎭",
        title: "Cultural Festivals",
        description:
          "Plan around local festivals like Sinulog (Cebu), Ati-Atihan (Aklan), or Pahiyas (Quezon) for unforgettable cultural experiences.",
        color: "pink",
        icon: CheckCircle,
      },
    ],
    // Batch 4: Adventure & Activities
    [
      {
        emoji: "🤿",
        title: "Diving & Snorkeling",
        description:
          "Philippines has world-class dive sites! Bring reef-safe sunscreen and underwater camera. Best spots: Apo Reef, Tubbataha, Moalboal.",
        color: "cyan",
        icon: Star,
      },
      {
        emoji: "🏄",
        title: "Surfing Destinations",
        description:
          "Siargao's Cloud 9 is famous, but also try La Union and Baler for great waves. September to November is prime surf season.",
        color: "blue",
        icon: Sparkles,
      },
      {
        emoji: "⛰️",
        title: "Hiking Adventures",
        description:
          "Mt. Pulag for sea of clouds, Taal Volcano for lake views, or Mt. Pinatubo for crater lake. Always hire local guides!",
        color: "green",
        icon: MapPin,
      },
      {
        emoji: "🚣",
        title: "Water Activities",
        description:
          "Try kayaking in Puerto Princesa Underground River, canyoneering in Cebu, or SUP in Coron. Book tours with certified operators.",
        color: "purple",
        icon: TrendingUp,
      },
      {
        emoji: "🎣",
        title: "Fishing Experiences",
        description:
          "Join local fishermen for traditional fishing experiences or try sport fishing in Palawan. Fresh catch can be cooked at your resort!",
        color: "orange",
        icon: Sun,
      },
      {
        emoji: "🌅",
        title: "Sunrise & Sunset Spots",
        description:
          "Catch sunrise at Cloud 9 boardwalk or Mt. Pulag. Best sunsets: Boracay White Beach, Manila Bay, or El Nido's Las Cabanas.",
        color: "pink",
        icon: CheckCircle,
      },
    ],
  ];

  // Auto-rotate tips every 20 seconds (giving users time to read)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipBatch((prev) => (prev + 1) % allTravelTips.length);
    }, 20000); // 20 seconds per batch

    return () => clearInterval(interval);
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Apply link styling to editor
  useEffect(() => {
    const applyLinkStyles = () => {
      if (messageRef.current) {
        const links = messageRef.current.querySelectorAll("a");
        links.forEach((link) => {
          link.style.color = "#3b82f6";
          link.style.textDecoration = "underline";
          link.style.textDecorationStyle = "dashed";
          link.style.textUnderlineOffset = "2px";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.classList.add("link-element");
        });
      }
    };

    // Apply styles after content changes
    const observer = new MutationObserver(applyLinkStyles);
    if (messageRef.current) {
      observer.observe(messageRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }

    return () => observer.disconnect();
  }, []);

  const travelTips = allTravelTips[currentTipBatch];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> =
      {
        blue: {
          bg: "from-blue-500/10",
          icon: "bg-blue-500/20 text-blue-500",
          border: "hover:border-blue-500/50",
        },
        green: {
          bg: "from-green-500/10",
          icon: "bg-green-500/20 text-green-500",
          border: "hover:border-green-500/50",
        },
        purple: {
          bg: "from-purple-500/10",
          icon: "bg-purple-500/20 text-purple-500",
          border: "hover:border-purple-500/50",
        },
        pink: {
          bg: "from-pink-500/10",
          icon: "bg-pink-500/20 text-pink-500",
          border: "hover:border-pink-500/50",
        },
        orange: {
          bg: "from-orange-500/10",
          icon: "bg-orange-500/20 text-orange-500",
          border: "hover:border-orange-500/50",
        },
        cyan: {
          bg: "from-cyan-500/10",
          icon: "bg-cyan-500/20 text-cyan-500",
          border: "hover:border-cyan-500/50",
        },
      };
    return colors[color] || colors.blue;
  };

  const handleWeatherSearch = () => {
    if (searchLocation.trim()) {
      // In a real implementation, you would:
      // 1. Call a geocoding API to convert location name to coordinates
      // 2. Then call useWeather with those coordinates

      // For now, just update the displayed location name
      setSelectedLocation(searchLocation);
      setSearchLocation("");

      toast.info("Search feature coming soon!", {
        description: `Currently showing weather for your current location. Full search will be available soon.`,
      });
    }
  };

  // Update all formatting indicator states
  const updateFormattingIndicators = () => {
    if (document.queryCommandState) {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));

      // Check if cursor is inside a list
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;

        // Go up through parent nodes to find list elements
        while (node && node.nodeType !== Node.ELEMENT_NODE) {
          node = node.parentNode;
        }

        if (node) {
          let currentNode = node as Element;
          let isInUL = false;
          let isInOL = false;

          while (currentNode && currentNode !== document.body) {
            if (currentNode.tagName === "UL") {
              isInUL = true;
              break;
            }
            if (currentNode.tagName === "OL") {
              isInOL = true;
              break;
            }
            currentNode = currentNode.parentElement as Element;
          }

          setIsBulletList(isInUL);
          setIsNumberedList(isInOL);
        } else {
          setIsBulletList(false);
          setIsNumberedList(false);
        }
      } else {
        setIsBulletList(false);
        setIsNumberedList(false);
      }

      // Update text alignment
      if (messageRef.current) {
        const textAlignStyle = messageRef.current.style.textAlign || "left";
        if (textAlignStyle !== textAlign) {
          setTextAlign(textAlignStyle as "left" | "center" | "right");
        }
      }
    }
  };

  // Enhanced rich text editor functions with text alignment
  const handleFormat = (command: string, value?: string) => {
    if (messageRef.current) {
      // Focus the editor
      messageRef.current.focus();

      // Execute command
      document.execCommand(command, false, value);

      // Update indicators
      updateFormattingIndicators();

      // Update content
      if (messageRef.current.innerHTML !== contactMessage) {
        setContactMessage(messageRef.current.innerHTML);
      }
    }
  };

  // Text alignment handler with visual indicator
  const handleTextAlignment = (alignment: "left" | "center" | "right") => {
    if (messageRef.current) {
      messageRef.current.focus();
      setTextAlign(alignment);
      messageRef.current.style.textAlign = alignment;

      // Show visual indicator
      setShowTextAlignIndicator(true);
      setTimeout(() => setShowTextAlignIndicator(false), 1000);

      // Update formatting indicators
      updateFormattingIndicators();
      setContactMessage(messageRef.current.innerHTML);
    }
  };

  // FIXED: Proper list insertion function - now inserts actual bullets/numbers
  const handleListInsert = (type: "unordered" | "ordered") => {
    if (messageRef.current) {
      messageRef.current.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Check if we're already in a list
        let node = range.commonAncestorContainer;
        while (node && node.nodeType !== Node.ELEMENT_NODE) {
          node = node.parentNode;
        }

        if (node) {
          let currentNode = node as Element;
          while (currentNode && currentNode !== document.body) {
            if (currentNode.tagName === "UL" || currentNode.tagName === "OL") {
              // We're already in a list, toggle it off
              document.execCommand("outdent");
              updateFormattingIndicators();
              setContactMessage(messageRef.current.innerHTML);
              return;
            }
            currentNode = currentNode.parentElement as Element;
          }
        }

        // If text is selected, use the browser's built-in list command
        if (!range.collapsed) {
          document.execCommand(
            type === "unordered" ? "insertUnorderedList" : "insertOrderedList"
          );
        } else {
          // If no text is selected, just execute the command - browser will handle it
          document.execCommand(
            type === "unordered" ? "insertUnorderedList" : "insertOrderedList"
          );
        }
      } else {
        // Fallback for when there's no selection
        const command =
          type === "unordered" ? "insertUnorderedList" : "insertOrderedList";
        document.execCommand(command, false);
      }

      updateFormattingIndicators();
      setContactMessage(messageRef.current.innerHTML);
    }
  };

  // FIXED: Tab indentation function
  const handleTabIndent = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();

      if (messageRef.current) {
        messageRef.current.focus();

        if (e.shiftKey) {
          // Shift+Tab for outdent
          document.execCommand("outdent");
        } else {
          // Tab for indent
          document.execCommand("indent");
        }

        updateFormattingIndicators();
        setContactMessage(messageRef.current.innerHTML);
      }
    }
  };

  const insertEmoji = (emojiData: EmojiClickData) => {
    if (messageRef.current) {
      messageRef.current.focus();

      // Insert emoji at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(emojiData.emoji);
        range.deleteContents();
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback: append at end
        messageRef.current.innerHTML += emojiData.emoji;
      }

      setContactMessage(messageRef.current.innerHTML);
      updateFormattingIndicators();
    }
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file types and size
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`, {
          description: `Maximum file size is 10MB`,
        });
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`, {
          description: `Allowed types: Images, PDF, Word documents`,
        });
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) attached successfully`, {
        description: `Total attached files: ${
          attachedFiles.length + validFiles.length
        }`,
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const previewAttachedFile = (file: File) => {
    setPreviewFile(file);

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setPreviewFileUrl(url);
    setShowFilePreview(true);
  };

  const downloadFile = () => {
    if (!previewFile) return;

    try {
      const url = URL.createObjectURL(previewFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = previewFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Download started", {
        description: `Downloading ${previewFile.name}`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Download failed", {
        description: "Please try again",
      });
    }
  };

  // Send email directly (simulated for demo)
  const handleSendEmail = async () => {
    if (!contactSubject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!contactMessage.trim() && attachedFiles.length === 0) {
      toast.error("Please enter a message or attach files");
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call to send email
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would be an API call to your backend
      const emailData = {
        to: "4bstravelandtours.bondvoyage@gmail.com",
        from: `${userProfile.firstName} ${userProfile.lastName} <${userProfile.email}>`,
        subject: contactSubject,
        message: contactMessage,
        attachments: attachedFiles.length,
      };

      // Show success message
      toast.success("Email sent successfully!", {
        description: `Your message has been sent to 4B's Travel and Tours. ${
          attachedFiles.length > 0
            ? `(${attachedFiles.length} attachment(s) included)`
            : ""
        }`,
        duration: 5000,
      });

      // Clear form
      setContactSubject("");
      setContactMessage("");
      setAttachedFiles([]);
      setTextAlign("left");
      if (messageRef.current) {
        messageRef.current.innerHTML = "";
        messageRef.current.style.textAlign = "left";
      }
    } catch (error) {
      toast.error("Failed to send email", {
        description:
          "Please try again or contact support if the issue persists",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewFileUrl) {
        URL.revokeObjectURL(previewFileUrl);
      }
      // Clean up all file URLs
      attachedFiles.forEach((file) => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [previewFileUrl, attachedFiles]);

  // Get file type icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-purple-500" />;
    }
  };

  // Get file type name
  const getFileTypeName = (file: File) => {
    if (file.type.startsWith("image/")) {
      return "IMAGE";
    } else if (file.type === "application/pdf") {
      return "PDF";
    } else {
      return "DOCUMENT";
    }
  };

  // Get icon for file preview modal
  const getFilePreviewIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-white" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-white" />;
    } else {
      return <File className="h-5 w-5 text-white" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Profile Information Section */}
      <div
        className="mb-6 sm:mb-8 rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden min-h-[280px] sm:min-h-[340px] lg:min-h-[380px]"
        style={{
          background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
          boxShadow: `0 8px 32px var(--shadow-color-strong)`,
        }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl -translate-y-24 sm:-translate-y-32 translate-x-24 sm:translate-x-32" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-2xl translate-y-16 sm:translate-y-24 -translate-x-16 sm:-translate-x-24" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Left Side - Profile Info */}
          <div className="flex items-center gap-12 sm:gap-12 flex-1 pl-0 lg:pl-12 w-full lg:w-auto">
            {/* Profile Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-30 h-30 sm:w-34 sm:h-34 rounded-full border-4 border-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden ${
                  userProfileData && userProfileData.avatarUrl
                    ? ""
                    : "bg-primary"
                }`}
              >
                {userProfileData && userProfileData.avatarUrl ? (
                  <img
                    src={userProfileData.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                    {getInitials()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="max-w-md flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl text-white">
                  {userProfile.firstName} {userProfile.lastName}
                </h1>
              </div>
              <p className="text-white/90 text-sm sm:text-base mb-3 sm:mb-4">
                {userProfile.email}
              </p>
              {/* Quick Stats */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-white/70 whitespace-nowrap">
                      Owned Travel
                    </p>
                    <p className="text-sm text-white">
                      {userProfile.ownedTravel}
                    </p>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/20" />

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-white/70 whitespace-nowrap">
                      Collaborated Travel
                    </p>
                    <p className="text-sm text-white">
                      {userProfile.collaboratedTravel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Traveling Avatar */}
          <div className="flex-shrink-0 flex-1 w-full lg:w-1/2 min-w-[280px] sm:min-w-[320px]">
            <AdventureAvatar />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={FileText}
          label="Travel Plans"
          value="0"
          gradientFrom="#F472B6"
          gradientTo="#38BDF8"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value="0"
          gradientFrom="#F97316"
          gradientTo="#EF4444"
        />
        <StatCard
          icon={Plane}
          label="Active Bookings"
          value="0"
          gradientFrom="#14B8A6"
          gradientTo="#0A7AFF"
        />
        <StatCard
          icon={Award}
          label="Completed Trips"
          value="0"
          gradientFrom="#22C55E"
          gradientTo="#16A34A"
        />
      </div>

      {/* Recent Activity & Weather Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Widget - Right Half */}
        {/* Weather Widget - Right Half */}
        <ContentCard title="Weather">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleWeatherSearch()}
                  className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <button
                onClick={handleWeatherSearch}
                className="px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                  color: "white",
                }}
                disabled={weatherLoading}
              >
                {weatherLoading ? "Loading..." : "Search"}
              </button>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              {weatherLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading weather data...
                </div>
              ) : weatherError ? (
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <Cloud className="w-4 h-4" />
                  Error loading weather data
                </div>
              ) : weatherData ? (
                <>
                  Showing weather for:{" "}
                  <span className="text-primary font-semibold">
                    {selectedLocation}
                  </span>
                  <div className="text-xs mt-1">
                    Coordinates: {weatherData.coord.lat.toFixed(2)}°N,{" "}
                    {weatherData.coord.lon.toFixed(2)}°E
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 text-amber-500">
                  <Cloud className="w-4 h-4" />
                  Weather data unavailable
                </div>
              )}
            </div>

            {/* Current Weather */}
            {weatherData ? (
              <div
                className="p-6 rounded-2xl text-white shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Today</p>
                    <h2 className="text-4xl mb-1">
                      {Math.round(weatherData.main.temp)}°C
                    </h2>
                    <p className="text-sm opacity-90 capitalize">
                      {weatherData.weather[0]?.description || "Clear sky"}
                    </p>
                    <p className="text-sm opacity-75 mt-1">
                      Feels like: {Math.round(weatherData.main.feels_like)}°C
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                      {weatherData.weather[0]?.icon?.includes("01") ? (
                        <Sun
                          className="w-10 h-10 opacity-90"
                          strokeWidth={1.5}
                        />
                      ) : weatherData.weather[0]?.icon?.includes("02") ||
                        weatherData.weather[0]?.icon?.includes("03") ||
                        weatherData.weather[0]?.icon?.includes("04") ? (
                        <Cloud
                          className="w-10 h-10 opacity-90"
                          strokeWidth={1.5}
                        />
                      ) : weatherData.weather[0]?.icon?.includes("09") ||
                        weatherData.weather[0]?.icon?.includes("10") ||
                        weatherData.weather[0]?.icon?.includes("11") ? (
                        <CloudRain
                          className="w-10 h-10 opacity-90"
                          strokeWidth={1.5}
                        />
                      ) : weatherData.weather[0]?.icon?.includes("13") ? (
                        <span className="text-2xl">❄️</span>
                      ) : weatherData.weather[0]?.icon?.includes("50") ? (
                        <span className="text-2xl">🌫️</span>
                      ) : (
                        <Sun
                          className="w-10 h-10 opacity-90"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>
                    <p className="text-xs opacity-75">
                      {weatherData.weather[0]?.main || "Clear"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm pt-3 border-t border-white/20">
                  <div>
                    <p className="opacity-75 mb-1 text-xs">Humidity</p>
                    <p className="text-base">{weatherData.main.humidity}%</p>
                  </div>
                  <div>
                    <p className="opacity-75 mb-1 text-xs">Wind</p>
                    <p className="text-base">{weatherData.wind.speed} m/s</p>
                  </div>
                  <div>
                    <p className="opacity-75 mb-1 text-xs">Pressure</p>
                    <p className="text-base">{weatherData.main.pressure} hPa</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-3">
                  <div>
                    <p className="opacity-75 mb-1">Min Temp</p>
                    <p className="text-sm">
                      {Math.round(weatherData.main.temp_min)}°C
                    </p>
                  </div>
                  <div>
                    <p className="opacity-75 mb-1">Max Temp</p>
                    <p className="text-sm">
                      {Math.round(weatherData.main.temp_max)}°C
                    </p>
                  </div>
                </div>
              </div>
            ) : weatherLoading ? (
              <div className="p-6 rounded-2xl text-white shadow-lg bg-gradient-to-r from-gray-400 to-gray-500">
                <div className="flex items-center justify-center h-40">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm opacity-90">
                      Loading weather data...
                    </p>
                  </div>
                </div>
              </div>
            ) : weatherError ? (
              <div className="p-6 rounded-2xl text-white shadow-lg bg-gradient-to-r from-red-400 to-red-500">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <XCircle className="w-12 h-12 mb-3 opacity-90" />
                  <p className="font-medium mb-1">Failed to Load Weather</p>
                  <p className="text-sm opacity-75">
                    Please try refreshing or check your connection
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl text-amber-500 shadow-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Cloud className="w-12 h-12 mb-3 opacity-60" />
                  <p className="font-medium mb-1">Weather Unavailable</p>
                  <p className="text-sm opacity-75">
                    Please enable location services or search for a location
                    manually
                  </p>
                </div>
              </div>
            )}

            {/* Weather Details - Only show when we have data */}
            {weatherData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-accent">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Visibility
                  </p>
                  <p className="text-sm font-medium text-card-foreground">
                    {(weatherData.visibility / 1000).toFixed(1)} km
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Cloudiness
                  </p>
                  <p className="text-sm font-medium text-card-foreground">
                    {weatherData.clouds.all}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Sunrise</p>
                  <p className="text-sm font-medium text-card-foreground">
                    {new Date(
                      weatherData.sys.sunrise * 1000
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Sunset</p>
                  <p className="text-sm font-medium text-card-foreground">
                    {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* 7-Day Forecast - Using your mock data for now */}
            <div className="grid grid-cols-7 gap-2">
              {forecast.map((day, index) => {
                const Icon = day.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-2 bg-accent rounded-lg hover:bg-accent/80 transition-all"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {day.day}
                    </p>
                    <Icon
                      className={`w-6 h-6 mb-1 ${
                        day.condition === "Sunny"
                          ? "text-yellow-500"
                          : day.condition === "Rainy"
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                      strokeWidth={1.5}
                    />
                    <p className="text-xs text-card-foreground">{day.temp}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate("/user/weather")}
              className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2 border-t border-border pt-3"
            >
              View Full Forecast
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </ContentCard>

        {/* Recent Activity - Left Half */}
        <ContentCard
          title="Recent Activity"
          footer={
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/user/activity")}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                View Activity Log
              </button>
            </div>
          }
        >
          <div className="space-y-3 pt-2">
            {recentActivities.map((activity) => {
              let iconBgColor = "bg-blue-50";
              let iconColor = "text-blue-600";
              let IconComponent = CheckCircle;

              if (activity.icon === "clock") {
                iconBgColor = "bg-yellow-50";
                iconColor = "text-yellow-600";
                IconComponent = Clock;
              } else if (activity.icon === "cancel") {
                iconBgColor = "bg-red-50";
                iconColor = "text-red-600";
                IconComponent = XCircle;
              } else if (activity.icon === "itinerary") {
                iconBgColor = "bg-purple-50";
                iconColor = "text-purple-600";
                IconComponent = MapPin;
              } else if (activity.icon === "user") {
                iconBgColor = "bg-green-50";
                iconColor = "text-green-600";
                IconComponent = Users;
              } else if (activity.icon === "payment") {
                iconBgColor = "bg-emerald-50";
                iconColor = "text-emerald-600";
                IconComponent = TrendingUp;
              }

              return (
                <div
                  key={activity.id}
                  className="group rounded-xl border border-[#E5E7EB] hover:border-[#0A7AFF] bg-white hover:shadow-md transition-all duration-200 p-3 cursor-pointer"
                  onClick={() => navigate("/user/activity")}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg ${iconBgColor} flex items-center justify-center`}
                    >
                      <IconComponent className={`w-4 h-4 ${iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-0.5">
                        {activity.text}
                      </p>
                      {activity.timeAgo && (
                        <p className="text-xs text-gray-500">
                          {activity.timeAgo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state if no activities */}
            {recentActivities.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#F8FAFB] flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-[#94A3B8]" />
                </div>
                <p className="text-sm text-[#64748B] mb-2">
                  No recent activity
                </p>
                <p className="text-xs text-[#94A3B8]">
                  Activity will appear here
                </p>
              </div>
            )}
          </div>
        </ContentCard>
      </div>

      {/* Upcoming Trips */}
      <ContentCard title="Upcoming Trips" icon={Calendar}>
        {upcomingBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                opacity: 0.1,
              }}
            >
              <Calendar className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg text-card-foreground mb-2">
              No Upcoming Trips
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              You don't have any upcoming trips planned yet. Start planning your
              next adventure!
            </p>
            <button
              onClick={() => {
                navigate("/user/travels");
              }}
              className="px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                color: "white",
              }}
            >
              <Sparkles className="w-5 h-5" />
              Plan a Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((trip) => (
              <BookingListCard
                key={trip.id}
                booking={{
                  id: trip.id,
                  customer: userProfile.firstName + " " + userProfile.lastName,
                  email: userProfile.email,
                  mobile: "",
                  destination: trip.destination,
                  dates: trip.dates,
                  travelers: trip.travelers,
                  total: trip.amount,
                  bookedDate: trip.bookingDate,
                }}
                onViewDetails={() => navigate(`/user/bookings`)}
                additionalBadges={
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      trip.status === "confirmed"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
                    }`}
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                }
                userSide={true}
              />
            ))}
          </div>
        )}
      </ContentCard>

      {/* Travel Tips & Inspiration */}
      <ContentCard title="Travel Tips & Inspiration" icon={Sparkles}>
        <div className="space-y-4">
          {/* Tips Grid with Animation */}
          <motion.div
            key={currentTipBatch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {travelTips.map((tip, index) => {
              const colors = getColorClasses(tip.color);
              const Icon = tip.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`group p-5 rounded-xl border border-border ${colors.border} transition-all bg-gradient-to-br ${colors.bg} to-transparent hover:shadow-lg cursor-pointer`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{tip.emoji}</span>
                        <h4 className="text-sm text-card-foreground">
                          {tip.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tip.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Batch Indicators */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              {allTravelTips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTipBatch(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTipBatch
                      ? "w-8 bg-primary"
                      : "w-2 bg-border hover:bg-border/70"
                  }`}
                  title={`Page ${index + 1}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Page {currentTipBatch + 1} of {allTravelTips.length} • Changes
              every 20 seconds
            </p>
          </div>
        </div>
      </ContentCard>

      {/* Contact 4B's Travel and Tours Section */}
      <ContentCard title="Contact 4B's Travel and Tours" icon={Mail}>
        <div className="space-y-6">
          {/* Sender Info */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">From</p>
                <p className="text-card-foreground font-medium">
                  {userProfile.firstName} {userProfile.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.email}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground mb-1">To</p>
                <p className="text-card-foreground font-medium">
                  4B's Travel and Tours
                </p>
                <p className="text-sm text-muted-foreground">
                  4bstravelandtours.bondvoyage@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Subject
            </label>
            <input
              type="text"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="What's this about? (e.g., Booking Inquiry, Trip Feedback, General Question)"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Enhanced Rich Text Editor */}
          <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm relative">
            <label className="block text-sm font-medium text-card-foreground px-4 pt-4 mb-2">
              Message
            </label>

            {/* Enhanced Toolbar with Text Alignment */}
            <div className="flex flex-wrap items-center gap-1 p-3 bg-accent border-b border-border">
              {/* Font Formatting with Indicators */}
              <div className="flex items-center gap-1 border-r border-border pr-2">
                <button
                  onClick={() => handleFormat("bold")}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
                    isBold
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-card border border-transparent"
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFormat("italic")}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
                    isItalic
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-card border border-transparent"
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFormat("underline")}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
                    isUnderline
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-card border border-transparent"
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              {/* FIXED: Lists with proper indicators */}
              <div className="flex items-center gap-1 border-r border-border pr-2">
                <button
                  onClick={() => handleListInsert("unordered")}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
                    isBulletList
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-card border border-transparent"
                  }`}
                  title="Bulleted List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleListInsert("ordered")}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
                    isNumberedList
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-card border border-transparent"
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              {/* Text Alignment with Indicators */}
              <div className="flex items-center gap-1 border-r border-border pr-2">
                <button
                  onClick={() => handleTextAlignment("left")}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
                    textAlign === "left"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-card border border-transparent"
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTextAlignment("center")}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
                    textAlign === "center"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-card border border-transparent"
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTextAlignment("right")}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all ${
                    textAlign === "right"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-card border border-transparent"
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>

              {/* Enhanced Font Options */}
              <div className="flex items-center gap-2 border-r border-border pr-2">
                <select
                  onChange={(e) => handleFormat("fontName", e.target.value)}
                  className="px-2 py-1.5 bg-card border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary hover:border-primary/50 transition-colors"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Segoe UI', sans-serif">Segoe UI</option>
                  <option value="'Helvetica Neue', sans-serif">
                    Helvetica
                  </option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">
                    Times New Roman
                  </option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                </select>
                <select
                  onChange={(e) => handleFormat("fontSize", e.target.value)}
                  className="px-2 py-1.5 bg-card border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary hover:border-primary/50 transition-colors"
                >
                  <option value="1">8px</option>
                  <option value="2">10px</option>
                  <option value="3">12px</option>
                  <option value="4">14px</option>
                  <option value="5">16px</option>
                  <option value="6">18px</option>
                  <option value="7">24px</option>
                </select>
              </div>

              {/* Text Color */}
              <div className="flex items-center gap-1 border-r border-border pr-2">
                <input
                  type="color"
                  onChange={(e) => handleFormat("foreColor", e.target.value)}
                  className="w-9 h-9 cursor-pointer rounded border border-border hover:border-primary transition-colors"
                  title="Text Color"
                />
              </div>

              {/* Emoji Picker with positioning just below the icon */}
              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all border ${
                    showEmojiPicker
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "hover:bg-card border-transparent hover:border-border"
                  }`}
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Emoji Picker positioned directly below the icon */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute z-50 top-full left-0 mt-2"
                    >
                      <EmojiPicker
                        onEmojiClick={insertEmoji}
                        autoFocusSearch={false}
                        emojiStyle={EmojiStyle.NATIVE}
                        theme={Theme.AUTO}
                        width={350}
                        height={400}
                        previewConfig={{
                          showPreview: false,
                        }}
                        searchPlaceholder="Search emoji"
                        skinTonesDisabled
                        className="shadow-2xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enhanced File Attachment with indicator effect */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-9 h-9 flex items-center justify-center rounded transition-all border ${
                    attachedFiles.length > 0
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "hover:bg-card border-transparent hover:border-border"
                  }`}
                  title="Attach File"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,image/*"
                  onChange={handleFileAttach}
                  className="hidden"
                />
              </div>
            </div>

            {/* Text Alignment Indicator */}
            {showTextAlignIndicator && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-2 right-4 bg-primary text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg z-10"
              >
                Aligned {textAlign}
              </motion.div>
            )}

            {/* Enhanced Editor Area with FIXED Tab functionality */}
            <div
              ref={messageRef}
              contentEditable
              className="min-h-[200px] max-h-[300px] p-4 bg-card text-card-foreground focus:outline-none prose prose-sm max-w-none overflow-y-auto message-editor"
              placeholder="Type your message here... You can use the toolbar above to format your text, add lists, insert links, and attach files."
              onInput={(e) => {
                setContactMessage(e.currentTarget.innerHTML);
                updateFormattingIndicators();
              }}
              onKeyDown={handleTabIndent}
              onKeyUp={updateFormattingIndicators}
              onMouseUp={updateFormattingIndicators}
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                textAlign: textAlign,
              }}
            />

            <div className="px-4 py-2 border-t border-border bg-accent/50">
              <div className="text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-xs">
                      Tab
                    </kbd>{" "}
                    to indent
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>Shortcuts:</span>
                  <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-xs">
                    Ctrl+B
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-xs">
                    Ctrl+I
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-xs">
                    Ctrl+U
                  </kbd>
                </div>
                <div className="text-right">
                  {attachedFiles.length} file(s) attached • Click to preview
                </div>
              </div>
            </div>

            {/* Custom CSS for enhanced editor */}
            <style>{`
              .message-editor {
                min-height: 200px;
                max-height: 300px;
              }
              .message-editor:empty:before {
                content: attr(placeholder);
                color: #9ca3af;
                pointer-events: none;
                display: block;
              }
              .message-editor:focus {
                outline: none;
              }
              .message-editor ul {
                list-style-type: disc !important;
                padding-left: 1.5em !important;
                margin: 0.5em 0 !important;
              }
              .message-editor ol {
                list-style-type: decimal !important;
                padding-left: 1.5em !important;
                margin: 0.5em 0 !important;
              }
              .message-editor li {
                margin: 0.25em 0 !important;
              }
              .message-editor a.link-element {
                color: #3b82f6 !important;
                text-decoration: underline dashed !important;
                text-underline-offset: 2px !important;
              }
              .message-editor a.link-element:hover {
                color: #2563eb !important;
                text-decoration: underline solid !important;
              }
              .message-editor * {
                margin: 0;
                padding: 0;
              }
              .message-editor p {
                margin: 0.5em 0;
              }
              .message-editor h1, .message-editor h2, .message-editor h3 {
                margin: 0.75em 0 0.25em 0;
              }
            `}</style>
          </div>

          {/* Attached Files Preview - MOVED BELOW MESSAGE - Whole card clickable */}
          {attachedFiles.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden bg-gradient-to-br from-blue-500/5 to-primary/5">
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Attached Files ({attachedFiles.length})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click on any file to preview • Files will be included with
                    your email
                  </p>
                </div>
                <button
                  onClick={() => setAttachedFiles([])}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 hover:bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                {attachedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    onClick={() => previewAttachedFile(file)}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          file.type.startsWith("image/")
                            ? "bg-blue-500/10 text-blue-500"
                            : file.type === "application/pdf"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-purple-500/10 text-purple-500"
                        }`}
                      >
                        {getFileIcon(file)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)}KB •{" "}
                          {getFileTypeName(file)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachedFile(index);
                        }}
                        className="p-1.5 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border bg-accent/30">
                <p className="text-xs text-muted-foreground text-center">
                  Maximum 10MB per file • Supported: Images, PDF, Word documents
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Support: +63 123 456 7890 • Mon-Sun, 8AM-8PM
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setContactSubject("");
                  setContactMessage("");
                  setAttachedFiles([]);
                  setTextAlign("left");
                  if (messageRef.current) {
                    messageRef.current.innerHTML = "";
                    messageRef.current.style.textAlign = "left";
                  }
                  setIsBold(false);
                  setIsItalic(false);
                  setIsUnderline(false);
                  setIsBulletList(false);
                  setIsNumberedList(false);
                  toast.info("Form cleared");
                }}
                className="px-4 py-2.5 rounded-lg border border-border hover:bg-accent transition-all text-card-foreground hover:shadow-sm"
              >
                Clear
              </button>
              <button
                onClick={handleSendEmail}
                disabled={
                  isSending ||
                  (!contactSubject.trim() &&
                    !contactMessage.trim() &&
                    attachedFiles.length === 0)
                }
                className={`px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 min-w-[140px] justify-center ${
                  isSending ||
                  (!contactSubject.trim() &&
                    !contactMessage.trim() &&
                    attachedFiles.length === 0)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 active:scale-95"
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                  color: "white",
                }}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/5 to-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong>💡 Pro Tip:</strong> For urgent inquiries, mention
              "URGENT" in the subject line. Attach travel documents, photos, or
              itineraries if needed. Your email will be sent directly to 4B's
              Travel and Tours support team.
            </p>
          </div>
        </div>

        {/* File Preview Modal using ConfirmationModal */}
        <ConfirmationModal
          open={showFilePreview}
          onOpenChange={setShowFilePreview}
          title="File Preview"
          icon={
            previewFile ? (
              getFilePreviewIcon(previewFile)
            ) : (
              <Eye className="h-5 w-5 text-white" />
            )
          }
          iconGradient={
            previewFile?.type.startsWith("image/")
              ? "bg-gradient-to-r from-blue-500 to-cyan-500"
              : previewFile?.type === "application/pdf"
              ? "bg-gradient-to-r from-red-500 to-orange-500"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
          }
          iconShadow={
            previewFile?.type.startsWith("image/")
              ? "shadow-blue-500/30"
              : previewFile?.type === "application/pdf"
              ? "shadow-red-500/30"
              : "shadow-purple-500/30"
          }
          contentGradient="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
          contentBorder="border-gray-200 dark:border-gray-700"
          hideCancelButton={false}
          hideConfirmButton={false}
          confirmText="Download"
          cancelText="Close"
          confirmVariant="success"
          isLoading={false}
          onCancel={() => {
            setShowFilePreview(false);
            if (previewFileUrl) {
              URL.revokeObjectURL(previewFileUrl);
              setPreviewFileUrl("");
            }
          }}
          onConfirm={downloadFile}
          content={
            previewFile && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      previewFile.type.startsWith("image/")
                        ? "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30"
                        : previewFile.type === "application/pdf"
                        ? "bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30"
                        : "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
                    }`}
                  >
                    {getFileIcon(previewFile)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {previewFile.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(previewFile.size / 1024).toFixed(1)} KB •{" "}
                      {getFileTypeName(previewFile)}
                    </p>
                  </div>
                </div>

                {previewFile.type.startsWith("image/") ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={previewFileUrl}
                      alt={previewFile.name}
                      className="w-full max-h-[400px] object-contain bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                ) : previewFile.type === "application/pdf" ? (
                  <div className="h-[50vh]">
                    <iframe
                      src={previewFileUrl}
                      title={previewFile.name}
                      className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
                    <div className="flex flex-col items-center justify-center text-center">
                      <File className="h-16 w-16 text-purple-500 mb-4" />
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        Document preview not available
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Download the file to view its contents
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last modified:{" "}
                    {new Date(previewFile.lastModified).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => window.open(previewFileUrl, "_blank")}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in new tab
                  </button>
                </div>
              </div>
            )
          }
        />
      </ContentCard>
    </div>
  );
}
