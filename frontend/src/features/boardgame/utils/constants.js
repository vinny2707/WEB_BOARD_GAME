// LED Matrix Constants - Large size to fill screen
export const MATRIX_ROWS = 32;
export const MATRIX_COLS = 48;
export const DOT_SIZE = 14;
export const DOT_GAP = 2;

// Calculate board dimensions
export const BOARD_WIDTH = MATRIX_COLS * (DOT_SIZE + DOT_GAP);
export const BOARD_HEIGHT = MATRIX_ROWS * (DOT_SIZE + DOT_GAP);

// LED Color palette
export const LED_COLORS = {
  off: "rgba(20, 20, 30, 0.8)",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  cyan: "#06b6d4",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  white: "#f8fafc",
};

// Game modes
export const MODES = {
  GAME_SELECT: "GAME_SELECT",
  SETTINGS: "SETTINGS",
  PLAYING: "PLAYING",
};

// Create empty LED matrix
export const createEmptyMatrix = () =>
  Array(MATRIX_ROWS).fill(null).map(() => Array(MATRIX_COLS).fill(0));

// Game types
export const GAME_TYPES = {
  TICTACTOE: "tictactoe",
  SNAKE: "snake",
  MEMORY: "memory",
};
