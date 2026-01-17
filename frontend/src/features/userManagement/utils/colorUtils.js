/**
 * Color utility functions for User Management
 */

export const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "text-blue-400 bg-blue-500/20 border border-blue-500/30";
    case "inactive":
      return "text-yellow-400 bg-yellow-500/20 border border-yellow-500/30";
    case "banned":
      return "text-red-400 bg-red-500/20 border border-red-500/30";
    default:
      return "text-gray-400 bg-gray-500/20 border border-gray-500/30";
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return "text-purple-400 bg-purple-500/20 border border-purple-500/30";
    case "user":
      return "text-blue-400 bg-blue-500/20 border border-blue-500/30";
    default:
      return "text-gray-400 bg-gray-500/20 border border-gray-500/30";
  }
};
