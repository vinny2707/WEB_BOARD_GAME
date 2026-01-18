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
 * Get all achievements with pagination, filter, sort, search
 * GET /api/achievements?page=1&limit=10&category=beginner&sortBy=points&sortOrder=desc&search=win
 */
const getAllAchievements = async (req, res, next) => {
    try {
        const { category, page, limit, sortBy, sortOrder, search } = req.query;
        const result = await Achievement.findAll({ 
            category, 
            page, 
            limit, 
            sortBy, 
            sortOrder, 
            search 
        });

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
 * Get current user's achievements with progress (paginated, filtered, sorted)
 * GET /api/achievements/me?page=1&limit=10&status=all&category=expert&sortBy=points&sortOrder=desc
 */
const getMyAchievements = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page, limit, status, category, sortBy, sortOrder } = req.query;
        
        const result = await UserAchievement.findByUser(userId, { 
            page, 
            limit, 
            status, 
            category, 
            sortBy, 
            sortOrder 
        });
        const totalPoints = await UserAchievement.getTotalPoints(userId);

        // If filtering by specific status, return flat list
        if (status && status !== 'all') {
            return success(res, {
                total_points: totalPoints,
                unlocked_count: status === 'unlocked' ? result.achievements.length : null,
                total_count: result.pagination.total,
                achievements: result.achievements,
                pagination: result.pagination
            }, 'User achievements retrieved successfully');
        }

        // For 'all' status, group by status for backward compatibility
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

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Create new achievement (Admin only)
 * POST /api/achievements
 */
const createAchievement = async (req, res, next) => {
    try {
        const { name, description, icon, category, points, unlock_criteria } = req.body;

        // Validate required fields
        if (!name || !description) {
            return error(res, 'Name and description are required', 400);
        }

        const validCategories = ['beginner', 'expert', 'social', 'special'];
        if (category && !validCategories.includes(category)) {
            return error(res, 'Invalid category. Must be: beginner, expert, social, or special', 400);
        }

        const achievement = await Achievement.create({
            name,
            description,
            icon,
            category,
            points,
            unlock_criteria
        });

        return success(res, achievement, 'Achievement created successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Update achievement (Admin only)
 * PUT /api/achievements/:id
 */
const updateAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, icon, category, points, unlock_criteria } = req.body;

        // Check if achievement exists
        const existing = await Achievement.findById(id);
        if (!existing) {
            return error(res, 'Achievement not found', 404);
        }

        const validCategories = ['beginner', 'expert', 'social', 'special'];
        if (category && !validCategories.includes(category)) {
            return error(res, 'Invalid category. Must be: beginner, expert, social, or special', 400);
        }

        const achievement = await Achievement.update(id, {
            name,
            description,
            icon,
            category,
            points,
            unlock_criteria
        });

        return success(res, achievement, 'Achievement updated successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Delete achievement (Admin only)
 * DELETE /api/achievements/:id
 */
const deleteAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if achievement exists
        const existing = await Achievement.findById(id);
        if (!existing) {
            return error(res, 'Achievement not found', 404);
        }

        await Achievement.delete(id);
        return success(res, null, 'Achievement deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllAchievements,
    getAchievementById,
    getMyAchievements,
    createAchievement,
    updateAchievement,
    deleteAchievement
};
