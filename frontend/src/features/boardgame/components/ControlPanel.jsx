import React from "react";
import { ChevronLeft, ChevronRight, CornerDownLeft, LogIn, Lightbulb } from "lucide-react";

/**
 * Control Panel with 5 buttons: Left, Right, Back, Enter, Hint
 */
const ControlPanel = ({
  onLeft,
  onRight,
  onBack,
  onEnter,
  onHint,
  showHint = true,
  disabled = false,
}) => {
  const buttonBase = `
    w-14 h-14 flex items-center justify-center rounded-xl
    transition-all duration-150 active:scale-95
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-card border-t border-border">
      {/* Left */}
      <button
        className={`${buttonBase} bg-secondary text-foreground hover:bg-accent`}
        onClick={onLeft}
        disabled={disabled}
        title="Left (←)"
      >
        <ChevronLeft size={28} />
      </button>

      {/* Back */}
      <button
        className={`${buttonBase} bg-orange-500/20 text-orange-500 hover:bg-orange-500/30`}
        onClick={onBack}
        disabled={disabled}
        title="Back (ESC)"
      >
        <CornerDownLeft size={24} />
      </button>

      {/* Enter */}
      <button
        className={`${buttonBase} bg-emerald-500 text-white hover:bg-emerald-600 w-20`}
        onClick={onEnter}
        disabled={disabled}
        title="Enter (↵)"
      >
        <LogIn size={24} />
      </button>

      {/* Hint */}
      {showHint && (
        <button
          className={`${buttonBase} bg-amber-500/20 text-amber-500 hover:bg-amber-500/30`}
          onClick={onHint}
          disabled={disabled}
          title="Hint (H)"
        >
          <Lightbulb size={24} />
        </button>
      )}

      {/* Right */}
      <button
        className={`${buttonBase} bg-secondary text-foreground hover:bg-accent`}
        onClick={onRight}
        disabled={disabled}
        title="Right (→)"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

export default ControlPanel;
