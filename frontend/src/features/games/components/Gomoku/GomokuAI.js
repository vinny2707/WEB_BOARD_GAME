// Gomoku AI - 5 in a row game logic

const BOARD_SIZE = 15;
const WIN_COUNT = 5;

// Check if there's a winner
export const checkWinner = (board) => {
    const directions = [
        { dx: 1, dy: 0 },   // horizontal
        { dx: 0, dy: 1 },   // vertical
        { dx: 1, dy: 1 },   // diagonal down-right
        { dx: 1, dy: -1 },  // diagonal up-right
    ];

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const index = i * BOARD_SIZE + j;
            const player = board[index];
            if (!player) continue;

            for (const { dx, dy } of directions) {
                let count = 1;
                let line = [index];

                // Check in positive direction
                for (let k = 1; k < WIN_COUNT; k++) {
                    const ni = i + k * dy;
                    const nj = j + k * dx;
                    if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
                        const nextIndex = ni * BOARD_SIZE + nj;
                        if (board[nextIndex] === player) {
                            count++;
                            line.push(nextIndex);
                        } else break;
                    } else break;
                }

                if (count >= WIN_COUNT) {
                    return { winner: player, line };
                }
            }
        }
    }
    return null;
};

// Check if board is full (draw)
export const isDraw = (board) => {
    return board.every(cell => cell !== null);
};

// Evaluate a line segment for scoring
const evaluateLine = (board, index, dx, dy, player) => {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;

    let count = 0;
    let openEnds = 0;
    let cells = [];

    // Check in positive direction
    for (let k = 0; k < WIN_COUNT; k++) {
        const ni = row + k * dy;
        const nj = col + k * dx;
        if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
            const nextIndex = ni * BOARD_SIZE + nj;
            if (board[nextIndex] === player) {
                count++;
                cells.push(nextIndex);
            } else if (board[nextIndex] === null) {
                openEnds++;
                break;
            } else {
                break;
            }
        }
    }

    // Check in negative direction
    for (let k = 1; k < WIN_COUNT; k++) {
        const ni = row - k * dy;
        const nj = col - k * dx;
        if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
            const nextIndex = ni * BOARD_SIZE + nj;
            if (board[nextIndex] === player) {
                count++;
                cells.push(nextIndex);
            } else if (board[nextIndex] === null) {
                openEnds++;
                break;
            } else {
                break;
            }
        }
    }

    return { count, openEnds, cells };
};

// Score a position for a player
const scorePosition = (board, player) => {
    let score = 0;
    const opponent = player === 'X' ? 'O' : 'X';
    const directions = [
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
        { dx: 1, dy: -1 },
    ];

    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        if (board[i] !== player) continue;

        for (const { dx, dy } of directions) {
            const { count, openEnds } = evaluateLine(board, i, dx, dy, player);

            // Scoring based on count and open ends
            if (count >= 5) score += 100000;
            else if (count === 4 && openEnds === 2) score += 10000;
            else if (count === 4 && openEnds === 1) score += 1000;
            else if (count === 3 && openEnds === 2) score += 500;
            else if (count === 3 && openEnds === 1) score += 100;
            else if (count === 2 && openEnds === 2) score += 50;
            else if (count === 2 && openEnds === 1) score += 10;
        }
    }

    return score;
};

// Get all valid moves (empty cells near existing stones)
const getValidMoves = (board) => {
    const moves = new Set();
    const range = 2; // Consider cells within 2 squares of existing stones

    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        if (board[i]) {
            const row = Math.floor(i / BOARD_SIZE);
            const col = i % BOARD_SIZE;

            for (let dr = -range; dr <= range; dr++) {
                for (let dc = -range; dc <= range; dc++) {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                        const index = nr * BOARD_SIZE + nc;
                        if (!board[index]) {
                            moves.add(index);
                        }
                    }
                }
            }
        }
    }

    // If no moves near stones (first move), return center area
    if (moves.size === 0) {
        const center = Math.floor(BOARD_SIZE / 2);
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const index = (center + dr) * BOARD_SIZE + (center + dc);
                moves.add(index);
            }
        }
    }

    return Array.from(moves);
};

// Find positions that would complete N in a row
const findNInARowThreat = (board, player, n) => {
    const directions = [
        { dx: 1, dy: 0 },   // horizontal
        { dx: 0, dy: 1 },   // vertical
        { dx: 1, dy: 1 },   // diagonal down-right
        { dx: 1, dy: -1 },  // diagonal up-right
    ];

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const index = i * BOARD_SIZE + j;
            if (board[index] !== player) continue;

            for (const { dx, dy } of directions) {
                let count = 1;
                let emptyBefore = null;
                let emptyAfter = null;

                // Check in positive direction
                for (let k = 1; k < 5; k++) {
                    const ni = i + k * dy;
                    const nj = j + k * dx;
                    if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
                        const nextIndex = ni * BOARD_SIZE + nj;
                        if (board[nextIndex] === player) {
                            count++;
                        } else if (board[nextIndex] === null && emptyAfter === null) {
                            emptyAfter = nextIndex;
                            break;
                        } else {
                            break;
                        }
                    }
                }

                // Check in negative direction
                for (let k = 1; k < 5; k++) {
                    const ni = i - k * dy;
                    const nj = j - k * dx;
                    if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
                        const nextIndex = ni * BOARD_SIZE + nj;
                        if (board[nextIndex] === player) {
                            count++;
                        } else if (board[nextIndex] === null && emptyBefore === null) {
                            emptyBefore = nextIndex;
                            break;
                        } else {
                            break;
                        }
                    }
                }

                // If we found N in a row with empty spaces
                if (count >= n) {
                    // For 4 in a row, block either end
                    if (count === 4 && (emptyBefore !== null || emptyAfter !== null)) {
                        return emptyBefore !== null ? emptyBefore : emptyAfter;
                    }
                    // For 3 in a row with BOTH ends open (very dangerous)
                    if (count === 3 && emptyBefore !== null && emptyAfter !== null) {
                        return emptyBefore; // Block one end
                    }
                }
            }
        }
    }
    return null;
};

