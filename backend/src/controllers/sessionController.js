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
 * PUT /api/sessions/:id/complete (with session_id)
 * POST /api/sessions/complete (legacy - with game_id in body)
 */
const completeGame = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;  // From URL params (new way)
        const { game_id, result, score, moves_count, time_elapsed, game_state, settings, started_at } = req.body;

        // Validate: either session_id (from params) or game_id (from body) required
        if (!sessionId && !game_id) {
            return error(res, 'session_id (in URL) or game_id (in body) is required', 400);
        }

        if (!result || !['win', 'loss', 'draw'].includes(result)) {
            return error(res, 'result must be one of: win, loss, draw', 400);
        }

        const session = await GameSession.complete(userId, {
            session_id: sessionId,  // UUID of existing session (optional)
            game_id,                // Required if no session_id
            result,
            score,
            moves_count,
            time_elapsed,
            game_state,
            settings,
            started_at
        });

        // PRO MAX: Check achievements with incremental + smart filtering
        // This will be much faster (100-500ms instead of 12+ seconds)
        const newlyUnlocked = await AchievementService.checkAchievements(
            userId, 
            {
                type: 'game_complete',
                session: session
            },
            {
                background: false,  // Set to true to make it non-blocking (instant response)
                incremental: true   // Only check relevant achievements
            }
        );

        return success(res, { 
            session, 
            newly_unlocked: newlyUnlocked 
        }, 'Game completed successfully', 201);
    } catch (err) {
        if (err.code === '23503') { // Foreign key violation
            return error(res, 'Game not found', 404);
        }
        if (err.code === 'SESSION_NOT_FOUND') {
            return error(res, err.message, 404);
        }
        if (err.code === 'VALIDATION_ERROR') {
            return error(res, err.message, 400);
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
