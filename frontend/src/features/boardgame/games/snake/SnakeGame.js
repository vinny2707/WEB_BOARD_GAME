/**
 * Snake Game Module
 * Self-contained game logic and LED rendering for board game
 */

import { MATRIX_ROWS, MATRIX_COLS, createEmptyMatrix } from "../../utils/constants";
import { drawCenteredText } from "../../utils/ledUtils";

// ============== CONSTANTS ==============

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
};

const DIFFICULTY_SETTINGS = {
    easy: { speed: 180 },
    medium: { speed: 120 },
    normal: { speed: 120 }, // Alias for medium
    hard: { speed: 70 },
};

// ============== GAME LOGIC ==============

/**
 * Create initial game state
 */
export const createInitialState = (settings = {}) => {
    const size = settings.size || 15;
    const center = Math.floor(size / 2);
    const difficulty = settings.difficulty || 'normal';

    return {
        snake: [{ x: center, y: center }],
        food: generateFood([{ x: center, y: center }], size),
        direction: DIRECTIONS.RIGHT,
        status: 'playing', // 'playing' | 'gameover'
        score: 0,
        size: size,
        wallMode: 'wrap', // Fixed to wrap
        difficulty: difficulty,
        selectedCell: 0, // Not used for snake but required by interface
        speed: DIFFICULTY_SETTINGS[difficulty]?.speed || 120,
        gameTime: 0,
    };
};

/**
 * Generate food position
 */
const generateFood = (snake, size) => {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * size),
            y: Math.floor(Math.random() * size),
        };
    } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
};

/**
 * Wrap position for wrap mode
 */
const wrapPosition = (pos, size) => {
    let { x, y } = pos;
    if (x < 0) x = size - 1;
    if (x >= size) x = 0;
    if (y < 0) y = size - 1;
    if (y >= size) y = 0;
    return { x, y };
};

/**
 * Check collision with self
 */
const checkCollision = (head, snakeBody) => {
    return snakeBody.slice(1).some(seg => seg.x === head.x && seg.y === head.y);
};

/**
 * Check if move is valid (not used for snake, but required by interface)
 */
// eslint-disable-next-line no-unused-vars
export const isValidMove = (state, cellIndex) => {
    return state.status === 'playing';
};

/**
 * Make a move (move snake in current direction)
 * In Snake, cellIndex is not used - snake moves automatically
 */
// eslint-disable-next-line no-unused-vars
export const makeMove = (state, cellIndex, player = null) => {
    if (state.status !== 'playing') {
        return state;
    }

    const currentDir = state.direction;
    let newHead = {
        x: state.snake[0].x + currentDir.x,
        y: state.snake[0].y + currentDir.y,
    };

    // Wrap position
    newHead = wrapPosition(newHead, state.size);

    // Check collision with self
    if (checkCollision(newHead, state.snake)) {
        return {
            ...state,
            status: 'gameover',
        };
    }

    const newSnake = [newHead, ...state.snake];

    // Check if ate food
    if (newHead.x === state.food.x && newHead.y === state.food.y) {
        const newScore = state.score + 10;
        return {
            ...state,
            snake: newSnake,
            food: generateFood(newSnake, state.size),
            score: newScore,
            speed: Math.max(50, state.speed - 2), // Increase speed slightly
        };
    } else {
        newSnake.pop(); // Remove tail if didn't eat
    }

    return {
        ...state,
        snake: newSnake,
    };
};

/**
 * AI Move - Snake moves automatically, this returns a dummy value
 */
// eslint-disable-next-line no-unused-vars
export const getAIMove = (state) => {
    return 0; // Snake moves automatically, not used
};

/**
 * Change direction based on navigation
 * Returns the new direction object (or current if invalid 180° turn)
 */
export const getCellFromNav = (state, direction) => {
    const opposites = {
        up: DIRECTIONS.DOWN,
        down: DIRECTIONS.UP,
        left: DIRECTIONS.RIGHT,
        right: DIRECTIONS.LEFT,
    };

    const newDirections = {
        up: DIRECTIONS.UP,
        down: DIRECTIONS.DOWN,
        left: DIRECTIONS.LEFT,
        right: DIRECTIONS.RIGHT,
    };

    // Prevent 180° turn
    if (state.direction !== opposites[direction]) {
        return newDirections[direction];
    }

    return state.direction; // Return current direction if 180° turn attempted
};

// ============== LED RENDERING ==============

/**
 * Calculate cell size and offset for LED matrix
 */
const getDisplayParams = (size) => {
    // Reserve space for score at top (3 rows) and border
    const availableRows = MATRIX_ROWS - 4;
    const availableCols = MATRIX_COLS - 4;

    const cellSize = Math.floor(Math.min(availableRows, availableCols) / size);
    const gridWidth = size * cellSize;
    const gridHeight = size * cellSize;

    const offsetR = Math.floor((MATRIX_ROWS - gridHeight) / 2) + 1;
    const offsetC = Math.floor((MATRIX_COLS - gridWidth) / 2);

    return { cellSize, offsetR, offsetC, gridWidth, gridHeight };
};

/**
 * Render game state to LED matrix
 */
