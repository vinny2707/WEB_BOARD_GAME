import React from "react";
import { useTheme } from "../contexts/ThemeProvider.jsx";
import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Users,
  BarChart3,
  Gamepad2,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "../contexts/UserProvider.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const Admin_Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const [activeSection, setActiveSection] = useState("/");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync activeSection with the actual route
  useEffect(() => {
    const path = location.pathname.replace(/\/admin\/?/, "") || "/";
    setActiveSection(path);
  }, [location.pathname]);

  const onToggleTheme = () => {
    toggleTheme();
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    {
      icon: Users,
      label: "User Management",
      page: "/",
      active: activeSection === "/" || activeSection === "",
    },
    {
      icon: BarChart3,
      label: "Statistics",
      page: "statistics",
      active: activeSection === "statistics",
    },
    {
      icon: Gamepad2,
      label: "Game Config",
      page: "game-config",
      active: activeSection === "game-config",
    },
    {
      icon: User,
      label: "Profile",
      page: "profile",
      active: activeSection === "profile",
    },
  ];

  const handleItemClick = (page) => {
    setActiveSection(page);
    navigate(page === "/" ? "/admin" : `/admin/${page}`);
  };

  return (
    <aside
      className={`border-r transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64 md:min-w-[250px] md:max-w-1/5"
      } ${
        isDarkMode ? "border-zinc-800" : "border-gray-200"
      } relative overflow-hidden flex flex-col hidden md:flex`}
      style={{
        background: isDarkMode
          ? "rgba(24, 24, 27, 0.6)"
          : "rgba(249, 250, 251, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="p-4">
        {/* Top Section: Theme Toggle & Collapse Button */}
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

        {/* Admin Badge */}
        <div className={`mb-8 text-center ${isCollapsed ? "hidden" : ""}`}>
          <div className="inline-block px-4 py-2 rounded-xl dark:bg-emerald-500/20 border-2 dark:border-emerald-500/30 mb-4 bg-blue-500/20 text-blue-600 border-blue-500/30">
            <h1 className="dark:text-emerald-400 text-blue-600 tracking-[0.2em] text-sm">
              ADMIN PANEL
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">Administrator Access</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group cursor-pointer ${
                activeSection === item.page
                  ? isDarkMode
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                  : isDarkMode
                  ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
              } ${isCollapsed ? "justify-center" : "justify-start"}`}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {activeSection === item.page && (
                <div
                  className={`absolute ${
                    isCollapsed
                      ? "right-0 w-1 h-6 rounded-l-full"
                      : "left-0 w-1 h-8 rounded-r-full"
                  } top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                ></div>
              )}
            </button>
          ))}

          {/* Logout Button */}
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 dark:hover:bg-red-500/20 bg-red-500/10 dark:hover:text-red-300 hover:bg-red-500/20 transition-all mt-8 cursor-pointer ${
              isCollapsed ? "justify-center" : "justify-start"
            }`}
            onClick={() => logout()}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left">Logout</span>}
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Admin_Sidebar;
