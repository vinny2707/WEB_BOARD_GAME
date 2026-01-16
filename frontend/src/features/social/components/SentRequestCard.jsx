import React from "react";
import { X, Clock } from "lucide-react";
import { getInitials } from "@/utils/Username";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SentRequestCard = ({ recipient, createdAt, onCancel }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:!bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-md font-semibold shrink-0">
          {getInitials(recipient.username)}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {recipient.full_name || recipient.username}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{recipient.username}
          </p>
          
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Sent {formatDate(createdAt)}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
            Pending
          </span>

          {/* Cancel Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-2 cursor-pointer rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-colors"
                title="Cancel request"
              >
                <X className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Friend Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel the friend request sent to{" "}
                  {recipient.username}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Request</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCancel}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Cancel Request
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default SentRequestCard;
