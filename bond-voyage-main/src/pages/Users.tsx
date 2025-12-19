import { Edit, Trash2, UserX, UserCheck, X } from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { SearchFilterToolbar, SortOrder } from "../components/SearchFilterToolbar";
import { UserFilterContent } from "../components/filters/UserFilterContent";
import { Pagination } from "../components/Pagination";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";

type User = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  userSince: string;
  userSinceDate: Date;
  status: "Active" | "Deactivated";
  avatar: string;
};

export function Users() {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Maria Santos", email: "maria.santos@email.com", mobile: "+63 917 123 4567", userSince: "Jan 15, 2023", userSinceDate: new Date("2023-01-15"), status: "Active", avatar: "MS" },
    { id: 2, name: "Juan dela Cruz", email: "juan.delacruz@email.com", mobile: "+63 927 234 5678", userSince: "Mar 22, 2023", userSinceDate: new Date("2023-03-22"), status: "Deactivated", avatar: "JC" },
    { id: 3, name: "Ana Reyes", email: "ana.reyes@email.com", mobile: "+63 918 345 6789", userSince: "Feb 08, 2023", userSinceDate: new Date("2023-02-08"), status: "Active", avatar: "AR" },
    { id: 4, name: "Carlos Mendoza", email: "carlos.mendoza@email.com", mobile: "+63 928 456 7890", userSince: "Apr 12, 2023", userSinceDate: new Date("2023-04-12"), status: "Active", avatar: "CM" },
    { id: 5, name: "Isabella Garcia", email: "isabella.garcia@email.com", mobile: "+63 919 567 8901", userSince: "May 30, 2023", userSinceDate: new Date("2023-05-30"), status: "Deactivated", avatar: "IG" },
    { id: 6, name: "Gabriel Torres", email: "gabriel.torres@email.com", mobile: "+63 929 678 9012", userSince: "Jun 18, 2023", userSinceDate: new Date("2023-06-18"), status: "Active", avatar: "GT" },
    { id: 7, name: "Sofia Ramos", email: "sofia.ramos@email.com", mobile: "+63 920 789 0123", userSince: "Jul 25, 2023", userSinceDate: new Date("2023-07-25"), status: "Active", avatar: "SR" },
    { id: 8, name: "Miguel Fernandez", email: "miguel.fernandez@email.com", mobile: "+63 921 890 1234", userSince: "Aug 03, 2023", userSinceDate: new Date("2023-08-03"), status: "Active", avatar: "MF" },
  ]);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);

  // Current user being edited/deleted
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "", status: "Active" as "Active" | "Deactivated" });

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Deactivated">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sort state
  const [sortOrder, setSortOrder] = useState<"none" | "newest" | "oldest">("none");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Count active filters
  const activeFiltersCount = 
    (statusFilter !== "all" ? 1 : 0) + 
    (dateFrom || dateTo ? 1 : 0);

  // Filtered and sorted users
  const getFilteredAndSortedUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.mobile.includes(searchQuery);
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      
      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        const userDate = user.userSinceDate;
        if (dateFrom && dateTo) {
          const from = new Date(dateFrom);
          const to = new Date(dateTo);
          matchesDateRange = userDate >= from && userDate <= to;
        } else if (dateFrom) {
          const from = new Date(dateFrom);
          matchesDateRange = userDate >= from;
        } else if (dateTo) {
          const to = new Date(dateTo);
          matchesDateRange = userDate <= to;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });

    // Apply sorting
    if (sortOrder === "newest") {
      filtered.sort((a, b) => b.userSinceDate.getTime() - a.userSinceDate.getTime());
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => a.userSinceDate.getTime() - b.userSinceDate.getTime());
    }

    return filtered;
  };

  const filteredUsers = getFilteredAndSortedUsers();

  // Calculate paginated users
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const toggleUserSelection = (id: number) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers(prev => 
      prev.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[rgba(16,185,129,0.2)]";
      case "Deactivated":
        return "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border-[rgba(255,107,107,0.2)]";
      default:
        return "bg-[rgba(100,116,139,0.1)] text-[#64748B] border-[rgba(100,116,139,0.2)]";
    }
  };

  // Edit user
  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      status: user.status
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (currentUser) {
      setUsers(prev => prev.map(u => 
        u.id === currentUser.id 
          ? { ...u, ...editForm }
          : u
      ));
      setEditModalOpen(false);
      setCurrentUser(null);
      toast.success("User information updated successfully", {
        description: `Changes for ${editForm.name} have been saved.`,
      });
    }
  };

  // Delete user
  const handleDeleteClick = (user: User) => {
    setCurrentUser(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentUser) {
      const userName = currentUser.name;
      setUsers(prev => prev.filter(u => u.id !== currentUser.id));
      setDeleteModalOpen(false);
      setCurrentUser(null);
      toast.success("User deleted successfully", {
        description: `${userName} has been removed from the system.`,
      });
    }
  };

  // Toggle status
  const handleStatusClick = (user: User) => {
    setCurrentUser(user);
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (currentUser) {
      const newStatus = currentUser.status === "Active" ? "Deactivated" : "Active";
      const userName = currentUser.name;
      setUsers(prev => prev.map(u => 
        u.id === currentUser.id 
          ? { ...u, status: newStatus }
          : u
      ));
      setStatusModalOpen(false);
      setCurrentUser(null);
      toast.success(`User ${newStatus.toLowerCase()} successfully`, {
        description: `${userName} has been ${newStatus.toLowerCase()}.`,
      });
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    setBulkDeleteModalOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    const count = selectedUsers.length;
    setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
    setSelectedUsers([]);
    setBulkDeleteModalOpen(false);
    toast.success(`${count} user${count > 1 ? 's' : ''} deleted successfully`, {
      description: `Selected users have been removed from the system.`,
    });
  };

  // Bulk status change
  const handleBulkStatusChange = () => {
    setBulkStatusModalOpen(true);
  };

  const handleConfirmBulkStatusChange = () => {
    const selectedUserObjects = users.filter(u => selectedUsers.includes(u.id));
    const allActive = selectedUserObjects.every(u => u.status === "Active");
    const newStatus = allActive ? "Deactivated" : "Active";
    const count = selectedUsers.length;

    setUsers(prev => prev.map(u => 
      selectedUsers.includes(u.id) 
        ? { ...u, status: newStatus }
        : u
    ));
    setSelectedUsers([]);
    setBulkStatusModalOpen(false);
    toast.success(`${count} user${count > 1 ? 's' : ''} ${newStatus.toLowerCase()} successfully`, {
      description: `Selected users have been ${newStatus.toLowerCase()}.`,
    });
  };

  // Apply filters
  const handleApplyFilters = () => {
    setFilterOpen(false);
    handleFilterChange();
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    handleFilterChange();
  };

  // Sort functions
  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    handleFilterChange();
  };

  const selectedUserObjects = users.filter(u => selectedUsers.includes(u.id));
  const allSelectedActive = selectedUserObjects.every(u => u.status === "Active");
  const allSelectedDeactivated = selectedUserObjects.every(u => u.status === "Deactivated");

  // Export functions
  const handleExportPDF = () => {
    const exportData = filteredUsers.map(user => ({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      usersince: user.userSince,
      status: user.status,
    }));
    exportToPDF(exportData, "Users Report", ["Name", "Email", "Mobile", "User Since", "Status"]);
  };

  const handleExportExcel = () => {
    const exportData = filteredUsers.map(user => ({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      usersince: user.userSince,
      status: user.status,
    }));
    exportToExcel(exportData, "Users Report", ["Name", "Email", "Mobile", "User Since", "Status"]);
  };

  return (
    <div>
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-gradient-to-r from-[#0A7AFF] to-[#3B9EFF] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-base">{selectedUsers.length}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm">Choose an action to apply</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleBulkStatusChange}
                  className="flex-1 sm:flex-initial h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center gap-2 text-white transition-all text-xs sm:text-sm"
                >
                  {allSelectedActive ? <UserX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  <span className="hidden sm:inline">{allSelectedActive ? "Deactivate" : allSelectedDeactivated ? "Activate" : "Toggle Status"}</span>
                  <span className="sm:hidden">{allSelectedActive ? "Deactivate" : "Activate"}</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 sm:flex-initial h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center gap-2 text-white transition-all text-xs sm:text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-all flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContentCard 
        title={`All Users (${filteredUsers.length})`}
        
        footer={
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            showingStart={filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0}
            showingEnd={Math.min(indexOfLastUser, filteredUsers.length)}
          />
        }
      >
        {/* Table Toolbar */}
        <SearchFilterToolbar
          searchPlaceholder="Search users..."
          searchValue={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            handleFilterChange();
          }}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          activeFiltersCount={activeFiltersCount}
          filterContent={
            <UserFilterContent
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          }
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />

        {/* Data Table - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFB] dark:bg-[#1F2937] border-b-2 border-[#E5E7EB] dark:border-[#2A3441]">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-[18px] h-[18px] rounded border-2 border-[#E5E7EB] dark:border-[#2A3441] checked:bg-[#0A7AFF] checked:border-[#0A7AFF] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm text-[#1A2B4F] dark:text-[#E5E7EB] font-semibold uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-sm text-[#1A2B4F] dark:text-[#E5E7EB] font-semibold uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-sm text-[#1A2B4F] dark:text-[#E5E7EB] font-semibold uppercase tracking-wide">Mobile</th>
                <th className="px-4 py-3 text-left text-sm text-[#1A2B4F] dark:text-[#E5E7EB] font-semibold uppercase tracking-wide">User Since</th>
                <th className="px-4 py-3 text-left text-sm text-[#1A2B4F] dark:text-[#E5E7EB] font-semibold uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-sm text-[#1A2B4F] dark:text-[#E5E7EB] font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`
                    border-b border-[#E5E7EB] dark:border-[#2A3441] transition-colors
                    ${selectedUsers.includes(user.id) 
                      ? 'bg-[rgba(10,122,255,0.05)] dark:bg-[rgba(10,122,255,0.15)] border-l-4 border-l-[#0A7AFF]' 
                      : 'hover:bg-[#F8FAFB] dark:hover:bg-[#1F2937]'
                    }
                  `}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-[18px] h-[18px] rounded border-2 border-[#E5E7EB] checked:bg-[#0A7AFF] checked:border-[#0A7AFF] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{user.avatar}</span>
                      </div>
                      <span className="text-sm text-[#334155] dark:text-[#E5E7EB]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#334155] dark:text-[#E5E7EB]">{user.email}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#334155] dark:text-[#E5E7EB]">{user.mobile}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#64748B]">{user.userSince}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="w-8 h-8 rounded-lg hover:bg-[#F8FAFB] flex items-center justify-center transition-colors group"
                      >
                        <Edit className="w-4 h-4 text-[#64748B] group-hover:text-[#0A7AFF]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        className="w-8 h-8 rounded-lg hover:bg-[rgba(255,107,107,0.1)] flex items-center justify-center transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 text-[#64748B] group-hover:text-[#FF6B6B]" />
                      </button>
                      <button 
                        onClick={() => handleStatusClick(user)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors group ${
                          user.status === "Active" 
                            ? "hover:bg-[rgba(255,107,107,0.1)]" 
                            : "hover:bg-[rgba(16,185,129,0.1)]"
                        }`}
                      >
                        {user.status === "Active" ? (
                          <UserX className="w-4 h-4 text-[#64748B] group-hover:text-[#FF6B6B]" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-[#64748B] group-hover:text-[#10B981]" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card View - Mobile */}
        <div className="md:hidden space-y-4">
          {currentUsers.map((user) => (
            <div 
              key={user.id}
              className={`
                rounded-xl border-2 transition-all
                ${selectedUsers.includes(user.id) 
                  ? 'bg-[rgba(10,122,255,0.05)] dark:bg-[rgba(10,122,255,0.15)] border-[#0A7AFF]' 
                  : 'bg-card border-border'
                }
              `}
            >
              <div className="p-4">
                {/* Header with checkbox and avatar */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-[18px] h-[18px] rounded border-2 border-[#E5E7EB] checked:bg-[#0A7AFF] checked:border-[#0A7AFF] cursor-pointer mt-1"
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{user.name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)} mt-1`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground min-w-[70px]">Email:</span>
                    <span className="text-xs text-card-foreground break-all">{user.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground min-w-[70px]">Mobile:</span>
                    <span className="text-xs text-card-foreground">{user.mobile}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground min-w-[70px]">User Since:</span>
                    <span className="text-xs text-card-foreground">{user.userSince}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <button 
                    onClick={() => handleEditClick(user)}
                    className="flex-1 h-9 px-3 rounded-lg bg-[#F8FAFB] dark:bg-[#1F2937] hover:bg-[#E5E7EB] dark:hover:bg-[#2A3441] flex items-center justify-center gap-2 transition-colors group"
                  >
                    <Edit className="w-4 h-4 text-[#64748B] group-hover:text-[#0A7AFF]" />
                    <span className="text-xs font-medium text-[#64748B] group-hover:text-[#0A7AFF]">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(user)}
                    className="flex-1 h-9 px-3 rounded-lg bg-[#F8FAFB] dark:bg-[#1F2937] hover:bg-[rgba(255,107,107,0.1)] dark:hover:bg-[rgba(255,107,107,0.2)] flex items-center justify-center gap-2 transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-[#64748B] group-hover:text-[#FF6B6B]" />
                    <span className="text-xs font-medium text-[#64748B] group-hover:text-[#FF6B6B]">Delete</span>
                  </button>
                  <button 
                    onClick={() => handleStatusClick(user)}
                    className={`flex-1 h-9 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors group ${
                      user.status === "Active" 
                        ? "bg-[#F8FAFB] dark:bg-[#1F2937] hover:bg-[rgba(255,107,107,0.1)] dark:hover:bg-[rgba(255,107,107,0.2)]" 
                        : "bg-[#F8FAFB] dark:bg-[#1F2937] hover:bg-[rgba(16,185,129,0.1)] dark:hover:bg-[rgba(16,185,129,0.2)]"
                    }`}
                  >
                    {user.status === "Active" ? (
                      <>
                        <UserX className="w-4 h-4 text-[#64748B] group-hover:text-[#FF6B6B]" />
                        <span className="text-xs font-medium text-[#64748B] group-hover:text-[#FF6B6B]">Deactivate</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-[#64748B] group-hover:text-[#10B981]" />
                        <span className="text-xs font-medium text-[#64748B] group-hover:text-[#10B981]">Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {currentUsers.length === 0 && (
            <div className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
              No users found
            </div>
          )}
        </div>
      </ContentCard>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[540px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20 flex-shrink-0">
                <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Edit User
            </DialogTitle>
            <DialogDescription className="text-sm">
              Update user information and settings. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-5 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div>
              <Label htmlFor="edit-name" className="text-[#1A2B4F] dark:text-[#E5E7EB] mb-2 block text-sm">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="h-10 sm:h-11 border-[#E5E7EB] dark:border-[#2A3441] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="edit-email" className="text-[#1A2B4F] dark:text-[#E5E7EB] mb-2 block text-sm">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="h-10 sm:h-11 border-[#E5E7EB] dark:border-[#2A3441] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="edit-mobile" className="text-[#1A2B4F] dark:text-[#E5E7EB] mb-2 block text-sm">Mobile Number</Label>
              <Input
                id="edit-mobile"
                value={editForm.mobile}
                onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="+63 XXX XXX XXXX"
                className="h-10 sm:h-11 border-[#E5E7EB] dark:border-[#2A3441] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="edit-status" className="text-[#1A2B4F] dark:text-[#E5E7EB] mb-2 block text-sm">Status</Label>
              <Select value={editForm.status} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger id="edit-status" className="h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 px-4 sm:px-6 lg:px-8">
            <Button 
              variant="outline" 
              onClick={() => setEditModalOpen(false)}
              className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 rounded-xl border-[#E5E7EB] dark:border-[#2A3441] hover:bg-[#F8FAFB] dark:hover:bg-[#2A3441] text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#3B9EFF] hover:from-[#0865CC] hover:to-[#2E8FE8] shadow-lg shadow-[#0A7AFF]/25 text-white text-sm"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8787] flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20 flex-shrink-0">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Delete User
            </DialogTitle>
            <DialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the user account.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(255,107,107,0.12)] border border-[rgba(255,107,107,0.2)] rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#FF6B6B]/10 rounded-full blur-3xl"></div>
              <div className="relative text-sm">
                <p className="text-sm text-[#334155] leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-[#FF6B6B]">{currentUser?.name}</span>?
                </p>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  All associated bookings and data will be permanently removed from the system.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
              className="h-11 px-6 rounded-xl border-[#E5E7EB] hover:bg-[#F8FAFB]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8787] hover:from-[#E85555] hover:to-[#FF7272] shadow-lg shadow-[#FF6B6B]/25 text-white"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                currentUser?.status === "Active"
                  ? "bg-gradient-to-br from-[#FF6B6B] to-[#FF8787] shadow-[#FF6B6B]/20"
                  : "bg-gradient-to-br from-[#10B981] to-[#34D399] shadow-[#10B981]/20"
              }`}>
                {currentUser?.status === "Active" ? (
                  <UserX className="w-5 h-5 text-white" />
                ) : (
                  <UserCheck className="w-5 h-5 text-white" />
                )}
              </div>
              {currentUser?.status === "Active" ? "Deactivate" : "Activate"} User
            </DialogTitle>
            <DialogDescription>
              {currentUser?.status === "Active" 
                ? "The user will no longer be able to access their account."
                : "The user will regain access to their account."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-6">
            <div className={`rounded-2xl p-5 border relative overflow-hidden ${
              currentUser?.status === "Active"
                ? "bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(255,107,107,0.12)] border-[rgba(255,107,107,0.2)]"
                : "bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.2)]"
            }`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
                currentUser?.status === "Active" ? "bg-[#FF6B6B]/10" : "bg-[#10B981]/10"
              }`}></div>
              <div className="relative">
                <p className="text-sm text-[#334155] leading-relaxed">
                  Are you sure you want to {currentUser?.status === "Active" ? "deactivate" : "activate"}{" "}
                  <span className={`font-semibold ${
                    currentUser?.status === "Active" ? "text-[#FF6B6B]" : "text-[#10B981]"
                  }`}>
                    {currentUser?.name}
                  </span>?
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStatusModalOpen(false)}
              className="h-11 px-6 rounded-xl border-[#E5E7EB] hover:bg-[#F8FAFB]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmStatusChange} 
              className={`h-11 px-6 rounded-xl shadow-lg text-white ${
                currentUser?.status === "Active"
                  ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF8787] hover:from-[#E85555] hover:to-[#FF7272] shadow-[#FF6B6B]/25"
                  : "bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#0D9668] hover:to-[#2BC78C] shadow-[#10B981]/25"
              }`}
            >
              {currentUser?.status === "Active" ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={bulkDeleteModalOpen} onOpenChange={setBulkDeleteModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8787] flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              Delete Multiple Users
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete all selected users.
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-6">
            <div className="bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(255,107,107,0.12)] border border-[rgba(255,107,107,0.2)] rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B6B]/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <p className="text-sm text-[#334155] leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-[#FF6B6B]">{selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}</span>?
                </p>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  All associated bookings and data will be permanently removed from the system.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setBulkDeleteModalOpen(false)}
              className="h-11 px-6 rounded-xl border-[#E5E7EB] hover:bg-[#F8FAFB]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBulkDelete} 
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8787] hover:from-[#E85555] hover:to-[#FF7272] shadow-lg shadow-[#FF6B6B]/25 text-white"
            >
              Delete {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Change Confirmation Modal */}
      <Dialog open={bulkStatusModalOpen} onOpenChange={setBulkStatusModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                allSelectedActive
                  ? "bg-gradient-to-br from-[#FF6B6B] to-[#FF8787] shadow-[#FF6B6B]/20"
                  : "bg-gradient-to-br from-[#10B981] to-[#34D399] shadow-[#10B981]/20"
              }`}>
                {allSelectedActive ? (
                  <UserX className="w-5 h-5 text-white" />
                ) : (
                  <UserCheck className="w-5 h-5 text-white" />
                )}
              </div>
              {allSelectedActive ? "Deactivate" : "Change Status for"} Multiple Users
            </DialogTitle>
            <DialogDescription>
              {allSelectedActive 
                ? "The selected users will no longer be able to access their accounts."
                : allSelectedDeactivated
                ? "The selected users will regain access to their accounts."
                : "Toggle the status of the selected users."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-6">
            <div className={`rounded-2xl p-5 border relative overflow-hidden ${
              allSelectedActive
                ? "bg-gradient-to-br from-[rgba(255,107,107,0.08)] to-[rgba(255,107,107,0.12)] border-[rgba(255,107,107,0.2)]"
                : "bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.2)]"
            }`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
                allSelectedActive ? "bg-[#FF6B6B]/10" : "bg-[#10B981]/10"
              }`}></div>
              <div className="relative">
                <p className="text-sm text-[#334155] leading-relaxed">
                  Are you sure you want to {allSelectedActive ? "deactivate" : allSelectedDeactivated ? "activate" : "toggle the status of"}{" "}
                  <span className={`font-semibold ${
                    allSelectedActive ? "text-[#FF6B6B]" : "text-[#10B981]"
                  }`}>
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}
                  </span>?
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setBulkStatusModalOpen(false)}
              className="h-11 px-6 rounded-xl border-[#E5E7EB] hover:bg-[#F8FAFB]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBulkStatusChange} 
              className={`h-11 px-6 rounded-xl shadow-lg text-white ${
                allSelectedActive
                  ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF8787] hover:from-[#E85555] hover:to-[#FF7272] shadow-[#FF6B6B]/25"
                  : "bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#0D9668] hover:to-[#2BC78C] shadow-[#10B981]/25"
              }`}
            >
              {allSelectedActive ? "Deactivate" : allSelectedDeactivated ? "Activate" : "Toggle Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}