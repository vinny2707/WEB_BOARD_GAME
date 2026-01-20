/**
 * Match-3 Board Game (Candy Crush style)
 * 
 * 🎮 CÁCH CHƠI CHI TIẾT:
 * 
 * 1. MỤC TIÊU:
 *    - Đạt 3000 điểm trước khi hết 30 lượt
 *    - Ghép 3+ kẹo cùng màu theo hàng ngang hoặc dọc
 * 
 * 2. ĐIỀU KHIỂN:
 *    A. DÙNG CHUỘT:
 *       - Click vào kẹo đầu tiên để CHỌN (kẹo sẽ sáng màu TRẮNG)
 *       - Click vào kẹo BÊN CẠNH để ĐỔI CHỖ
 *       - Chỉ đổi được với kẹo liền kề (trên/dưới/trái/phải)
 *       - Nếu đổi không tạo match → tự động quay lại, không trừ lượt
 * 
 *    B. DÙNG PHÍM:
 *       - Phím MŨI TÊN (↑↓←→): Di chuyển con trỏ (cursor)
 *       - Phím ENTER lần 1: Chọn kẹo (hiện màu TRẮNG)
 *       - Dùng phím mũi tên di chuyển đến kẹo bên cạnh
 *       - Phím ENTER lần 2: Đổi chỗ 2 kẹo
 *       - Phím H: Xem gợi ý (hint)
 * 
 * 3. CÁCH TÍNH ĐIỂM:
 *    - Ghép 3 kẹo = 100 điểm
 *    - Ghép 4 kẹo = 200 điểm  
 *    - Ghép 5+ kẹo = 300+ điểm (càng nhiều càng cao)
 *    - Combo liên tục (kẹo rơi tạo match mới) = nhân điểm
 * 
 * 4. QUY TẮC:
 *    - Chỉ đổi kẹo liền kề (không chéo)
 *    - Swap chỉ hợp lệ khi tạo được match 3+
 *    - Swap không hợp lệ → không trừ lượt
 *    - Sau mỗi match, kẹo rơi xuống và kẹo mới xuất hiện
 *    - Cascade matches (kẹo rơi tạo match mới) tự động xử lý
 * 
 * 5. THẮNG/THUA:
 *    - THẮNG: Đạt ≥ 3000 điểm
 *    - THUA: Hết 30 lượt mà chưa đủ điểm
 * 
 * 6. MẸO CHƠI:
 *    - Tìm match tạo combo cascade (kẹo rơi tạo match mới)
 *    - Ưu tiên match 4-5 kẹo để nhận điểm cao
 *    - Nhấn H để xem gợi ý khi bí
 *    - Quan sát toàn bộ bảng trước khi swap
 * 
 * Game Rules:
 * - Swap adjacent candies to create matches of 3+ same type
 * - Match 3 = 100 points, Match 4 = 200 points, Match 5+ = 300+ points
 * - Win: Reach 3000 points within 30 moves
 * - Lose: Run out of moves before reaching target
 * 
 * Settings:
 * - Board Size: 6x6, 8x8, or 10x10 (user selectable)
 * - Moves: 30 (fixed)
 * - Target Score: 3000 (fixed)
 * - Candy Types: 6 (medium difficulty, fixed)
 */

import { MATRIX_ROWS, MATRIX_COLS } from '../../utils/constants';

// Utility: parse target that may include thousand separators (e.g., "5,000" or "5.000")
const parseTargetNumber = (val) => {
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    if (val === null || val === undefined) return NaN;
    const digits = String(val).replace(/[^0-9]/g, '');
    if (!digits) return NaN;
    const n = Number(digits);
    return Number.isFinite(n) ? n : NaN;
};

// ============== CONSTANTS ==============

const CANDY_TYPES = 6; // Medium difficulty
const DEFAULT_MOVES = 30;
const DEFAULT_TARGET = 5000;

