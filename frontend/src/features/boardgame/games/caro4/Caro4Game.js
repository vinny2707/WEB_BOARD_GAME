/**
 * Caro4 Game Module
 * Connect 4 on grid - Win by getting 4 in a row
 * Supports variable board sizes (7x7 to 15x15)
 */

import { MATRIX_ROWS, MATRIX_COLS, createEmptyMatrix } from "../../utils/constants";
import { drawCenteredText } from "../../utils/ledUtils";

// ============== GAME CONSTANTS ==============
const WIN_COUNT = 4;

// ============== GAME LOGIC ==============

/**
 * Create initial game state
 */
export const createInitialState = (settings = {}) => {
  const size = settings.size || 9;
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
 * Check for winner (4 in a row)
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
 * Count consecutive pieces in a line with open ends detection
 * Returns: { count: number, openEnds: number (0, 1, or 2) }
 */
const countLine = (board, size, startR, startC, dr, dc, player) => {
  const getVal = (r, c) => (r >= 0 && r < size && c >= 0 && c < size) ? board[r * size + c] : 'wall';
  
  let count = 0;
  let r = startR, c = startC;
  
  // Count consecutive pieces
  while (getVal(r, c) === player) {
    count++;
    r += dr;
    c += dc;
  }
  
  // Check open ends
  let openEnds = 0;
  
  // Check end after the line
  if (getVal(r, c) === null) openEnds++;
  
  // Check end before the line
  const beforeR = startR - dr;
  const beforeC = startC - dc;
  if (getVal(beforeR, beforeC) === null) openEnds++;
  
  return { count, openEnds };
};

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
    while (getVal(r, c) === player || (testBoard[r * size + c] === player && r >= 0 && r < size && c >= 0 && c < size)) {
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
    
    // Score based on count and open ends
    if (totalCount >= WIN_COUNT) {
      score += 100000; // Winning move
    } else if (totalCount === WIN_COUNT - 1 && openEnds >= 1) {
      score += openEnds === 2 ? 10000 : 1000; // Open-3 or half-open-3
    } else if (totalCount === WIN_COUNT - 2 && openEnds === 2) {
      score += 100; // Open-2
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

/**
 * Get cell size and gap based on board size (optimized for larger boards)
 */
const getLayoutParams = (size) => {
  // Calculate max grid that fits in matrix (leave 2px margin for border)
  const availableRows = MATRIX_ROWS - 4; // 28 rows
  const availableCols = MATRIX_COLS - 4; // 44 cols
  
  // Try different cell sizes
  for (let cellSize = 3; cellSize >= 1; cellSize--) {
    for (let gap = 1; gap >= 0; gap--) {
      const gridWidth = size * cellSize + (size - 1) * gap;
      if (gridWidth <= availableRows && gridWidth <= availableCols) {
        return { cellSize, gap };
      }
    }
  }
  
  // Fallback: 1px cells, no gap
  return { cellSize: 1, gap: 0 };
};

/**
 * Render game state to LED matrix
 */
export const renderToMatrix = (state) => {
  const matrix = createEmptyMatrix();
  const { board, size: pSize, boardSize, selectedCell, status, winner, winLine = [], turnTime, currentPlayer, hoverCell } = state || {};
  
  const size = pSize || boardSize || 9;
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

  // Draw intersection dots (grid points) - only for boards with gaps
  if (gap > 0) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const r = offsetR + row * (cellSize + gap);
        const c = offsetC + col * (cellSize + gap);
        
        // Draw grid point (small cyan dot at center)
        const centerR = r + Math.floor(cellSize / 2);
        const centerC = c + Math.floor(cellSize / 2);
        if (centerR >= 0 && centerR < MATRIX_ROWS && centerC >= 0 && centerC < MATRIX_COLS) {
          if (!board[row * size + col]) {
            matrix[centerR][centerC] = "cyan";
          }
        }
      }
    }
  }

  // Draw pieces
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
      for (let r = 0; r < cellSize; r++) {
        for (let c = 0; c < cellSize; c++) {
          const pr = cellR + r;
          const pc = cellC + c;
          if (pr >= 0 && pr < MATRIX_ROWS && pc >= 0 && pc < MATRIX_COLS) {
            matrix[pr][pc] = "orange";
          }
        }
      }
    }

    // Selection highlight
    if (isSelected && !board[i]) {
      for (let r = 0; r < cellSize; r++) {
        for (let c = 0; c < cellSize; c++) {
          const pr = cellR + r;
          const pc = cellC + c;
          if (pr >= 0 && pr < MATRIX_ROWS && pc >= 0 && pc < MATRIX_COLS) {
            // Draw border only
            if (r === 0 || r === cellSize - 1 || c === 0 || c === cellSize - 1) {
              matrix[pr][pc] = "yellow";
            }
          }
        }
      }
    }

    // Draw X piece
    if (board[i] === 'X') {
      const color = isWinning ? "yellow" : "green";
      // Fill entire cell for all sizes
      for (let r = 0; r < cellSize; r++) {
        for (let c = 0; c < cellSize; c++) {
          const pr = cellR + r;
          const pc = cellC + c;
          if (pr >= 0 && pr < MATRIX_ROWS && pc >= 0 && pc < MATRIX_COLS) {
            matrix[pr][pc] = color;
          }
        }
      }
    }
    
    // Draw O piece
    else if (board[i] === 'O') {
      const color = isWinning ? "yellow" : "blue";
      // Fill entire cell for all sizes
      for (let r = 0; r < cellSize; r++) {
        for (let c = 0; c < cellSize; c++) {
          const pr = cellR + r;
          const pc = cellC + c;
          if (pr >= 0 && pr < MATRIX_ROWS && pc >= 0 && pc < MATRIX_COLS) {
            matrix[pr][pc] = color;
          }
        }
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
  const size = pSize || boardSize || 9;
  
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
  id: 'caro4',
  name: 'CARO 4',
  apiId: 2,
  
  createInitialState,
  makeMove,
  getAIMove,
  getHintMove,
  isValidMove,
  getCellFromNav,
  renderToMatrix,
  getCellFromMatrix,
  
  sizeOptions: [
    { label: '7x7', value: 7 },
    { label: '10x10', value: 10 },
    { label: '20x20', value: 20 },
  ],
  
  defaultSettings: {
    size: 7,
    difficulty: 'medium',
    turnTime: 30,
  },
};
