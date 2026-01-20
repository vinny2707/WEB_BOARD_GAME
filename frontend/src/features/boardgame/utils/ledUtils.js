import { MATRIX_ROWS, MATRIX_COLS, createEmptyMatrix } from "./constants";

// Simple 3x5 pixel font for LED display
const FONT_3x5 = {
  'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  'C': [[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
  'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  'E': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
  'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  'G': [[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
  'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'K': [[1,0,1],[1,1,0],[1,0,0],[1,1,0],[1,0,1]],
  'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  'N': [[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
  'O': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'P': [[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
  'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'S': [[0,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0]],
  'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'V': [[1,0,1],[1,0,1],[1,0,1],[0,1,0],[0,1,0]],
  'W': [[1,0,1],[1,0,1],[1,0,1],[1,1,1],[1,0,1]],
  'X': [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
  'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  '0': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,0],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  '3': [[1,1,0],[0,0,1],[0,1,0],[0,0,1],[1,1,0]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,0],[0,0,1],[1,1,0]],
  '6': [[0,1,1],[1,0,0],[1,1,0],[1,0,1],[0,1,0]],
  '7': [[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
  '8': [[0,1,0],[1,0,1],[0,1,0],[1,0,1],[0,1,0]],
  '9': [[0,1,0],[1,0,1],[0,1,1],[0,0,1],[1,1,0]],
  ':': [[0],[1],[0],[1],[0]],
  ' ': [[0],[0],[0],[0],[0]],
  '-': [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  '.': [[0],[0],[0],[0],[1]],
  '!': [[1],[1],[1],[0],[1]],
};

/**
 * Draw text on matrix
 */
export const drawText = (matrix, text, startRow, startCol, color) => {
  if (!text) return startCol;
  let col = startCol;
  for (const char of String(text).toUpperCase()) {
    const glyph = FONT_3x5[char];
    if (glyph) {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < glyph[r].length; c++) {
          if (glyph[r][c] === 1 && startRow + r < MATRIX_ROWS && col + c < MATRIX_COLS && col + c >= 0 && startRow + r >= 0) {
            matrix[startRow + r][col + c] = color;
          }
        }
      }
      col += glyph[0].length + 1;
    }
  }
  return col;
};

/**
 * Get text width in LED dots
 */
export const getTextWidth = (text) => {
  if (!text) return 0;
  let width = 0;
  for (const char of String(text).toUpperCase()) {
    const glyph = FONT_3x5[char];
    if (glyph) width += glyph[0].length + 1;
  }
  return Math.max(0, width - 1);
};

/**
 * Draw centered text
 */
export const drawCenteredText = (matrix, text, row, color) => {
  if (!text) return;
  const textWidth = getTextWidth(text);
  const startCol = Math.floor((MATRIX_COLS - textWidth) / 2);
  drawText(matrix, text, row, startCol, color);
};

/**
 * Draw filled rectangle
 */
export const drawRect = (matrix, row, col, width, height, color, filled = false) => {
  for (let r = row; r < row + height && r < MATRIX_ROWS; r++) {
    for (let c = col; c < col + width && c < MATRIX_COLS; c++) {
      if (r >= 0 && c >= 0) {
        if (filled || r === row || r === row + height - 1 || c === col || c === col + width - 1) {
          matrix[r][c] = color;
        }
      }
    }
  }
};

/**
 * Draw line
 */
export const drawLine = (matrix, r1, c1, r2, c2, color) => {
  const dr = Math.abs(r2 - r1);
  const dc = Math.abs(c2 - c1);
  const sr = r1 < r2 ? 1 : -1;
  const sc = c1 < c2 ? 1 : -1;
  let err = dr - dc;

  let r = r1, c = c1;
  while (true) {
    if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
      matrix[r][c] = color;
    }
    if (r === r2 && c === c2) break;
    const e2 = 2 * err;
    if (e2 > -dc) { err -= dc; r += sr; }
    if (e2 < dr) { err += dr; c += sc; }
  }
};
