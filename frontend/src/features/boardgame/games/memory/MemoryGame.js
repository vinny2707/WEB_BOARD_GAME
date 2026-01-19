/**
 * Memory Match Game Module
 * Lật thẻ tìm cặp giống nhau - LED version
 */

import {
  MATRIX_ROWS,
  MATRIX_COLS,
  createEmptyMatrix,
} from "../../utils/constants";
import { drawCenteredText } from "../../utils/ledUtils";

// ============== CONSTANTS ==============

const CARD_COLORS = [
  "red", // Type 0
  "green", // Type 1
  "blue", // Type 2
  "yellow", // Type 3
  "purple", // Type 4
  "orange", // Type 5
  "pink", // Type 6
  "white", // Type 7
];

const FACE_DOWN_COLOR = "cyan";

// ============== HELPER FUNCTIONS ==============

/**
 * Parse size value to get rows and cols
 * Supports:
 * - API format: 4, 6, 8 for NxN grids (single digit = square grid)
 * - Legacy format: 34 = 3x4, 44 = 4x4, 46 = 4x6 (two digits = rows x cols)
 */
const parseSize = (size) => {
  const sizeNum = Number(size);

  // Single digit (4, 6, 8) = NxN square grid from API
  if (sizeNum >= 1 && sizeNum <= 9) {
    return { rows: sizeNum, cols: sizeNum };
  }

  // Two digit format (34, 44, 46) = rows x cols
  const sizeStr = String(size);
  if (sizeStr.length === 2) {
    return {
      rows: parseInt(sizeStr[0]),
      cols: parseInt(sizeStr[1]),
    };
  }

  // Default 4x4
  return { rows: 4, cols: 4 };
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Create shuffled cards array
 */
const createCards = (totalCards) => {
  const pairs = totalCards / 2;
  const types = [];

  // Create pairs of each type
  for (let i = 0; i < pairs; i++) {
    const type = i % CARD_COLORS.length;
    types.push(type, type); // Add pair
  }

  // Shuffle
  const shuffled = shuffleArray(types);

  // Create card objects
  return shuffled.map((type, id) => ({
    id,
    type,
    flipped: false,
    matched: false,
  }));
};

// ============== GAME LOGIC ==============

/**
 * Create initial game state
 */
export const createInitialState = (settings = {}) => {
  const { rows, cols } = parseSize(settings.size || 44);
  const totalCards = rows * cols;
  const totalPairs = totalCards / 2;

  return {
    gridRows: rows,
    gridCols: cols,
    totalPairs,
    cards: createCards(totalCards),
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    selectedCell: 0,
    status: "playing",
    isChecking: false,
    lastFlipTime: null,
  };
};

/**
 * Check if move is valid (can flip this card)
 */
export const isValidMove = (state, cellIndex) => {
  if (state.status !== "playing") return false;
  if (state.isChecking) return false;
  if (cellIndex < 0 || cellIndex >= state.cards.length) return false;

  const card = state.cards[cellIndex];
  if (card.matched) return false;
  if (card.flipped) return false;
  if (state.flippedCards.length >= 2) return false;

  return true;
};

/**
 * Make a move (flip a card)
 * Returns { newState, needsDelayedCheck }
 */
export const makeMove = (state, cellIndex) => {
  if (!isValidMove(state, cellIndex)) {
    return state;
  }

  const newCards = state.cards.map((card, i) =>
    i === cellIndex ? { ...card, flipped: true } : card,
  );

  const newFlippedCards = [...state.flippedCards, cellIndex];

  // First card flipped
  if (newFlippedCards.length === 1) {
    return {
      ...state,
      cards: newCards,
      flippedCards: newFlippedCards,
    };
  }

  // Second card flipped - check match
  if (newFlippedCards.length === 2) {
    const [firstIdx, secondIdx] = newFlippedCards;
    const firstCard = newCards[firstIdx];
    const secondCard = newCards[secondIdx];

    const isMatch = firstCard.type === secondCard.type;

    if (isMatch) {
      // Mark as matched immediately
      const matchedCards = newCards.map((card, i) =>
        i === firstIdx || i === secondIdx ? { ...card, matched: true } : card,
      );

      const newMatchedPairs = state.matchedPairs + 1;
      const isWin = newMatchedPairs === state.totalPairs;

      return {
        ...state,
        cards: matchedCards,
        flippedCards: [],
        matchedPairs: newMatchedPairs,
        moves: state.moves + 1,
        status: isWin ? "win" : "playing",
      };
    } else {
      // Not a match - need delayed flip back
      return {
        ...state,
        cards: newCards,
        flippedCards: newFlippedCards,
        moves: state.moves + 1,
        isChecking: true,
        lastFlipTime: Date.now(),
      };
    }
  }

  return state;
};

/**
 * Called after delay to flip back non-matching cards
 */
export const flipBackCards = (state) => {
  if (!state.isChecking || state.flippedCards.length !== 2) {
    return state;
  }

  const [firstIdx, secondIdx] = state.flippedCards;
  const newCards = state.cards.map((card, i) =>
    i === firstIdx || i === secondIdx ? { ...card, flipped: false } : card,
  );

  return {
    ...state,
    cards: newCards,
    flippedCards: [],
    isChecking: false,
    lastFlipTime: null,
  };
};

// ============== AI (Not used for Memory, but required interface) ==============

export const getAIMove = () => {
  // Memory is single player, no AI needed
  return -1;
};

// ============== NAVIGATION ==============

export const getCellFromNav = (state, direction) => {
  const { selectedCell, gridRows, gridCols } = state;
  const row = Math.floor(selectedCell / gridCols);
  const col = selectedCell % gridCols;

  switch (direction) {
    case "up":
      return row > 0
        ? (row - 1) * gridCols + col
        : (gridRows - 1) * gridCols + col;
    case "down":
      return row < gridRows - 1 ? (row + 1) * gridCols + col : col;
    case "left":
      return col > 0
        ? row * gridCols + (col - 1)
        : row * gridCols + (gridCols - 1);
    case "right":
      return col < gridCols - 1 ? row * gridCols + (col + 1) : row * gridCols;
    default:
      return selectedCell;
  }
};

// ============== LED RENDERING ==============

const getCardSize = (rows, cols) => {
  const availableRows = MATRIX_ROWS - 8; // Leave space for text
  const availableCols = MATRIX_COLS - 4;
  const gap = 1;

  const maxCardHeight = Math.floor((availableRows - (rows - 1) * gap) / rows);
  const maxCardWidth = Math.floor((availableCols - (cols - 1) * gap) / cols);

  return Math.max(4, Math.min(7, Math.min(maxCardHeight, maxCardWidth)));
};

export const renderToMatrix = (state) => {
  const matrix = createEmptyMatrix();
  const {
    cards,
    gridRows,
    gridCols,
    selectedCell,
    status,
    moves,
    matchedPairs,
    totalPairs,
  } = state || {};

  if (!cards || cards.length === 0) return matrix;

  const cardSize = getCardSize(gridRows, gridCols);
  const gap = 1;
  const gridWidth = gridCols * cardSize + (gridCols - 1) * gap;
  const gridHeight = gridRows * cardSize + (gridRows - 1) * gap;

  const offsetR = Math.floor((MATRIX_ROWS - gridHeight) / 2);
  const offsetC = Math.floor((MATRIX_COLS - gridWidth) / 2);

  // Draw each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const row = Math.floor(i / gridCols);
    const col = i % gridCols;

    const cardR = offsetR + row * (cardSize + gap);
    const cardC = offsetC + col * (cardSize + gap);

    const isSelected = selectedCell === i && status === "playing";
    const isFlipped = card.flipped;
    const isMatched = card.matched;

    // Determine card color
    let cardColor;
    if (isFlipped || isMatched) {
      cardColor = CARD_COLORS[card.type];
    } else {
      cardColor = FACE_DOWN_COLOR;
    }

    // Draw card
    for (let r = 0; r < cardSize; r++) {
      for (let c = 0; c < cardSize; c++) {
        const pr = cardR + r;
        const pc = cardC + c;

        if (pr >= 0 && pr < MATRIX_ROWS && pc >= 0 && pc < MATRIX_COLS) {
          // Card fill (inner area)
          if (r > 0 && r < cardSize - 1 && c > 0 && c < cardSize - 1) {
            if (isFlipped || isMatched) {
              matrix[pr][pc] = cardColor;
            }
          }

          // Card border
          if (r === 0 || r === cardSize - 1 || c === 0 || c === cardSize - 1) {
            if (isSelected && !isMatched) {
              // Yellow border for selected card
              matrix[pr][pc] = "yellow";
            } else if (isMatched) {
              // Dim border for matched
              matrix[pr][pc] = "green";
            } else {
              // Normal border
              matrix[pr][pc] = cardColor;
            }
          }
        }
      }
    }

    // Draw symbol in center for flipped/matched cards
    if ((isFlipped || isMatched) && cardSize >= 5) {
      const centerR = cardR + Math.floor(cardSize / 2);
      const centerC = cardC + Math.floor(cardSize / 2);
      if (
        centerR >= 0 &&
        centerR < MATRIX_ROWS &&
        centerC >= 0 &&
        centerC < MATRIX_COLS
      ) {
        matrix[centerR][centerC] = "white";
      }
    }
  }

  // Status text only on win
  if (status === "win") {
    drawCenteredText(matrix, "YOU WIN!", 1, "green");
    drawCenteredText(matrix, `${moves} MOVES`, MATRIX_ROWS - 4, "yellow");
  }
  // Progress (matchedPairs/totalPairs) is shown in sidebar, not on LED matrix

  return matrix;
};

