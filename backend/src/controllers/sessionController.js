const GameSession = require('../models/GameSession');
const AchievementService = require('../services/achievementService');
const { success, error } = require('../utils/response');

/**
 * Session Controller
 * Handles HTTP requests for game sessions
 */

// ============================================
// USER ENDPOINTS (Authenticated)
// ============================================

/**
 * Complete a game and record results
 * POST /api/sessions/complete
 */
const completeGame = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { game_id, result, score, moves_count, time_elapsed, game_state, settings, started_at } = req.body;

        // Validate required fields
        if (!game_id) {
            return error(res, 'game_id is required', 400);
        }

        if (!result || !['win', 'loss', 'draw'].includes(result)) {
            return error(res, 'result must be one of: win, loss, draw', 400);
        }

        const session = await GameSession.complete(userId, {
            game_id,
            result,
            score,
            moves_count,
            time_elapsed,
            game_state,
            settings,
            started_at
        });

        // Check achievements after game completion
        const newlyUnlocked = await AchievementService.checkAchievements(userId, {
            type: 'game_complete',
            session: session
        });

        return success(res, { 
            session, 
            newly_unlocked: newlyUnlocked 
        }, 'Game completed successfully', 201);
    } catch (err) {
        if (err.code === '23503') { // Foreign key violation
            return error(res, 'Game not found', 404);
        }
        next(err);
    }
};

/**
 * Get user's game history
 * GET /api/sessions/history
 */
const getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page, limit, game_id, status } = req.query;

        const result = await GameSession.findByUser(userId, {
            page,
            limit,
            game_id,
            status
        });

        return success(res, result, 'History retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
const getSessionById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const session = await GameSession.findById(id, userId);

        if (!session) {
            return error(res, 'Session not found', 404);
        }

        return success(res, session, 'Session retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Start a new game session (for games that need resume)
 * POST /api/sessions/start
 */
const startSession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { game_id, game_state, settings } = req.body;

        if (!game_id) {
            return error(res, 'game_id is required', 400);
        }

        const session = await GameSession.create(userId, {
            game_id,
            game_state,
            settings
        });

        return success(res, session, 'Session started successfully', 201);
    } catch (err) {
        if (err.code === '23503') { // Foreign key violation
            return error(res, 'Game not found', 404);
        }
        next(err);
    }
};

/**
 * Save in-progress game state
 * PUT /api/sessions/:id/save
 */
const saveSession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { game_state, moves_count, time_elapsed } = req.body;

        if (!game_state) {
            return error(res, 'game_state is required', 400);
        }

        const session = await GameSession.saveState(id, userId, {
            game_state,
            moves_count,
            time_elapsed
        });

        if (!session) {
            return error(res, 'Session not found or not in progress', 404);
        }

        return success(res, session, 'Session saved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a session from history
 * DELETE /api/sessions/:id
 */
const deleteSession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deleted = await GameSession.delete(id, userId);

        if (!deleted) {
            return error(res, 'Session not found', 404);
        }

        return success(res, null, 'Session deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    completeGame,
    getHistory,
    getSessionById,
    startSession,
    saveSession,
    deleteSession
};
