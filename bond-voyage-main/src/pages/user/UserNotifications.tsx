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
  Sparkles,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { StatCard } from "../../components/StatCard";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import { FAQAssistant } from "../../components/FAQAssistant";
import {
  useNotifications,
  useMarkNotificationRead,
} from "../../hooks/useNotifications";
import { INotification } from "../../types/types";

type NotificationType =
  | "BOOKING"
  | "PAYMENT"
  | "INQUIRY"
  | "FEEDBACK"
  | "SYSTEM";

export function UserNotifications() {
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilters, setTypeFilters] = useState<NotificationType[]>([]);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [markAllReadModalOpen, setMarkAllReadModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<INotification | null>(null);

  // Fetch notifications from API
  const { data: notificationsResponse, isLoading, error } = useNotifications();
  const notifications = notificationsResponse?.data?.items || [];

  const handleMarkAsRead = (notificationId: string) => {
    const markReadMutation = useMarkNotificationRead(notificationId, {
      onSuccess: () => {
        toast.success("Notification marked as read!");
      },
      onError: () => {
        toast.error("Failed to mark notification as read");
      },
    });
    markReadMutation.mutate();
  };

  const handleMarkAsUnread = (id: string) => {
    // TODO: Implement unmark as read API endpoint and mutation
    toast.info("Mark as unread functionality to be implemented");
  };

  const handleDeleteClick = (notification: INotification) => {
    setNotificationToDelete(notification);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      // TODO: Implement delete notification API endpoint and mutation
      toast.info("Delete functionality to be implemented");
    }
    setDeleteConfirmOpen(false);
    setNotificationToDelete(null);
  };

  const handleMarkAllRead = () => {
    // TODO: Implement mark all as read API endpoint
    toast.info("Mark all as read functionality to be implemented");
    setMarkAllReadModalOpen(false);
  };

  const handleClearAll = () => {
    // TODO: Implement clear all read notifications API endpoint
    toast.info("Clear all functionality to be implemented");
    setClearAllModalOpen(false);
  };

  const toggleTypeFilter = (type: NotificationType) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setTypeFilters([]);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "BOOKING":
        return Calendar;
      case "PAYMENT":
        return CreditCard;
      case "INQUIRY":
        return HelpCircle;
      case "FEEDBACK":
        return Star;
      case "SYSTEM":
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "BOOKING":
        return {
          bg: "from-[#0A7AFF] to-[#3B9EFF]",
          shadow: "shadow-[#0A7AFF]/20",
        };
      case "PAYMENT":
        return {
          bg: "from-[#10B981] to-[#14B8A6]",
          shadow: "shadow-[#10B981]/20",
        };
      case "INQUIRY":
        return {
          bg: "from-[#0A7AFF] to-[#14B8A6]",
          shadow: "shadow-[#0A7AFF]/20",
        };
      case "FEEDBACK":
        return {
          bg: "from-[#FFB84D] to-[#FB7185]",
          shadow: "shadow-[#FFB84D]/20",
        };
      case "SYSTEM":
        return {
          bg: "from-[#64748B] to-[#475569]",
          shadow: "shadow-[#64748B]/20",
        };
      default:
        return {
          bg: "from-[#0A7AFF] to-[#14B8A6]",
          shadow: "shadow-[#0A7AFF]/20",
        };
    }
  };

  const getPriorityFromType = (type: NotificationType): string => {
    switch (type) {
      case "BOOKING":
        return "high";
      case "PAYMENT":
        return "urgent";
      case "INQUIRY":
        return "medium";
      case "FEEDBACK":
        return "low";
      case "SYSTEM":
        return "low";
      default:
        return "medium";
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

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
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
      .filter((notif) => {
        // Tab filter
        if (selectedTab === "unread" && notif.isRead) return false;

        // Type filter
        if (typeFilters.length > 0 && !typeFilters.includes(notif.type))
          return false;

        return true;
      })
      .sort((a, b) => {
        // Sort unread to top
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;

        // Then by timestamp (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [notifications, selectedTab, typeFilters]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const todayCount = notifications.filter((n) => {
    const today = new Date();
    const notifDate = new Date(n.createdAt);
    return notifDate.toDateString() === today.toDateString();
  }).length;

  const notificationTypes: {
    type: NotificationType;
    label: string;
    icon: any;
  }[] = [
    { type: "BOOKING", label: "Booking", icon: Calendar },
    { type: "PAYMENT", label: "Payment", icon: CreditCard },
    { type: "INQUIRY", label: "Inquiry", icon: HelpCircle },
    { type: "FEEDBACK", label: "Feedback", icon: Star },
    { type: "SYSTEM", label: "System", icon: AlertCircle },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(10,122,255,0.1)] to-[rgba(20,184,166,0.1)] flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-[#0A7AFF] animate-pulse" />
          </div>
          <p className="text-sm text-[#64748B]">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(255,107,107,0.1)] to-[rgba(239,68,68,0.1)] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#FF6B6B]" />
          </div>
          <p className="text-sm text-[#FF6B6B] font-medium mb-2">
            Failed to load notifications
          </p>
          <p className="text-xs text-[#64748B]">Please try again later</p>
        </div>
      </div>
    );
  }

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
        title={`${selectedTab === "all" ? "All" : "Unread"} Notifications (${
          filteredNotifications.length
        })`}
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
                  <h4 className="font-semibold text-[#1A2B4F]">
                    Filter by Type
                  </h4>
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
                      <span className="text-sm text-[#334155] flex-1">
                        {label}
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        {notifications.filter((n) => n.type === type).length}
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
              <h3 className="font-semibold text-[#1A2B4F] mb-2">
                No notifications
              </h3>
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
              const priority = getPriorityFromType(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                    !notification.isRead
                      ? "border-[#0A7AFF] bg-[rgba(10,122,255,0.02)] hover:border-[#0A7AFF] hover:shadow-[0_4px_12px_rgba(10,122,255,0.15)]"
                      : "border-[#E5E7EB] bg-white hover:border-[#0A7AFF] hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.shadow} flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-semibold ${
                                !notification.isRead
                                  ? "text-[#1A2B4F]"
                                  : "text-[#334155]"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#0A7AFF] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-[#64748B] leading-relaxed mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimestamp(notification.createdAt)}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                priority
                              )}`}
                            >
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border border-[rgba(10,122,255,0.2)]">
                              {notification.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {!notification.isRead ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="h-8 px-3 rounded-lg bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-all"
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
            Are you sure you want to mark all{" "}
            <span className="font-semibold text-[#0A7AFF]">
              {unreadCount} unread notifications
            </span>{" "}
            as read?
          </p>
        }
        onConfirm={handleMarkAllRead}
        onCancel={() => setMarkAllReadModalOpen(false)}
        confirmText="Mark All Read"
        cancelText="Cancel"
        confirmVariant="default"
      />

      {/* Clear All Modal */}
      <ConfirmationModal
        open={clearAllModalOpen}
        onOpenChange={setClearAllModalOpen}
        title="Clear Read Notifications"
        description="This will permanently delete all read notifications."
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#EF4444]"
        iconShadow="shadow-[#FF6B6B]/20"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(239,68,68,0.12)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          <p className="text-sm text-[#334155] leading-relaxed">
            Are you sure you want to delete all{" "}
            <span className="font-semibold text-[#FF6B6B]">
              {notifications.filter((n) => n.isRead).length} read notifications
            </span>
            ? This action cannot be undone.
          </p>
        }
        onConfirm={handleClearAll}
        onCancel={() => setClearAllModalOpen(false)}
        confirmText="Clear All"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* Delete Notification Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Notification"
        description="This will permanently delete this notification."
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#EF4444]"
        iconShadow="shadow-[#FF6B6B]/20"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(239,68,68,0.12)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          notificationToDelete ? (
            <div className="space-y-3">
              <p className="text-sm text-[#334155] leading-relaxed">
                Are you sure you want to delete this notification? This action
                cannot be undone.
              </p>
              <div className="p-4 rounded-xl bg-white border border-[rgba(255,107,107,0.2)]">
                <p className="text-sm font-semibold text-[#1A2B4F] mb-1">
                  {notificationToDelete.title}
                </p>
                <p className="text-xs text-[#64748B]">
                  {notificationToDelete.message}
                </p>
              </div>
            </div>
          ) : null
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setNotificationToDelete(null);
        }}
        confirmText="Delete Notification"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      <FAQAssistant />
    </div>
  );
}
