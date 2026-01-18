const Statistics = require('../models/Statistics');

/**
 * Statistics Controller
 * Handles all statistics and analytics endpoints
 */

/**
 * Get hot/popular games
 * GET /api/statistics/games/hot
 */
exports.getHotGames = async (req, res) => {
    try {
        const { from_date, to_date, limit } = req.query;

        // Validate limit
        const limitNum = parseInt(limit) || 10;
        if (limitNum < 1 || limitNum > 50) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be between 1 and 50'
            });
        }

        // Validate date format if provided
        if (from_date && isNaN(Date.parse(from_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid from_date format. Use YYYY-MM-DD'
            });
        }
        if (to_date && isNaN(Date.parse(to_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid to_date format. Use YYYY-MM-DD'
            });
        }

        const games = await Statistics.getHotGames({
            from_date,
            to_date,
            limit: limitNum
        });

        res.status(200).json({
            success: true,
            message: 'Hot games retrieved successfully',
            data: games,
            filter: { from_date: from_date || null, to_date: to_date || null }
        });
    } catch (error) {
        console.error('Error getting hot games:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve hot games',
            error: error.message
        });
    }
};

/**
 * Get detailed statistics for a specific game
 * GET /api/statistics/games/:gameId
 */
exports.getGameDetails = async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
        const { from_date, to_date } = req.query;

        // Validate date format if provided
        if (from_date && isNaN(Date.parse(from_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid from_date format. Use YYYY-MM-DD'
            });
        }
        if (to_date && isNaN(Date.parse(to_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid to_date format. Use YYYY-MM-DD'
            });
        }

        const gameDetails = await Statistics.getGameDetails(gameId, {
            from_date,
            to_date
        });

        if (!gameDetails) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Game statistics retrieved successfully',
            data: gameDetails,
            filter: { from_date: from_date || null, to_date: to_date || null }
        });
    } catch (error) {
        console.error('Error getting game details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve game statistics',
            error: error.message
        });
    }
};

/**
 * Get dashboard overview statistics
 * GET /api/statistics/overview
 */
exports.getDashboardOverview = async (req, res) => {
    try {
        const { from_date, to_date } = req.query;

        // Validate date format if provided
        if (from_date && isNaN(Date.parse(from_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid from_date format. Use YYYY-MM-DD'
            });
        }
        if (to_date && isNaN(Date.parse(to_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid to_date format. Use YYYY-MM-DD'
            });
        }

        const overview = await Statistics.getDashboardOverview({
            from_date,
            to_date
        });

        res.status(200).json({
            success: true,
            message: 'Dashboard overview retrieved successfully',
            data: overview,
            filter: { from_date: from_date || null, to_date: to_date || null }
        });
    } catch (error) {
        console.error('Error getting dashboard overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard overview',
            error: error.message
        });
    }
};

/**
 * Get user statistics
 * GET /api/statistics/users
 */
exports.getUserStatistics = async (req, res) => {
    try {
        const { from_date, to_date } = req.query;

        // Validate date format if provided
        if (from_date && isNaN(Date.parse(from_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid from_date format. Use YYYY-MM-DD'
            });
        }
        if (to_date && isNaN(Date.parse(to_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid to_date format. Use YYYY-MM-DD'
            });
        }

        const userStats = await Statistics.getUserStatistics({
            from_date,
            to_date
        });

        res.status(200).json({
            success: true,
            message: 'User statistics retrieved successfully',
            data: userStats,
            filter: { from_date: from_date || null, to_date: to_date || null }
        });
    } catch (error) {
        console.error('Error getting user statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user statistics',
            error: error.message
        });
    }
};
