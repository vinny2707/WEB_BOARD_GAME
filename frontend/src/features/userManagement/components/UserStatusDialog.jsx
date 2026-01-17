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
 * User Status Change Confirmation Dialog
 */
const UserStatusDialog = ({ 
  open, 
  onOpenChange, 
  pendingChange, 
  onConfirm 
}) => {
  if (!pendingChange) return null;

  const { user, newStatus } = pendingChange;
  const isActivating = newStatus === "active";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isActivating ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              <AlertTriangle className={`w-6 h-6 ${isActivating ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} />
            </div>
            <AlertDialogTitle className="dark:text-white">
              {isActivating ? "Activate User" : "Deactivate User"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="dark:text-slate-400 pt-2">
            Are you sure you want to {isActivating ? "activate" : "deactivate"} user{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.username || user?.full_name}
            </span>
            ?
            {!isActivating && (
              <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                ⚠️ This user will no longer be able to access the platform.
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
              isActivating
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
          >
            {isActivating ? "Activate" : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserStatusDialog;

