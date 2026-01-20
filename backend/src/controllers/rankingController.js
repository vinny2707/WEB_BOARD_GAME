const Ranking = require('../models/Ranking');
const Game = require('../models/Game');
const { success, error } = require('../utils/response');

/**
 * Ranking Controller
 * Handles HTTP requests for game rankings
 */

/**
 * Get rankings for a specific game
 * Supports 3 scopes: global, friends, personal
 */
const getGameRankings = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { scope, page, limit } = req.query;
        const userId = req.user.id;

        // Validate game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return error(res, 'Game not found', 404);
        }

        // Validate scope
        const validScopes = ['global', 'friends', 'personal'];
        const selectedScope = scope || 'global';
        if (!validScopes.includes(selectedScope)) {
            return error(res, 'Invalid scope. Must be: global, friends, or personal', 400);
        }

        // Get rankings
        const result = await Ranking.getGameRankings(gameId, {
            scope: selectedScope,
            userId,
            page,
            limit
        });

        return success(res, result.data, 'Rankings retrieved successfully', 200, result.pagination);
    } catch (err) {
        next(err);
    }
};

/**
 * Get current user's ranking in a specific game
 */
const getMyGameRanking = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id;

        // Validate game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return error(res, 'Game not found', 404);
        }

        // Get user's ranking
        const ranking = await Ranking.getUserGameRanking(userId, gameId);

        if (!ranking) {
            return error(res, 'You have not played this game yet', 404);
        }

        return success(res, ranking, 'Your ranking retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get all rankings for current user (across all games)
 */
const getMyRankings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const rankings = await Ranking.getUserRankings(userId);

        return success(res, rankings, 'Your rankings retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get achievement rankings (game_id = 0)
 * Public leaderboard for achievement points
 */
const getAchievementRankings = async (req, res, next) => {
    try {
        const { scope, page, limit } = req.query;
        const userId = req.user?.id;

        // Validate scope
        const validScopes = ['global', 'friends'];
        const selectedScope = scope || 'global';
        if (!validScopes.includes(selectedScope)) {
            return error(res, 'Invalid scope. Must be: global or friends', 400);
        }

        // Get achievement rankings
        const result = await Ranking.getAchievementRankings({
            scope: selectedScope,
            userId,
            page,
            limit
        });

        return success(res, result.data, 'Achievement rankings retrieved successfully', 200, result.pagination);
    } catch (err) {
        next(err);
    }
};

/**
 * Get current user's achievement ranking
 */
const getMyAchievementRanking = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const ranking = await Ranking.getUserAchievementRanking(userId);

        if (!ranking) {
            return success(res, { 
                rank: null, 
                total_players: 0, 
                achievement_points: 0 
            }, 'No achievement points yet');
        }

        return success(res, ranking, 'Your achievement ranking retrieved successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getGameRankings,
    getMyGameRanking,
    getMyRankings,
    getAchievementRankings,
    getMyAchievementRanking
};
