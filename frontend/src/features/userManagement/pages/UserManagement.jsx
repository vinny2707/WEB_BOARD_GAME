import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeProvider";
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Calendar,
  Shield,
  Clock,
  UserCheck,
  Award,
} from "lucide-react";
import api from "../../../api/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getInitials } from "@/utils/Username";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { se } from "date-fns/locale";

const UserManagement = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const limit = 10;

  // Fetch users
  const fetchUsers = async (page = 1, search = "", status = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await api.get(`/api/users/admin?${params}`);
      const data = response.data?.data;

      setUsers(data.users || []);
      console.log('users data:', data.users);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers(1, searchTerm, statusFilter);
  }, [searchTerm, statusFilter]);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchUsers(1, value, statusFilter);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, status);
  };

  // Handle delete
  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/api/users/${userToDelete.id}`);
      setShowDeleteDialog(false);
      setUserToDelete(null);
      toast.success("User deleted successfully");
      fetchUsers(currentPage, searchTerm, statusFilter);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Handle status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/api/users/${userId}/status`, { status: newStatus });
      toast.success("User status updated successfully");
      fetchUsers(currentPage, searchTerm, statusFilter);
    } catch (err) {
      console.error("Error updating status:", err);

      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      toast.success("User role updated successfully");
      fetchUsers(currentPage, searchTerm, statusFilter);
    } catch (err) {
      console.error("Error updating role:", err);

      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  // Handle view user details
  const handleViewDetails = async (user) => {
    try {
      const response = await api.get(`/api/users/${user.id}`);
      setSelectedUser(response.data?.data);
      setShowDetailDialog(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
      toast.error(err.response?.data?.message || "Failed to load user details");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-emerald-400 bg-emerald-500/20 border border-emerald-500/30";
      case "inactive":
        return "text-yellow-400 bg-yellow-500/20 border border-yellow-500/30";
      case "banned":
        return "text-red-400 bg-red-500/20 border border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border border-gray-500/30";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "text-purple-400 bg-purple-500/20 border border-purple-500/30";
      case "user":
        return "text-blue-400 bg-blue-500/20 border border-blue-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border border-gray-500/30";
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          User Management
        </h1>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1 min-w-full sm:min-w-64 relative">
            <Search className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className={`w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base rounded-lg border transition-colors ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {["", "active", "inactive", "banned"].map((status) => (
              <button
                key={status || "all"}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer text-sm whitespace-nowrap ${
                  statusFilter === status
                    ? isDarkMode
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                    : isDarkMode
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {status
                  ? status.charAt(0).toUpperCase() + status.slice(1)
                  : "All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div
              className={`hidden md:block rounded-xl border overflow-hidden ${
                isDarkMode
                  ? "border-zinc-800 bg-zinc-900/50"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode
                      ? "border-zinc-800 bg-zinc-900/80"
                      : "border-gray-200 bg-gray-100/80"
                  }`}
                >
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? "text-zinc-300" : "text-gray-700"
                    }`}
                  >
                    No.
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? "text-zinc-300" : "text-gray-700"
                    }`}
                  >
                    Name
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? "text-zinc-300" : "text-gray-700"
                    }`}
                  >
                    Email
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? "text-zinc-300" : "text-gray-700"
                    }`}
                  >
                    Role
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? "text-zinc-300" : "text-gray-700"
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDarkMode ? "text-zinc-300" : "text-gray-700"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className={`px-6 py-8 text-center ${
                        isDarkMode ? "text-zinc-400" : "text-gray-500"
                      }`}
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b transition-colors ${
                        isDarkMode
                          ? "border-zinc-800 hover:bg-zinc-800/50"
                          : "border-gray-200 hover:bg-gray-100/50"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDarkMode ? "text-zinc-300" : "text-gray-700"
                        }`}
                      >
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td
                        className={`px-6 py-4 cursor-pointer hover:underline`}
                        onClick={() => handleViewDetails(user)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shrink-0 group">
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
                          <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDarkMode ? "text-zinc-300" : "text-gray-700"
                        }`}
                      >
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value)
                          }
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
                          onValueChange={(value) =>
                            handleStatusChange(user.id, value)
                          }
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
                          onClick={() => handleDelete(user)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {users.length === 0 ? (
              <div className={`text-center py-8 ${
                isDarkMode ? "text-zinc-400" : "text-gray-500"
              }`}>
                No users found
              </div>
            ) : (
              users.map((user, index) => (
                <div
                  key={user.id}
                  className={`rounded-xl border p-4 ${
                    isDarkMode
                      ? "border-zinc-800 bg-zinc-900/50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                        isDarkMode
                          ? "bg-gradient-to-br from-emerald-600 to-cyan-600 text-white"
                          : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold text-base cursor-pointer hover:underline truncate ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                          onClick={() => handleViewDetails(user)}
                        >
                          {user.username}
                        </div>
                        <div className={`text-xs truncate ${
                          isDarkMode ? "text-zinc-400" : "text-gray-500"
                        }`}>
                          #{(currentPage - 1) * limit + index + 1}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(user)}
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
                    <div className={`text-sm truncate ${
                      isDarkMode ? "text-zinc-300" : "text-gray-700"
                    }`}>
                      <Mail className="w-3.5 h-3.5 inline mr-2" />
                      {user.email}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={`flex items-center gap-2 pt-3 border-t ${
                    isDarkMode ? "border-zinc-800" : "border-gray-200"
                  }`}>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className={`flex-1 border-0 h-8 text-xs ${
                        getRoleColor(user.role)
                      }`}>
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
                      onValueChange={(value) => handleStatusChange(user.id, value)}
                    >
                      <SelectTrigger className={`flex-1 border-0 h-8 text-xs ${
                        getStatusColor(user.status)
                      }`}>
                        <SelectValue>
                          <span className="font-semibold">
                            {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
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
              ))
            )}
          </div>
        </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-none px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() =>
              fetchUsers(currentPage - 1, searchTerm, statusFilter)
            }
            disabled={currentPage === 1}
            className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
              currentPage === 1
                ? isDarkMode
                  ? "text-zinc-600 cursor-not-allowed"
                  : "text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "hover:bg-zinc-800 text-zinc-300"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchUsers(page, searchTerm, statusFilter)}
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
          ))}

          <button
            onClick={() =>
              fetchUsers(currentPage + 1, searchTerm, statusFilter)
            }
            disabled={currentPage === totalPages}
            className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
              currentPage === totalPages
                ? isDarkMode
                  ? "text-zinc-600 cursor-not-allowed"
                  : "text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "hover:bg-zinc-800 text-zinc-300"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          className={`max-w-md ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : ""
          }`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={`flex items-center gap-3 text-xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-red-500/20 text-red-600 border border-red-500/30"
                }`}
              >
                <Trash2 className="w-5 h-5" />
              </div>
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription
              className={`${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              } mt-4`}
            >
              {userToDelete && (
                <div className="space-y-4">
                  <p className="text-base">
                    Are you sure you want to permanently delete this user
                    account?
                  </p>
                  <div
                    className={`p-4 rounded-lg ${
                      isDarkMode
                        ? "bg-zinc-800/50 border border-zinc-700"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
                          isDarkMode
                            ? "bg-gradient-to-br from-emerald-600 to-cyan-600 text-white"
                            : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                        }`}
                      >
                        {userToDelete.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {userToDelete.username}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-zinc-400" : "text-gray-500"
                          }`}
                        >
                          {userToDelete.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex items-start gap-2 p-3 rounded-lg ${
                      isDarkMode
                        ? "bg-red-500/10 border border-red-500/20"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <Shield
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isDarkMode ? "text-red-400" : "text-red-600"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-red-300" : "text-red-700"
                      }`}
                    >
                      This action cannot be undone. All user data, including
                      game history and achievements, will be permanently
                      removed.
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              className={`${
                isDarkMode
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              }`}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={`${
                isDarkMode
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className={`max-w-3xl ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle
              className={`flex items-center gap-3 text-2xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30"
                    : "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                }`}
              >
                <User className="w-6 h-6" />
              </div>
              Player Profile
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {/* Header Card with Avatar */}
              <div
                className={`relative overflow-hidden rounded-xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
                }`}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
                <div className="relative p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div
                      className={`relative flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold ${
                        isDarkMode
                          ? "bg-gradient-to-br from-emerald-600 to-cyan-600 text-white"
                          : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      } shadow-lg`}
                    >
                      {getInitials(selectedUser.username)}
                      <div className="absolute -bottom-2 -right-2">
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${getRoleColor(
                            selectedUser.role
                          )} shadow-lg`}
                        >
                          {selectedUser.role.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedUser.username}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-zinc-400" : "text-gray-500"
                        } mb-3`}
                      >
                        {selectedUser.full_name || "No full name set"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(
                            selectedUser.status
                          )}`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {selectedUser.status.charAt(0).toUpperCase() +
                            selectedUser.status.slice(1)}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                            isDarkMode
                              ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                              : "bg-white text-gray-700 border border-gray-200"
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          Player ID: #{selectedUser.id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Contact Information */}
                <div
                  className={`p-5 rounded-xl ${
                    isDarkMode
                      ? "bg-zinc-800/50 border border-zinc-700/50"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <h4
                      className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Contact Info
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          isDarkMode ? "text-zinc-500" : "text-gray-500"
                        } uppercase tracking-wider mb-1`}
                      >
                        Email Address
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        } break-all`}
                      >
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          isDarkMode ? "text-zinc-500" : "text-gray-500"
                        } uppercase tracking-wider mb-1`}
                      >
                        Date of Birth
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar
                          className={`w-4 h-4 ${
                            isDarkMode ? "text-zinc-400" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {selectedUser.dob
                            ? new Date(selectedUser.dob).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div
                  className={`p-5 rounded-xl ${
                    isDarkMode
                      ? "bg-zinc-800/50 border border-zinc-700/50"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-purple-500/10 text-purple-600"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4
                      className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Account Activity
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          isDarkMode ? "text-zinc-500" : "text-gray-500"
                        } uppercase tracking-wider mb-1`}
                      >
                        Member Since
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {new Date(selectedUser.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          isDarkMode ? "text-zinc-500" : "text-gray-500"
                        } uppercase tracking-wider mb-1`}
                      >
                        Last Active
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedUser.last_login
                              ? isDarkMode
                                ? "bg-emerald-500"
                                : "bg-green-500"
                              : isDarkMode
                              ? "bg-zinc-600"
                              : "bg-gray-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {selectedUser.last_login
                            ? new Date(selectedUser.last_login).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Never logged in"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Permissions */}
              <div
                className={`p-5 rounded-xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50"
                    : "bg-gradient-to-br from-gray-50 to-white border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      isDarkMode
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "bg-indigo-500/10 text-indigo-600"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </div>
                  <h4
                    className={`font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Security & Permissions
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-lg text-center ${
                      isDarkMode ? "bg-zinc-800/50" : "bg-white"
                    }`}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getRoleColor(
                        selectedUser.role
                      )}`}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-zinc-400" : "text-gray-500"
                      } mb-1`}
                    >
                      Role
                    </p>
                    <p
                      className={`font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedUser.role.charAt(0).toUpperCase() +
                        selectedUser.role.slice(1)}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg text-center ${
                      isDarkMode ? "bg-zinc-800/50" : "bg-white"
                    }`}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(
                        selectedUser.status
                      )}`}
                    >
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-zinc-400" : "text-gray-500"
                      } mb-1`}
                    >
                      Status
                    </p>
                    <p
                      className={`font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedUser.status.charAt(0).toUpperCase() +
                        selectedUser.status.slice(1)}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg text-center ${
                      isDarkMode ? "bg-zinc-800/50" : "bg-white"
                    }`}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                        isDarkMode
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-zinc-400" : "text-gray-500"
                      } mb-1`}
                    >
                      User ID
                    </p>
                    <p
                      className={`font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      #{selectedUser.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
