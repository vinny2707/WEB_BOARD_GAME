/**
 * Tic-Tac-Toe AI supporting multiple board sizes
 * 3x3: 3 in a row wins
 * 5x5: 4 in a row wins
 */

// Generate all winning lines for a given board size and win condition
const generateWinningLines = (size, winLength) => {
    const lines = [];

    // Rows
    for (let row = 0; row < size; row++) {
        for (let startCol = 0; startCol <= size - winLength; startCol++) {
            const line = [];
            for (let i = 0; i < winLength; i++) {
                line.push(row * size + startCol + i);
            }
            lines.push(line);
        }
    }

    // Columns
    for (let col = 0; col < size; col++) {
        for (let startRow = 0; startRow <= size - winLength; startRow++) {
            const line = [];
            for (let i = 0; i < winLength; i++) {
                line.push((startRow + i) * size + col);
            }
            lines.push(line);
        }
    }

    // Diagonals (top-left to bottom-right)
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            const line = [];
            for (let i = 0; i < winLength; i++) {
                line.push((row + i) * size + col + i);
            }
            lines.push(line);
        }
    }

    // Diagonals (top-right to bottom-left)
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = winLength - 1; col < size; col++) {
            const line = [];
            for (let i = 0; i < winLength; i++) {
                line.push((row + i) * size + col - i);
            }
            lines.push(line);
        }
    }

    return lines;
};

// Get win length based on board size
const getWinLength = (boardSize) => {
    return boardSize === 5 ? 4 : 3;
};

// Check for winner in a board state
export const checkWinner = (board, boardSize = null) => {
    const size = boardSize || Math.sqrt(board.length);
    const winLength = getWinLength(size);
    const lines = generateWinningLines(size, winLength);

    for (const line of lines) {
        const [first, ...rest] = line;
        if (board[first] && rest.every(idx => board[idx] === board[first])) {
            return board[first];
        }
    }
    return null;
};

// Get winning line indices
export const getWinningLine = (board, boardSize = null) => {
    const size = boardSize || Math.sqrt(board.length);
    const winLength = getWinLength(size);
    const lines = generateWinningLines(size, winLength);

    for (const line of lines) {
        const [first, ...rest] = line;
        if (board[first] && rest.every(idx => board[idx] === board[first])) {
            return line;
        }
    }
    return null;
};

// Check if game is a draw
export const isDraw = (board, boardSize = null) => {
    return board.every(cell => cell !== null) && !checkWinner(board, boardSize);
};

// Get all empty cell indices
export const getEmptyCells = (board) => {
    return board.reduce((acc, cell, index) => {
        if (cell === null) acc.push(index);
        return acc;
    }, []);
};

/**
 * Minimax Algorithm with Alpha-Beta Pruning
 * Returns the best score for the current player
 */
const minimax = (board, depth, isMaximizing, alpha, beta, boardSize, maxDepth = 6) => {
    const winner = checkWinner(board, boardSize);

    // Terminal states
    if (winner === 'O') return 10 - depth; // AI wins
    if (winner === 'X') return depth - 10; // Player wins
    if (isDraw(board, boardSize)) return 0; // Draw

    // Limit depth for larger boards
    if (depth >= maxDepth) return 0;

    const emptyCells = getEmptyCells(board);

    if (isMaximizing) {
        // AI's turn (O)
        let maxScore = -Infinity;
        for (const index of emptyCells) {
            const newBoard = [...board];
            newBoard[index] = 'O';
            const score = minimax(newBoard, depth + 1, false, alpha, beta, boardSize, maxDepth);
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break; // Pruning
        }
        return maxScore;
    } else {
        // Player's turn (X)
        let minScore = Infinity;
        for (const index of emptyCells) {
            const newBoard = [...board];
            newBoard[index] = 'X';
            const score = minimax(newBoard, depth + 1, true, alpha, beta, boardSize, maxDepth);
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            if (beta <= alpha) break; // Pruning
        }
        return minScore;
    }
};

