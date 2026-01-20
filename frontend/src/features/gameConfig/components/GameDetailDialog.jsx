import React from "react";
import { Gamepad2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * GameDetailDialog Component - Shows full game details with scroll support
 */
const GameDetailDialog = ({ open, onOpenChange, game }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const getStatusBadge = (enabled) => {
    if (enabled) {
      return "text-emerald-400 bg-emerald-500/20 border border-emerald-500/30";
    }
    return "text-red-400 bg-red-500/20 border border-red-500/30";
  };

  if (!game) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl max-h-[85vh] overflow-hidden flex flex-col ${
          isDarkMode ? "bg-slate-800 border-slate-700" : ""
        }`}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle
            className={`flex items-center gap-3 text-xl ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
            </div>
            Game Details
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Header with Icon */}
          <div className="flex items-center gap-4">
            <div
              className={`w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden ${
                isDarkMode ? "bg-slate-700" : "bg-gray-100"
              }`}
            >
              {game.icon ? (
                <img
                  src={game.icon}
                  alt={game.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-4xl font-bold text-gray-400">
                  {game.name?.charAt(0)?.toUpperCase() || "G"}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {game.name}
              </h3>
              <p
                className={`text-sm font-mono ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                {game.type}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusBadge(
                game.enabled
              )}`}
            >
              {game.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* Info Grid */}
          <div
            className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
              isDarkMode ? "bg-slate-700/50" : "bg-gray-100"
            }`}
          >
            <div>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Board Size
              </p>
              <p
                className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {game.rows} x {game.cols}
              </p>
            </div>
            <div>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Created
              </p>
              <p
                className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {game.created_at
                  ? new Date(game.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            {game.icon && (
              <div className="col-span-2">
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  Icon URL
                </p>
                <p
                  className={`font-mono text-xs truncate ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {game.icon}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {game.description && (
            <div>
              <h4
                className={`text-sm font-semibold mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Description
              </h4>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                {game.description}
              </p>
            </div>
          )}

          {/* Rules */}
          {game.rules && (
            <div>
              <h4
                className={`text-sm font-semibold mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Rules
              </h4>
              <p
                className={`text-sm whitespace-pre-wrap ${
                  isDarkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                {game.rules}
              </p>
            </div>
          )}

          {/* Settings */}
          {game.settings && Object.keys(game.settings).length > 0 && (
            <div>
              <h4
                className={`text-sm font-semibold mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Settings
              </h4>
              <pre
                className={`text-sm p-3 rounded-lg overflow-x-auto ${
                  isDarkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {JSON.stringify(game.settings, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailDialog;
