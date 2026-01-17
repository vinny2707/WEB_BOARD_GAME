import React from "react";
import { Search } from "lucide-react";

/**
 * User Search Header with search input and status filter buttons
 */
const UserSearchHeader = ({
  isDarkMode,
  searchTerm,
  statusFilter,
  onSearch,
  onStatusFilter,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
      {/* Search Input */}
      <div className="flex-1 min-w-full sm:min-w-64 relative">
        <Search className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={onSearch}
          className={`w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base rounded-lg border transition-colors ${
            isDarkMode
              ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
              : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
          } focus:outline-none`}
        />
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {["", "active", "inactive", "banned"].map((status) => (
          <button
            key={status || "all"}
            onClick={() => onStatusFilter(status)}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer text-sm whitespace-nowrap ${
              statusFilter === status
                ? isDarkMode
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                : isDarkMode
                ? "bg-slate-700 text-slate-400 hover:bg-slate-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSearchHeader;
