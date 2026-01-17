import React, { useState, useEffect } from "react";
import { Users, UserPlus, Send, Search, UserX, Shield } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
import FriendCard from "../components/FriendCard";
import PendingRequestCard from "../components/PendingRequestCard";
import SentRequestCard from "../components/SentRequestCard";
import BlockedUserCard from "../components/BlockedUserCard";
import AddFriendDialog from "../components/AddFriendDialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useUser } from "@/contexts/UserProvider";

const Friends = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Pagination state
  const [pagination, setPagination] = useState({
    friends: { page: 1, totalPages: 1, total: 0 },
    pending: { page: 1, totalPages: 1, total: 0 },
    sent: { page: 1, totalPages: 1, total: 0 },
    blocked: { page: 1, totalPages: 1, total: 0 },
  });
  const itemsPerPage = 10;

  // Fetch friends list
  const fetchFriends = async (page = 1) => {
    try {
      const response = await api.get("/api/friends", {
        params: { page, limit: itemsPerPage },
      });
      setFriends(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        friends: {
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
        },
      }));
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends");
    }
  };

  // Fetch pending requests
  const fetchPendingRequests = async (page = 1) => {
    try {
      const response = await api.get("/api/friends/requests/pending", {
        params: { page, limit: itemsPerPage },
      });
      setPendingRequests(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        pending: {
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
        },
      }));
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast.error("Failed to load pending requests");
    }
  };

  // Fetch sent requests
  const fetchSentRequests = async (page = 1) => {
    try {
      const response = await api.get("/api/friends/requests/sent", {
        params: { page, limit: itemsPerPage },
      });
      setSentRequests(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        sent: {
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
        },
      }));
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      toast.error("Failed to load sent requests");
    }
  };

  // Fetch blocked users
  const fetchBlockedUsers = async (page = 1) => {
    try {
      const response = await api.get("/api/friends", {
        params: { status: "blocked", page, limit: itemsPerPage },
      });
      setBlockedUsers(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        blocked: {
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
        },
      }));
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      toast.error("Failed to load blocked users");
    }
  };

  // Initial data load - only run when user is authenticated
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFriends(),
        fetchPendingRequests(),
        fetchSentRequests(),
        fetchBlockedUsers(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Handle unfriend
  const handleUnfriend = async (friendId) => {
    try {
      await api.delete(`/api/friends/${friendId}`);
      toast.success("Friend removed successfully");
      fetchFriends();
    } catch (error) {
      console.error("Error unfriending:", error);
      toast.error("Failed to remove friend");
    }
  };

  // Handle block user
  const handleBlock = async (userId) => {
    try {
      await api.put(`/api/friends/${userId}/block`);
      toast.success("User blocked successfully");
      fetchFriends();
      fetchBlockedUsers();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };

  // Handle unblock user
  const handleUnblock = async (userId) => {
    try {
      await api.put(`/api/friends/${userId}/unblock`);
      toast.success("User unblocked successfully");
      fetchBlockedUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
    }
  };

  // Handle accept request
  const handleAccept = async (requesterId) => {
    try {
      await api.put(`/api/friends/${requesterId}/accept`);
      toast.success("Friend request accepted");
      await Promise.all([fetchFriends(), fetchPendingRequests()]);
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  // Handle reject request
  const handleReject = async (requesterId) => {
    try {
      await api.put(`/api/friends/${requesterId}/reject`);
      toast.success("Friend request rejected");
      fetchPendingRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  // Handle cancel sent request
  const handleCancel = async (friendId) => {
    try {
      await api.delete(`/api/friends/${friendId}/cancel`);
      toast.success("Friend request cancelled");
      fetchSentRequests();
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error("Failed to cancel request");
    }
  };

  // Handle send friend request
  const handleSendRequest = async (friendId) => {
    try {
      await api.post("/api/friends/request", { friendId });
      toast.success("Friend request sent");
      fetchSentRequests();
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    const currentPagination = pagination[activeTab];
    if (newPage < 1 || newPage > currentPagination.totalPages) return;

    switch (activeTab) {
      case "friends":
        fetchFriends(newPage);
        break;
      case "pending":
        fetchPendingRequests(newPage);
        break;
      case "sent":
        fetchSentRequests(newPage);
        break;
      case "blocked":
        fetchBlockedUsers(newPage);
        break;
    }
  };

  // Render pagination component
  const renderPagination = () => {
    const currentPagination = pagination[activeTab];
    const { page, totalPages, total } = currentPagination;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {startPage > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}

            {pages.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={pageNum === page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  // Filter data based on search
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();

    switch (activeTab) {
      case "friends":
        return friends.filter(
          (friend) =>
            friend.friend?.username?.toLowerCase().includes(query) ||
            friend.friend?.full_name?.toLowerCase().includes(query) ||
            friend.friend?.email?.toLowerCase().includes(query)
        );
      case "pending":
        return pendingRequests.filter(
          (request) =>
            request.requester?.username?.toLowerCase().includes(query) ||
            request.requester?.full_name?.toLowerCase().includes(query) ||
            request.requester?.email?.toLowerCase().includes(query)
        );
      case "sent":
        return sentRequests.filter(
          (request) =>
            request.recipient?.username?.toLowerCase().includes(query) ||
            request.recipient?.full_name?.toLowerCase().includes(query) ||
            request.recipient?.email?.toLowerCase().includes(query)
        );
      case "blocked":
        return blockedUsers.filter(
          (user) =>
            user.friend?.username?.toLowerCase().includes(query) ||
            user.friend?.full_name?.toLowerCase().includes(query) ||
            user.friend?.email?.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  const tabs = [
    {
      id: "friends",
      label: "Friends",
      icon: Users,
      count: friends.length,
    },
    {
      id: "pending",
      label: "Requests",
      icon: UserPlus,
      count: pendingRequests.length,
    },
    {
      id: "sent",
      label: "Sent",
      icon: Send,
      count: sentRequests.length,
    },
    {
      id: "blocked",
      label: "Blocked",
      icon: Shield,
      count: blockedUsers.length,
    },
  ];

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="w-full flex-1 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-zinc-800 shadow-lg">
          <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold dark:text-white mb-2">Bạn chưa đăng nhập</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Vui lòng đăng nhập để xem danh sách bạn bè
          </p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 border shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold dark:text-white">
                Friends
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your connections
              </p>
            </div>
          </div>

          <AddFriendDialog
            onSendRequest={handleSendRequest}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:!bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-white/20"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 border shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Friends List */}
            {activeTab === "friends" && (
              <div className="space-y-4">
                {getFilteredData().length > 0 ? (
                  getFilteredData().map((friendship) => (
                    <FriendCard
                      key={friendship.friendship_id}
                      friend={friendship.friend}
                      onUnfriend={() => handleUnfriend(friendship.friend.id)}
                      onBlock={() => handleBlock(friendship.friend.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {searchQuery
                        ? "No friends found matching your search"
                        : "No friends yet. Start by adding some!"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pending Requests */}
            {activeTab === "pending" && (
              <div className="space-y-4">
                {getFilteredData().length > 0 ? (
                  getFilteredData().map((request) => (
                    <PendingRequestCard
                      key={request.friendship_id}
                      requester={request.requester}
                      createdAt={request.created_at}
                      onAccept={() => handleAccept(request.requester.id)}
                      onReject={() => handleReject(request.requester.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <UserPlus className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {searchQuery
                        ? "No pending requests matching your search"
                        : "No pending friend requests"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sent Requests */}
            {activeTab === "sent" && (
              <div className="space-y-4">
                {getFilteredData().length > 0 ? (
                  getFilteredData().map((request) => (
                    <SentRequestCard
                      key={request.friendship_id}
                      recipient={request.recipient}
                      createdAt={request.created_at}
                      onCancel={() => handleCancel(request.recipient.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Send className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {searchQuery
                        ? "No sent requests matching your search"
                        : "No pending sent requests"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Blocked Users */}
            {activeTab === "blocked" && (
              <div className="space-y-4">
                {getFilteredData().length > 0 ? (
                  getFilteredData().map((user) => (
                    <BlockedUserCard
                      key={user.friendship_id}
                      user={user}
                      onUnblock={handleUnblock}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {searchQuery
                        ? "No blocked users matching your search"
                        : "No blocked users"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!searchQuery && getFilteredData().length > 0 && renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Friends;
