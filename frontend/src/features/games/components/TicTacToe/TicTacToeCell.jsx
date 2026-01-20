import React from 'react';

const TicTacToeCell = ({ value, onClick, isWinning, isHint, isHighlight, isSelected, disabled, cellIndex, boardSize = 3 }) => {
    // Determine border classes based on cell position
    const getBorderClasses = () => {
        const size = boardSize;
        const row = Math.floor(cellIndex / size);
        const col = cellIndex % size;
        let borders = 'border-2 border-slate-400';

        // Remove borders at edges
        if (row === 0) borders += ' border-t-0';
        if (row === size - 1) borders += ' border-b-0';
        if (col === 0) borders += ' border-l-0';
        if (col === size - 1) borders += ' border-r-0';

        return borders;
    };

    const getCellClasses = () => {
        let classes = `flex items-center justify-center bg-transparent transition-all cursor-pointer ${getBorderClasses()}`;

        if (isWinning) classes += ' animate-pulse bg-yellow-500/20';
        if (isHint) classes += ' animate-pulse bg-amber-400/50 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]';
        if (isHighlight) classes += ' animate-pulse bg-orange-500 border-orange-600 border-4 shadow-[0_0_40px_rgba(234,88,12,1)]';
        if (isSelected && !value && !disabled) classes += ' bg-emerald-500/30 border-emerald-500 border-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
        if (disabled || value) classes += ' cursor-default';
        if (!value && !disabled && !isHighlight && !isSelected) classes += ' hover:bg-emerald-500/10 hover:border-emerald-500';

        return classes;
    };

    // Adjust symbol size based on board size
    const symbolSizeClass = boardSize === 5 ? 'w-2/3 h-2/3' : 'w-3/4 h-3/4';
    const strokeWidth = boardSize === 5 ? 2.5 : 3;

    return (
        <button
            className={getCellClasses()}
            onClick={onClick}
            disabled={!!value || disabled}
            aria-label={value ? `Cell ${value}` : 'Empty cell'}
        >
            <div className="flex items-center justify-center w-full h-full">
                {value === 'X' && (
                    <svg viewBox="0 0 24 24" className={`${symbolSizeClass} stroke-emerald-500 fill-none`} strokeWidth={strokeWidth}>
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                )}
                {value === 'O' && (
                    <svg viewBox="0 0 24 24" className={`${symbolSizeClass} stroke-slate-600 fill-none`} strokeWidth={strokeWidth}>
                        <circle cx="12" cy="12" r="8" />
                    </svg>
                )}
            </div>
        </button>
    );
};

export default TicTacToeCell;

