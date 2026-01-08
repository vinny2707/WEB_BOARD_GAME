import React from 'react'
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import {Button} from '@/components/ui/Button';
import { useState } from 'react';
import { getInitials } from '@/utils/Username';

const FriendCard = ({ id, username, fullName, isFriend = true }) => {
  const [loading, setLoading] = useState(false);

  const handleRemoveFriend = () => {
    console.log(`Removing friend: ${username}`);
  }

  const handleApproveRequest = (friendId) => {

  }

  const handleRejectRequest = (friendId) => {

  }

  return (
    <Card className="transition-all hover:scale-[1.03] dark:border-emerald-500/30">
      <CardContent>
        <div className="flex flex-col items-stretch justify-between gap-4">
          {/* Avatar with status */}
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white">
              {getInitials(username)}
            </div>
            {/* <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-50 dark:border-zinc-800 bg-emerald-500"></div> */}

            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {username}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                {fullName}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {isFriend ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="desctructive"
                  className="w-full cursor-pointer bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 hover:outline-0"
                >
                  Remove Friend
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your friend connection with {username}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={handleRemoveFriend}
                      disabled={loading}
                    >
                      {loading ? "Removing..." : "Yes, Remove Friend"}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="destructive"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                onClick={() => handleApproveRequest(id)}
              >
                Approve
              </Button>

              <Button
                variant="desctructive"
                className="w-full cursor-pointer bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 hover:outline-0"
                onClick={() => handleRejectRequest(id)}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FriendCard