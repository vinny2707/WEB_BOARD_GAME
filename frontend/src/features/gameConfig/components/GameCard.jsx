import React from "react";
import { Edit, Trash2, ToggleLeft, ToggleRight, Gamepad2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeProvider";

/**
 * Generate a color based on string hash (consistent per game)
 */
const stringToColor = (str) => {
  const colors = [
    { from: "from-rose-400", via: "via-pink-500", to: "to-fuchsia-600" },
    { from: "from-violet-400", via: "via-purple-500", to: "to-indigo-600" },
    { from: "from-blue-400", via: "via-cyan-500", to: "to-teal-600" },
    { from: "from-emerald-400", via: "via-green-500", to: "to-lime-600" },
    { from: "from-amber-400", via: "via-orange-500", to: "to-red-600" },
    { from: "from-cyan-400", via: "via-blue-500", to: "to-indigo-600" },
    { from: "from-pink-400", via: "via-rose-500", to: "to-orange-600" },
    { from: "from-teal-400", via: "via-emerald-500", to: "to-green-600" },
    { from: "from-indigo-400", via: "via-violet-500", to: "to-purple-600" },
    { from: "from-fuchsia-400", via: "via-pink-500", to: "to-rose-600" },
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * GameCard Component - Pro Max Design with dynamic colors
 */
const GameCard = ({ game, onView, onEdit, onToggle, onDelete }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Get gradient based on game name/id for consistent but varied colors
  const gradient = stringToColor(game.name + game.id);

  return (
    <div
      onClick={() => onView(game)}
      className={`group relative rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
        isDarkMode
          ? "bg-slate-800/90 border border-slate-700/50 hover:border-slate-500/50"
          : "bg-white border border-gray-200/80 hover:border-gray-300 shadow-lg"
      } ${!game.enabled ? "opacity-60 grayscale-[30%]" : ""}`}
    >
      {/* Header - Large Gradient Image Area */}
      <div
        className={`relative h-52 bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} overflow-hidden`}
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2)_0%,transparent_40%)]" />
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)`,
              backgroundSize: "25px 25px",
            }}
          />
        </div>

        {/* Large Centered Icon/Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative group-hover:scale-110 transition-all duration-500 group-hover:rotate-3">
            {game.icon ? (
              <div className="relative">
                {/* Glow behind icon */}
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl scale-125" />
                <img
                  src={game.icon}
                  alt={game.name}
                  className="relative w-32 h-32 object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="w-32 h-32 rounded-3xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20"
                  style={{ display: "none" }}
                >
                  <Gamepad2 className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl scale-125" />
                <div className="relative w-32 h-32 rounded-3xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20">
                  <span className="text-5xl font-black text-white drop-shadow-lg">
                    {game.name?.charAt(0)?.toUpperCase() || "G"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge - Premium styling */}
        <div className="absolute top-4 right-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-lg border ${
              game.enabled
                ? "bg-emerald-500/90 text-white border-emerald-400/30"
                : "bg-red-500/90 text-white border-red-400/30"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${game.enabled ? "bg-white animate-pulse" : "bg-white/70"}`} />
            {game.enabled ? "Active" : "Disabled"}
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-black/30 text-white/90 backdrop-blur-md border border-white/10">
            {game.type}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className={`font-bold text-xl mb-2 line-clamp-1 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {game.name}
        </h3>
        <p
          className={`text-sm line-clamp-2 leading-relaxed ${
            isDarkMode ? "text-slate-400" : "text-gray-600"
          }`}
        >
          {game.description || "Không có mô tả chi tiết cho game này."}
        </p>
      </div>

      {/* Footer - Action Buttons */}
      <div
        className={`flex items-center justify-between px-5 py-4 border-t ${
          isDarkMode ? "border-slate-700/50" : "border-gray-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`text-xs font-medium ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
          ID: {game.id}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(game); }}
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              isDarkMode
                ? "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:scale-110"
                : "hover:bg-blue-50 text-blue-600 hover:text-blue-700 hover:scale-110"
            }`}
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(game); }}
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              game.enabled
                ? isDarkMode
                  ? "hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 hover:scale-110"
                  : "hover:bg-amber-50 text-amber-600 hover:text-amber-700 hover:scale-110"
                : isDarkMode
                ? "hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:scale-110"
                : "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:scale-110"
            }`}
            title={game.enabled ? "Disable" : "Enable"}
          >
            {game.enabled ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(game); }}
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              isDarkMode
                ? "hover:bg-red-500/20 text-red-400 hover:text-red-300 hover:scale-110"
                : "hover:bg-red-50 text-red-600 hover:text-red-700 hover:scale-110"
            }`}
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
