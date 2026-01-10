import React from 'react';
import TicTacToeCell from './TicTacToeCell';

const TicTacToeBoard = ({ board, onCellClick, winningLine, hintCell, disabled }) => {
    return (
        <div className={`tictactoe-board ${disabled ? 'board-disabled' : ''}`}>
            {/* Dot matrix background */}
            <div className="board-dots-bg">
                {Array(81).fill(null).map((_, i) => (
                    <div key={i} className="bg-dot" />
                ))}
            </div>

            {/* Game grid */}
            <div className="board-grid">
                {board.map((cell, index) => (
                    <TicTacToeCell
                        key={index}
                        value={cell}
                        onClick={() => onCellClick(index)}
                        isWinning={winningLine?.includes(index)}
                        isHint={hintCell === index}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
};

export default TicTacToeBoard;
