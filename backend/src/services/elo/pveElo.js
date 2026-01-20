/**
 * PvE ELO Calculator
 * Cho các game đánh với Bot AI: Caro, Tic-Tac-Toe
 */

const { calculateEloChange } = require('./baseElo');
const { getBotElo } = require('./botConfig');

/**
 * Tính ELO cho game PvE (Caro, Tic-Tac-Toe)
 * 
 * @param {Object} params
 * @param {number} params.playerElo - ELO hiện tại
 * @param {string} params.gameType - caro_5, caro_4, tictactoe
 * @param {string} params.difficulty - easy/medium/hard
 * @param {string} params.result - win/draw/loss
 * @param {number} params.totalGames - Số game đã chơi (optional)
 * @param {Object} params.settings - Game settings (optional)
 * @returns {Object} { newElo, change, expectedScore, kFactor }
 */
function calculatePveElo({ playerElo, gameType, difficulty, result, totalGames = 0, settings = {} }) {
    // Lấy Bot ELO
    const botElo = getBotElo(gameType, difficulty);
    
    // Convert result sang score: win=1, draw=0.5, loss=0
    let actualScore;
    switch (result.toLowerCase()) {
        case 'win':
            actualScore = 1;
            break;
        case 'draw':
            actualScore = 0.5;
            break;
        case 'loss':
        default:
            actualScore = 0;
            break;
    }
    
    // Tính ELO change
    const eloResult = calculateEloChange(playerElo, botElo, actualScore, totalGames);
    
    return {
        ...eloResult,
        gameType,
        difficulty,
        botElo,
        result
    };
}

module.exports = {
    calculatePveElo
};
