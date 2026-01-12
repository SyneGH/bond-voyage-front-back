"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Route,
  Ticket,
  Clock,
  CloudSun,
  Languages,
  Target,
  Home,
  BarChart3,
  Users,
  CheckCircle,
  Archive,
  MessageSquare,
  Briefcase,
  CalendarPlus,
  FileText,
  Star,
  MessagesSquare,
  Bell,
  Map,
  Users2,
  Bot,
  FileEdit,
} from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { features } from "process";

const userFeatures = [
  {
  icon: Home,
  title: "User Dashboard",
  description: "Dashboard with profile stats, weather forecast, travel tips, and contact form",
  },
  {
    icon: MessagesSquare,
    title: "AI-Powered FAQ and System Assistant",
    description: "Get instant answers, guidance, and smart suggestions, especially for account features.",
  },
  {
    icon: Briefcase,
    title: "Travel Management",
    description: "Track and manage all your travel plans across different statuses - draft, pending, and rejected bookings",
  },
    {
    icon: Users2,
    title: "Create Collaborative Customized Itinerary", 
    description: "Create detailed day-by-day travel plans with friends in real-time",
  },
  {
    icon: Bot,
    title: "AI Travel Assistant",
    description: "Chat with AI to plan with day-by-day itinerary suggestions and guidance", 
  },
  {
    icon: Map,
    title: "Route Optimization & Map Routing",
    description: "Analyze and optimize daily routes to save travel time and create the most efficient itinerary with map visualization.",
  },
  {
    icon: Sparkles,
    title: "Smart Trip Generator",
    description: "Automatically generate itineraries based on user's travel preferences",
  },
  {
    icon: FileText,
    title: "Booking Management",
    description: "Manage your bookings with payment tracking, itinerary details, and trip status updates",
  },
  {
    icon: Clock,
    title: "Travel History",
    description: "Access past trips and memories",
  },
  {
    icon: Star,
    title: "User Feedback",
    description: "Share your travel experiences",
  },
  {
    icon: Bell,
    title: "Notification Management",
    description: "View and manage all your notifications at a glance.",
  },
  {
    icon: CloudSun,
    title: "Weather Forecasts",
    description: "Get real-time weather updates, detailed stats, and 7-day forecasts.",
  },
];

const adminFeatures = [
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description: "System metrics and analytics",
  },
  {
    icon: MessagesSquare,
    title: "FAQ Management",
    description: "Create, update, and manage frequently asked questions to quickly address user inquiries.",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Manage users, roles, status, and account details",
  },
  {
    icon: CalendarPlus,
    title: "Create Standard Itinerary",
    description: "Create polished, reusable itineraries for your travel packages",
  },
  {
    icon: FileEdit,
    title: "Create Requested Itinerary",
    description: "Create custom itineraries based on user requests",
  },
  {
    icon: Map,
    title: "Route Optimization & Map Routing",
    description: "Analyze and optimize daily routes to save travel time and create the most efficient itinerary with map visualization.",
  },
  {
    icon: Bot,
    title: "AI Travel Assistant",
    description: "Chat with AI to plan with day-by-day itinerary suggestions and guidance", 
  },
  {
    icon: CheckCircle,
    title: "Booking Approvals",
    description: "Review and manage booking approvals, rejections, and resolutions",
  },
  {
    icon: FileText,
    title: "Booking Management",
    description: "Comprehensive booking oversight with payment verification, itinerary viewing, status updates, and complete booking booking lifecycle",
  },
  {
    icon: Archive,
    title: "Bookings Archive",
    description: "View, search, filter, and export completed or cancelled bookings with statistics and detailed itineraries",
  },
  {
    icon: MessageSquare,
    title: "Feedback Management",
    description: "View, filter, and respond to customer feedback efficiently.",
  },
  {
    icon: Bell,
    title: "Notification Management",
    description: "View and manage all your notifications at a glance.",
  },
];

export function Features() {
  // Change default activeTab to "admin" to show admin features first
  const [activeTab, setActiveTab] = useState("admin");
  const { hash } = useLocation();

  useEffect(() => {
    const hashValue = decodeURIComponent(hash.substring(1));

    // Update the order of hash checks to match the new tab order
    if (hashValue === "admin features") {
      setActiveTab("admin");
    } else if (hashValue === "user features") {
      setActiveTab("user");
    }

    if (hashValue.includes("features")) {
      const element = document.getElementById("features");
      if (element) {
        requestAnimationFrame(() => {
          element.scrollIntoView({ behavior: "smooth" });
        });
      }
    }
  }, [hash]);

  return (
    <section
      id="features"
      style={{
        paddingTop: "96px",
        paddingBottom: "96px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "var(--deep-navy)",
            }}
          >
            Powerful Features for Everyone
          </h2>
        </motion.div>

        {/* Tabbed Interface - SWAPPED ORDER */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 h-auto p-1">
            {/* Admin tab first */}
            <TabsTrigger
              value="admin"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              style={{
                fontSize: "15px",
                fontWeight: 500,
                padding: "12px 24px",
              }}
            >
              🔧 Admin Features
            </TabsTrigger>
            {/* User tab second */}
            <TabsTrigger
              value="user"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              style={{
                fontSize: "15px",
                fontWeight: 500,
                padding: "12px 24px",
              }}
            >
              👤 User Features
            </TabsTrigger>
          </TabsList>

          {/* SWAPPED: Admin Features Tab FIRST - SWITCHED TO USER COLORS */}
          <TabsContent value="admin">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
              {adminFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  // SWITCHED: Now using ocean-blue for admin features
                  className="bg-white border border-(--silver) rounded-xl p-8 hover:border-(--ocean-blue) hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  style={{ minHeight: "240px" }}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <feature.icon
                      style={{
                        width: "32px",
                        height: "32px",
                        // SWITCHED: Now using ocean-blue for admin features
                        color: "var(--ocean-blue)",
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h5
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--deep-navy)",
                      marginBottom: "8px",
                    }}
                  >
                    {feature.title}
                  </h5>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--slate)",
                      lineHeight: 1.5,
                    }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* SWAPPED: User Features Tab SECOND - SWITCHED TO ADMIN COLORS */}
          <TabsContent value="user">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
              {userFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  // SWITCHED: Now using sunset-coral for user features
                  className="bg-white border border-(--silver) rounded-xl p-8 hover:border-(--sunset-coral) hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  style={{ minHeight: "240px" }}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <feature.icon
                      style={{
                        width: "32px",
                        height: "32px",
                        // SWITCHED: Now using sunset-coral for user features
                        color: "var(--sunset-coral)",
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h5
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--deep-navy)",
                      marginBottom: "8px",
                    }}
                  >
                    {feature.title}
                  </h5>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--slate)",
                      lineHeight: 1.5,
                    }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}