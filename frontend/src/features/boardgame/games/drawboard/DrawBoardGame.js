/**
 * DrawBoard Game Module (Dot Art)
 * Draw on the LED matrix using mouse clicks/drag
 * Supports brush, oval, and rectangle tools with drag-to-draw
 * Supports different canvas sizes with visible boundary
 * 
 * API State Format:
 * - grid: 2D array of hex color codes (e.g., "#ef4444", "#FFFFFF" for empty)
 * - selectedColor: current selected color (hex code)
 * - showGrid: whether to show grid lines
 */

import { MATRIX_ROWS, MATRIX_COLS, createEmptyMatrix } from "../../utils/constants";
import { drawCenteredText } from "../../utils/ledUtils";

// ============== CONSTANTS ==============

// Empty cell color (matches API format)
const EMPTY_CELL = "#FFFFFF";

// Color palette with hex codes for API sync
export const DRAW_COLORS = [
  { name: 'red', hex: '#ef4444' },
  { name: 'orange', hex: '#f97316' },
  { name: 'yellow', hex: '#eab308' },
  { name: 'green', hex: '#22c55e' },
  { name: 'cyan', hex: '#06b6d4' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'purple', hex: '#a855f7' },
  { name: 'pink', hex: '#ec4899' },
  { name: 'white', hex: '#f8fafc' },
];

// Map for quick lookups
const COLOR_NAME_TO_HEX = DRAW_COLORS.reduce((acc, c) => { acc[c.name] = c.hex; return acc; }, {});
const HEX_TO_COLOR_NAME = DRAW_COLORS.reduce((acc, c) => { acc[c.hex.toLowerCase()] = c.name; return acc; }, {});

/**
 * Convert color name to hex code
 */
const colorToHex = (color) => {
  if (!color) return EMPTY_CELL;
  if (color.startsWith('#')) return color;
  return COLOR_NAME_TO_HEX[color] || color;
};

/**
 * Convert hex code to color name (for display)
 */
const hexToColorName = (hex) => {
  if (!hex) return null;
  return HEX_TO_COLOR_NAME[hex.toLowerCase()] || hex;
};

export const TOOLS = {
  BRUSH: 'brush',
  OVAL: 'oval',
  RECT: 'rect',
  ERASER: 'eraser',
};

// Size options matching API settings
export const SIZE_OPTIONS = [
  { label: 'Nhỏ (16x16)', value: 16, rows: 16, cols: 16 },
  { label: 'Vừa (24x24)', value: 24, rows: 24, cols: 24 },
  { label: 'Lớn (32x32)', value: 32, rows: 32, cols: 32 },
];

// ============== HELPER FUNCTIONS ==============

/**
 * Calculate canvas offset to center it on the LED matrix
 */
const getCanvasOffset = (canvasRows, canvasCols) => {
  const offsetRow = Math.floor((MATRIX_ROWS - canvasRows) / 2);
  const offsetCol = Math.floor((MATRIX_COLS - canvasCols) / 2);
  return { offsetRow, offsetCol };
};

/**
 * Check if a cell color is empty
 */
const isEmptyCell = (color) => {
  return !color || color === EMPTY_CELL || color === null || color.toUpperCase() === '#FFFFFF';
};

/**
 * Create empty grid with EMPTY_CELL values (API format)
 */
const createEmptyGrid = (rows, cols) => {
  return Array(rows).fill(null).map(() => Array(cols).fill(EMPTY_CELL));
};

// ============== GAME LOGIC ==============

export const createInitialState = (settings = {}) => {
  // Parse size from settings (could be number like 24 or string like "24x24")
  let canvasSize = 24; // default
  if (settings.size) {
    if (typeof settings.size === 'number') {
      canvasSize = settings.size;
    } else if (typeof settings.size === 'string') {
      const parsed = parseInt(settings.size.split('x')[0]);
      if (!isNaN(parsed)) canvasSize = parsed;
    }
  }
  
  // Limit canvas size to fit within LED matrix (with 2px border on each side)
  const maxRows = Math.min(canvasSize, MATRIX_ROWS - 2);
  const maxCols = Math.min(canvasSize, MATRIX_COLS - 2);
  
  return {
    // Use 'grid' to match API format
    grid: createEmptyGrid(maxRows, maxCols),
    canvasRows: maxRows,
    canvasCols: maxCols,
    selectedColor: DRAW_COLORS[0].hex, // Store hex code
    selectedColorIndex: 0,
    tool: TOOLS.BRUSH,
    showGrid: true,
    // For drag-based shape drawing
    shapeStart: null,
    shapePreview: null,
    isDrawingShape: false,
    status: 'playing',
    size: canvasSize,
    selectedCell: 0,
  };
};

