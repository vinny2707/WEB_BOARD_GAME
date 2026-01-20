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

  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          title: "Activate User",
          action: "Activate",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
          buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
          warning: null,
        };
      case "banned":
        return {
          title: "Ban User",
          action: "Ban User",
          iconColor: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          buttonColor: "bg-red-600 hover:bg-red-700 text-white",
          warning: "⚠️ This user will be banned from accessing the platform.",
        };
      case "inactive":
      default:
        return {
          title: "Deactivate User",
          action: "Deactivate",
          iconColor: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 dark:bg-amber-900/30",
          buttonColor: "bg-amber-600 hover:bg-amber-700 text-white",
          warning: "⚠️ This user will be temporarily deactivated.",
        };
    }
  };

  const config = getStatusConfig(newStatus);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <AlertTriangle className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <AlertDialogTitle className="dark:text-white">
              {config.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="dark:text-slate-400 pt-2">
            Are you sure you want to change the status of user{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.username || user?.full_name}
            </span>{" "}
            to <span className="font-semibold uppercase">{newStatus}</span>?
            {config.warning && (
              <span className={`block mt-2 font-medium ${newStatus === 'banned' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                {config.warning}
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
            className={config.buttonColor}
          >
            {config.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserStatusDialog;

