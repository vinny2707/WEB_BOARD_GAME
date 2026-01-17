import React from "react";
import { MoreVertical, MessageCircle, UserX, Shield } from "lucide-react";
import { getInitials } from "@/utils/Username";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const FriendCard = ({ friend, onUnfriend, onBlock }) => {
  return (
    <div className="bg-white dark:!bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-md font-semibold shrink-0 group">
          {friend.avatar_url ? (
            <img
              src={friend.avatar_url}
              alt={friend.username}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-165"
            />
          ) : (
            getInitials(friend.username)
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {friend.full_name || friend.username}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{friend.username}
          </p>

          {friend.status && (
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                friend.status === "active"
                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {friend.status}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Message Button */}
          <button className="p-2 cursor-pointer rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 cursor-pointer rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Unfriend
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Friend</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {friend.username} from
                      your friends list? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onUnfriend}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-orange-600 dark:text-orange-400 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Block User
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Block User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to block {friend.username}? They
                      will not be able to send you friend requests or messages.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onBlock}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Block
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