const paintCell = (state, row, col, color) => {
  const { grid, canvasRows, canvasCols } = state;
  const { offsetRow, offsetCol } = getCanvasOffset(canvasRows, canvasCols);
  
  // Convert to local canvas coordinates
  const localRow = row - offsetRow;
  const localCol = col - offsetCol;
  
  // Convert color to hex for storage
  const hexColor = colorToHex(color);
  
  // Check bounds
  if (localRow >= 0 && localRow < canvasRows && localCol >= 0 && localCol < canvasCols) {
    const newGrid = grid.map(r => [...r]);
    newGrid[localRow][localCol] = hexColor;
    return newGrid;
  }
  return grid;
};

const drawRectOnCanvas = (state, startRow, startCol, endRow, endCol, color) => {
  const { grid, canvasRows, canvasCols } = state;
  const { offsetRow, offsetCol } = getCanvasOffset(canvasRows, canvasCols);
  const newGrid = grid.map(r => [...r]);
  const hexColor = colorToHex(color);
  
  // Convert to local coordinates
  const localStartRow = startRow - offsetRow;
  const localStartCol = startCol - offsetCol;
  const localEndRow = endRow - offsetRow;
  const localEndCol = endCol - offsetCol;
  
  const minRow = Math.max(0, Math.min(localStartRow, localEndRow));
  const maxRow = Math.min(canvasRows - 1, Math.max(localStartRow, localEndRow));
  const minCol = Math.max(0, Math.min(localStartCol, localEndCol));
  const maxCol = Math.min(canvasCols - 1, Math.max(localStartCol, localEndCol));
  
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      newGrid[r][c] = hexColor;
    }
  }
  return newGrid;
};

const drawOvalOnCanvas = (state, startRow, startCol, endRow, endCol, color) => {
  const { grid, canvasRows, canvasCols } = state;
  const { offsetRow, offsetCol } = getCanvasOffset(canvasRows, canvasCols);
  const newGrid = grid.map(r => [...r]);
  const hexColor = colorToHex(color);
  
  // Convert to local coordinates
  const localStartRow = startRow - offsetRow;
  const localStartCol = startCol - offsetCol;
  const localEndRow = endRow - offsetRow;
  const localEndCol = endCol - offsetCol;
  
  const centerRow = (localStartRow + localEndRow) / 2;
  const centerCol = (localStartCol + localEndCol) / 2;
  const radiusRow = Math.abs(localEndRow - localStartRow) / 2;
  const radiusCol = Math.abs(localEndCol - localStartCol) / 2;
  
  if (radiusRow === 0 || radiusCol === 0) {
    return drawRectOnCanvas(state, startRow, startCol, endRow, endCol, color);
  }
  
  for (let r = 0; r < canvasRows; r++) {
    for (let c = 0; c < canvasCols; c++) {
      const dr = (r - centerRow) / radiusRow;
      const dc = (c - centerCol) / radiusCol;
      if (dr * dr + dc * dc <= 1) {
        newGrid[r][c] = hexColor;
      }
    }
  }
  return newGrid;
};

export const isValidMove = (state, cellIndex) => state.status === 'playing';

/**
 * Check if click is within canvas bounds
 */
const isClickInCanvas = (state, row, col) => {
  const { canvasRows, canvasCols } = state;
  const { offsetRow, offsetCol } = getCanvasOffset(canvasRows, canvasCols);
  const localRow = row - offsetRow;
  const localCol = col - offsetCol;
  return localRow >= 0 && localRow < canvasRows && localCol >= 0 && localCol < canvasCols;
};

/**
 * Start drawing (mouse down)
 */