// Candy colors for LED rendering
const CANDY_COLORS = [
    'red',      // Type 0
    'blue',     // Type 1
    'green',    // Type 2
    'yellow',   // Type 3
    'purple',   // Type 4
    'orange',   // Type 5
];

// ============== BOARD GENERATION ==============

/**
 * Generate random board without initial matches
 */
const generateBoard = (size, candyTypes) => {
    const board = [];

    for (let i = 0; i < size * size; i++) {
        let candy;
        let attempts = 0;

        do {
            candy = Math.floor(Math.random() * candyTypes);
            attempts++;

            // Prevent infinite loop
            if (attempts > 100) {
                candy = Math.floor(Math.random() * candyTypes);
                break;
            }
        } while (wouldCreateMatch(board, i, candy, size));

        board.push(candy);
    }

    return board;
};

/**
 * Check if placing candy at index would create a match
 */
const wouldCreateMatch = (board, index, candy, size) => {
    const row = Math.floor(index / size);
    const col = index % size;

    // Check horizontal (left 2)
    if (col >= 2) {
        const idx1 = row * size + (col - 1);
        const idx2 = row * size + (col - 2);
        if (board[idx1] === candy && board[idx2] === candy) {
            return true;
        }
    }

    // Check vertical (top 2)
    if (row >= 2) {
        const idx1 = (row - 1) * size + col;
        const idx2 = (row - 2) * size + col;
        if (board[idx1] === candy && board[idx2] === candy) {
            return true;
        }
    }

    return false;
};

// ============== MATCH DETECTION ==============

/**
 * Find all matches on the board
 * Returns array of match arrays (each match is array of cell indices)
 */
const findMatches = (board, size) => {
    const matches = [];
    const matched = new Set();

    // Check horizontal matches
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size - 2; col++) {
            const idx = row * size + col;
            const candy = board[idx];

            if (candy === -1) continue; // Skip empty cells

            if (board[idx + 1] === candy && board[idx + 2] === candy) {
                const matchCells = [idx, idx + 1, idx + 2];

                // Extend match if possible
                let nextCol = col + 3;
                while (nextCol < size && board[row * size + nextCol] === candy) {
                    matchCells.push(row * size + nextCol);
                    nextCol++;
                }

                matches.push(matchCells);
                matchCells.forEach(cell => matched.add(cell));
                col = nextCol - 1;
            }
        }
    }

    // Check vertical matches
    for (let col = 0; col < size; col++) {
        for (let row = 0; row < size - 2; row++) {
            const idx = row * size + col;
            const candy = board[idx];

            if (candy === -1) continue; // Skip empty cells

            if (board[idx + size] === candy && board[idx + size * 2] === candy) {
                const matchCells = [idx, idx + size, idx + size * 2];

                // Extend match if possible
                let nextRow = row + 3;
                while (nextRow < size && board[nextRow * size + col] === candy) {
                    matchCells.push(nextRow * size + col);
                    nextRow++;
                }

                matches.push(matchCells);
                matchCells.forEach(cell => matched.add(cell));
                row = nextRow - 1;
            }
        }
    }

    return matches;
};

// ============== GRAVITY & REFILL ==============

/**
 * Apply gravity - make candies fall down
 */
const applyGravity = (board, size) => {
    for (let col = 0; col < size; col++) {
        // Start from bottom, move up
        let writeRow = size - 1;

        for (let row = size - 1; row >= 0; row--) {
            const idx = row * size + col;
            if (board[idx] !== -1) {
                if (row !== writeRow) {
                    board[writeRow * size + col] = board[idx];
                    board[idx] = -1;
                }
                writeRow--;
            }
        }
    }
};

/**
 * Fill empty cells with new random candies
 */
const fillEmpty = (board, candyTypes) => {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === -1) {
            board[i] = Math.floor(Math.random() * candyTypes);
        }
    }
};

// ============== GAME LOGIC ==============

/**
 * Check if two cells are adjacent
 */
