/**
 * Elo Rating Service
 * Dynamic Elo calculation for PvE games
 */

const { getGameConfig } = require('../config/gameConfig');

/**
 * Bot Elo ratings by difficulty level
 */
const BOT_ELO = {
    EASY: 800,
    NORMAL: 1200,
    HARD: 1800
};

/**
 * Target scores for score-based games (per difficulty)
 * Higher = harder to achieve
 */
const TARGET_SCORES = {
    snake: { EASY: 100, NORMAL: 300, HARD: 500 },
    match3: { EASY: 500, NORMAL: 1500, HARD: 3000 }
};

/**
 * Max wrong flips for Memory Cards (per difficulty)
 * Lower = harder (fewer mistakes allowed)
 */
const MAX_WRONG_FLIPS = {
    memory_cards: { EASY: 20, NORMAL: 10, HARD: 5 }
};

/**
 * Get K-Factor based on current Elo
 * Higher K = faster rating changes (for beginners)
 * Lower K = slower changes (for stable high ratings)
 * 
 * @param {number} elo - Current player Elo
 * @returns {number} K-Factor
 */
function getKFactor(elo) {
    if (elo < 1200) return 40;  // Newbie: fast adjustment
    if (elo < 2000) return 32;  // Intermediate
    return 16;                   // Expert: slow adjustment
}

/**
 * Calculate new Elo rating after a match
 * 
 * @param {number} playerElo - Current player Elo
 * @param {number} botElo - Bot difficulty Elo
 * @param {number} result - 1 = win, 0 = loss, 0.5 = draw
 * @returns {Object} { newElo, change }
 */
function calculateEloChange(playerElo, botElo, result) {
    const K = getKFactor(playerElo);
    
    // Expected score formula (probability of winning)
    const expectedScore = 1 / (1 + Math.pow(10, (botElo - playerElo) / 400));
    
    // Rating change
    const change = Math.round(K * (result - expectedScore));
    
    // Ensure Elo doesn't go below 0
    const newElo = Math.max(0, playerElo + change);
    
    return {
        newElo,
        change,
        expectedScore: Math.round(expectedScore * 100) / 100
    };
}

/**
 * Convert score to result (win/draw/loss) for score-based games
 * 
 * @param {number} score - Player's score
 * @param {string} gameType - Game type (e.g., 'snake', 'match3')
 * @param {string} difficulty - 'EASY' | 'NORMAL' | 'HARD'
 * @returns {number} 1 = win, 0.5 = draw, 0 = loss
 */
function scoreToResult(score, gameType, difficulty) {
    const target = TARGET_SCORES[gameType]?.[difficulty];
    if (!target) return 0;
    
    const ratio = score / target;
    if (ratio >= 1) return 1;      // Win: reached or exceeded target
    if (ratio >= 0.5) return 0.5;  // Draw: at least 50% of target
    return 0;                       // Loss: below 50%
}

/**
 * Convert wrong flips to result for Memory Cards
 * Lower wrong flips = better performance
 * 
 * @param {number} wrongFlips - Number of wrong flips
 * @param {string} difficulty - 'EASY' | 'NORMAL' | 'HARD'
 * @returns {number} 1 = win, 0.5 = draw, 0 = loss
 */
function wrongFlipsToResult(wrongFlips, difficulty) {
    const maxAllowed = MAX_WRONG_FLIPS.memory_cards?.[difficulty];
    if (!maxAllowed) return 0;
    
    if (wrongFlips <= maxAllowed) return 1;           // Win: within limit
    if (wrongFlips <= maxAllowed * 2) return 0.5;     // Draw: within double
    return 0;                                          // Loss: too many mistakes
}

/**
 * Get Bot Elo for a difficulty level
 * 
 * @param {string} difficulty - 'EASY' | 'NORMAL' | 'HARD'
 * @returns {number} Bot Elo rating
 */
function getBotElo(difficulty) {
    return BOT_ELO[difficulty] || BOT_ELO.NORMAL;
}

/**
 * Calculate Elo for a completed game
 * Main entry point for GameSession.complete()
 * 
 * @param {Object} params
 * @param {number} params.playerElo - Current player Elo
 * @param {string} params.gameType - Game type (e.g., 'caro_5', 'snake')
 * @param {string} params.difficulty - 'EASY' | 'NORMAL' | 'HARD'
 * @param {string} params.result - 'win' | 'loss' | 'draw' (for PvE games)
 * @param {number} params.score - Score (for score-based games)
 * @param {number} params.wrongFlips - Wrong flips count (for memory_cards)
 * @returns {Object|null} { newElo, change } or null if no Elo for this game
 */
function calculateGameElo({ playerElo, gameType, difficulty, result, score, wrongFlips }) {
    const gameConfig = getGameConfig(gameType);
    
    // Skip if game doesn't have Elo
    if (!gameConfig || !gameConfig.hasElo) {
        return null;
    }
    
    const botElo = getBotElo(difficulty);
    let gameResult;
    
    switch (gameConfig.scoringType) {
        case 'pve':
            // Direct win/loss/draw from game result
            if (result === 'win') gameResult = 1;
            else if (result === 'draw') gameResult = 0.5;
            else gameResult = 0;
            break;
            
        case 'score':
            // Convert score to result
            gameResult = scoreToResult(score || 0, gameType, difficulty);
            break;
            
        case 'wrong_flips':
            // Memory Cards: fewer wrong flips = better
            gameResult = wrongFlipsToResult(wrongFlips || 0, difficulty);
            break;
            
        default:
            return null;
    }
    
    return calculateEloChange(playerElo, botElo, gameResult);
}

module.exports = {
    BOT_ELO,
    TARGET_SCORES,
    MAX_WRONG_FLIPS,
    getKFactor,
    calculateEloChange,
    scoreToResult,
    wrongFlipsToResult,
    getBotElo,
    calculateGameElo
};
