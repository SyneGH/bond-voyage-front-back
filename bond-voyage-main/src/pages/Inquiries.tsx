import { useState, useRef, useEffect } from "react";
import { MessageSquare, Search, CheckCircle2, Clock, Send, Plus, User, Calendar, ArrowLeft } from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { StatCard } from "../components/StatCard";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ScrollArea } from "../components/ui/scroll-area";
import { Label } from "../components/ui/label";
import { toast } from "sonner@2.0.3";

interface Message {
  id: string;
  sender: "admin" | "client";
  senderName: string;
  content: string;
  timestamp: Date;
  read?: boolean;
}

interface Inquiry {
  id: string;
  subject: string;
  clientName: string;
  clientEmail: string;
  clientMobile: string;
  status: "open" | "resolved";
  createdDate: Date;
  lastUpdated: Date;
  messages: Message[];
  unreadCount: number;
}

const mockInquiries: Inquiry[] = [
  {
    id: "INQ-2024-001",
    subject: "Question about Boracay Package Pricing",
    clientName: "Maria Santos",
    clientEmail: "maria.santos@email.com",
    clientMobile: "+63 917 123 4567",
    status: "open",
    createdDate: new Date("2024-01-15T09:30:00"),
    lastUpdated: new Date("2024-01-15T14:20:00"),
    unreadCount: 2,
    messages: [
      {
        id: "msg-001",
        sender: "client",
        senderName: "Maria Santos",
        content: "Hi! I'm interested in the Boracay 5-Day Beach Escape package. Can you provide more details about what's included in the ₱4,500 per person price?",
        timestamp: new Date("2024-01-15T09:30:00"),
        read: true,
      },
      {
        id: "msg-002",
        sender: "admin",
        senderName: "Admin",
        content: "Hello Maria! Thank you for your interest. The ₱4,500 per person includes accommodation for 4 nights, daily breakfast, island hopping tour, airport transfers, and tour guide services. Flights and lunch/dinner are not included.",
        timestamp: new Date("2024-01-15T10:15:00"),
        read: true,
      },
      {
        id: "msg-003",
        sender: "client",
        senderName: "Maria Santos",
        content: "Thank you! Do you have any available slots for the first week of March? We're a group of 6 people.",
        timestamp: new Date("2024-01-15T14:20:00"),
        read: false,
      },
      {
        id: "msg-004",
        sender: "client",
        senderName: "Maria Santos",
        content: "Also, is there a discount for groups of 6 or more?",
        timestamp: new Date("2024-01-15T14:22:00"),
        read: false,
      },
    ],
  },
  {
    id: "INQ-2024-002",
    subject: "Customization Request for Palawan Trip",
    clientName: "Roberto dela Cruz",
    clientEmail: "roberto.delacruz@email.com",
    clientMobile: "+63 928 765 4321",
    status: "open",
    createdDate: new Date("2024-01-14T16:45:00"),
    lastUpdated: new Date("2024-01-15T11:30:00"),
    unreadCount: 1,
    messages: [
      {
        id: "msg-004",
        sender: "client",
        senderName: "Roberto dela Cruz",
        content: "Good day! I'd like to customize the Palawan Underground River package. Can we add an extra day for island hopping in El Nido?",
        timestamp: new Date("2024-01-14T16:45:00"),
        read: true,
      },
      {
        id: "msg-005",
        sender: "admin",
        senderName: "Admin - Ana Reyes",
        content: "Hello Roberto! Absolutely, we can customize the package for you. Adding an extra day for El Nido island hopping would cost an additional ₱3,200 per person, which includes boat rental, lunch, and snorkeling equipment.",
        timestamp: new Date("2024-01-15T09:00:00"),
        read: true,
      },
      {
        id: "msg-006",
        sender: "client",
        senderName: "Roberto dela Cruz",
        content: "That sounds perfect! Can you send me the detailed itinerary?",
        timestamp: new Date("2024-01-15T11:30:00"),
        read: false,
      },
    ],
  },
  {
    id: "INQ-2024-003",
    subject: "Payment Options Inquiry",
    clientName: "Lisa Mendoza",
    clientEmail: "lisa.mendoza@email.com",
    clientMobile: "+63 915 888 9999",
    status: "resolved",
    createdDate: new Date("2024-01-13T13:20:00"),
    lastUpdated: new Date("2024-01-14T10:00:00"),
    unreadCount: 0,
    messages: [
      {
        id: "msg-007",
        sender: "client",
        senderName: "Lisa Mendoza",
        content: "Hi! What payment methods do you accept? And is there an installment option available?",
        timestamp: new Date("2024-01-13T13:20:00"),
        read: true,
      },
      {
        id: "msg-008",
        sender: "admin",
        senderName: "Admin - Carlos Santos",
        content: "Hello Lisa! We accept bank transfers, GCash, PayMaya, and credit cards. Yes, we do offer installment plans. You can pay 50% down payment and the remaining 50% at least 2 weeks before your travel date.",
        timestamp: new Date("2024-01-13T15:30:00"),
        read: true,
      },
      {
        id: "msg-009",
        sender: "client",
        senderName: "Lisa Mendoza",
        content: "Perfect! That works for me. Thank you so much for the information!",
        timestamp: new Date("2024-01-14T10:00:00"),
        read: true,
      },
    ],
  },
  {
    id: "INQ-2024-004",
    subject: "Group Discount for Baguio Package",
    clientName: "Miguel Torres",
    clientEmail: "miguel.torres@email.com",
    clientMobile: "+63 920 555 1234",
    status: "open",
    createdDate: new Date("2024-01-12T08:15:00"),
    lastUpdated: new Date("2024-01-12T16:45:00"),
    unreadCount: 0,
    messages: [
      {
        id: "msg-010",
        sender: "client",
        senderName: "Miguel Torres",
        content: "Hello! Our company is planning a team building event in Baguio for 25 people. Do you offer group discounts?",
        timestamp: new Date("2024-01-12T08:15:00"),
        read: true,
      },
      {
        id: "msg-011",
        sender: "admin",
        senderName: "Admin",
        content: "Hi Miguel! Yes, we offer group discounts for 20+ people. For your group size, we can offer a 15% discount on the total package price. Would you like me to prepare a customized quotation?",
        timestamp: new Date("2024-01-12T10:30:00"),
        read: true,
      },
      {
        id: "msg-012",
        sender: "client",
        senderName: "Miguel Torres",
        content: "Yes please! We're looking at the first week of February. Can you also include team building activities?",
        timestamp: new Date("2024-01-12T16:45:00"),
        read: true,
      },
    ],
  },
  {
    id: "INQ-2024-005",
    subject: "Visa Requirements for International Tourists",
    clientName: "Sarah Johnson",
    clientEmail: "sarah.j@email.com",
    clientMobile: "+1 555 123 4567",
    status: "resolved",
    createdDate: new Date("2024-01-11T11:00:00"),
    lastUpdated: new Date("2024-01-11T14:30:00"),
    unreadCount: 0,
    messages: [
      {
        id: "msg-013",
        sender: "client",
        senderName: "Sarah Johnson",
        content: "Hi! I'm visiting from the US. Do I need a visa to visit the Philippines? And do you assist with visa processing?",
        timestamp: new Date("2024-01-11T11:00:00"),
        read: true,
      },
      {
        id: "msg-014",
        sender: "admin",
        senderName: "Admin - Ana Reyes",
        content: "Hello Sarah! US citizens can enter the Philippines visa-free for up to 30 days. While we don't directly process visas, we can provide you with the necessary documents like tour confirmations and hotel bookings to support your travel.",
        timestamp: new Date("2024-01-11T13:00:00"),
        read: true,
      },
      {
        id: "msg-015",
        sender: "client",
        senderName: "Sarah Johnson",
        content: "That's great! Thank you for the quick response!",
        timestamp: new Date("2024-01-11T14:30:00"),
        read: true,
      },
    ],
  },
];

