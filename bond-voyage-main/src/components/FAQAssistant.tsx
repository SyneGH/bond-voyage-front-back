import { useState, useEffect, useRef } from "react";
import {
  Send,
  HelpCircle,
  BookOpen,
  Navigation,
  Settings,
  Calendar,
  X,
  Minimize2,
  MessageCircle,
  Zap,
  MapPin,
  Search,
  User,
  CreditCard,
  Globe,
  Bell,
  CloudSun,
  History,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRoameoChatbot } from "../hooks/useChatBot";
import { FAQSource } from "../types/types";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  quickActions?: {
    label: string;
    icon?: any;
    action: string;
    type?: "NAVIGATION" | "QUERY";
  }[];
  sources?: FAQSource[];
  confidence?: string;
}

interface FAQAssistantProps {
  onClose?: () => void;
  onNavigate?: (path: string) => void;
  currentPage?: string;
}

const CACHE_KEY = "roameo-chat-history";
const MAX_CACHED_MESSAGES = 20;
const CACHE_EXPIRY_HOURS = 24;

export function FAQAssistant({
  onClose,
  onNavigate,
  currentPage = "",
}: FAQAssistantProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, isPending } = useRoameoChatbot({
    onSuccess: (response) => {
      if (response.success && response.data) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: response.data.answer,
          timestamp: new Date(),
          confidence: response.data.confidence,
          sources: response.data.sources || [],
          suggestions: getSuggestionsForMessage(inputValue, location.pathname),
          quickActions: response.data.actions || [],
        };

        setMessages((prev) => {
          const updated = [...prev, aiMessage];
          saveChatHistory(updated);
          return updated;
        });
      }
      setIsTyping(false);
    },
    onError: (error: any) => {
      setIsTyping(false);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to get response from Roameo. Please try again.";
      toast.error(errorMessage);

      // Add error message to chat
      const errorMsg: Message = {
        id: Date.now().toString(),
        type: "system",
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  // Save chat history to localStorage
  const saveChatHistory = (msgs: Message[]) => {
    try {
      const historyData = {
        messages: msgs.slice(-MAX_CACHED_MESSAGES).map((msg) => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(historyData));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  // Load chat history from localStorage
  const loadChatHistory = (): Message[] => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return [];

      const historyData = JSON.parse(cached);
      const lastUpdated = new Date(historyData.lastUpdated);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      // Check if cache is expired
      if (hoursDiff > CACHE_EXPIRY_HOURS) {
        localStorage.removeItem(CACHE_KEY);
        return [];
      }

      return historyData.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error("Error loading chat history:", error);
      return [];
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      const welcomeMessage = getWelcomeMessage();
      setMessages([welcomeMessage]);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Error clearing chat history:", error);
      toast.error("Failed to clear chat history");
    }
  };

  // Get welcome message
  const getWelcomeMessage = (): Message => {
    const pageName = getPageName(location.pathname);
    return {
      id: "welcome",
      type: "ai",
      content: `👋 Hi! I'm Roameo, your BondVoyage Assistant. I'm here to help you navigate the system and answer your questions.

You're currently on the ${pageName} page. I can help you with:
• System navigation and features
• FAQ answers from our knowledge base
• Booking and travel planning
• Profile and account settings

How can I assist you today?`,
      timestamp: new Date(),
      suggestions: [],
      quickActions: [],
    };
  };

  // Initialize with welcome message and cached history
  useEffect(() => {
    const cachedMessages = loadChatHistory();
    const welcomeMessage = getWelcomeMessage();

    if (cachedMessages.length > 0) {
      // If there's cached history, show welcome + cached messages
      setMessages([welcomeMessage, ...cachedMessages]);
    } else {
      // Otherwise just show welcome
      setMessages([welcomeMessage]);
    }
  }, [location.pathname]);

  // Get page name from path
  const getPageName = (path: string): string => {
    const pageMap: Record<string, string> = {
      "/user/travels": "Travels",
      "/user/bookings": "Bookings",
      "/user/history": "Travel History",
      "/user/profile/edit": "Edit Profile",
      "/user/feedback": "Feedback",
      "/user/notifications": "Notifications",
      "/user/weather": "Weather Forecast",
      "/user/standard-itinerary": "Standard Itinerary",
      "/user/smart-trip": "Smart Trip Generator",
      "/user/create-new-travel": "Create New Travel",
      "/user/home": "Dashboard",
    };
    return pageMap[path] || "Dashboard";
  };

  // Helper function to convert markdown-like formatting
  const formatMessageContent = (content: string): string => {
    return content.replace(/\*\*(.*?)\*\*/g, "$1");
  };

  // Helper function to get suggestions based on user message
  const getSuggestionsForMessage = (
    userMessage: string,
    contextPath: string
  ): string[] => {
    const lowerMessage = userMessage.toLowerCase();

    // Context-based suggestions
    const pageName = getPageName(contextPath);
    if (pageName === "Travels") {
      return [
        "How to edit my travel?",
        "What is Standard Itinerary?",
        "How to create new travel?",
        "Travel planning tips",
      ];
    } else if (pageName === "Bookings") {
      return [
        "How to check booking status?",
        "Payment methods accepted",
        "Booking cancellation policy",
        "Modify booking details",
      ];
    } else if (pageName === "Feedback") {
      return [
        "How to submit feedback?",
        "Feedback response time",
        "Edit submitted feedback",
        "View feedback status",
      ];
    } else if (pageName === "Edit Profile") {
      return [
        "Update personal information",
        "Change password",
        "Manage notification settings",
        "Account security",
      ];
    }

    return [
      "How do I create a travel plan?",
      "Check my booking status",
      "Update my profile",
      "Give feedback",
    ];
  };

  // Helper function to get quick actions for specific user requests
  const getQuickActionsForRequest = (
    userMessage: string
  ): { label: string; icon: any; action: string }[] => {
    const lowerMessage = userMessage.toLowerCase();

    // Map of keywords to quick actions
    const actionMap: Record<
      string,
      { label: string; icon: any; action: string }[]
    > = {
      feedback: [
        {
          label: "Give Feedback",
          icon: MessageCircle,
          action: "/user/feedback",
        },
        { label: "My Feedback", icon: History, action: "/user/feedback" },
      ],
      booking: [
        { label: "My Bookings", icon: Calendar, action: "/user/bookings" },
        {
          label: "Book Now",
          icon: Plus,
          action: "/user/standard-itinerary",
        },
      ],
      travel: [
        { label: "My Travels", icon: MapPin, action: "/user/travels" },
        { label: "New Travel", icon: Plus, action: "/user/create-new-travel" },
        { label: "Smart Trip", icon: Zap, action: "/user/smart-trip" },
      ],
      profile: [
        { label: "Edit Profile", icon: User, action: "/user/profile/edit" },
        { label: "Settings", icon: Settings, action: "/user/profile/edit" },
      ],
      weather: [
        { label: "Check Weather", icon: CloudSun, action: "/user/weather" },
      ],
      history: [
        { label: "Travel History", icon: History, action: "/user/history" },
      ],
    };

    // Find matching actions based on keywords
    for (const [keyword, actions] of Object.entries(actionMap)) {
      if (lowerMessage.includes(keyword)) {
        return actions;
      }
    }

    return [];
  };

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

  const handleSendMessage = () => {
    if (!inputValue.trim() || isPending) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      saveChatHistory(updated);
      return updated;
    });

    const currentQuestion = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Send to API
    sendMessage({ question: currentQuestion });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleQuickAction = (
    actionLabel: string,
    actionObj: { action: string; type?: "NAVIGATION" | "QUERY" }
  ) => {
    if (actionObj.type === "NAVIGATION") {
      // Handle navigation actions - redirect to path
      if (actionObj.action.startsWith("/")) {
        navigate(actionObj.action);
        setIsOpen(false);
        toast.success(`Navigating to ${getPageName(actionObj.action)}`);
      }
    } else if (actionObj.type === "QUERY") {
      // Handle query actions - set as input and send message
      setInputValue(actionObj.action);
      setTimeout(() => handleSendMessage(), 100);
    } else {
      // Fallback: auto-detect based on path format
      if (actionObj.action.startsWith("/")) {
        navigate(actionObj.action);
        setIsOpen(false);
        toast.success(`Navigating to ${getPageName(actionObj.action)}`);
      } else {
        setInputValue(actionObj.action);
        setTimeout(() => handleSendMessage(), 100);
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <>
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
            className="fixed bottom-3 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-[100] group"
            style={{
              background: "linear-gradient(to bottom right, #0A7AFF, #10B981)",
              boxShadow: "0 25px 50px -12px rgba(10, 122, 255, 0.3)",
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
              <HelpCircle className="w-7 h-7 text-white" />
            </motion.div>

            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(to bottom right, #0A7AFF, #10B981)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div
              className="absolute bottom-full mb-3 right-0 px-3 py-2 rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
              style={{ backgroundColor: "#1A2B4F" }}
            >
              ROAMEO - AI-Powered FAQ and System Assistant
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
            className="fixed bottom-3 right-6 w-[420px] h-[600px] rounded-2xl bg-white shadow-2xl border-2 border-[#E5E7EB] flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div
              className="relative p-4 overflow-hidden flex-shrink-0"
              style={{
                background: "linear-gradient(to right, #0A7AFF, #10B981)",
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
                    <HelpCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-lg font-semibold">
                        ROAMEO
                      </h3>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-white/90">
                      AI-Powered FAQ and System Assistant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={clearChatHistory}
                    className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </motion.button>
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

              {/* Current Page Context */}
              <div
                className="relative mt-3 p-2 rounded-lg backdrop-blur-sm"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    {(() => {
                      const iconMap: Record<string, any> = {
                        "/user/travels": MapPin,
                        "/user/bookings": Calendar,
                        "/user/history": History,
                        "/user/profile/edit": User,
                        "/user/feedback": MessageCircle,
                        "/user/notifications": Bell,
                        "/user/weather": CloudSun,
                        "/user/standard-itinerary": BookOpen,
                        "/user/smart-trip": Zap,
                        "/user/create-new-travel": Plus,
                        "/user/home": Navigation,
                      };
                      const Icon = iconMap[location.pathname] || Navigation;
                      return <Icon className="w-4 h-4 text-white" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/80">Current Page</p>
                    <p className="text-sm font-medium text-white">
                      {getPageName(location.pathname)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden bg-gradient-to-b from-[#F8FAFB] to-white">
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
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{
                            background:
                              "linear-gradient(to bottom right, #0A7AFF, #10B981)",
                          }}
                        >
                          <HelpCircle className="w-4 h-4 text-white" />
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
                              : message.type === "system"
                              ? "bg-orange-50 text-orange-900 border border-orange-200"
                              : "bg-white text-[#1A2B4F] border border-[#E5E7EB]"
                          }`}
                          style={
                            message.type === "user"
                              ? {
                                  background:
                                    "linear-gradient(to right, #0A7AFF, #10B981)",
                                }
                              : {}
                          }
                        >
                          <p className="text-sm whitespace-pre-line leading-relaxed">
                            {formatMessageContent(message.content)}
                          </p>

                          {/* Sources (Similar FAQs) */}
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-600 mb-2">
                                📚 Related Sources:
                              </p>
                              <div className="space-y-2">
                                {message.sources.map((source) => (
                                  <div
                                    key={source.id}
                                    className="p-2 rounded-lg border bg-blue-50 border-blue-200"
                                  >
                                    <p className="text-xs font-medium text-gray-900">
                                      {source.question}
                                    </p>
                                    {source.answer && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {source.answer.substring(0, 100)}
                                        {source.answer.length > 100 && "..."}
                                      </p>
                                    )}
                                    {source.order && (
                                      <p className="text-[10px] text-gray-500 mt-1">
                                        Reference #{source.order}
                                      </p>
                                    )}
                                    {source.tags && source.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {source.tags.slice(0, 3).map((tag) => (
                                          <span
                                            key={tag}
                                            className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>

                        {/* Suggestions */}
                        {/* Suggestions - Enhanced Design */}
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
                        {/* Quick Actions */}
                        {message.quickActions &&
                          message.quickActions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.quickActions.map((action, idx) => {
                                const Icon = action.icon;
                                return (
                                  <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      handleQuickAction(action.label, action)
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-white to-gray-50 border border-[#E5E7EB] flex items-center gap-1.5 text-xs text-[#1A2B4F] transition-all"
                                    style={{
                                      borderColor: "#10B981",
                                      boxShadow:
                                        "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                    }}
                                  >
                                    {Icon && <Icon className="w-3 h-3" />}
                                    {action.label}
                                  </motion.button>
                                );
                              })}
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#64748B] to-[#475569] flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-xs text-white">You</span>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {(isTyping || isPending) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                        style={{
                          background:
                            "linear-gradient(to bottom right, #0A7AFF, #10B981)",
                        }}
                      >
                        <HelpCircle className="w-4 h-4 text-white" />
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
            <div className="p-4 border-t-2 border-[#E5E7EB] bg-white flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask me anything about BondVoyage..."
                  className="flex-1 h-11 rounded-xl border-2 border-[#E5E7EB] transition-all focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20"
                  disabled={isPending}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isPending}
                    className="h-11 w-11 rounded-xl text-white hover:shadow-lg transition-all disabled:opacity-50 p-0"
                    style={{
                      background: "linear-gradient(to right, #0A7AFF, #10B981)",
                      boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                Powered by Gemini and BondVoyage FAQ System
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
