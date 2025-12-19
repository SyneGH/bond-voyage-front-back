import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems?: number;
  itemsPerPage?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  showingStart?: number;
  showingEnd?: number;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  totalPages: providedTotalPages,
  onPageChange,
  showingStart,
  showingEnd,
}: PaginationProps) {
  const totalPages = providedTotalPages ?? (totalItems && itemsPerPage ? Math.ceil(totalItems / itemsPerPage) : 1);
  
  // Calculate showing range
  const start = showingStart ?? (totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0);
  const end = showingEnd ?? (totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : 0);
  const displayTotal = totalItems ?? 0;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near the beginning
        pages.push(2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") {
      onPageChange(page);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
      <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
        Showing {start}-{end} of {displayTotal}
      </p>
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#E5E7EB] dark:border-[#2A3441] hover:bg-[#F8FAFB] dark:hover:bg-[#1F2937] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#334155] dark:text-[#E5E7EB]" />
        </button>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {pageNumbers.map((page, index) => (
            typeof page === "number" ? (
              <button
                key={index}
                onClick={() => handlePageClick(page)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-medium text-xs sm:text-sm transition-colors ${
                  currentPage === page
                    ? "text-white"
                    : "hover:bg-[#F8FAFB] dark:hover:bg-[#1F2937] text-[#334155] dark:text-[#E5E7EB]"
                }`}
                style={currentPage === page ? { background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` } : {}}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="text-[#64748B] dark:text-[#94A3B8] px-0.5 sm:px-1 text-xs sm:text-sm">
                {page}
              </span>
            )
          ))}
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#E5E7EB] dark:border-[#2A3441] hover:bg-[#F8FAFB] dark:hover:bg-[#1F2937] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#334155] dark:text-[#E5E7EB]" />
        </button>
      </div>
    </div>
  );
}