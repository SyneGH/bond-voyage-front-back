import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Users,
  CheckCircle,
  FileText,
  MessageSquare,
  LayoutDashboard,
  Calendar,
  BarChart3,
  HelpCircle,
} from "lucide-react";

type ActivityType =
  | "overview"
  | "users"
  | "approvals"
  | "itinerary"
  | "bookings"
  | "feedback"
  | "analytics"
  | "faq";

interface Activity {
  type: ActivityType;
  label: string;
  sublabel: string;
  icon: typeof Users;
  color: string;
}

const activities: Activity[] = [
  {
    type: "overview",
    label: "Dashboard Overview",
    sublabel: "Monitoring all activities",
    icon: LayoutDashboard,
    color: "#0A7AFF", // Ocean Blue
  },
  {
    type: "analytics",
    label: "Viewing Analytics",
    sublabel: "Performance reports",
    icon: BarChart3,
    color: "#F59E0B", // Orange
  },
  {
    type: "faq",
    label: "Managing FAQ",
    sublabel: "FAQ management",
    icon: HelpCircle,
    color: "#10B981", // Jade Green
  },
  {
    type: "users",
    label: "Managing Users",
    sublabel: "User details & status",
    icon: Users,
    color: "#EC4899", // Pink
  },
  {
    type: "approvals",
    label: "Approving Bookings",
    sublabel: "Approval of Customized Itinerary",
    icon: CheckCircle,
    color: "#FFB84D", // Golden Hour
  },
  {
    type: "itinerary",
    label: "Creating Itinerary",
    sublabel: "Standard and Requested itineraries",
    icon: FileText,
    color: "#14B8A6", // Tropical Teal
  },
  {
    type: "bookings",
    label: "Managing Bookings",
    sublabel: "Booking oversight",
    icon: Calendar,
    color: "#8B5CF6", // Purple
  },
  {
    type: "feedback",
    label: "Managing Feedback",
    sublabel: "Customer insights",
    icon: MessageSquare,
    color: "#FF6B6B", // Sunset Coral
  },
];

