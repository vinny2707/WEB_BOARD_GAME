/**
 * TicTacToe Game Module
 * Self-contained game logic, AI, and LED rendering
 */

import { MATRIX_ROWS, MATRIX_COLS, createEmptyMatrix } from "../../utils/constants";
import { drawCenteredText } from "../../utils/ledUtils";

// ============== GAME LOGIC ==============

/**
 * Create initial game state
 */
export const createInitialState = (settings = {}) => ({
  board: Array((settings.size || 3) * (settings.size || 3)).fill(null),
  currentPlayer: 'X', // X = human, O = AI
  status: 'playing', // 'playing' | 'win' | 'draw'
  winner: null,
  winLine: [],
  size: settings.size || 3,
  difficulty: settings.difficulty || 'medium',
  selectedCell: Math.floor(((settings.size || 3) * (settings.size || 3)) / 2),
  turnTime: settings.turnTime || 30,
  isAIThinking: false,
});

/**
 * Check for winner
 */
const getWinLength = (size) => size >= 5 ? 4 : 3;

const checkWinnerInternal = (board, size) => {
  const winLen = getWinLength(size);
  const getVal = (r, c) => (r >= 0 && r < size && c >= 0 && c < size) ? board[r * size + c] : null;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = getVal(r, c);
      if (!val) continue;

      // Check 4 directions: horizontal, vertical, diagonal \, diagonal /
      const directions = [
        [[0, 1], [0, 2], [0, 3]], // horizontal
        [[1, 0], [2, 0], [3, 0]], // vertical
        [[1, 1], [2, 2], [3, 3]], // diagonal \
        [[1, -1], [2, -2], [3, -3]], // diagonal /
      ];

      for (const dir of directions) {
        let line = [r * size + c];
        let match = true;
        
        for (let i = 0; i < winLen - 1; i++) {
          const [dr, dc] = dir[i];
          const nr = r + dr;
          const nc = c + dc;
          if (getVal(nr, nc) !== val) {
            match = false;
            break;
          }
          line.push(nr * size + nc);
        }
        
        if (match && line.length >= winLen) {
          return { winner: val, winLine: line.slice(0, winLen) };
        }
      }
    }
  }
  return null;
};

const isDraw = (board) => board.every(cell => cell !== null);

/**
 * Check if move is valid
 */
export const isValidMove = (state, cellIndex) => {
  return state.status === 'playing' && 
         cellIndex >= 0 && 
         cellIndex < state.board.length && 
         state.board[cellIndex] === null;
};

/**
 * Make a move (returns new state)
 */
export const makeMove = (state, cellIndex, player = null) => {
  const actualPlayer = player || state.currentPlayer;
  
  if (!isValidMove(state, cellIndex)) {
    return state; // Invalid move, return unchanged
  }

  const newBoard = [...state.board];
  newBoard[cellIndex] = actualPlayer;

  // Check game end
  const winResult = checkWinnerInternal(newBoard, state.size);
  
  if (winResult) {
    return {
      ...state,
      board: newBoard,
      status: 'win',
      winner: winResult.winner,
      winLine: winResult.winLine,
      currentPlayer: actualPlayer,
    };
  }
  
  if (isDraw(newBoard)) {
    return {
      ...state,
      board: newBoard,
      status: 'draw',
      currentPlayer: actualPlayer,
    };
  }

  return {
    ...state,
    board: newBoard,
    currentPlayer: actualPlayer === 'X' ? 'O' : 'X',
    turnTime: 30, // Reset timer
  };
};

// ============== AI LOGIC ==============

/**
 * Simple AI - Win > Block > Center > Random
 */
export const getAIMove = (state) => {
  const { board, size, difficulty } = state;
  
  const emptyCells = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) emptyCells.push(i);
  }
  
  if (emptyCells.length === 0) return -1;

  // Easy: Random
  if (difficulty === 'easy') {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Check if AI can win
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = 'O';
    if (checkWinnerInternal(testBoard, size)?.winner === 'O') {
      return cell;
    }
  }

  // Check if need to block
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = 'X';
    if (checkWinnerInternal(testBoard, size)?.winner === 'X') {
      return cell;
    }
  }

  // Medium: 30% random
  if (difficulty === 'medium' && Math.random() < 0.3) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Prefer center
  const center = Math.floor(size * size / 2);
  if (!board[center]) return center;

  // Random
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// ============== NAVIGATION ==============

