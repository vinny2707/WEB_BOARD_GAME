import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  MATRIX_ROWS,
  MATRIX_COLS,
  LED_COLORS,
} from "../utils/constants";

// Cell size for each LED dot
const CELL_SIZE = 12;
const CELL_GAP = 2;

/**
 * LED Matrix Board - Optimized rendering with round LEDs
 * Supports drag painting for drawing games
 */
const LEDMatrix = React.memo(({ pattern, className = "", onCellClick, onCellHover, onMouseDown, onMouseUp }) => {
  // Pre-compute colors for the entire pattern
  const cellColors = useMemo(() => {
    return pattern.map(row =>
      row.map(color => {
        if (color === 0 || !color) return LED_COLORS.off;
        return LED_COLORS[color] || color;
      })
    );
  }, [pattern]);

  const boardWidth = MATRIX_COLS * (CELL_SIZE + CELL_GAP);
  const boardHeight = MATRIX_ROWS * (CELL_SIZE + CELL_GAP);

  // Track last hovered cell for mouseUp position
  const lastCellRef = useRef({ row: -1, col: -1 });

  const [isMouseDown, setIsMouseDown] = useState(false);

  // Handle mouse down on cell
  const handleCellMouseDown = useCallback((row, col) => {
    setIsMouseDown(true);
    if (onMouseDown) onMouseDown(row, col);
  }, [onMouseDown]);

  // Handle mouse up on cell
  const handleCellMouseUp = useCallback((row, col) => {
    setIsMouseDown(false);
    if (onMouseUp) onMouseUp(row, col);
  }, [onMouseUp]);

  // Handle mouse enter on cell (for drag painting)
  const handleCellMouseEnter = useCallback((rowIdx, colIdx) => {
    lastCellRef.current = { row: rowIdx, col: colIdx };
    if (onCellHover) {
      onCellHover(rowIdx, colIdx, isMouseDown);
    }
  }, [onCellHover, isMouseDown]);

  return (
    <div
      className={`p-4 rounded-2xl bg-slate-900 dark:bg-slate-900 border-2 border-border ${className}`}
      style={{
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)",
        minWidth: boardWidth + 32,
        minHeight: boardHeight + 32,
        userSelect: "none", // Prevent text selection
      }}
      onMouseLeave={() => {
        setIsMouseDown(false);
        onCellHover && onCellHover(-1, -1, false);
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${MATRIX_COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${MATRIX_ROWS}, ${CELL_SIZE}px)`,
          gap: `${CELL_GAP}px`,
          width: boardWidth,
          height: boardHeight,
        }}
      >
        {cellColors.map((row, rowIdx) =>
          row.map((bgColor, colIdx) => {
            const isOn = bgColor !== LED_COLORS.off;
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                onClick={() => onCellClick && onCellClick(rowIdx, colIdx)}
                onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                onMouseUp={() => handleCellMouseUp(rowIdx, colIdx)}
                className={onCellClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderRadius: "50%",
                  backgroundColor: bgColor,
                  boxShadow: isOn ? `0 0 4px ${bgColor}` : "none",
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
});

LEDMatrix.displayName = "LEDMatrix";

export default LEDMatrix;
