import React from "react";
import { useTheme } from "../contexts/ThemeProvider.jsx";
import { useState, useEffect } from "react";
import {
  Users,
  BarChart3,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  House,
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
        isDarkMode ? "border-slate-700" : "border-gray-200"
      } relative overflow-hidden flex flex-col hidden md:flex`}
      style={{
        background: isDarkMode
          ? "rgba(30, 41, 59, 0.7)"
          : "rgba(249, 250, 251, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="p-4">
        {/* Top Section: Theme Toggle & Collapse Button */}
        <div
          className={`mb-6 pb-6 border-b border-gray-200 dark:border-slate-700 flex items-center ${
            isCollapsed ? "flex-col gap-3 justify-center" : "justify-between"
          }`}
        >
          {/* Toggle Collapse Button */}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              isDarkMode
                ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
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

          {/* Button Home */}
          <button
            onClick={() => navigate("/games")}
            className={`p-2 rounded-lg transition-all flex-shrink-0 cursor-pointer ${isDarkMode
                ? "hover:bg-slate-700/50 text-slate-400 hover:text-blue-400"
                : "hover:bg-gray-200/50 text-gray-600 hover:text-blue-600"
              }`}
            title="Go to Home"
          >
            <House className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Badge */}
        <div className={`mb-8 text-center ${isCollapsed ? "hidden" : ""}`}>
          <div className="inline-block px-4 py-2 rounded-xl dark:bg-blue-500/20 border-2 dark:border-blue-500/30 mb-4 bg-blue-500/20 text-blue-600 border-blue-500/30">
            <h1 className="dark:text-blue-400 text-blue-600 tracking-[0.2em] text-sm">
              ADMIN PANEL
            </h1>
          </div>
          <p className="text-slate-400 text-sm">Administrator Access</p>
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
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                  : isDarkMode
                  ? "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
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
                    isDarkMode ? "bg-blue-500" : "bg-blue-500"
                  }`}
                ></div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Admin_Sidebar;
