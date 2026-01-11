/**
 * Application Constants
 * Centralized definitions for types used across the system
 */

// ============================================
// GAME TYPES
// Must match games.type in database
// ============================================
const GAME_TYPES = {
    CARO_5: 'caro_5',
    CARO_4: 'caro_4',
    TICTACTOE: 'tictactoe',
    SNAKE: 'snake',
    MATCH3: 'match3',
    MEMORY_CARDS: 'memory_cards',
    DRAWING_BOARD: 'drawing_board'
};

const GAME_TYPE_LIST = Object.values(GAME_TYPES);

// ============================================
// ACHIEVEMENT CATEGORIES
// Must match achievements.category in database
// ============================================
const ACHIEVEMENT_CATEGORIES = {
    BEGINNER: 'beginner',
    EXPERT: 'expert',
    SOCIAL: 'social',
    SPECIAL: 'special'
};

const ACHIEVEMENT_CATEGORY_LIST = Object.values(ACHIEVEMENT_CATEGORIES);

// ============================================
// ACHIEVEMENT CRITERIA TYPES
// Used in achievements.unlock_criteria.type
// ============================================
const CRITERIA_TYPES = {
    // Count-based (accumulated from rankings)
    TOTAL_GAMES: 'total_games',
    TOTAL_WINS: 'total_wins',
    GAME_WINS: 'game_wins',
    HIGH_SCORE: 'high_score',
    
    // Streak-based (calculated from sessions)
    WIN_STREAK: 'win_streak',
    
    // Time-based (from current session)
    WIN_TIME: 'win_time',
    TIME_CHALLENGE: 'time_challenge',
    PLAY_TIME: 'play_time',
    
    // Social-based (from friends/messages tables)
    FRIEND_COUNT: 'friend_count',
    MESSAGES_SENT: 'messages_sent',
    
    // Rank-based (from rankings.global_rank)
    GLOBAL_RANK: 'global_rank',
    
    // Multi-game (check wins across multiple game types)
    ALL_GAMES_WON: 'all_games_won',
    
    // Session state-based (require FE to send game_state data)
    COMBO_STREAK: 'combo_streak',
    PERFECT_GAME: 'perfect_game',
    COMEBACK_WIN: 'comeback_win'
};

const CRITERIA_TYPE_LIST = Object.values(CRITERIA_TYPES);

// ============================================
// SESSION STATUS
// ============================================
const SESSION_STATUS = {
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ABANDONED: 'abandoned'
};

// ============================================
// GAME RESULT
// ============================================
const GAME_RESULT = {
    WIN: 'win',
    LOSS: 'loss',
    DRAW: 'draw'
};

module.exports = {
    GAME_TYPES,
    GAME_TYPE_LIST,
    ACHIEVEMENT_CATEGORIES,
    ACHIEVEMENT_CATEGORY_LIST,
    CRITERIA_TYPES,
    CRITERIA_TYPE_LIST,
    SESSION_STATUS,
    GAME_RESULT
};
