import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, FileText, CheckCircle, XCircle, Edit, Trash2, Plus, Send, Eye, Download, Filter, RotateCcw, Clock, MapPin, Users, Package, BookOpen, AlertCircle, ChevronLeft } from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { SearchFilterToolbar, SortOrder } from "../components/SearchFilterToolbar";
import { Pagination } from "../components/Pagination";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner@2.0.3";

interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  category: "Booking" | "Itinerary" | "User" | "Approval" | "System" | "Profile";
  details: string;
  ipAddress?: string;
  status?: "success" | "error" | "warning";
}

export function ActivityLog() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([
    {
      id: "ACT-001",
      timestamp: new Date("2024-11-08T10:30:00"),
      user: "Admin",
      action: "Created Booking",
      category: "Booking",
      details: "Created booking BK-2026-009 for Juan Dela Cruz to Boracay, Aklan",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-002",
      timestamp: new Date("2024-11-08T10:15:00"),
      user: "Admin",
      action: "Approved Booking",
      category: "Approval",
      details: "Approved booking request BV-2024-091 for Maria Santos",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-003",
      timestamp: new Date("2024-11-08T09:45:00"),
      user: "Admin",
      action: "Created Standard Itinerary",
      category: "Itinerary",
      details: "Created new standard itinerary 'Bohol 6-Day Adventure' for destination Bohol, Visayas",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-004",
      timestamp: new Date("2024-11-08T09:20:00"),
      user: "Admin",
      action: "Updated Profile",
      category: "Profile",
      details: "Updated company profile information including contact details and business hours",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-005",
      timestamp: new Date("2024-11-08T08:55:00"),
      user: "Admin",
      action: "Cancelled Booking",
      category: "Booking",
      details: "Cancelled booking BK-2026-007 for Jessica Ramos due to customer request",
      ipAddress: "192.168.1.1",
      status: "warning"
    },
    {
      id: "ACT-006",
      timestamp: new Date("2024-11-08T08:30:00"),
      user: "Admin",
      action: "Edited Itinerary",
      category: "Itinerary",
      details: "Updated requested itinerary BV-2024-REQ-001 for Sofia Martinez",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-007",
      timestamp: new Date("2024-11-08T08:10:00"),
      user: "Admin",
      action: "Deleted User",
      category: "User",
      details: "Deleted user account for inactive user test@email.com",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-008",
      timestamp: new Date("2024-11-07T16:45:00"),
      user: "Admin",
      action: "Sent Itinerary",
      category: "Itinerary",
      details: "Sent requested itinerary BV-2024-REQ-002 to client Miguel Santos",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-009",
      timestamp: new Date("2024-11-07T15:20:00"),
      user: "Admin",
      action: "Rejected Booking",
      category: "Approval",
      details: "Rejected booking request BV-2024-092 due to unavailability",
      ipAddress: "192.168.1.1",
      status: "error"
    },
    {
      id: "ACT-010",
      timestamp: new Date("2024-11-07T14:00:00"),
      user: "Admin",
      action: "Viewed Booking Details",
      category: "Booking",
      details: "Viewed detailed information for booking BK-2026-005",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-011",
      timestamp: new Date("2024-11-07T13:30:00"),
      user: "Admin",
      action: "Exported Report",
      category: "System",
      details: "Exported booking history report as PDF for October 2024",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-012",
      timestamp: new Date("2024-11-07T12:15:00"),
      user: "Admin",
      action: "Updated User Permissions",
      category: "User",
      details: "Modified permissions for user maria.santos@email.com",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-013",
      timestamp: new Date("2024-11-07T11:00:00"),
      user: "Admin",
      action: "Saved Draft",
      category: "Itinerary",
      details: "Saved standard itinerary draft 'Cebu 7-Day Heritage Tour'",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-014",
      timestamp: new Date("2024-11-07T10:30:00"),
      user: "Admin",
      action: "Completed Booking",
      category: "Booking",
      details: "Marked booking BK-2026-002 as completed for Miguel Santos",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-015",
      timestamp: new Date("2024-11-07T09:45:00"),
      user: "Admin",
      action: "Created User",
      category: "User",
      details: "Created new user account for katrina.reyes@email.com",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-016",
      timestamp: new Date("2024-11-06T16:20:00"),
      user: "Admin",
      action: "Deleted Draft",
      category: "Itinerary",
      details: "Deleted requested itinerary draft for abandoned booking",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-017",
      timestamp: new Date("2024-11-06T15:00:00"),
      user: "Admin",
      action: "Updated Booking",
      category: "Booking",
      details: "Modified booking details for BK-2026-003 - changed travel dates",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-018",
      timestamp: new Date("2024-11-06T14:30:00"),
      user: "Admin",
      action: "Viewed Report",
      category: "System",
      details: "Accessed dashboard analytics and booking statistics",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-019",
      timestamp: new Date("2024-11-06T13:15:00"),
      user: "Admin",
      action: "Sent Notification",
      category: "System",
      details: "Sent payment reminder notification to 3 customers",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "ACT-020",
      timestamp: new Date("2024-11-06T12:00:00"),
      user: "Admin",
      action: "Login",
      category: "System",
      details: "Admin logged into the system",
      ipAddress: "192.168.1.1",
      status: "success"
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Get action icon
  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("create")) return Plus;
    if (actionLower.includes("edit") || actionLower.includes("update")) return Edit;
    if (actionLower.includes("delete")) return Trash2;
    if (actionLower.includes("approve")) return CheckCircle;
    if (actionLower.includes("reject") || actionLower.includes("cancel")) return XCircle;
    if (actionLower.includes("sent") || actionLower.includes("send")) return Send;
    if (actionLower.includes("view")) return Eye;
    if (actionLower.includes("export") || actionLower.includes("download")) return Download;
    if (actionLower.includes("login")) return User;
    return FileText;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Booking": return Calendar;
      case "Itinerary": return MapPin;
      case "User": return Users;
      case "Approval": return CheckCircle;
      case "Profile": return User;
      default: return FileText;
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[#10B981]/20";
      case "error":
        return "bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[#EF4444]/20";
      case "warning":
        return "bg-[rgba(255,184,77,0.1)] text-[#FFB84D] border-[#FFB84D]/20";
      default:
        return "bg-[#F8FAFB] text-[#64748B] border-[#E5E7EB]";
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Booking": return "bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border-[#0A7AFF]/20";
      case "Itinerary": return "bg-[rgba(20,184,166,0.1)] text-[#14B8A6] border-[#14B8A6]/20";
      case "User": return "bg-[rgba(168,85,247,0.1)] text-[#A855F7] border-[#A855F7]/20";
      case "Approval": return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[#10B981]/20";
      case "Profile": return "bg-[rgba(244,114,182,0.1)] text-[#F472B6] border-[#F472B6]/20";
      default: return "bg-[#F8FAFB] text-[#64748B] border-[#E5E7EB]";
    }
  };

  // Active filters count
  const activeFiltersCount = 
    (selectedCategory !== "all" ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0);

  // Filter activities
  const getFilteredActivities = () => {
    let filtered = [...activities];

    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(activity => activity.timestamp >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(activity => activity.timestamp <= toDate);
    }

    // Sort
    if (sortOrder === "newest") {
      filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    return filtered;
  };

  const filteredActivities = getFilteredActivities();

  // Pagination
  const indexOfLastActivity = currentPage * itemsPerPage;
  const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstActivity, indexOfLastActivity);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setFilterOpen(false);
    handleFilterChange();
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setDateFrom("");
    setDateTo("");
    handleFilterChange();
  };

  const handleExportPDF = () => {
    toast.success("Exporting Activity Log as PDF...");
  };

  const handleExportExcel = () => {
    toast.success("Exporting Activity Log as Excel...");
  };

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    handleFilterChange();
  };

  // Filter content
  const filterContent = (
    <div className="space-y-4 p-4">
      <div>
        <Label htmlFor="category" className="text-sm font-medium mb-2 block">Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Booking">Booking</SelectItem>
            <SelectItem value="Itinerary">Itinerary</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Approval">Approval</SelectItem>
            <SelectItem value="Profile">Profile</SelectItem>
            <SelectItem value="System">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="dateFrom" className="text-xs text-muted-foreground mb-1 block">From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dateTo" className="text-xs text-muted-foreground mb-1 block">To</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleApplyFilters} className="flex-1">
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
        <Button onClick={handleResetFilters} variant="outline" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header with back button */}
<div className="flex items-center gap-4 mb-6">
  <button
    onClick={() => navigate(-1)}
    className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] dark:bg-gray-800 dark:border-gray-700 dark:hover:border-[#0A7AFF] dark:hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
  >
    <ChevronLeft className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
  </button>
  <div>
    <h2 className="text-[#1A2B4F] dark:text-white font-semibold">Back to Dashboard</h2>
  </div>
</div>

      <ContentCard
        title={`Activity Log (${filteredActivities.length})`}
      >
        <SearchFilterToolbar
          searchPlaceholder="Search activities..."
          searchValue={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            handleFilterChange();
          }}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          showFilter={true}
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          filterContent={filterContent}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Activities List */}
        <div className="space-y-3 mt-6">
          {currentActivities.length > 0 ? (
            currentActivities.map((activity) => {
              const ActionIcon = getActionIcon(activity.action);
              const CategoryIcon = getCategoryIcon(activity.category);
              
              return (
                <div
                  key={activity.id}
                  className="p-5 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-lg hover:shadow-[rgba(10,122,255,0.1)] transition-all duration-300 group bg-gradient-to-br from-white to-[#F8FAFB] dark:from-gray-800 dark:to-gray-900"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon with gradient background */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <ActionIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      {/* Pulse animation on hover */}
                      <div className="absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-[#1A2B4F] dark:text-white group-hover:text-[#0A7AFF] transition-colors">
                            {activity.action}
                          </h4>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(activity.category)} whitespace-nowrap`}>
                          <CategoryIcon className="w-3.5 h-3.5" />
                          <span>{activity.category}</span>
                        </span>
                      </div>
                      
                      <p className="text-sm text-[#64748B] dark:text-gray-400 mb-3 line-clamp-2">{activity.details}</p>
                      
                      <div className="flex items-center gap-4 flex-wrap text-xs text-[#94A3B8] dark:text-gray-500">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(20,184,166,0.05)] dark:bg-gray-800">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {activity.timestamp.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true
                            })}
                          </span>
                        </div>
                        {activity.ipAddress && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(168,85,247,0.05)] dark:bg-gray-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{activity.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0A7AFF]/10 to-[#14B8A6]/10 flex items-center justify-center">
                <FileText className="w-10 h-10 text-[#0A7AFF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A2B4F] dark:text-white mb-2">No Activities Found</h3>
              <p className="text-sm text-[#64748B] dark:text-gray-400">
                {searchQuery || activeFiltersCount > 0
                  ? "Try adjusting your search or filters"
                  : "Activity log is empty"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredActivities.length > itemsPerPage && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredActivities.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </ContentCard>
    </div>
  );
}