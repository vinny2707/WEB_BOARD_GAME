import React from 'react';

const TicTacToeCell = ({ value, onClick, isWinning, isHint, disabled }) => {
    const getCellClass = () => {
        let classes = 'tictactoe-cell';
        if (value) classes += ` cell-${value.toLowerCase()}`;
        if (isWinning) classes += ' cell-winning';
        if (isHint) classes += ' cell-hint';
        if (!value) classes += ' cell-empty';
        if (disabled) classes += ' cell-disabled';
        return classes;
    };

    return (
        <button
            className={getCellClass()}
            onClick={onClick}
            disabled={!!value || disabled}
            aria-label={value ? `Cell ${value}` : 'Empty cell'}
        >
            <div className="cell-content">
                {value === 'X' && (
                    <svg viewBox="0 0 24 24" className="cell-icon cell-x">
                        <path d="M18 6L6 18M6 6l12 12" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                )}
                {value === 'O' && (
                    <svg viewBox="0 0 24 24" className="cell-icon cell-o">
                        <circle cx="12" cy="12" r="8" strokeWidth="3" fill="none" />
                    </svg>
                )}
                {!value && <div className="cell-dot" />}
            </div>
        </button>
    );
};

export default TicTacToeCell;
