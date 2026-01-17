import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination component for User Management
 */
const UserPagination = ({
  isDarkMode,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex-none px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
          currentPage === 1
            ? isDarkMode
              ? "text-slate-500 cursor-not-allowed"
              : "text-gray-400 cursor-not-allowed"
            : isDarkMode
            ? "hover:bg-slate-700 text-slate-300"
            : "hover:bg-gray-200 text-gray-700"
        }`}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-2 sm:px-3 py-1 rounded-lg transition-all text-xs sm:text-sm cursor-pointer ${
            currentPage === page
              ? isDarkMode
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
              : isDarkMode
              ? "hover:bg-slate-700 text-slate-300"
              : "hover:bg-gray-200 text-gray-700"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
          currentPage === totalPages
            ? isDarkMode
              ? "text-slate-500 cursor-not-allowed"
              : "text-gray-400 cursor-not-allowed"
            : isDarkMode
            ? "hover:bg-slate-700 text-slate-300"
            : "hover:bg-gray-200 text-gray-700"
        }`}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default UserPagination;
