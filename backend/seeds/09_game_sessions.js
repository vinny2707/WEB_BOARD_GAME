/**
 * Seed: Game Sessions
 * Tạo game sessions cho 100 users dựa trên rankings
 * Mỗi user có sessions tương ứng với total_games trong rankings
 * Dữ liệu trải dài 4 tháng
 */

const DATA_SPREAD_DAYS = 120;

const GAME_TYPES = {
    1: 'caro_5',
    2: 'caro_4',
    3: 'tictactoe',
    4: 'snake',
    5: 'match3',
    6: 'memory_cards',
    7: 'draw_board'
};

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const RESULTS = ['win', 'loss', 'draw'];

/**
 * Helper: Tạo random board cho Caro/TicTacToe (Flattened 1D)
 */
function generateRandomBoard(result, size) {
    const totalCells = size * size;
    const board = Array(totalCells).fill(null);
    const moves = [];
    const numMoves = Math.floor(totalCells * 0.4); // Fill 40% board

    // Fill random moves
    for (let i = 0; i < numMoves; i++) {
        let idx;
        do {
            idx = Math.floor(Math.random() * totalCells);
        } while (board[idx] !== null);

        const player = i % 2 === 0 ? 'X' : 'O';
        board[idx] = player;

        // Calculate row/col for history/moves if needed (though frontend mainly uses board for static view)
        const r = Math.floor(idx / size);
        const c = idx % size;
        moves.push({ player, row: r, col: c });
    }

    // Đảm bảo winner nếu có (Horizontal win at row 0)
    if (result === 'win') {
        for (let k = 0; k < (size === 3 ? 3 : 5); k++) {
            board[k] = 'X';
        }
    } else if (result === 'loss') {
        for (let k = 0; k < (size === 3 ? 3 : 5); k++) {
            board[k] = 'O';
        }
    }

    return { board, moves };
}

/**
 * Generate game state mẫu cho từng loại game
 */
function generateGameState(gameType, result) {
    switch (gameType) {
        case 'caro_5':
            const c5 = generateRandomBoard(result, 15);
            return {
                board: c5.board,
                history: c5.moves,
                winner: result === 'win' ? 'X' : result === 'loss' ? 'O' : null,
                boardSize: 15
            };
        case 'caro_4':
            const c4 = generateRandomBoard(result, 10);
            return {
                board: c4.board,
                history: c4.moves,
                winner: result === 'win' ? 'X' : result === 'loss' ? 'O' : null,
                boardSize: 10
            };
        case 'tictactoe':
            const ttt = generateRandomBoard(result, 3);
            return {
                board: ttt.board,
                history: ttt.moves,
                winner: result === 'win' ? 'X' : result === 'loss' ? 'O' : null,
                boardSize: 3
            };
        case 'snake':
            // Rắn dài dựa trên kết quả giả định
            const bodyLength = result === 'win' ? 15 : 5;
            const snakeBody = [];
            // Coordinate objects {x, y}
            for (let k = 0; k < bodyLength; k++) snakeBody.push({ x: 10, y: 10 + k });

            return {
                snake: snakeBody,
                food: { x: Math.floor(Math.random() * 15), y: Math.floor(Math.random() * 15) },
                direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
                score: bodyLength * 10,
                gameOver: true
            };
        case 'match3':
            // Grid 8x8 flattened (64 items)
            const match3Board = Array(64).fill(null).map(() => Math.floor(Math.random() * 5) + 1);
            return {
                board: match3Board, // Frontend expects 'board', not 'grid'
                movesLeft: 0,
                score: result === 'win' ? 5000 : 1200,
                candiesCleared: 45
            };
        case 'memory_cards':
            return {
                matchedPairs: 8,
                totalFlips: 24,
                completed: true
            };
        case 'draw_board':
            // Generate a 30x40 grid with some random filled pixels
            const grid = Array(30).fill(null).map(() => Array(40).fill(null));
            for (let i = 0; i < 30; i++) {
                for (let j = 0; j < 40; j++) {
                    // Randomly fill some pixels
                    if (Math.random() > 0.9) {
                        grid[i][j] = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'][Math.floor(Math.random() * 4)];
                    }
                }
            }
            return {
                grid: grid,
                colorsUsed: 4,
                canvasSize: '30x40'
            };
        default:
            return {};
    }
}

/**
 * Generate settings cho từng loại game
 */
/**
 * Generate settings cho từng loại game
 */