// Evaluate board position for heuristic scoring (5x5 mode)
const evaluatePosition = (board, boardSize) => {
    const size = boardSize;
    const winLength = getWinLength(size);
    const lines = generateWinningLines(size, winLength);

    let score = 0;

    for (const line of lines) {
        let aiCount = 0;
        let playerCount = 0;
        let emptyCount = 0;

        for (const idx of line) {
            if (board[idx] === 'O') aiCount++;
            else if (board[idx] === 'X') playerCount++;
            else emptyCount++;
        }

        // Only count lines that are still open for one side
        if (aiCount > 0 && playerCount === 0) {
            score += Math.pow(10, aiCount);
        }
        if (playerCount > 0 && aiCount === 0) {
            score -= Math.pow(10, playerCount);
        }
    }

    // Prefer center positions
    const center = Math.floor(size / 2);
    const centerIdx = center * size + center;
    if (board[centerIdx] === 'O') score += 5;
    if (board[centerIdx] === 'X') score -= 5;

    return score;
};

/**
 * Find the best move for AI
 * @param {Array} board - Current board state
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {number} boardSize - Size of the board (3 or 5)
 * @returns {number} - Index of the best move
 */
export const findBestMove = (board, difficulty = 'medium', boardSize = null) => {
    const size = boardSize || Math.sqrt(board.length);
    const emptyCells = getEmptyCells(board);

    if (emptyCells.length === 0) return -1;

    // Easy mode: Random move
    if (difficulty === 'easy') {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // For 5x5, use heuristic evaluation instead of full minimax (too slow)
    if (size === 5) {
        // Check for immediate wins or blocks
        for (const index of emptyCells) {
            const testBoard = [...board];
            testBoard[index] = 'O';
            if (checkWinner(testBoard, size) === 'O') {
                return index; // Win immediately
            }
        }

        for (const index of emptyCells) {
            const testBoard = [...board];
            testBoard[index] = 'X';
            if (checkWinner(testBoard, size) === 'X') {
                return index; // Block player
            }
        }

        // Medium mode: 30% random for variety
        if (difficulty === 'medium' && Math.random() < 0.3) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        // Use heuristic evaluation for non-critical moves
        let bestScore = -Infinity;
        let bestMove = emptyCells[0];

        for (const index of emptyCells) {
            const newBoard = [...board];
            newBoard[index] = 'O';
            const score = evaluatePosition(newBoard, size);

            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }

        return bestMove;
    }

    // Medium mode: 70% optimal, 30% random (for 3x3)
    if (difficulty === 'medium' && Math.random() < 0.3) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Hard mode (or 70% of medium): Minimax for 3x3
    let bestScore = -Infinity;
    let bestMove = emptyCells[0];

    for (const index of emptyCells) {
        const newBoard = [...board];
        newBoard[index] = 'O';
        const score = minimax(newBoard, 0, false, -Infinity, Infinity, size);

        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }

    return bestMove;
};

/**
 * Get a hint for the player
 * @param {Array} board - Current board state
 * @param {number} boardSize - Size of the board
 * @returns {number} - Suggested move index
 */
export const getHint = (board, boardSize = null) => {
    const size = boardSize || Math.sqrt(board.length);
    const emptyCells = getEmptyCells(board);

    if (emptyCells.length === 0) return -1;

    // Check if player can win
    for (const index of emptyCells) {
        const testBoard = [...board];
        testBoard[index] = 'X';
        if (checkWinner(testBoard, size) === 'X') {
            return index;
        }
    }

    // Check if need to block AI
    for (const index of emptyCells) {
        const testBoard = [...board];
        testBoard[index] = 'O';
        if (checkWinner(testBoard, size) === 'O') {
            return index;
        }
    }

    // Prefer center
    const center = Math.floor(size / 2);
    const centerIdx = center * size + center;
    if (emptyCells.includes(centerIdx)) return centerIdx;

    // Prefer corners
    const corners = [0, size - 1, size * (size - 1), size * size - 1].filter(c => emptyCells.includes(c));
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // Random edge
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};
