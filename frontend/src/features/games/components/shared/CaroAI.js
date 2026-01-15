// Shared Caro AI - Configurable N in a row game logic

/**
 * Create AI functions for Caro game with configurable win count
 * @param {number} winCount - Number of pieces in a row to win (4 or 5)
 * @param {number} boardSize - Size of the board (default 15)
 */
export const createCaroAI = (winCount = 5, boardSize = 15) => {
    const BOARD_SIZE = boardSize;
    const WIN_COUNT = winCount;

    // Check if there's a winner
    const checkWinner = (board) => {
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
    const isDraw = (board) => {
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
                if (count >= WIN_COUNT) score += 100000;
                else if (count === WIN_COUNT - 1 && openEnds === 2) score += 10000;
                else if (count === WIN_COUNT - 1 && openEnds === 1) score += 1000;
                else if (count === WIN_COUNT - 2 && openEnds === 2) score += 500;
                else if (count === WIN_COUNT - 2 && openEnds === 1) score += 100;
                else if (count === WIN_COUNT - 3 && openEnds === 2) score += 50;
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
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: -1 },
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
                    for (let k = 1; k < WIN_COUNT; k++) {
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
                    for (let k = 1; k < WIN_COUNT; k++) {
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
                        if (count === WIN_COUNT - 1 && (emptyBefore !== null || emptyAfter !== null)) {
                            return emptyBefore !== null ? emptyBefore : emptyAfter;
                        }
                        if (count === WIN_COUNT - 2 && emptyBefore !== null && emptyAfter !== null) {
                            return emptyBefore;
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

        // Check for winning move
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

    // Find threats
    const findThreatMove = (board, player) => {
        const opponent = player === 'X' ? 'O' : 'X';

        // Check for (WIN_COUNT-1) in a row threats
        const threat1 = findNInARowThreat(board, opponent, WIN_COUNT - 1);
        if (threat1 !== null) return threat1;

        // Check for (WIN_COUNT-2) in a row with open ends
        const threat2 = findNInARowThreat(board, opponent, WIN_COUNT - 2);
        if (threat2 !== null) return threat2;

        return null;
    };

    // Find best move
    const findBestMove = (board, difficulty = 'medium') => {
        const player = 'O';
        const opponent = 'X';

        const moves = getValidMoves(board);
        if (moves.length === 0) return -1;

        // First move - play near center
        if (board.every(cell => cell === null)) {
            const center = Math.floor(BOARD_SIZE / 2) * BOARD_SIZE + Math.floor(BOARD_SIZE / 2);
            return center;
        }

        // EASY: Very random
        if (difficulty === 'easy') {
            if (Math.random() < 0.6) {
                return moves[Math.floor(Math.random() * moves.length)];
            }
            const criticalMove = findCriticalMove(board, player);
            if (criticalMove !== null && Math.random() < 0.5) {
                return criticalMove;
            }
            return moves[Math.floor(Math.random() * moves.length)];
        }

        // MEDIUM: Sometimes makes good moves
        if (difficulty === 'medium') {
            const criticalMove = findCriticalMove(board, player);
            if (criticalMove !== null) return criticalMove;

            const threatMove = findThreatMove(board, player);
            if (threatMove !== null && Math.random() < 0.7) {
                return threatMove;
            }

            if (Math.random() < 0.15) {
                return moves[Math.floor(Math.random() * moves.length)];
            }

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

        // HARD: Always finds best move
        const criticalMove = findCriticalMove(board, player);
        if (criticalMove !== null) return criticalMove;

        const threatMove = findThreatMove(board, player);
        if (threatMove !== null) return threatMove;

        const opponentCritical = findCriticalMove(board, opponent);
        if (opponentCritical !== null) return opponentCritical;

        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (const move of moves) {
            const testBoard = [...board];
            testBoard[move] = player;

            const ourScore = scorePosition(testBoard, player);
            const theirScore = scorePosition(testBoard, opponent);
            const score = ourScore * 1.2 - theirScore * 1.5;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    };

    // Get hint for player
    const getHint = (board) => {
        const player = 'X';

        const criticalMove = findCriticalMove(board, player);
        if (criticalMove !== null) return criticalMove;

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
    const getWinningLine = (board) => {
        const result = checkWinner(board);
        return result?.line || null;
    };

    return {
        checkWinner,
        isDraw,
        findBestMove,
        getHint,
        getWinningLine,
        BOARD_SIZE,
        WIN_COUNT
    };
};

// Pre-configured exports for convenience
export const gomokuAI = createCaroAI(5, 15);
export const caro4AI = createCaroAI(4, 15);

// Default export for Gomoku (5 in a row) - backwards compatibility
export const { checkWinner, isDraw, findBestMove, getHint, getWinningLine, BOARD_SIZE, WIN_COUNT } = gomokuAI;
