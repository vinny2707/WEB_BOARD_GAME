import React from "react";
import { Gamepad2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeProvider";
import { Link } from "react-router-dom";

/**
 * Pro Max Footer - Beautiful footer with gradients and modern design
 */
const AppFooter = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const currentYear = new Date().getFullYear();

  const gameLinks = [
    { name: "Caro 5 in a Row", path: "/games" },
    { name: "Caro 4 in a Row", path: "/games" },
    { name: "Tic-Tac-Toe", path: "/games" },
    { name: "Snake Game", path: "/games" },
    { name: "Memory Cards", path: "/games" },
  ];

  const communityLinks = [
    { name: "Leaderboard", path: "/ranking" },
    { name: "Friends", path: "/social" },
    { name: "Achievements", path: "/profile" },
    { name: "Game History", path: "/profile" },
  ];

  const supportLinks = [
    { name: "Help Center", path: "#" },
    { name: "Terms of Service", path: "#" },
    { name: "Privacy Policy", path: "#" },
  ];

  const teamMembers = [
    { name: "Trần Quốc Vỹ", id: "23120410", avatarUrl: "https://papergames.io/en/assets/images/avatars/c2f5609f-b81f-4de4-a544-5eae4d6d9180.svg" },
    { name: "Nguyễn Khắc Vượng", id: "23120409", avatarUrl: "https://papergames.io/en/assets/images/avatars/77da7063-2e60-4f9f-ae60-dbc9e2df9cef.svg" },
    { name: "Cao Quốc Tý", id: "23120400", avatarUrl: "https://papergames.io/en/assets/images/avatars/8d5a0ef8-a68d-478c-85f7-e7c3e1113688.svg" },
    { name: "Trần Ngọc Diễm Thúy", id: "23120367", avatarUrl: "https://papergames.io/en/assets/images/avatars/11610f96-1c63-4091-9699-c735e304125f.svg" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative">
        {/* Top Border Gradient */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent">
                    RetroGames
                  </h3>
                  <p className={`text-xs font-medium ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                    Play • Compete • Win
                  </p>
                </div>
              </div>

              <p
                className={`text-sm leading-relaxed max-w-sm ${
                  isDarkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                The ultimate platform for classic board games. Challenge friends, climb the leaderboards, and relive the golden era of gaming.
              </p>

              {/* Stats */}
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                    7+
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}>Games</p>
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                    1K+
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}>Players</p>
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    24/7
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}>Online</p>
                </div>
              </div>
            </div>

            {/* Games Links */}
            <div>
              <h4
                className={`font-bold text-sm uppercase tracking-wider mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Games
              </h4>
              <ul className="space-y-2.5">
                {gameLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`text-sm transition-all hover:translate-x-1 inline-block ${
                        isDarkMode
                          ? "text-slate-400 hover:text-emerald-400"
                          : "text-gray-600 hover:text-emerald-600"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h4
                className={`font-bold text-sm uppercase tracking-wider mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Community
              </h4>
              <ul className="space-y-2.5">
                {communityLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`text-sm transition-all hover:translate-x-1 inline-block ${
                        isDarkMode
                          ? "text-slate-400 hover:text-cyan-400"
                          : "text-gray-600 hover:text-cyan-600"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4
                className={`font-bold text-sm uppercase tracking-wider mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Support
              </h4>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`text-sm transition-all hover:translate-x-1 inline-block ${
                        isDarkMode
                          ? "text-slate-400 hover:text-purple-400"
                          : "text-gray-600 hover:text-purple-600"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Team Section */}
          <div
            className={`rounded-2xl p-6 mb-8 ${
              isDarkMode
                ? "bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-700/50"
                : "bg-gradient-to-r from-gray-100 to-white border border-gray-200"
            }`}
          >
            <h4
              className={`font-bold text-sm uppercase tracking-wider mb-4 text-center ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Development Team
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`group flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                    isDarkMode
                      ? "bg-slate-700/50 hover:bg-slate-600/50"
                      : "bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center overflow-hidden">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.65]"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {member.name}
                    </p>
                    <p
                      className={`text-xs font-mono ${
                        isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      {member.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            className={`h-px ${
              isDarkMode
                ? "bg-gradient-to-r from-transparent via-slate-700 to-transparent"
                : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
            }`}
          />

          {/* Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className={`text-sm ${
                isDarkMode ? "text-slate-500" : "text-gray-500"
              }`}
            >
              © {currentYear} RetroGames. All rights reserved.
            </p>
            <p className="text-sm">
              <span className={isDarkMode ? "text-slate-500" : "text-gray-500"}>
                Made with{" "}
              </span>
              <span className="text-red-500">❤</span>
              <span className={isDarkMode ? "text-slate-500" : "text-gray-500"}>
                {" "}by{" "}
              </span>
              <span className="font-bold bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent">
                HCMUS Students
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
