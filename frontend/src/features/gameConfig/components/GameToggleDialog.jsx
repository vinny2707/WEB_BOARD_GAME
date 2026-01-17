import React from "react";
import { AlertTriangle } from "lucide-react";
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
 * Game Toggle Status Confirmation Dialog
 */
const GameToggleDialog = ({
  open,
  onOpenChange,
  game,
  onConfirm,
  isDarkMode,
}) => {
  if (!game) return null;

  const isEnabling = !game.enabled;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={isDarkMode ? "bg-slate-900 border-slate-700" : ""}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isEnabling ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              <AlertTriangle className={`w-6 h-6 ${isEnabling ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} />
            </div>
            <AlertDialogTitle className={isDarkMode ? "text-white" : ""}>
              {isEnabling ? "Enable Game" : "Disable Game"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className={`pt-2 ${isDarkMode ? "text-slate-400" : ""}`}>
            Are you sure you want to {isEnabling ? "enable" : "disable"} the game{" "}
            <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {game.name}
            </span>
            ?
            {!isEnabling && (
              <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                ⚠️ Users will not be able to play this game while it is disabled.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={isDarkMode ? "bg-slate-800 text-white hover:bg-slate-700 border-slate-600" : ""}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              isEnabling
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
          >
            {isEnabling ? "Enable" : "Disable"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GameToggleDialog;
