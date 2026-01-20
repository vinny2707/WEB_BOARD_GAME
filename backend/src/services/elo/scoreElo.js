/**
 * Score-based ELO Calculator
 * Cho các game tính điểm: Snake, Candy Crush
 */

const { calculateEloChange } = require('./baseElo');
const { getBotElo, getSnakeTarget } = require('./botConfig');

/**
 * Convert score thành actual score (0-1) cho ELO calculation
 * 
 * WIN: score >= target → actualScore = 1
 * DRAW: 50-99% target → actualScore tỉ lệ (0.3 - 0.9)
 * LOSS: < 50% target → actualScore tỉ lệ (0 - 0.3)
 * 
 * @param {number} score - Điểm đạt được
 * @param {number} target - Điểm mục tiêu
 * @returns {Object} { actualScore, resultLabel }
 */
function scoreToActualScore(score, target) {
    const ratio = score / target;
    
    if (ratio >= 1.0) {
        // WIN: Đạt hoặc vượt target
        // Bonus nhỏ nếu vượt xa target (cap at 1.0)
        return {
            actualScore: 1,
            resultLabel: 'win'
        };
    } else if (ratio >= 0.5) {
        // DRAW zone: 50% - 99% target
        // Linear scale từ 0.3 (at 50%) đến 0.9 (at 99%)
        const actualScore = 0.3 + (ratio - 0.5) * 1.2;
        return {
            actualScore: Math.min(0.9, actualScore),
            resultLabel: 'draw'
        };
    } else {
        // LOSS zone: 0% - 49% target
        // Linear scale từ 0 (at 0%) đến 0.3 (at 49%)
        const actualScore = ratio * 0.6;
        return {
            actualScore: Math.max(0, actualScore),
            resultLabel: 'loss'
        };
    }
}

/**
 * Tính ELO cho Snake game
 * 
 * @param {Object} params
 * @param {number} params.playerElo - ELO hiện tại
 * @param {string} params.difficulty - easy/medium/hard
 * @param {number} params.score - Điểm đạt được
 * @param {number} params.totalGames - Số game đã chơi
 * @param {Object} params.settings - Game settings
 * @returns {Object} ELO result
 */
function calculateSnakeElo({ playerElo, difficulty, score, totalGames = 0, settings = {} }) {
    const gameType = 'snake';
    const benchmarkElo = getBotElo(gameType, difficulty);
    const target = getSnakeTarget(difficulty, settings);
    
    // Convert score to actual score
    const { actualScore, resultLabel } = scoreToActualScore(score, target);
    
    // Tính ELO
    const eloResult = calculateEloChange(playerElo, benchmarkElo, actualScore, totalGames);
    
    return {
        ...eloResult,
        gameType,
        difficulty,
        benchmarkElo,
        target,
        score,
        scoreRatio: Math.round((score / target) * 100) / 100,
        result: resultLabel
    };
}

/**
 * Tính ELO cho Candy Crush (match3) game
 * 
 * @param {Object} params
 * @param {number} params.playerElo - ELO hiện tại
 * @param {string} params.difficulty - easy/medium/hard
 * @param {number} params.score - Điểm đạt được
 * @param {number} params.totalGames - Số game đã chơi
 * @param {Object} params.settings - Game settings (có targetScore)
 * @returns {Object} ELO result
 */
function calculateMatch3Elo({ playerElo, difficulty, score, totalGames = 0, settings = {} }) {
    const gameType = 'match3';
    const benchmarkElo = getBotElo(gameType, difficulty);
    
    // Lấy target từ settings hoặc default
    let target = settings.targetScore?.value || 5000;
    
    // Convert score to actual score
    const { actualScore, resultLabel } = scoreToActualScore(score, target);
    
    // Tính ELO
    const eloResult = calculateEloChange(playerElo, benchmarkElo, actualScore, totalGames);
    
    return {
        ...eloResult,
        gameType,
        difficulty,
        benchmarkElo,
        target,
        score,
        scoreRatio: Math.round((score / target) * 100) / 100,
        result: resultLabel
    };
}

/**
 * Tính ELO chung cho score-based games
 * 
 * @param {Object} params
 * @param {number} params.playerElo
 * @param {string} params.gameType - snake hoặc match3
 * @param {string} params.difficulty
 * @param {number} params.score
 * @param {number} params.totalGames
 * @param {Object} params.settings
 * @returns {Object} ELO result
 */
function calculateScoreElo(params) {
    if (params.gameType === 'snake') {
        return calculateSnakeElo(params);
    } else if (params.gameType === 'match3') {
        return calculateMatch3Elo(params);
    }
    
    // Fallback
    return null;
}

module.exports = {
    scoreToActualScore,
    calculateSnakeElo,
    calculateMatch3Elo,
    calculateScoreElo
};
