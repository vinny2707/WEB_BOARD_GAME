/**
 * SnakeHintDialog Component
 * Displays hint/help dialog for Snake game
 */
import React from 'react';

const SnakeHintDialog = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 max-w-md border-2 border-primary shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-primary mb-4 text-center">🐍 SNAKE GAME</h2>

        <div className="space-y-3 text-foreground">
          <div className="flex items-center gap-3">
            <span className="text-primary font-bold">↑ ↓ ← →</span>
            <span>Control snake direction</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-green-400 font-bold">🔴</span>
            <span>Eat food to grow and score</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-bold">⚠️</span>
            <span>Avoid hitting yourself</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-blue-400 font-bold">🔄</span>
            <span>Snake wraps through walls</span>
          </div>

          <div className="border-t border-border pt-3 mt-3 space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <kbd className="px-2 py-1 bg-secondary rounded text-primary">H</kbd>
              <span>Toggle this hint</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <kbd className="px-2 py-1 bg-secondary rounded text-primary">ESC</kbd>
              <span>Return to menu</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default SnakeHintDialog;