export const getCellFromNav = (state, direction) => {
  const { selectedCell, size } = state;
  const row = Math.floor(selectedCell / size);
  const col = selectedCell % size;

  switch (direction) {
    case 'up':
      return row > 0 ? (row - 1) * size + col : (size - 1) * size + col;
    case 'down':
      return row < size - 1 ? (row + 1) * size + col : col;
    case 'left':
      return col > 0 ? row * size + (col - 1) : row * size + (size - 1);
    case 'right':
      return col < size - 1 ? row * size + (col + 1) : row * size;
    default:
      return selectedCell;
  }
};

// ============== LED RENDERING ==============

const getCellSize = (size) => {
  const availableRows = MATRIX_ROWS - 8;
  const availableCols = MATRIX_COLS - 4;
  const gridLines = size - 1;
  const maxCellSize = Math.floor((Math.min(availableRows, availableCols) - gridLines) / size);
  return Math.max(4, Math.min(8, maxCellSize));
};

export const renderToMatrix = (state) => {
  const matrix = createEmptyMatrix();
  const { board, size: pSize, boardSize, selectedCell, status, winner, winLine = [], turnTime, currentPlayer } = state || {};
  
  const size = pSize || boardSize || 3;
  const cellSize = getCellSize(size);
  const gridWidth = size * cellSize + (size - 1);
  
  const offsetR = Math.floor((MATRIX_ROWS - gridWidth) / 2);
  const offsetC = Math.floor((MATRIX_COLS - gridWidth) / 2);

  // Draw grid lines
  for (let i = 1; i < size; i++) {
    const linePos = offsetR + i * (cellSize + 1) - 1;
    for (let c = 0; c < gridWidth; c++) {
      if (offsetC + c >= 0 && offsetC + c < MATRIX_COLS && linePos >= 0 && linePos < MATRIX_ROWS) {
        matrix[linePos][offsetC + c] = "cyan";
      }
    }
    const colPos = offsetC + i * (cellSize + 1) - 1;
    for (let r = 0; r < gridWidth; r++) {
      if (offsetR + r >= 0 && offsetR + r < MATRIX_ROWS && colPos >= 0 && colPos < MATRIX_COLS) {
        matrix[offsetR + r][colPos] = "cyan";
      }
    }
  }

  // Draw pieces
  for (let i = 0; i < board.length; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const cellR = offsetR + row * (cellSize + 1);
    const cellC = offsetC + col * (cellSize + 1);
    const isWinning = winLine.includes(i);
    const isSelected = selectedCell === i && status === 'playing' && currentPlayer === 'X';

    // Selection highlight
    if (isSelected && !board[i]) {
      for (let r = 0; r < cellSize; r++) {
        if (cellR + r < MATRIX_ROWS) {
          if (cellC >= 0 && cellC < MATRIX_COLS) matrix[cellR + r][cellC] = "yellow";
          if (cellC + cellSize - 1 < MATRIX_COLS) matrix[cellR + r][cellC + cellSize - 1] = "yellow";
        }
      }
      for (let c = 0; c < cellSize; c++) {
        if (cellC + c < MATRIX_COLS) {
          if (cellR >= 0 && cellR < MATRIX_ROWS) matrix[cellR][cellC + c] = "yellow";
          if (cellR + cellSize - 1 < MATRIX_ROWS) matrix[cellR + cellSize - 1][cellC + c] = "yellow";
        }
      }
    }

    if (board[i] === 'X') {
      const color = isWinning ? "yellow" : "green";
      for (let d = 1; d < cellSize - 1; d++) {
        const r1 = cellR + d;
        const c1 = cellC + d;
        const c2 = cellC + cellSize - 1 - d;
        if (r1 >= 0 && r1 < MATRIX_ROWS) {
          if (c1 >= 0 && c1 < MATRIX_COLS) matrix[r1][c1] = color;
          if (c2 >= 0 && c2 < MATRIX_COLS) matrix[r1][c2] = color;
        }
      }
    } else if (board[i] === 'O') {
      const color = isWinning ? "yellow" : "blue";
      // Draw O as a clean square outline (no buggy circle)
      const margin = 1;
      // Top and bottom edges
      for (let c = margin; c < cellSize - margin; c++) {
        const topR = cellR + margin;
        const botR = cellR + cellSize - 1 - margin;
        const col = cellC + c;
        if (topR >= 0 && topR < MATRIX_ROWS && col >= 0 && col < MATRIX_COLS) matrix[topR][col] = color;
        if (botR >= 0 && botR < MATRIX_ROWS && col >= 0 && col < MATRIX_COLS) matrix[botR][col] = color;
      }
      // Left and right edges
      for (let r = margin; r < cellSize - margin; r++) {
        const leftC = cellC + margin;
        const rightC = cellC + cellSize - 1 - margin;
        const row = cellR + r;
        if (row >= 0 && row < MATRIX_ROWS && leftC >= 0 && leftC < MATRIX_COLS) matrix[row][leftC] = color;
        if (row >= 0 && row < MATRIX_ROWS && rightC >= 0 && rightC < MATRIX_COLS) matrix[row][rightC] = color;
      }
    }
  }

  // Status text
  if (status === 'win') {
    const msg = winner === 'X' ? "YOU WIN!" : "AI WINS!";
    const color = winner === 'X' ? "green" : "red";
    drawCenteredText(matrix, msg, 2, color);
  } else if (status === 'draw') {
    drawCenteredText(matrix, "DRAW!", 2, "yellow");
  } else if (turnTime !== null && turnTime !== undefined) {
    // Timer bar
    const timerWidth = Math.min(MATRIX_COLS - 4, 30);
    const timeRatio = Math.max(0, Math.min(1, turnTime / 30));
    const barFill = Math.floor(timerWidth * timeRatio);
    const barColor = turnTime <= 5 ? "red" : "green";
    const barRow = 1;
    const barStartCol = Math.floor((MATRIX_COLS - timerWidth) / 2);
    for (let c = 0; c < timerWidth; c++) {
      matrix[barRow][barStartCol + c] = c < barFill ? barColor : "off";
    }
  }

  return matrix;
};

