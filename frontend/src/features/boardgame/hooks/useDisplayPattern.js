/**
 * useDisplayPattern Hook
 * Calculates the LED matrix pattern based on current game state and mode
 */
import { useMemo } from 'react';
import { MODES, createEmptyMatrix, MATRIX_ROWS, MATRIX_COLS } from '../utils/constants';
import { drawCenteredText } from '../utils/ledUtils';

/**
 * Generate settings preview pattern
 */
const generateSettingsPattern = (gameType, sizeOptions, selectedIndex) => {
  const pattern = createEmptyMatrix();
  if (!sizeOptions || sizeOptions.length === 0) return pattern;

  const selectedSize = sizeOptions[selectedIndex]?.value || 3;
  const isLargeBoard = selectedSize > 5 || gameType?.startsWith?.("caro");
  const cellSize = isLargeBoard ? 1 : 3;
  const gap = isLargeBoard ? 1 : 2;
  const gridW = selectedSize * cellSize + (selectedSize - 1) * gap;
  const gridH = gridW;

  if (gridH > MATRIX_ROWS || gridW > MATRIX_COLS) {
    drawCenteredText(pattern, `${selectedSize}x${selectedSize}`, 10, "red");
    return pattern;
  }

  const oR = Math.floor((MATRIX_ROWS - gridH) / 2);
  const oC = Math.floor((MATRIX_COLS - gridW) / 2);

  for (let row = 0; row < selectedSize; row++) {
    for (let col = 0; col < selectedSize; col++) {
      const r = oR + row * (cellSize + gap);
      const c = oC + col * (cellSize + gap);

      if (isLargeBoard) {
        if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
          pattern[r][c] = "cyan";
        }
      } else {
        const centerR = r + 1;
        const centerC = c + 1;
        if (centerR < MATRIX_ROWS && centerC < MATRIX_COLS) pattern[centerR][centerC] = "yellow";
        if (r < MATRIX_ROWS && c < MATRIX_COLS) pattern[r][c] = "cyan";
        if (r < MATRIX_ROWS && c + 2 < MATRIX_COLS) pattern[r][c + 2] = "cyan";
        if (r + 2 < MATRIX_ROWS && c < MATRIX_COLS) pattern[r + 2][c] = "cyan";
        if (r + 2 < MATRIX_ROWS && c + 2 < MATRIX_COLS) pattern[r + 2][c + 2] = "cyan";
      }
    }
  }

  // Arrow indicators
  const arrowRow = Math.floor(MATRIX_ROWS / 2);
  if (selectedIndex > 0 && oC > 4) {
    pattern[arrowRow][2] = "white";
    pattern[arrowRow - 1][3] = "white";
    pattern[arrowRow + 1][3] = "white";
  }
  if (selectedIndex < sizeOptions.length - 1 && oC + gridW < MATRIX_COLS - 4) {
    pattern[arrowRow][MATRIX_COLS - 3] = "white";
    pattern[arrowRow - 1][MATRIX_COLS - 4] = "white";
    pattern[arrowRow + 1][MATRIX_COLS - 4] = "white";
  }

  return pattern;
};

/**
 * @param {Object} params
 * @param {string} params.mode - Current mode
 * @param {Object} params.currentGamePattern - Pattern for current game
 * @param {Array} params.sizeOptions - Available size options
 * @param {number} params.selectedSizeIndex - Selected size index
 * @param {Object} params.gameModule - Game module
 * @param {Object} params.gameState - Current game state
 * @param {string} params.activeGameKey - Active game key
 * @param {boolean} params.showHint - Whether to show hint
 * @param {number} params.hoverCell - Hovered cell index
 */
export const useDisplayPattern = ({
  mode,
  currentGamePattern,
  sizeOptions,
  selectedSizeIndex,
  gameModule,
  gameState,
  activeGameKey,
  showHint,
  hoverCell,
}) => {
  const displayPattern = useMemo(() => {
    if (mode === MODES.GAME_SELECT) {
      return currentGamePattern?.pattern || createEmptyMatrix();
    }

    if (mode === MODES.SETTINGS) {
      // For Snake, use its custom settings renderer
      if (activeGameKey === 'snake' && gameModule?.renderSettingsToMatrix) {
        const selectedSize = sizeOptions[selectedSizeIndex]?.value || 15;
        return gameModule.renderSettingsToMatrix(selectedSize);
      }
      // For other games, use default settings pattern
      return generateSettingsPattern(currentGamePattern?.type, sizeOptions, selectedSizeIndex);
    }

    if (mode === MODES.PLAYING && gameModule && gameState) {
      // Show hint overlay for Snake if showHint is true
      if (activeGameKey === 'snake' && showHint && gameModule?.renderHint) {
        return gameModule.renderHint();
      }

      // For other games, pass hover state if needed (standard render)
      return gameModule.renderToMatrix({ ...gameState, hoverCell });
    }

    return createEmptyMatrix();
  }, [mode, currentGamePattern, sizeOptions, selectedSizeIndex, gameModule, gameState, activeGameKey, showHint, hoverCell]);

  return displayPattern;
};

export default useDisplayPattern;
