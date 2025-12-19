import { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, MapPin, Clock, Lightbulb, Calendar, X, Minimize2, Star, Compass, HelpCircle, Users, CloudSun, Wallet, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "motion/react";

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  description?: string;
}

interface Day {
  id: string;
  day: number;
  title: string;
  activities: Activity[];
}

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
}

export function AITravelAssistant({ 
  itineraryDays, 
  destination,
  onClose,
  onSuggestionApply
}: AITravelAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [visibleDays, setVisibleDays] = useState<number[]>([]);
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const DAYS_PER_BATCH = 4;

  // Initialize days based on itinerary
  useEffect(() => {
    if (itineraryDays.length > 0) {
      const dayNumbers = itineraryDays.map(day => day.day).sort((a, b) => a - b);
      setVisibleDays(dayNumbers);
      setSelectedDay(dayNumbers[0]);
      setCurrentBatch(0); // Start with first batch (days 1-4)
    } else {
      // Default to 4 days if no itinerary
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
      
      // Select first day of the new batch
      const batchDays = getBatchDays(nextBatch);
      if (batchDays.length > 0) {
        setSelectedDay(batchDays[0]);
      }
    } else {
      // If at the last batch, go back to first batch
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
      
      // Select first day of the new batch
      const batchDays = getBatchDays(prevBatch);
      if (batchDays.length > 0) {
        setSelectedDay(batchDays[0]);
      }
    } else {
      // If at the first batch, go to last batch
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
      content: `👋 Hi! I'm ROAMAN, your AI Travel Assistant for BondVoyage. I'm here to help you plan your perfect day in ${destination || 'the Philippines'}!\n\nI specialize in:\n• Planning daily itineraries (e.g., Day ${selectedDay})\n• Activity suggestions and recommendations\n• Time management and scheduling\n• Destination insights and local tips\n• Itinerary improvements\n\nWhat day would you like to plan?`,
      timestamp: new Date(),
      suggestions: [
        `Plan Day ${selectedDay}`,
        "Suggest activities",
        "Check schedule",
        "Destination tips"
      ]
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
    const day = itineraryDays.find(d => d.day === dayNumber);
    return {
      day: day,
      activities: day?.activities || [],
      hasActivities: day?.activities && day.activities.length > 0
    };
  };

  // Handle day selection from batch
  const handleDaySelection = (dayNum: number) => {
    setSelectedDay(dayNum);
  };

  // Function to render markdown bold text
  const renderMessageContent = (content: string) => {
    // Split by double asterisks but keep the asterisks for processing
    const parts = content.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      // Check if this part should be bold
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the asterisks and wrap in strong tag
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold">
            {boldText}
          </strong>
        );
      }
      // Return regular text
      return <span key={index}>{part}</span>;
    });
  };

  // Generate AI response based on user input and itinerary context
  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    const currentDay = getCurrentDayActivities();

    // Plan specific day itinerary
    if (lowerMessage.includes("plan") || lowerMessage.includes("day") || lowerMessage.includes("itinerary")) {
      // Extract day number if mentioned
      const dayMatch = lowerMessage.match(/day\s*(\d+)/i);
      if (dayMatch) {
        const dayNum = parseInt(dayMatch[1]);
        if (visibleDays.includes(dayNum)) {
          setSelectedDay(dayNum);
          
          // Calculate which batch this day belongs to
          const dayIndex = visibleDays.indexOf(dayNum);
          const batchIndex = Math.floor(dayIndex / DAYS_PER_BATCH);
          setCurrentBatch(batchIndex);
        } else {
          return {
            id: Date.now().toString(),
            type: "ai",
            content: `I don't see Day ${dayNum} in your itinerary. Your trip has ${visibleDays.length} day(s).\n\nWould you like to plan one of your current days instead?`,
            timestamp: new Date(),
            suggestions: getCurrentBatchDays().slice(0, 3).map(d => `Plan Day ${d}`).concat(["Show all days"])
          };
        }
      }

      if (currentDay.hasActivities) {
        const activities = currentDay.activities.map(a => 
          `• ${a.time} - ${a.title}${a.location ? ` (${a.location})` : ''}`
        ).join('\n');

        return {
          id: Date.now().toString(),
          type: "ai",
          content: `I see you already have plans for **Day ${selectedDay}**! Here's your current schedule:\n\n${activities}\n\nWould you like to:\n1. **Add more activities** to this day\n2. **Rearrange timing** for better flow\n3. **Get suggestions** for nearby attractions\n4. **Improve balance** between activities\n\nWhat would you like to do with Day ${selectedDay}?`,
          timestamp: new Date(),
          suggestions: [
            `Add to Day ${selectedDay}`,
            `Rearrange Day ${selectedDay}`,
            `Nearby Day ${selectedDay} activities`,
            `Balance Day ${selectedDay} schedule`
          ]
        };
      }
      
      // No activities for this day yet
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `Perfect! Let's plan **Day ${selectedDay}** in ${destination || 'the Philippines'}.\n\nTo create the perfect day, I need to know:\n\n🎯 **Trip Details:**\n1. **Arrival/Start time** on Day ${selectedDay}?\n2. **Main interests** (Beach, Adventure, Culture, Food, Shopping, Relaxation)?\n3. **Budget level** for this day (Budget, Mid-range, Luxury)?\n4. **Travel style** (Solo, Couple, Family, Friends)?\n\nTell me these details and I'll create a personalized hour-by-hour itinerary!`,
        timestamp: new Date(),
        suggestions: [
          "Beach day plan",
          "Adventure day plan",
          "Cultural day plan",
          "Food tour day plan"
        ]
      };
    }

    // Activity suggestions for current day
    if (lowerMessage.includes("suggest") || lowerMessage.includes("activity") || lowerMessage.includes("add") || lowerMessage.includes("do")) {
      const suggestions = getDaySpecificSuggestions(selectedDay, destination);
      
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `Here are perfect activities for **Day ${selectedDay}** in ${destination || 'the Philippines'}:\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nThese activities are selected specifically for Day ${selectedDay} considering:\n• Time of day optimization\n• Location proximity\n• Activity flow and balance\n• Local peak hours\n\nWhich activities would you like to add to Day ${selectedDay}?`,
        timestamp: new Date(),
        suggestions: [
          `Add morning to Day ${selectedDay}`,
          `Add afternoon to Day ${selectedDay}`,
          `Add evening to Day ${selectedDay}`,
          `Full Day ${selectedDay} plan`
        ]
      };
    }

    // Schedule check for specific day
    if (lowerMessage.includes("schedule") || lowerMessage.includes("time") || lowerMessage.includes("timing")) {
      if (!currentDay.hasActivities) {
        return {
          id: Date.now().toString(),
          type: "ai",
          content: `Let's plan the timing for **Day ${selectedDay}**! Here's a sample schedule structure:\n\n⏰ **Day ${selectedDay} Time Framework:**\n• **Morning (8-11 AM):** Active/Exploration activities\n• **Late Morning (11 AM-1 PM):** Cultural/Educational visits\n• **Lunch (1-3 PM):** Local dining experience\n• **Afternoon (3-5 PM):** Leisure/Relaxation activities\n• **Late Afternoon (5-7 PM):** Scenic/sunset viewing\n• **Evening (7-9 PM):** Dinner & entertainment\n• **Night (9 PM+):** Optional nightlife\n\nHow would you like to structure Day ${selectedDay}?`,
          timestamp: new Date(),
          suggestions: [
            `Morning Day ${selectedDay} plan`,
            `Afternoon Day ${selectedDay} plan`,
            `Evening Day ${selectedDay} plan`,
            `Full Day ${selectedDay} timing`
          ]
        };
      }

      // Analyze existing schedule
      const timeAnalysis = analyzeDaySchedule(currentDay.activities);
      
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `**Day ${selectedDay} Schedule Analysis:**\n\n${timeAnalysis}\n\n💡 **Suggestions for Day ${selectedDay}:**\n• ${getTimingSuggestions(currentDay.activities)}\n• ${getActivityBalanceSuggestions(currentDay.activities)}\n• ${getTravelTimeSuggestions(currentDay.activities)}\n\nWould you like to adjust any timing for Day ${selectedDay}?`,
        timestamp: new Date(),
        suggestions: [
          `Adjust Day ${selectedDay} timing`,
          `Add breaks to Day ${selectedDay}`,
          `Optimize Day ${selectedDay} flow`,
          `Check Day ${selectedDay} duration`
        ]
      };
    }

    // Destination tips
    if (lowerMessage.includes("tip") || lowerMessage.includes("advice") || lowerMessage.includes("recommend") || lowerMessage.includes("insight")) {
      const dayTips = getDaySpecificTips(selectedDay, destination);
      
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `**Day ${selectedDay} Travel Tips:**\n\n${dayTips}\n\n🎒 **Day ${selectedDay} Essentials:**\n• Morning: Sun protection, comfortable shoes\n• Afternoon: Water bottle, light snacks\n• Evening: Camera, local currency\n• All day: Charger, map, emergency contacts\n\nNeed more specific advice for Day ${selectedDay}?`,
        timestamp: new Date(),
        suggestions: [
          `Day ${selectedDay} packing`,
          `Day ${selectedDay} transportation`,
          `Day ${selectedDay} budget`,
          `Day ${selectedDay} local customs`
        ]
      };
    }

    // Handle specific day requests
    const dayRequestMatch = lowerMessage.match(/(?:day|day\s*)(\d+)/i);
    if (dayRequestMatch) {
      const dayNum = parseInt(dayRequestMatch[1]);
      
      if (visibleDays.includes(dayNum)) {
        setSelectedDay(dayNum);
        
        // Calculate which batch this day belongs to
        const dayIndex = visibleDays.indexOf(dayNum);
        const batchIndex = Math.floor(dayIndex / DAYS_PER_BATCH);
        setCurrentBatch(batchIndex);
        
        return {
          id: Date.now().toString(),
          type: "ai",
          content: `Switching to **Day ${dayNum}**!\n\nI'm now focused on planning Day ${dayNum} of your ${destination || 'Philippine'} adventure.\n\nWhat would you like to do for Day ${dayNum}?\n• Plan activities and timing\n• Get activity suggestions\n• Check schedule and flow\n• Get destination tips\n\nTell me what you need for Day ${dayNum}!`,
          timestamp: new Date(),
          suggestions: [
            `Plan Day ${dayNum}`,
            `Suggest Day ${dayNum} activities`,
            `Check Day ${dayNum} schedule`,
            `Day ${dayNum} tips`
          ]
        };
      } else {
        return {
          id: Date.now().toString(),
          type: "ai",
          content: `Day ${dayNum} isn't in your current itinerary. Your trip has ${visibleDays.length} day(s).\n\nUse the navigation buttons to see all your days, or tell me which day you'd like to plan!`,
          timestamp: new Date(),
          suggestions: [
            `Plan Day ${getCurrentBatchDays()[0]}`,
            "Show me all days",
            "How many days do I have?",
            "Help me choose a day"
          ]
        };
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: "ai",
      content: `I understand you're asking about "${userMessage}".\n\nI'm currently focused on helping you plan **Day ${selectedDay}** of your ${destination || 'Philippine'} trip.\n\nFor Day ${selectedDay}, I can help with:\n📝 **Planning** - Create hour-by-hour itinerary\n📍 **Activities** - Suggest perfect experiences\n⏰ **Timing** - Optimize schedule and flow\n💡 **Tips** - Local insights and advice\n\nWhat would you like to do for Day ${selectedDay}?`,
      timestamp: new Date(),
      suggestions: [
        `Plan Day ${selectedDay}`,
        `Suggest for Day ${selectedDay}`,
        `Schedule Day ${selectedDay}`,
        `Tips for Day ${selectedDay}`
      ]
    };
  };

  // Helper function: Get day-specific activity suggestions
  const getDaySpecificSuggestions = (dayNumber: number, destination?: string): string[] => {
    // Different suggestions based on day number
    const suggestionsByDay = {
      1: [
        "Morning: Arrival hotel check-in and orientation",
        "Late morning: Walking tour of nearby area",
        "Lunch: Try local specialty restaurant",
        "Afternoon: Visit iconic nearby attraction",
        "Evening: Sunset viewing at popular spot",
        "Dinner: Welcome meal at recommended restaurant"
      ],
      2: [
        "Morning: Adventure activity or beach time",
        "Late morning: Cultural/historical site visit",
        "Lunch: Street food market experience",
        "Afternoon: Leisure activity or shopping",
        "Evening: Local entertainment or show",
        "Dinner: Fine dining experience"
      ],
      3: [
        "Morning: Island hopping or day trip",
        "Late morning: Snorkeling/water activities",
        "Lunch: Beachfront seafood lunch",
        "Afternoon: Relaxation and beach time",
        "Evening: Sunset cruise or boat tour",
        "Dinner: Romantic dinner with views"
      ],
      4: [
        "Morning: Nature hike or exploration",
        "Late morning: Visit local village/market",
        "Lunch: Authentic local cuisine",
        "Afternoon: Spa or wellness activity",
        "Evening: Cultural performance",
        "Dinner: Farewell special dinner"
      ]
    };

    // Default suggestions for days beyond 4
    const defaultSuggestions = [
      "Morning: Explore new area or revisit favorite",
      "Late morning: Try adventure activity",
      "Lunch: Restaurant with local charm",
      "Afternoon: Relaxation or shopping",
      "Evening: Sunset photography session",
      "Dinner: Try highly-rated local spot"
    ];

    const daySuggestions = suggestionsByDay[dayNumber as keyof typeof suggestionsByDay] || defaultSuggestions;
    
    // Add destination context
    return destination 
      ? daySuggestions.map(s => s + (s.includes(":") ? ` in ${destination}` : ''))
      : daySuggestions;
  };

  // Helper function: Analyze day schedule
  const analyzeDaySchedule = (activities: Activity[]): string => {
    if (activities.length === 0) {
      return "No activities planned yet. Let's create your perfect day!";
    }

    const sortedActivities = [...activities].sort((a, b) => {
      const timeA = a.time ? parseInt(a.time.split(':')[0]) : 0;
      const timeB = b.time ? parseInt(b.time.split(':')[0]) : 0;
      return timeA - timeB;
    });

    let analysis = `**📅 ${activities.length} Activities Planned:**\n`;
    sortedActivities.forEach((activity, index) => {
      analysis += `\n${index + 1}. ${activity.time || 'Time TBD'} - ${activity.title}`;
      if (activity.location) analysis += ` (${activity.location})`;
    });

    // Check for gaps
    const times = sortedActivities.filter(a => a.time).map(a => {
      const hour = parseInt(a.time.split(':')[0]);
      return hour;
    });

    if (times.length > 1) {
      const gaps = [];
      for (let i = 0; i < times.length - 1; i++) {
        const gap = times[i + 1] - times[i];
        if (gap > 2) gaps.push(`${times[i]}:00-${times[i + 1]}:00`);
      }
      
      if (gaps.length > 0) {
        analysis += `\n\n⏳ **Time Gaps Found:** ${gaps.join(', ')}`;
        analysis += "\nConsider adding activities or meal times in these gaps.";
      }
    }

    return analysis;
  };

  // Helper function: Get timing suggestions
  const getTimingSuggestions = (activities: Activity[]): string => {
    const morningCount = activities.filter(a => {
      if (!a.time) return false;
      const hour = parseInt(a.time.split(':')[0]);
      return hour >= 6 && hour < 12;
    }).length;

    const afternoonCount = activities.filter(a => {
      if (!a.time) return false;
      const hour = parseInt(a.time.split(':')[0]);
      return hour >= 12 && hour < 18;
    }).length;

    const eveningCount = activities.filter(a => {
      if (!a.time) return false;
      const hour = parseInt(a.time.split(':')[0]);
      return hour >= 18;
    }).length;

    if (morningCount === 0) return "Add morning activities to start your day early";
    if (afternoonCount === 0) return "Include afternoon activities to maintain energy";
    if (eveningCount === 0) return "Plan evening activities for a complete day";
    
    return "Your timing is well-balanced across the day";
  };

  // Helper function: Get activity balance suggestions
  const getActivityBalanceSuggestions = (activities: Activity[]): string => {
    const activeCount = activities.filter(a => 
      a.title.toLowerCase().includes('hike') ||
      a.title.toLowerCase().includes('walk') ||
      a.title.toLowerCase().includes('tour') ||
      a.title.toLowerCase().includes('explore')
    ).length;

    const leisureCount = activities.filter(a => 
      a.title.toLowerCase().includes('relax') ||
      a.title.toLowerCase().includes('beach') ||
      a.title.toLowerCase().includes('spa') ||
      a.title.toLowerCase().includes('shop')
    ).length;

    const foodCount = activities.filter(a => 
      a.title.toLowerCase().includes('food') ||
      a.title.toLowerCase().includes('dinner') ||
      a.title.toLowerCase().includes('lunch') ||
      a.title.toLowerCase().includes('restaurant')
    ).length;

    if (activeCount > leisureCount + 2) return "Consider adding more leisure activities to balance active ones";
    if (foodCount === 0) return "Add meal times to your schedule";
    
    return "Good balance between active and leisure activities";
  };

  // Helper function: Get travel time suggestions
  const getTravelTimeSuggestions = (activities: Activity[]): string => {
    const locations = activities.filter(a => a.location).map(a => a.location);
    const uniqueLocations = [...new Set(locations)];
    
    if (uniqueLocations.length > 3) {
      return "You're visiting many locations - allow 30-60 minutes travel time between each";
    }
    
    return "Consider 15-30 minutes travel time between nearby locations";
  };

  // Helper function: Get day-specific tips
  const getDaySpecificTips = (dayNumber: number, destination?: string): string => {
    const tipsByDay = {
      1: `**Day 1 Arrival Tips:**\n• Arrive early to settle in\n• Keep first day light and flexible\n• Use this day to get oriented\n• Try local dinner for first impression\n• Rest well for the coming days`,
      2: `**Day 2 Exploration Tips:**\n• Start early to beat crowds\n• Wear comfortable walking shoes\n• Bring water and snacks\n• Take photos early when fresh\n• Ask locals for hidden gems`,
      3: `**Day 3 Adventure Tips:**\n• Check weather for outdoor plans\n• Book tours in advance\n• Pack swimwear if water activities\n• Bring waterproof bags\n• Stay hydrated throughout`,
      4: `**Day 4 Cultural Tips:**\n• Dress appropriately for sites\n• Learn basic local phrases\n• Respect customs and traditions\n• Support local artisans\n• Try authentic local food`
    };

    const defaultTips = `**Day ${dayNumber} General Tips:**\n• Review previous days' experiences\n• Adjust plans based on what you enjoyed\n• Allow some spontaneity\n• Stay flexible with timing\n• Enjoy every moment!`;

    const dayTips = tipsByDay[dayNumber as keyof typeof tipsByDay] || defaultTips;
    
    return destination ? `${dayTips}\n\n📍 **${destination} Specific:** Check local events happening today!` : dayTips;
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

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
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

  // Get current batch days
  const currentBatchDays = getCurrentBatchDays();
  const totalBatches = getTotalBatches();

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
            className="fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-[100] group"
            style={{
              background: 'linear-gradient(to bottom right, #10B981, #0A7AFF)',
              boxShadow: '0 25px 50px -12px rgba(255, 184, 77, 0.3)'
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

            {/* Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(to bottom right, #10B981, #0A7AFF)'
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Tooltip */}
            <div className="absolute bottom-full mb-3 right-0 px-3 py-2 rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
              style={{ backgroundColor: '#1A2B4F' }}
            >
              ROAMAN - AI Travel Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                style={{ borderTopColor: '#1A2B4F' }}
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
              y: isMinimized ? 20 : 0 
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[420px] h-[600px] rounded-2xl bg-white shadow-2xl border-2 border-[#E5E7EB] flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-4 overflow-hidden flex-shrink-0"
              style={{
                background: 'linear-gradient(to right, #10B981, #0A7AFF)'
              }}
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-11 h-11 rounded-xl backdrop-blur-sm flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
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
                    <p className="text-xs text-white/90">Day {selectedDay} Planning Assistant</p>
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
  {/* Day Selector with Batch Navigation - ALWAYS ON LEFT */}
  <div className="flex items-center justify-start gap-3 mb-2">
    <div className="flex items-center gap-2">
      <Calendar className="w-3.5 h-3.5 text-white/80" />
      <span className="text-xs text-white/90">Planning Day:</span>
    </div>
    
    <div className="flex items-center gap-1">
      {/* Previous Batch Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={goToPreviousBatch}
        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        title={`Previous batch`}
      >
        <ChevronLeft className="w-3.5 h-3.5 text-white" />
      </motion.button>
      
      {/* Visible Days */}
      <div className="flex gap-1">
        {currentBatchDays.map((dayNum) => (
          <motion.button
            key={dayNum}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDaySelection(dayNum)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedDay === dayNum
                ? 'bg-white text-[#0A7AFF] shadow-sm'
                : 'bg-white/20 text-white/90 hover:bg-white/30'
            }`}
          >
            Day {dayNum}
          </motion.button>
        ))}
      </div>
      
      {/* Next Batch Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={goToNextBatch}
        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        title={`Next batch`}
      >
        <ChevronRight className="w-3.5 h-3.5 text-white" />
      </motion.button>
    </div>
  </div>

  {/* Day Stats - Keeping Days, Activities, Locations */}
  <div className="grid grid-cols-3 gap-2">
    {(() => {
      const currentDay = getCurrentDayActivities();
      const totalDays = visibleDays.length;
      const stats = [
        { 
          icon: Calendar, 
          label: "Days", 
          value: totalDays,
          color: "#FFFFFF",
          tooltip: "Total days in your itinerary"
        },
        { 
          icon: MapPin, 
          label: "Locations", 
          value: [...new Set(currentDay.activities.filter(a => a.location).map(a => a.location))].length,
          color: "#FFFFFF",
          tooltip: "Different locations in Day " + selectedDay
        },
        { 
          icon: Star, 
          label: "Activities", 
          value: currentDay.activities.length,
          color: "#FFFFFF",
          tooltip: "Activities planned for Day " + selectedDay
        },
      ];
      return stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-2 rounded-lg backdrop-blur-sm text-center group relative"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          title={stat.tooltip}
        >
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <stat.icon className="w-3 h-3 text-white/80" />
            <span className="text-[10px] text-white/80">{stat.label}</span>
          </div>
          <p className="text-base text-white">{stat.value}</p>
        </motion.div>
      ));
    })()}
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
                      className={`flex gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.type === "ai" && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{
                            background: 'linear-gradient(to bottom right, #10B981, #0A7AFF)'
                          }}
                        >
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`flex-1 max-w-[85%] ${message.type === "user" ? "ml-auto" : ""}`}>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className={`p-3.5 rounded-2xl shadow-sm ${
                            message.type === "user"
                              ? "text-white ml-auto"
                              : "bg-white text-[#1A2B4F] border border-[#E5E7EB]"
                          }`}
                          style={message.type === "user" ? {
                            background: 'linear-gradient(to right, #10B981, #0A7AFF)'
                          } : {}}
                        >
                          <p className="text-sm whitespace-pre-line leading-relaxed">
                            {renderMessageContent(message.content)}
                          </p>
                        </motion.div>
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.suggestions.map((suggestion, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#1A2B4F] transition-all shadow-sm"
                                style={{
                                  borderColor: '#10B981',
                                  backgroundColor: 'rgba(16, 185, 129, 0.05)'
                                }}
                              >
                                {suggestion}
                              </motion.button>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-[10px] text-[#94A3B8] mt-1.5">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                        style={{
                          background: 'linear-gradient(to bottom right, #10B981, #0A7AFF)'
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
                              style={{ backgroundColor: '#10B981' }}
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
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
                  placeholder={`Ask about Day ${selectedDay} itinerary...`}
                  className="flex-1 h-11 rounded-xl border-2 border-[#E5E7EB] transition-all"
                  style={{
                    borderColor: '#10B981',
                    boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)'
                  }}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="h-11 w-11 rounded-xl text-white hover:shadow-lg transition-all disabled:opacity-50 p-0"
                    style={{
                      background: 'linear-gradient(to right, #10B981, #0A7AFF)',
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
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