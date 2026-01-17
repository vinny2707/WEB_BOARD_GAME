/**
 * Game Configuration
 * Defines game types and their scoring mechanisms
 */

const GAME_TYPES = {
    caro_5: { 
        name: 'Caro Hàng 5', 
        scoringType: 'pve',  // Player vs Bot (win/loss/draw)
        hasElo: true 
    },
    caro_4: { 
        name: 'Caro Hàng 4', 
        scoringType: 'pve', 
        hasElo: true 
    },
    tictactoe: { 
        name: 'Tic-Tac-Toe', 
        scoringType: 'pve', 
        hasElo: true 
    },
    snake: { 
        name: 'Rắn Săn Mồi', 
        scoringType: 'score',  // Higher score is better
        hasElo: true 
    },
    match3: { 
        name: 'Candy Crush', 
        scoringType: 'score', 
        hasElo: true 
    },
    memory_cards: { 
        name: 'Cờ Trí Nhớ', 
        scoringType: 'wrong_flips',  // Lower wrong flips is better
        hasElo: true 
    },
    drawing_board: { 
        name: 'Bảng Vẽ', 
        scoringType: 'none',  // No scoring
        hasElo: false 
    }
};

/**
 * Get game configuration by type
 * @param {string} type - Game type (e.g., 'caro_5', 'snake')
 * @returns {Object|null}
 */
function getGameConfig(type) {
    return GAME_TYPES[type] || null;
}

/**
 * Check if game has Elo rating
 * @param {string} type 
 * @returns {boolean}
 */
function hasEloRating(type) {
    return GAME_TYPES[type]?.hasElo || false;
}

module.exports = {
    GAME_TYPES,
    getGameConfig,
    hasEloRating
};