export const startDraw = (state, cellIndex) => {
  const row = Math.floor(cellIndex / MATRIX_COLS);
  const col = cellIndex % MATRIX_COLS;
  
  // Only allow drawing within canvas bounds
  if (!isClickInCanvas(state, row, col)) {
    return state;
  }
  
  if (state.tool === TOOLS.BRUSH || state.tool === TOOLS.ERASER) {
    const color = state.tool === TOOLS.ERASER ? EMPTY_CELL : state.selectedColor;
    return {
      ...state,
      grid: paintCell(state, row, col, color),
      isDrawingShape: true,
    };
  }
  
  // Shape tools - start position
  return {
    ...state,
    shapeStart: { row, col },
    shapePreview: { row, col },
    isDrawingShape: true,
  };
};

/**
 * Continue drawing (mouse move while pressed)
 */
export const continueDraw = (state, cellIndex) => {
  if (!state.isDrawingShape) return state;
  
  const row = Math.floor(cellIndex / MATRIX_COLS);
  const col = cellIndex % MATRIX_COLS;
  
  // Only allow drawing within canvas bounds
  if (!isClickInCanvas(state, row, col)) {
    return state;
  }
  
  if (state.tool === TOOLS.BRUSH || state.tool === TOOLS.ERASER) {
    const color = state.tool === TOOLS.ERASER ? EMPTY_CELL : state.selectedColor;
    return {
      ...state,
      grid: paintCell(state, row, col, color),
    };
  }
  
  // Shape tools - update preview position
  return {
    ...state,
    shapePreview: { row, col },
  };
};

/**
 * Finish drawing (mouse up)
 */
export const endDraw = (state, cellIndex) => {
  if (!state.isDrawingShape) return state;
  
  const row = Math.floor(cellIndex / MATRIX_COLS);
  const col = cellIndex % MATRIX_COLS;
  
  if (state.tool === TOOLS.BRUSH || state.tool === TOOLS.ERASER) {
    return {
      ...state,
      isDrawingShape: false,
    };
  }
  
  // Shape tools - draw final shape
  if (state.shapeStart) {
    const { row: startRow, col: startCol } = state.shapeStart;
    const color = state.selectedColor;
    let newGrid;
    
    if (state.tool === TOOLS.RECT) {
      newGrid = drawRectOnCanvas(state, startRow, startCol, row, col, color);
    } else if (state.tool === TOOLS.OVAL) {
      newGrid = drawOvalOnCanvas(state, startRow, startCol, row, col, color);
    } else {
      newGrid = state.grid;
    }
    
    return {
      ...state,
      grid: newGrid,
      shapeStart: null,
      shapePreview: null,
      isDrawingShape: false,
    };
  }
  
  return { ...state, isDrawingShape: false };
};

/**
 * Legacy makeMove - delegates to startDraw for click actions
 */
export const makeMove = (state, cellIndex, player = null) => {
  return startDraw(state, cellIndex);
};

export const setTool = (state, tool) => ({
  ...state,
  tool,
  shapeStart: null,
  shapePreview: null,
  isDrawingShape: false,
});

export const setColor = (state, color, colorIndex) => ({
  ...state,
  selectedColor: colorToHex(color), // Ensure we store hex
  selectedColorIndex: colorIndex,
});

export const clearCanvas = (state) => ({
  ...state,
  grid: createEmptyGrid(state.canvasRows, state.canvasCols),
  shapeStart: null,
  shapePreview: null,
});

export const getAIMove = (state) => -1;

export const getCellFromNav = (state, direction) => state.selectedCell;

// ============== LED RENDERING ==============

