import React, { useState } from "react";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "../contexts/ThemeProvider";
import { useUser } from "../contexts/UserProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { getInitials } from "@/utils/Username";

const MobileNav = ({ navItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = theme === "dark";

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const isActive = (path) => {
    if (path === "/" || path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname.includes(path);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm">
              {getInitials(user?.username)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.username}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-all ${
              isDarkMode
                ? "hover:bg-zinc-800 text-zinc-300"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 mt-[73px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed top-[73px] right-0 bottom-0 w-64 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${
          isDarkMode
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-gray-200"
        } border-l shadow-xl`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Theme Toggle */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-zinc-800">
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-zinc-300">
                Theme
              </span>
              <div className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-zinc-400" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? isDarkMode
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                      : isDarkMode
                      ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="md:hidden h-[73px]" />
    </>
  );
};

export default MobileNav;
