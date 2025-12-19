import { useState, useEffect, useRef } from "react";
import {
  Bot,
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
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  lastUpdated: string;
  tags: string[];
  targetPages?: string[];
  pageKeywords?: string[];
  systemCategory?: string;
}

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  quickActions?: { label: string; icon: any; action: string }[];
  relatedFAQs?: FAQ[];
}

interface FAQAssistantProps {
  onClose?: () => void;
  onNavigate?: (path: string) => void;
  currentPage?: string;
}

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
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoadingFAQs, setIsLoadingFAQs] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load FAQs from localStorage (populated by admin)
  useEffect(() => {
    const loadFAQs = () => {
      try {
        const savedFAQs = localStorage.getItem("bondvoyage-faqs");
        if (savedFAQs) {
          const parsedFAQs = JSON.parse(savedFAQs);
          setFaqs(parsedFAQs);
        } else {
          // Default FAQs if none exist
          const defaultFAQs = [
            {
              id: "FAQ-USR-001",
              question: "How do I create a new travel plan?",
              answer:
                "Go to 'Travels' and click 'Create New Travel' or use 'Smart Trip' for AI-generated itineraries.",
              lastUpdated: "2024-12-01",
              tags: ["travel", "create", "planning"],
              targetPages: ["/user/travels", "/user/create-new-travel"],
              pageKeywords: ["create", "new", "plan"],
              systemCategory: "travel_creation",
            },
            {
              id: "FAQ-USR-002",
              question:
                "What's the difference between Standard and Customized itineraries?",
              answer:
                "Standard itineraries are pre-designed packages. Customized itineraries are built by you with AI assistance.",
              lastUpdated: "2024-12-01",
              tags: ["itinerary", "types", "customization"],
              targetPages: ["/user/travels", "/user/standard-itinerary"],
              pageKeywords: ["standard", "customized", "itinerary"],
              systemCategory: "travel_types",
            },
            {
              id: "FAQ-USR-003",
              question: "How do I edit my existing travel?",
              answer:
                "On the Travels page, find your travel and click the edit button. You can modify dates, activities, and other details.",
              lastUpdated: "2024-12-01",
              tags: ["travel", "edit", "modify"],
              targetPages: ["/user/travels"],
              pageKeywords: ["edit", "modify", "update", "travel"],
              systemCategory: "travel_management",
            },
            {
              id: "FAQ-USR-004",
              question: "How do I check my booking status?",
              answer:
                "Go to the Bookings page to see all your active bookings with their current status, or check your email for confirmation and updates.",
              lastUpdated: "2024-12-01",
              tags: ["booking", "status", "check"],
              targetPages: ["/user/bookings"],
              pageKeywords: ["booking", "status", "check"],
              systemCategory: "booking_management",
            },
            {
              id: "FAQ-USR-005",
              question: "How do I update my profile information?",
              answer:
                "Go to Profile page, click 'Edit Profile', make your changes, and save. You can update personal details, password, and notification preferences.",
              lastUpdated: "2024-12-01",
              tags: ["profile", "update", "edit"],
              targetPages: ["/user/profile/edit"],
              pageKeywords: ["profile", "update", "edit", "information"],
              systemCategory: "profile_management",
            },
          ];
          setFaqs(defaultFAQs);
          localStorage.setItem("bondvoyage-faqs", JSON.stringify(defaultFAQs));
        }
      } catch (error) {
        console.error("Error loading FAQs:", error);
      } finally {
        setIsLoadingFAQs(false);
      }
    };

    loadFAQs();

    // Listen for FAQ updates from admin
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bondvoyage-faqs") {
        loadFAQs();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Initialize with welcome message based on current page
  useEffect(() => {
    const pageName = getPageName(location.pathname);
    const welcomeMessage: Message = {
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
      suggestions: [], // Empty array
      quickActions: [], // Empty array
    };

    if (messages.length === 0) {
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

  // Get keywords for each page
  const getPageKeywords = (path: string): string[] => {
    const keywordMap: Record<string, string[]> = {
      "/user/travels": ["travel", "itinerary", "trip", "plan", "destination", "activity", "day", "create", "edit"],
      "/user/bookings": ["booking", "payment", "reservation", "confirm", "status", "cancel", "book", "reserve"],
      "/user/history": ["history", "past", "previous", "completed", "old", "archive", "completed", "past"],
      "/user/profile/edit": ["profile", "account", "settings", "password", "personal", "update", "change", "edit"],
      "/user/feedback": ["feedback", "review", "rating", "comment", "suggest", "report", "submit"],
      "/user/notifications": ["notification", "alert", "message", "reminder", "inbox", "notify"],
      "/user/weather": ["weather", "forecast", "temperature", "climate", "rain", "sunny", "forecast"],
      "/user/standard-itinerary": ["standard", "package", "pre-made", "template", "ready", "itinerary"],
      "/user/smart-trip": ["smart", "ai", "generate", "suggest", "automatic", "plan", "create", "trip"],
      "/user/create-new-travel": ["create", "new", "build", "custom", "design", "make", "travel", "plan"],
      "/user/home": ["dashboard", "home", "overview", "main", "welcome", "start"],
    };
    return keywordMap[path] || [];
  };

  // Enhanced FAQ search with page context
  const searchFAQs = (query: string, currentPath: string): FAQ[] => {
    if (!query.trim() || faqs.length === 0) return [];

    const lowerQuery = query.toLowerCase();
    
    // Score each FAQ based on relevance
    const scoredFAQs = faqs.map(faq => {
      let score = 0;
      
      // 1. Direct match in question (highest priority)
      if (faq.question.toLowerCase().includes(lowerQuery)) score += 10;
      
      // 2. Match in answer
      if (faq.answer.toLowerCase().includes(lowerQuery)) score += 5;
      
      // 3. Tag matches
      const tagMatches = faq.tags.filter(tag => 
        tag.toLowerCase().includes(lowerQuery)
      ).length;
      score += tagMatches * 3;
      
      // 4. Page relevance - check if FAQ is marked for current page
      if (faq.targetPages?.includes(currentPath)) {
        score += 8;
      }
      
      // 5. Auto-detect page relevance based on keywords
      const pageKeywords = getPageKeywords(currentPath);
      const keywordMatches = pageKeywords.filter(keyword =>
        lowerQuery.includes(keyword.toLowerCase()) ||
        faq.question.toLowerCase().includes(keyword.toLowerCase()) ||
        faq.answer.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += keywordMatches * 2;
      
      return { faq, score };
    });
    
    // Return top 3 results
    return scoredFAQs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.faq);
  };

  // Helper function to convert markdown-like formatting
  const formatMessageContent = (content: string): string => {
    // Remove ** formatting but keep the text
    return content.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  // Helper function to get suggestions based on user message
  const getSuggestionsForMessage = (userMessage: string, contextPath: string): string[] => {
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

    return [];
  };

  // Helper function to get quick actions for specific user requests
  const getQuickActionsForRequest = (userMessage: string): { label: string; icon: any; action: string }[] => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Map of keywords to quick actions
    const actionMap: Record<string, { label: string; icon: any; action: string }[]> = {
      // Feedback related
      "feedback": [
        { label: "Give Feedback", icon: MessageCircle, action: "/user/feedback" },
        { label: "My Feedback", icon: History, action: "view my feedback" },
        { label: "Rate Service", icon: Sparkles, action: "rate service" },
      ],
      "review": [
        { label: "Submit Review", icon: MessageCircle, action: "/user/feedback" },
        { label: "My Reviews", icon: History, action: "view my reviews" },
      ],
      "rate": [
        { label: "Rate Trip", icon: Sparkles, action: "/user/feedback" },
        { label: "Rating Scale", icon: HelpCircle, action: "rating system" },
      ],
      
      // Booking related
      "booking": [
        { label: "My Bookings", icon: Calendar, action: "/user/bookings" },
        { label: "New Booking", icon: Plus, action: "how to book" },
        { label: "Booking Status", icon: Bell, action: "check booking status" },
      ],
      "book": [
        { label: "Book Now", icon: Calendar, action: "/user/standard-itinerary" },
        { label: "My Bookings", icon: Calendar, action: "/user/bookings" },
        { label: "Booking Process", icon: HelpCircle, action: "booking process" },
      ],
      
      // Travel related
      "travel": [
        { label: "My Travels", icon: MapPin, action: "/user/travels" },
        { label: "New Travel", icon: Plus, action: "/user/create-new-travel" },
        { label: "Smart Trip", icon: Zap, action: "/user/smart-trip" },
      ],
      "trip": [
        { label: "Plan Trip", icon: MapPin, action: "/user/travels" },
        { label: "Smart Trip", icon: Zap, action: "/user/smart-trip" },
        { label: "Itineraries", icon: BookOpen, action: "/user/standard-itinerary" },
      ],
      
      // Profile related
      "profile": [
        { label: "Edit Profile", icon: User, action: "/user/profile/edit" },
        { label: "Account Settings", icon: Settings, action: "account settings" },
        { label: "Change Password", icon: Settings, action: "change password" },
      ],
      "account": [
        { label: "My Profile", icon: User, action: "/user/profile/edit" },
        { label: "Settings", icon: Settings, action: "account settings" },
        { label: "Security", icon: Settings, action: "account security" },
      ],
      
      // Payment related
      "payment": [
        { label: "Make Payment", icon: CreditCard, action: "make payment" },
        { label: "Payment Methods", icon: CreditCard, action: "payment methods" },
        { label: "Payment History", icon: History, action: "payment history" },
      ],
      "pay": [
        { label: "Pay Now", icon: CreditCard, action: "make payment" },
        { label: "Payment Options", icon: CreditCard, action: "payment methods" },
      ],
      
      // Weather related
      "weather": [
        { label: "Check Weather", icon: CloudSun, action: "/user/weather" },
        { label: "Weather Forecast", icon: CloudSun, action: "weather forecast" },
        { label: "Weather Alerts", icon: Bell, action: "weather alerts" },
      ],
      
      // History related
      "history": [
        { label: "Travel History", icon: History, action: "/user/history" },
        { label: "Past Trips", icon: History, action: "view past trips" },
        { label: "Completed Trips", icon: History, action: "completed trips" },
      ],
      "past": [
        { label: "History", icon: History, action: "/user/history" },
        { label: "Old Bookings", icon: History, action: "old bookings" },
      ],
      
      // Notification related
      "notification": [
        { label: "Notifications", icon: Bell, action: "/user/notifications" },
        { label: "Alerts", icon: Bell, action: "manage alerts" },
        { label: "Notification Settings", icon: Settings, action: "notification settings" },
      ],
      "alert": [
        { label: "View Alerts", icon: Bell, action: "/user/notifications" },
        { label: "Alert Settings", icon: Settings, action: "alert settings" },
      ],
    };

    // Find matching actions based on keywords
    for (const [keyword, actions] of Object.entries(actionMap)) {
      if (lowerMessage.includes(keyword)) {
        return actions;
      }
    }

    // Return empty array if no specific actions found
    return [];
  };

  // Generate AI response based on user input and context
  const generateAIResponse = (
    userMessage: string,
    contextPath: string
  ): Message => {
    const lowerMessage = userMessage.toLowerCase();
    const pageName = getPageName(contextPath);
    const matchedFAQs = searchFAQs(userMessage, contextPath);

    // Navigation requests
    if (
      lowerMessage.includes("go to") ||
      lowerMessage.includes("navigate") ||
      lowerMessage.includes("open") ||
      lowerMessage.includes("show me")
    ) {
      const navMap: Record<string, string> = {
        travel: "/user/travels",
        booking: "/user/bookings",
        profile: "/user/profile/edit",
        history: "/user/history",
        feedback: "/user/feedback",
        notification: "/user/notifications",
        weather: "/user/weather",
        standard: "/user/standard-itinerary",
        smart: "/user/smart-trip",
        dashboard: "/user/home",
        home: "/user/home",
        create: "/user/create-new-travel",
      };

      for (const [keyword, path] of Object.entries(navMap)) {
        if (lowerMessage.includes(keyword)) {
          setTimeout(() => navigate(path), 500);
          return {
            id: Date.now().toString(),
            type: "ai",
            content: `Taking you to the ${getPageName(path)} page...`,
            timestamp: new Date(),
            suggestions: [],
            quickActions: [],
          };
        }
      }
    }

    // Check for specific feature requests with quick actions
    const requestQuickActions = getQuickActionsForRequest(userMessage);
    const requestSuggestions = getSuggestionsForMessage(userMessage, contextPath);
    
    // Feedback requests
    if (
      lowerMessage.includes("feedback") ||
      lowerMessage.includes("review") ||
      lowerMessage.includes("rate") ||
      lowerMessage.includes("comment") ||
      lowerMessage.includes("suggestion")
    ) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `I can help you with feedback! You can:

1. **Give Feedback**: Share your travel experience and rate our service
2. **View Previous Feedback**: See all feedback you've submitted
3. **Edit Feedback**: Modify your previous feedback submissions

You can access the Feedback page directly from the sidebar or use the quick action below to go there now.`,
        timestamp: new Date(),
        suggestions: requestSuggestions,
        quickActions: [
          { label: "Go to Feedback", icon: MessageCircle, action: "/user/feedback" },
          { label: "Submit Feedback", icon: Plus, action: "submit feedback" },
          { label: "My Feedback", icon: History, action: "view my feedback" },
        ],
      };
    }

    // Booking requests
    if (
      lowerMessage.includes("booking") ||
      lowerMessage.includes("book") ||
      lowerMessage.includes("reservation")
    ) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `I can help you with bookings! You can:

1. **View Your Bookings**: See all your active and upcoming bookings
2. **Make a New Booking**: Book from Standard Itineraries or create custom travel
3. **Check Booking Status**: See the current status of your bookings
4. **Manage Bookings**: Modify or cancel existing bookings

Use the quick actions below to navigate to your bookings or learn more about the booking process.`,
        timestamp: new Date(),
        suggestions: requestSuggestions,
        quickActions: [
          { label: "My Bookings", icon: Calendar, action: "/user/bookings" },
          { label: "Book Now", icon: Plus, action: "/user/standard-itinerary" },
          { label: "Booking Status", icon: Bell, action: "booking status" },
        ],
      };
    }

    // Travel planning requests
    if (
      lowerMessage.includes("travel") ||
      lowerMessage.includes("trip") ||
      lowerMessage.includes("itinerary") ||
      lowerMessage.includes("plan") ||
      lowerMessage.includes("destination")
    ) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `I can help you plan your travel! You can:

1. **Create Custom Travel**: Build your own day-by-day itinerary
2. **Use Smart Trip**: Let AI generate a personalized itinerary for you
3. **Browse Standard Packages**: Choose from pre-designed travel packages
4. **Manage Existing Travels**: View and edit your current travel plans

Use the quick actions below to start planning your next adventure.`,
        timestamp: new Date(),
        suggestions: requestSuggestions,
        quickActions: [
          { label: "My Travels", icon: MapPin, action: "/user/travels" },
          { label: "New Travel", icon: Plus, action: "/user/create-new-travel" },
          { label: "Smart Trip", icon: Zap, action: "/user/smart-trip" },
        ],
      };
    }

    // Profile requests
    if (
      lowerMessage.includes("profile") ||
      lowerMessage.includes("account") ||
      lowerMessage.includes("settings") ||
      lowerMessage.includes("password") ||
      lowerMessage.includes("personal")
    ) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `I can help you with your profile! You can:

1. **Update Personal Information**: Change your name, email, phone number
2. **Change Password**: Update your account password
3. **Manage Settings**: Adjust notification preferences and account settings
4. **View Activity**: See your account activity log

Use the quick action below to go directly to your profile settings.`,
        timestamp: new Date(),
        suggestions: requestSuggestions,
        quickActions: [
          { label: "Edit Profile", icon: User, action: "/user/profile/edit" },
          { label: "Account Settings", icon: Settings, action: "account settings" },
          { label: "Change Password", icon: Settings, action: "change password" },
        ],
      };
    }

    // FAQ-based responses
    if (matchedFAQs.length > 0) {
      // Check if we have page-specific FAQs
      const pageSpecificFAQs = matchedFAQs.filter(faq => 
        faq.targetPages?.includes(contextPath)
      );
      
      if (pageSpecificFAQs.length > 0) {
        // Page-specific response
        const faqContent = pageSpecificFAQs
          .map((faq, index) => {
            const tags = faq.tags.length > 0 
              ? `\n📍 Tags: ${faq.tags.slice(0, 3).join(', ')}`
              : '';
            
            return `${index + 1}. ${faq.question}\n${faq.answer}${tags}`;
          })
          .join('\n\n');
        
        return {
          id: Date.now().toString(),
          type: "ai",
          content: `For the ${pageName} page:

Based on your question about "${userMessage}", here are specific answers for this page:

${faqContent}

💡 This information is specifically relevant to the features on this page.`,
          timestamp: new Date(),
          suggestions: requestSuggestions,
          relatedFAQs: pageSpecificFAQs,
          quickActions: requestQuickActions,
        };
      } else {
        // General FAQ response
        const faqContent = matchedFAQs
          .map((faq) => `${faq.question}\n${faq.answer}\n`)
          .join('\n');

        return {
          id: Date.now().toString(),
          type: "ai",
          content: `I found ${matchedFAQs.length} related FAQ${
            matchedFAQs.length > 1 ? "s" : ""
          }:

${faqContent}

Do you need more information about any of these?`,
          timestamp: new Date(),
          suggestions: requestSuggestions,
          relatedFAQs: matchedFAQs,
          quickActions: requestQuickActions,
        };
      }
    }

    // Page-specific help
    const pageHelp: Record<string, string> = {
      "/user/travels": `You're on the Travels page. Here you can:
• View all your travel plans
• Create new customized itineraries
• Browse standard itinerary packages
• Use Smart Trip AI generator
• Edit existing travel plans`,
      "/user/bookings": `You're on the Bookings page. Here you can:
• View all active bookings
• Check booking status and details
• Make payments
• Download booking documents
• Contact support for booking issues`,
      "/user/history": `You're on the Travel History page. Here you can:
• View completed and cancelled trips
• Access past travel documents
• Leave feedback for completed trips
• Re-book favorite itineraries`,
      "/user/profile/edit": `You're on the Edit Profile page. Here you can:
• Update personal information
• Change password and security settings
• Manage notification preferences
• View account activity log`,
      "/user/feedback": `You're on the Feedback page. Here you can:
• Submit feedback about your trips
• View previous feedback submissions
• See responses from our team
• Rate your travel experiences`,
      "/user/notifications": `You're on the Notifications page. Here you can:
• View all system notifications
• Mark notifications as read/unread
• Clear notification history
• Adjust notification settings`,
      "/user/weather": `You're on the Weather Forecast page. Here you can:
• Check 7-day weather forecasts
• Add weather info to your itineraries
• Set weather alerts for destinations
• Plan activities based on weather`,
      "/user/standard-itinerary": `You're on the Standard Itinerary page. Here you can:
• Browse pre-designed travel packages
• View package details and inclusions
• Book standard itineraries
• Compare different packages`,
      "/user/smart-trip": `You're on the Smart Trip Generator page. Here you can:
• Generate AI-powered itineraries
• Customize generated trips
• Save and edit AI suggestions
• Convert to bookings`,
      "/user/create-new-travel": `You're on the Create New Travel page. Here you can:
• Build custom day-by-day itineraries
• Add activities with times and locations
• Set travel dates and budget
• Save drafts or publish directly`,
    };

    if (pageHelp[contextPath]) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: pageHelp[contextPath],
        timestamp: new Date(),
        suggestions: requestSuggestions,
        quickActions: requestQuickActions,
      };
    }

    // General system help
    if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("support") ||
      lowerMessage.includes("assistance")
    ) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `I'm here to help! You can ask me about:

📋 System Features:
• How to create and manage travels
• Booking process and payments
• Profile and account settings
• Using Smart Trip AI generator

🗺️ Travel Planning:
• Destination recommendations
• Activity suggestions
• Weather information
• Travel tips and advice

🔧 Technical Support:
• Navigation assistance
• FAQ answers
• Feature explanations
• System troubleshooting

What specific help do you need?`,
        timestamp: new Date(),
        suggestions: [
          "How to book a trip?",
          "Update my profile",
          "Check weather forecast",
          "View my bookings",
          "Give feedback",
        ],
        quickActions: requestQuickActions,
      };
    }

    // Default response with context-aware quick actions
    return {
      id: Date.now().toString(),
      type: "ai",
      content: `I understand you're asking about "${userMessage}". I'm Roameo, your BondVoyage Assistant, here to help you navigate the system and plan your travels.

You're currently on the ${pageName} page. I can help you with:
• Understanding this page's features
• Finding answers in our FAQ database
• Navigating to other parts of the system
• General travel planning assistance

What would you like to know more about?`,
      timestamp: new Date(),
      suggestions: requestSuggestions,
      quickActions: requestQuickActions,
    };
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
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue, location.pathname);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleQuickAction = (action: string) => {
    if (action.startsWith("/")) {
      // Navigate to the page
      navigate(action);
      setIsOpen(false);
      toast.success(`Navigating to ${getPageName(action)}`);
    } else if (action === "submit feedback" || action === "give feedback") {
      // Specific action for feedback
      navigate("/user/feedback");
      setIsOpen(false);
      toast.success("Taking you to the Feedback page");
    } else if (action === "view my feedback" || action === "view my reviews") {
      // Navigate to feedback page
      navigate("/user/feedback");
      setIsOpen(false);
      toast.success("Taking you to your Feedback");
    } else if (action === "how to book" || action === "booking process") {
      // Provide information about booking process
      setInputValue("How do I book a trip?");
      setTimeout(() => handleSendMessage(), 100);
    } else if (action === "check booking status" || action === "booking status") {
      // Navigate to bookings page
      navigate("/user/bookings");
      setIsOpen(false);
      toast.success("Taking you to your Bookings");
    } else if (action === "make payment" || action === "pay now") {
      // Provide information about payments
      setInputValue("How do I make a payment?");
      setTimeout(() => handleSendMessage(), 100);
    } else if (action === "payment methods" || action === "payment options") {
      // Provide information about payment methods
      setInputValue("What payment methods are accepted?");
      setTimeout(() => handleSendMessage(), 100);
    } else if (action === "account settings" || action === "notification settings") {
      // Navigate to profile edit page
      navigate("/user/profile/edit");
      setIsOpen(false);
      toast.success("Taking you to Account Settings");
    } else if (action === "change password") {
      // Navigate to profile edit page (password section)
      navigate("/user/profile/edit");
      setIsOpen(false);
      toast.success("Taking you to Change Password");
    } else if (action === "weather forecast" || action === "check weather") {
      // Navigate to weather page
      navigate("/user/weather");
      setIsOpen(false);
      toast.success("Taking you to Weather Forecast");
    } else if (action === "view past trips" || action === "completed trips") {
      // Navigate to history page
      navigate("/user/history");
      setIsOpen(false);
      toast.success("Taking you to Travel History");
    } else {
      // For other text actions, set as input and send
      setInputValue(action);
      setTimeout(() => handleSendMessage(), 100);
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

            {/* Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(to bottom right, #0A7AFF, #10B981)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Tooltip */}
            <div
              className="absolute bottom-full mb-3 right-0 px-3 py-2 rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
              style={{ backgroundColor: "#1A2B4F" }}
            >
              ROAMEO - System Assistant
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
              {/* Animated Background */}
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
                    <p className="text-xs text-white/90">System Assistant</p>
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

                          {/* Related FAQs */}
                          {message.relatedFAQs &&
                            message.relatedFAQs.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-600 mb-2">
                                  {message.relatedFAQs.some(faq => 
                                    faq.targetPages?.includes(location.pathname)
                                  ) 
                                    ? "Page-Specific FAQs:"
                                    : "Related FAQs:"}
                                </p>
                                <div className="space-y-2">
                                  {message.relatedFAQs.map((faq) => {
                                    const isPageSpecific = faq.targetPages?.includes(location.pathname);
                                    return (
                                      <div
                                        key={faq.id}
                                        className={`p-2 rounded-lg border ${
                                          isPageSpecific
                                            ? "bg-green-50 border-green-200"
                                            : "bg-gray-50 border-gray-200"
                                        }`}
                                      >
                                        {isPageSpecific && (
                                          <div className="flex items-center gap-1 mb-1">
                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                                              Page-Specific
                                            </span>
                                          </div>
                                        )}
                                        <p className="text-xs font-medium text-gray-900">
                                          {faq.question}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          {faq.answer.substring(0, 80)}...
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {faq.tags.slice(0, 2).map((tag) => (
                                            <span
                                              key={tag}
                                              className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                        </motion.div>

                        {/* Suggestions */}
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

                        {/* Quick Actions - Only show if there are actions */}
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
                                      handleQuickAction(action.action)
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-white to-gray-50 border border-[#E5E7EB] flex items-center gap-1.5 text-xs text-[#1A2B4F] transition-all"
                                    style={{
                                      borderColor: "#10B981",
                                      boxShadow:
                                        "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                    }}
                                  >
                                    <Icon className="w-3 h-3" />
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

                  {isTyping && (
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
                  placeholder="Ask about features, navigation, or FAQs..."
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
                    disabled={!inputValue.trim() || isTyping}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}