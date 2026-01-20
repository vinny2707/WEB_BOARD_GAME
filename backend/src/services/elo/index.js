/**
 * ELO Service - Main Entry Point
 * Export tất cả ELO functions từ các module con
 */

const baseElo = require('./baseElo');
const botConfig = require('./botConfig');
const pveElo = require('./pveElo');
const scoreElo = require('./scoreElo');
const performanceElo = require('./performanceElo');

/**
 * Tính ELO cho bất kỳ game nào
 * Auto-detect game type và gọi đúng calculator
 * 
 * @param {Object} params
 * @param {number} params.playerElo - ELO hiện tại của player
 * @param {string} params.gameType - Loại game
 * @param {string} params.difficulty - easy/medium/hard
 * @param {string} params.result - win/draw/loss (cho PvE games)
 * @param {number} params.score - Điểm (cho score-based games)
 * @param {number} params.totalFlips - Số lượt lật (cho memory_cards)
 * @param {number} params.totalGames - Số game đã chơi
 * @param {Object} params.settings - Game settings
 * @returns {Object|null} ELO result hoặc null nếu game không có ELO
 */
function calculateGameElo(params) {
    const { gameType, playerElo = 1000, difficulty = 'medium', totalGames = 0, settings = {} } = params;
    
    // Game không có ELO
    if (gameType === 'drawing_board') {
        return null;
    }
    
    // PvE games (đánh với AI)
    if (botConfig.isPveGame(gameType)) {
        return pveElo.calculatePveElo({
            playerElo,
            gameType,
            difficulty,
            result: params.result || 'loss',
            totalGames,
            settings
        });
    }
    
    // Score-based games
    if (botConfig.isScoreBasedGame(gameType)) {
        return scoreElo.calculateScoreElo({
            playerElo,
            gameType,
            difficulty,
            score: params.score || 0,
            totalGames,
            settings
        });
    }
    
    // Performance-based games (Memory Cards)
    if (botConfig.isPerformanceBasedGame(gameType)) {
        return performanceElo.calculateMemoryElo({
            playerElo,
            difficulty,
            totalFlips: params.totalFlips || params.score || 0, // score có thể chứa totalFlips
            gridSize: settings.gridSize?.value,
            totalGames,
            settings
        });
    }
    
    return null;
}

// Export everything
module.exports = {
    // Main function
    calculateGameElo,
    
    // Base ELO
    ...baseElo,
    
    // Bot Config
    ...botConfig,
    
    // Individual calculators
    calculatePveElo: pveElo.calculatePveElo,
    calculateScoreElo: scoreElo.calculateScoreElo,
    calculateSnakeElo: scoreElo.calculateSnakeElo,
    calculateMatch3Elo: scoreElo.calculateMatch3Elo,
    calculateMemoryElo: performanceElo.calculateMemoryElo
};
