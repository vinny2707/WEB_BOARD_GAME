// Match3 Core Game Logic
import { CELL_SIZE } from './constants';

/**
 * Create a new game board with random candies
 * @param {number} size - Board size (e.g., 8 for 8x8)
 * @param {number} candyCount - Number of candy types
 * @returns {Array} Board array with candy objects
 */
export const createBoard = (size, candyCount) => {
  const board = [];
  for (let i = 0; i < size * size; i++) {
    const col = i % size;
    const row = Math.floor(i / size);
    board.push({
      type: Math.floor(Math.random() * candyCount),
      key: Date.now() + i,
      y: row * CELL_SIZE + CELL_SIZE / 2,
      targetY: row * CELL_SIZE + CELL_SIZE / 2,
      vy: 0,
      scale: 1,
    });
  }
  return removeInitialMatches(board, size, candyCount);
};

/**
 * Remove any initial matches from board to ensure fair game start
 */
export const removeInitialMatches = (board, size, candyCount) => {
  const newBoard = [...board];
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    // Check horizontal matches
    if (col >= 2) {
      while (newBoard[i].type === newBoard[i - 1].type && newBoard[i].type === newBoard[i - 2].type) {
        newBoard[i] = { ...newBoard[i], type: Math.floor(Math.random() * candyCount) };
      }
    }
    // Check vertical matches
    if (row >= 2) {
      while (newBoard[i].type === newBoard[i - size].type && newBoard[i].type === newBoard[i - size * 2].type) {
        newBoard[i] = { ...newBoard[i], type: Math.floor(Math.random() * candyCount) };
      }
    }
  }
  return newBoard;
};

/**
 * Find all matching candies (3+ in a row/column)
 * @param {Array} board - Current board state
 * @param {number} boardSize - Board size
 * @returns {Set} Set of indices that are part of matches
 */
export const findMatches = (board, boardSize) => {
  const matches = new Set();
  
  // Check horizontal matches
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize - 2; col++) {
      const idx = row * boardSize + col;
      const type = board[idx]?.type;
      if (type !== null && type !== undefined && 
          board[idx + 1]?.type === type && 
          board[idx + 2]?.type === type) {
        matches.add(idx);
        matches.add(idx + 1);
        matches.add(idx + 2);
        // Check for 4+ match
        if (col < boardSize - 3 && board[idx + 3]?.type === type) {
          matches.add(idx + 3);
        }
      }
    }
  }
  
  // Check vertical matches
  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row < boardSize - 2; row++) {
      const idx = row * boardSize + col;
      const type = board[idx]?.type;
      if (type !== null && type !== undefined && 
          board[idx + boardSize]?.type === type && 
          board[idx + boardSize * 2]?.type === type) {
        matches.add(idx);
        matches.add(idx + boardSize);
        matches.add(idx + boardSize * 2);
        // Check for 4+ match
        if (row < boardSize - 3 && board[idx + boardSize * 3]?.type === type) {
          matches.add(idx + boardSize * 3);
        }
      }
    }
  }
  
  return matches;
};

/**
 * Check if two cells are adjacent
 */
export const isAdjacent = (idx1, idx2, boardSize) => {
  const row1 = Math.floor(idx1 / boardSize);
  const col1 = idx1 % boardSize;
  const row2 = Math.floor(idx2 / boardSize);
  const col2 = idx2 % boardSize;
  
  return (Math.abs(row1 - row2) === 1 && col1 === col2) || 
         (Math.abs(col1 - col2) === 1 && row1 === row2);
};

/**
 * Get target cell index based on drag offset
 */
export const getSwapTarget = (startIdx, offset, boardSize, threshold) => {
  const startRow = Math.floor(startIdx / boardSize);
  const startCol = startIdx % boardSize;
  
  if (Math.abs(offset.x) > Math.abs(offset.y)) {
    if (offset.x > threshold && startCol < boardSize - 1) return startIdx + 1;
    if (offset.x < -threshold && startCol > 0) return startIdx - 1;
  } else {
    if (offset.y > threshold && startRow < boardSize - 1) return startIdx + boardSize;
    if (offset.y < -threshold && startRow > 0) return startIdx - boardSize;
  }
  
  return null;
};

/**
 * Find a hint - a valid swap that creates a match
 * @param {Array} board - Current board state
 * @param {number} boardSize - Board size
 * @returns {Object|null} { idx1, idx2 } - Two cell indices to swap, or null if no valid move
 */
export const findHint = (board, boardSize) => {
  // Check all possible swaps (right and down only to avoid duplicates)
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const idx = row * boardSize + col;
      
      // Try swap right
      if (col < boardSize - 1) {
        const rightIdx = idx + 1;
        const testBoard = board.map(cell => ({ ...cell }));
        const type1 = testBoard[idx].type;
        const type2 = testBoard[rightIdx].type;
        testBoard[idx].type = type2;
        testBoard[rightIdx].type = type1;
        
        if (findMatches(testBoard, boardSize).size > 0) {
          return { idx1: idx, idx2: rightIdx };
        }
      }
      
      // Try swap down
      if (row < boardSize - 1) {
        const downIdx = idx + boardSize;
        const testBoard = board.map(cell => ({ ...cell }));
        const type1 = testBoard[idx].type;
        const type2 = testBoard[downIdx].type;
        testBoard[idx].type = type2;
        testBoard[downIdx].type = type1;
        
        if (findMatches(testBoard, boardSize).size > 0) {
          return { idx1: idx, idx2: downIdx };
        }
      }
    }
  }
  
  return null;
};
