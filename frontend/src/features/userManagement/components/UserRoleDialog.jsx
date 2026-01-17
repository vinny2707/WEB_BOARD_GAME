import React from "react";
import { AlertTriangle } from "lucide-react";
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
 * User Role Change Confirmation Dialog
 */
const UserRoleDialog = ({ 
  open, 
  onOpenChange, 
  pendingChange, 
  onConfirm 
}) => {
  if (!pendingChange) return null;

  const { user, newRole } = pendingChange;
  const isPromoting = newRole === "admin";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isPromoting ? "bg-amber-100 dark:bg-amber-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
              <AlertTriangle className={`w-6 h-6 ${isPromoting ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`} />
            </div>
            <AlertDialogTitle className="dark:text-white">
              {isPromoting ? "Promote to Admin" : "Demote to User"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="dark:text-slate-400 pt-2">
            Are you sure you want to change the role of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.username || user?.full_name}
            </span>{" "}
            to <span className="font-semibold capitalize">{newRole}</span>?
            {isPromoting && (
              <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ This user will have administrative privileges including managing other users.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 dark:border-slate-600">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              isPromoting
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          >
            {isPromoting ? "Promote" : "Demote"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserRoleDialog;

