import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeProvider";

/**
 * Pagination Component - Reusable pagination with page numbers
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  if (totalPages <= 1) return null;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current
    const pages = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    // Add first page
    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }

    // Add middle pages
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    // Add last page
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-1.5 sm:p-2 rounded-lg transition-all ${
          currentPage === 1
            ? isDarkMode
              ? "text-zinc-600 cursor-not-allowed"
              : "text-gray-400 cursor-not-allowed"
            : isDarkMode
            ? "hover:bg-zinc-800 text-zinc-300 cursor-pointer"
            : "hover:bg-gray-200 text-gray-700 cursor-pointer"
        }`}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Page Numbers */}
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
            className={`px-2 sm:px-3 py-1 rounded-lg transition-all text-xs sm:text-sm cursor-pointer ${
              currentPage === page
                ? isDarkMode
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                : isDarkMode
                ? "hover:bg-zinc-800 text-zinc-300"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-1.5 sm:p-2 rounded-lg transition-all ${
          currentPage === totalPages
            ? isDarkMode
              ? "text-zinc-600 cursor-not-allowed"
              : "text-gray-400 cursor-not-allowed"
            : isDarkMode
            ? "hover:bg-zinc-800 text-zinc-300 cursor-pointer"
            : "hover:bg-gray-200 text-gray-700 cursor-pointer"
        }`}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Page Info */}
      <span
        className={`ml-2 text-xs sm:text-sm ${
          isDarkMode ? "text-zinc-500" : "text-gray-500"
        }`}
      >
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

export default Pagination;
