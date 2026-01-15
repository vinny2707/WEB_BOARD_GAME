import React from "react";
import { useTheme } from "../contexts/ThemeProvider.jsx";
import { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Trophy,
  Gamepad2,
  Users,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Music,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { useUser } from "../contexts/UserProvider.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const [currentPage, setCurrentPage] = useState("/");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef(null);
  const audioRef = useRef(null);
  const { user, logout, loading, isAdmin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync currentPage with the actual route
  useEffect(() => {
    const path =
      location.pathname === "/" ? "/" : location.pathname.replace("/", "");
    setCurrentPage(path);
  }, [location.pathname]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle background music
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicEnabled) {
        audioRef.current.play().catch((err) => {
          console.log("Audio play failed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicEnabled]);

  const onToggleTheme = () => {
    toggleTheme();
    setIsDarkMode(!isDarkMode);
  };

  const navItems = [
    {
      icon: Gamepad2,
      label: "Games",
      page: "/",
      active: currentPage === "/" || currentPage === "",
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
    if (!name) return "";

    const names = name.split(" ");
    if (names.length === 1)
      return (names[0][0] + names[0][names[0].length - 1]).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const onClickItem = (page) => {
    setCurrentPage(page);
    navigate(page);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (loading) {
    return (
      <aside
        className={`border-r transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "max-w-1/4"
        } ${
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
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`border-r transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64 md:max-w-1/4"
      } ${
        isDarkMode ? "border-zinc-800" : "border-gray-200"
      } relative overflow-visible flex flex-col hidden md:flex z-40`}
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

      <div className="relative h-full flex flex-col p-4">
        {/* Top Section: Toggle, Notification & Settings */}
        <div
          className={`mb-6 pb-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between ${
            isCollapsed ? "flex-col gap-3" : ""
          }`}
        >
          {/* Toggle Collapse Button */}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              isDarkMode
                ? "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
                : "hover:bg-gray-200/50 text-gray-600 hover:text-gray-900"
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          {/* Action Icons (Notification & Settings) */}
          <div className={`flex items-center gap-1 ${isCollapsed ? "flex-col" : "flex-row"}`}>
            {/* Notification Bell
            <button
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isDarkMode
                  ? "hover:bg-zinc-800/50 text-zinc-400 hover:text-emerald-400"
                  : "hover:bg-gray-200/50 text-gray-600 hover:text-blue-600"
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button> */}

            {/* Settings with Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  showSettingsMenu
                    ? isDarkMode
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-blue-500/20 text-blue-600"
                    : isDarkMode
                    ? "hover:bg-zinc-800/50 text-zinc-400 hover:text-emerald-400"
                    : "hover:bg-gray-200/50 text-gray-600 hover:text-blue-600"
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Settings Dropdown Menu */}
              {showSettingsMenu && (
                <div
                  className={`absolute right-0 top-full mt-2 w-60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl ${
                    isDarkMode
                      ? "bg-zinc-800/95 border border-zinc-700/50"
                      : "bg-white/95 border border-gray-200/50"
                  }`}
                  style={{
                    boxShadow: isDarkMode
                      ? "0 20px 60px rgba(0, 0, 0, 0.5)"
                      : "0 20px 60px rgba(0, 0, 0, 0.15)",
                    zIndex: 9999,
                  }}
                >
                  {/* Dark Mode Toggle */}
                  <div
                    className={`px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      isDarkMode ? "hover:bg-zinc-700/50" : "hover:bg-gray-50"
                    }`}
                    onClick={onToggleTheme}
                  >
                    <div className="flex items-center gap-3">
                      {isDarkMode ? (
                        <div className="w-9 h-9 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-blue-400" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                          <Sun className="w-5 h-5 text-amber-500" />
                        </div>
                      )}
                      <div>
                        <span
                          className={`text-sm font-medium block ${
                            isDarkMode ? "text-zinc-100" : "text-gray-900"
                          }`}
                        >
                          {isDarkMode ? "Dark Mode" : "Light Mode"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-zinc-500">
                          {isDarkMode ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`relative w-11 h-6 rounded-full transition-all ${
                        isDarkMode ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                          isDarkMode ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className={`h-px mx-3 ${
                      isDarkMode ? "bg-zinc-700/50" : "bg-gray-200/50"
                    }`}
                  ></div>

                  {/* Background Music Toggle */}
                  <div
                    className={`px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      isDarkMode ? "hover:bg-zinc-700/50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMusicEnabled(!isMusicEnabled)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isMusicEnabled
                            ? isDarkMode
                              ? "bg-emerald-500/20"
                              : "bg-emerald-50"
                            : isDarkMode
                            ? "bg-zinc-700/50"
                            : "bg-gray-100"
                        }`}
                      >
                        <Music
                          className={`w-5 h-5 ${
                            isMusicEnabled
                              ? "text-emerald-500"
                              : isDarkMode
                              ? "text-zinc-400"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <span
                          className={`text-sm font-medium block ${
                            isDarkMode ? "text-zinc-100" : "text-gray-900"
                          }`}
                        >
                          Music
                        </span>
                        <span className="text-xs text-gray-500 dark:text-zinc-500">
                          {isMusicEnabled ? "Playing" : "Paused"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`relative w-11 h-6 rounded-full transition-all ${
                        isMusicEnabled
                          ? "bg-emerald-500"
                          : isDarkMode
                          ? "bg-zinc-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
                          isMusicEnabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Avatar Section */}
        <div className={`mb-6 ${isCollapsed ? "hidden" : ""}`}>
          <div
            className="w-full rounded-2xl overflow-hidden backdrop-blur-xl"
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, rgba(39, 39, 42, 0.8) 0%, rgba(24, 24, 27, 0.9) 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.95) 100%)",
              border: `1px solid ${
                isDarkMode
                  ? "rgba(82, 82, 91, 0.4)"
                  : "rgba(229, 231, 235, 0.6)"
              }`,
              boxShadow: isDarkMode
                ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                : "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Avatar and User Info */}
            <button
              onClick={() => onClickItem("profile")}
              className="w-full p-4 transition-all hover:bg-white/5 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                {/* Avatar with Admin Badge */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all"
                    style={{
                      background: isAdmin
                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      ringColor: isAdmin
                        ? "rgba(245, 158, 11, 0.3)"
                        : "rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <span className="text-white text-base font-bold">
                      {getInitials(user.username)}
                    </span>
                  </div>
                  {/* Admin Crown Badge */}
                  {isAdmin && (
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      }}
                    >
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="dark:text-white text-gray-900 font-bold text-base truncate">
                      {user.username}
                    </h3>
                    {isAdmin && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src="/sounds/background-music.mp3"
          loop
          preload="auto"
        />

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
                } ${isCollapsed ? "justify-center" : "justify-start"}`}
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {item.active && (
                  <div
                    className={`absolute left-0 w-1 h-8 rounded-r-full top-1/2 -translate-y-1/2 ${
                      isDarkMode ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                  ></div>
                )}
              </button>
            );
          })}

          {/* Admin Management Button */}
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group cursor-pointer ${
                location.pathname.startsWith("/admin")
                  ? isDarkMode
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                  : isDarkMode
                  ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
              } ${isCollapsed ? "justify-center" : "justify-start"} mt-8`}
              title={isCollapsed ? "Management" : ""}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="flex-1 text-left">Management</span>
              )}
              {location.pathname.startsWith("/admin") && (
                <div
                  className={`absolute left-0 w-1 h-8 rounded-r-full top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                ></div>
              )}
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 dark:hover:bg-red-500/20 bg-red-500/10 dark:hover:text-red-300 hover:bg-red-500/20 transition-all cursor-pointer ${
              isCollapsed ? "justify-center" : "justify-start"
            } ${isAdmin ? "mt-2" : "mt-8"}`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left">Logout</span>}
          </button>
        </nav>

        {/* Footer */}
        <div
          className={`mt-auto pt-6 border-t border-gray-200 dark:border-zinc-800 ${
            isCollapsed ? "hidden" : ""
          }`}
        >
          <div className="text-xs text-gray-400 dark:text-zinc-500 text-center space-y-2">
            <p>Gaming Platform v1.0</p>
            <p className="mt-1">© 2026 RetroGames</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
