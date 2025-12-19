import { Search, Filter, Download, FileText, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export type SortOrder = "none" | "newest" | "oldest";

interface SearchFilterToolbarProps {
  // Search
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Sort
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  showSort?: boolean;

  // Filter
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  filterContent: ReactNode;
  activeFiltersCount?: number;
  showFilter?: boolean;

  // Export
  onExportPDF: () => void;
  onExportExcel: () => void;
  showExport?: boolean;
}

export function SearchFilterToolbar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  sortOrder,
  onSortChange,
  showSort = true,
  filterOpen,
  onFilterOpenChange,
  filterContent,
  activeFiltersCount = 0,
  showFilter = true,
  onExportPDF,
  onExportExcel,
  showExport = true,
}: SearchFilterToolbarProps) {
  const getSortIcon = () => {
    if (sortOrder === "newest") return <ArrowDown className="w-4 h-4" />;
    if (sortOrder === "oldest") return <ArrowUp className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const getSortLabel = () => {
    if (sortOrder === "newest") return "Newest First";
    if (sortOrder === "oldest") return "Oldest First";
    return "Sort";
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:w-auto">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-11 px-4 pl-10 rounded-xl border border-[#E5E7EB] dark:border-[#2A3441] bg-[#F8FAFB] dark:bg-[#1A1F2E] text-sm text-[#334155] dark:text-[#E5E7EB] placeholder:text-[#64748B] dark:placeholder:text-[#64748B] focus:border-[#0A7AFF] focus:bg-white dark:focus:bg-[#1A1F2E] focus:outline-none focus:ring-4 focus:ring-[rgba(10,122,255,0.08)] dark:focus:ring-[rgba(37,150,190,0.15)] shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(37,150,190,0.4)] transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
      </div>

      {/* Action Buttons Group */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {/* Sort Dropdown */}
        {showSort && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`h-11 px-3 sm:px-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A3441] bg-white dark:bg-[#2596be] hover:bg-[#F8FAFB] dark:hover:bg-[#1f7a9e] flex items-center gap-2 text-sm text-[#334155] dark:text-white transition-colors flex-1 sm:flex-initial ${
                  sortOrder !== "none" ? "border-[#0A7AFF] bg-[rgba(10,122,255,0.05)] dark:bg-[#1f7a9e]" : ""
                }`}
              >
                {getSortIcon()}
                <span className="hidden sm:inline">{getSortLabel()}</span>
                <span className="sm:hidden">Sort</span>
              </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onSortChange("none")} className="cursor-pointer">
              <ArrowUpDown className="w-4 h-4 mr-2 text-[#64748B]" />
              Default Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("newest")} className="cursor-pointer">
              <ArrowDown className="w-4 h-4 mr-2 text-[#0A7AFF]" />
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("oldest")} className="cursor-pointer">
              <ArrowUp className="w-4 h-4 mr-2 text-[#10B981]" />
              Oldest First
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Filter Popover */}
        {showFilter && (
          <Popover open={filterOpen} onOpenChange={onFilterOpenChange}>
            <PopoverTrigger asChild>
              <button className="h-11 px-3 sm:px-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A3441] bg-white dark:bg-[#2596be] hover:bg-[#F8FAFB] dark:hover:bg-[#1f7a9e] flex items-center gap-2 text-sm text-[#334155] dark:text-white transition-colors relative flex-1 sm:flex-initial">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0A7AFF] text-white text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            {filterContent}
            </PopoverContent>
          </Popover>
        )}

        {/* Export Dropdown */}
        {showExport && (
          <DropdownMenu>
            {!location.pathname.includes('itinerary') && <DropdownMenuTrigger asChild>
              <button className="h-11 px-3 sm:px-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A3441] bg-white dark:bg-[#2596be] hover:bg-[#F8FAFB] dark:hover:bg-[#1f7a9e] flex items-center gap-2 text-sm text-[#334155] dark:text-white transition-colors flex-1 sm:flex-initial">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </DropdownMenuTrigger>}
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-[#FF6B6B]" />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportExcel} className="cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-[#10B981]" />
                Export to Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        
      </div>
    </div>
  );
}