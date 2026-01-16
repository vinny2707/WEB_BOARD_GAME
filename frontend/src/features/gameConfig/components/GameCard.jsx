import React from "react";
import { Edit, Trash2, ToggleLeft, ToggleRight, Eye } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeProvider";

/**
 * GameCard Component - Card with gradient header, content, and footer with action buttons
 */
const GameCard = ({ game, onView, onEdit, onToggle, onDelete }) => {
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
      className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isDarkMode
          ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
          : "bg-white border border-gray-200 hover:border-gray-300 shadow-md"
      } ${!game.enabled ? "opacity-70" : ""}`}
    >
      {/* Header - Gradient with Icon */}
      <div
        onClick={() => onView(game)}
        className={`relative h-40 bg-gradient-to-br ${getGradient(game.type)} cursor-pointer overflow-hidden`}
      >
        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl" />
        
        {/* Grid pattern */}
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

        {/* Centered Icon */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          {game.icon ? (
            <img
              src={game.icon}
              alt={game.name}
              className="w-20 h-20 object-contain drop-shadow-xl"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white shadow-lg"
            style={{ display: game.icon ? "none" : "flex" }}
          >
            {game.name?.charAt(0)?.toUpperCase() || "G"}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow ${
              game.enabled
                ? "bg-emerald-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {game.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        {/* Click to view hint */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/40 text-white backdrop-blur-sm">
            <Eye className="w-3 h-3" /> View
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={`font-semibold text-lg mb-1 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {game.name}
        </h3>
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-mono mb-2 ${
            isDarkMode
              ? "bg-zinc-800 text-zinc-400"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {game.type}
        </span>
        <p
          className={`text-sm line-clamp-2 ${
            isDarkMode ? "text-zinc-400" : "text-gray-600"
          }`}
        >
          {game.description || "No description available."}
        </p>
      </div>

      {/* Footer - Action Buttons */}
      <div
        className={`flex items-center justify-end gap-1 px-4 py-3 border-t ${
          isDarkMode ? "border-zinc-800" : "border-gray-100"
        }`}
      >
        <button
          onClick={() => onEdit(game)}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            isDarkMode
              ? "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
              : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
          }`}
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggle(game)}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            game.enabled
              ? isDarkMode
                ? "hover:bg-amber-500/20 text-amber-400 hover:text-amber-300"
                : "hover:bg-amber-50 text-amber-600 hover:text-amber-700"
              : isDarkMode
              ? "hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
              : "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
          }`}
          title={game.enabled ? "Disable" : "Enable"}
        >
          {game.enabled ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => onDelete(game)}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            isDarkMode
              ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
              : "hover:bg-red-50 text-red-600 hover:text-red-700"
          }`}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GameCard;
