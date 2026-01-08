import React from 'react'
import { useState, useEffect } from 'react'
import { useTheme } from "@/contexts/ThemeProvider";
import FriendCard from '../components/FriendCard';
import { UserPlus, Search } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getInitials } from '@/utils/Username';
import Message from './Message';

const social = () => {
  const [scopeTab, setScopeTab] = useState('friends')
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data 
  const friendsList = [
    {
      id: 1,
      username: "John Doe",
      full_name: "Johnathan Doe"
    },
    {
      id: 2,
      username: "Jane Smith",
      full_name: "Janette Smith"
    },
    {
      id: 3,
      username: "Alice Johnson",
      full_name: "Alice Marie Johnson"
    }
  ]

  const friendRequestsList = [
    {
      id: 4,
      username: "Bob Brown",
      full_name: "Robert Brown"
    },
    {
      id: 5,
      username: "Charlie Davis",
      full_name: "Charles Davis"
    },
    {
      id: 6,
      username: "Eve Wilson",
      full_name: "Evelyn Wilson"
    }
  ]
  const searchResults = [
    {
      id: 7,
      username: "Frank Miller",
      full_name: "Franklin Miller"
    },
    {
      id: 8,
      username: "Grace Lee",
      full_name: "Gracia Lee"
    },
    {
      id: 9,
      username: "Hank Taylor",
      full_name: "Henry Taylor"
    },
    {
      id: 10,
      username: "Ivy Anderson",
      full_name: "Ivanna Anderson"
    },
    {
      id: 11,
      username: "Jack Thomas",
      full_name: "Jackson Thomas"
    },
    {
      id: 12,
      username: "Kathy Moore",
      full_name: "Katherine Moore"
    }
  ]
  

  const handleAddFriend = (friendId) => {

  }

  return (
    <div className="w-full flex-1 p-6 flex justify-center items-start dark:bg-zinc-900/50 h-screen">
      <div className="w-full h-full flex flex-col gap-2">
        {/* Scope Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-gray-100 dark:bg-zinc-800/50">
          <button
            onClick={() => setScopeTab("friends")}
            className={`flex-1 py-3 px-4 rounded-lg transition-all cursor-pointer ${
              scopeTab === "friends"
                ? "bg-emerald-500 text-white shadow-lg"
                : theme === "dark"
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setScopeTab("friendRequests")}
            className={`flex-1 py-3 px-4 rounded-lg transition-all cursor-pointer ${
              scopeTab === "friendRequests"
                ? "bg-emerald-500 text-white shadow-lg"
                : theme === "dark"
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Friend Requests
          </button>
          <button
            onClick={() => setScopeTab("messages")}
            className={`flex-1 py-3 px-4 rounded-lg transition-all cursor-pointer ${
              scopeTab === "message"
                ? "bg-emerald-500 text-white shadow-lg"
                : theme === "dark"
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Messages
          </button>
        </div>

        <hr className="my-4 border-gray-300 dark:border-zinc-700" />

        {/* Content Area */}
        {scopeTab === "friends" && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold mb-4">All Friends</h3>

              <Dialog>
                <DialogTrigger>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-emerald-500 cursor-pointer text-emerald-500 hover:bg-emerald-500 hover:text-white dark:border-emerald-500 dark:text-emerald-400 transition-all flex items-center justify-center"
                      >
                        <UserPlus />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add new friend</p>
                    </TooltipContent>
                  </Tooltip>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                    <DialogDescription>
                      Search for friends by their username and send them a
                      friend request.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Enter username to search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-colors ${
                          theme === "dark"
                            ? "bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500"
                            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                        } outline-none`}
                      />
                    </div>

                    <div>
                      <h3 className="mb-4 text-gray-600 dark:text-zinc-400">
                        Search Results
                      </h3>
                      <div className="flex flex-col gap-4 overflow-auto max-h-96">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 border-gray-200 dark:bg-zinc-800/50 dark:border-zinc-700"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                                {getInitials(user.username)}
                              </div>
                              <div>
                                <h4 className="text-gray-900 dark:text-white ">
                                  {user.username}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">
                                  {user.full_name}
                                </p>
                              </div>
                            </div>

                            <button
                              className="py-2 px-6 rounded-lg border-2 border-emerald-500 cursor-pointer text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                              onClick
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Friend
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Friends List */}
            <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {friendsList.map((friend) => (
                <FriendCard
                  key={friend.id}
                  id={friend.id}
                  username={friend.username}
                  fullName={friend.full_name}
                />
              ))}
            </div>
          </>
        )}

        {scopeTab === "friendRequests" && (
          <>
            <h3 className="text-xl font-semibold mb-4">Friend Requests</h3>

            {/* Friend Requests List */}
            <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {friendRequestsList.map((request) => (
                <FriendCard
                  key={request.id}
                  id={request.id}
                  username={request.username}
                  fullName={request.full_name}
                  isFriend={false}
                />
              ))}
            </div>
          </>
        )}

        {scopeTab === "messages" && <Message />}
      </div>
    </div>
  );
}

export default social