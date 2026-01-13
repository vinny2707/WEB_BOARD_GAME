import React from 'react';
import TicTacToeCell from './TicTacToeCell';

const TicTacToeBoard = ({ board, onCellClick, winningLine, hintCell, disabled }) => {
    return (
        <div className={`relative w-80 h-80 bg-transparent ${disabled ? 'opacity-50' : ''}`}>
            {/* Dot matrix background - hidden in papergames layout */}
            <div className="absolute inset-0 grid grid-cols-9 grid-rows-9 opacity-0 pointer-events-none">
                {Array(81).fill(null).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-border" />
                ))}
            </div>

            {/* Game grid */}
            <div className="grid grid-cols-3 grid-rows-3 h-full gap-0">
                {board.map((cell, index) => (
                    <TicTacToeCell
                        key={index}
                        value={cell}
                        onClick={() => onCellClick(index)}
                        isWinning={winningLine?.includes(index)}
                        isHint={hintCell === index}
                        disabled={disabled}
                        cellIndex={index}
                    />
                ))}
            </div>
        </div>
    );
};

export default TicTacToeBoard;
