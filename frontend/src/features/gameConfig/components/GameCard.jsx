import React from "react";
import { Edit, Eye, Trash2, ToggleLeft, ToggleRight, Grid3X3 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeProvider";

/**
 * GameCard Component - Modern card with large image, glassmorphism, and hover effects
 */
const GameCard = ({ game, index, onView, onEdit, onToggle, onDelete }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Generate gradient based on game type
  const getGradient = (type) => {
    const gradients = {
      caro_5: "from-emerald-500 to-teal-600",
      caro_4: "from-cyan-500 to-blue-600",
      tictactoe: "from-indigo-500 to-purple-600",
      snake: "from-green-500 to-lime-600",
      match3: "from-pink-500 to-rose-600",
      memory_cards: "from-orange-500 to-amber-600",
      drawing_board: "from-violet-500 to-fuchsia-600",
    };
    return gradients[type] || "from-gray-500 to-slate-600";
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        isDarkMode
          ? "bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600"
          : "bg-white border border-gray-200 hover:border-gray-300 shadow-lg"
      } ${!game.enabled ? "opacity-60 grayscale-[30%]" : ""}`}
    >
      {/* Image/Icon Section - Large */}
      <div
        className={`relative h-48 bg-gradient-to-br ${getGradient(game.type)} overflow-hidden`}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Game Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {game.icon ? (
            <img
              src={game.icon}
              alt={game.name}
              className="w-24 h-24 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl font-bold text-white shadow-xl transition-transform duration-300 group-hover:scale-110`}
            style={{ display: game.icon ? "none" : "flex" }}
          >
            {game.name?.charAt(0)?.toUpperCase() || "G"}
          </div>
        </div>

        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-lg ${
              game.enabled
                ? "bg-emerald-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {game.enabled ? "● Enabled" : "○ Disabled"}
          </span>
        </div>

        {/* Index Badge - Top Left */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/30 text-white backdrop-blur-md">
            #{index}
          </span>
        </div>

        {/* Board Size Badge - Bottom Right */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-medium">
          <Grid3X3 className="w-3.5 h-3.5" />
          {game.rows || "?"} × {game.cols || "?"}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title & Type */}
        <div className="mb-3">
          <h3
            className={`font-bold text-xl mb-1 cursor-pointer hover:underline transition-colors ${
              isDarkMode ? "text-white hover:text-emerald-400" : "text-gray-900 hover:text-blue-600"
            }`}
            onClick={() => onView(game)}
          >
            {game.name}
          </h3>
          <span
            className={`inline-block px-2 py-0.5 rounded-md text-xs font-mono ${
              isDarkMode
                ? "bg-zinc-800 text-zinc-400"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {game.type}
          </span>
        </div>

        {/* Description */}
        <p
          className={`text-sm line-clamp-2 mb-4 leading-relaxed ${
            isDarkMode ? "text-zinc-400" : "text-gray-600"
          }`}
        >
          {game.description || "No description available for this game."}
        </p>

        {/* Action Buttons */}
        <div
          className={`flex items-center justify-between pt-4 border-t ${
            isDarkMode ? "border-zinc-800" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(game)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isDarkMode
                  ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              }`}
              title="View details"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(game)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isDarkMode
                  ? "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                  : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
              }`}
              title="Edit game"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggle(game)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                game.enabled
                  ? isDarkMode
                    ? "hover:bg-amber-500/20 text-amber-400 hover:text-amber-300"
                    : "hover:bg-amber-50 text-amber-600 hover:text-amber-700"
                  : isDarkMode
                  ? "hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
                  : "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
              }`}
              title={game.enabled ? "Disable game" : "Enable game"}
            >
              {game.enabled ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => onDelete(game)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isDarkMode
                  ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                  : "hover:bg-red-50 text-red-600 hover:text-red-700"
              }`}
              title="Delete game"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          isDarkMode
            ? "shadow-[inset_0_0_40px_rgba(16,185,129,0.1)]"
            : "shadow-[inset_0_0_40px_rgba(59,130,246,0.1)]"
        }`}
      />
    </div>
  );
};

export default GameCard;
