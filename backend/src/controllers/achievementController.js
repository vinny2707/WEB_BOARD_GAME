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
 * Get all achievements
 * GET /api/achievements
 */
const getAllAchievements = async (req, res, next) => {
    try {
        const { category } = req.query;
        const achievements = await Achievement.findAll({ category });

        return success(res, { achievements }, 'Achievements retrieved successfully');
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
 * Get current user's achievements with progress
 * GET /api/achievements/me
 */
const getMyAchievements = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const achievements = await UserAchievement.findByUser(userId);
        const totalPoints = await UserAchievement.getTotalPoints(userId);

        // Group by status
        const unlocked = achievements.filter(a => a.is_unlocked);
        const inProgress = achievements.filter(a => !a.is_unlocked && a.progress.current > 0);
        const locked = achievements.filter(a => !a.is_unlocked && a.progress.current === 0);

        return success(res, {
            total_points: totalPoints,
            unlocked_count: unlocked.length,
            total_count: achievements.length,
            achievements: {
                unlocked,
                in_progress: inProgress,
                locked
            }
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
