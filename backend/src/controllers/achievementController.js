const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const { success, error } = require('../utils/response');

/**
 * Achievement Controller
 * Handles HTTP requests for achievements
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * Get all achievements with pagination
 * GET /api/achievements?page=1&limit=10&category=beginner
 */
const getAllAchievements = async (req, res, next) => {
    try {
        const { category, page, limit } = req.query;
        const result = await Achievement.findAll({ category, page, limit });

        return success(res, result, 'Achievements retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get achievement by ID
 * GET /api/achievements/:id
 */
const getAchievementById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const achievement = await Achievement.findById(id);

        if (!achievement) {
            return error(res, 'Achievement not found', 404);
        }

        return success(res, achievement, 'Achievement retrieved successfully');
    } catch (err) {
        next(err);
    }
};

// ============================================
// USER ENDPOINTS (Authenticated)
// ============================================

/**
 * Get current user's achievements with progress (paginated)
 * GET /api/achievements/me?page=1&limit=10
 */
const getMyAchievements = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page, limit } = req.query;
        const result = await UserAchievement.findByUser(userId, { page, limit });
        const totalPoints = await UserAchievement.getTotalPoints(userId);

        // Group by status
        const achievements = result.achievements;
        const unlocked = achievements.filter(a => a.is_unlocked);
        const inProgress = achievements.filter(a => !a.is_unlocked && a.progress.current > 0);
        const locked = achievements.filter(a => !a.is_unlocked && a.progress.current === 0);

        return success(res, {
            total_points: totalPoints,
            unlocked_count: unlocked.length,
            total_count: result.pagination.total,
            achievements: {
                unlocked,
                in_progress: inProgress,
                locked
            },
            pagination: result.pagination
        }, 'User achievements retrieved successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllAchievements,
    getAchievementById,
    getMyAchievements
};
