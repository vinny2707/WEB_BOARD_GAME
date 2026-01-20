const db = require('../config/database');

/**
 * UserAchievement Model
 * Handles database operations for user achievement progress and unlocks
 */

class UserAchievement {
    /**
     * Get all achievements for a user with progress info (with pagination, filter, sort)
     * @param {number} userId 
     * @param {Object} options - { page, limit, status, category, sortBy, sortOrder }
     * @returns {Promise<Object>} - { achievements, pagination, summary }
     */
    static async findByUser(userId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        const status = options.status || 'all'; // all, unlocked, in_progress, locked
        const category = options.category; // beginner, expert, social, special
        const sortBy = options.sortBy || 'category'; // category, points, name, unlocked_at
        const sortOrder = options.sortOrder || 'asc'; // asc, desc

        // Function to build base query with filters (without select)
        const buildBaseQuery = () => {
            let q = db('achievements as a')
                .leftJoin('user_achievements as ua', function() {
                    this.on('a.id', '=', 'ua.achievement_id')
                        .andOn('ua.user_id', '=', db.raw('?', [userId]));
                });

            // Apply category filter
            if (category) {
                q = q.where('a.category', category);
            }

            // Apply status filter (PostgreSQL JSON syntax)
            if (status === 'unlocked') {
                q = q.whereNotNull('ua.unlocked_at');
            } else if (status === 'in_progress') {
                q = q.whereNull('ua.unlocked_at')
                    .whereNotNull('ua.progress')
                    .whereRaw("(ua.progress->>'current')::int > 0");
            } else if (status === 'locked') {
                q = q.where(function() {
                    this.whereNull('ua.progress')
                        .orWhereRaw("(ua.progress->>'current')::int = 0");
                }).whereNull('ua.unlocked_at');
            }
            // 'all' = no status filter

            return q;
        };

        // Get total count (separate query without select columns)
        const countResult = await buildBaseQuery().count('a.id as count').first();
        const total = parseInt(countResult?.count || 0);

        // Build main query with select columns
        let query = buildBaseQuery()
            .select(
                'a.id',
                'a.name',
                'a.description',
                'a.icon',
                'a.category',
                'a.points',
                'ua.progress',
                'ua.unlocked_at'
            );

        // PRIMARY SORT: Always sort by status first (unlocked -> in_progress -> locked)
        // Using CASE WHEN to create priority: 0 = unlocked, 1 = in_progress, 2 = locked
        query = query.orderByRaw(`
            CASE 
                WHEN ua.unlocked_at IS NOT NULL THEN 0
                WHEN ua.progress IS NOT NULL AND (ua.progress->>'current')::int > 0 THEN 1
                ELSE 2
            END ASC
        `);

        // SECONDARY SORT: Apply user's sort preference within each status group
        const validSortFields = ['category', 'points', 'name', 'unlocked_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'category';
        const sortDirection = sortOrder === 'desc' ? 'desc' : 'asc';
        
        if (sortField === 'unlocked_at') {
            query = query.orderByRaw(`ua.unlocked_at ${sortDirection} NULLS LAST`);
        } else {
            query = query.orderBy(`a.${sortField}`, sortDirection);
        }
        
        // Tertiary sort for consistency
        if (sortField !== 'points') {
            query = query.orderBy('a.points', 'asc');
        }

        // Apply pagination
        query = query.limit(limit).offset(offset);

        const results = await query;
        const totalPages = Math.ceil(total / limit);

        // Parse JSON fields and compute status
        const achievements = results.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            icon: r.icon,
            category: r.category,
            points: r.points,
            progress: r.progress 
                ? (typeof r.progress === 'string' ? JSON.parse(r.progress) : r.progress)
                : { current: 0, required: 0, percentage: 0 },
            unlocked_at: r.unlocked_at,
            is_unlocked: r.unlocked_at !== null
        }));

        return {
            achievements,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    /**
     * Get user's unlocked achievements only
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async getUnlocked(userId) {
        const results = await this.findByUser(userId);
        return results.filter(r => r.is_unlocked);
    }

    /**
     * Get user's in-progress achievements (not yet unlocked, with some progress)
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async getInProgress(userId) {
        const results = await this.findByUser(userId);
        return results.filter(r => !r.is_unlocked && r.progress.current > 0);
    }

    /**
     * Get or create progress record for user+achievement
     * @param {number} userId 
     * @param {number} achievementId 
     * @returns {Promise<Object>}
     */
    static async getProgress(userId, achievementId) {
        const record = await db('user_achievements')
            .where({ user_id: userId, achievement_id: achievementId })
            .first();

        if (record) {
            return {
                ...record,
                progress: typeof record.progress === 'string' 
                    ? JSON.parse(record.progress) 
                    : record.progress
            };
        }

        return null;
    }

    /**
     * Update progress for a user achievement
     * @param {number} userId 
     * @param {number} achievementId 
     * @param {Object} progress - { current, required, percentage }
     * @returns {Promise<Object>}
     */
    static async upsertProgress(userId, achievementId, progress) {
        const existing = await this.getProgress(userId, achievementId);

        if (existing) {
            // Update existing
            await db('user_achievements')
                .where({ user_id: userId, achievement_id: achievementId })
                .update({
                    progress: JSON.stringify(progress)
                });
        } else {
            // Insert new
            await db('user_achievements')
                .insert({
                    user_id: userId,
                    achievement_id: achievementId,
                    progress: JSON.stringify(progress),
                    unlocked_at: null
                });
        }

        return this.getProgress(userId, achievementId);
    }

    /**
     * Unlock an achievement for a user
     * @param {number} userId 
     * @param {number} achievementId 
     * @param {Object} finalProgress - { current, required, percentage: 100 }
     * @returns {Promise<Object>}
     */
    static async unlock(userId, achievementId, finalProgress) {
        const existing = await this.getProgress(userId, achievementId);

        if (existing) {
            // Update and unlock
            await db('user_achievements')
                .where({ user_id: userId, achievement_id: achievementId })
                .update({
                    progress: JSON.stringify({ ...finalProgress, percentage: 100 }),
                    unlocked_at: db.fn.now()
                });
        } else {
            // Insert and unlock
            await db('user_achievements')
                .insert({
                    user_id: userId,
                    achievement_id: achievementId,
                    progress: JSON.stringify({ ...finalProgress, percentage: 100 }),
                    unlocked_at: db.fn.now()
                });
        }

        // Return achievement summary for notification (no unlock_criteria)
        const achievement = await db('achievements')
            .where({ id: achievementId })
            .select('id', 'name', 'description', 'icon', 'category', 'points')
            .first();

        return achievement;
    }

    /**
     * Check if user has already unlocked an achievement
     * @param {number} userId 
     * @param {number} achievementId 
     * @returns {Promise<boolean>}
     */
    static async isUnlocked(userId, achievementId) {
        const record = await db('user_achievements')
            .where({ 
                user_id: userId, 
                achievement_id: achievementId 
            })
            .whereNotNull('unlocked_at')
            .first();

        return !!record;
    }

    /**
     * Get user's total achievement points
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static async getTotalPoints(userId) {
        const result = await db('user_achievements as ua')
            .join('achievements as a', 'ua.achievement_id', 'a.id')
            .where('ua.user_id', userId)
            .whereNotNull('ua.unlocked_at')
            .sum('a.points as total');

        return result[0]?.total || 0;
    }
}

module.exports = UserAchievement;
