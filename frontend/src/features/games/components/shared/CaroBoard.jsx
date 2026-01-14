import React from 'react';
import CaroCell from './CaroCell';

/**
 * Shared Board component for Caro games (4 or 5 in a row)
 * @param {Object} props
 * @param {Array} props.board - Array of cell values
 * @param {Function} props.onCellClick - Cell click handler
 * @param {Array|null} props.winningLine - Array of winning cell indices
 * @param {number|null} props.hintCell - Index of hint cell
 * @param {Array} props.highlightCells - Array of cells to highlight (tutorial)
 * @param {boolean} props.disabled - Whether board is disabled
 * @param {number} props.boardSize - Size of board (default 15)
 * @param {string} props.theme - 'emerald' or 'amber'
 */
const CaroBoard = ({
    board,
    onCellClick,
    winningLine,
    hintCell,
    highlightCells = [],
    disabled,
    boardSize = 15,
    theme = 'emerald'
}) => {
    const isWinningCell = (index) => {
        return winningLine && winningLine.includes(index);
    };

    return (
        <div className="bg-card rounded-lg p-0.5 shadow-lg border-2 border-border w-[min(85vw,480px)] h-[min(85vw,480px)] max-sm:w-[calc(100vw-40px)] max-sm:h-[calc(100vw-40px)] max-sm:max-w-[400px] max-sm:max-h-[400px]">
            <div
                className="grid w-full aspect-square gap-0"
                style={{
                    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                    gridTemplateRows: `repeat(${boardSize}, 1fr)`
                }}
            >
                {board.map((cell, index) => (
                    <CaroCell
                        key={index}
                        value={cell}
                        onClick={() => onCellClick(index)}
                        isWinning={isWinningCell(index)}
                        isHint={hintCell === index}
                        isHighlight={highlightCells.includes(index)}
                        disabled={disabled}
                        theme={theme}
                    />
                ))}
            </div>
        </div>
    );
};

export default CaroBoard;

