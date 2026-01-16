import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Reusable Pagination Component
 * - Left side: Limit selector + "Showing X-Y of Z"
 * - Right side: Page numbers with ellipsis for many pages
 */
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [6, 12, 18, 24],
  className,
}) {
  // Calculate showing range
  const startItem = Math.min((currentPage - 1) * limit + 1, totalItems)
  const endItem = Math.min(currentPage * limit, totalItems)

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      if (!pages.includes(totalPages)) pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Left side: Limit selector and showing info */}
      <div className="flex items-center gap-4">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Show</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border text-sm cursor-pointer bg-gray-100 border-gray-300 text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:outline-none"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing {startItem}-{endItem} of {totalItems}
        </span>
      </div>

      {/* Right side: Page numbers with ellipsis */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "p-2 rounded-lg transition-all cursor-pointer",
              currentPage === 1
                ? "text-gray-400 dark:text-zinc-600 cursor-not-allowed"
                : "hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 dark:text-zinc-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "px-3 py-1 rounded-lg text-sm transition-all cursor-pointer",
                  currentPage === page
                    ? "bg-blue-500/20 text-blue-600 border border-blue-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                    : "hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                )}
              >
                {page}
              </button>
            )
          )}

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "p-2 rounded-lg transition-all cursor-pointer",
              currentPage === totalPages
                ? "text-gray-400 dark:text-zinc-600 cursor-not-allowed"
                : "hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export { Pagination }
