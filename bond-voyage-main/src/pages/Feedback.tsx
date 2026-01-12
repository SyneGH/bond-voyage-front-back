import { Star, MessageCircle, CheckCircle, Filter, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { StatCard } from "../components/StatCard";
import { ContentCard } from "../components/ContentCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Checkbox } from "../components/ui/checkbox";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { useProfile } from "../components/ProfileContext";
import { useFeedbackList } from "../hooks/useFeedbackList";

interface FeedbackItem {
  id: number;
  customer: string;
  bookingId: string;
  trip: string;
  rating: number;
  text: string;
  date: string;
  unread?: boolean;
  responded?: boolean;
  read?: boolean;
  reply?: string;
  replyDate?: string;
}

export function Feedback() {
  const { setCustomerRatingFromFeedback } = useProfile();
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");
  const [starFilters, setStarFilters] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Reply modal state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedFeedbackForReply, setSelectedFeedbackForReply] =
    useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data } = useFeedbackList();

  // View reply modal state
  const [viewReplyModalOpen, setViewReplyModalOpen] = useState(false);
  const [selectedFeedbackForView, setSelectedFeedbackForView] =
    useState<FeedbackItem | null>(null);

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    if (data?.data) {
      const transformedData: FeedbackItem[] = data.data.map((item: any) => ({
        id: item.id,
        customer: `${item.user.firstName} ${item.user.lastName}`,
        bookingId: item.id.slice(0, 8).toUpperCase(),
        trip: "Trip Details", // Placeholder since API doesn't provide trip name
        rating: item.rating,
        text: item.comment,
        date: new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        unread: !item.response,
        responded: !!item.response,
        read: !!item.response,
        reply: item.response || undefined,
        replyDate: item.respondedAt
          ? new Date(item.respondedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : undefined,
      }));
      setFeedbackItems(transformedData);
    }
  }, [data]);

  const handleMarkAsRead = (id: number) => {
    setFeedbackItems(
      feedbackItems.map((item) =>
        item.id === id ? { ...item, unread: false, read: true } : item
      )
    );
    toast.success("Feedback marked as read!");
  };

  const handleMarkAsUnread = (id: number) => {
    setFeedbackItems(
      feedbackItems.map((item) =>
        item.id === id ? { ...item, unread: true, read: false } : item
      )
    );
    toast.success("Feedback marked as unread!");
  };

  const handleOpenReplyModal = (item: FeedbackItem) => {
    setSelectedFeedbackForReply(item);
    setReplyText("");
    setReplyModalOpen(true);
  };

  const handleSubmitReply = () => {
    if (!selectedFeedbackForReply || !replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    setFeedbackItems(
      feedbackItems.map((item) =>
        item.id === selectedFeedbackForReply.id
          ? {
              ...item,
              responded: true,
              read: true,
              unread: false,
              reply: replyText,
              replyDate: today,
            }
          : item
      )
    );

    setReplyModalOpen(false);
    setSelectedFeedbackForReply(null);
    setReplyText("");
    toast.success("Reply sent successfully!");
  };

  const handleViewReply = (item: FeedbackItem) => {
    setSelectedFeedbackForView(item);
    setViewReplyModalOpen(true);
  };

  const toggleStarFilter = (star: number) => {
    setStarFilters((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const clearFilters = () => {
    setStarFilters([]);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-[#FFB84D] text-[#FFB84D]"
                : "text-[#E5E7EB]"
            }`}
          />
        ))}
      </div>
    );
  };

  // Filter feedback based on selected tab and star filters
  const filteredFeedback = useMemo(() => {
    return feedbackItems
      .filter((item) => {
        // Tab filter
        if (selectedTab === "unread" && !item.unread) return false;

        // Star filter
        if (starFilters.length > 0 && !starFilters.includes(item.rating))
          return false;

        return true;
      })
      .sort((a, b) => {
        // In "All" tab, sort unread items to the top
        if (selectedTab === "all") {
          if (a.unread && !b.unread) return -1;
          if (!a.unread && b.unread) return 1;
        }
        return 0;
      });
  }, [feedbackItems, selectedTab, starFilters]);

  // Calculate stats based on ALL feedback (not just filtered)
  const stats = useMemo(() => {
    const totalFeedback = feedbackItems.length;
    const respondedCount = feedbackItems.filter(
      (item) => item.responded
    ).length;
    const avgRatingNum =
      feedbackItems.length > 0
        ? feedbackItems.reduce((sum, item) => sum + item.rating, 0) /
          feedbackItems.length
        : 0;
    const avgRating = avgRatingNum.toFixed(1);
    const respondedPercentage =
      totalFeedback > 0
        ? Math.round((respondedCount / totalFeedback) * 100)
        : 0;

    return {
      totalFeedback,
      avgRating,
      avgRatingNum,
      respondedPercentage,
    };
  }, [feedbackItems]);

  // Update profile context with average rating whenever it changes
  useEffect(() => {
    if (stats.avgRatingNum > 0) {
      setCustomerRatingFromFeedback(stats.avgRatingNum);
    }
  }, [stats.avgRatingNum, setCustomerRatingFromFeedback]);

  const unreadCount = feedbackItems.filter((item) => item.unread).length;

  return (
    <div>
      {/* Stats Row - Shows overall stats from all feedback */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={MessageCircle}
          label="Total Feedback"
          value={stats.totalFeedback.toString()}
          gradientFrom="var(--gradient-from)"
          gradientTo="var(--gradient-to)"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={`${stats.avgRating}/5.0`}
          gradientFrom="#FFB84D"
          gradientTo="#FF9A3D"
        />
        <StatCard
          icon={CheckCircle}
          label="Responded"
          value={`${stats.respondedPercentage}%`}
          gradientFrom="#10B981"
          gradientTo="#14B8A6"
        />
      </div>

      <ContentCard
        title={`${selectedTab === "all" ? "All" : "Unread"} Feedback (${
          filteredFeedback.length
        })`}
      >
        {/* Filter Tabs and Filter Button */}
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

          {/* Star Filter Button */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="h-10 px-4 rounded-xl border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] flex items-center gap-2 text-sm font-medium text-[#334155] transition-all relative">
                <Filter className="w-4 h-4" />
                Filter by Rating
                {starFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0A7AFF] text-white text-xs flex items-center justify-center">
                    {starFilters.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#1A2B4F]">
                    Filter by Rating
                  </h4>
                  {starFilters.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[#0A7AFF] hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center space-x-2">
                      <Checkbox
                        id={`star-${star}`}
                        checked={starFilters.includes(star)}
                        onCheckedChange={() => toggleStarFilter(star)}
                      />
                      <label
                        htmlFor={`star-${star}`}
                        className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                      >
                        {renderStars(star)}
                        <span className="text-[#64748B]">
                          ({star} {star === 1 ? "star" : "stars"})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters Display */}
        {starFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-[#64748B]">Active filters:</span>
            {starFilters.map((star) => (
              <button
                key={star}
                onClick={() => toggleStarFilter(star)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] text-sm font-medium border border-[rgba(10,122,255,0.2)] hover:bg-[rgba(10,122,255,0.15)] transition-all"
              >
                {renderStars(star)}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Feedback List */}
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#64748B]">
              No feedback found matching your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div
                key={item.id}
                className={`
                  p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                  ${
                    item.unread
                      ? "border-[#0A7AFF] bg-[rgba(10,122,255,0.02)] hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)]"
                      : "border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)]"
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {item.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-[#1A2B4F] font-semibold">
                          {item.customer}
                        </span>
                        <span className="text-sm text-[#64748B]">•</span>
                        <span className="text-sm text-[#64748B]">
                          Booking #{item.bookingId}
                        </span>
                        {renderStars(item.rating)}
                      </div>
                      <p className="text-sm text-[#64748B]">{item.trip}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.unread && (
                      <span className="w-2 h-2 bg-[#0A7AFF] rounded-full animate-pulse" />
                    )}
                    <span className="text-xs text-[#64748B]">{item.date}</span>
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="mb-4">
                  <p className="text-sm text-[#334155] leading-relaxed">
                    "{item.text}"
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.responded && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium border border-[rgba(16,185,129,0.2)]">
                        <CheckCircle className="w-3 h-3" />
                        Responded
                      </span>
                    )}
                    {item.read && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[rgba(100,116,139,0.1)] text-[#64748B] text-xs font-medium border border-[rgba(100,116,139,0.2)]">
                        Read
                      </span>
                    )}
                    {!item.responded && !item.read && item.unread && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] text-xs font-medium border border-[rgba(10,122,255,0.2)]">
                        🔵 Unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.responded ? (
                      <button
                        onClick={() => handleViewReply(item)}
                        className="h-9 px-4 rounded-lg border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] text-sm text-[#334155] font-medium transition-all"
                      >
                        View Reply
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenReplyModal(item)}
                          className="h-9 px-4 rounded-lg text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] hover:-translate-y-0.5 transition-all"
                          style={{
                            background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
                          }}
                        >
                          Reply
                        </button>
                        {item.read ? (
                          <button
                            onClick={() => handleMarkAsUnread(item.id)}
                            className="h-9 px-4 rounded-lg border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] text-sm text-[#334155] font-medium transition-all"
                          >
                            Mark as Unread
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsRead(item.id)}
                            className="h-9 px-4 rounded-lg border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] text-sm text-[#334155] font-medium transition-all"
                          >
                            Mark as Read
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      {/* Reply Modal */}
      <ConfirmationModal
        open={replyModalOpen}
        onOpenChange={setReplyModalOpen}
        title="Reply to Feedback"
        description={`Send a response to ${selectedFeedbackForReply?.customer}'s feedback`}
        icon={<MessageCircle className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(10,122,255,0.2)]"
        content={
          selectedFeedbackForReply && (
            <div className="space-y-4">
              {/* Original Feedback */}
              <div className="bg-[rgba(10,122,255,0.08)] border border-[rgba(10,122,255,0.2)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#1A2B4F]">
                    {selectedFeedbackForReply.customer}
                  </span>
                  {renderStars(selectedFeedbackForReply.rating)}
                </div>
                <p className="text-sm text-[#64748B] mb-1">
                  {selectedFeedbackForReply.trip}
                </p>
                <p className="text-sm text-[#334155] italic">
                  "{selectedFeedbackForReply.text}"
                </p>
              </div>

              {/* Reply Input */}
              <div className="space-y-2">
                <Label htmlFor="reply-text" className="text-[#1A2B4F]">
                  Your Reply <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Textarea
                  id="reply-text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="min-h-[150px] border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10 resize-none"
                />
                <p className="text-xs text-[#64748B]">
                  Be professional and courteous in your response
                </p>
              </div>
            </div>
          )
        }
        onConfirm={handleSubmitReply}
        onCancel={() => {
          setReplyModalOpen(false);
          setSelectedFeedbackForReply(null);
          setReplyText("");
        }}
        confirmText="Send Reply"
        cancelText="Cancel"
        confirmVariant="default"
      />

      {/* View Reply Modal */}
      <ConfirmationModal
        open={viewReplyModalOpen}
        onOpenChange={setViewReplyModalOpen}
        title="Reply Details"
        description={`Your response to ${selectedFeedbackForView?.customer}'s feedback`}
        icon={<CheckCircle className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
        iconShadow="shadow-[#10B981]/20"
        contentGradient="bg-gradient-to-br from-[rgba(16,185,129,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(16,185,129,0.2)]"
        content={
          selectedFeedbackForView && (
            <div className="space-y-4">
              {/* Feedback */}
              <div>
                <h4 className="text-sm font-semibold text-[#1A2B4F] mb-2">
                  Feedback
                </h4>
                <div className="bg-[rgba(10,122,255,0.08)] border border-[rgba(10,122,255,0.2)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1A2B4F]">
                      {selectedFeedbackForView.customer}
                    </span>
                    {renderStars(selectedFeedbackForView.rating)}
                  </div>
                  <p className="text-sm text-[#64748B] mb-1">
                    {selectedFeedbackForView.trip}
                  </p>
                  <p className="text-sm text-[#334155] italic">
                    "{selectedFeedbackForView.text}"
                  </p>
                  <p className="text-xs text-[#64748B] mt-2">
                    {selectedFeedbackForView.date}
                  </p>
                </div>
              </div>

              {/* Your Reply */}
              <div>
                <h4 className="text-sm font-semibold text-[#1A2B4F] mb-2">
                  Your Reply
                </h4>
                <div className="bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Responded
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {selectedFeedbackForView.replyDate}
                    </span>
                  </div>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {selectedFeedbackForView.reply}
                  </p>
                </div>
              </div>
            </div>
          )
        }
        onConfirm={() => {
          setViewReplyModalOpen(false);
          setSelectedFeedbackForView(null);
        }}
        confirmText="Close"
        cancelText=""
        confirmVariant="default"
        hideCancelButton
      />
    </div>
  );
}
