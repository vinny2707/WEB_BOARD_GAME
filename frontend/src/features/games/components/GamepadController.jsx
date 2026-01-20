import React, { useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  LogIn,
  Lightbulb,
} from 'lucide-react';

/**
 * GamepadController - Bàn điều khiển 5 nút giống gamepad
 * 
 * Props:
 * - onLeft: Callback khi nhấn nút trái
 * - onRight: Callback khi nhấn nút phải  
 * - onBack: Callback khi nhấn nút back
 * - onEnter: Callback khi nhấn nút enter
 * - onHint: Callback khi nhấn nút hint (optional)
 * - showHint: Hiển thị nút hint hay không (default: true)
 * - disabled: Vô hiệu hóa tất cả các nút
 * - className: Class bổ sung cho container
 */
const GamepadController = ({
  onLeft,
  onRight,
  onBack,
  onEnter,
  onHint,
  showHint = true,
  disabled = false,
  className = '',
}) => {
  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onRight?.();
        break;
      case 'Enter':
        e.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
      case 'Backspace':
        e.preventDefault();
        onBack?.();
        break;
      case 'h':
      case 'H':
        if (showHint) {
          e.preventDefault();
          onHint?.();
        }
        break;
      default:
        break;
    }
  }, [disabled, onLeft, onRight, onEnter, onBack, onHint, showHint]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const buttonBaseClass = `
    relative flex items-center justify-center
    w-12 h-12 sm:w-14 sm:h-14
    rounded-xl
    transition-all duration-200
    disabled:opacity-30 disabled:cursor-not-allowed
    focus:outline-none
    active:scale-90
  `;

  const sideButtonClass = `
    ${buttonBaseClass}
    bg-slate-700/40 hover:bg-slate-600/50
    border border-slate-500/20
    text-slate-300 hover:text-white
  `;

  const backButtonClass = `
    ${buttonBaseClass}
    bg-amber-800/40 hover:bg-amber-700/50
    border border-amber-500/20
    text-amber-400 hover:text-amber-300
  `;

  const enterButtonClass = `
    ${buttonBaseClass}
    w-14 h-14 sm:w-16 sm:h-16
    bg-emerald-500/60 hover:bg-emerald-400/70
    border border-emerald-400/30
    text-white
  `;

  const hintButtonClass = `
    ${buttonBaseClass}
    bg-amber-700/40 hover:bg-amber-600/50
    border border-amber-400/20
    text-amber-400 hover:text-amber-300
  `;

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 p-3 ${className}`}>
      {/* Left Button */}
      <button
        className={sideButtonClass}
        onClick={onLeft}
        disabled={disabled || !onLeft}
        aria-label="Trái (←)"
        title="Trái (←)"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>

      {/* Back Button */}
      <button
        className={backButtonClass}
        onClick={onBack}
        disabled={disabled || !onBack}
        aria-label="Quay lại (Esc)"
        title="Quay lại (Esc)"
      >
        <CornerDownLeft size={20} strokeWidth={2.5} />
      </button>

      {/* Enter Button - Center, larger */}
      <button
        className={enterButtonClass}
        onClick={onEnter}
        disabled={disabled || !onEnter}
        aria-label="Chọn (Enter)"
        title="Chọn (Enter)"
      >
        <LogIn size={24} strokeWidth={2.5} />
      </button>

      {/* Hint Button */}
      {showHint && (
        <button
          className={hintButtonClass}
          onClick={onHint}
          disabled={disabled || !onHint}
          aria-label="Gợi ý (H)"
          title="Gợi ý (H)"
        >
          <Lightbulb size={20} strokeWidth={2.5} />
        </button>
      )}

      {/* Right Button */}
      <button
        className={sideButtonClass}
        onClick={onRight}
        disabled={disabled || !onRight}
        aria-label="Phải (→)"
        title="Phải (→)"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default GamepadController;