function generateSettings(gameType, difficulty) {
    const base = { difficulty };

    switch (gameType) {
        case 'caro_5':
            return { ...base, boardSize: 15, timePerTurn: 40 };
        case 'caro_4':
            return { ...base, boardSize: 10, timePerTurn: 30 };
        case 'tictactoe':
            return { ...base, boardSize: 3, timePerTurn: 30 };
        case 'snake':
            return { ...base, boardSize: 20, wallMode: 'solid' };
        case 'match3':
            return { ...base, boardSize: 8, targetScore: 5000, moves: 30 };
        case 'memory_cards':
            return { ...base, gridSize: 4, theme: 'fruits' };
        case 'draw_board':
            return { ...base, gameMode: 'freeplay', saveDrawing: true };
        default:
            return base;
    }
}

/**
 * Generate score/elo change dựa trên result và difficulty
 */
function generateScore(result, difficulty) {
    // ELO change dựa trên result
    let baseChange;
    if (result === 'win') {
        baseChange = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 15 : 25;
    } else if (result === 'loss') {
        baseChange = difficulty === 'easy' ? -20 : difficulty === 'medium' ? -12 : -5;
    } else {
        baseChange = difficulty === 'easy' ? -5 : difficulty === 'medium' ? 2 : 8;
    }

    // Thêm variance
    return baseChange + (Math.floor(Math.random() * 10) - 5);
}

exports.seed = async function (knex) {
    await knex('game_sessions').del();

    // Lấy rankings để biết mỗi user chơi bao nhiêu game
    const rankings = await knex('rankings').select('user_id', 'game_id', 'total_games', 'total_wins', 'total_losses', 'total_draws');

    const sessions = [];

    for (const ranking of rankings) {
        const gameType = GAME_TYPES[ranking.game_id];
        // Skip nếu không xác định game type, BỎ skip drawing_board
        if (!gameType) continue;

        // Tạo sessions dựa trên total_games
        // Giảm giới hạn xuống 50 để tránh quá tải
        const numSessions = Math.min(ranking.total_games, 50); // Max 50 sessions per user per game

        let wins = Math.min(ranking.total_wins, numSessions);
        let losses = Math.min(ranking.total_losses, numSessions - wins);
        let draws = numSessions - wins - losses;

        for (let i = 0; i < numSessions; i++) {
            // Determine result
            let result;
            if (wins > 0) {
                result = 'win';
                wins--;
            } else if (losses > 0) {
                result = 'loss';
                losses--;
            } else {
                result = 'draw';
                draws--;
            }

            const difficulty = DIFFICULTIES[i % 3];
            // Trải dữ liệu trong 4 tháng
            const daysAgo = Math.floor((i / numSessions) * DATA_SPREAD_DAYS) + 1;

            sessions.push({
                user_id: ranking.user_id,
                game_id: ranking.game_id,
                game_state: JSON.stringify(generateGameState(gameType, result)),
                settings: JSON.stringify(generateSettings(gameType, difficulty)),
                result: result,
                score: generateScore(result, difficulty),
                moves_count: 10 + (i * 3) % 50,
                time_elapsed: 60 + (i * 30) % 1800,
                status: 'completed',
                started_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`),
                ended_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days' + INTERVAL '${10 + i % 30} minutes'`),
                saved_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days' + INTERVAL '${10 + i % 30} minutes'`)
            });
        }
    }

    // Thêm vài sessions in_progress cho một số users (giảm xuống 10 users)
    for (let userId = 1; userId <= 10; userId++) {
        const gameId = (userId % 6) + 1;
        const gameType = GAME_TYPES[gameId];

        sessions.push({
            user_id: userId,
            game_id: gameId,
            game_state: JSON.stringify(generateGameState(gameType, null)),
            settings: JSON.stringify(generateSettings(gameType, 'medium')),
            result: null,
            score: 0,
            moves_count: 5 + (userId % 20),
            time_elapsed: 60 + (userId % 300),
            status: 'in_progress',
            started_at: knex.raw(`NOW() - INTERVAL '${userId % 24} hours'`),
            ended_at: null,
            saved_at: knex.raw(`NOW() - INTERVAL '${userId % 60} minutes'`)
        });
    }

    // Insert theo batch
    const batchSize = 500;
    for (let i = 0; i < sessions.length; i += batchSize) {
        const batch = sessions.slice(i, i + batchSize);
        await knex('game_sessions').insert(batch);
    }
};
