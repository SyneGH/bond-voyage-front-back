import { useState, useMemo } from "react";
import { 
  Bell, 
  CheckCircle, 
  X, 
  Calendar, 
  MessageSquare, 
  User, 
  FileText, 
  AlertCircle,
  Clock,
  Filter,
  CheckCheck,
  Trash2,
  Plane,
  Star,
  Sparkles
} from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { StatCard } from "../../components/StatCard";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner@2.0.3";
import { FAQAssistant } from "../../components/FAQAssistant";

type NotificationType = 
  | "booking_confirmed" 
  | "booking_cancelled" 
  | "trip_reminder"
  | "itinerary_ready"
  | "payment_reminder"
  | "inquiry_response"
  | "feedback_request"
  | "travel_tip"
  | "booking_update"
  | "system_alert";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high" | "urgent";
  metadata?: {
    bookingId?: string;
    tripId?: string;
    inquiryId?: string;
    itineraryId?: string;
  };
}

export function UserNotifications() {
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilters, setTypeFilters] = useState<NotificationType[]>([]);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [markAllReadModalOpen, setMarkAllReadModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-001",
      type: "booking_confirmed",
      title: "Booking Confirmed!",
      message: "Your booking for El Nido, Palawan (BV-2024-001) has been confirmed! Get ready for an amazing adventure!",
      timestamp: new Date("2025-01-22T14:30:00"),
      read: false,
      actionable: true,
      actionUrl: "/user/bookings",
      priority: "high",
      metadata: { bookingId: "BV-2024-001" }
    },
    {
      id: "notif-002",
      type: "itinerary_ready",
      title: "Your Itinerary is Ready",
      message: "Your customized itinerary for Banaue Rice Terraces is now available to view and download",
      timestamp: new Date("2025-01-22T13:45:00"),
      read: false,
      actionable: true,
      actionUrl: "/user/travels",
      priority: "high",
      metadata: { itineraryId: "ITN-2024-012" }
    },
    {
      id: "notif-003",
      type: "trip_reminder",
      title: "Trip Starting Soon!",
      message: "Your trip to El Nido, Palawan starts in 7 days. Don't forget to prepare your essentials!",
      timestamp: new Date("2025-01-22T11:20:00"),
      read: true,
      actionable: true,
      actionUrl: "/user/bookings",
      priority: "medium",
      metadata: { bookingId: "BV-2024-001" }
    },
    {
      id: "notif-004",
      type: "inquiry_response",
      title: "Admin Responded to Your Inquiry",
      message: "Admin has responded to your inquiry about visa requirements. Check the details now.",
      timestamp: new Date("2025-01-22T10:30:00"),
      read: true,
      actionable: true,
      actionUrl: "/user/inquiries",
      priority: "high",
      metadata: { inquiryId: "INQ-2024-008" }
    },
    {
      id: "notif-005",
      type: "payment_reminder",
      title: "Payment Reminder",
      message: "Your payment for Banaue Rice Terraces booking (BV-2024-002) is due in 3 days",
      timestamp: new Date("2025-01-22T10:05:00"),
      read: true,
      actionable: true,
      actionUrl: "/user/bookings",
      priority: "urgent",
      metadata: { bookingId: "BV-2024-002" }
    },
    {
      id: "notif-006",
      type: "feedback_request",
      title: "How Was Your Trip?",
      message: "We'd love to hear about your experience in Siargao! Share your feedback and help other travelers.",
      timestamp: new Date("2025-01-22T09:30:00"),
      read: true,
      actionable: true,
      actionUrl: "/user/feedback",
      priority: "low",
      metadata: { bookingId: "BV-2024-089" }
    },
    {
      id: "notif-007",
      type: "travel_tip",
      title: "Travel Tip: Best Time to Visit Palawan",
      message: "December to May offers perfect weather for island hopping. Plan your next adventure during these months!",
      timestamp: new Date("2025-01-22T08:45:00"),
      read: true,
      actionable: false,
      priority: "low"
    },
    {
      id: "notif-008",
      type: "booking_update",
      title: "Booking Update",
      message: "Your booking for Coron Island Tour has been updated with new pickup time: 6:00 AM",
      timestamp: new Date("2025-01-21T16:20:00"),
      read: true,
      actionable: true,
      actionUrl: "/user/bookings",
      priority: "medium",
      metadata: { bookingId: "BV-2024-045" }
    },
    {
      id: "notif-009",
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: "Your booking request for Batanes trip has been cancelled due to weather conditions. Full refund issued.",
      timestamp: new Date("2025-01-21T15:10:00"),
      read: true,
      actionable: true,
      actionUrl: "/user/history",
      priority: "high",
      metadata: { bookingId: "BV-2024-038" }
    },
    {
      id: "notif-010",
      type: "system_alert",
      title: "Welcome to BondVoyage!",
      message: "Start planning your dream Philippine adventure today. Explore our standard itineraries or create custom trips!",
      timestamp: new Date("2025-01-21T14:00:00"),
      read: true,
      actionable: false,
      priority: "low"
    },
    {
      id: "notif-011",
      type: "travel_tip",
      title: "Pack Smart for Your Trip",
      message: "Don't forget sunscreen, reusable water bottle, and waterproof phone case for beach adventures!",
      timestamp: new Date("2025-01-21T11:30:00"),
      read: true,
      actionable: false,
      priority: "low"
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    toast.success("Notification marked as read!");
  };

  const handleMarkAsUnread = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: false } : notif
    ));
    toast.success("Notification marked as unread!");
  };

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      setNotifications(notifications.filter(notif => notif.id !== notificationToDelete.id));
    }
    setDeleteConfirmOpen(false);
    setNotificationToDelete(null);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    setMarkAllReadModalOpen(false);
  };

  const handleClearAll = () => {
    setNotifications(notifications.filter(notif => !notif.read));
    setClearAllModalOpen(false);
  };

  const toggleTypeFilter = (type: NotificationType) => {
    setTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setTypeFilters([]);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "booking_confirmed":
        return CheckCircle;
      case "booking_cancelled":
        return X;
      case "trip_reminder":
        return Clock;
      case "itinerary_ready":
        return FileText;
      case "payment_reminder":
        return AlertCircle;
      case "inquiry_response":
        return MessageSquare;
      case "feedback_request":
        return Star;
      case "travel_tip":
        return Sparkles;
      case "booking_update":
        return Calendar;
      case "system_alert":
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "booking_confirmed":
        return { bg: "from-[#10B981] to-[#14B8A6]", shadow: "shadow-[#10B981]/20" };
      case "booking_cancelled":
        return { bg: "from-[#FF6B6B] to-[#FB7185]", shadow: "shadow-[#FF6B6B]/20" };
      case "trip_reminder":
        return { bg: "from-[#0A7AFF] to-[#3B9EFF]", shadow: "shadow-[#0A7AFF]/20" };
      case "itinerary_ready":
        return { bg: "from-[#A78BFA] to-[#8B5CF6]", shadow: "shadow-[#A78BFA]/20" };
      case "payment_reminder":
        return { bg: "from-[#FFB84D] to-[#FB7185]", shadow: "shadow-[#FFB84D]/20" };
      case "inquiry_response":
        return { bg: "from-[#0A7AFF] to-[#14B8A6]", shadow: "shadow-[#0A7AFF]/20" };
      case "feedback_request":
        return { bg: "from-[#FFB84D] to-[#FB7185]", shadow: "shadow-[#FFB84D]/20" };
      case "travel_tip":
        return { bg: "from-[#14B8A6] to-[#10B981]", shadow: "shadow-[#14B8A6]/20" };
      case "booking_update":
        return { bg: "from-[#0A7AFF] to-[#3B9EFF]", shadow: "shadow-[#0A7AFF]/20" };
      case "system_alert":
        return { bg: "from-[#64748B] to-[#475569]", shadow: "shadow-[#64748B]/20" };
      default:
        return { bg: "from-[#0A7AFF] to-[#14B8A6]", shadow: "shadow-[#0A7AFF]/20" };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-[#FF6B6B] text-white";
      case "high":
        return "bg-[#FFB84D] text-white";
      case "medium":
        return "bg-[#0A7AFF] text-white";
      case "low":
        return "bg-[#E5E7EB] text-[#64748B]";
      default:
        return "bg-[#E5E7EB] text-[#64748B]";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(notif => {
        // Tab filter
        if (selectedTab === "unread" && notif.read) return false;
        
        // Type filter
        if (typeFilters.length > 0 && !typeFilters.includes(notif.type)) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Sort unread to top
        if (!a.read && b.read) return -1;
        if (a.read && !b.read) return 1;
        
        // Then by timestamp (newest first)
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  }, [notifications, selectedTab, typeFilters]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionableCount = notifications.filter(n => n.actionable && !n.read).length;
  const todayCount = notifications.filter(n => {
    const today = new Date();
    return n.timestamp.toDateString() === today.toDateString();
  }).length;

  const notificationTypes: { type: NotificationType; label: string; icon: any }[] = [
    { type: "booking_confirmed", label: "Booking Confirmed", icon: CheckCircle },
    { type: "booking_cancelled", label: "Booking Cancelled", icon: X },
    { type: "trip_reminder", label: "Trip Reminders", icon: Clock },
    { type: "itinerary_ready", label: "Itinerary Ready", icon: FileText },
    { type: "payment_reminder", label: "Payment Reminders", icon: AlertCircle },
    { type: "inquiry_response", label: "Inquiry Responses", icon: MessageSquare },
    { type: "feedback_request", label: "Feedback Requests", icon: Star },
    { type: "travel_tip", label: "Travel Tips", icon: Sparkles },
    { type: "booking_update", label: "Booking Updates", icon: Calendar },
    { type: "system_alert", label: "System Alerts", icon: Bell },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Bell}
          label="Total Notifications"
          value={notifications.length.toString()}
          gradientFrom="#0A7AFF"
          gradientTo="#3B9EFF"
        />
        <StatCard
          icon={Clock}
          label="Unread"
          value={unreadCount.toString()}
          gradientFrom="#FF6B6B"
          gradientTo="#FB7185"
        />
        <StatCard
          icon={CheckCircle}
          label="Today"
          value={todayCount.toString()}
          gradientFrom="#10B981"
          gradientTo="#14B8A6"
        />
      </div>

      <ContentCard
        title={`${selectedTab === "all" ? "All" : "Unread"} Notifications (${filteredNotifications.length})`}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMarkAllReadModalOpen(true)}
              disabled={unreadCount === 0}
              className="h-10 px-5 rounded-[20px] bg-white dark:bg-transparent border-2 border-[#0A7AFF] dark:border-[#0A7AFF] text-[#0A7AFF] dark:text-[#0A7AFF] text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(10,122,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
            <button
              onClick={() => setClearAllModalOpen(true)}
              className="h-10 px-5 rounded-[20px] bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-[rgba(255,107,107,0.05)]"
            >
              <Trash2 className="w-4 h-4" />
              Clear Read
            </button>
          </div>
        }
      >
        {/* Tabs and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 border-b-2 border-[#E5E7EB]">
            <button 
              onClick={() => setSelectedTab("all")}
              className={`px-5 h-11 text-sm transition-colors ${
                selectedTab === "all"
                  ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
                  : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setSelectedTab("unread")}
              className={`px-5 h-11 text-sm transition-colors ${
                selectedTab === "unread"
                  ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-[2px]"
                  : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Type Filter */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="h-10 px-4 rounded-xl border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] flex items-center gap-2 text-sm font-medium text-[#334155] transition-all relative">
                <Filter className="w-4 h-4" />
                Filter by Type
                {typeFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0A7AFF] text-white text-xs flex items-center justify-center">
                    {typeFilters.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#1A2B4F]">Filter by Type</h4>
                  {typeFilters.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[#0A7AFF] hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {notificationTypes.map(({ type, label, icon: Icon }) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFB] cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={typeFilters.includes(type)}
                        onCheckedChange={() => toggleTypeFilter(type)}
                      />
                      <Icon className="w-4 h-4 text-[#64748B]" />
                      <span className="text-sm text-[#334155] flex-1">{label}</span>
                      <span className="text-xs text-[#94A3B8]">
                        {notifications.filter(n => n.type === type).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(10,122,255,0.1)] to-[rgba(20,184,166,0.1)] flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-[#0A7AFF]" />
              </div>
              <h3 className="font-semibold text-[#1A2B4F] mb-2">No notifications</h3>
              <p className="text-sm text-[#64748B]">
                {selectedTab === "unread" 
                  ? "You're all caught up!" 
                  : "New notifications will appear here"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colors = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                    !notification.read
                      ? "border-[#0A7AFF] bg-[rgba(10,122,255,0.02)] hover:border-[#0A7AFF] hover:shadow-[0_4px_12px_rgba(10,122,255,0.15)]"
                      : "border-[#E5E7EB] bg-white hover:border-[#0A7AFF] hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.shadow} flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? "text-[#1A2B4F]" : "text-[#334155]"}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-[#0A7AFF] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-[#64748B] leading-relaxed mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                            </span>
                            {notification.actionable && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border border-[rgba(10,122,255,0.2)]">
                                Actionable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {!notification.read ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="h-8 px-3 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-all"
                            style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark as Read
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsUnread(notification.id);
                            }}
                            className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[#64748B] text-xs font-medium flex items-center gap-1.5 hover:border-[#0A7AFF] hover:text-[#0A7AFF] transition-colors"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            Mark as Unread
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(notification);
                          }}
                          className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[#FF6B6B] text-xs font-medium flex items-center gap-1.5 hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ContentCard>

      {/* Mark All Read Modal */}
      <ConfirmationModal
        open={markAllReadModalOpen}
        onOpenChange={setMarkAllReadModalOpen}
        title="Mark All as Read"
        description="This will mark all notifications as read."
        icon={<CheckCheck className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.08)] to-[rgba(20,184,166,0.12)]"
        contentBorder="border-[rgba(10,122,255,0.2)]"
        content={
          <p className="text-sm text-[#334155] leading-relaxed">
            Are you sure you want to mark all {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} as read? This action will update all notifications at once.
          </p>
        }
        confirmText="Mark All as Read"
        onConfirm={handleMarkAllRead}
      />

      {/* Clear All Modal */}
      <ConfirmationModal
        open={clearAllModalOpen}
        onOpenChange={setClearAllModalOpen}
        title="Clear All Read Notifications"
        description="This will permanently remove all read notifications."
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FB7185]"
        iconShadow="shadow-[#FF6B6B]/20"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(251,113,133,0.12)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          <p className="text-sm text-[#334155] leading-relaxed">
            Are you sure you want to clear all read notifications? This action cannot be undone and will permanently delete {notifications.filter(n => n.read).length} read notification{notifications.filter(n => n.read).length !== 1 ? 's' : ''}.
          </p>
        }
        confirmText="Clear All Read"
        confirmVariant="destructive"
        onConfirm={handleClearAll}
      />

      {/* Delete Notification Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Notification"
        description="This notification will be permanently removed."
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FB7185]"
        iconShadow="shadow-[#FF6B6B]/20"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(251,113,133,0.12)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          <p className="text-sm text-[#334155] leading-relaxed">
            Are you sure you want to delete "{notificationToDelete?.title}"? This action cannot be undone.
          </p>
        }
        confirmText="Delete Notification"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
      />
      <FAQAssistant />
    </div>
  );
}
