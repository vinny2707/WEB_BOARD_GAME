import { MATRIX_ROWS, MATRIX_COLS, createEmptyMatrix } from "../../utils/constants";
import { drawCenteredText } from "../../utils/ledUtils";

// Import AI functions from original TicTacToe
import {
  checkWinner as aiCheckWinner,
  getWinningLine,
  isDraw as aiIsDraw,
  findBestMove as aiFindBestMove,
  getHint as aiGetHint,
} from "./TicTacToeLocalAI";

/**
 * TicTacToe LED Game Logic
 * Dynamic board size support (3x3 or 5x5)
 */

/**
 * Calculate cell size based on board size to fit the LED matrix
 */
const getCellSize = (boardSize) => {
  // Available space (leave margin for text)
  const availableRows = MATRIX_ROWS - 8; // space for status text
  const availableCols = MATRIX_COLS - 4;
  
  const gridLines = boardSize - 1;
  const maxCellSize = Math.floor((Math.min(availableRows, availableCols) - gridLines) / boardSize);
  
  return Math.max(4, Math.min(8, maxCellSize));
};

/**
 * Check for winner - wrapper around AI function
 */
export const checkWinner = (board, boardSize = null) => {
  const size = boardSize || Math.sqrt(board.length);
  const winner = aiCheckWinner(board, size);
  if (winner) {
    const line = getWinningLine(board, size);
    return { winner, line: line || [] };
  }
  return null;
};

/**
 * Check for draw - wrapper
 */
export const isDraw = (board, boardSize = null) => {
  return aiIsDraw(board, boardSize);
};

/**
 * Find best move for AI - wrapper with difficulty support
 */
export const findBestMove = (board, difficulty = "medium", boardSize = null) => {
  return aiFindBestMove(board, difficulty, boardSize);
};

/**
 * Get hint for player
 */
export const getHint = (board, boardSize = null) => {
  return aiGetHint(board, boardSize);
};

/**
 * Render TicTacToe board on LED matrix - supports dynamic board size
 */
export const renderTicTacToe = (board, selectedCell, winResult, gameStatus, boardSize = 3, turnTime = null) => {
  const matrix = createEmptyMatrix();
  const size = boardSize;
  const cellSize = getCellSize(size);
  const gridWidth = size * cellSize + (size - 1);
  
  // Center the board
  const offsetR = Math.floor((MATRIX_ROWS - gridWidth) / 2);
  const offsetC = Math.floor((MATRIX_COLS - gridWidth) / 2);

  // Draw grid lines
  for (let i = 1; i < size; i++) {
    const linePos = offsetR + i * (cellSize + 1) - 1;
    // Horizontal lines
    for (let c = 0; c < gridWidth; c++) {
      if (offsetC + c >= 0 && offsetC + c < MATRIX_COLS && linePos >= 0 && linePos < MATRIX_ROWS) {
        matrix[linePos][offsetC + c] = "cyan";
      }
    }
    // Vertical lines
    const colPos = offsetC + i * (cellSize + 1) - 1;
    for (let r = 0; r < gridWidth; r++) {
      if (offsetR + r >= 0 && offsetR + r < MATRIX_ROWS && colPos >= 0 && colPos < MATRIX_COLS) {
        matrix[offsetR + r][colPos] = "cyan";
      }
    }
  }

  // Draw X and O
  const winLine = winResult?.line || [];
  const totalCells = size * size;

  for (let i = 0; i < totalCells; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const cellR = offsetR + row * (cellSize + 1);
    const cellC = offsetC + col * (cellSize + 1);
    const isWinning = winLine.includes(i);
    const isSelected = selectedCell === i && gameStatus === "playing";

    // Selection highlight (yellow border)
    if (isSelected && !board[i]) {
      for (let r = 0; r < cellSize; r++) {
        const pr = cellR + r;
        if (pr >= 0 && pr < MATRIX_ROWS) {
          if (cellC >= 0 && cellC < MATRIX_COLS) matrix[pr][cellC] = "yellow";
          if (cellC + cellSize - 1 < MATRIX_COLS) matrix[pr][cellC + cellSize - 1] = "yellow";
        }
      }
      for (let c = 0; c < cellSize; c++) {
        const pc = cellC + c;
        if (pc >= 0 && pc < MATRIX_COLS) {
          if (cellR >= 0 && cellR < MATRIX_ROWS) matrix[cellR][pc] = "yellow";
          if (cellR + cellSize - 1 < MATRIX_ROWS) matrix[cellR + cellSize - 1][pc] = "yellow";
        }
      }
    }

    if (board[i] === "X") {
      const color = isWinning ? "yellow" : "green";
      // Draw X (diagonal lines)
      for (let d = 1; d < cellSize - 1; d++) {
        const r1 = cellR + d;
        const c1 = cellC + d;
        const c2 = cellC + cellSize - 1 - d;
        if (r1 >= 0 && r1 < MATRIX_ROWS) {
          if (c1 >= 0 && c1 < MATRIX_COLS) matrix[r1][c1] = color;
          if (c2 >= 0 && c2 < MATRIX_COLS) matrix[r1][c2] = color;
        }
      }
    } else if (board[i] === "O") {
      const color = isWinning ? "yellow" : "blue";
      // Draw O (circle approximation)
      const cx = cellSize / 2;
      const cy = cellSize / 2;
      const radius = cellSize / 2 - 1.5;
      const steps = Math.max(8, cellSize * 2);
      for (let angle = 0; angle < steps; angle++) {
        const a = (angle / steps) * Math.PI * 2;
        const r = Math.round(cellR + cy + Math.sin(a) * radius);
        const c = Math.round(cellC + cx + Math.cos(a) * radius);
        if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
          matrix[r][c] = color;
        }
      }
    }
  }

  // Draw status text at bottom
  if (gameStatus === "win") {
    const msg = winResult.winner === "X" ? "YOU WIN!" : "AI WINS!";
    const color = winResult.winner === "X" ? "green" : "red";
    drawCenteredText(matrix, msg, 2, color);
  } else if (gameStatus === "draw") {
    drawCenteredText(matrix, "DRAW!", 2, "yellow");
  } else if (turnTime !== null && turnTime !== undefined) {
    // Draw Timer Bar
    const timerWidth = Math.min(MATRIX_COLS - 4, 30);
    const timeLeftRatio = Math.max(0, Math.min(1, turnTime / 30)); // Assuming 30s max
    const barFill = Math.floor(timerWidth * timeLeftRatio);
    const barColor = turnTime <= 5 ? "red" : "green";
    
    const barRow = 1;
    const barStartCol = Math.floor((MATRIX_COLS - timerWidth) / 2);
    for (let c = 0; c < timerWidth; c++) {
      if (c < barFill) {
        matrix[barRow][barStartCol + c] = barColor;
      } else {
        matrix[barRow][barStartCol + c] = "off";
      }
    }
  }

  return matrix;
};

/**
 * Get cell index from row/col navigation - supports dynamic board size
 */
export const getCellFromNav = (currentCell, direction, boardSize = 3) => {
  const size = boardSize;
  const row = Math.floor(currentCell / size);
  const col = currentCell % size;

  switch (direction) {
    case "up":
      return row > 0 ? (row - 1) * size + col : (size - 1) * size + col;
    case "down":
      return row < size - 1 ? (row + 1) * size + col : col;
    case "left":
      return col > 0 ? row * size + (col - 1) : row * size + (size - 1);
    case "right":
      return col < size - 1 ? row * size + (col + 1) : row * size;
    default:
      return currentCell;
  }
};
