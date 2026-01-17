import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  Search,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { useLocation } from "react-router-dom";
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

export default function Messages() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const messagesEndRef = useRef(null);

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
  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/api/messages/conversation/${userId}`, {
        params: { limit: 50 },
      });
      setMessages(response.data.data || []);
      // Mark messages as read
      await api.put(`/api/messages/conversation/${userId}/read`);
      fetchUnreadCount();
      fetchConversations();
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

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
    if (location.state?.selectedUserId && conversations.length > 0) {
      const conversation = conversations.find(
        (conv) => conv.user.id === location.state.selectedUserId
      );
      if (conversation) {
        handleSelectConversation(conversation);
      }
    }
  }, [location.state, conversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle select conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.user.id);
  };

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
      toast.success("Message sent");
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

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row gap-0 dark:bg-zinc-900/50 h-full">
      {/* Conversations List */}
      <div
        className={`${
          selectedConversation ? "hidden lg:flex" : "flex"
        } flex-col w-full lg:w-96 border-r dark:border-zinc-800 bg-zinc-50 dark:!bg-zinc-900/50`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b dark:border-zinc-800 bg-white dark:!bg-zinc-900">
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
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-100 dark:bg-zinc-800 border-0 dark:text-white"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
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
            <div className="divide-y dark:divide-zinc-800">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-white dark:hover:bg-zinc-800 ${
                    selectedConversation?.user.id === conversation.user.id
                      ? "bg-white dark:!bg-zinc-800 border-l-4 border-l-emerald-500"
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
                        className={`text-sm truncate ${
                          conversation.unread_count > 0
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
      <div className="flex-1 flex flex-col bg-white dark:!bg-zinc-900">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/30">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Start your conversation
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.is_from_me ? "justify-end" : "justify-start"
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
                            <DropdownMenuContent className="dark:bg-zinc-800 dark:border-zinc-700">
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
                          className={`break-words flex-1 rounded-2xl px-4 py-2 ${
                            message.is_from_me
                              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                              : "bg-white dark:!bg-zinc-800 text-gray-900 dark:text-white"
                          }`}
                        >
                          {message.content}
                        </p>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          message.is_from_me
                            ? "text-white/70 text-end"
                            : "text-gray-500 dark:text-gray-400 text-start"
                        }`}
                      >
                        {formatTime(message.sent_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t dark:border-zinc-800 bg-white dark:!bg-zinc-900"
            >
              <div className="flex gap-2">
                <Textarea
                  rows={1}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  className="flex-1 resize-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white min-h-[40px] max-h-[120px]"
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
        <AlertDialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
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
            <AlertDialogCancel className="dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700">
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
