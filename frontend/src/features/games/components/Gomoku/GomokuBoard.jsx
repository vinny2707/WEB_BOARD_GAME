import React from 'react';
import GomokuCell from './GomokuCell';

const BOARD_SIZE = 15;

const GomokuBoard = ({ board, onCellClick, winningLine, hintCell, disabled }) => {
    const isWinningCell = (index) => {
        return winningLine && winningLine.includes(index);
    };

    return (
        <div className="bg-card rounded-lg p-0.5 shadow-lg border-2 border-border w-[min(85vw,480px)] h-[min(85vw,480px)] max-sm:w-[calc(100vw-40px)] max-sm:h-[calc(100vw-40px)] max-sm:max-w-[400px] max-sm:max-h-[400px]">
            <div
                className="grid w-full aspect-square gap-0"
                style={{
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                    gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`
                }}
            >
                {board.map((cell, index) => (
                    <GomokuCell
                        key={index}
                        value={cell}
                        onClick={() => onCellClick(index)}
                        isWinning={isWinningCell(index)}
                        isHint={hintCell === index}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
};

export default GomokuBoard;