export function Inquiries() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "resolved">("all");
  const [newInquiryModalOpen, setNewInquiryModalOpen] = useState(false);
  const [markResolvedModalOpen, setMarkResolvedModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [newInquiryForm, setNewInquiryForm] = useState({
    subject: "",
    clientName: "",
    clientEmail: "",
    clientMobile: "",
    message: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll when new message is sent by admin
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || inquiry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle send message
  const handleSendMessage = () => {
    if (!selectedInquiry || !messageInput.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      senderName: "Admin",
      content: messageInput,
      timestamp: new Date(),
      read: true,
    };

    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === selectedInquiry.id) {
        return {
          ...inq,
          messages: [...inq.messages, newMessage],
          lastUpdated: new Date(),
        };
      }
      return inq;
    });

    setInquiries(updatedInquiries);
    setSelectedInquiry({
      ...selectedInquiry,
      messages: [...selectedInquiry.messages, newMessage],
      lastUpdated: new Date(),
    });
    setMessageInput("");
    toast.success("Message sent successfully!");
    
    // Auto scroll to the new message
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  // Handle mark as resolved
  const handleMarkAsResolved = () => {
    if (!selectedInquiry) return;
    
    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === selectedInquiry.id) {
        return { ...inq, status: "resolved" as const };
      }
      return inq;
    });

    setInquiries(updatedInquiries);
    setSelectedInquiry({ ...selectedInquiry, status: "resolved" });
    setMarkResolvedModalOpen(false);
    toast.success(`Inquiry ${selectedInquiry.id} marked as resolved!`);
  };

  // Handle reopen inquiry
  const handleReopenInquiry = () => {
    if (!selectedInquiry) return;
    
    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === selectedInquiry.id) {
        return { ...inq, status: "open" as const };
      }
      return inq;
    });

    setInquiries(updatedInquiries);
    setSelectedInquiry({ ...selectedInquiry, status: "open" });
    setReopenModalOpen(false);
    toast.success(`Inquiry ${selectedInquiry.id} reopened successfully!`);
  };

  // Handle create new inquiry
  const handleCreateInquiry = () => {
    if (!newInquiryForm.subject || !newInquiryForm.clientName || !newInquiryForm.clientEmail || !newInquiryForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newInquiry: Inquiry = {
      id: `INQ-2024-${String(inquiries.length + 1).padStart(3, '0')}`,
      subject: newInquiryForm.subject,
      clientName: newInquiryForm.clientName,
      clientEmail: newInquiryForm.clientEmail,
      clientMobile: newInquiryForm.clientMobile,
      status: "open",
      createdDate: new Date(),
      lastUpdated: new Date(),
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "admin",
          senderName: "Admin",
          content: newInquiryForm.message,
          timestamp: new Date(),
          read: true,
        },
      ],
    };

    setInquiries([newInquiry, ...inquiries]);
    setNewInquiryModalOpen(false);
    setNewInquiryForm({
      subject: "",
      clientName: "",
      clientEmail: "",
      clientMobile: "",
      message: "",
    });
    setSelectedInquiry(newInquiry);
    toast.success("New inquiry created successfully!");
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
    return selectedInquiry.messages.findIndex(msg => msg.sender === "client" && !msg.read);
  };

  const firstUnreadIndex = getFirstUnreadIndex();

  if (selectedInquiry) {
    // Conversation View
    return (
      <div>
        <ContentCard
          title={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAFB] hover:border-[#0A7AFF] text-[#334155] flex items-center justify-center transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-[#1A2B4F]">{selectedInquiry.subject}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedInquiry.status === "open"
                      ? "bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border border-[rgba(10,122,255,0.2)]"
                      : "bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]"
                  }`}>
                    {selectedInquiry.status === "open" ? "Open" : "Resolved"}
                  </span>
                </div>
                <p className="text-sm text-[#64748B] mt-1">{selectedInquiry.id}</p>
              </div>
            </div>
          }
          action={
            selectedInquiry.status === "open" ? (
              <button
                onClick={() => setMarkResolvedModalOpen(true)}
                className="h-10 px-5 rounded-[20px] bg-gradient-to-r from-[#10B981] to-[#14B8A6] text-white text-sm font-medium shadow-[0_2px_8px_rgba(16,185,129,0.25)] flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Resolved
              </button>
            ) : (
              <button
                onClick={() => setReopenModalOpen(true)}
                className="h-10 px-5 rounded-[20px] bg-white border-2 border-[#0A7AFF] text-[#0A7AFF] text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-[rgba(10,122,255,0.05)]"
              >
                <Clock className="w-4 h-4" />
                Reopen Inquiry
              </button>
            )
          }
        >
          {/* Client Info Card */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)] border-2 border-[rgba(10,122,255,0.1)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A2B4F] mb-2">{selectedInquiry.clientName}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Email</p>
                    <p className="text-sm text-[#334155] font-medium">{selectedInquiry.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Mobile</p>
                    <p className="text-sm text-[#334155] font-medium">{selectedInquiry.clientMobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Created</p>
                    <p className="text-sm text-[#334155] font-medium">
                      {selectedInquiry.createdDate.toLocaleDateString("en-PH", { 
                        month: "short", 
                        day: "numeric", 
                        year: "numeric" 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="h-[450px] mb-6 p-4 rounded-xl border-2 border-[#E5E7EB] bg-white">
            <div className="space-y-4">
              {selectedInquiry.messages.map((message, index) => (
                <div key={message.id}>
                  {/* Unread Messages Marker */}
                  {index === firstUnreadIndex && firstUnreadIndex !== -1 && (
                    <div className="flex items-center gap-3 my-6">
                      <div className="flex-1 h-px bg-[#FF6B6B]"></div>
                      <span className="text-xs font-semibold text-[#FF6B6B] bg-[rgba(255,107,107,0.1)] px-3 py-1 rounded-full border border-[rgba(255,107,107,0.2)]">
                        {selectedInquiry.messages.filter(msg => msg.sender === "client" && !msg.read).length} Unread Message{selectedInquiry.messages.filter(msg => msg.sender === "client" && !msg.read).length > 1 ? 's' : ''}
                      </span>
                      <div className="flex-1 h-px bg-[#FF6B6B]"></div>
                    </div>
                  )}
                  
                  <div
                    className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] ${message.sender === "admin" ? "order-2" : "order-1"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[#64748B]">{message.senderName}</span>
                        <span className="text-xs text-[#94A3B8]">{formatTimestamp(message.timestamp)}</span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl ${
                          message.sender === "admin"
                            ? "bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] text-white rounded-tr-sm"
                            : "bg-[#F8FAFB] border-2 border-[#E5E7EB] text-[#334155] rounded-tl-sm"
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

          {/* Message Input */}
          {selectedInquiry.status === "open" && (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your response..."
                  className="min-h-[60px] border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10 resize-none"
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
                disabled={!messageInput.trim()}
                className="h-[60px] px-6 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#0A7AFF]/20"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          )}
        </ContentCard>

        {/* Mark as Resolved Modal */}
        <ConfirmationModal
          open={markResolvedModalOpen}
          onOpenChange={setMarkResolvedModalOpen}
          title="Mark Inquiry as Resolved"
          description="Confirm that this inquiry has been successfully resolved."
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#10B981] to-[#14B8A6]"
          iconShadow="shadow-[#10B981]/20"
          contentGradient="bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.12)]"
          contentBorder="border-[rgba(16,185,129,0.2)]"
          content={
            <p className="text-sm text-[#334155] leading-relaxed">
              Mark inquiry from <span className="font-semibold text-[#10B981]">{selectedInquiry.clientName}</span> as resolved?
            </p>
          }
          onConfirm={handleMarkAsResolved}
          onCancel={() => setMarkResolvedModalOpen(false)}
          confirmText="Mark as Resolved"
          cancelText="Cancel"
          confirmVariant="success"
        />

        {/* Reopen Inquiry Modal */}
        <ConfirmationModal
          open={reopenModalOpen}
          onOpenChange={setReopenModalOpen}
          title="Reopen Inquiry"
          description="This will move the inquiry back to open status."
          icon={<Clock className="w-5 h-5 text-white" />}
          iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
          iconShadow="shadow-[#0A7AFF]/20"
          contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.08)] to-[rgba(20,184,166,0.12)]"
          contentBorder="border-[rgba(10,122,255,0.2)]"
          content={
            <p className="text-sm text-[#334155] leading-relaxed">
              Reopen inquiry from <span className="font-semibold text-[#0A7AFF]">{selectedInquiry.clientName}</span>?
            </p>
          }
          onConfirm={handleReopenInquiry}
          onCancel={() => setReopenModalOpen(false)}
          confirmText="Reopen Inquiry"
          cancelText="Cancel"
          confirmVariant="default"
        />
      </div>
    );
  }

  // List View
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
          icon={CheckCircle2}
          label="Resolved"
          value={inquiries.filter(i => i.status === "resolved").length.toString()}
          gradientFrom="#10B981"
          gradientTo="#14B8A6"
        />
      </div>

      <ContentCard
        title={`Client Inquiries (${filteredInquiries.length})`}
        action={
          <button
            onClick={() => setNewInquiryModalOpen(true)}
            className="h-10 px-5 rounded-[20px] text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}
          >
            <Plus className="w-4 h-4" />
            New Inquiry
          </button>
        }
      >
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inquiries by subject, client name, or ID..."
              className="w-full h-11 px-4 pl-12 rounded-xl border border-[#E5E7EB] dark:border-[#2A3441] bg-[#F8FAFB] dark:bg-[#1A1F2E] text-sm text-[#334155] dark:text-[#E5E7EB] placeholder:text-[#64748B] dark:placeholder:text-[#64748B] focus:border-[#0A7AFF] focus:bg-white dark:focus:bg-[#1A1F2E] focus:outline-none focus:ring-4 focus:ring-[rgba(10,122,255,0.08)] dark:focus:ring-[rgba(37,150,190,0.15)] shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(37,150,190,0.4)] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 border-2 border-[#E5E7EB] dark:border-[#2A3441] rounded-xl p-1 bg-white dark:bg-[#2596be]">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 h-9 rounded-lg text-sm font-medium transition-all ${
                filterStatus === "all"
                  ? "text-white shadow-sm"
                  : "text-[#64748B] dark:text-white hover:text-[#0A7AFF] dark:hover:text-white hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.15)]"
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
                  : "text-[#64748B] dark:text-white hover:text-[#0A7AFF] dark:hover:text-white hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.15)]"
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
                  : "text-[#64748B] dark:text-white hover:text-[#0A7AFF] dark:hover:text-white hover:bg-[rgba(10,122,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.15)]"
              }`}
              style={filterStatus === "resolved" ? { background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` } : {}}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Inquiry List */}
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => (
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
                    <div className="flex items-center gap-2 mb-1">
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
                    <div className="flex items-center gap-4 text-sm text-[#64748B] dark:text-[#94A3B8]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{inquiry.clientName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
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

          {filteredInquiries.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(10,122,255,0.1)] to-[rgba(20,184,166,0.1)] dark:from-[rgba(10,122,255,0.2)] dark:to-[rgba(20,184,166,0.2)] flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-[#0A7AFF] dark:text-[#3B9EFF]" />
              </div>
              <h3 className="font-semibold text-[#1A2B4F] dark:text-[#E5E7EB] mb-2">No inquiries found</h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                {searchQuery 
                  ? "Try adjusting your search criteria" 
                  : "New inquiries will appear here"}
              </p>
            </div>
          )}
        </div>
      </ContentCard>

      {/* New Inquiry Modal */}
      <ConfirmationModal
        open={newInquiryModalOpen}
        onOpenChange={setNewInquiryModalOpen}
        title="Create New Inquiry"
        description="Add a new client inquiry to the system."
        icon={<Plus className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(10,122,255,0.1)]"
        content={
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-[#1A2B4F] mb-2 block">
                Subject <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="subject"
                value={newInquiryForm.subject}
                onChange={(e) => setNewInquiryForm({ ...newInquiryForm, subject: e.target.value })}
                placeholder="Enter inquiry subject"
                className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName" className="text-[#1A2B4F] mb-2 block">
                  Client Name <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={newInquiryForm.clientName}
                  onChange={(e) => setNewInquiryForm({ ...newInquiryForm, clientName: e.target.value })}
                  placeholder="Enter client name"
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail" className="text-[#1A2B4F] mb-2 block">
                  Email <span className="text-[#FF6B6B]">*</span>
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newInquiryForm.clientEmail}
                  onChange={(e) => setNewInquiryForm({ ...newInquiryForm, clientEmail: e.target.value })}
                  placeholder="client@email.com"
                  className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clientMobile" className="text-[#1A2B4F] mb-2 block">
                Mobile Number
              </Label>
              <Input
                id="clientMobile"
                type="tel"
                value={newInquiryForm.clientMobile}
                onChange={(e) => setNewInquiryForm({ ...newInquiryForm, clientMobile: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
                className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10"
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-[#1A2B4F] mb-2 block">
                Initial Message <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Textarea
                id="message"
                value={newInquiryForm.message}
                onChange={(e) => setNewInquiryForm({ ...newInquiryForm, message: e.target.value })}
                placeholder="Enter the client's inquiry message..."
                className="min-h-[120px] border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-[#14B8A6]/10 resize-none"
              />
            </div>
          </div>
        }
        onConfirm={handleCreateInquiry}
        onCancel={() => {
          setNewInquiryModalOpen(false);
          setNewInquiryForm({
            subject: "",
            clientName: "",
            clientEmail: "",
            clientMobile: "",
            message: "",
          });
        }}
        confirmText="Create Inquiry"
        cancelText="Cancel"
        confirmVariant="default"
      />
    </div>
  );
}
