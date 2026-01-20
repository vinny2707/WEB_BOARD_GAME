import React from "react";
import { Check, X, Clock } from "lucide-react";
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

const PendingRequestCard = ({ requester, createdAt, onAccept, onReject }) => {
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
    <div className="bg-white/70 dark:bg-slate-800/70 border-2 border-amber-200 dark:border-amber-800/50 rounded-xl p-4 hover:border-amber-500 dark:hover:border-amber-500 transition-all">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-md font-semibold shrink-0 group">
          {requester.avatar_url ? (
            <img
              src={requester.avatar_url}
              alt={requester.username}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-165"
            />
          ) : (
            getInitials(requester.username)
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {requester.full_name || requester.username}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{requester.username}
          </p>
        
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="p-2 cursor-pointer rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
            title="Accept request"
          >
            <Check className="w-5 h-5" />
          </button>

          {/* Reject Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-2 cursor-pointer rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                title="Reject request"
              >
                <X className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Friend Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reject the friend request from{" "}
                  {requester.username}? They won't be notified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onReject}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestCard;
