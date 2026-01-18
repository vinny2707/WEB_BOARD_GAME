/**
 * Bot/Benchmark ELO Configuration
 * ELO của Bot AI hoặc Target benchmark cho từng game
 */

/**
 * Bot ELO cho các game PvE (đánh với AI)
 * 
 * Nguyên tắc:
 * - EASY: Thấp hơn starting (1000) → dễ thắng, ELO tăng ít
 * - MEDIUM: Xấp xỉ starting → cân bằng
 * - HARD: Cao hơn starting → khó thắng, thắng được ELO tăng nhiều
 */
const PVE_BOT_ELO = {
    caro_5: {
        easy:   700,
        medium: 1100,
        hard:   1600
    },
    caro_4: {
        easy:   650,
        medium: 1050,
        hard:   1550
    },
    tictactoe: {
        easy:   600,
        medium: 1000,
        hard:   1500  // Hard Tic-Tac-Toe AI rất mạnh
    }
};

/**
 * Benchmark ELO cho các game Single-player
 * (Không có AI thực sự, so sánh với target/benchmark)
 * 
 * Thấp hơn PvE vì không có AI "phản công"
 */
const SINGLEPLAYER_BENCHMARK_ELO = {
    snake: {
        easy:   650,
        medium: 1000,
        hard:   1450
    },
    match3: {
        easy:   600,
        medium: 950,
        hard:   1400
    },
    memory_cards: {
        easy:   550,
        medium: 900,
        hard:   1350
    }
};

/**
 * Target scores cho game Snake theo difficulty
 * (điểm = số táo × 10)
 */
const SNAKE_TARGETS = {
    easy:   80,   // 8 táo
    medium: 200,  // 20 táo
    hard:   400   // 40 táo
};

/**
 * Optimal flips cho Memory Cards
 * Công thức: totalPairs × 2 (lật hoàn hảo không sai)
 * 
 * @param {number} gridSize - Kích thước grid (2, 4, 6)
 * @returns {number} Số lượt lật tối ưu
 */
function getMemoryOptimalFlips(gridSize) {
    const totalCards = gridSize * gridSize;
    const totalPairs = totalCards / 2;
    return totalPairs * 2; // Mỗi cặp cần 2 lượt lật
}

/**
 * Lấy Bot/Benchmark ELO cho một game
 * 
 * @param {string} gameType - Loại game (caro_5, snake, etc.)
 * @param {string} difficulty - easy/medium/hard
 * @returns {number} ELO của bot/benchmark
 */
function getBotElo(gameType, difficulty = 'medium') {
    const normalizedDifficulty = difficulty.toLowerCase();
    
    // PvE games
    if (PVE_BOT_ELO[gameType]) {
        return PVE_BOT_ELO[gameType][normalizedDifficulty] || PVE_BOT_ELO[gameType].medium;
    }
    
    // Single-player games
    if (SINGLEPLAYER_BENCHMARK_ELO[gameType]) {
        return SINGLEPLAYER_BENCHMARK_ELO[gameType][normalizedDifficulty] || SINGLEPLAYER_BENCHMARK_ELO[gameType].medium;
    }
    
    // Default fallback
    return 1000;
}

/**
 * Lấy target score cho Snake game
 * 
 * @param {string} difficulty 
 * @param {Object} settings - Game settings (có thể có boardSize)
 * @returns {number} Target score
 */
function getSnakeTarget(difficulty, settings = {}) {
    const baseTarget = SNAKE_TARGETS[difficulty.toLowerCase()] || SNAKE_TARGETS.medium;
    
    // Điều chỉnh theo boardSize nếu có
    const boardSize = settings.boardSize?.value || 20;
    const boardMultiplier = boardSize / 20; // 20 là default
    
    return Math.round(baseTarget * boardMultiplier);
}

/**
 * Kiểm tra game có phải PvE (có AI thực sự) không
 * 
 * @param {string} gameType 
 * @returns {boolean}
 */
function isPveGame(gameType) {
    return ['caro_5', 'caro_4', 'tictactoe'].includes(gameType);
}

/**
 * Kiểm tra game có phải score-based không
 * 
 * @param {string} gameType 
 * @returns {boolean}
 */
function isScoreBasedGame(gameType) {
    return ['snake', 'match3'].includes(gameType);
}

/**
 * Kiểm tra game có phải performance-based không
 * 
 * @param {string} gameType 
 * @returns {boolean}
 */
function isPerformanceBasedGame(gameType) {
    return ['memory_cards'].includes(gameType);
}

module.exports = {
    PVE_BOT_ELO,
    SINGLEPLAYER_BENCHMARK_ELO,
    SNAKE_TARGETS,
    getBotElo,
    getSnakeTarget,
    getMemoryOptimalFlips,
    isPveGame,
    isScoreBasedGame,
    isPerformanceBasedGame
};
