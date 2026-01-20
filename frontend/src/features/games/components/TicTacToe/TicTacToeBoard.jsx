import React from "react";
import TicTacToeCell from "./TicTacToeCell";

const TicTacToeBoard = ({
  board,
  onCellClick,
  winningLine,
  hintCell,
  disabled,
  highlightCells = [],
  boardSize = 3,
  selectedCell = -1, // For gamepad navigation
}) => {
  // Dynamic grid classes based on board size
  const gridClass = boardSize === 5
    ? "grid grid-cols-5 grid-rows-5"
    : "grid grid-cols-3 grid-rows-3";

  // Dynamic board size
  const boardSizeClass = boardSize === 5
    ? "w-[400px] h-[400px]"
    : "w-80 h-80";

  return (
    <div
      className={`relative ${boardSizeClass} bg-transparent ${disabled ? "opacity-50" : ""
        }`}
    >
      {/* Game grid */}
      <div className={`${gridClass} h-full gap-0`}>
        {board.map((cell, index) => (
          <TicTacToeCell
            key={index}
            value={cell}
            onClick={() => onCellClick(index)}
            isWinning={winningLine?.includes(index)}
            isHint={hintCell === index || highlightCells.includes(index)}
            isSelected={selectedCell === index}
            disabled={disabled}
            cellIndex={index}
            boardSize={boardSize}
          />
        ))}
      </div>
    </div>
  );
};

export default TicTacToeBoard;