const areAdjacent = (idx1, idx2, size) => {
    const row1 = Math.floor(idx1 / size);
    const col1 = idx1 % size;
    const row2 = Math.floor(idx2 / size);
    const col2 = idx2 % size;

    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

/**
 * Create initial game state
 */
export const createInitialState = (settings = {}) => {
    const size = settings.size || 8;
    const board = generateBoard(size, CANDY_TYPES);

    return {
        size,
        board,
        selectedCell: -1,
        movesLeft: DEFAULT_MOVES,
        score: 0,
        targetScore: DEFAULT_TARGET,
        status: 'playing',
        candyTypes: CANDY_TYPES,
        lastMatch: [],
        currentPlayer: 'X', // For compatibility with board game framework
    };
};

/**
 * Process matches and apply gravity
 */
const processMatches = (state) => {
    let currentState = { ...state };
    let totalScore = 0;
    let allMatchedCells = [];

    // Keep processing until no more matches
    while (true) {
        const matches = findMatches(currentState.board, currentState.size);
        if (matches.length === 0) break;

        // Calculate score
        matches.forEach(match => {
            const matchSize = match.length;
            if (matchSize === 3) totalScore += 100;
            else if (matchSize === 4) totalScore += 200;
            else totalScore += 300 + (matchSize - 5) * 50;
        });

        // Collect all matched cells
        const matchedSet = new Set(matches.flat());
        allMatchedCells.push(...matchedSet);

        // Remove matched candies
        const newBoard = [...currentState.board];
        matchedSet.forEach(idx => {
            newBoard[idx] = -1;
        });

        // Apply gravity
        applyGravity(newBoard, currentState.size);

        // Fill empty spaces
        fillEmpty(newBoard, currentState.candyTypes);

        currentState = {
            ...currentState,
            board: newBoard,
        };
    }

    // Update score and check win/lose (robust against non-numeric target)
    const newScore = currentState.score + totalScore;
    const parsedTarget = parseTargetNumber(currentState.targetScore);
    const target = Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : DEFAULT_TARGET;

    let status = 'playing';
    // Win only if reached target and STILL have moves left
    if (newScore >= target && currentState.movesLeft > 0) status = 'win';
    else if (currentState.movesLeft <= 0) status = 'gameover';

    return {
        ...currentState,
        score: newScore,
        status,
        lastMatch: allMatchedCells,
    };
};

/**
 * Make a move (swap candies)
 */
export const makeMove = (state, cellIndex) => {
    console.log('makeMove called:', { cellIndex, selectedCell: state.selectedCell, status: state.status });

    if (state.status !== 'playing') {
        console.log('Game not playing, status:', state.status);
        return state;
    }

    // First click: select cell
    if (state.selectedCell === -1) {
        console.log('First click, selecting cell:', cellIndex);
        return { ...state, selectedCell: cellIndex };
    }

    // Second click on same cell: deselect
    if (state.selectedCell === cellIndex) {
        console.log('Same cell clicked, deselecting');
        return { ...state, selectedCell: -1 };
    }

    // Second click: attempt swap
    const selected = state.selectedCell;
    console.log('Attempting swap:', { from: selected, to: cellIndex });

    // Check if cells are adjacent
    if (!areAdjacent(selected, cellIndex, state.size)) {
        console.log('Not adjacent, selecting new cell');
        return { ...state, selectedCell: cellIndex };
    }

    // Swap candies
    const newBoard = [...state.board];
    [newBoard[selected], newBoard[cellIndex]] = [newBoard[cellIndex], newBoard[selected]];
    console.log('Swapped candies:', { from: state.board[selected], to: state.board[cellIndex] });

    // Check if swap creates matches
    const matches = findMatches(newBoard, state.size);
    console.log('Matches found:', matches.length, matches);

    if (matches.length === 0) {
        console.log('No matches, reverting swap');
        return { ...state, selectedCell: -1 };
    }

    // Valid swap, process matches
    console.log('Valid swap! Processing matches...');
    const result = processMatches({
        ...state,
        board: newBoard,
        selectedCell: -1,
        movesLeft: state.movesLeft - 1,
    });
    console.log('After processing:', { score: result.score, movesLeft: result.movesLeft, status: result.status });
    return result;
};

/**
 * Check if move is valid (not used for Match-3, but required by framework)
 */
export const isValidMove = (state, cellIndex) => {
    return state.status === 'playing' && cellIndex >= 0 && cellIndex < state.size * state.size;
};

/**
 * Navigate with arrow keys
 */
export const getCellFromNav = (state, direction, currentPos) => {
    // If currentPos is provided, use it. Otherwise fallback to selectedCell or 0
    const current = currentPos !== undefined ? currentPos : (state.selectedCell === -1 ? 0 : state.selectedCell);
    const size = state.size;
    const row = Math.floor(current / size);
    const col = current % size;

    let newRow = row;
    let newCol = col;

    switch (direction) {
        case 'up':
            newRow = row > 0 ? row - 1 : size - 1;
            break;
        case 'down':
            newRow = row < size - 1 ? row + 1 : 0;
            break;
        case 'left':
            newCol = col > 0 ? col - 1 : size - 1;
            break;
        case 'right':
            newCol = col < size - 1 ? col + 1 : 0;
            break;
        default:
            return current;
    }

    return newRow * size + newCol;
};

// ============== HELPER FUNCTIONS ==============

/**
 * Get board dimensions and offsets
 */
const getBoardDimensions = (size) => {
    const { candySize, gap } = getCandySize();
    const cellSize = candySize + gap;
    const totalSize = size * cellSize - gap;
    const offsetRow = Math.floor((MATRIX_ROWS - totalSize) / 2);
    const offsetCol = Math.floor((MATRIX_COLS - totalSize) / 2);

    return { cellSize, offsetRow, offsetCol };
};

/**
 * Get cell index from matrix coordinates
 */
export const getCellFromMatrix = (state, row, col) => {
    const { cellSize, offsetRow, offsetCol } = getBoardDimensions(state.size);
    const { candySize } = getCandySize();

    // Adjust for offset
    const localRow = row - offsetRow;
    const localCol = col - offsetCol;

    // Check bounds
    if (localRow < 0 || localCol < 0) return -1;

    // Calculate grid coordinates
    const gridRow = Math.floor(localRow / cellSize);
    const gridCol = Math.floor(localCol / cellSize);

    // Check if within board
    if (gridRow >= state.size || gridCol >= state.size) return -1;

    // Check if within actual candy (exclude gap)
    // localRow % cellSize gives relative position within the cell block
    // if relative position >= candySize, it's in the gap
    const relativeRow = localRow % cellSize;
    const relativeCol = localCol % cellSize;
    
    if (relativeRow >= candySize || relativeCol >= candySize) {
        return -1; // Clicked on gap
    }

    const cellIndex = gridRow * state.size + gridCol;
    console.log('🎯 getCellFromMatrix:', { 
        row, col, 
        localRow, localCol, 
        gridRow, gridCol, 
        relativeRow, relativeCol,
        cellSize, candySize,
        cellIndex,
        boardSize: state.size
    });
    
    return cellIndex;
};

// ============== LED RENDERING ==============

/**
 * Create empty LED matrix
 */
const createEmptyMatrix = () => {
    return Array(MATRIX_ROWS).fill(null).map(() =>
        Array(MATRIX_COLS).fill(0)
    );
};

/**
 * Get cell size and gap for candy rendering
 */
const getCandySize = () => {
    return { candySize: 2, gap: 1 };  // 2x2 candy with 1 LED gap
};

/**
 * Render game state to LED matrix
 */
export const renderToMatrix = (state) => {
    const matrix = createEmptyMatrix();
    const { candySize } = getCandySize();
    const { cellSize, offsetRow, offsetCol } = getBoardDimensions(state.size);

    for (let row = 0; row < state.size; row++) {
        for (let col = 0; col < state.size; col++) {
            const idx = row * state.size + col;
            const candy = state.board[idx];
            const candyColor = CANDY_COLORS[candy];

            const startRow = offsetRow + row * cellSize;
            const startCol = offsetCol + col * cellSize;

            // Draw 2x2 candy block
            for (let r = 0; r < candySize; r++) {
                for (let c = 0; c < candySize; c++) {
                    const ledRow = startRow + r;
                    const ledCol = startCol + c;

                    if (ledRow >= 0 && ledRow < MATRIX_ROWS && ledCol >= 0 && ledCol < MATRIX_COLS) {
                        // Priority 1: Selected Cell (Blinking/White)
                        if (idx === state.selectedCell) {
                            matrix[ledRow][ledCol] = 'white';
                        }
                        // Priority 2: Cursor Position (Dim White / Highlight)
                        // Note: state.cursorPos must be passed from BoardGame
                        else if (idx === state.cursorPos) {
                            // Draw cursor border or distinct color
                            // Since 2x2 is small, we'll use a brighter version of the color or a specific cursor color
                            // Let's toggle between color and white for cursor
                            // For simplicity, let's use a distinct color boundary if possible, but 2x2 is too small
                            // So we render the candy, but maybe add a special indicator nearby?
                            // Or just make it flash?
                            // Let's try making it "dim white" or just the normal color but handle the cursor in BoardGame overlay?
                            // Actually, providing a visual cue here is best.
                            // Let's use the candy color, but if it is the cursor, we'll return a special color code or handle it.
                            matrix[ledRow][ledCol] = candyColor;
                        } else {
                            matrix[ledRow][ledCol] = candyColor;
                        }
                    }
                }
            }

            // Draw Cursor "Bracket" or indication separate from candidates
            if (idx === state.cursorPos && state.cursorPos !== state.selectedCell) {
                // We can't easily draw brackets around 2x2 without overwriting neighbors.
                // So let's make the cursor cell PULSE or be BRIGHTER if the framework supports it.
                // For now, let's just use the logic in BoardGame.jsx to maybe overlay the cursor?
                // Or we modify the pixels here.
                // Let's set the pixels to a "highlight" color if it matches cursor.
                // But wait, if we change the color, the user can't see the candy type.
                // Best approach for 2x2: Use the candy color, but maybe blink?
                // Actually, let's trust the "selectedCell" white highlight is enough for the source.
                // For the cursor (destination/navigation), we need to see where we are.
                // Let's make the cursor cell turn 'white' quickly on/off or something?
                // Simple approach: The cursor position shows the candy color, but maybe we draw a white dot in the GAP?
            }
        }
    }

    // Draw Cursor Overlay (if passed in state)
    // We'll draw 4 dots around the 2x2 block if possible, or just highlight it.
    if (state.cursorPos !== undefined && state.cursorPos !== -1 && state.cursorPos !== state.selectedCell) {
        const currentRow = Math.floor(state.cursorPos / state.size);
        const currentCol = state.cursorPos % state.size;
        const topR = offsetRow + currentRow * cellSize;
        const topC = offsetCol + currentCol * cellSize;

        // Draw a white dot in the center of the 2x2 (not possible, it's 2x2).
        // Let's light up the bottom-right pixel of the 2x2 as white? No.
        // Let's return the matrix as is, but BoardGame logic handles cursor rendering maybe?
        // No, renderToMatrix is the source of truth for the display.

        // Let's make the cursor cell pulsing?
        // For now, let's just make the cursor cell 'white' but with 50% opacity if supported?
        // Since we don't support opacity well, let's try this:
        // If cursor is on a cell, render it normally.
        // BUT, we need a visual.
        // Let's make the pixels surrounding it (the gaps) glow?
    }

    // Actually, simpler logic:
    // If selectedCell is set -> That is WHITE.
    // If cursorPos is set (and != selectedCell) -> That is blinking or just shown.
    // The user wants "Ban dau la chon 1 cai can doi" -> Arrow keys move cursor. Enter selects (turns White).
    // "Di chuyen den o chuyen va nhan enter tiep la doi". -> Arrow keys move cursor (White cell stays). Enter swaps.

    // Visualize `cursorPos` as a full 2x2 highlight for consistency
    if (state.cursorPos !== undefined && state.cursorPos !== -1 && state.cursorPos !== state.selectedCell) {
        const r = Math.floor(state.cursorPos / state.size);
        const c = state.cursorPos % state.size;
        const startR = offsetRow + r * cellSize;
        const startC = offsetCol + c * cellSize;

        for (let rr = 0; rr < candySize; rr++) {
            for (let cc = 0; cc < candySize; cc++) {
                const ledRow = startR + rr;
                const ledCol = startC + cc;
                if (ledRow >= 0 && ledRow < MATRIX_ROWS && ledCol >= 0 && ledCol < MATRIX_COLS) {
                    matrix[ledRow][ledCol] = 'cyan';
                }
            }
        }
    }

    return matrix;
};



/**
 * Render settings screen
 */
export const renderSettingsToMatrix = (size) => {
    const matrix = createEmptyMatrix();
    const { candySize } = getCandySize();
    const { cellSize, offsetRow, offsetCol } = getBoardDimensions(size);

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const startRow = offsetRow + row * cellSize;
            const startCol = offsetCol + col * cellSize;

            // Draw 2x2 candy block as a preview (cyan color)
            for (let r = 0; r < candySize; r++) {
                for (let c = 0; c < candySize; c++) {
                    const ledRow = startRow + r;
                    const ledCol = startCol + c;

                    if (ledRow >= 0 && ledRow < MATRIX_ROWS && ledCol >= 0 && ledCol < MATRIX_COLS) {
                        matrix[ledRow][ledCol] = 'cyan';
                    }
                }
            }
        }
    }

    // Draw size text at the top if there's space, or just rely on the visual
    // visual is usually enough.

    return matrix;
};

