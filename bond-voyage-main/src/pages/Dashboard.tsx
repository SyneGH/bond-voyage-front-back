import { Users, Clock, TrendingUp, CheckCircle, MapPin, HelpCircle, MessageCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../components/StatCard";
import { ContentCard } from "../components/ContentCard";
import { BookingListCard } from "../components/BookingListCard";
import { TravelingAvatar } from "../components/TravelingAvatar";
import { useProfile } from "../components/ProfileContext";
import { HistoryBooking, BookingData } from "../App";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardProps {
  pendingApprovalsCount: number;
  historyBookings: HistoryBooking[];
  createdBookings: BookingData[];
  activeBookingsCount?: number;
}

export function Dashboard({
  pendingApprovalsCount,
  historyBookings,
  createdBookings,
  activeBookingsCount: propActiveBookingsCount,
}: DashboardProps) {
  const navigate = useNavigate();
  const { profileData } = useProfile();

  // Get initials from company name
  const getInitials = () => {
    if (!profileData) return null;

    if (profileData.profilePicture) return null;
    const words = profileData.companyName.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return profileData.companyName.substring(0, 2).toUpperCase();
  };

  // Calculate metrics
  const completedTripsCount = historyBookings.filter(
    (booking) => booking.status === "completed"
  ).length;
  const cancelledTripsCount = historyBookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;
  const activeBookingsCount =
    propActiveBookingsCount !== undefined
      ? propActiveBookingsCount
      : createdBookings.length;
  const totalBookings =
    completedTripsCount +
    cancelledTripsCount +
    activeBookingsCount +
    pendingApprovalsCount;

  // Generate booking trends data for last 12 months + 6 months prediction
  const generateBookingTrends = () => {
    const now = new Date();
    const trends = [];

    // Historical data (last 12 months) - based on system performance
    // Pattern: Growth trend with seasonal variations
    const baselineBookings = [4, 5, 7, 6, 9, 11, 13, 12, 15, 14, 18, 16];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      trends.push({
        month: monthName,
        bookings: baselineBookings[11 - i],
        predicted: false,
      });
    }

    // Predicted data (next 6 months) - based on growth trend
    // Calculate average growth rate from last 6 months
    const recentGrowth = (baselineBookings[11] - baselineBookings[5]) / 6;
    let lastValue = baselineBookings[11];

    for (let i = 1; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      // Apply growth with slight randomization for realism
      lastValue = Math.round(
        lastValue + recentGrowth + (Math.random() - 0.5) * 2
      );
      trends.push({
        month: monthName,
        bookings: Math.max(lastValue, 1), // Ensure positive values
        predicted: true,
      });
    }

    return trends;
  };

  const monthlyData = generateBookingTrends();

  // Booking status distribution
  const statusData = [
    { name: "Completed", value: completedTripsCount, color: "#10B981" },
    { name: "Active", value: activeBookingsCount, color: "#0A7AFF" },
    { name: "Pending", value: pendingApprovalsCount, color: "#FFB84D" },
    { name: "Cancelled", value: cancelledTripsCount, color: "#EF4444" },
  ];

  // Booking type distribution
  const bookingTypeData = [
    {
      name: "Customized",
      value:
        historyBookings.filter((b) => b.bookingType === "Customized").length +
        createdBookings.filter((b) => b.bookingType === "Customized").length,
      color: "#0A7AFF",
    },
    {
      name: "Standard",
      value:
        historyBookings.filter((b) => b.bookingType === "Standard").length +
        createdBookings.filter((b) => b.bookingType === "Standard").length,
      color: "#14B8A6",
    },
    {
      name: "Requested",
      value:
        historyBookings.filter((b) => b.bookingType === "Requested").length +
        createdBookings.filter((b) => b.bookingType === "Requested").length,
      color: "#A78BFA",
    },
  ].filter((item) => item.value > 0);

  // Frequently Asked Questions data - Simplified version
  const faqData = [
    {
      id: "FAQ-001",
      question: "How do I create a new booking for a customer?",
      answer: "Go to the Bookings page and click 'Create Booking'. Fill in customer details, select itinerary, and confirm payment. You can also create bookings directly from the Itinerary page.",
    },
    {
      id: "FAQ-002",
      question: "What's the difference between Standard and Requested itineraries?",
      answer: "Standard itineraries are pre-built templates for popular destinations. Requested itineraries are custom plans created specifically for individual customer requests with detailed day-by-day activities.",
    },
    {
      id: "FAQ-003",
      question: "How do I manage pending approvals?",
      answer: "Pending approvals appear on your dashboard and in the Bookings page. You can review, approve, or reject requests with comments. Notifications are sent to customers upon approval.",
    },
    {
      id: "FAQ-004",
      question: "Can I edit a booking after it's confirmed?",
      answer: "Yes, bookings can be edited from the Bookings page. Changes are tracked in the activity log, and customers receive notifications for significant modifications.",
    },
    {
      id: "FAQ-005",
      question: "How do I handle customer refunds?",
      answer: "Refunds can be processed through the Bookings page. Select the booking, click 'Manage Payment', then 'Process Refund'. Refunds take 3-5 business days to reflect in customer accounts.",
    },
    {
      id: "FAQ-006",
      question: "What are the cancellation policies?",
      answer: "Cancellations made 30+ days before travel receive full refund. 15-29 days: 50% refund. 0-14 days: non-refundable. Emergency cases are reviewed individually.",
    },
    {
      id: "FAQ-007",
      question: "How do I customize itineraries?",
      answer: "Go to the Itinerary page, select 'Create New Itinerary', and choose between Standard or Requested templates. You can add activities, set schedules, and include pricing details.",
    },
    {
      id: "FAQ-008",
      question: "What payment methods are accepted?",
      answer: "We accept credit cards (Visa, Mastercard, Amex), bank transfers, GCash, Maya, and PayPal. All payments are secured with SSL encryption.",
    },
  ];

  // Generate recent activities from actual data - UPDATED TO SHOW 4 ENTRIES
  const generateRecentActivities = () => {
    const activities = [];

    // Add recent completed bookings
    const recentCompleted = historyBookings
      .filter((b) => b.status === "completed")
      .slice(0, 2);

    recentCompleted.forEach((booking, index) => {
      activities.push({
        id: `completed-${booking.id}`,
        text: `Booking ${booking.id} for ${booking.customer} was completed`,
        icon: "check",
      });
    });

    // Add recent cancelled bookings
    const recentCancelled = historyBookings
      .filter((b) => b.status === "cancelled")
      .slice(0, 1);

    recentCancelled.forEach((booking) => {
      activities.push({
        id: `cancelled-${booking.id}`,
        text: `Booking ${booking.id} for ${booking.customer} was cancelled`,
        icon: "cancel",
      });
    });

    // Add pending approvals activity
    if (pendingApprovalsCount > 0) {
      activities.push({
        id: "pending-approvals",
        text: `${pendingApprovalsCount} booking${
          pendingApprovalsCount > 1 ? "s" : ""
        } pending approval`,
        icon: "clock",
      });
    }

    // Ensure we have exactly 4 activities by adding more if needed
    if (activities.length < 4) {
      // Add standard itinerary activity
      activities.push({
        id: "standard-itinerary",
        text: "New standard itinerary template created",
        icon: "itinerary",
      });
    }

    if (activities.length < 4) {
      // Add user activity
      activities.push({
        id: "user-activity",
        text: "New user registration completed",
        icon: "user",
      });
    }

    if (activities.length < 4) {
      // Add payment activity
      activities.push({
        id: "payment-activity",
        text: "New payment processed successfully",
        icon: "payment",
      });
    }

    return activities.slice(0, 4); // Return exactly 4 activities
  };

  const recentActivities = generateRecentActivities();

  const upcomingTrips = createdBookings
    .filter((b) => b.tripStatus === "upcoming")
    .slice(0, 4)
    .map((booking) => ({
      id: booking.id,
      customer: booking.customer,
      destination: booking.destination,
      date: new Date(booking.startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      status:
        booking.paymentStatus === "Paid" ? "confirmed" : "pending-payment",
    }));

  // If no upcoming trips from data, show placeholder
  const displayUpcomingTrips =
    upcomingTrips.length > 0
      ? upcomingTrips
      : [
          {
            id: "BK-2026-001",
            customer: "Sofia Villanueva",
            email: "sofia.villanueva@email.com",
            mobile: "+63 917 234 5678",
            destination: "Batanes, Cagayan Valley",
            dates: "March 15, 2026 – March 20, 2026",
            travelers: 2,
            total: "₱55,000",
            bookedDate: "February 10, 2026",
            bookingType: "Standard" as const,
            date: "March 15, 2026",
            status: "confirmed",
          },
          {
            id: "BK-2026-002",
            customer: "Miguel Santos",
            email: "miguel.santos@email.com",
            mobile: "+63 918 345 6789",
            destination: "Vigan, Ilocos Sur",
            dates: "May 10, 2026 – May 15, 2026",
            travelers: 4,
            total: "₱48,000",
            bookedDate: "March 20, 2026",
            bookingType: "Customized" as const,
            date: "May 10, 2026",
            status: "confirmed",
          },
        ];

  return (
    <div>
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
                  profileData && profileData.profilePicture ? "" : "bg-primary"
                }`}
              >
                {profileData && profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
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
                  {profileData ? profileData.companyName : ""}
                </h1>
              </div>
              <p className="text-white/90 text-sm sm:text-base mb-3 sm:mb-4">
                {profileData ? profileData.email : ""}
              </p>
              {/* Quick Stats */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp
                      className="w-5 h-5 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-white/70 whitespace-nowrap">
                      Years in Operation
                    </p>
                    <p className="text-sm text-white">
                      {profileData ? profileData.yearsInOperation : ""}
                    </p>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/20" />

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 whitespace-nowrap">
                      Customer Satisfaction
                    </p>
                    <p className="text-sm text-white">
                      {profileData ? profileData.customerRating : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Traveling Avatar */}
          <div className="flex-shrink-0 w-full lg:w-1/2 min-w-[280px] sm:min-w-[320px] hidden md:block">
            <TravelingAvatar />
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          icon={Users}
          label="Total Users"
          value="0"
          gradientFrom="#F472B6"
          gradientTo="#38BDF8"
        />
        <StatCard
          icon={Clock}
          label="Pending Approvals"
          value={pendingApprovalsCount.toString()}
          gradientFrom="#F97316"
          gradientTo="#EF4444"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Bookings"
          value={activeBookingsCount.toString()}
          gradientFrom="#14B8A6"
          gradientTo="#0A7AFF"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Trips"
          value={completedTripsCount.toString()}
          gradientFrom="#22C55E"
          gradientTo="#16A34A"
        />
      </div>

      {/* Booking Trends Chart - Full Width */}
      <div className="mb-6 sm:mb-8">
        <ContentCard
          title={`Booking Trends (Last 12 Months + 6 Month Prediction) - ${new Date().getFullYear()}`}
        >
          <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <defs>
                  <linearGradient
                    id="colorBookings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#0A7AFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0A7AFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorPredicted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                  tickMargin={12}
                />
                <YAxis
                  stroke="#64748B"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                  tickMargin={8}
                  label={{
                    value: "Bookings",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      fill: "#64748B",
                      fontSize: "13px",
                      fontWeight: 600,
                    },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    color: "#1A2B4F",
                    marginBottom: "4px",
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    value + " bookings",
                    props.payload.predicted ? "Predicted" : "Actual",
                  ]}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "13px",
                    fontWeight: 500,
                    paddingTop: "16px",
                  }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#0A7AFF"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props;
                    return payload.predicted ? (
                      <circle
                        key={`dot-predicted-${index}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#14B8A6"
                        stroke="#14B8A6"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                    ) : (
                      <circle
                        key={`dot-actual-${index}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="white"
                        stroke="#0A7AFF"
                        strokeWidth={3}
                      />
                    );
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#0A7AFF",
                    stroke: "white",
                    strokeWidth: 3,
                  }}
                  name="Bookings"
                  strokeDasharray={(props: any) =>
                    props.predicted ? "5 5" : "0"
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0A7AFF]"></div>
              <span className="text-[#64748B]">Historical Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full bg-[#14B8A6] border-2 border-[#14B8A6]"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, transparent 25%, #14B8A6 25%, #14B8A6 50%, transparent 50%, transparent 75%, #14B8A6 75%, #14B8A6)",
                }}
              ></div>
              <span className="text-[#64748B]">Predicted Growth</span>
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Distribution Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Booking Status Distribution */}
        <ContentCard title="Booking Status Distribution">
          <div className="h-[280px] sm:h-[300px] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {statusData.map((entry, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`gradient-status-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={entry.color}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={entry.color}
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={{
                    stroke: "#CBD5E1",
                    strokeWidth: 2,
                  }}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    name,
                  }) => {
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 1.3;
                    const x =
                      cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                    const y =
                      cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#1A2B4F"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    );
                  }}
                  outerRadius={100}
                  innerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-status-${index})`}
                      stroke="white"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    color: "#1A2B4F",
                    marginBottom: "4px",
                  }}
                  formatter={(value: number) => [`${value} bookings`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-muted-foreground">
                  {entry.name}:
                </span>
                <span className="text-sm text-card-foreground">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Booking Type Distribution */}
        <ContentCard title="Booking Type Distribution">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {bookingTypeData.map((entry, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`gradient-type-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={entry.color}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={entry.color}
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={bookingTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={{
                    stroke: "#CBD5E1",
                    strokeWidth: 2,
                  }}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    name,
                  }) => {
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 1.3;
                    const x =
                      cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                    const y =
                      cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#1A2B4F"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    );
                  }}
                  outerRadius={100}
                  innerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {bookingTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-type-${index})`}
                      stroke="white"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    color: "#1A2B4F",
                    marginBottom: "4px",
                  }}
                  formatter={(value: number) => [`${value} bookings`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-3">
            {bookingTypeData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-muted-foreground">
                  {entry.name}:
                </span>
                <span className="text-sm text-card-foreground">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* FAQ and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Frequently Asked Questions - Simplified */}
        <ContentCard 
          title="Frequently Asked Questions"
          action={
            <button 
              onClick={() => navigate("/faq")}
              className="h-10 px-5 rounded-[20px] text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}
            >
              <Plus className="w-4 h-4" />
              New FAQ
            </button>
          }
          footer={
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/faq")}
                className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                View All FAQs
              </button>
            </div>
          }
        >
          <div className="space-y-4 pt-2">
            {faqData.slice(0, 2).map((faq, index) => {
              const colors = [
                { from: "#0A7AFF", to: "#14B8A6" },
                { from: "#FFB84D", to: "#FF9800" },
                { from: "#A78BFA", to: "#8B5CF6" },
                { from: "#14B8A6", to: "#10B981" },
              ];
              const color = colors[index % colors.length];

              return (
                <div
                  key={faq.id}
                  className="group rounded-xl border border-[#E5E7EB] hover:border-[#0A7AFF] bg-white hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
                  onClick={() => navigate("/faq")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                      }}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#1A2B4F] group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-[#64748B] line-clamp-3">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Empty state if no FAQs */}
            {faqData.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#F8FAFB] flex items-center justify-center mb-3">
                  <HelpCircle className="w-6 h-6 text-[#94A3B8]" />
                </div>
                <p className="text-sm text-[#64748B] mb-2">No FAQs yet</p>
                <p className="text-xs text-[#94A3B8]">Create your first FAQ to help users</p>
              </div>
            )}
          </div>
        </ContentCard>

        {/* Recent Activity - UPDATED DESIGN */}
        <ContentCard
          title="Recent Activity"
          footer={
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/activity-log")}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                View Activity Log
              </button>
            </div>
          }
        >
          <div className="space-y-3 pt-2">
            {recentActivities.map((activity) => {
              // Define colors and icons based on activity type
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
                IconComponent = Clock; // Using clock as placeholder for cancel icon
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
                  onClick={() => navigate("/activity-log")}
                >
                  <div className="flex items-center gap-3">
                    {/* Smaller icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${iconBgColor} flex items-center justify-center`}>
                      <IconComponent className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    
                    {/* Text centered vertically */}
                    <div className="flex-1 min-w-0 flex items-center">
                      <p className="text-sm font-medium text-[#1A2B4F] line-clamp-2">
                        {activity.text}
                      </p>
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
                <p className="text-sm text-[#64748B] mb-2">No recent activity</p>
                <p className="text-xs text-[#94A3B8]">Activity will appear here</p>
              </div>
            )}
          </div>
        </ContentCard>
      </div>

      {/* Upcoming Trips */}
      <div className="grid grid-cols-1 gap-6">
        <ContentCard
          title={`Upcoming Trips (${displayUpcomingTrips.length})`}
          footer={
            <button
              onClick={() => navigate("/bookings")}
              className="text-sm text-primary hover:underline"
            >
              View All Bookings
            </button>
          }
        >
          <div className="space-y-4">
            {displayUpcomingTrips.map((trip) => (
              <BookingListCard
                key={trip.id}
                booking={{
                  id: trip.id,
                  customer: trip.customer,
                  email: trip.email || "",
                  mobile: trip.mobile || "",
                  destination: trip.destination,
                  dates: trip.dates || trip.date,
                  travelers: trip.travelers || 2,
                  total: trip.total || "₱0",
                  bookedDate: trip.bookedDate || trip.date,
                  bookingType: trip.bookingType,
                }}
                onViewDetails={(id) => navigate("/bookings")}
                additionalBadges={
                  trip.status === "confirmed" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      <CheckCircle className="w-3 h-3" />
                      Confirmed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                      Pending Payment
                    </span>
                  )
                }
              />
            ))}
          </div>
        </ContentCard>
      </div>
    </div>
  );
}