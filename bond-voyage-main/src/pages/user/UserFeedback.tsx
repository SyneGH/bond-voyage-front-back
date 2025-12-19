import { Star, MessageCircle, Plus, Filter, X, CheckCircle, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { StatCard } from "../../components/StatCard";
import { ContentCard } from "../../components/ContentCard";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Checkbox } from "../../components/ui/checkbox";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner@2.0.3";
import { useProfile } from "../../components/ProfileContext";
import { FAQAssistant } from "../../components/FAQAssistant";

interface FeedbackItem {
  id: number;
  customer: string;
  bookingId: string;
  trip: string;
  destination: string;
  rating: number;
  text: string;
  date: string;
  unread?: boolean;
  responded?: boolean;
  read?: boolean;
  reply?: string;
  replyDate?: string;
}

// Available trips from UserHistory.tsx completed bookings
interface AvailableTrip {
  id: string;
  destination: string;
  tripName: string;
}

export function UserFeedback() {
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");
  const [starFilters, setStarFilters] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const {profileData} = useProfile()
  
  // New feedback modal state
  const [newFeedbackModalOpen, setNewFeedbackModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ trip: "", rating: 5, comment: "", bookingId: "" });
  
  // View reply modal state
  const [viewReplyModalOpen, setViewReplyModalOpen] = useState(false);
  const [selectedFeedbackForView, setSelectedFeedbackForView] = useState<FeedbackItem | null>(null);
  
  // Get available trips from completed bookings (matching UserHistory.tsx completed trips)
  const availableTrips: AvailableTrip[] = [
    { id: "BV-2024-098", destination: "Boracay, Aklan", tripName: "Boracay Beach Escape" },
    { id: "BV-2024-087", destination: "Puerto Princesa, Palawan", tripName: "Puerto Princesa Underground River Tour" },
    { id: "BV-2024-076", destination: "Baguio City, Benguet", tripName: "Baguio Summer Capital Tour" },
    { id: "BV-2024-065", destination: "Siargao Island, Surigao del Norte", tripName: "Siargao Surfing Adventure" },
    { id: "BV-2024-054", destination: "Vigan, Ilocos Sur", tripName: "Vigan Heritage Tour" },
    { id: "BV-2024-043", destination: "Batanes Islands", tripName: "Batanes Cultural Immersion" },
    { id: "BV-2024-032", destination: "Coron, Palawan", tripName: "Coron Island Hopping" },
    { id: "BV-2024-021", destination: "Davao City, Davao del Sur", tripName: "Davao Food and Adventure" },
  ];
  
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([
    {
      id: 1,
      customer: "Maria Santos",
      bookingId: "BV-2024-098",
      trip: "Boracay Beach Escape",
      destination: "Boracay, Aklan",
      rating: 5,
      text: "Amazing experience! The itinerary was perfect and everything went smoothly. Highly recommend!",
      date: "August 20, 2024",
      unread: false,
      responded: true,
      read: true,
      reply: "Thank you so much for your wonderful feedback! We're thrilled to hear that you had an amazing experience in Boracay. Your satisfaction is our top priority, and we look forward to helping you plan your next adventure!",
      replyDate: "August 21, 2024",
    },
    {
      id: 2,
      customer: "Maria Santos",
      bookingId: "BV-2024-087",
      trip: "Puerto Princesa Underground River Tour",
      destination: "Puerto Princesa, Palawan",
      rating: 4,
      text: "Great trip overall, but hotel check-in was delayed. Otherwise, everything was wonderful!",
      date: "July 12, 2024",
      unread: false,
      responded: true,
      read: true,
      reply: "Thank you for your feedback! We apologize for the delay in check-in. We've addressed this issue with our hotel partners to ensure better service in the future. We're glad you enjoyed the rest of your trip!",
      replyDate: "July 13, 2024",
    },
  ]);

  const handleOpenNewFeedbackModal = () => {
    setNewFeedback({ trip: "", rating: 5, comment: "", bookingId: "" });
    setNewFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = () => {
    if (!newFeedback.bookingId || !newFeedback.comment.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const today = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const selectedTrip = availableTrips.find(t => t.id === newFeedback.bookingId);

    const newFeedbackItem: FeedbackItem = {
      id: feedbackItems.length + 1,
      customer: "Maria Santos",
      bookingId: newFeedback.bookingId,
      trip: newFeedback.trip,
      destination: selectedTrip?.destination || "",
      rating: newFeedback.rating,
      text: newFeedback.comment,
      date: today,
      unread: false,
      read: false,
    };

    setFeedbackItems([newFeedbackItem, ...feedbackItems]);
    setNewFeedbackModalOpen(false);
    setNewFeedback({ trip: "", rating: 5, comment: "", bookingId: "" });
    toast.success("Thank you for your feedback!", {
      description: "Your review has been submitted and will be reviewed by our team"
    });
  };

  const handleViewReply = (item: FeedbackItem) => {
    setSelectedFeedbackForView(item);
    setViewReplyModalOpen(true);
  };

  const toggleStarFilter = (star: number) => {
    setStarFilters(prev => 
      prev.includes(star) 
        ? prev.filter(s => s !== star)
        : [...prev, star]
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
            className={`w-4 h-4 ${star <= rating ? 'fill-[#FFB84D] text-[#FFB84D]' : 'text-[#E5E7EB]'}`}
          />
        ))}
      </div>
    );
  };

  // Filter feedback based on selected tab and star filters
  const filteredFeedback = useMemo(() => {
    return feedbackItems
      .filter(item => {
        // Tab filter
        if (selectedTab === "unread" && !item.unread) return false;
        
        // Star filter
        if (starFilters.length > 0 && !starFilters.includes(item.rating)) return false;
        
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
    const respondedCount = feedbackItems.filter(item => item.responded).length;
    const avgRatingNum = feedbackItems.length > 0 
      ? feedbackItems.reduce((sum, item) => sum + item.rating, 0) / feedbackItems.length
      : 0;
    const avgRating = avgRatingNum.toFixed(1);

    return {
      totalFeedback,
      avgRating,
      avgRatingNum,
      respondedCount
    };
  }, [feedbackItems]);

  const unreadCount = feedbackItems.filter(item => item.unread).length;

  return (
    <div>
      {/* Stats Row - Shows overall stats from all feedback */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={MessageCircle}
          label="Total Feedback"
          value={stats.totalFeedback.toString()}
          gradientFrom="#0A7AFF"
          gradientTo="#3B9EFF"
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
          label="Replied by Admin"
          value={stats.respondedCount.toString()}
          gradientFrom="#10B981"
          gradientTo="#14B8A6"
        />
      </div>

      <ContentCard 
        title={`${selectedTab === "all" ? "All" : "Unread"} Feedback (${filteredFeedback.length})`}
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

          {/* Filter and New Feedback Buttons */}
          <div className="flex items-center gap-3">
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
                    <h4 className="text-sm font-semibold text-[#1A2B4F]">Filter by Rating</h4>
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
                          <span className="text-[#64748B]">({star} {star === 1 ? 'star' : 'stars'})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* New Feedback Button */}
            <button
              onClick={handleOpenNewFeedbackModal}
              className="h-10 px-4 rounded-xl text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Leave Feedback
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {starFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-[#64748B]">Active filters:</span>
            {starFilters.map(star => (
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
            <p className="text-[#64748B]">No feedback found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div
                key={item.id}
                className={`
                  p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                  ${item.unread 
                    ? 'border-[#0A7AFF] bg-[rgba(10,122,255,0.02)] hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)]' 
                    : 'border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)]'
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {item.customer.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-[#1A2B4F] font-semibold">{item.customer}</span>
                        <span className="text-sm text-[#64748B]">•</span>
                        <span className="text-sm text-[#64748B]">Booking #{item.bookingId}</span>
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
                        Replied
                      </span>
                    )}
                    {item.read && !item.responded && (
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
                    {item.responded && (
                      <button 
                        onClick={() => handleViewReply(item)}
                        className="h-9 px-4 rounded-lg border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[#F8FAFB] text-sm text-[#334155] font-medium transition-all"
                      >
                        View Reply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      {/* New Feedback Modal */}
      <ConfirmationModal
        open={newFeedbackModalOpen}
        onOpenChange={setNewFeedbackModalOpen}
        title="Leave Feedback"
        description="Share your experience with us"
        icon={<Star className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(10,122,255,0.2)]"
        content={
          <div className="space-y-4">
            <div>
              <Label htmlFor="trip-select" className="text-[#1A2B4F] mb-2 block">
                Select Trip <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Select 
                value={newFeedback.bookingId}
                onValueChange={(value) => {
                  const selectedTrip = availableTrips.find(t => t.id === value);
                  setNewFeedback({ 
                    ...newFeedback, 
                    bookingId: value,
                    trip: selectedTrip ? selectedTrip.tripName : ""
                  });
                }}
              >
                <SelectTrigger id="trip-select" className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10">
                  <SelectValue placeholder="Choose a completed trip..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      Booking #{trip.id} - {trip.tripName} ({trip.destination})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#64748B] mt-2">
                Only completed trips are available for feedback
              </p>
            </div>
            <div>
              <Label className="text-[#1A2B4F] mb-3 block">
                Rating <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setNewFeedback({ ...newFeedback, rating })}
                    className="group p-2 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-10 h-10 transition-colors ${
                        rating <= newFeedback.rating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300 dark:text-gray-600 group-hover:text-yellow-400"
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                {newFeedback.rating === 5 ? "Excellent!" : 
                 newFeedback.rating === 4 ? "Very Good" :
                 newFeedback.rating === 3 ? "Good" :
                 newFeedback.rating === 2 ? "Fair" : "Poor"}
              </p>
            </div>
            <div>
              <Label htmlFor="feedback-comment" className="text-[#1A2B4F] mb-2 block">
                Comment <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Textarea
                id="feedback-comment"
                value={newFeedback.comment}
                onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                placeholder="Share your experience with this trip..."
                className="min-h-[150px] border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10 resize-none"
              />
              <p className="text-xs text-[#64748B] mt-2">
                {newFeedback.comment.length}/500 characters - Share your honest experience
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-[#64748B]">
                <strong className="text-primary">Note:</strong> Your feedback helps us improve our services and assists other travelers in making informed decisions. All feedback is reviewed by our team.
              </p>
            </div>
          </div>
        }
        onConfirm={handleSubmitFeedback}
        onCancel={() => {
          setNewFeedbackModalOpen(false);
          setNewFeedback({ trip: "", rating: 5, comment: "", bookingId: "" });
        }}
        confirmText="Submit Feedback"
        cancelText="Cancel"
        confirmVariant="default"
      />

      {/* View Reply Modal */}
      <ConfirmationModal
        open={viewReplyModalOpen}
        onOpenChange={setViewReplyModalOpen}
        title="Reply Details"
        description={`BondVoyage's response to your feedback`}
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
                <h4 className="text-sm font-semibold text-[#1A2B4F] mb-2">Your Feedback</h4>
                <div className="bg-[rgba(10,122,255,0.08)] border border-[rgba(10,122,255,0.2)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1A2B4F]">{selectedFeedbackForView.customer}</span>
                    {renderStars(selectedFeedbackForView.rating)}
                  </div>
                  <p className="text-sm text-[#64748B] mb-1">{selectedFeedbackForView.trip}</p>
                  <p className="text-sm text-[#334155] italic">"{selectedFeedbackForView.text}"</p>
                  <p className="text-xs text-[#64748B] mt-2">{selectedFeedbackForView.date}</p>
                </div>
              </div>

              {/* Admin Reply */}
              <div>
                <h4 className="text-sm font-semibold text-[#1A2B4F] mb-2">{profileData.companyName}'s Reply</h4>
                <div className="bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Responded
                    </span>
                    <span className="text-xs text-[#64748B]">{selectedFeedbackForView.replyDate}</span>
                  </div>
                  <p className="text-sm text-[#334155] leading-relaxed">{selectedFeedbackForView.reply}</p>
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
      <FAQAssistant />
    </div>
  );
}