/**
 * Get cell index from matrix click coordinates
 */
export const getCellFromMatrix = (state, matrixR, matrixC) => {
  const { gridRows, gridCols, cards } = state || {};

  if (!cards || cards.length === 0) return -1;

  const cardSize = getCardSize(gridRows, gridCols);
  const gap = 1;
  const gridWidth = gridCols * cardSize + (gridCols - 1) * gap;
  const gridHeight = gridRows * cardSize + (gridRows - 1) * gap;

  const offsetR = Math.floor((MATRIX_ROWS - gridHeight) / 2);
  const offsetC = Math.floor((MATRIX_COLS - gridWidth) / 2);

  // Check bounds
  if (
    matrixR < offsetR ||
    matrixR >= offsetR + gridHeight ||
    matrixC < offsetC ||
    matrixC >= offsetC + gridWidth
  ) {
    return -1;
  }

  // Calculate relative position
  const relR = matrixR - offsetR;
  const relC = matrixC - offsetC;

  const unit = cardSize + gap;
  const row = Math.floor(relR / unit);
  const col = Math.floor(relC / unit);

  // Check if click is in gap
  if (relR % unit >= cardSize || relC % unit >= cardSize) {
    return -1;
  }

  if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
    return row * gridCols + col;
  }

  return -1;
};

