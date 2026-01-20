/**
 * GameHintDialog Component
 * Hiển thị dialog hướng dẫn chung cho tất cả games
 */
import React from "react";
import { GAME_HINTS } from "./gameHints";

const GameHintDialog = ({ gameKey, onClose }) => {
  const hint = GAME_HINTS[gameKey];

  if (!hint) return null;

  // Map color names to Tailwind classes
  const colorMap = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    cyan: "text-cyan-400",
    red: "text-red-400",
    purple: "text-purple-400",
    pink: "text-pink-400",
    orange: "text-orange-400",
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl p-6 max-w-md border-2 border-primary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-primary mb-4 text-center">
          {hint.emoji} {hint.title}
        </h2>

        <div className="space-y-3 text-foreground">
          {/* Controls */}
          {hint.controls.map((ctrl, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-primary font-bold min-w-20">
                {ctrl.key}
              </span>
              <span>{ctrl.desc}</span>
            </div>
          ))}

          {/* Rules */}
          <div className="border-t border-border pt-3 mt-3">
            {hint.rules.map((rule, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <span
                  className={`${colorMap[rule.color] || "text-white"} font-bold`}
                >
                  {rule.icon}
                </span>
                <span>{rule.desc}</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          {hint.tips && (
            <div className="border-t border-border pt-3 mt-3 text-sm text-muted-foreground">
              💡 {hint.tips}
            </div>
          )}

          {/* Common shortcuts */}
          <div className="border-t border-border pt-3 mt-3 space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <kbd className="px-2 py-1 bg-secondary rounded text-primary">
                H
              </kbd>
              <span>Bật/tắt hướng dẫn</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <kbd className="px-2 py-1 bg-secondary rounded text-primary">
                ESC
              </kbd>
              <span>Quay lại menu</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded transition-colors"
        >
          Đã hiểu!
        </button>
      </div>
    </div>
  );
};

export default GameHintDialog;
