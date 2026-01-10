import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeProvider";
import { Edit2, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../api/axios";

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
  const [editingUser, setEditingUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", dob: "" });
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

      const response = await api.get(`/api/users?${params}`);
      const data = response.data?.data;

      setUsers(data.users || []);
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
  }, []);

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

  // Handle edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      dob: user.dob || "",
    });
    setShowEditDialog(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    try {
      await api.put(`/api/users/${editingUser.id}`, formData);
      setShowEditDialog(false);
      fetchUsers(currentPage, searchTerm, statusFilter);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user");
    }
  };

  // Handle delete
  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/api/users/${userId}`);
      fetchUsers(currentPage, searchTerm, statusFilter);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  // Handle status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/api/users/${userId}/status`, { status: newStatus });
      fetchUsers(currentPage, searchTerm, statusFilter);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
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

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex-none px-8 py-6 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          User Management
        </h1>

        {/* Search and Filters */}
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={handleSearch}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {["", "active", "inactive", "banned"].map((status) => (
              <button
                key={status || "all"}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-all ${
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
      <div className="flex-1 overflow-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-zinc-400">
              Loading users...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <div
            className={`rounded-xl border overflow-hidden ${
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
                    User ID
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
                      colSpan="5"
                      className={`px-6 py-8 text-center ${
                        isDarkMode ? "text-zinc-400" : "text-gray-500"
                      }`}
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
                        #{user.id}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user.username}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDarkMode ? "text-zinc-300" : "text-gray-700"
                        }`}
                      >
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className={`p-2 rounded-lg transition-all ${
                              isDarkMode
                                ? "hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300"
                                : "hover:bg-gray-200 text-blue-600 hover:text-blue-500"
                            }`}
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className={`p-2 rounded-lg transition-all ${
                              isDarkMode
                                ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                : "hover:bg-red-100 text-red-600 hover:text-red-500"
                            }`}
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-none px-8 py-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-center gap-2">
          <button
            onClick={() =>
              fetchUsers(currentPage - 1, searchTerm, statusFilter)
            }
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-all ${
              currentPage === 1
                ? isDarkMode
                  ? "text-zinc-600 cursor-not-allowed"
                  : "text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "hover:bg-zinc-800 text-zinc-300"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchUsers(page, searchTerm, statusFilter)}
              className={`px-3 py-1 rounded-lg transition-all text-sm ${
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
            className={`p-2 rounded-lg transition-all ${
              currentPage === totalPages
                ? isDarkMode
                  ? "text-zinc-600 cursor-not-allowed"
                  : "text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "hover:bg-zinc-800 text-zinc-300"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`rounded-xl p-6 max-w-md w-full mx-4 ${
              isDarkMode
                ? "bg-zinc-900 border border-zinc-800"
                : "bg-white border border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Edit User: {editingUser.username}
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-zinc-300" : "text-gray-700"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-zinc-800 border-zinc-700 text-white focus:border-emerald-500"
                      : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-zinc-300" : "text-gray-700"
                  }`}
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-zinc-800 border-zinc-700 text-white focus:border-emerald-500"
                      : "bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditDialog(false)}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className={`flex-1 px-4 py-2 rounded-lg transition-all text-white ${
                  isDarkMode
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
