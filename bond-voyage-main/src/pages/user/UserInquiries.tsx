import { useState, useRef } from "react";
import { MessageSquare, Send, Plus, X, Clock, CheckCircle, ArrowLeft, User, Search, Calendar } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { StatCard } from "../../components/StatCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Pagination } from "../../components/Pagination";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner@2.0.3";

interface Message {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  content: string;
  timestamp: Date;
  read?: boolean;
}

interface Inquiry {
  id: string;
  subject: string;
  status: "open" | "resolved";
  createdDate: Date;
  lastUpdated: Date;
  messages: Message[];
  unreadCount: number;
}

export function UserInquiries() {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showNewInquiry, setShowNewInquiry] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newInquiryData, setNewInquiryData] = useState({ subject: "", message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "resolved">("all");
  const itemsPerPage = 5;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: "INQ-001",
      subject: "Question about Palawan package",
      status: "resolved",
      createdDate: new Date("2024-11-28T10:30:00"),
      lastUpdated: new Date("2024-11-28T14:15:00"),
      unreadCount: 0,
      messages: [
        { id: "msg-001", sender: "user", senderName: "Maria Santos", content: "Hi! I'd like to know if the Palawan package includes snorkeling equipment?", timestamp: new Date("2024-11-28T10:30:00"), read: true },
        { id: "msg-002", sender: "admin", senderName: "Admin", content: "Hello Maria! Yes, snorkeling equipment is included in the package. You'll also have a guide.", timestamp: new Date("2024-11-28T14:15:00"), read: true }
      ]
    },
    {
      id: "INQ-002",
      subject: "Payment inquiry",
      status: "open",
      createdDate: new Date("2024-11-29T09:00:00"),
      lastUpdated: new Date("2024-11-29T09:00:00"),
      unreadCount: 0,
      messages: [
        { id: "msg-003", sender: "user", senderName: "Maria Santos", content: "Can I pay in installments?", timestamp: new Date("2024-11-29T09:00:00"), read: true }
      ]
    },
    {
      id: "INQ-003",
      subject: "Booking modification request",
      status: "open",
      createdDate: new Date("2024-11-27T15:00:00"),
      lastUpdated: new Date("2024-11-28T10:30:00"),
      unreadCount: 1,
      messages: [
        { id: "msg-004", sender: "user", senderName: "Maria Santos", content: "I need to change my travel dates for booking BV-2025-001", timestamp: new Date("2024-11-27T15:00:00"), read: true },
        { id: "msg-005", sender: "admin", senderName: "Admin", content: "We can help you with that. What are your preferred new dates?", timestamp: new Date("2024-11-27T18:20:00"), read: true },
        { id: "msg-006", sender: "admin", senderName: "Admin", content: "Please let us know your new dates so we can check availability.", timestamp: new Date("2024-11-28T10:30:00"), read: false }
      ]
    }
  ]);

  // Auto scroll when new message is sent
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || inquiry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedInquiry) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      senderName: "Maria Santos",
      content: newMessage,
      timestamp: new Date(),
      read: true,
    };

    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === selectedInquiry.id) {
        return {
          ...inq,
          messages: [...inq.messages, newMsg],
          lastUpdated: new Date(),
        };
      }
      return inq;
    });

    setInquiries(updatedInquiries);
    setSelectedInquiry({
      ...selectedInquiry,
      messages: [...selectedInquiry.messages, newMsg],
      lastUpdated: new Date(),
    });
    setNewMessage("");
    toast.success("Message sent successfully!", {
      description: "Our team will respond shortly"
    });

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleCreateInquiry = () => {
    if (!newInquiryData.subject.trim() || !newInquiryData.message.trim()) {
      toast.error("Missing information", {
        description: "Please fill in all fields"
      });
      return;
    }

    const newInquiry: Inquiry = {
      id: `INQ-${String(inquiries.length + 1).padStart(3, '0')}`,
      subject: newInquiryData.subject,
      status: "open",
      createdDate: new Date(),
      lastUpdated: new Date(),
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "user",
          senderName: "Maria Santos",
          content: newInquiryData.message,
          timestamp: new Date(),
          read: true,
        },
      ],
    };

    setInquiries([newInquiry, ...inquiries]);
    toast.success("Inquiry submitted!", {
      description: "We'll respond within 24 hours"
    });
    setShowNewInquiry(false);
    setNewInquiryData({ subject: "", message: "" });
  };

  // Handle open inquiry
  const handleOpenInquiry = (inquiry: Inquiry) => {
    // Mark all messages as read
    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === inquiry.id) {
        return {
          ...inq,
          unreadCount: 0,
          messages: inq.messages.map(msg => ({ ...msg, read: true })),
        };
      }
      return inq;
    });

    setInquiries(updatedInquiries);
    setSelectedInquiry({
      ...inquiry,
      unreadCount: 0,
      messages: inquiry.messages.map(msg => ({ ...msg, read: true })),
    });
  };

  // Format timestamp
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
    return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  };

  // Find first unread message index
  const getFirstUnreadIndex = () => {
    if (!selectedInquiry) return -1;
    return selectedInquiry.messages.findIndex(msg => msg.sender === "admin" && !msg.read);
  };

  const firstUnreadIndex = getFirstUnreadIndex();



  // List View (matching Inquiries.tsx design)
  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={MessageSquare}
          label="Total Inquiries"
          value={inquiries.length.toString()}
          gradientFrom="#0A7AFF"
          gradientTo="#3B9EFF"
        />
        <StatCard
          icon={Clock}
          label="Open Inquiries"
          value={inquiries.filter(i => i.status === "open").length.toString()}
          gradientFrom="#FFB84D"
          gradientTo="#FB7185"
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved"
          value={inquiries.filter(i => i.status === "resolved").length.toString()}
          gradientFrom="#10B981"
          gradientTo="#14B8A6"
        />
      </div>

      <ContentCard
        title={`Your Inquiries (${filteredInquiries.length})`}
        action={
          <button
            onClick={() => setShowNewInquiry(true)}
            className="h-10 px-5 rounded-[20px] text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] dark:shadow-[0_2px_8px_rgba(37,150,190,0.4)] flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}
          >
            <Plus className="w-4 h-4" />
            New Inquiry
          </button>
        }
      >
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inquiries by subject or ID..."
              className="w-full h-11 px-4 pl-12 rounded-xl border border-[#E5E7EB] dark:border-[#2A3441] bg-[#F8FAFB] dark:bg-[#1A1F2E] text-sm text-[#334155] dark:text-[#E5E7EB] placeholder:text-[#64748B] dark:placeholder:text-[#64748B] focus:border-[#0A7AFF] dark:focus:border-[#2596be] focus:bg-white dark:focus:bg-[#1A1F2E] focus:outline-none focus:ring-4 focus:ring-[rgba(10,122,255,0.08)] dark:focus:ring-[rgba(37,150,190,0.15)] shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(37,150,190,0.4)] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 border-2 border-[#E5E7EB] dark:border-[#2A3441] rounded-xl p-1 bg-white dark:bg-[#1A1F2E]">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 h-9 rounded-lg text-sm font-medium transition-all ${
                filterStatus === "all"
                  ? "text-white shadow-sm"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0A7AFF] dark:hover:text-[#2596be] hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(37,150,190,0.15)]"
              }`}
              style={filterStatus === "all" ? { background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` } : {}}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("open")}
              className={`px-4 h-9 rounded-lg text-sm font-medium transition-all ${
                filterStatus === "open"
                  ? "text-white shadow-sm"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0A7AFF] dark:hover:text-[#2596be] hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(37,150,190,0.15)]"
              }`}
              style={filterStatus === "open" ? { background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` } : {}}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus("resolved")}
              className={`px-4 h-9 rounded-lg text-sm font-medium transition-all ${
                filterStatus === "resolved"
                  ? "text-white shadow-sm"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0A7AFF] dark:hover:text-[#2596be] hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(37,150,190,0.15)]"
              }`}
              style={filterStatus === "resolved" ? { background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` } : {}}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Inquiry List - Matching Inquiries.tsx Design */}
        <div className="space-y-3">
          {paginatedInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              onClick={() => handleOpenInquiry(inquiry)}
              className="p-5 rounded-2xl border-2 border-[#E5E7EB] dark:border-[#2A3441] hover:border-[#0A7AFF] dark:hover:border-[#0A7AFF] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(10,122,255,0.1)] dark:hover:shadow-[0_4px_12px_rgba(10,122,255,0.3)] cursor-pointer bg-white dark:bg-[#1A1F2E]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    inquiry.status === "open"
                      ? "bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
                      : "bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
                  }`}>
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-[#1A2B4F] dark:text-[#E5E7EB]">{inquiry.subject}</h3>
                      {inquiry.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF6B6B] text-white text-xs font-medium">
                          {inquiry.unreadCount} new
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        inquiry.status === "open"
                          ? "bg-[rgba(10,122,255,0.1)] dark:bg-[rgba(10,122,255,0.2)] text-[#0A7AFF] dark:text-[#3B9EFF] border border-[rgba(10,122,255,0.2)] dark:border-[rgba(10,122,255,0.3)]"
                          : "bg-[rgba(16,185,129,0.1)] dark:bg-[rgba(16,185,129,0.2)] text-[#10B981] dark:text-[#14B8A6] border border-[rgba(16,185,129,0.2)] dark:border-[rgba(16,185,129,0.3)]"
                      }`}>
                        {inquiry.status === "open" ? "Open" : "Resolved"}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-2">{inquiry.id}</p>
                    <div className="flex items-center gap-4 text-sm text-[#64748B] dark:text-[#94A3B8] flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>Maria Santos</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Last updated {formatTimestamp(inquiry.lastUpdated)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        <span>{inquiry.messages.length} messages</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pl-13">
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] line-clamp-2">
                  {inquiry.messages[inquiry.messages.length - 1].content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {paginatedInquiries.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#F8FAFB] dark:bg-[#0F1419] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-[#64748B] dark:text-[#94A3B8]" />
            </div>
            <p className="text-[#64748B] dark:text-[#94A3B8]">No inquiries found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 pt-6 border-t border-border">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </ContentCard>

      {/* Conversation View Modal */}
      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden flex flex-col">
            {/* Header - Fixed */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <DialogTitle className="text-xl font-semibold text-[#1A2B4F] dark:text-white">
                      {selectedInquiry.subject}
                    </DialogTitle>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedInquiry.status === "open"
                        ? "bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] dark:bg-[rgba(37,150,190,0.2)] dark:text-[#2596be] border border-[rgba(10,122,255,0.2)] dark:border-[rgba(37,150,190,0.3)]"
                        : "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
                    }`}>
                      {selectedInquiry.status === "open" ? "Open" : "Resolved"}
                    </span>
                  </div>
                  <DialogDescription className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
                    {selectedInquiry.id}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-4 pr-4">
                  {selectedInquiry.messages.map((message, index) => (
                    <div key={message.id}>
                      {/* Unread Messages Marker */}
                      {index === firstUnreadIndex && firstUnreadIndex !== -1 && (
                        <div className="flex items-center gap-3 my-6">
                          <div className="flex-1 h-px bg-[#FF6B6B]"></div>
                          <span className="text-xs font-semibold text-[#FF6B6B] bg-[rgba(255,107,107,0.1)] px-3 py-1 rounded-full border border-[rgba(255,107,107,0.2)]">
                            {selectedInquiry.messages.filter(msg => msg.sender === "admin" && !msg.read).length} Unread Message{selectedInquiry.messages.filter(msg => msg.sender === "admin" && !msg.read).length > 1 ? 's' : ''}
                          </span>
                          <div className="flex-1 h-px bg-[#FF6B6B]"></div>
                        </div>
                      )}
                      
                      <div
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] ${message.sender === "user" ? "order-2" : "order-1"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">{message.senderName}</span>
                            <span className="text-xs text-[#94A3B8] dark:text-[#64748B]">{formatTimestamp(message.timestamp)}</span>
                          </div>
                          <div
                            className={`p-4 rounded-2xl ${
                              message.sender === "user"
                                ? "bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] dark:from-[#2596be] dark:to-[#25bce0] text-white rounded-tr-sm"
                                : "bg-[#F8FAFB] dark:bg-[#1A1F2E] border-2 border-[#E5E7EB] dark:border-[#2A3441] text-[#334155] dark:text-[#E5E7EB] rounded-tl-sm"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input - Fixed at Bottom */}
            {selectedInquiry.status === "open" && (
              <div className="flex items-end gap-3 p-6 border-t border-border flex-shrink-0 bg-card">
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[60px] border-[#E5E7EB] dark:border-[#2A3441] focus:border-[#14B8A6] dark:focus:border-[#14B8A6] focus:ring-[#14B8A6]/10 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="h-[60px] px-6 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] dark:from-[#2596be] dark:to-[#25bce0] text-white flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#0A7AFF]/20 dark:hover:shadow-[#2596be]/30"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* New Inquiry Dialog */}
      {showNewInquiry && (
        <Dialog open={showNewInquiry} onOpenChange={setShowNewInquiry}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-primary" strokeWidth={2} />
                New Inquiry
              </DialogTitle>
              <DialogDescription>
                Submit a new inquiry to our support team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 px-6 pb-6">
              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="What's your inquiry about?"
                  value={newInquiryData.subject}
                  onChange={(e) => setNewInquiryData({ ...newInquiryData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describe your inquiry in detail..."
                  rows={5}
                  value={newInquiryData.message}
                  onChange={(e) => setNewInquiryData({ ...newInquiryData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowNewInquiry(false)}
                  className="px-6 py-3 border border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInquiry}
                  className="px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))',
                    color: 'white'
                  }}
                >
                  Submit Inquiry
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
