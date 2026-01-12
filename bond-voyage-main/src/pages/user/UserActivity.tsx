import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Send,
  Eye,
  Download,
  Filter,
  RotateCcw,
  Clock,
  MapPin,
  Users,
  Package,
  BookOpen,
  AlertCircle,
  Star,
  ChevronLeft,
} from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import {
  SearchFilterToolbar,
  SortOrder,
} from "../../components/SearchFilterToolbar";
import { Pagination } from "../../components/Pagination";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { useProfile } from "../../components/ProfileContext";
import { FAQAssistant } from "../../components/FAQAssistant";
import { useActivityLogs } from "../../hooks/useActivityLogs";

interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  category:
    | "Booking"
    | "Itinerary"
    | "Travel Plan"
    | "Profile"
    | "System"
    | "Inquiry";
  details: string;
  ipAddress?: string;
  status?: "success" | "error" | "warning";
}

// Helper function to determine category from action
const getCategoryFromAction = (
  action: string
): ActivityLogEntry["category"] => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes("booking")) return "Booking";
  if (actionLower.includes("itinerary")) return "Itinerary";
  if (actionLower.includes("travel plan")) return "Travel Plan";
  if (actionLower.includes("profile")) return "Profile";
  if (actionLower.includes("inquiry")) return "Inquiry";
  return "System";
};

// Helper function to determine status from action
const getStatusFromAction = (action: string): ActivityLogEntry["status"] => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes("rejected") || actionLower.includes("deleted"))
    return "error";
  if (actionLower.includes("cancelled")) return "warning";
  return "success";
};