export const renderToMatrix = (state) => {
  const matrix = createEmptyMatrix();
  const { grid, canvasRows, canvasCols, shapeStart, shapePreview, tool, isDrawingShape } = state;
  const { offsetRow, offsetCol } = getCanvasOffset(canvasRows, canvasCols);
  
  // Draw border around canvas (1px outside the canvas area)
  const borderColor = 'cyan';
  const borderTop = offsetRow - 1;
  const borderBottom = offsetRow + canvasRows;
  const borderLeft = offsetCol - 1;
  const borderRight = offsetCol + canvasCols;
  
  // Draw horizontal borders
  if (borderTop >= 0) {
    for (let c = borderLeft; c <= borderRight && c < MATRIX_COLS; c++) {
      if (c >= 0) matrix[borderTop][c] = borderColor;
    }
  }
  if (borderBottom < MATRIX_ROWS) {
    for (let c = borderLeft; c <= borderRight && c < MATRIX_COLS; c++) {
      if (c >= 0) matrix[borderBottom][c] = borderColor;
    }
  }
  
  // Draw vertical borders
  if (borderLeft >= 0) {
    for (let r = borderTop; r <= borderBottom && r < MATRIX_ROWS; r++) {
      if (r >= 0) matrix[r][borderLeft] = borderColor;
    }
  }
  if (borderRight < MATRIX_COLS) {
    for (let r = borderTop; r <= borderBottom && r < MATRIX_ROWS; r++) {
      if (r >= 0) matrix[r][borderRight] = borderColor;
    }
  }
  
  // Draw canvas content
  for (let r = 0; r < canvasRows; r++) {
    for (let c = 0; c < canvasCols; c++) {
      const cellColor = grid[r]?.[c];
      if (!isEmptyCell(cellColor)) {
        const matrixR = r + offsetRow;
        const matrixC = c + offsetCol;
        if (matrixR < MATRIX_ROWS && matrixC < MATRIX_COLS) {
          matrix[matrixR][matrixC] = cellColor;
        }
      }
    }
  }
  
  // Draw shape preview while dragging (for rect/oval)
  if (isDrawingShape && shapeStart && shapePreview && (tool === TOOLS.RECT || tool === TOOLS.OVAL)) {
    const { row: startRow, col: startCol } = shapeStart;
    const { row: endRow, col: endCol } = shapePreview;
    const minRow = Math.max(offsetRow, Math.min(startRow, endRow));
    const maxRow = Math.min(offsetRow + canvasRows - 1, Math.max(startRow, endRow));
    const minCol = Math.max(offsetCol, Math.min(startCol, endCol));
    const maxCol = Math.min(offsetCol + canvasCols - 1, Math.max(startCol, endCol));
    
    // Draw preview outline
    for (let r = minRow; r <= maxRow; r++) {
      if (!matrix[r][minCol] || matrix[r][minCol] === 0) matrix[r][minCol] = 'white';
      if (!matrix[r][maxCol] || matrix[r][maxCol] === 0) matrix[r][maxCol] = 'white';
    }
    for (let c = minCol; c <= maxCol; c++) {
      if (!matrix[minRow][c] || matrix[minRow][c] === 0) matrix[minRow][c] = 'white';
      if (!matrix[maxRow][c] || matrix[maxRow][c] === 0) matrix[maxRow][c] = 'white';
    }
  }
  
  return matrix;
};

export const getCellFromMatrix = (state, matrixR, matrixC) => {
  if (matrixR >= 0 && matrixR < MATRIX_ROWS && matrixC >= 0 && matrixC < MATRIX_COLS) {
    return matrixR * MATRIX_COLS + matrixC;
  }
  return -1;
};

