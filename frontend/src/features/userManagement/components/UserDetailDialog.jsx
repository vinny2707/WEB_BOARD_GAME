import React from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Clock,
  UserCheck,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInitials } from "@/utils/Username";
import { getStatusColor, getRoleColor } from "../utils/colorUtils";

/**
 * User Detail Dialog - Shows complete user profile
 */
const UserDetailDialog = ({ isDarkMode, isOpen, onOpenChange, user }) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-3xl ${
          isDarkMode ? "bg-slate-800 border-slate-700" : ""
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
                  ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30"
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            Player Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Card with Avatar */}
          <div
            className={`relative overflow-hidden rounded-xl ${
              isDarkMode
                ? "bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600"
                : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
            }`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
            <div className="relative p-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div
                  className={`relative flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                      : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                  } shadow-lg`}
                >
                  {getInitials(user.username)}
                  <div className="absolute -bottom-2 -right-2">
                    <div
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${getRoleColor(
                        user.role
                      )} shadow-lg`}
                    >
                      {user.role.toUpperCase()}
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
                    {user.username}
                  </h3>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    } mb-3`}
                  >
                    {user.full_name || "No full name set"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(
                        user.status
                      )}`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        isDarkMode
                          ? "bg-slate-700 text-slate-300 border border-slate-600"
                          : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      Player ID: #{user.id}
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
                  ? "bg-slate-700/50 border border-slate-600/50"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? "bg-blue-500/10 text-blue-400"
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
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    } uppercase tracking-wider mb-1`}
                  >
                    Email Address
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    } break-all`}
                  >
                    {user.email}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    } uppercase tracking-wider mb-1`}
                  >
                    Date of Birth
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar
                      className={`w-4 h-4 ${
                        isDarkMode ? "text-slate-400" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.dob
                        ? new Date(user.dob).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
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
                  ? "bg-slate-700/50 border border-slate-600/50"
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
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    } uppercase tracking-wider mb-1`}
                  >
                    Member Since
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    } uppercase tracking-wider mb-1`}
                  >
                    Last Active
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user.last_login
                          ? isDarkMode
                            ? "bg-blue-500"
                            : "bg-green-500"
                          : isDarkMode
                          ? "bg-slate-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
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
                ? "bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50"
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
                  isDarkMode ? "bg-slate-700/50" : "bg-white"
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getRoleColor(
                    user.role
                  )}`}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  } mb-1`}
                >
                  Role
                </p>
                <p
                  className={`font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg text-center ${
                  isDarkMode ? "bg-slate-700/50" : "bg-white"
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(
                    user.status
                  )}`}
                >
                  <UserCheck className="w-5 h-5" />
                </div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  } mb-1`}
                >
                  Status
                </p>
                <p
                  className={`font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg text-center ${
                  isDarkMode ? "bg-slate-700/50" : "bg-white"
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
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  } mb-1`}
                >
                  User ID
                </p>
                <p
                  className={`font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  #{user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailDialog;
