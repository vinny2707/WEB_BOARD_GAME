import React from 'react';

const GomokuCell = ({ value, onClick, isWinning, isHint, disabled }) => {
    const getCellClass = () => {
        let classes = 'aspect-square bg-secondary border border-border cursor-pointer flex items-center justify-center relative transition-all duration-150';

        if (isWinning) classes += ' animate-pulse shadow-[0_0_15px_rgba(255,215,0,0.9)]';
        if (isHint && !value) classes += ' animate-pulse bg-emerald-500/30';
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
                    className={`w-3/4 h-3/4 stroke-[4] stroke-emerald-500 fill-none stroke-linecap-round ${isWinning ? 'stroke-yellow-400' : ''}`}
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
                <div className="w-2/5 h-2/5 rounded-full bg-emerald-500/50 animate-pulse" />
            )}
        </button>
    );
};

export default GomokuCell;
