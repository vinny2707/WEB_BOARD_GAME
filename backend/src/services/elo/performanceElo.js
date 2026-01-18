/**
 * Performance-based ELO Calculator
 * Cho Memory Cards game - đánh giá dựa trên hiệu suất (số lượt lật)
 */

const { calculateEloChange } = require('./baseElo');
const { getBotElo, getMemoryOptimalFlips } = require('./botConfig');

/**
 * Convert số lượt lật thành actual score (0-1)
 * 
 * Optimal = totalPairs × 2 (lật hoàn hảo)
 * 
 * WIN: flips <= optimal × 1.5 → actualScore cao
 * DRAW: optimal × 1.5 - 2.5 → actualScore trung bình
 * LOSS: > optimal × 2.5 → actualScore thấp
 * 
 * @param {number} totalFlips - Tổng số lần lật
 * @param {number} gridSize - Kích thước grid (2, 4, 6)
 * @returns {Object} { actualScore, resultLabel, efficiency }
 */
function flipsToActualScore(totalFlips, gridSize) {
    const optimalFlips = getMemoryOptimalFlips(gridSize);
    const maxReasonableFlips = optimalFlips * 3; // 3x optimal = rất tệ
    
    // Efficiency: 1.0 = perfect, 0 = terrible
    // Công thức: how close to optimal
    const efficiency = Math.max(0, 1 - (totalFlips - optimalFlips) / (maxReasonableFlips - optimalFlips));
    
    let actualScore, resultLabel;
    
    if (totalFlips <= optimalFlips * 1.5) {
        // WIN: Rất tốt - gần optimal
        // Scale từ 0.8 (at 1.5x) đến 1.0 (at 1x)
        const ratio = totalFlips / optimalFlips;
        actualScore = 1 - (ratio - 1) * 0.4; // 1.0 at optimal, 0.8 at 1.5x
        actualScore = Math.max(0.8, Math.min(1, actualScore));
        resultLabel = 'win';
    } else if (totalFlips <= optimalFlips * 2.5) {
        // DRAW: Trung bình
        // Scale từ 0.3 (at 2.5x) đến 0.7 (at 1.5x)
        const ratio = (totalFlips - optimalFlips * 1.5) / (optimalFlips);
        actualScore = 0.7 - ratio * 0.4;
        actualScore = Math.max(0.3, Math.min(0.7, actualScore));
        resultLabel = 'draw';
    } else {
        // LOSS: Kém - quá nhiều lượt
        // Scale từ 0 đến 0.3
        actualScore = Math.max(0, efficiency * 0.3);
        resultLabel = 'loss';
    }
    
    return {
        actualScore,
        resultLabel,
        efficiency: Math.round(efficiency * 100) / 100,
        optimalFlips
    };
}

/**
 * Tính ELO cho Memory Cards game
 * 
 * @param {Object} params
 * @param {number} params.playerElo - ELO hiện tại
 * @param {string} params.difficulty - easy/medium/hard
 * @param {number} params.totalFlips - Tổng số lần lật thẻ
 * @param {number} params.gridSize - Kích thước grid (2, 4, 6)
 * @param {number} params.totalGames - Số game đã chơi
 * @param {Object} params.settings - Game settings
 * @returns {Object} ELO result
 */
function calculateMemoryElo({ playerElo, difficulty, totalFlips, gridSize, totalGames = 0, settings = {} }) {
    const gameType = 'memory_cards';
    const benchmarkElo = getBotElo(gameType, difficulty);
    
    // Lấy gridSize từ settings nếu không được pass trực tiếp
    const actualGridSize = gridSize || settings.gridSize?.value || 4;
    
    // Convert flips to actual score
    const { actualScore, resultLabel, efficiency, optimalFlips } = flipsToActualScore(totalFlips, actualGridSize);
    
    // Tính ELO
    const eloResult = calculateEloChange(playerElo, benchmarkElo, actualScore, totalGames);
    
    return {
        ...eloResult,
        gameType,
        difficulty,
        benchmarkElo,
        totalFlips,
        optimalFlips,
        gridSize: actualGridSize,
        efficiency,
        result: resultLabel
    };
}

module.exports = {
    flipsToActualScore,
    getMemoryOptimalFlips,
    calculateMemoryElo
};