export function TravelingAvatar() {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const currentActivity = activities[currentActivityIndex];

  const handleActivityClick = () => {
    setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center gap-8 min-h-[300px]">
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-20 right-12 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Left Side: Activity Label and Buttons */}
      <div className="flex flex-col items-center gap-4 z-10">
        {/* Activity Label with Glassmorphism */}
        <motion.div
          key={`label-${currentActivity.type}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <currentActivity.icon
              className="w-4 h-4 text-white"
              strokeWidth={2.5}
            />
            <div className="text-left">
              <p className="text-white font-semibold text-sm leading-tight">
                {currentActivity.label}
              </p>
              <p className="text-white/70 text-xs leading-tight">
                {currentActivity.sublabel}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Activity Buttons */}
        <div className="grid grid-cols-4 gap-2 justify-items-center max-w-[200px]">
          {activities.map((activity, index) => (
            <motion.button
              key={activity.type}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentActivityIndex(index);
              }}
              className="group relative focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-2"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              title={activity.label}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index === currentActivityIndex
                    ? "bg-white shadow-lg"
                    : "bg-white/20 backdrop-blur-sm group-hover:bg-white/40"
                }`}
                style={{
                  borderColor:
                    index === currentActivityIndex
                      ? activity.color
                      : "transparent",
                  borderWidth: "2px",
                }}
              >
                <activity.icon
                  className="w-5 h-5 transition-colors duration-300"
                  style={{
                    color:
                      index === currentActivityIndex ? activity.color : "white",
                  }}
                  strokeWidth={2.5}
                />
              </div>

              {/* Tooltip on hover */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A2B4F] text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg"
              >
                {activity.label}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#1A2B4F] rotate-45" />
              </motion.div>
            </motion.button>
          ))}
        </div>

        {/* Click Hint */}
        <AnimatePresence>
          {currentActivityIndex === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60 text-xs"
            >
              👆 Click the avatar or buttons to explore!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side: Main Interactive Avatar Container */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={handleActivityClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity.type}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl"
            >
              {/* Glow Effect Background */}
              <motion.circle
                cx="110"
                cy="110"
                r="100"
                fill={currentActivity.color}
                opacity="0.1"
                animate={{
                  scale: isHovered ? [1, 1.1, 1] : 1,
                  opacity: isHovered ? [0.1, 0.2, 0.1] : 0.1,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Dashboard Overview - Monitoring */}
              {currentActivity.type === "overview" && (
                <g>
                  {/* Floating Dashboard Screens */}
                  <motion.g
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Main Screen */}
                    <rect
                      x="70"
                      y="80"
                      width="80"
                      height="60"
                      rx="8"
                      fill="white"
                    />
                    <rect
                      x="75"
                      y="85"
                      width="70"
                      height="4"
                      rx="2"
                      fill={currentActivity.color}
                      opacity="0.6"
                    />
                    <rect
                      x="75"
                      y="92"
                      width="50"
                      height="3"
                      rx="1.5"
                      fill="#E5E7EB"
                    />
                    <rect
                      x="75"
                      y="98"
                      width="60"
                      height="3"
                      rx="1.5"
                      fill="#E5E7EB"
                    />

                    {/* Dashboard Charts */}
                    <motion.g
                      animate={{
                        scaleY: [0.8, 1, 0.9, 1, 0.8],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ transformOrigin: "110px 125px" }}
                    >
                      <rect
                        x="80"
                        y="115"
                        width="6"
                        height="15"
                        rx="2"
                        fill={currentActivity.color}
                        opacity="0.8"
                      />
                      <rect
                        x="90"
                        y="110"
                        width="6"
                        height="20"
                        rx="2"
                        fill="#10B981"
                        opacity="0.8"
                      />
                      <rect
                        x="100"
                        y="120"
                        width="6"
                        height="10"
                        rx="2"
                        fill="#FFB84D"
                        opacity="0.8"
                      />
                      <rect
                        x="110"
                        y="105"
                        width="6"
                        height="25"
                        rx="2"
                        fill="#14B8A6"
                        opacity="0.8"
                      />
                      <rect
                        x="120"
                        y="112"
                        width="6"
                        height="18"
                        rx="2"
                        fill="#FF6B6B"
                        opacity="0.8"
                      />
                    </motion.g>
                  </motion.g>

                  {/* Floating Data Points */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.circle
                      key={`data-${i}`}
                      cx={90 + i * 15}
                      cy={70}
                      r="2"
                      fill={currentActivity.color}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.2, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: i * 0.3,
                      }}
                    />
                  ))}

                  {/* Analytics Sparkles */}
                  {[0, 1, 2].map((i) => (
                    <motion.path
                      key={`sparkle-${i}`}
                      d={`M ${160 + i * 12} ${
                        85 - i * 8
                      } l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z`}
                      fill={currentActivity.color}
                      opacity="0.7"
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.6,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Managing Users */}
              {currentActivity.type === "users" && (
                <g>
                  <motion.g
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* User Profile Card */}
                    <rect
                      x="60"
                      y="70"
                      width="100"
                      height="80"
                      rx="12"
                      fill="white"
                      opacity="0.95"
                    />

                    {/* Avatar */}
                    <circle
                      cx="110"
                      cy="95"
                      r="12"
                      fill={currentActivity.color}
                      opacity="0.3"
                    />
                    <circle cx="110" cy="95" r="8" fill="white" />
                    <circle cx="108" cy="93" r="1.5" fill="#1A2B4F" />
                    <circle cx="112" cy="93" r="1.5" fill="#1A2B4F" />
                    <path
                      d="M 107 96 Q 110 98 113 96"
                      stroke="#1A2B4F"
                      strokeWidth="1"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* User Info Lines */}
                    <rect
                      x="70"
                      y="112"
                      width="80"
                      height="4"
                      rx="2"
                      fill={currentActivity.color}
                      opacity="0.6"
                    />
                    <rect
                      x="80"
                      y="120"
                      width="60"
                      height="3"
                      rx="1.5"
                      fill="#E5E7EB"
                    />
                    <rect
                      x="75"
                      y="127"
                      width="70"
                      height="3"
                      rx="1.5"
                      fill="#E5E7EB"
                    />

                    {/* Action Buttons */}
                    <motion.rect
                      x="70"
                      y="137"
                      width="35"
                      height="8"
                      rx="4"
                      fill={currentActivity.color}
                      opacity="0.8"
                      animate={{
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                    <rect
                      x="115"
                      y="137"
                      width="35"
                      height="8"
                      rx="4"
                      fill="#E5E7EB"
                    />
                  </motion.g>

                  {/* User Icons Floating */}
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={`user-icon-${i}`}
                      cx={45 + i * 25}
                      cy={165}
                      r="6"
                      fill="white"
                      stroke={currentActivity.color}
                      strokeWidth="2"
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                    />
                  ))}

                  {/* Permission Checkmarks */}
                  {[0, 1].map((i) => (
                    <motion.path
                      key={`check-${i}`}
                      d={`M ${155} ${75 + i * 15} l 3 3 l 6 -6`}
                      stroke={currentActivity.color}
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{
                        pathLength: [0, 1],
                        opacity: [0, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 1,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Approving Bookings */}
              {currentActivity.type === "approvals" && (
                <g>
                  <motion.g
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Booking Documents Stack */}
                    <rect
                      x="75"
                      y="90"
                      width="70"
                      height="50"
                      rx="6"
                      fill="white"
                      opacity="0.4"
                    />
                    <rect
                      x="72"
                      y="85"
                      width="70"
                      height="50"
                      rx="6"
                      fill="white"
                      opacity="0.7"
                    />
                    <rect
                      x="69"
                      y="80"
                      width="70"
                      height="50"
                      rx="6"
                      fill="white"
                    />

                    {/* Document Content */}
                    <rect
                      x="75"
                      y="87"
                      width="40"
                      height="3"
                      rx="1.5"
                      fill={currentActivity.color}
                      opacity="0.6"
                    />
                    <rect
                      x="75"
                      y="93"
                      width="55"
                      height="2"
                      rx="1"
                      fill="#E5E7EB"
                    />
                    <rect
                      x="75"
                      y="98"
                      width="50"
                      height="2"
                      rx="1"
                      fill="#E5E7EB"
                    />
                    <rect
                      x="75"
                      y="103"
                      width="45"
                      height="2"
                      rx="1"
                      fill="#E5E7EB"
                    />
                    <rect
                      x="75"
                      y="108"
                      width="52"
                      height="2"
                      rx="1"
                      fill="#E5E7EB"
                    />
                  </motion.g>

                  {/* Approval Stamp Animation */}
                  <motion.g
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{
                      scale: [0, 1.2, 1],
                      rotate: [-15, -5, -10],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                    }}
                  >
                    <circle
                      cx="115"
                      cy="105"
                      r="18"
                      fill="none"
                      stroke={currentActivity.color}
                      strokeWidth="3"
                      opacity="0.6"
                    />
                    <motion.path
                      d="M 105 105 l 6 6 l 12 -12"
                      stroke={currentActivity.color}
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{
                        pathLength: [0, 1],
                      }}
                      transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                  </motion.g>

                  {/* Floating Approval Icons */}
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={`approval-${i}`}
                      cx={150 + i * 10}
                      cy={70 + i * 8}
                      r="3"
                      fill={currentActivity.color}
                      animate={{
                        y: [0, -20, -40],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: i * 0.4,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Creating Itinerary */}
              {currentActivity.type === "itinerary" && (
                <g>
                  <motion.g
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Document/Itinerary */}
                    <rect
                      x="65"
                      y="70"
                      width="90"
                      height="90"
                      rx="8"
                      fill="white"
                    />

                    {/* Title Line */}
                    <rect
                      x="72"
                      y="78"
                      width="55"
                      height="4"
                      rx="2"
                      fill={currentActivity.color}
                      opacity="0.7"
                    />

                    {/* Timeline Dots and Lines */}
                    {[0, 1, 2, 3].map((i) => (
                      <g key={`timeline-${i}`}>
                        <motion.circle
                          cx="78"
                          cy={95 + i * 14}
                          r="3"
                          fill={currentActivity.color}
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                        {i < 3 && (
                          <line
                            x1="78"
                            y1={98 + i * 14}
                            x2="78"
                            y2={95 + (i + 1) * 14}
                            stroke={currentActivity.color}
                            strokeWidth="1.5"
                            opacity="0.4"
                          />
                        )}
                        <rect
                          x="85"
                          y={92 + i * 14}
                          width="60"
                          height="2.5"
                          rx="1.25"
                          fill="#E5E7EB"
                        />
                        <rect
                          x="85"
                          y={96 + i * 14}
                          width="50"
                          height="2"
                          rx="1"
                          fill="#E5E7EB"
                          opacity="0.6"
                        />
                      </g>
                    ))}
                  </motion.g>

                  {/* Writing/Editing Pen */}
                  <motion.g
                    animate={{
                      x: [140, 145, 140],
                      y: [130, 135, 130],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <rect
                      x="145"
                      y="135"
                      width="4"
                      height="15"
                      rx="2"
                      fill={currentActivity.color}
                      transform="rotate(-45 147 142)"
                    />
                    <path
                      d="M 142 145 l -3 3 l 6 -1 Z"
                      fill={currentActivity.color}
                      opacity="0.8"
                    />
                  </motion.g>

                  {/* Sparkles from creation */}
                  {[0, 1, 2].map((i) => (
                    <motion.path
                      key={`create-sparkle-${i}`}
                      d={`M ${160 + i * 8} ${
                        100 - i * 10
                      } l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z`}
                      fill={currentActivity.color}
                      opacity="0.6"
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Managing Bookings */}
              {currentActivity.type === "bookings" && (
                <g>
                  <motion.g
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Calendar Base */}
                    <rect
                      x="65"
                      y="75"
                      width="90"
                      height="85"
                      rx="8"
                      fill="white"
                      opacity="0.95"
                    />

                    {/* Calendar Header */}
                    <rect
                      x="65"
                      y="75"
                      width="90"
                      height="15"
                      rx="8"
                      fill={currentActivity.color}
                      opacity="0.8"
                    />
                    <rect
                      x="73"
                      y="80"
                      width="4"
                      height="8"
                      rx="2"
                      fill="white"
                      opacity="0.7"
                    />
                    <rect
                      x="147"
                      y="80"
                      width="4"
                      height="8"
                      rx="2"
                      fill="white"
                      opacity="0.7"
                    />

                    {/* Calendar Days Grid */}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <rect
                        key={`day-${i}`}
                        x={73 + (i % 5) * 14}
                        y={98 + Math.floor(i / 5) * 14}
                        width="10"
                        height="10"
                        rx="2"
                        fill="#E5E7EB"
                        opacity="0.5"
                      />
                    ))}

                    {/* Highlighted Booking Days */}
                    {[2, 5, 8].map((i) => (
                      <motion.rect
                        key={`booked-${i}`}
                        x={73 + (i % 5) * 14}
                        y={98 + Math.floor(i / 5) * 14}
                        width="10"
                        height="10"
                        rx="2"
                        fill={currentActivity.color}
                        opacity="0.7"
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.7, 0.9, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}

                    {/* Booking confirmations checkmarks */}
                    {[2, 5, 8].map((i) => (
                      <motion.path
                        key={`check-booking-${i}`}
                        d={`M ${75 + (i % 5) * 14} ${
                          102 + Math.floor(i / 5) * 14
                        } l 2 2 l 4 -4`}
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{
                          pathLength: [0, 1],
                          opacity: [0, 1],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatDelay: 1.5,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </motion.g>

                  {/* Booking Notifications */}
                  {[0, 1, 2].map((i) => (
                    <motion.g
                      key={`notification-${i}`}
                      animate={{
                        x: [165, 180, 195],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.7,
                      }}
                    >
                      <circle
                        cx="165"
                        cy={85 + i * 15}
                        r="4"
                        fill={currentActivity.color}
                        opacity="0.8"
                      />
                      <path
                        d={`M ${163} ${85 + i * 15} l 1.5 1.5 l 3 -3`}
                        stroke="white"
                        strokeWidth="1"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </motion.g>
                  ))}

                  {/* Booking Count Badge */}
                  <motion.g
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <circle cx="145" cy="70" r="10" fill="#EF4444" />
                    <text
                      x="145"
                      y="74"
                      textAnchor="middle"
                      fill="white"
                      style={{ fontSize: "10px", fontWeight: "bold" }}
                    >
                      5
                    </text>
                  </motion.g>
                </g>
              )}

              {/* Answering Inquiries */}
              {currentActivity.type === "inquiries" && (
                <g>
                  <motion.g
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Email Inbox */}
                    <rect
                      x="60"
                      y="70"
                      width="100"
                      height="90"
                      rx="8"
                      fill="white"
                      opacity="0.95"
                    />

                    {/* Inbox Header */}
                    <rect
                      x="60"
                      y="70"
                      width="100"
                      height="18"
                      rx="8"
                      fill={currentActivity.color}
                      opacity="0.7"
                    />
                    <text
                      x="110"
                      y="82"
                      textAnchor="middle"
                      fill="white"
                      style={{ fontSize: "10px", fontWeight: "bold" }}
                    >
                      Inbox
                    </text>

                    {/* Email List Items */}
                    {[0, 1, 2, 3].map((i) => (
                      <g key={`email-${i}`}>
                        <rect
                          x="65"
                          y={95 + i * 16}
                          width="90"
                          height="14"
                          rx="4"
                          fill={i === 0 ? currentActivity.color : "#F3F4F6"}
                          opacity={i === 0 ? "0.2" : "0.5"}
                        />
                        <circle
                          cx="72"
                          cy={102 + i * 16}
                          r="3"
                          fill={i === 0 ? currentActivity.color : "#9CA3AF"}
                          opacity="0.8"
                        />
                        <rect
                          x="78"
                          y={98 + i * 16}
                          width="50"
                          height="2"
                          rx="1"
                          fill={i === 0 ? currentActivity.color : "#6B7280"}
                          opacity="0.6"
                        />
                        <rect
                          x="78"
                          y={102 + i * 16}
                          width="35"
                          height="2"
                          rx="1"
                          fill="#9CA3AF"
                          opacity="0.4"
                        />

                        {/* Unread badge */}
                        {i === 0 && (
                          <motion.circle
                            cx="148"
                            cy={102 + i * 16}
                            r="4"
                            fill="#EF4444"
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </g>
                    ))}
                  </motion.g>

                  {/* Typing Indicator */}
                  <motion.g
                    animate={{
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    <rect
                      x="85"
                      y="168"
                      width="50"
                      height="10"
                      rx="5"
                      fill={currentActivity.color}
                      opacity="0.2"
                    />
                    {[0, 1, 2].map((i) => (
                      <motion.circle
                        key={`dot-${i}`}
                        cx={95 + i * 8}
                        cy="173"
                        r="2"
                        fill={currentActivity.color}
                        animate={{
                          y: [0, -3, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.g>

                  {/* New Message Notifications */}
                  {[0, 1].map((i) => (
                    <motion.g
                      key={`new-msg-${i}`}
                      animate={{
                        y: [170, 160, 150],
                        x: [45 + i * 95, 50 + i * 95, 55 + i * 95],
                        opacity: [0, 0.8, 0],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 1,
                      }}
                    >
                      {/* Mail icon */}
                      <rect
                        x={45 + i * 95}
                        y="170"
                        width="12"
                        height="9"
                        rx="2"
                        fill={currentActivity.color}
                        opacity="0.8"
                      />
                      <path
                        d={`M ${45 + i * 95} ${170} l 6 4 l 6 -4`}
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </motion.g>
                  ))}

                  {/* Sparkles for answered inquiries */}
                  {[0, 1, 2].map((i) => (
                    <motion.path
                      key={`sparkle-inquiry-${i}`}
                      d={`M ${165 + i * 8} ${
                        75 - i * 8
                      } l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z`}
                      fill={currentActivity.color}
                      opacity="0.7"
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.6,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Managing Feedback */}
              {currentActivity.type === "feedback" && (
                <g>
                  <motion.g
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Feedback Bubble Main */}
                    <path
                      d="M 70 90 Q 70 75 85 75 L 135 75 Q 150 75 150 90 L 150 120 Q 150 135 135 135 L 95 135 L 85 145 L 85 135 Q 70 135 70 120 Z"
                      fill="white"
                      stroke={currentActivity.color}
                      strokeWidth="2"
                      opacity="0.95"
                    />

                    {/* Star Ratings */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.path
                        key={`star-${i}`}
                        d={`M ${
                          85 + i * 11
                        } 95 l 2 6 l 6 0 l -5 4 l 2 6 l -5 -3 l -5 3 l 2 -6 l -5 -4 l 6 0 Z`}
                        fill={currentActivity.color}
                        opacity="0.8"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}

                    {/* Feedback Text Lines */}
                    <rect
                      x="80"
                      y="115"
                      width="60"
                      height="2.5"
                      rx="1.25"
                      fill="#E5E7EB"
                    />
                    <rect
                      x="80"
                      y="121"
                      width="55"
                      height="2.5"
                      rx="1.25"
                      fill="#E5E7EB"
                    />
                    <rect
                      x="80"
                      y="127"
                      width="50"
                      height="2.5"
                      rx="1.25"
                      fill="#E5E7EB"
                    />
                  </motion.g>

                  {/* Additional Feedback Bubbles (smaller) */}
                  {[0, 1].map((i) => (
                    <motion.g
                      key={`bubble-${i}`}
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    >
                      <path
                        d={`M ${45 + i * 110} ${85 + i * 20} Q ${
                          45 + i * 110
                        } ${75 + i * 20} ${55 + i * 110} ${75 + i * 20} L ${
                          75 + i * 110
                        } ${75 + i * 20} Q ${85 + i * 110} ${75 + i * 20} ${
                          85 + i * 110
                        } ${85 + i * 20} L ${85 + i * 110} ${95 + i * 20} Q ${
                          85 + i * 110
                        } ${105 + i * 20} ${75 + i * 110} ${105 + i * 20} L ${
                          60 + i * 110
                        } ${105 + i * 20} L ${55 + i * 110} ${112 + i * 20} L ${
                          55 + i * 110
                        } ${105 + i * 20} Q ${45 + i * 110} ${105 + i * 20} ${
                          45 + i * 110
                        } ${95 + i * 20} Z`}
                        fill="white"
                        opacity="0.6"
                      />
                    </motion.g>
                  ))}

                  {/* Heart icons (positive feedback) */}
                  {[0, 1].map((i) => (
                    <motion.path
                      key={`heart-${i}`}
                      d={`M ${160 + i * 10} ${
                        80 + i * 15
                      } c -2 -2 -5 -2 -7 0 c -2 -2 -5 -2 -7 0 c -2 2 -2 5 0 7 l 7 7 l 7 -7 c 2 -2 2 -5 0 -7 Z`}
                      fill={currentActivity.color}
                      opacity="0.6"
                      animate={{
                        scale: [0, 1.2, 1, 0],
                        opacity: [0, 0.8, 0.6, 0],
                        y: [0, -15, -30, -45],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: i * 1,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Viewing Analytics */}
              {currentActivity.type === "analytics" && (
                <g>
                  {/* Analytics Dashboard */}
                  <motion.g
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Dashboard Container */}
                    <rect
                      x="60"
                      y="65"
                      width="100"
                      height="95"
                      rx="8"
                      fill="white"
                      opacity="0.95"
                    />

                    {/* Header */}
                    <rect
                      x="60"
                      y="65"
                      width="100"
                      height="15"
                      rx="8"
                      fill={currentActivity.color}
                      opacity="0.7"
                    />
                    <text
                      x="110"
                      y="76"
                      textAnchor="middle"
                      fill="white"
                      style={{ fontSize: "9px", fontWeight: "bold" }}
                    >
                      Analytics
                    </text>

                    {/* Bar Chart */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const heights = [25, 35, 20, 40, 30];
                      return (
                        <motion.rect
                          key={`bar-${i}`}
                          x={70 + i * 16}
                          y={125 - heights[i]}
                          width="10"
                          height={heights[i]}
                          rx="2"
                          fill={currentActivity.color}
                          opacity="0.7"
                          animate={{
                            height: [heights[i], heights[i] + 5, heights[i]],
                            y: [
                              125 - heights[i],
                              125 - heights[i] - 5,
                              125 - heights[i],
                            ],
                            opacity: [0.7, 0.9, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      );
                    })}

                    {/* Chart Base Line */}
                    <line
                      x1="65"
                      y1="125"
                      x2="155"
                      y2="125"
                      stroke="#E5E7EB"
                      strokeWidth="1.5"
                    />

                    {/* Stats Cards */}
                    <rect
                      x="70"
                      y="135"
                      width="35"
                      height="18"
                      rx="4"
                      fill={currentActivity.color}
                      opacity="0.15"
                    />
                    <rect
                      x="115"
                      y="135"
                      width="35"
                      height="18"
                      rx="4"
                      fill={currentActivity.color}
                      opacity="0.15"
                    />

                    {/* Stats Icons */}
                    <motion.circle
                      cx="78"
                      cy="144"
                      r="4"
                      fill={currentActivity.color}
                      opacity="0.8"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                    <motion.circle
                      cx="123"
                      cy="144"
                      r="4"
                      fill={currentActivity.color}
                      opacity="0.8"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.5,
                      }}
                    />

                    {/* Stats Text Lines */}
                    <rect
                      x="85"
                      y="141"
                      width="15"
                      height="2"
                      rx="1"
                      fill={currentActivity.color}
                      opacity="0.5"
                    />
                    <rect
                      x="85"
                      y="145"
                      width="12"
                      height="1.5"
                      rx="0.75"
                      fill="#9CA3AF"
                      opacity="0.4"
                    />
                    <rect
                      x="130"
                      y="141"
                      width="15"
                      height="2"
                      rx="1"
                      fill={currentActivity.color}
                      opacity="0.5"
                    />
                    <rect
                      x="130"
                      y="145"
                      width="12"
                      height="1.5"
                      rx="0.75"
                      fill="#9CA3AF"
                      opacity="0.4"
                    />
                  </motion.g>

                  {/* Trend Arrows */}
                  {[0, 1].map((i) => (
                    <motion.g
                      key={`trend-${i}`}
                      animate={{
                        y: [0, -5, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    >
                      <path
                        d={`M ${165 + i * 12} ${
                          90 + i * 20
                        } l 0 -8 l 3 4 l -3 -4 l -3 4`}
                        stroke={currentActivity.color}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.g>
                  ))}

                  {/* Percentage Indicators */}
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={`percent-${i}`}
                      cx={45 + i * 15}
                      cy={80 + i * 12}
                      r="3"
                      fill={currentActivity.color}
                      opacity="0.6"
                      animate={{
                        scale: [0, 1.3, 0],
                        opacity: [0, 0.8, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Managing FAQ */}
              {currentActivity.type === "faq" && (
                <g>
                  <motion.g
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* FAQ Container */}
                    <rect
                      x="65"
                      y="70"
                      width="90"
                      height="90"
                      rx="10"
                      fill="white"
                      opacity="0.95"
                    />

                    {/* FAQ Header */}
                    <rect
                      x="65"
                      y="70"
                      width="90"
                      height="18"
                      rx="10"
                      fill={currentActivity.color}
                      opacity="0.8"
                    />
                    <text
                      x="110"
                      y="82"
                      textAnchor="middle"
                      fill="white"
                      style={{ fontSize: "10px", fontWeight: "bold" }}
                    >
                      FAQ
                    </text>

                    {/* FAQ Items */}
                    {[0, 1, 2].map((i) => (
                      <g key={`faq-${i}`}>
                        {/* Question Bubble */}
                        <motion.rect
                          x="75"
                          y={95 + i * 18}
                          width="70"
                          height="14"
                          rx="7"
                          fill={currentActivity.color}
                          opacity="0.15"
                          animate={{
                            scaleX: [1, 1.02, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                        
                        {/* Question Mark Icon */}
                        <motion.path
                          d={`M ${
                            80 + i * 2
                          } ${104 + i * 18} a 1.5 1.5 0 0 1 0 3 a 1.5 1.5 0 0 1 0 -3 M ${
                            78 + i * 2
                          } ${98 + i * 18} a 3 3 0 0 1 6 0 a 3 3 0 0 1 -3 3 v 3`}
                          stroke={currentActivity.color}
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          animate={{
                            rotate: [0, 5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                        
                        {/* Question Text */}
                        <rect
                          x="88"
                          y={99 + i * 18}
                          width="52"
                          height="2"
                          rx="1"
                          fill="#6B7280"
                          opacity="0.7"
                        />
                        <rect
                          x="88"
                          y={103 + i * 18}
                          width="45"
                          height="1.5"
                          rx="0.75"
                          fill="#9CA3AF"
                          opacity="0.5"
                        />
                        
                        {/* Answer Indicator */}
                        <motion.circle
                          cx="140"
                          cy={104 + i * 18}
                          r="4"
                          fill="#10B981"
                          opacity="0.7"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.4,
                          }}
                        />
                        <path
                          d={`M ${138} ${104 + i * 18} l 2 2 l 4 -4`}
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    ))}

                    {/* Add FAQ Button */}
                    <motion.rect
                      x="85"
                      y="155"
                      width="50"
                      height="8"
                      rx="4"
                      fill={currentActivity.color}
                      opacity="0.8"
                      animate={{
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                    <text
                      x="110"
                      y="160"
                      textAnchor="middle"
                      fill="white"
                      style={{ fontSize: "8px", fontWeight: "bold" }}
                    >
                      + Add FAQ
                    </text>
                  </motion.g>

                  {/* Floating Question Marks */}
                  {[0, 1, 2].map((i) => (
                    <motion.text
                      key={`float-q-${i}`}
                      x={50 + i * 40}
                      y={170 + i * 5}
                      textAnchor="middle"
                      fill={currentActivity.color}
                      opacity="0.6"
                      style={{ fontSize: "20px", fontWeight: "bold" }}
                      animate={{
                        y: [170 + i * 5, 160 + i * 5, 170 + i * 5],
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      ?
                    </motion.text>
                  ))}

                  {/* Knowledge Sparkles */}
                  {[0, 1, 2].map((i) => (
                    <motion.path
                      key={`faq-sparkle-${i}`}
                      d={`M ${160 + i * 8} ${
                        75 - i * 10
                      } l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 l 4 -1.5 Z`}
                      fill={currentActivity.color}
                      opacity="0.6"
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.6,
                      }}
                    />
                  ))}

                  {/* Search Icon */}
                  <motion.g
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <circle
                      cx="45"
                      cy="85"
                      r="6"
                      fill="white"
                      stroke={currentActivity.color}
                      strokeWidth="1.5"
                    />
                    <line
                      x1="48"
                      y1="88"
                      x2="52"
                      y2="92"
                      stroke={currentActivity.color}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </motion.g>
                </g>
              )}
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* Pulsing Ring on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white/40"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.1, opacity: [0.5, 0, 0.5] }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}