import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  Search,
  ArrowLeft,
  MoreVertical,
  Users,
  Shield,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { toast } from "sonner";
import { getInitials } from "@/utils/Username";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserProvider";

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasHandledNavigation = useRef(false);
  const { isAuthenticated } = useUser();

  // Fetch conversations (inbox)
  const fetchConversations = async () => {
    try {
      const response = await api.get("/api/messages/inbox");
      setConversations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/api/messages/unread-count");
      setUnreadCount(response.data.data?.unread_count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch conversation messages
  const fetchMessages = async (userId, page = 1) => {
    try {
      const response = await api.get(`/api/messages/conversation/${userId}`, {
        params: { limit: 20, page },
      });

      // Handle new response format: { other_user, messages, pagination }
      const messagesData = response.data.data?.messages || response.data.data || [];
      const pagination = response.data.data?.pagination || response.data.pagination;

      // Sort messages from oldest to newest (top to bottom)
      const sortedMessages = messagesData.sort(
        (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
      );

      if (page === 1) {
        setMessages(sortedMessages);
        setCurrentPage(1);
      } else {
        // Prepend older messages
        setMessages((prev) => [...sortedMessages, ...prev]);
      }

      // Check if there are more messages
      setHasMoreMessages(pagination?.page < pagination?.totalPages);

      // Mark messages as read (only on first load)
      if (page === 1) {
        await api.put(`/api/messages/conversation/${userId}/read`);
        fetchUnreadCount();
        fetchConversations();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  // Load more messages (for infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    // Add minimum delay to show spinner (500ms)
    await Promise.all([
      fetchMessages(selectedConversation.user.id, nextPage),
      new Promise(resolve => setTimeout(resolve, 500))
    ]);

    setCurrentPage(nextPage);
    setLoadingMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, loadingMore, hasMoreMessages, currentPage]);

  // Fetch friendship status
  const fetchFriendshipStatus = async (userId) => {
    try {
      const response = await api.get(`/api/friends/status/${userId}`);
      setFriendshipStatus(response.data.data);
    } catch (error) {
      console.error("Error fetching friendship status:", error);
      setFriendshipStatus(null);
    }
  };

  // Handle select conversation
  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.user.id);
    fetchFriendshipStatus(conversation.user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchConversations(), fetchUnreadCount()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Handle navigation state (when coming from Friends page)
  useEffect(() => {
    if (
      location.state?.selectedUserId &&
      !hasHandledNavigation.current
    ) {
      const userId = location.state.selectedUserId;
      const friendData = location.state.friendData;

      let conversation = conversations.find((conv) => conv.user.id === userId);

      // If conversation doesn't exist, create a virtual one
      if (!conversation && friendData) {
        conversation = {
          user: {
            id: friendData.id,
            username: friendData.username,
            full_name: friendData.full_name,
            avatar_url: friendData.avatar_url,
          },
          last_message: null,
          unread_count: 0,
        };
        // Add to conversations list
        setConversations((prev) => [conversation, ...prev]);
      }

      if (conversation) {
        handleSelectConversation(conversation);
      }

      hasHandledNavigation.current = true;
      // Clear the navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, conversations, navigate, handleSelectConversation, location.pathname]);

  // Auto-scroll to bottom when messages change (only for new messages, not when loading more)
  useEffect(() => {
    if (messagesContainerRef.current && !loadingMore) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loadingMore]);

  // Scroll detection for infinite scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Check if scrolled to top (with 50px threshold)
      if (container.scrollTop < 50 && hasMoreMessages && !loadingMore) {
        const previousScrollHeight = container.scrollHeight;
        loadMoreMessages().then(() => {
          // Maintain scroll position after loading
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - previousScrollHeight;
            }
          }, 100);
        });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, loadingMore, selectedConversation, loadMoreMessages]);

  // Reset navigation handler when leaving the page
  useEffect(() => {
    return () => {
      hasHandledNavigation.current = false;
    };
  }, []);



  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await api.post("/api/messages", {
        receiver_id: selectedConversation.user.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
      fetchMessages(selectedConversation.user.id);
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/api/messages/${messageId}`);
      toast.success("Message deleted");
      fetchMessages(selectedConversation.user.id);
      fetchConversations();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    } finally {
      setDeleteMessageId(null);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.content
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Check if user is blocked
  const isBlocked = friendshipStatus?.status === "blocked";

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex-1 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-lg">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold dark:text-white mb-2">
            Bạn chưa đăng nhập
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Vui lòng đăng nhập để xem danh sách tin nhắn
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
    <div className="w-full flex-1 flex flex-col lg:flex-row gap-0 dark:bg-slate-900/50 h-full">
      {/* Conversations List */}
      <div
        className={`${selectedConversation ? "hidden lg:flex" : "flex"
          } flex-col w-full lg:w-96 border-r dark:border-slate-800 bg-slate-50 dark:!bg-slate-900/50`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b dark:border-slate-800 bg-white/95 dark:bg-slate-900/95">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold dark:text-white">
                  Messages
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/social")}
              className="mr-1 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-100 dark:bg-slate-800 border-0 dark:text-white"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                Loading conversations...
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-slate-800">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-white/95 dark:hover:bg-slate-800 ${selectedConversation?.user.id === conversation.user.id
                    ? "bg-white/95 dark:bg-slate-800 border-l-4 border-l-emerald-500"
                    : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {conversation.user?.avatar_url ? (
                          <img
                            src={conversation.user.avatar_url}
                            alt={conversation.user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>
                            {getInitials(conversation.user?.full_name)}
                          </span>
                        )}
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                          {conversation.unread_count > 9
                            ? "9+"
                            : conversation.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {conversation.user?.full_name ||
                            conversation.user?.username}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatTime(conversation.last_message?.sent_at)}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${conversation.unread_count > 0
                          ? "text-gray-900 dark:text-white font-medium"
                          : "text-gray-500 dark:text-gray-400"
                          }`}
                      >
                        {conversation.last_message?.is_from_me ? "You: " : ""}
                        {conversation.last_message?.content ||
                          "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/95 dark:bg-slate-900">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                    {selectedConversation.user?.avatar_url ? (
                      <img
                        src={selectedConversation.user.avatar_url}
                        alt={selectedConversation.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>
                        {getInitials(selectedConversation.user?.full_name)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.user?.full_name ||
                        selectedConversation.user?.username}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{selectedConversation.user?.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="h-[500px] max-h-[500px] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/30"
            >
              {messages.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-center py-12">
                  <div className="">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Start your conversation
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Loading indicator for older messages */}
                  {loadingMore && (
                    <div className="flex flex-col items-center justify-center py-4 gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-emerald-500"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading older messages...</p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_from_me ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div className="max-w-[70%]">
                        <div className="flex items-center gap-2">
                          {message.is_from_me && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="flex-shrink-0 opacity-70 hover:opacity-100">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="dark:bg-slate-800 dark:border-slate-700">
                                <DropdownMenuItem
                                  onClick={() => setDeleteMessageId(message.id)}
                                  className="text-red-600 dark:text-red-400 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          <p
                            className={`break-words flex-1 rounded-2xl px-4 py-2 ${message.is_from_me
                              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                              : "bg-white/95 dark:bg-slate-800 text-gray-900 dark:text-white"
                              }`}
                          >
                            {message.content}
                          </p>
                        </div>
                        <p
                          className={`text-xs mt-1 ${message.is_from_me
                            ? "text-white/70 text-end"
                            : "text-gray-500 dark:text-gray-400 text-start"
                            }`}
                        >
                          {formatTime(message.sent_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            {isBlocked ? (
              <div className="p-4 border-t dark:border-slate-800 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <Shield className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    You cannot send messages to this user. This friendship has
                    been blocked.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t dark:border-slate-800 bg-white/95 dark:bg-slate-900"
              >
                <div className="flex gap-2 items-center">
                  <Textarea
                    rows={1}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                      }
                    }}
                    className="flex-1 resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-[40px] max-h-[120px]"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteMessageId}
        onOpenChange={() => setDeleteMessageId(null)}
      >
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Delete Message
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteMessage(deleteMessageId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
