import { useState, useMemo } from "react";
import {
  Bell,
  CheckCircle,
  Calendar,
  Clock,
  Filter,
  CheckCheck,
  Trash2,
  HelpCircle,
  Star,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { StatCard } from "../components/StatCard";
import { ConfirmationModal } from "../components/ConfirmationModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useClearAllReadNotifications,
} from "../hooks/useNotifications";
import { INotification } from "../types/types";

type NotificationType =
  | "BOOKING"
  | "PAYMENT"
  | "INQUIRY"
  | "FEEDBACK"
  | "SYSTEM";

export function Notifications() {
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilters, setTypeFilters] = useState<NotificationType[]>([]);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [markAllReadModalOpen, setMarkAllReadModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<INotification | null>(null);
  
  // Simple state to prevent double clicks during API calls
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Fetch notifications from API
  const { data: notificationsResponse, isLoading, error } = useNotifications();
  const notifications = notificationsResponse?.data?.items || [];

  // Initialize mutation hooks
  const markAllReadMutation = useMarkAllNotificationsRead({
    onSuccess: () => {
      toast.success("All notifications marked as read!");
      setMarkAllReadModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  const clearAllReadMutation = useClearAllReadNotifications({
    onSuccess: () => {
      toast.success("All read notifications cleared!");
      setClearAllModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to clear read notifications");
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    setIsProcessingAction(true);
    
    const markReadMutation = useMarkNotificationRead(notificationId, {
      onSuccess: () => {
        toast.success("Notification marked as read!");
        setIsProcessingAction(false);
      },
      onError: () => {
        toast.error("Failed to mark notification as read");
        setIsProcessingAction(false);
      },
    });
    markReadMutation.mutate();
  };

  const handleMarkAsUnread = (id: string) => {
    setIsProcessingAction(true);
    
    const markUnreadMutation = useMarkNotificationUnread(id, {
      onSuccess: () => {
        toast.success("Notification marked as unread!");
        setIsProcessingAction(false);
      },
      onError: () => {
        toast.error("Failed to mark notification as unread");
        setIsProcessingAction(false);
      },
    });
    markUnreadMutation.mutate();
  };

  const handleDeleteClick = (notification: INotification) => {
    setNotificationToDelete(notification);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      setIsProcessingAction(true);
      
      const deleteMutation = useDeleteNotification(notificationToDelete.id, {
        onSuccess: () => {
          toast.success("Notification deleted!");
          setDeleteConfirmOpen(false);
          setNotificationToDelete(null);
          setIsProcessingAction(false);
        },
        onError: () => {
          toast.error("Failed to delete notification");
          setIsProcessingAction(false);
        },
      });
      deleteMutation.mutate();
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleClearAll = () => {
    clearAllReadMutation.mutate();
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
        if (
          typeFilters.length > 0 &&
          !typeFilters.includes(notif.type as NotificationType)
        )
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
    { type: "FEEDBACK", label: "Feedback", icon: Star },
    { type: "SYSTEM", label: "System", icon: AlertCircle },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[rgba(10,122,255,0.1)] to-[rgba(20,184,166,0.1)] flex items-center justify-center mx-auto mb-4">
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
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[rgba(255,107,107,0.1)] to-[rgba(239,68,68,0.1)] flex items-center justify-center mx-auto mb-4">
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
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="h-10 px-5 rounded-[20px] bg-white dark:bg-transparent border-2 border-[#0A7AFF] dark:border-[#0A7AFF] text-[#0A7AFF] dark:text-[#0A7AFF] text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(10,122,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markAllReadMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A7AFF] border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4" />
                  Mark All Read
                </>
              )}
            </button>
            <button
              onClick={() => setClearAllModalOpen(true)}
              disabled={clearAllReadMutation.isPending || notifications.filter((n) => n.isRead).length === 0}
              className="h-10 px-5 rounded-[20px] bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-[rgba(255,107,107,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {clearAllReadMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Clear Read
                </>
              )}
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
                  ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
                  : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTab("unread")}
              className={`px-5 h-11 text-sm transition-colors ${
                selectedTab === "unread"
                  ? "font-semibold text-[#0A7AFF] border-b-[3px] border-[#0A7AFF] -mb-0.5"
                  : "font-medium text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)]"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Type Filter */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="h-10 px-4 rounded-xl border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] flex items-center gap-2 text-sm font-medium text-[#334155] transition-all relative group shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_6px_rgba(10,122,255,0.15)]">
                <Filter className="w-4 h-4 transition-transform group-hover:scale-110" />
                Filter by Type
                {typeFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] text-white text-xs flex items-center justify-center shadow-lg shadow-[#0A7AFF]/30">
                    {typeFilters.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0 border-0 shadow-[0_20px_25px_rgba(0,0,0,0.12),0_10px_10px_rgba(0,0,0,0.04)]" 
              align="end"
              sideOffset={8}
            >
              {/* Glassmorphism backdrop with brand styling */}
              <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/95 border border-white/20 shadow-2xl">
                {/* Header with gradient */}
                <div className="p-5 border-b border-[#E5E7EB]/50 bg-gradient-to-r from-[#F8FAFB] to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#1A2B4F] text-[15px]">Filter by Type</h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Select notification types to filter
                      </p>
                    </div>
                    {typeFilters.length > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs font-medium text-[#0A7AFF] hover:text-[#3B9EFF] transition-colors px-3 py-1.5 rounded-lg hover:bg-[rgba(10,122,255,0.05)]"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter options list */}
                <div className="p-2 max-h-[320px] overflow-y-auto">
                  {notificationTypes.map(({ type, label, icon: Icon }) => {
                    const colors = getNotificationColor(type);
                    const count = notifications.filter((n) => n.type === type).length;
                    const isSelected = typeFilters.includes(type);
                    
                    return (
                      <div
                        key={type}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFB]/80 cursor-pointer transition-all duration-200 group hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] mb-1 last:mb-0"
                        onClick={() => toggleTypeFilter(type)}
                      >
                        {/* Hidden Checkbox for accessibility */}
                        <Checkbox
                          id={`filter-${type}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleTypeFilter(type)}
                          className="sr-only"
                        />
                        
                        {/* Custom styled checkbox */}
                        <div className="relative">
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected 
                              ? 'border-[#0A7AFF] bg-[#0A7AFF] text-white shadow-[0_2px_4px_rgba(10,122,255,0.3)]' 
                              : 'border-[#E5E7EB] bg-white group-hover:border-[#0A7AFF]/30'
                          }`}>
                            {isSelected && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        {/* Type icon with gradient background */}
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.shadow} transition-transform group-hover:scale-105 ${
                          isSelected ? 'ring-2 ring-[#0A7AFF] ring-offset-1' : ''
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block transition-colors ${
                            isSelected ? 'text-[#0A7AFF]' : 'text-[#334155]'
                          }`}>
                            {label}
                          </span>
                          <span className="text-xs text-[#94A3B8] mt-0.5 block">
                            {count === 1 ? "1 notification" : `${count} notifications`}
                          </span>
                        </div>
                        
                        {/* Count badge */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                          isSelected 
                            ? 'bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] text-white shadow-[#0A7AFF]/20' 
                            : 'bg-[#F8FAFB] text-[#64748B]'
                        }`}>
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer with selected count */}
                {typeFilters.length > 0 && (
                  <div className="p-4 border-t border-[#E5E7EB]/50 bg-gradient-to-r from-[#F8FAFB] to-white">
                    <div className="flex items-center justify-center">
                      <div className="text-sm text-[#64748B]">
                        <span className="font-medium text-[#1A2B4F]">
                          {typeFilters.length} {typeFilters.length === 1 ? "type" : "types"}
                        </span>{" "}
                        selected • <button 
                          onClick={clearFilters}
                          className="text-[#0A7AFF] hover:text-[#3B9EFF] font-medium hover:underline transition-colors"
                        >
                          Clear filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[rgba(10,122,255,0.1)] to-[rgba(20,184,166,0.1)] flex items-center justify-center mx-auto mb-4">
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
              const Icon = getNotificationIcon(
                notification.type as NotificationType
              );
              const colors = getNotificationColor(
                notification.type as NotificationType
              );
              const priority = getPriorityFromType(
                notification.type as NotificationType
              );

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
                      className={`w-12 h-12 rounded-xl bg-linear-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.shadow} shrink-0`}
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
                              <span className="w-2 h-2 rounded-full bg-[#0A7AFF] shrink-0" />
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
                            disabled={isProcessingAction}
                            className="h-8 px-3 rounded-lg bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={isProcessingAction}
                            className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[#64748B] text-xs font-medium flex items-center gap-1.5 hover:border-[#0A7AFF] hover:text-[#0A7AFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={isProcessingAction}
                          className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[#FF6B6B] text-xs font-medium flex items-center gap-1.5 hover:border-[#FF6B6B] hover:bg-[rgba(255,107,107,0.05)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modals */}
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
          <div className="space-y-3">
            <p className="text-sm text-[#334155] leading-relaxed">
              Are you sure you want to mark all{" "}
              <span className="font-semibold text-[#0A7AFF]">
                {unreadCount} unread notifications
              </span>{" "}
              as read?
            </p>
            {markAllReadMutation.isPending && (
              <div className="flex items-center justify-center py-2">
                <div className="w-6 h-6 border-2 border-[#0A7AFF] border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-[#64748B]">Processing...</span>
              </div>
            )}
          </div>
        }
        onConfirm={handleMarkAllRead}
        onCancel={() => setMarkAllReadModalOpen(false)}
        confirmText={markAllReadMutation.isPending ? "Processing..." : "Mark All Read"}
        cancelText="Cancel"
        confirmVariant="default"
        disabled={markAllReadMutation.isPending}
      />

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
          <div className="space-y-3">
            <p className="text-sm text-[#334155] leading-relaxed">
              Are you sure you want to delete all{" "}
              <span className="font-semibold text-[#FF6B6B]">
                {notifications.filter((n) => n.isRead).length} read notifications
              </span>
              ? This action cannot be undone.
            </p>
            {clearAllReadMutation.isPending && (
              <div className="flex items-center justify-center py-2">
                <div className="w-6 h-6 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-[#64748B]">Processing...</span>
              </div>
            )}
          </div>
        }
        onConfirm={handleClearAll}
        onCancel={() => setClearAllModalOpen(false)}
        confirmText={clearAllReadMutation.isPending ? "Processing..." : "Clear All"}
        cancelText="Cancel"
        confirmVariant="destructive"
        disabled={clearAllReadMutation.isPending}
      />

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
              {isProcessingAction && (
                <div className="flex items-center justify-center py-2">
                  <div className="w-6 h-6 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm text-[#64748B]">Deleting...</span>
                </div>
              )}
            </div>
          ) : null
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setNotificationToDelete(null);
        }}
        confirmText={isProcessingAction ? "Deleting..." : "Delete Notification"}
        cancelText="Cancel"
        confirmVariant="destructive"
        disabled={isProcessingAction}
      />
    </div>
  );
}