// Helper to get cell index from matrix coordinates
export const getCellFromMatrix = (state, matrixR, matrixC) => {
  const { size: pSize, boardSize } = state || {};
  const size = pSize || boardSize || 3;
  
  const cellSize = getCellSize(size);
  const gridWidth = size * cellSize + (size - 1);
  
  const offsetR = Math.floor((MATRIX_ROWS - gridWidth) / 2);
  const offsetC = Math.floor((MATRIX_COLS - gridWidth) / 2);

  // Check bounds
  if (matrixR < offsetR || matrixR >= offsetR + gridWidth ||
      matrixC < offsetC || matrixC >= offsetC + gridWidth) {
    return -1;
  }

  // Calculate relative position
  const relR = matrixR - offsetR;
  const relC = matrixC - offsetC;

  // Dimensions of one cell block (cell + gap)
  const unit = cellSize + 1;
  const row = Math.floor(relR / unit);
  const col = Math.floor(relC / unit);
  
  // Check if click is in a gap (gap is the last pixel of the unit)
  if (relR % unit >= cellSize || relC % unit >= cellSize) {
      return -1; // Clicked on gap
  }
  
  if (row >= 0 && row < size && col >= 0 && col < size) {
      return row * size + col;
  }
  
  return -1;
};

// ============== EXPORT GAME MODULE ==============

export default {
  id: 'tictactoe',
  name: 'TIC TAC TOE',
  apiId: 3,
  
  createInitialState,
  makeMove,
  getAIMove,
  isValidMove,
  getCellFromNav,
  renderToMatrix,
  getCellFromMatrix,
  
  sizeOptions: [
    { label: '3x3', value: 3 },
    { label: '5x5', value: 5 },
  ],
  
  defaultSettings: {
    size: 3,
    difficulty: 'medium',
    turnTime: 30,
  },
};
