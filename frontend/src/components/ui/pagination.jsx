import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../contexts/ThemeProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

/**
 * Enhanced Pagination Component
 * Layout: [Limit + Showing] ................ [Pagination Buttons]
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [6, 9, 12, 18, 24],
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Smart page numbers with ellipsis
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      // Show all if 7 or fewer pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    
    // Always show first 3
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    }
    // Always show last 3
    else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    }
    // Show current with context
    else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: Limit selector + Showing info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm whitespace-nowrap ${
              isDarkMode ? "text-zinc-400" : "text-gray-600"
            }`}
          >
            Show
          </span>
          <Select
            value={limit.toString()}
            onValueChange={(val) => onLimitChange(parseInt(val))}
          >
            <SelectTrigger
              className={`w-16 h-9 ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span
          className={`text-sm ${
            isDarkMode ? "text-zinc-400" : "text-gray-600"
          }`}
        >
          Showing <span className="font-medium">{startItem}-{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span>
        </span>
      </div>

      {/* Right: Pagination buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all ${
            currentPage === 1
              ? isDarkMode
                ? "text-zinc-600 cursor-not-allowed"
                : "text-gray-400 cursor-not-allowed"
              : isDarkMode
              ? "hover:bg-zinc-800 text-zinc-300 cursor-pointer"
              : "hover:bg-gray-200 text-gray-700 cursor-pointer"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className={`px-2 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={totalPages === 1}
              className={`min-w-[36px] px-3 py-1.5 rounded-lg transition-all text-sm ${
                currentPage === page
                  ? isDarkMode
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                  : totalPages === 1
                  ? isDarkMode
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-gray-400 cursor-not-allowed"
                  : isDarkMode
                  ? "hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                  : "hover:bg-gray-200 text-gray-700 cursor-pointer"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all ${
            currentPage === totalPages
              ? isDarkMode
                ? "text-zinc-600 cursor-not-allowed"
                : "text-gray-400 cursor-not-allowed"
              : isDarkMode
              ? "hover:bg-zinc-800 text-zinc-300 cursor-pointer"
              : "hover:bg-gray-200 text-gray-700 cursor-pointer"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export { Pagination };
