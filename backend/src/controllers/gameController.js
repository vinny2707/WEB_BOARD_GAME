const Game = require('../models/Game');
const { success, error } = require('../utils/response');

/**
 * Game Controller
 * Handles HTTP requests for game management
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * Get all games (summary info only)
 * Returns all games including disabled for FE display
 * Supports pagination, search, and enabled filter
 */
const getAllGames = async (req, res, next) => {
    try {
        const { page, limit, search, enabled } = req.query;
        const result = await Game.findAll({ page, limit, search, enabled });
        return success(res, result, 'Games retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get game by ID (full details)
 */
const getGameById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const game = await Game.findById(id);

        if (!game) {
            return error(res, 'Game not found', 404);
        }

        return success(res, game, 'Game retrieved successfully');
    } catch (err) {
        next(err);
    }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Create new game (Admin only)
 */
const createGame = async (req, res, next) => {
    try {
        const { name, type, description, rows, cols, enabled, icon, rules, settings } = req.body;

        // Validate required fields
        if (!name || !type || !rows || !cols) {
            return error(res, 'name, type, rows, and cols are required', 400);
        }

        // Check if type already exists
        const existingGame = await Game.findById(null); // We need to check by type
        // Simple check - we'll validate in the model or let DB handle unique constraint

        const gameData = {
            name,
            type,
            description,
            rows,
            cols,
            enabled: enabled !== undefined ? enabled : true,
            icon,
            rules,
            settings
        };

        const game = await Game.create(gameData);
        return success(res, game, 'Game created successfully', 201);
    } catch (err) {
        if (err.code === '23505') { // PostgreSQL unique violation
            return error(res, 'Game type already exists', 409);
        }
        next(err);
    }
};

/**
 * Update game by ID (Admin only)
 */
const updateGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type, description, rows, cols, icon, rules, settings } = req.body;

        // Check if game exists
        const existingGame = await Game.findById(id);
        if (!existingGame) {
            return error(res, 'Game not found', 404);
        }

        // Build update data (only include provided fields)
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (type !== undefined) updateData.type = type;
        if (description !== undefined) updateData.description = description;
        if (rows !== undefined) updateData.rows = rows;
        if (cols !== undefined) updateData.cols = cols;
        if (icon !== undefined) updateData.icon = icon;
        if (rules !== undefined) updateData.rules = rules;
        if (settings !== undefined) updateData.settings = settings;

        const game = await Game.update(id, updateData);
        return success(res, game, 'Game updated successfully');
    } catch (err) {
        if (err.code === '23505') { // PostgreSQL unique violation
            return error(res, 'Game type already exists', 409);
        }
        next(err);
    }
};

/**
 * Toggle game enabled status (Admin only)
 */
const toggleGameStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { enabled } = req.body;

        if (enabled === undefined) {
            return error(res, 'enabled field is required', 400);
        }

        // Check if game exists
        const existingGame = await Game.findById(id);
        if (!existingGame) {
            return error(res, 'Game not found', 404);
        }

        const game = await Game.toggleEnabled(id, enabled);
        const message = enabled ? 'Game enabled successfully' : 'Game disabled successfully';
        return success(res, game, message);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete game by ID (Admin only)
 */
const deleteGame = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if game exists
        const existingGame = await Game.findById(id);
        if (!existingGame) {
            return error(res, 'Game not found', 404);
        }

        await Game.delete(id);
        return success(res, null, 'Game deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    // Public
    getAllGames,
    getGameById,
    // Admin
    createGame,
    updateGame,
    toggleGameStatus,
    deleteGame
};