export const renderSettingsToMatrix = (size, sizeOptions = [], selectedIndex = 0) => {
  const matrix = createEmptyMatrix();
  
  // Parse size value
  let canvasSize = 24;
  if (typeof size === 'number') {
    canvasSize = size;
  } else if (typeof size === 'string') {
    const parsed = parseInt(size.split('x')[0]);
    if (!isNaN(parsed)) canvasSize = parsed;
  }
  
  // Draw title
  drawCenteredText(matrix, "DOT ART", 4, "cyan");
  
  // Draw preview of canvas size (scaled down representation)
  const previewSize = Math.min(Math.floor(canvasSize / 3), 10);
  const { offsetRow, offsetCol } = getCanvasOffset(previewSize, previewSize);
  const adjustedOffsetRow = offsetRow; // Center vertically
  
  // Draw preview border (yellow rectangle showing canvas preview)
  for (let c = offsetCol - 1; c <= offsetCol + previewSize; c++) {
    if (c >= 0 && c < MATRIX_COLS) {
      if (adjustedOffsetRow - 1 >= 0) matrix[adjustedOffsetRow - 1][c] = 'yellow';
      if (adjustedOffsetRow + previewSize < MATRIX_ROWS) matrix[adjustedOffsetRow + previewSize][c] = 'yellow';
    }
  }
  for (let r = adjustedOffsetRow - 1; r <= adjustedOffsetRow + previewSize; r++) {
    if (r >= 0 && r < MATRIX_ROWS) {
      if (offsetCol - 1 >= 0) matrix[r][offsetCol - 1] = 'yellow';
      if (offsetCol + previewSize < MATRIX_COLS) matrix[r][offsetCol + previewSize] = 'yellow';
    }
  }
  
  // Fill inside with grid dots to show pixel density
  for (let r = 0; r < previewSize; r++) {
    for (let c = 0; c < previewSize; c++) {
      // Show a pattern of dots to indicate grid
      if ((r + c) % 3 === 0) {
        const mr = adjustedOffsetRow + r;
        const mc = offsetCol + c;
        if (mr >= 0 && mr < MATRIX_ROWS && mc >= 0 && mc < MATRIX_COLS) {
          matrix[mr][mc] = 'cyan';
        }
      }
    }
  }
  
  // Draw size label at bottom
  const sizeLabel = `${canvasSize}x${canvasSize}`;
  drawCenteredText(matrix, sizeLabel, MATRIX_ROWS - 6, "white");
  
  // Draw navigation arrows if there are multiple options
  if (sizeOptions.length > 1) {
    const arrowRow = Math.floor(MATRIX_ROWS / 2);
    
    // Left arrow (if not first option)
    if (selectedIndex > 0) {
      // Arrow pointing left: <
      matrix[arrowRow][4] = 'white';
      matrix[arrowRow - 1][5] = 'white';
      matrix[arrowRow + 1][5] = 'white';
      matrix[arrowRow - 2][6] = 'white';
      matrix[arrowRow + 2][6] = 'white';
    }
    
    // Right arrow (if not last option)
    if (selectedIndex < sizeOptions.length - 1) {
      // Arrow pointing right: >
      matrix[arrowRow][MATRIX_COLS - 5] = 'white';
      matrix[arrowRow - 1][MATRIX_COLS - 6] = 'white';
      matrix[arrowRow + 1][MATRIX_COLS - 6] = 'white';
      matrix[arrowRow - 2][MATRIX_COLS - 7] = 'white';
      matrix[arrowRow + 2][MATRIX_COLS - 7] = 'white';
    }
  }
  
  return matrix;
};

// ============== STATE CONVERSION (for API compatibility) ==============

/**
 * Convert internal state to API format for saving
 */
export const toApiState = (state) => {
  return {
    grid: state.grid,
    selectedColor: state.selectedColor,
    showGrid: state.showGrid ?? true,
  };
};

/**
 * Convert API state to internal state for loading
 */
export const fromApiState = (apiState, settings = {}) => {
  const grid = apiState.grid || [];
  const canvasRows = grid.length;
  const canvasCols = grid[0]?.length || canvasRows;
  
  // Parse size from settings
  let size = canvasRows;
  if (settings.size) {
    if (typeof settings.size === 'string') {
      const parsed = parseInt(settings.size.split('x')[0]);
      if (!isNaN(parsed)) size = parsed;
    } else if (typeof settings.size === 'number') {
      size = settings.size;
    }
  }
  
  // Find color index
  // Ensure selectedColor is hex
  const rawColor = apiState.selectedColor || DRAW_COLORS[0].hex;
  const selectedColor = colorToHex(rawColor);
  
  // Find index by hex (case-insensitive)
  const selectedColorIndex = DRAW_COLORS.findIndex(
    c => c.hex.toLowerCase() === selectedColor.toLowerCase()
  );
  
  return {
    grid: grid,
    canvasRows: canvasRows,
    canvasCols: canvasCols,
    selectedColor: selectedColor,
    selectedColorIndex: selectedColorIndex >= 0 ? selectedColorIndex : 0,
    tool: TOOLS.BRUSH,
    showGrid: apiState.showGrid ?? true,
    shapeStart: null,
    shapePreview: null,
    isDrawingShape: false,
    status: 'playing',
    size: size,
    selectedCell: 0,
  };
};

// ============== EXPORT ==============

export default {
  id: 'dotart',
  name: 'DOT ART',
  apiId: 13,
  backendType: 'draw_board',
  
  createInitialState,
  makeMove,
  startDraw,
  continueDraw,
  endDraw,
  getAIMove,
  isValidMove,
  getCellFromNav,
  renderToMatrix,
  renderSettingsToMatrix,
  getCellFromMatrix,
  setTool,
  setColor,
  clearCanvas,
  toApiState,
  fromApiState,
  TOOLS,
  DRAW_COLORS,
  EMPTY_CELL,
  
  isDrawingGame: true,
  noAI: true,
  
  // Size options for settings screen (used when API fails to load)
  sizeOptions: SIZE_OPTIONS,
  defaultSettings: { size: 24 },
};
