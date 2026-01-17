import React, { useState, useEffect } from "react";
import { UserPlus, Search, Check, Clock, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { toast } from "sonner";
import { getInitials } from "@/utils/Username";

const AddFriendDialog = ({ onSendRequest, onAccept, onReject }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendshipStatuses, setFriendshipStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a username or email");
      return;
    }

    setSearching(true);
    try {
      // Search users by username or email
      const response = await api.get(`/api/users`, {
        params: { search: searchQuery },
      });
      const users = response.data.data?.users || [];
      setSearchResults(users);

      if (users.length === 0) {
        toast.info("No users found");
      } else {
        // Check friendship status for each user
        await checkFriendshipStatuses(users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  // Check friendship status for all users
  const checkFriendshipStatuses = async (users) => {
    const statuses = {};
    await Promise.all(
      users.map(async (user) => {
        try {
          const response = await api.get(`/api/friends/status/${user.id}`);
          statuses[user.id] = response.data.data;
        } catch (error) {
          console.error(`Error checking status for user ${user.id}:`, error);
          statuses[user.id] = { status: null, direction: null };
        }
      })
    );
    setFriendshipStatuses(statuses);
  };

  const handleSendRequest = async (userId) => {
    setLoading(true);
    try {
      await onSendRequest(userId);
      // Refresh friendship status after sending request
      const response = await api.get(`/api/friends/status/${userId}`);
      setFriendshipStatuses((prev) => ({
        ...prev,
        [userId]: response.data.data,
      }));
    } catch (error) {
      console.error("Error in handleSendRequest:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (userId) => {
    setLoading(true);
    try {
      await onAccept(userId);
      // Refresh friendship status
      const response = await api.get(`/api/friends/status/${userId}`);
      setFriendshipStatuses((prev) => ({
        ...prev,
        [userId]: response.data.data,
      }));
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (userId) => {
    setLoading(true);
    try {
      await onReject(userId);
      // Refresh friendship status
      const response = await api.get(`/api/friends/status/${userId}`);
      setFriendshipStatuses((prev) => ({
        ...prev,
        [userId]: response.data.data,
      }));
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render action button or status badge based on friendship status
  const renderActionButton = (user) => {
    const status = friendshipStatuses[user.id];

    if (!status) {
      return (
        <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
      );
    }

    // Already friends
    if (status.status === "accepted") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Friends</span>
        </div>
      );
    }

    // Request pending - outgoing
    if (status.status === "pending" && status.direction === "outgoing") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Pending</span>
        </div>
      );
    }

    // Request pending - incoming (they sent you a request)
    if (status.status === "pending" && status.direction === "incoming") {
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleAcceptRequest(user.id)}
            disabled={loading}
            size="sm"
            className="cursor-pointer bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            onClick={() => handleRejectRequest(user.id)}
            disabled={loading}
            size="sm"
            variant="destructive"
            className="cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            Reject
          </Button>
        </div>
      );
    }

    // Blocked
    if (status.status === "blocked") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Blocked</span>
        </div>
      );
    }

    // No relationship - show add button
    return (
      <Button
        onClick={() => handleSendRequest(user.id)}
        disabled={loading}
        size="sm"
        className="cursor-pointer bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold"
      >
        <UserPlus className="w-4 h-4 mr-1" />
        Add
      </Button>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold transition-all shadow-lg">
          <UserPlus className="w-5 h-5" />
          Add Friend
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Search for users by username or email to send a friend request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search by username or email..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:!bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="cursor-pointer bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold dark:text-white"
            >
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                    {getInitials(user.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium dark:text-white truncate">
                      {user.username}
                    </p>
                    {user.full_name && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {user.full_name}
                      </p>
                    )}
                    {user.email && (
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  {renderActionButton(user)}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  {searchQuery
                    ? "No results found"
                    : "Enter a username or email to search"}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              setOpen(false);
              setSearchResults([]);
              setSearchQuery("");
              setFriendshipStatuses({});
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
