import React, { useMemo } from "react";
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
 */
const LEDMatrix = React.memo(({ pattern, className = "", onCellClick, onCellHover }) => {
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

  return (
    <div
      className={`p-4 rounded-2xl bg-slate-900 border-2 border-slate-700 ${className}`}
      style={{
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)",
        minWidth: boardWidth + 32,
        minHeight: boardHeight + 32,
      }}
      onMouseLeave={() => onCellHover && onCellHover(-1, -1)}
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
                onMouseEnter={() => onCellHover && onCellHover(rowIdx, colIdx)}
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