export const renderToMatrix = (state) => {
    const matrix = createEmptyMatrix();
    const { snake, food, size, score, status } = state;
    const { cellSize, offsetR, offsetC, gridWidth, gridHeight } = getDisplayParams(size);

    // Draw border
    for (let i = 0; i < gridWidth; i++) {
        const topR = offsetR - 1;
        const botR = offsetR + gridHeight;
        if (topR >= 0 && topR < MATRIX_ROWS && offsetC + i < MATRIX_COLS) {
            matrix[topR][offsetC + i] = "cyan";
        }
        if (botR >= 0 && botR < MATRIX_ROWS && offsetC + i < MATRIX_COLS) {
            matrix[botR][offsetC + i] = "cyan";
        }
    }
    for (let i = 0; i < gridHeight; i++) {
        const leftC = offsetC - 1;
        const rightC = offsetC + gridWidth;
        if (offsetR + i < MATRIX_ROWS && leftC >= 0 && leftC < MATRIX_COLS) {
            matrix[offsetR + i][leftC] = "cyan";
        }
        if (offsetR + i < MATRIX_ROWS && rightC >= 0 && rightC < MATRIX_COLS) {
            matrix[offsetR + i][rightC] = "cyan";
        }
    }

    // Draw food
    const foodR = offsetR + food.y * cellSize;
    const foodC = offsetC + food.x * cellSize;
    for (let dr = 0; dr < cellSize; dr++) {
        for (let dc = 0; dc < cellSize; dc++) {
            const r = foodR + dr;
            const c = foodC + dc;
            if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
                matrix[r][c] = "red";
            }
        }
    }

    // Draw snake
    snake.forEach((seg, i) => {
        const segR = offsetR + seg.y * cellSize;
        const segC = offsetC + seg.x * cellSize;
        const isHead = i === 0;
        const color = isHead ? "yellow" : "green";

        for (let dr = 0; dr < cellSize; dr++) {
            for (let dc = 0; dc < cellSize; dc++) {
                const r = segR + dr;
                const c = segC + dc;
                if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
                    matrix[r][c] = color;
                }
            }
        }
    });

    // Draw score at top
    const scoreText = `SCORE: ${score}`;
    drawCenteredText(matrix, scoreText, 0, "white");

    // Game over message
    if (status === 'gameover') {
        drawCenteredText(matrix, "GAME OVER!", Math.floor(MATRIX_ROWS / 2) - 2, "red");
        drawCenteredText(matrix, `SCORE: ${score}`, Math.floor(MATRIX_ROWS / 2) + 1, "yellow");
    }

    return matrix;
};

/**
 * Get cell from matrix coordinates (for mouse support)
 * For snake, clicking changes direction towards the clicked position
 */
export const getCellFromMatrix = (state, matrixR, matrixC) => {
    const { size } = state;
    const { cellSize, offsetR, offsetC } = getDisplayParams(size);

    // Check if click is within game area
    if (matrixR < offsetR || matrixC < offsetC) return -1;

    const relR = matrixR - offsetR;
    const relC = matrixC - offsetC;

    const cellY = Math.floor(relR / cellSize);
    const cellX = Math.floor(relC / cellSize);

    if (cellX >= 0 && cellX < size && cellY >= 0 && cellY < size) {
        // Calculate direction to clicked cell
        const head = state.snake[0];
        const dx = cellX - head.x;
        const dy = cellY - head.y;

        // Change direction based on which axis has larger difference
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && state.direction !== DIRECTIONS.LEFT) {
                state.direction = DIRECTIONS.RIGHT;
            } else if (dx < 0 && state.direction !== DIRECTIONS.RIGHT) {
                state.direction = DIRECTIONS.LEFT;
            }
        } else {
            if (dy > 0 && state.direction !== DIRECTIONS.UP) {
                state.direction = DIRECTIONS.DOWN;
            } else if (dy < 0 && state.direction !== DIRECTIONS.DOWN) {
                state.direction = DIRECTIONS.UP;
            }
        }

        return 0; // Return dummy value
    }

    return -1;
};

/**
 * Render settings preview to LED matrix
 * Shows only the size text (e.g., "15x15")
 */
export const renderSettingsToMatrix = (size) => {
    const matrix = createEmptyMatrix();

    // Draw size text at center
    const sizeText = `${size}x${size}`;
    drawCenteredText(matrix, sizeText, Math.floor(MATRIX_ROWS / 2), "cyan");

    return matrix;
};

/**
 * Render hint/instructions overlay
 */
export const renderHint = () => {
    const matrix = createEmptyMatrix();

    // Draw hint text
    const hints = [
        "SNAKE GAME",
        "",
        "ARROWS: MOVE",
        "H: HINT",
        "ESC: MENU",
        "",
        "EAT FOOD",
        "AVOID SELF"
    ];

    let startRow = Math.floor((MATRIX_ROWS - hints.length * 2) / 2);

    hints.forEach((text, index) => {
        if (text) {
            drawCenteredText(matrix, text, startRow + index * 2, "yellow");
        }
    });

    return matrix;
};

// ============== EXPORT GAME MODULE ==============

export default {
    id: 'snake',
    name: 'SNAKE',
    apiId: 4,

    createInitialState,
    makeMove,
    getAIMove,
    isValidMove,
    getCellFromNav,
    renderToMatrix,
    renderSettingsToMatrix,
    renderHint,
    getCellFromMatrix,

    sizeOptions: [
        { label: '15x15', value: 15 },
        { label: '20x20', value: 20 },
        { label: '25x25', value: 25 },
    ],

    defaultSettings: {
        size: 15,
        difficulty: 'normal',
        wallMode: 'wrap',
    },
};
