import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeProvider.jsx";
import { useUser } from "../../../contexts/UserProvider.jsx";
import {
  Gamepad2,
  Trophy,
  Users,
  Sparkles,
  ChevronRight,
  Play,
  Crown,
  Zap,
  Target,
  ArrowRight,
  Star,
  Moon,
  Sun,
} from "lucide-react";
import api from "../../../api/axios.js";

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useUser();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDarkMode = theme === "dark";

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.get("/api/games", {
        params: { enabled: true, limit: 6 },
      });
      setGames(response.data.data.games || []);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    // Always navigate to games, even for guests
    navigate("/games");
  };

  const features = [
    {
      icon: Gamepad2,
      title: "Multiple Games",
      description: "Play various classic board games in one platform",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Trophy,
      title: "Compete & Rank",
      description: "Climb the leaderboard and become the champion",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Users,
      title: "Social Play",
      description: "Connect with friends and challenge them",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Sparkles,
      title: "Achievements",
      description: "Unlock badges and track your progress",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                RetroGames
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title={isDarkMode ? "Light mode" : "Dark mode"}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Get Started Button */}
              <button
                onClick={handleGetStarted}
                className="px-6 py-2 rounded-lg cursor-pointer bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                {isAuthenticated ? "Go to Games" : "Play Now"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/3 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                #1 Board Game Platform
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
                <span className="block text-gray-900 dark:text-white">
                  Play Classic Games
                </span>
                <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Anytime, Anywhere
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-zinc-400">
                Experience the nostalgia of classic board games with modern
                features. Compete with friends, climb the ranks, and become the
                ultimate champion.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Playing Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/games")}
                className="px-8 py-4 cursor-pointer rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold text-lg border-2 border-gray-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300"
              >
                View Games
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              We provide the best gaming experience with modern features and
              classic gameplay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl dark:hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Showcase Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Popular Games
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose from our collection of classic board games
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={handleGetStarted}
                >
                  {/* Game Icon/Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10 flex items-center justify-center border-b border-gray-200 dark:border-slate-700">
                    <Gamepad2 className="w-20 h-20 text-blue-600 dark:text-blue-400" />
                  </div>

                  {/* Game Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {game.name}
                      </h3>
                      {game.is_popular && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30">
                          <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            Popular
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                      {game.description || "Experience classic board game fun"}
                    </p>

                    {/* Play Button */}
                    <button className="w-full cursor-pointer py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                      <Play className="w-4 h-4" />
                      Play Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="inline-flex cursor-pointer items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              View All Games
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-600 dark:to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">
            Ready to Start Playing?
          </h2>
          <p className="text-xl text-emerald-50 dark:text-emerald-100">
            Join thousands of players and experience the best board games online
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex cursor-pointer items-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-cyan-400 font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-transparent dark:border-slate-700"
          >
            <Zap className="w-5 h-5" />
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  RetroGames
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                The ultimate platform for classic board games
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Games
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    All Games
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Popular
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    New Releases
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Community
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Leaderboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Achievements
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Friends
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Support
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-200 dark:border-zinc-800 text-center text-sm text-gray-600 dark:text-zinc-400">
            <p>© 2026 RetroGames. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