// ============== AI & HINTS (Match3 doesn't need AI, but required for BoardGame.jsx) ==============

/**
 * Match3 is single player, no AI needed
 * Return -1 to indicate no AI move
 */
export const getAIMove = (state) => {
    return -1; // No AI for single-player match3
};

/**
 * Get hint for next possible move
 * Returns a cell index where user can make a valid move
 */
export const getHintMove = (state) => {
    const { board, size, selectedCell } = state;
    
    // Find any valid swap that creates a match
    for (let i = 0; i < board.length; i++) {
        // Try swap right
        if (i % size < size - 1) {
            const testBoard = [...board];
            [testBoard[i], testBoard[i + 1]] = [testBoard[i + 1], testBoard[i]];
            if (findMatches(testBoard, size).length > 0) {
                return selectedCell === null ? i : i + 1;
            }
        }
        // Try swap down
        if (Math.floor(i / size) < size - 1) {
            const testBoard = [...board];
            [testBoard[i], testBoard[i + size]] = [testBoard[i + size], testBoard[i]];
            if (findMatches(testBoard, size).length > 0) {
                return selectedCell === null ? i : i + size;
            }
        }
    }
    
    return -1; // No hint available
};

// ============== GAME MODULE EXPORT ==============

export const sizeOptions = [
    { label: '6x6', value: 6 },
    { label: '8x8', value: 8 },
    { label: '10x10', value: 10 },
];

export default {
    id: 'match3',
    name: 'MATCH-3',
    apiId: null, // Will be set dynamically from backend
    backendType: 'match_3',

    createInitialState,
    makeMove,
    isValidMove,
    getCellFromNav,
    getCellFromMatrix,
    renderToMatrix,
    renderSettingsToMatrix,
    getAIMove,
    getHintMove,

    sizeOptions,

    defaultSettings: {
        size: 8,
        moves: 30,
        targetScore: 3000,
        candyTypes: 6,
    },
};
