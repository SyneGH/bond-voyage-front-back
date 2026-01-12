import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  X,
  Minimize2,
  Star,
  Users,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Day,
  RoamanRequest,
  DraftItinerary,
  RoamanResponse,
} from "../types/types";
import { useRoamanChatbot } from "../hooks/useChatBot";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AITravelAssistantProps {
  itineraryDays: Day[];
  destination?: string;
  onClose?: () => void;
  onSuggestionApply?: (suggestion: any) => void;
  onItineraryUpdate?: (updatedDays: Day[]) => void;
}

export function AITravelAssistant({
  itineraryDays,
  destination,
  onClose,
  onSuggestionApply,
  onItineraryUpdate,
}: AITravelAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [visibleDays, setVisibleDays] = useState<number[]>([]);
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const DAYS_PER_BATCH = 4;
  const [pendingDraft, setPendingDraft] = useState<DraftItinerary | null>(null);
  const [showDraftPreview, setShowDraftPreview] = useState(false);

  // Handle chatbot API response
  const handleChatbotResponse = (response: RoamanResponse) => {
    setIsTyping(false);

    if (!response.success) {
      toast.error("ROAMAN encountered an error. Please try again.");
      return;
    }

    const aiMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content: response.data.message,
      timestamp: new Date(),
      suggestions: response.data.suggestions,
    };

    setMessages((prev) => [...prev, aiMessage]);

    const draft = response.data.draft;
    if (draft) {
      setPendingDraft(draft);
      setShowDraftPreview(true);
    }
  };

  // Handle chatbot API error
  const handleChatbotError = (error: any) => {
    setIsTyping(false);
    toast.error("Failed to connect to ROAMAN. Please try again.");
    console.error("Chatbot error:", error);
  };

  // Initialize chatbot hook with callbacks
  const { mutate: sendChatMessage, isPending: isChatbotPending } =
    useRoamanChatbot({
      onSuccess: handleChatbotResponse,
      onError: handleChatbotError,
    });

  // Initialize days based on itinerary
  useEffect(() => {
    if (itineraryDays.length > 0) {
      const dayNumbers = itineraryDays
        .map((day) => day.dayNumber)
        .sort((a, b) => a - b);
      setVisibleDays(dayNumbers);
      setSelectedDay(dayNumbers[0]);
      setCurrentBatch(0);
    } else {
      const defaultDays = [1, 2, 3, 4];
      setVisibleDays(defaultDays);
      setCurrentBatch(0);
    }
  }, [itineraryDays]);

  // Get current batch of days
  const getCurrentBatchDays = () => {
    const startIndex = currentBatch * DAYS_PER_BATCH;
    const endIndex = startIndex + DAYS_PER_BATCH;
    return visibleDays.slice(startIndex, endIndex);
  };

  // Get total number of batches
  const getTotalBatches = () => {
    return Math.ceil(visibleDays.length / DAYS_PER_BATCH);
  };

  // Navigate to next batch
  const goToNextBatch = () => {
    const totalBatches = getTotalBatches();
    if (currentBatch < totalBatches - 1) {
      const nextBatch = currentBatch + 1;
      setCurrentBatch(nextBatch);
      const batchDays = getBatchDays(nextBatch);
      if (batchDays.length > 0) {
        setSelectedDay(batchDays[0]);
      }
    } else {
      setCurrentBatch(0);
      setSelectedDay(visibleDays[0]);
    }
  };

  // Navigate to previous batch
  const goToPreviousBatch = () => {
    const totalBatches = getTotalBatches();
    if (currentBatch > 0) {
      const prevBatch = currentBatch - 1;
      setCurrentBatch(prevBatch);
      const batchDays = getBatchDays(prevBatch);
      if (batchDays.length > 0) {
        setSelectedDay(batchDays[0]);
      }
    } else {
      const lastBatch = totalBatches - 1;
      setCurrentBatch(lastBatch);
      const lastBatchDays = getBatchDays(lastBatch);
      if (lastBatchDays.length > 0) {
        setSelectedDay(lastBatchDays[0]);
      }
    }
  };

  // Helper to get days for a specific batch
  const getBatchDays = (batchIndex: number) => {
    const startIndex = batchIndex * DAYS_PER_BATCH;
    const endIndex = startIndex + DAYS_PER_BATCH;
    return visibleDays.slice(startIndex, endIndex);
  };

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      type: "ai",
      content: `👋 Hi! I'm ROAMAN, your AI Travel Assistant for BondVoyage. I'm here to help you plan your perfect day in ${
        destination || "the Philippines"
      }!\n\nI specialize in:\n• Planning daily itineraries (e.g., Day ${selectedDay})\n• Activity suggestions and recommendations\n• Time management and scheduling\n• Destination insights and local tips\n• Itinerary improvements\n\nWhat day would you like to plan?`,
      timestamp: new Date(),
      suggestions: [
        `Plan Day ${selectedDay}`,
        "Suggest activities",
        "Check schedule",
        "Destination tips",
      ],
    };
    setMessages([welcomeMessage]);
  }, [destination, selectedDay]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Set unread when new AI message arrives and chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === "ai" && lastMessage.id !== "welcome") {
        setHasUnread(true);
      }
    }
  }, [messages, isOpen]);

  // Clear unread when opening chat
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  // Get current day's activities
  const getCurrentDayActivities = (dayNumber: number = selectedDay) => {
    const day = itineraryDays.find((d) => d.dayNumber === dayNumber);
    return {
      day: day,
      activities: day?.activities || [],
      hasActivities: day?.activities && day.activities.length > 0,
    };
  };

  // Handle day selection from batch
  const handleDaySelection = (dayNum: number) => {
    setSelectedDay(dayNum);
  };

  // Apply draft itinerary to parent component
  const applyDraftItinerary = () => {
    if (!pendingDraft || !pendingDraft.days || !onItineraryUpdate) return;

    // Convert draft format to Day format
    const updatedDays: Day[] = pendingDraft.days.map((day) => ({
      id: `day-${day.dayNumber}`,
      dayNumber: day.dayNumber,
      date: null, // You might want to set this based on your logic
      activities: (day.activities || []).map((activity, index) => ({
        id: `activity-${day.dayNumber}-${activity.order ?? index}`,
        time: activity.time,
        title: activity.title,
        description: activity.description || null,
        location: activity.location || null,
        icon: null, // Set default or from activity data
        order: activity.order ?? index,
      })),
    }));

    // Merge with existing days
    const mergedDays = [...itineraryDays];
    updatedDays.forEach((draftDay) => {
      const existingIndex = mergedDays.findIndex(
        (d) => d.dayNumber === draftDay.dayNumber
      );
      if (existingIndex >= 0) {
        mergedDays[existingIndex] = draftDay;
      } else {
        mergedDays.push(draftDay);
      }
    });

    // Sort by day number
    mergedDays.sort((a, b) => a.dayNumber - b.dayNumber);

    onItineraryUpdate(mergedDays);
    setShowDraftPreview(false);
    setPendingDraft(null);

    toast.success("Itinerary updated successfully!");

    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      type: "system",
      content: `✅ Your Day ${selectedDay} itinerary has been updated! Check your main itinerary to see the changes.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMessage]);
  };

  // Render markdown bold text
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold">
            {boldText}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Get current day activities for context
    const currentDayData = getCurrentDayActivities();

    // Prepare API request
    const chatRequest: RoamanRequest = {
      prompt: messageToSend,
      preferences: {
        selectedDay,
        destination,
        currentDayActivities: currentDayData.activities,
        totalDays: visibleDays.length,
      },
    };

    // Call chatbot API
    sendChatMessage(chatRequest);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setTimeout(() => setIsOpen(false), 200);
  };

  const currentBatchDays = getCurrentBatchDays();

  return (
    <>
      {/* Draft Itinerary Preview Dialog */}
      <AnimatePresence>
        {showDraftPreview && pendingDraft && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDraftPreview(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-110"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 max-h-[80vh] bg-white rounded-2xl shadow-2xl z-111 flex flex-col"
            >
              {/* Header */}
              <div
                className="p-6 rounded-t-2xl"
                style={{
                  background: "linear-gradient(to right, #10B981, #0A7AFF)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Draft Itinerary Preview
                    </h3>
                    <p className="text-sm text-white/90 mt-1">
                      Review the suggested changes before applying
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDraftPreview(false)}
                    className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {/* Destination Info */}
                  <div className="p-4 rounded-lg bg-linear-to-br from-[#F0FDF4] to-[#DBEAFE] border border-[#10B981]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm font-medium text-[#1A2B4F]">
                        Destination: {pendingDraft.destination}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0A7AFF]" />
                      <span className="text-sm font-medium text-[#1A2B4F]">
                        Travelers: {pendingDraft.travelers}
                      </span>
                    </div>
                  </div>

                  {/* Days */}
                  {pendingDraft.days?.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="border-2 border-[#E5E7EB] rounded-xl p-4 bg-white"
                    >
                      <h4 className="font-semibold text-[#1A2B4F] mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#10B981]" />
                        Day {day.dayNumber}
                      </h4>
                      <div className="space-y-2">
                        {day.activities?.map((activity, activityIndex) => (
                          <div
                            key={`activity-${day.dayNumber}-${activityIndex}`}
                            className="flex gap-3 p-3 rounded-lg bg-linear-to-br from-[#F8FAFB] to-white border border-[#E5E7EB]"
                          >
                            <div className="shrink-0 w-16 text-xs font-medium text-[#10B981] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.time}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#1A2B4F]">
                                {activity.title}
                              </p>
                              {activity.location && (
                                <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {activity.location}
                                </p>
                              )}
                              {activity.description && (
                                <p className="text-xs text-[#64748B] mt-1">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-6 border-t-2 border-[#E5E7EB] flex gap-3">
                <Button
                  onClick={() => setShowDraftPreview(false)}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-2 border-[#E5E7EB] hover:bg-[#F8FAFB]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={applyDraftItinerary}
                  className="flex-1 h-11 rounded-xl text-white"
                  style={{
                    background: "linear-gradient(to right, #10B981, #0A7AFF)",
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Apply to Itinerary
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
            className="fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-100 group"
            style={{
              background: "linear-gradient(to bottom right, #10B981, #0A7AFF)",
              boxShadow: "0 25px 50px -12px rgba(255, 184, 77, 0.3)",
            }}
          >
            {hasUnread && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] border-2 border-white flex items-center justify-center"
              >
                <span className="text-[10px] text-white">1</span>
              </motion.div>
            )}

            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bot className="w-7 h-7 text-white" />
            </motion.div>

            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(to bottom right, #10B981, #0A7AFF)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div
              className="absolute bottom-full mb-3 right-0 px-3 py-2 rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
              style={{ backgroundColor: "#1A2B4F" }}
            >
              ROAMAN - AI Travel Assistant
              <div
                className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                style={{ borderTopColor: "#1A2B4F" }}
              />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: isMinimized ? 0 : 1,
              scale: isMinimized ? 0.8 : 1,
              y: isMinimized ? 20 : 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-105 h-150 rounded-2xl bg-white shadow-2xl border-2 border-[#E5E7EB] flex flex-col z-100 overflow-hidden"
          >
            {/* Header */}
            <div
              className="relative p-4 overflow-hidden shrink-0"
              style={{
                background: "linear-gradient(to right, #10B981, #0A7AFF)",
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-11 h-11 rounded-xl backdrop-blur-sm flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
                      ROAMAN
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    </h3>
                    <p className="text-xs text-white/90">
                      Day {selectedDay} Planning Assistant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMinimize}
                    className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Minimize2 className="w-4 h-4 text-white" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleChat}
                    className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Day Selector and Stats */}
              <div className="relative mt-3">
                <div className="flex items-center justify-start gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-xs text-white/90">Planning Day:</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToPreviousBatch}
                      className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-white" />
                    </motion.button>

                    <div className="flex gap-1">
                      {currentBatchDays.map((dayNum, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDaySelection(dayNum)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            selectedDay === dayNum
                              ? "bg-white text-[#0A7AFF] shadow-sm"
                              : "bg-white/20 text-white/90 hover:bg-white/30"
                          }`}
                        >
                          Day {dayNum}
                        </motion.button>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToNextBatch}
                      className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(() => {
                    const currentDay = getCurrentDayActivities();
                    const totalDays = visibleDays.length;
                    const stats = [
                      {
                        icon: Calendar,
                        label: "Days",
                        value: totalDays,
                      },
                      {
                        icon: MapPin,
                        label: "Locations",
                        value: [
                          ...new Set(
                            currentDay.activities
                              .filter((a) => a.location)
                              .map((a) => a.location)
                          ),
                        ].length,
                      },
                      {
                        icon: Star,
                        label: "Activities",
                        value: currentDay.activities.length,
                      },
                    ];
                    return stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-2 rounded-lg backdrop-blur-sm text-center"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                      >
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <stat.icon className="w-3 h-3 text-white/80" />
                          <span className="text-[10px] text-white/80">
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-base text-white">{stat.value}</p>
                      </motion.div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden bg-linear-to-b from-[#F8FAFB] to-white">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-2 ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.type === "ai" && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md"
                          style={{
                            background:
                              "linear-gradient(to bottom right, #10B981, #0A7AFF)",
                          }}
                        >
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`flex-1 max-w-[85%] ${
                          message.type === "user" ? "ml-auto" : ""
                        }`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className={`p-3.5 rounded-2xl shadow-sm ${
                            message.type === "user"
                              ? "text-white ml-auto"
                              : "bg-white text-[#1A2B4F] border border-[#E5E7EB]"
                          }`}
                          style={
                            message.type === "user"
                              ? {
                                  background:
                                    "linear-gradient(to right, #10B981, #0A7AFF)",
                                }
                              : {}
                          }
                        >
                          <p className="text-sm whitespace-pre-line leading-relaxed">
                            {renderMessageContent(message.content)}
                          </p>
                        </motion.div>

                        {message.suggestions &&
                          message.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <motion.button
                                  key={idx}
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleSuggestionClick(suggestion)
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#1A2B4F] transition-all shadow-sm"
                                  style={{
                                    borderColor: "#10B981",
                                    backgroundColor: "rgba(16, 185, 129, 0.05)",
                                  }}
                                >
                                  {suggestion}
                                </motion.button>
                              ))}
                            </div>
                          )}

                        <p className="text-[10px] text-[#94A3B8] mt-1.5">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.type === "user" && (
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#64748B] to-[#475569] flex items-center justify-center shrink-0 shadow-md">
                          <span className="text-xs text-white">You</span>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {(isTyping || isChatbotPending) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md"
                        style={{
                          background:
                            "linear-gradient(to bottom right, #10B981, #0A7AFF)",
                        }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: "#10B981" }}
                              animate={{ y: [0, -8, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t-2 border-[#E5E7EB] bg-white shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={`Ask about Day ${selectedDay} itinerary...`}
                  className="flex-1 h-11 rounded-xl border-2 border-[#E5E7EB] transition-all"
                  style={{
                    borderColor: "#10B981",
                    boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.1)",
                  }}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !inputValue.trim() || isTyping || isChatbotPending
                    }
                    className="h-11 w-11 rounded-xl text-white hover:shadow-lg transition-all disabled:opacity-50 p-0"
                    style={{
                      background: "linear-gradient(to right, #10B981, #0A7AFF)",
                      boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
