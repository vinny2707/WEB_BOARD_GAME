import React from "react";
import { Trash2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * GameDeleteDialog Component - Confirmation dialog for deleting games
 */
const GameDeleteDialog = ({ open, onOpenChange, game, onConfirm }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  if (!game) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`max-w-md ${isDarkMode ? "bg-slate-900 border-slate-800" : ""}`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className={`flex items-center gap-3 text-xl ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-red-500/20 text-red-600 border border-red-500/30"
              }`}
            >
              <Trash2 className="w-5 h-5" />
            </div>
            Delete Game
          </AlertDialogTitle>
          <AlertDialogDescription
            className={`${isDarkMode ? "text-slate-400" : "text-gray-600"} mt-4`}
          >
            <div className="space-y-4">
              <p className="text-base">
                Are you sure you want to permanently delete this game?
              </p>
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  isDarkMode
                    ? "bg-slate-800/50 border border-slate-700"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
                    isDarkMode ? "bg-slate-700" : "bg-gray-200"
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
                    <span className="text-xl font-bold text-gray-400">
                      {game.name?.charAt(0)?.toUpperCase() || "G"}
                    </span>
                  )}
                </div>
                <div>
                  <p
                    className={`font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {game.name}
                  </p>
                  <p
                    className={`text-sm font-mono ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {game.type}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                ⚠️ This action cannot be undone. All game data will be
                permanently removed.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel
            className={`${
              isDarkMode
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            }`}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`${
              isDarkMode
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            Delete Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GameDeleteDialog;
