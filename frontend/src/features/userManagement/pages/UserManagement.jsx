import React from "react";
import { useTheme } from "../../../contexts/ThemeProvider";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";

// Custom Hook
import { useUserManagement } from "../hooks/useUserManagement";

// Components
import UserSearchHeader from "../components/UserSearchHeader";
import UserTable from "../components/UserTable";
import UserMobileCard from "../components/UserMobileCard";
import UserDeleteDialog from "../components/UserDeleteDialog";
import UserDetailDialog from "../components/UserDetailDialog";
import UserStatusDialog from "../components/UserStatusDialog";
import UserRoleDialog from "../components/UserRoleDialog";

const UserManagement = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const {
    // State
    users,
    loading,
    error,
    currentPage,
    totalPages,
    totalUsers,
    searchTerm,
    statusFilter,
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
    handleLimitChange,
    handleDelete,
    confirmDelete,
    handleStatusChange,
    confirmStatusChange,
    handleRoleChange,
    confirmRoleChange,
    handleViewDetails,
  } = useUserManagement();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          User Management
        </h1>
        <UserSearchHeader
          isDarkMode={isDarkMode}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
        />
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
            <UserTable
              isDarkMode={isDarkMode}
              users={users}
              currentPage={currentPage}
              limit={limit}
              onViewDetails={handleViewDetails}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />

            {/* Mobile Card View */}
            <UserMobileCard
              isDarkMode={isDarkMode}
              users={users}
              currentPage={currentPage}
              limit={limit}
              onViewDetails={handleViewDetails}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />

            {/* Pagination - inside scroll area */}
            {users.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalUsers}
                  limit={limit}
                  onPageChange={(page) => fetchUsers(page, searchTerm, statusFilter)}
                  onLimitChange={handleLimitChange}
                  limitOptions={[10, 20, 50, 100]}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <UserDeleteDialog
        isDarkMode={isDarkMode}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={userToDelete}
        onConfirm={confirmDelete}
      />

      {/* User Detail Dialog */}
      <UserDetailDialog
        isDarkMode={isDarkMode}
        isOpen={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        user={selectedUser}
      />

      {/* Status Change Confirmation Dialog */}
      <UserStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        pendingChange={pendingStatusChange}
        onConfirm={confirmStatusChange}
      />

      {/* Role Change Confirmation Dialog */}
      <UserRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        pendingChange={pendingRoleChange}
        onConfirm={confirmRoleChange}
      />
    </div>
  );
};

export default UserManagement;
