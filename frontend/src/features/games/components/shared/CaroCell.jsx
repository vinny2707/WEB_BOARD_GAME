import React from 'react';

/**
 * Shared Cell component for Caro games (4 or 5 in a row)
 * @param {Object} props
 * @param {string|null} props.value - 'X', 'O', or null
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.isWinning - Whether this cell is part of winning line
 * @param {boolean} props.isHint - Whether this cell is the hint
 * @param {boolean} props.disabled - Whether clicking is disabled
 * @param {string} props.theme - 'emerald' (default for 5-row) or 'amber' (for 4-row)
 */
const CaroCell = ({ value, onClick, isWinning, isHint, disabled, theme = 'emerald' }) => {
    const themeColors = {
        emerald: {
            xStroke: 'stroke-emerald-500',
            hintBg: 'bg-emerald-500/30',
            hintDot: 'bg-emerald-500/50'
        },
        amber: {
            xStroke: 'stroke-amber-500',
            hintBg: 'bg-amber-500/30',
            hintDot: 'bg-amber-500/50'
        }
    };

    const colors = themeColors[theme] || themeColors.emerald;

    const getCellClass = () => {
        let classes = 'aspect-square bg-secondary border border-border cursor-pointer flex items-center justify-center relative transition-all duration-150';

        if (isWinning) classes += ' animate-pulse shadow-[0_0_15px_rgba(255,215,0,0.9)]';
        if (isHint && !value) classes += ` animate-pulse ${colors.hintBg}`;
        if (disabled) classes += ' cursor-default';
        if (!disabled && !value) classes += ' hover:bg-black/10';

        return classes;
    };

    const renderSymbol = () => {
        if (!value) return null;

        if (value === 'X') {
            return (
                <svg
                    viewBox="0 0 50 50"
                    className={`w-3/4 h-3/4 stroke-[4] ${colors.xStroke} fill-none stroke-linecap-round ${isWinning ? 'stroke-yellow-400' : ''}`}
                >
                    <line x1="12" y1="12" x2="38" y2="38" />
                    <line x1="38" y1="12" x2="12" y2="38" />
                </svg>
            );
        }

        if (value === 'O') {
            return (
                <svg
                    viewBox="0 0 50 50"
                    className={`w-3/4 h-3/4 stroke-[4] stroke-slate-500 fill-none ${isWinning ? 'stroke-yellow-400' : ''}`}
                >
                    <circle cx="25" cy="25" r="14" />
                </svg>
            );
        }
    };

    return (
        <button
            className={getCellClass()}
            onClick={onClick}
            disabled={disabled || value !== null}
        >
            {renderSymbol()}
            {isHint && !value && (
                <div className={`w-2/5 h-2/5 rounded-full ${colors.hintDot} animate-pulse`} />
            )}
        </button>
    );
};

export default CaroCell;
