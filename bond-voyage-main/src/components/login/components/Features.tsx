"use client";

import { useState } from "react";
import { 
  Wand2, 
  Route, 
  Ticket, 
  Clock, 
  CloudSun, 
  Languages, 
  Target, 
  LayoutGrid,
  BarChart3,
  Users,
  CheckCircle,
  Archive,
  MessageSquare,
  Briefcase,
  CalendarPlus,
  Settings,
  Star,
  MessagesSquare
} from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const userFeatures = [
  {
    icon: LayoutGrid,
    title: "Personal Dashboard",
    description: "Your travel hub overview",
  },
  {
    icon: Briefcase,
    title: "Travel Management",
    description: "Organize and manage your trips",
  },
  {
    icon: Wand2,
    title: "AI-Assisted Custom Itinerary",
    description: "Customize your itinerary with AI help",
  },
  {
    icon: Route,
    title: "Smart Trip Generator",
    description: "Automatic planning based on preferences",
  },
  {
    icon: Ticket,
    title: "Booking Management",
    description: "Track and manage all your reservations",
  },
  {
    icon: Clock,
    title: "Travel History",
    description: "Access past trips and memories",
  },
  {
    icon: MessagesSquare,
    title: "Inquiries Page",
    description: "Manage and communicate with admin about your inquiries",
  },
  {
    icon: Star,
    title: "User Feedback",
    description: "Share your travel experiences",
  },
  {
    icon: CloudSun,
    title: "Weather Forecasts",
    description: "Real-time climate data for destinations",
  },
  {
    icon: Languages,
    title: "Multi-Language Translation",
    description: "Foreign languages & PH dialects",
  },
  {
    icon: Target,
    title: "Decision Spinning Wheel",
    description: "Make trip decisions with an interactive wheel",
  },
];

const adminFeatures = [
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description: "System metrics and analytics",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Control accounts and permissions",
  },
  {
    icon: CheckCircle,
    title: "Booking Approvals",
    description: "Review and approve requests",
  },
  {
    icon: CalendarPlus,
    title: "Create Standard/Requested Itinerary",
    description: "Build custom and standard trip plans",
  },
  {
    icon: Settings,
    title: "Booking Management",
    description: "Oversee all booking operations",
  },
  {
    icon: Archive,
    title: "Bookings Archive",
    description: "Complete booking records",
  },
  {
    icon: MessagesSquare,
    title: "Inquiries Management",
    description: "Respond to and manage client inquiries",
  },
  {
    icon: MessageSquare,
    title: "Feedback Management",
    description: "Reviews and user responses",
  },
];

export function Features() {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <section id="features" style={{ paddingTop: "96px", paddingBottom: "96px", backgroundColor: "#FFFFFF" }}>
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{ fontSize: "32px", fontWeight: 600, color: "var(--deep-navy)" }}>
            Powerful Features for Everyone
          </h2>
        </motion.div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 h-auto p-1">
            <TabsTrigger 
              value="user" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              style={{ fontSize: "15px", fontWeight: 500, padding: "12px 24px" }}
            >
              👤 User Features
            </TabsTrigger>
            <TabsTrigger 
              value="admin"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              style={{ fontSize: "15px", fontWeight: 500, padding: "12px 24px" }}
            >
              🔧 Admin Features
            </TabsTrigger>
          </TabsList>

          {/* User Features Tab */}
          <TabsContent value="user">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
              {userFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white border border-[var(--silver)] rounded-xl p-8 hover:border-[var(--ocean-blue)] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  style={{ minHeight: "240px" }}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <feature.icon style={{ width: "32px", height: "32px", color: "var(--ocean-blue)" }} />
                  </div>

                  {/* Title */}
                  <h5 style={{ fontSize: "16px", fontWeight: 600, color: "var(--deep-navy)", marginBottom: "8px" }}>
                    {feature.title}
                  </h5>

                  {/* Description */}
                  <p style={{ fontSize: "14px", color: "var(--slate)", lineHeight: 1.5 }}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Admin Features Tab */}
          <TabsContent value="admin">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
              {adminFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white border border-[var(--silver)] rounded-xl p-8 hover:border-[var(--sunset-coral)] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  style={{ minHeight: "240px" }}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <feature.icon style={{ width: "32px", height: "32px", color: "var(--sunset-coral)" }} />
                  </div>

                  {/* Title */}
                  <h5 style={{ fontSize: "16px", fontWeight: 600, color: "var(--deep-navy)", marginBottom: "8px" }}>
                    {feature.title}
                  </h5>

                  {/* Description */}
                  <p style={{ fontSize: "14px", color: "var(--slate)", lineHeight: 1.5 }}>
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
