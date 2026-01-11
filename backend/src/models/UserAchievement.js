const db = require('../config/database');

/**
 * UserAchievement Model
 * Handles database operations for user achievement progress and unlocks
 */

class UserAchievement {
    /**
     * Get all achievements for a user with progress info
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async findByUser(userId) {
        // Get all achievements with user's progress (left join)
        // Note: unlock_criteria NOT included - use findById for details
        const results = await db('achievements as a')
            .leftJoin('user_achievements as ua', function() {
                this.on('a.id', '=', 'ua.achievement_id')
                    .andOn('ua.user_id', '=', db.raw('?', [userId]));
            })
            .select(
                'a.id',
                'a.name',
                'a.description',
                'a.icon',
                'a.category',
                'a.points',
                'ua.progress',
                'ua.unlocked_at'
            )
            .orderBy('a.category', 'asc')
            .orderBy('a.points', 'asc');

        // Parse JSON fields and compute status
        return results.map(r => ({
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
