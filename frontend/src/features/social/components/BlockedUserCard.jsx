import React, { useState } from "react";
import { Shield, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { getInitials } from "@/utils/Username";

export default function BlockedUserCard({ user, onUnblock }) {
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);

  const handleUnblock = () => {
    onUnblock(user.friend?.id);
    setShowUnblockDialog(false);
  };

  return (
    <>
      <div className="bg-white/70 border border-gray-200 dark:bg-slate-800/70 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                {user.friend?.avatar_url ? (
                  <img
                    src={user.friend.avatar_url}
                    alt={user.friend.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{getInitials(user.friend?.full_name)}</span>
                )}
              </div>
              {/* Blocked indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {user.friend?.full_name || user.friend?.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                @{user.friend?.username}
              </p>
            </div>
          </div>

          {/* Unblock button */}
          <Button
            onClick={() => setShowUnblockDialog(true)}
            variant="outline"
            size="sm"
            className="flex cursor-pointer items-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 dark:hover:border-emerald-700"
          >
            <Unlock className="w-4 h-4" />
            <span>Unblock</span>
          </Button>
        </div>
      </div>

      {/* Unblock confirmation dialog */}
      <AlertDialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Unblock User
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Are you sure you want to unblock{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {user.friend?.full_name || user.friend?.username}
              </span>
              ? You'll be able to interact with them again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblock}
              className="cursor-pointer bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
            >
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
