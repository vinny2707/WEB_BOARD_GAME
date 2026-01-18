import { useState, useEffect } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import api from "../../../api/axios";
import { toast } from "sonner";

/**
 * Custom hook for User Management state and API logic
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [limit, setLimit] = useState(10);

  // Status change confirmation
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  // Role change confirmation
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  // Fetch users
  const fetchUsers = async (page = 1, search = "", status = "", role = "", currentLimit = limit) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: currentLimit,
        ...(search && { search }),
        ...(status && { status }),
        ...(role && { role }),
      });

      const response = await api.get(`/api/users/admin?${params}`);
      const data = response.data?.data;

      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.total || 0);
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
    fetchUsers(1, debouncedSearchTerm, statusFilter, roleFilter);
  }, [debouncedSearchTerm, statusFilter, roleFilter]);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, status, roleFilter);
  };

  // Handle role filter
  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, statusFilter, role);
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, statusFilter, roleFilter, newLimit);
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
      fetchUsers(currentPage, searchTerm, statusFilter, roleFilter);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Handle status change - show confirmation dialog
  const handleStatusChange = (userId, newStatus, user) => {
    setPendingStatusChange({ userId, newStatus, user });
    setShowStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    try {
      await api.patch(`/api/users/${pendingStatusChange.userId}/status`, {
        status: pendingStatusChange.newStatus,
      });
      toast.success("User status updated successfully");
      fetchUsers(currentPage, searchTerm, statusFilter, roleFilter);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setShowStatusDialog(false);
      setPendingStatusChange(null);
    }
  };

  // Handle role change - show confirmation dialog
  const handleRoleChange = (userId, newRole, user) => {
    setPendingRoleChange({ userId, newRole, user });
    setShowRoleDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;

    try {
      await api.patch(`/api/users/${pendingRoleChange.userId}/role`, {
        role: pendingRoleChange.newRole,
      });
      toast.success("User role updated successfully");
      fetchUsers(currentPage, searchTerm, statusFilter, roleFilter);
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setShowRoleDialog(false);
      setPendingRoleChange(null);
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

  return {
    // State
    users,
    loading,
    error,
    currentPage,
    totalPages,
    totalUsers,
    searchTerm,
    statusFilter,
    roleFilter,
    showDetailDialog,
    selectedUser,
    showDeleteDialog,
    userToDelete,
    limit,
    // Status change dialog
    showStatusDialog,
    pendingStatusChange,
    setShowStatusDialog,
    // Role change dialog
    showRoleDialog,
    pendingRoleChange,
    setShowRoleDialog,
    // Setters
    setShowDetailDialog,
    setShowDeleteDialog,
    // Handlers
    fetchUsers,
    handleSearch,
    handleStatusFilter,
    handleRoleFilter,
    handleLimitChange,
    handleDelete,
    confirmDelete,
    handleStatusChange,
    confirmStatusChange,
    handleRoleChange,
    confirmRoleChange,
    handleViewDetails,
  };
};
