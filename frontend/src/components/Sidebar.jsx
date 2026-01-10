import React from "react";
import { useTheme } from "../contexts/ThemeProvider.jsx";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useUser } from "../contexts/UserProvider.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const [currentPage, setCurrentPage] = useState("/");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync currentPage with the actual route
  useEffect(() => {
    const path =
      location.pathname === "/" ? "/" : location.pathname.replace("/", "");
    setCurrentPage(path);
  }, [location.pathname]);

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
        {/* Top Section: Theme Toggle */}
        <div
          className={`mb-6 pb-6 border-b border-gray-200 dark:border-zinc-800 flex items-center ${
            isCollapsed ? "flex-col gap-3 justify-center" : "justify-between"
          }`}
        >
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`relative rounded-full transition-colors bg-gray-300 dark:bg-zinc-700 cursor-pointer flex-shrink-0 ${
              isCollapsed ? "w-10 h-5" : "w-14 h-7"
            }`}
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            <div
              className={`absolute top-0.5 flex items-center justify-center rounded-full bg-white shadow-md transition-all ${
                isCollapsed
                  ? "w-4 h-4 dark:translate-x-5"
                  : "w-6 h-6 dark:translate-x-7"
              } translate-x-0.5`}
            >
              {isDarkMode ? (
                <Moon className="w-3 h-3 text-zinc-900" />
              ) : (
                <Sun className="w-3 h-3 text-yellow-500" />
              )}
            </div>
          </button>

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
        </div>

        {/* User Avatar Section */}
        <div className={`mb-8 ${isCollapsed ? "hidden" : ""}`}>
          <button
            onClick={() => onClickItem("profile")}
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
            <div className="w-12 min-w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
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

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200 text-gray-600 hover:bg-gray-200/50 hover:text-gray-900`}
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
