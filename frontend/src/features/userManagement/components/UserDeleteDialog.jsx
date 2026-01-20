import React from "react";
import { getInitials } from "@/utils/Username";
import { Trash2, Shield } from "lucide-react";
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

/**
 * Delete Confirmation Dialog for User Management
 */
const UserDeleteDialog = ({
  isDarkMode,
  isOpen,
  onOpenChange,
  user,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`max-w-md ${isDarkMode ? "bg-slate-800 border-slate-700" : ""
          }`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className={`flex items-center gap-3 text-xl ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            <div
              className={`p-2 rounded-lg ${isDarkMode
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-red-500/20 text-red-600 border border-red-500/30"
                }`}
            >
              <Trash2 className="w-5 h-5" />
            </div>
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription
            className={`${isDarkMode ? "text-slate-400" : "text-gray-600"} mt-4`}
          >
            {user && (
              <div className="space-y-4">
                <p className="text-base">
                  Are you sure you want to permanently delete this user account?
                </p>
                <div
                  className={`p-4 rounded-lg ${isDarkMode
                      ? "bg-slate-700/50 border border-slate-600"
                      : "bg-gray-50 border border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold overflow-hidden ${isDarkMode
                          ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                          : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                        }`}
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(user.username)
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                      >
                        {user.username}
                      </p>
                      <p
                        className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg ${isDarkMode
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-red-50 border border-red-200"
                    }`}
                >
                  <Shield
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? "text-red-400" : "text-red-600"
                      }`}
                  />
                  <p
                    className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-700"
                      }`}
                  >
                    This action cannot be undone. All user data, including game
                    history and achievements, will be permanently removed.
                  </p>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel
            className={`${isDarkMode
                ? "bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              }`}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`${isDarkMode
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
              }`}
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDeleteDialog;
