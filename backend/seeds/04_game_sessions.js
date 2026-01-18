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
    7: 'drawing_board'
};

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const RESULTS = ['win', 'loss', 'draw'];

/**
 * Generate game state mẫu cho từng loại game
 */
function generateGameState(gameType, result) {
    switch (gameType) {
        case 'caro_5':
        case 'caro_4':
            return {
                board: [],
                lastMove: { row: 7, col: 8 },
                winner: result === 'win' ? 'player' : result === 'loss' ? 'ai' : null
            };
        case 'tictactoe':
            return {
                board: [['X', 'O', 'X'], ['O', 'X', 'O'], ['O', 'X', 'X']],
                winner: result === 'win' ? 'X' : result === 'loss' ? 'O' : null
            };
        case 'snake':
            return {
                snake: [[10, 10], [10, 9], [10, 8]],
                food: [15, 15],
                direction: 'right',
                gameOver: true
            };
        case 'match3':
            return {
                grid: [],
                movesLeft: 0,
                candiesCleared: 45
            };
        case 'memory_cards':
            return {
                matchedPairs: 8,
                totalFlips: 24,
                completed: true
            };
        default:
            return {};
    }
}

/**
 * Generate settings cho từng loại game
 */
function generateSettings(gameType, difficulty) {
    const base = { difficulty: { value: difficulty } };
    
    switch (gameType) {
        case 'caro_5':
            return { ...base, boardSize: { value: 15 }, timePerTurn: { value: 40 } };
        case 'caro_4':
            return { ...base, boardSize: { value: 10 }, timePerTurn: { value: 30 } };
        case 'tictactoe':
            return { ...base, boardSize: { value: 3 }, timePerTurn: { value: 30 } };
        case 'snake':
            return { ...base, boardSize: { value: 20 }, wallMode: { value: 'solid' } };
        case 'match3':
            return { ...base, boardSize: { value: 8 }, targetScore: { value: 5000 }, moves: { value: 30 } };
        case 'memory_cards':
            return { ...base, gridSize: { value: 4 }, theme: { value: 'fruits' } };
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

exports.seed = async function(knex) {
    await knex('game_sessions').del();
    
    // Lấy rankings để biết mỗi user chơi bao nhiêu game
    const rankings = await knex('rankings').select('user_id', 'game_id', 'total_games', 'total_wins', 'total_losses', 'total_draws');
    
    const sessions = [];
    
    for (const ranking of rankings) {
        const gameType = GAME_TYPES[ranking.game_id];
        if (!gameType || gameType === 'drawing_board') continue;
        
        // Tạo sessions dựa trên total_games
        const numSessions = Math.min(ranking.total_games, 20); // Max 20 sessions per user per game
        
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
