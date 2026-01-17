import React from "react";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/utils/Username";
import { getStatusColor, getRoleColor } from "../utils/colorUtils";

/**
 * Desktop Table View for User Management
 */
const UserTable = ({
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
        className={`hidden md:block rounded-xl border overflow-hidden ${
          isDarkMode
            ? "border-slate-700 bg-slate-800/50"
            : "border-gray-200 bg-gray-50/50"
        }`}
      >
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${
                isDarkMode
                  ? "border-slate-700 bg-slate-800/80"
                  : "border-gray-200 bg-gray-100/80"
              }`}
            >
              {["No.", "Name", "Email", "Role", "Status", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan="6"
                className={`px-6 py-8 text-center ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                No users found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      className={`hidden md:block rounded-xl border overflow-hidden ${
        isDarkMode
          ? "border-slate-700 bg-slate-800/50"
          : "border-gray-200 bg-gray-50/50"
      }`}
    >
      <table className="w-full">
        <thead>
          <tr
            className={`border-b ${
              isDarkMode
                ? "border-slate-700 bg-slate-800/80"
                : "border-gray-200 bg-gray-100/80"
            }`}
          >
            {["No.", "Name", "Email", "Role", "Status", "Actions"].map(
              (header) => (
                <th
                  key={header}
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              className={`border-b transition-colors ${
                isDarkMode
                  ? "border-slate-700 hover:bg-slate-700/50"
                  : "border-gray-200 hover:bg-gray-100/50"
              }`}
            >
              <td
                className={`px-6 py-4 text-sm ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                {(currentPage - 1) * limit + index + 1}
              </td>
              <td
                className="px-6 py-4 cursor-pointer hover:underline"
                onClick={() => onViewDetails(user)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shrink-0 group">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
                      />
                    ) : (
                      getInitials(user.username)
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.username}
                  </span>
                </div>
              </td>
              <td
                className={`px-6 py-4 text-sm ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                {user.email}
              </td>
              <td className="px-6 py-4">
                <Select
                  value={user.role}
                  onValueChange={(value) => onRoleChange(user.id, value, user)}
                >
                  <SelectTrigger
                    className={`w-fit border-0 cursor-pointer ${getRoleColor(
                      user.role
                    )}`}
                  >
                    <SelectValue>
                      <span className="font-semibold text-xs">
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-6 py-4">
                <Select
                  value={user.status}
                  onValueChange={(value) => onStatusChange(user.id, value, user)}
                >
                  <SelectTrigger
                    className={`w-fit border-0 cursor-pointer ${getStatusColor(
                      user.status
                    )}`}
                  >
                    <SelectValue>
                      <span className="font-semibold text-xs">
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
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onDelete(user)}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isDarkMode
                      ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                      : "hover:bg-red-100 text-red-600 hover:text-red-500"
                  }`}
                  title="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