export function UserActivity() {
  const navigate = useNavigate();
  const { userProfileData } = useProfile();
  const { data: activityLogsResponse, isLoading } = useActivityLogs();
  const userName = `${userProfileData.firstName} ${userProfileData.lastName}`;

  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Temporary filter states (for the filter panel)
  const [tempSelectedCategory, setTempSelectedCategory] =
    useState<string>("all");
  const [tempDateFrom, setTempDateFrom] = useState("");
  const [tempDateTo, setTempDateTo] = useState("");

  // Transform API data to component format
  useEffect(() => {
    if (activityLogsResponse?.data) {
      // Filter to only show current user's activities
      const userActivities = activityLogsResponse.data.filter(
        (log) =>
          `${log.user.firstName} ${log.user.lastName}`.toLowerCase() ===
          userName.toLowerCase()
      );

      const transformedActivities: ActivityLogEntry[] = userActivities.map(
        (log) => ({
          id: log.id,
          timestamp: new Date(log.timestamp),
          user: userName,
          action: log.action,
          category: getCategoryFromAction(log.action),
          details: log.details,
          status: getStatusFromAction(log.action),
          // ipAddress is not in the API response, so we omit it
        })
      );
      setActivities(transformedActivities);
    }
  }, [activityLogsResponse, userName]);

  // Get action icon
  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("create")) return Plus;
    if (
      actionLower.includes("edit") ||
      actionLower.includes("update") ||
      actionLower.includes("modif")
    )
      return Edit;
    if (actionLower.includes("delete") || actionLower.includes("cancel"))
      return XCircle;
    if (actionLower.includes("complet")) return CheckCircle;
    if (actionLower.includes("submit")) return Send;
    if (actionLower.includes("view")) return Eye;
    if (actionLower.includes("download")) return Download;
    if (actionLower.includes("login")) return User;
    if (actionLower.includes("book")) return Calendar;
    if (actionLower.includes("review")) return Star;
    if (actionLower.includes("added") || actionLower.includes("add"))
      return Plus;
    if (actionLower.includes("saved") || actionLower.includes("save"))
      return FileText;
    return FileText;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Booking":
        return Calendar;
      case "Itinerary":
        return MapPin;
      case "Travel Plan":
        return BookOpen;
      case "Profile":
        return User;
      case "Inquiry":
        return FileText;
      default:
        return FileText;
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
      case "Booking":
        return "bg-[rgba(10,122,255,0.1)] text-[#0A7AFF] border-[#0A7AFF]/20";
      case "Itinerary":
        return "bg-[rgba(20,184,166,0.1)] text-[#14B8A6] border-[#14B8A6]/20";
      case "Travel Plan":
        return "bg-[rgba(168,85,247,0.1)] text-[#A855F7] border-[#A855F7]/20";
      case "Profile":
        return "bg-[rgba(244,114,182,0.1)] text-[#F472B6] border-[#F472B6]/20";
      case "Inquiry":
        return "bg-[rgba(255,184,77,0.1)] text-[#FFB84D] border-[#FFB84D]/20";
      default:
        return "bg-[#F8FAFB] text-[#64748B] border-[#E5E7EB]";
    }
  };

  // Active filters count
  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) + (dateFrom || dateTo ? 1 : 0);

  // Filter activities
  const getFilteredActivities = () => {
    let filtered = [...activities];

    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (activity) => activity.category === selectedCategory
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((activity) => activity.timestamp >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((activity) => activity.timestamp <= toDate);
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
  const currentActivities = filteredActivities.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    // Apply the temporary filter values to actual filter states
    setSelectedCategory(tempSelectedCategory);
    setDateFrom(tempDateFrom);
    setDateTo(tempDateTo);
    setFilterOpen(false);
    handleFilterChange();
  };

  const handleResetFilters = () => {
    // Reset both temporary and actual filter states
    setTempSelectedCategory("all");
    setTempDateFrom("");
    setTempDateTo("");
    setSelectedCategory("all");
    setDateFrom("");
    setDateTo("");
    handleFilterChange();
  };

  // Sync temporary filters with actual filters when opening the panel
  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      // When opening, sync temp values with current values
      setTempSelectedCategory(selectedCategory);
      setTempDateFrom(dateFrom);
      setTempDateTo(dateTo);
    }
    setFilterOpen(open);
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
        <Label htmlFor="category" className="text-sm font-medium mb-2 block">
          Category
        </Label>
        <Select
          value={tempSelectedCategory}
          onValueChange={setTempSelectedCategory}
        >
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Booking">Booking</SelectItem>
            <SelectItem value="Itinerary">Itinerary</SelectItem>
            <SelectItem value="Travel Plan">Travel Plan</SelectItem>
            <SelectItem value="Profile">Profile</SelectItem>
            <SelectItem value="Inquiry">Inquiry</SelectItem>
            <SelectItem value="System">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label
              htmlFor="dateFrom"
              className="text-xs text-muted-foreground mb-1 block"
            >
              From
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={tempDateFrom}
              onChange={(e) => setTempDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label
              htmlFor="dateTo"
              className="text-xs text-muted-foreground mb-1 block"
            >
              To
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={tempDateTo}
              onChange={(e) => setTempDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleApplyFilters} className="flex-1 cursor-pointer">
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
        <Button
          onClick={handleResetFilters}
          variant="outline"
          className="flex-1 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/user-home")}
            className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] dark:bg-gray-800 dark:border-gray-700 dark:hover:border-[#0A7AFF] dark:hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
          </button>
          <div>
            <h2 className="text-[#1A2B4F] dark:text-white font-semibold">
              Back to Dashboard
            </h2>
          </div>
        </div>
        <ContentCard title="My Activity Log">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0A7AFF]/10 to-[#14B8A6]/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-[#0A7AFF] animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A2B4F] dark:text-white mb-2">
              Loading Activities...
            </h3>
          </div>
        </ContentCard>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/user-home")}
          className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] dark:bg-gray-800 dark:border-gray-700 dark:hover:border-[#0A7AFF] dark:hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
        </button>
        <div>
          <h2 className="text-[#1A2B4F] dark:text-white font-semibold">
            Back to Dashboard
          </h2>
        </div>
      </div>

      <ContentCard title={`My Activity Log (${filteredActivities.length})`}>
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
          onFilterOpenChange={handleFilterOpenChange}
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
                  className="p-5 rounded-2xl border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-lg hover:shadow-[rgba(10,122,255,0.1)] transition-all duration-300 group bg-gradient-to-br from-white to-[#F8FAFB] dark:from-gray-800 dark:to-gray-900 cursor-default"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon with gradient background */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <ActionIcon
                          className="w-6 h-6 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                      {/* Pulse animation on hover */}
                      <div className="absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-[#1A2B4F] dark:text-white group-hover:text-[#0A7AFF] transition-colors">
                          {activity.action}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                            activity.category
                          )} whitespace-nowrap`}
                        >
                          <CategoryIcon className="w-3.5 h-3.5" />
                          <span>{activity.category}</span>
                        </span>
                      </div>

                      <p className="text-sm text-[#64748B] dark:text-gray-400 mb-3 line-clamp-2">
                        {activity.details}
                      </p>

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
                              hour12: true,
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
              <h3 className="text-lg font-semibold text-[#1A2B4F] dark:text-white mb-2">
                No Activities Found
              </h3>
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
      <FAQAssistant />
    </div>
  );
}
