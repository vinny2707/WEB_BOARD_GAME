import React from "react";
import { Trash2, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusColor, getRoleColor } from "../utils/colorUtils";

/**
 * Mobile Card View for User Management
 */
const UserMobileCard = ({
  isDarkMode,
  users,
  currentPage,
  limit,
  onViewDetails,
  onRoleChange,
  onStatusChange,
  onDelete,
}) => {
  if (users.length === 0) {
    return (
      <div
        className={`md:hidden text-center py-8 ${
          isDarkMode ? "text-slate-400" : "text-gray-500"
        }`}
      >
        No users found
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {users.map((user, index) => (
        <div
          key={user.id}
          className={`rounded-xl border p-4 ${
            isDarkMode
              ? "border-slate-700 bg-slate-800/50"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                  isDarkMode
                    ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                    : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                }`}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold text-base cursor-pointer hover:underline truncate ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                  onClick={() => onViewDetails(user)}
                >
                  {user.username}
                </div>
                <div
                  className={`text-xs truncate ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  #{(currentPage - 1) * limit + index + 1}
                </div>
              </div>
            </div>
            <button
              onClick={() => onDelete(user)}
              className={`p-2 rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                isDarkMode
                  ? "hover:bg-red-500/20 text-red-400"
                  : "hover:bg-red-100 text-red-600"
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Card Content */}
          <div className="space-y-2 mb-3">
            <div
              className={`text-sm truncate ${
                isDarkMode ? "text-slate-300" : "text-gray-700"
              }`}
            >
              <Mail className="w-3.5 h-3.5 inline mr-2" />
              {user.email}
            </div>
          </div>

          {/* Card Footer */}
          <div
            className={`flex items-center gap-2 pt-3 border-t ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
            <Select
              value={user.role}
              onValueChange={(value) => onRoleChange(user.id, value)}
            >
              <SelectTrigger
                className={`flex-1 border-0 h-8 text-xs ${getRoleColor(
                  user.role
                )}`}
              >
                <SelectValue>
                  <span className="font-semibold">
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={user.status}
              onValueChange={(value) => onStatusChange(user.id, value)}
            >
              <SelectTrigger
                className={`flex-1 border-0 h-8 text-xs ${getStatusColor(
                  user.status
                )}`}
              >
                <SelectValue>
                  <span className="font-semibold">
                    {user.status?.charAt(0).toUpperCase() +
                      user.status?.slice(1)}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserMobileCard;