/**
 * Render settings preview (grid pattern)
 */
export const renderSettingsToMatrix = (size) => {
  const matrix = createEmptyMatrix();
  const { rows, cols } = parseSize(size);

  const cardSize = 4;
  const gap = 1;
  const gridWidth = cols * cardSize + (cols - 1) * gap;
  const gridHeight = rows * cardSize + (rows - 1) * gap;

  const offsetR = Math.floor((MATRIX_ROWS - gridHeight) / 2);
  const offsetC = Math.floor((MATRIX_COLS - gridWidth) / 2);

  // Draw card outlines
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cardR = offsetR + row * (cardSize + gap);
      const cardC = offsetC + col * (cardSize + gap);

      // Draw border only
      for (let r = 0; r < cardSize; r++) {
        for (let c = 0; c < cardSize; c++) {
          const pr = cardR + r;
          const pc = cardC + c;

          if (pr >= 0 && pr < MATRIX_ROWS && pc >= 0 && pc < MATRIX_COLS) {
            if (
              r === 0 ||
              r === cardSize - 1 ||
              c === 0 ||
              c === cardSize - 1
            ) {
              matrix[pr][pc] = "cyan";
            }
          }
        }
      }
    }
  }

  return matrix;
};

// ============== EXPORT GAME MODULE ==============

export default {
  id: "memory",
  name: "MEMORY",
  apiId: 6,

  createInitialState,
  makeMove,
  getAIMove,
  isValidMove,
  getCellFromNav,
  renderToMatrix,
  getCellFromMatrix,
  renderSettingsToMatrix,
  flipBackCards,

  sizeOptions: [
    { label: "3x4", value: 34 },
    { label: "4x4", value: 44 },
    { label: "4x6", value: 46 },
  ],

  defaultSettings: {
    size: 44,
  },
};
