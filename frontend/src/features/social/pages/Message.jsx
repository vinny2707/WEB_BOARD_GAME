import React, { use } from "react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeProvider";
import { getInitials } from "@/utils/Username";
import { useUser } from "@/contexts/UserProvider";
import { Send } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const Message = () => {
  const [messageInput, setMessageInput] = useState([]);
  const { theme } = useTheme();
  const { user } = useUser();
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Mock data for messages
  const conversations = [
    {
      user_id: 2,
      username: "John Doe",
      lastMessage: "Hey! How are you?",
      send_at: "10:07 AM",
    },
    {
      user_id: 3,
      username: "Jane Smith",
      lastMessage: "Let's catch up later.",
      send_at: "Yesterday",
    },
  ];

  const [activeChat, setActiveChat] = useState({
    user_id: conversations[0].user_id,
    username: conversations[0].username,
  });

  // Mock messages for the active chat
  const messages = [
    {
      id: 1,
      content: "Hey! How are you?",
      send_at: "10:00 AM",
      sender_id: 2,
    },
    {
      id: 2,
      content: "I'm good, thanks! How about you?",
      send_at: "10:02 AM",
      sender_id: 1,
    },
    {
      id: 3,
      content: "Doing well! Want to catch up later?",
      send_at: "10:05 AM",
      sender_id: 2,
    },
    {
      id: 4,
      content: "Sure! Let's meet at the cafe.",
      send_at: "10:07 AM",
      sender_id: 1,
    },
    {
      id: 5,
      content: "Sounds good. See you then!",
      send_at: "10:10 AM",
      sender_id: 2,
    },
    {
      id: 6,
      content: "Looking forward to it!",
      send_at: "10:12 AM",
      sender_id: 1,
    },
    {
      id: 7,
      content: "Me too! See you soon.",
      send_at: "10:15 AM",
      sender_id: 2,
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;

    // Here you would typically send the message to the server
    console.log(`Sending message to ${activeChat.username}: ${messageInput}`);

    // Clear input field after sending
    setMessageInput("");
  };

  return (
    <div className="flex-1 w-full h-full flex gap-2 min-h-0">
      {/* Sidebar */}
      <div className="w-full sm:w-80 h-full border-r border-gray-200 dark:border-zinc-800 flex flex-col">
        <div className="p-3 sm:p-4 border-b dark:border-zinc-800 border-gray-200">
          <h2 className="text-lg sm:text-xl text-gray-900 dark:text-white">
            Messages
          </h2>
        </div>

        <div className="h-full flex-1 overflow-y-auto min-h-0">
          {conversations.map((conv) => (
            <button
              key={conv.user_id}
              onClick={() =>
                setActiveChat({
                  user_id: conv.user_id,
                  username: conv.username,
                })
              }
              className={`w-full p-3 sm:p-4 flex items-center gap-3 transition-colors cursor-pointer ${
                activeChat.user_id === conv.user_id
                  ? theme === "dark"
                    ? "bg-emerald-500/20 border-l-4 border-emerald-500"
                    : "bg-blue-500/20 border-l-4 border-blue-500"
                  : theme === "dark"
                  ? "hover:bg-zinc-800/50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm sm:text-base">
                  {getInitials(conv.username)}
                </div>
                {/* <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                    theme === "dark" ? "border-zinc-900" : "border-white"
                  } ${
                    conv.status === "online" ? "bg-emerald-500" : "bg-zinc-500"
                  }`}
                ></div> */}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="truncate text-sm sm:text-base text-gray-900 dark:text-white">
                    {conv.username}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-zinc-500 ml-2 flex-shrink-0">
                    {conv.send_at}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm truncate text-gray-600 dark:text-zinc-400">
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-white flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm">
              {getInitials(activeChat?.username)}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white dark:border-zinc-900"></div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              {activeChat?.username}
            </h3>
          </div>
        </div>

        {/* Messages Area */}
        {loadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-y-auto p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md ${
                    message.sender_id === user.id ? "order-2" : "order-1"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base ${
                      message.sender_id === user.id
                        ? "bg-emerald-500 text-white rounded-br-sm"
                        : theme === "dark"
                        ? "bg-zinc-800 text-white rounded-bl-sm"
                        : "bg-gray-200 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <p
                    className={`text-xs mt-1 text-gray-500 dark:text-zinc-500 ${
                      message.sender_id === user.id ? "text-right" : "text-left"
                    }`}
                  >
                    {message.send_at}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors ${
                theme === "dark"
                  ? "bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
              } outline-none`}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
