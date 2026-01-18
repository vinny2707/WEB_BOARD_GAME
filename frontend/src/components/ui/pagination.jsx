import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Reusable Pagination Component (New)
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
  children,
  ...props
}) {
  // If children are provided, render as wrapper (backward compatible)
  if (children) {
    return (
      <nav
        role="navigation"
        aria-label="pagination"
        data-slot="pagination"
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
      >
        {children}
      </nav>
    )
  }

  // Calculate showing range
  const startItem = Math.min((currentPage - 1) * limit + 1, totalItems)
  const endItem = Math.min(currentPage * limit, totalItems)

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = []
    const siblingCount = 1 // Number of pages valid left/right of current page

    // Case 1: Total pages less than limit -> show all
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1

    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Case 2: Only right dots visible (e.g. 1 2 3 4 5 ... 10)
      let leftItemCount = 3 + 2 * siblingCount
      let leftRange = []
      for (let i = 1; i <= leftItemCount; i++) leftRange.push(i)

      return [...leftRange, "...", totalPages]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      // Case 3: Only left dots visible (e.g. 1 ... 6 7 8 9 10)
      let rightItemCount = 3 + 2 * siblingCount
      let rightRange = []
      for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) rightRange.push(i)

      return [1, "...", ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      // Case 4: Both dots visible (e.g. 1 ... 4 5 6 ... 10)
      let middleRange = []
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) middleRange.push(i)

      return [1, "...", ...middleRange, "...", totalPages]
    }

    return pages
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Left side: Limit selector and showing info */}
      <div className="flex items-center gap-4">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Show</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border text-sm cursor-pointer bg-gray-100 border-gray-300 text-gray-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
        <span className="text-sm text-slate-500 dark:text-slate-400">
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
                ? "text-gray-400 dark:text-slate-600 cursor-not-allowed"
                : "hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 dark:text-slate-500">
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
                    : "hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
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
                ? "text-gray-400 dark:text-slate-600 cursor-not-allowed"
                : "hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Legacy Pagination Primitives (for backward compatibility)
// ============================================

function PaginationContent({ className, ...props }) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }) {
  return <li data-slot="pagination-item" {...props} />
}

function PaginationLink({ className, isActive, size = "icon", ...props }) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeft />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRight />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
