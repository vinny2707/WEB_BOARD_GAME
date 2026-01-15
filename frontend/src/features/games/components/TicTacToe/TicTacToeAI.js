/**
 * Tic-Tac-Toe AI using Minimax Algorithm
 * Provides an unbeatable AI opponent
 */

// Check for winner in a board state
export const checkWinner = (board) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

// Check if game is a draw
export const isDraw = (board) => {
    return board.every(cell => cell !== null) && !checkWinner(board);
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
const minimax = (board, depth, isMaximizing, alpha, beta) => {
    const winner = checkWinner(board);

    // Terminal states
    if (winner === 'O') return 10 - depth; // AI wins
    if (winner === 'X') return depth - 10; // Player wins
    if (isDraw(board)) return 0;           // Draw

    const emptyCells = getEmptyCells(board);

    if (isMaximizing) {
        // AI's turn (O)
        let maxScore = -Infinity;
        for (const index of emptyCells) {
            const newBoard = [...board];
            newBoard[index] = 'O';
            const score = minimax(newBoard, depth + 1, false, alpha, beta);
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
            const score = minimax(newBoard, depth + 1, true, alpha, beta);
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            if (beta <= alpha) break; // Pruning
        }
        return minScore;
    }
};

/**
 * Find the best move for AI
 * @param {Array} board - Current board state
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {number} - Index of the best move
 */
export const findBestMove = (board, difficulty = 'medium') => {
    const emptyCells = getEmptyCells(board);

    if (emptyCells.length === 0) return -1;

    // Easy mode: Random move
    if (difficulty === 'easy') {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Medium mode: 70% optimal, 30% random
    if (difficulty === 'medium' && Math.random() < 0.3) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Hard mode (or 70% of medium): Minimax
    let bestScore = -Infinity;
    let bestMove = emptyCells[0];

    for (const index of emptyCells) {
        const newBoard = [...board];
        newBoard[index] = 'O';
        const score = minimax(newBoard, 0, false, -Infinity, Infinity);

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
 * @returns {number} - Suggested move index
 */
export const getHint = (board) => {
    const emptyCells = getEmptyCells(board);

    if (emptyCells.length === 0) return -1;

    // Check if player can win
    for (const index of emptyCells) {
        const testBoard = [...board];
        testBoard[index] = 'X';
        if (checkWinner(testBoard) === 'X') {
            return index;
        }
    }

    // Check if need to block AI
    for (const index of emptyCells) {
        const testBoard = [...board];
        testBoard[index] = 'O';
        if (checkWinner(testBoard) === 'O') {
            return index;
        }
    }

    // Prefer center
    if (emptyCells.includes(4)) return 4;

    // Prefer corners
    const corners = [0, 2, 6, 8].filter(c => emptyCells.includes(c));
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // Random edge
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};