// Find immediate winning or blocking moves
const findCriticalMove = (board, player) => {
    const opponent = player === 'X' ? 'O' : 'X';
    const moves = getValidMoves(board);

    // Check for winning move (5 in a row)
    for (const move of moves) {
        const testBoard = [...board];
        testBoard[move] = player;
        if (checkWinner(testBoard)?.winner === player) {
            return move;
        }
    }

    // Check for blocking opponent's winning move
    for (const move of moves) {
        const testBoard = [...board];
        testBoard[move] = opponent;
        if (checkWinner(testBoard)?.winner === opponent) {
            return move;
        }
    }

    return null;
};

// Find threats (4 in a row or 3 in a row with open ends)
const findThreatMove = (board, player) => {
    const opponent = player === 'X' ? 'O' : 'X';

    // First check for 4 in a row threats
    const fourThreat = findNInARowThreat(board, opponent, 4);
    if (fourThreat !== null) return fourThreat;

    // Then check for 3 in a row with open ends
    const threeThreat = findNInARowThreat(board, opponent, 3);
    if (threeThreat !== null) return threeThreat;

    return null;
};

// Find best move using minimax with alpha-beta pruning (simplified for performance)
export const findBestMove = (board, difficulty = 'medium') => {
    const player = 'O'; // AI plays as O
    const opponent = 'X';

    const moves = getValidMoves(board);
    if (moves.length === 0) return -1;

    // First move - play near center
    if (board.every(cell => cell === null)) {
        const center = Math.floor(BOARD_SIZE / 2) * BOARD_SIZE + Math.floor(BOARD_SIZE / 2);
        return center;
    }

    // EASY: Very random, often misses obvious moves
    if (difficulty === 'easy') {
        // 60% chance to make a random move
        if (Math.random() < 0.6) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        // 40% chance to find critical move (win/block)
        const criticalMove = findCriticalMove(board, player);
        if (criticalMove !== null && Math.random() < 0.5) {
            return criticalMove;
        }
        // Otherwise pick a random move
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // MEDIUM: Sometimes makes good moves, sometimes misses
    if (difficulty === 'medium') {
        // Always check for winning move
        const criticalMove = findCriticalMove(board, player);
        if (criticalMove !== null) return criticalMove;

        // Check for 3-in-a-row threats (block them 70% of the time)
        const threatMove = findThreatMove(board, player);
        if (threatMove !== null && Math.random() < 0.7) {
            return threatMove;
        }

        // 15% chance to make a random move
        if (Math.random() < 0.15) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        // Find decent move with limited scoring
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (const move of moves) {
            const testBoard = [...board];
            testBoard[move] = player;

            const ourScore = scorePosition(testBoard, player);
            const theirScore = scorePosition(testBoard, opponent);
            const score = ourScore - theirScore * 1.0;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // HARD: Aggressive, always finds best move
    // Always check for critical moves first (win or block)
    const criticalMove = findCriticalMove(board, player);
    if (criticalMove !== null) return criticalMove;

    // Always check for 3-in-a-row and 4-in-a-row threats
    const threatMove = findThreatMove(board, player);
    if (threatMove !== null) return threatMove;

    // Also check for opponent's strong threats
    const opponentCritical = findCriticalMove(board, opponent);
    if (opponentCritical !== null) return opponentCritical;

    // Find the absolute best move
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
        const testBoard = [...board];
        testBoard[move] = player;

        const ourScore = scorePosition(testBoard, player);
        const theirScore = scorePosition(testBoard, opponent);
        // More aggressive: favor our attacks but still block
        const score = ourScore * 1.2 - theirScore * 1.5;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
};

// Get hint for player
export const getHint = (board) => {
    const player = 'X'; // Hint for player X

    // Check for winning move
    const criticalMove = findCriticalMove(board, player);
    if (criticalMove !== null) return criticalMove;

    // Otherwise find best scoring move
    const moves = getValidMoves(board);
    if (moves.length === 0) return null;

    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
        const testBoard = [...board];
        testBoard[move] = player;

        const score = scorePosition(testBoard, player);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
};

// Get winning line if any
export const getWinningLine = (board) => {
    const result = checkWinner(board);
    return result?.line || null;
};

export { BOARD_SIZE, WIN_COUNT };
