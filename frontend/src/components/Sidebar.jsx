import React from 'react'
import { useTheme } from '../contexts/ThemeProvider.jsx';
import { useState } from 'react';
import {
  Sun,
  Moon,
  Trophy,
  MessageSquare,
  Settings,
  Gamepad2,
  Users,
  User
} from "lucide-react";
import { useUser } from '../contexts/UserProvider.jsx';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const [currentPage, setCurrentPage] = useState("/");
  const { user } = useUser();
  const navigate = useNavigate();
  
  const onToggleTheme = () => {
    toggleTheme();
    setIsDarkMode(!isDarkMode);
  };

  const navItems = [
    {
      icon: Gamepad2,
      label: "Games",
      page: "/",
      active: currentPage === "/",
    },
    {
      icon: Trophy,
      label: "Ranking",
      page: "ranking",
      active: currentPage === "ranking",
    },
    {
      icon: Users,
      label: "Social",
      page: "social",
      active: currentPage === "social",
      badge: 3,
    },
    {
      icon: User,
      label: "Profile",
      page: "profile",
      active: currentPage === "profile",
    },
  ];

  const getInitials = (name) => {
    const names = name.split(" ");
    if (names.length === 1) return (names[0][0] + names[0][names[0].length - 1]).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const onClickItem = (page) => {
    setCurrentPage(page);
    navigate(page);
  }

  return (
    <aside
      className={`w-1/5 border-r ${
        isDarkMode ? "border-zinc-800" : "border-gray-200"
      } relative overflow-hidden flex flex-col`}
      style={{
        background: isDarkMode
          ? "rgba(24, 24, 27, 0.6)"
          : "rgba(249, 250, 251, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Glassmorphism overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDarkMode
            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)"
            : "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)",
        }}
      ></div>

      <div className="relative h-full flex flex-col p-6">
        {/* Top Section: Notification & Theme Toggle Only */}
        <div
          className={`mb-6 pb-6 border-b border-gray-200 dark:border-zinc-800`}
        >
          {/* Notification & Theme Toggle */}
          <div className="flex items-center justify-end gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="relative w-14 h-7 rounded-full transition-colors bg-gray-300 dark:bg-zinc-700 cursor-pointer"
            >
              <div
                className={`absolute top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-md transition-transform translate-x-0.5 dark:translate-x-7`}
              >
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-zinc-900" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* User Avatar Section */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate("profile")}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: isDarkMode
                ? "rgba(39, 39, 42, 0.5)"
                : "rgba(255, 255, 255, 0.7)",
              border: `1px solid ${
                isDarkMode
                  ? "rgba(82, 82, 91, 0.3)"
                  : "rgba(229, 231, 235, 0.5)"
              }`,
            }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-white">{getInitials(user.username)}</span>
            </div>
            <div className="text-left">
              <h3 className="dark:text-white text-gray-900">{user.username}</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => onClickItem(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group cursor-pointer ${
                  item.active
                    ? isDarkMode
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                    : isDarkMode
                    ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-white">
                    {item.badge}
                  </span>
                )}

                {item.active && (
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${
                      isDarkMode ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                  ></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-zinc-800">
          <div
            className="text-xs text-gray-400 dark:text-zinc-500 text-center space-y-2"
          >
            <p>Gaming Platform v1.0</p>
            <p className="mt-1">© 2026 RetroGames</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar