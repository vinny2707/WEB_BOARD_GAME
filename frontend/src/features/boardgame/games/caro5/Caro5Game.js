/**
 * Caro5 Game Module (Gomoku)
 * Win by getting 5 in a row
 * Supports variable board sizes (11x11 to 19x19)
 */

import { MATRIX_ROWS, MATRIX_COLS, createEmptyMatrix } from "../../utils/constants";
import { drawCenteredText } from "../../utils/ledUtils";

// ============== GAME CONSTANTS ==============
const WIN_COUNT = 5;

// ============== GAME LOGIC ==============

/**
 * Create initial game state
 */
export const createInitialState = (settings = {}) => {
  const size = settings.size || 15;
  return {
    board: Array(size * size).fill(null),
    currentPlayer: 'X', // X = human, O = AI
    status: 'playing', // 'playing' | 'win' | 'draw'
    winner: null,
    winLine: [],
    size: size,
    difficulty: settings.difficulty || 'medium',
    selectedCell: Math.floor((size * size) / 2),
    turnTime: settings.turnTime || 30,
    isAIThinking: false,
    hintsRemaining: 3, // Limit hints per game
  };
};

/**
 * Check for winner (5 in a row)
 */
const checkWinnerInternal = (board, size) => {
  const getVal = (r, c) => (r >= 0 && r < size && c >= 0 && c < size) ? board[r * size + c] : null;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = getVal(r, c);
      if (!val) continue;

      // Check 4 directions: horizontal, vertical, diagonal \, diagonal /
      const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal \
        [1, -1],  // diagonal /
      ];

      for (const [dr, dc] of directions) {
        let line = [r * size + c];
        let match = true;
        
        for (let i = 1; i < WIN_COUNT; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (getVal(nr, nc) !== val) {
            match = false;
            break;
          }
          line.push(nr * size + nc);
        }
        
        if (match && line.length >= WIN_COUNT) {
          return { winner: val, winLine: line };
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

// ============== AI LOGIC (Medium Difficulty - Enhanced) ==============

/**
 * Evaluate a single cell's threat level for a player
 * Higher score = more valuable position
 */
const evaluateCellThreat = (board, size, cellIndex, player) => {
  const row = Math.floor(cellIndex / size);
  const col = cellIndex % size;
  const getVal = (r, c) => (r >= 0 && r < size && c >= 0 && c < size) ? board[r * size + c] : 'wall';
  
  if (board[cellIndex] !== null) return 0;
  
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let score = 0;
  
  // Temporarily place piece
  const testBoard = [...board];
  testBoard[cellIndex] = player;
  
  for (const [dr, dc] of directions) {
    // Look in both directions from this cell
    let totalCount = 1; // Count this cell
    let openEnds = 0;
    
    // Forward direction
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < size && c >= 0 && c < size && testBoard[r * size + c] === player) {
      totalCount++;
      r += dr;
      c += dc;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && testBoard[r * size + c] === null) openEnds++;
    
    // Backward direction
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < size && c >= 0 && c < size && testBoard[r * size + c] === player) {
      totalCount++;
      r -= dr;
      c -= dc;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && testBoard[r * size + c] === null) openEnds++;
    
    // Score based on count and open ends (adjusted for 5-in-a-row)
    if (totalCount >= WIN_COUNT) {
      score += 100000; // Winning move
    } else if (totalCount === WIN_COUNT - 1 && openEnds >= 1) {
      score += openEnds === 2 ? 50000 : 5000; // Open-4 or half-open-4
    } else if (totalCount === WIN_COUNT - 2 && openEnds === 2) {
      score += 1000; // Open-3
    } else if (totalCount === WIN_COUNT - 2 && openEnds === 1) {
      score += 100; // Half-open-3
    } else if (totalCount >= 2) {
      score += totalCount * 10;
    }
  }
  
  return score;
};

/**
 * Enhanced AI - Threat-based with attack and defense
 */
export const getAIMove = (state) => {
  const { board, size } = state;
  
  const emptyCells = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) emptyCells.push(i);
  }
  
  if (emptyCells.length === 0) return -1;

  // 1. Check if AI can win immediately
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = 'O';
    if (checkWinnerInternal(testBoard, size)?.winner === 'O') {
      return cell;
    }
  }

  // 2. Check if need to block human from winning
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = 'X';
    if (checkWinnerInternal(testBoard, size)?.winner === 'X') {
      return cell;
    }
  }

  // 3. Evaluate all cells for attack and defense value
  const cellScores = [];
  
  for (const cell of emptyCells) {
    const attackScore = evaluateCellThreat(board, size, cell, 'O');
    const defenseScore = evaluateCellThreat(board, size, cell, 'X');
    
    // Weight attack slightly higher than defense, but block critical threats
    const totalScore = attackScore * 1.1 + defenseScore * 0.9;
    
    // Position bonus - prefer center
    const row = Math.floor(cell / size);
    const col = cell % size;
    const centerDist = Math.abs(row - size / 2) + Math.abs(col - size / 2);
    const positionBonus = (size - centerDist);
    
    cellScores.push({
      cell,
      score: totalScore + positionBonus,
      attack: attackScore,
      defense: defenseScore
    });
  }
  
  // Sort by score descending
  cellScores.sort((a, b) => b.score - a.score);
  
  // 4. Medium difficulty: 15% chance to pick from top 3 instead of best
  if (Math.random() < 0.15 && cellScores.length >= 3) {
    const topMoves = cellScores.slice(0, 3);
    return topMoves[Math.floor(Math.random() * topMoves.length)].cell;
  }
  
  // Return best move
  return cellScores[0]?.cell ?? emptyCells[0];
};

/**
 * Hard AI for hints - always picks the best move (no randomness)
 */
export const getHintMove = (state) => {
  const { board, size } = state;
  
  const emptyCells = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) emptyCells.push(i);
  }
  
  if (emptyCells.length === 0) return -1;

  // 1. Check if player can win immediately
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = 'X';
    if (checkWinnerInternal(testBoard, size)?.winner === 'X') {
      return cell;
    }
  }

  // 2. Check if need to block AI from winning
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = 'O';
    if (checkWinnerInternal(testBoard, size)?.winner === 'O') {
      return cell;
    }
  }

  // 3. Evaluate all cells - prioritize player attack
  const cellScores = [];
  
  for (const cell of emptyCells) {
    const attackScore = evaluateCellThreat(board, size, cell, 'X');
    const defenseScore = evaluateCellThreat(board, size, cell, 'O');
    
    // Weight attack higher for hints
    const totalScore = attackScore * 1.2 + defenseScore * 0.8;
    
    const row = Math.floor(cell / size);
    const col = cell % size;
    const centerDist = Math.abs(row - size / 2) + Math.abs(col - size / 2);
    const positionBonus = (size - centerDist);
    
    cellScores.push({ cell, score: totalScore + positionBonus });
  }
  
  cellScores.sort((a, b) => b.score - a.score);
  return cellScores[0]?.cell ?? emptyCells[0];
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

/**
 * Get cell size and gap based on board size (optimized for larger boards)
 */
const getLayoutParams = (size) => {
  // All Caro5 boards use 1 pixel per cell, no gap (compact display)
  return { cellSize: 1, gap: 0 };
};

/**
 * Render game state to LED matrix
 */
export const renderToMatrix = (state) => {
  const matrix = createEmptyMatrix();
  const { board, size: pSize, boardSize, selectedCell, status, winner, winLine = [], turnTime, currentPlayer, hoverCell } = state || {};
  
  const size = pSize || boardSize || 15;
  const { cellSize, gap } = getLayoutParams(size);
  const gridWidth = size * cellSize + (size - 1) * gap;
  
  const offsetR = Math.floor((MATRIX_ROWS - gridWidth) / 2);
  const offsetC = Math.floor((MATRIX_COLS - gridWidth) / 2);

  // Draw border around game area
  const borderColor = "cyan";
  // Top border
  for (let c = offsetC - 1; c <= offsetC + gridWidth; c++) {
    if (c >= 0 && c < MATRIX_COLS && offsetR - 1 >= 0) {
      matrix[offsetR - 1][c] = borderColor;
    }
  }
  // Bottom border
  for (let c = offsetC - 1; c <= offsetC + gridWidth; c++) {
    if (c >= 0 && c < MATRIX_COLS && offsetR + gridWidth < MATRIX_ROWS) {
      matrix[offsetR + gridWidth][c] = borderColor;
    }
  }
  // Left border
  for (let r = offsetR - 1; r <= offsetR + gridWidth; r++) {
    if (r >= 0 && r < MATRIX_ROWS && offsetC - 1 >= 0) {
      matrix[r][offsetC - 1] = borderColor;
    }
  }
  // Right border
  for (let r = offsetR - 1; r <= offsetR + gridWidth; r++) {
    if (r >= 0 && r < MATRIX_ROWS && offsetC + gridWidth < MATRIX_COLS) {
      matrix[r][offsetC + gridWidth] = borderColor;
    }
  }

  // Draw pieces (no grid dots for compact boards)
  for (let i = 0; i < board.length; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const cellR = offsetR + row * (cellSize + gap);
    const cellC = offsetC + col * (cellSize + gap);
    const isWinning = winLine.includes(i);
    const isSelected = selectedCell === i && status === 'playing' && currentPlayer === 'X';
    const isHovered = hoverCell === i && status === 'playing' && currentPlayer === 'X' && !board[i];

    // Hover highlight (orange) - only for empty cells
    if (isHovered && !isSelected) {
      if (cellR >= 0 && cellR < MATRIX_ROWS && cellC >= 0 && cellC < MATRIX_COLS) {
        matrix[cellR][cellC] = "orange";
      }
      continue;
    }

    // Selection highlight (for 1px cells, just change color)
    if (isSelected && !board[i]) {
      if (cellR >= 0 && cellR < MATRIX_ROWS && cellC >= 0 && cellC < MATRIX_COLS) {
        matrix[cellR][cellC] = "yellow";
      }
      continue;
    }

    // Draw X piece
    if (board[i] === 'X') {
      const color = isWinning ? "yellow" : "green";
      if (cellR >= 0 && cellR < MATRIX_ROWS && cellC >= 0 && cellC < MATRIX_COLS) {
        matrix[cellR][cellC] = color;
      }
    }
    
    // Draw O piece
    else if (board[i] === 'O') {
      const color = isWinning ? "yellow" : "blue";
      if (cellR >= 0 && cellR < MATRIX_ROWS && cellC >= 0 && cellC < MATRIX_COLS) {
        matrix[cellR][cellC] = color;
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

/**
 * Get cell index from matrix coordinates (for mouse click)
 */
export const getCellFromMatrix = (state, matrixR, matrixC) => {
  const { size: pSize, boardSize } = state || {};
  const size = pSize || boardSize || 15;
  
  const { cellSize, gap } = getLayoutParams(size);
  const gridWidth = size * cellSize + (size - 1) * gap;
  
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
  const unit = cellSize + gap;
  const row = Math.floor(relR / unit);
  const col = Math.floor(relC / unit);
  
  if (row >= 0 && row < size && col >= 0 && col < size) {
      return row * size + col;
  }
  
  return -1;
};

// ============== EXPORT GAME MODULE ==============

export default {
  id: 'caro5',
  name: 'CARO 5',
  apiId: 1,
  
  createInitialState,
  makeMove,
  getAIMove,
  getHintMove,
  isValidMove,
  getCellFromNav,
  renderToMatrix,
  getCellFromMatrix,
  
  sizeOptions: [
    { label: '20x20', value: 20 },
    { label: '25x25', value: 25 },
    { label: '30x30', value: 30 },
  ],
  
  defaultSettings: {
    size: 20,
    difficulty: 'medium',
    turnTime: 30,
  },
};
