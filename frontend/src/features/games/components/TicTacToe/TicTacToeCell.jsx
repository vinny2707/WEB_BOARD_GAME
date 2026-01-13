import React from 'react';

const TicTacToeCell = ({ value, onClick, isWinning, isHint, isHighlight, disabled, cellIndex }) => {
    // Determine border classes based on cell position
    const getBorderClasses = () => {
        const row = Math.floor(cellIndex / 3);
        const col = cellIndex % 3;
        let borders = 'border-2 border-slate-400';

        // Remove borders at edges
        if (row === 0) borders += ' border-t-0';
        if (row === 2) borders += ' border-b-0';
        if (col === 0) borders += ' border-l-0';
        if (col === 2) borders += ' border-r-0';

        return borders;
    };

    const getCellClasses = () => {
        let classes = `flex items-center justify-center bg-transparent transition-all cursor-pointer ${getBorderClasses()}`;

        if (isWinning) classes += ' animate-pulse bg-yellow-500/20';
        if (isHint) classes += ' animate-pulse bg-amber-400/50 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]';
        if (isHighlight) classes += ' animate-pulse bg-emerald-500/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
        if (disabled || value) classes += ' cursor-default';
        if (!value && !disabled && !isHighlight) classes += ' hover:bg-emerald-500/10 hover:border-emerald-500';

        return classes;
    };

    return (
        <button
            className={getCellClasses()}
            onClick={onClick}
            disabled={!!value || disabled}
            aria-label={value ? `Cell ${value}` : 'Empty cell'}
        >
            <div className="flex items-center justify-center w-full h-full">
                {value === 'X' && (
                    <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 stroke-emerald-500 stroke-[3] fill-none">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                )}
                {value === 'O' && (
                    <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 stroke-slate-600 stroke-[3] fill-none">
                        <circle cx="12" cy="12" r="8" />
                    </svg>
                )}
            </div>
        </button>
    );
};

export default TicTacToeCell;
