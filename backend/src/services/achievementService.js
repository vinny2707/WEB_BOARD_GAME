const db = require('../config/database');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');

/**
 * Achievement Service
 * Handles achievement checking and unlocking logic
 */

class AchievementService {
    /**
     * Main entry point - Check all achievements after an event
     * @param {number} userId 
     * @param {Object} eventData - { type: 'game_complete', session: {...} }
     * @returns {Promise<Array>} - Newly unlocked achievements
     */
    static async checkAchievements(userId, eventData = {}) {
        const newlyUnlocked = [];

        try {
            // Get all achievements with criteria (internal use)
            const achievements = await Achievement.findAllWithCriteria();

            // Check each achievement
            for (const achievement of achievements) {
                // Skip if already unlocked
                const isUnlocked = await UserAchievement.isUnlocked(userId, achievement.id);
                if (isUnlocked) continue;

                // Evaluate criteria
                const result = await this.evaluateCriteria(userId, achievement, eventData);

                if (result.unlocked) {
                    // Unlock achievement
                    const unlockedAchievement = await UserAchievement.unlock(
                        userId, 
                        achievement.id, 
                        result.progress
                    );
                    newlyUnlocked.push(unlockedAchievement);
                } else if (result.progress.current > 0) {
                    // Update progress
                    await UserAchievement.upsertProgress(userId, achievement.id, result.progress);
                }
            }
        } catch (error) {
            console.error('Achievement check error:', error);
        }

        return newlyUnlocked;
    }

    /**
     * Evaluate achievement criteria for a user
     * @param {number} userId 
     * @param {Object} achievement 
     * @param {Object} eventData 
     * @returns {Promise<Object>} - { unlocked: boolean, progress: {...} }
     */
    static async evaluateCriteria(userId, achievement, eventData) {
        const criteria = achievement.unlock_criteria;
        const type = criteria.type;

        // Route to specific evaluator
        switch (type) {
            case 'total_games':
                return this.evaluateTotalGames(userId, criteria);
            case 'total_wins':
                return this.evaluateTotalWins(userId, criteria);
            case 'game_wins':
                return this.evaluateGameWins(userId, criteria);
            case 'high_score':
                return this.evaluateHighScore(userId, criteria);
            case 'win_streak':
                return this.evaluateWinStreak(userId, criteria);
            case 'win_time':
                return this.evaluateWinTime(userId, criteria, eventData);
            case 'time_challenge':
                return this.evaluateTimeChallenge(userId, criteria, eventData);
            case 'friend_count':
                return this.evaluateFriendCount(userId, criteria);
            case 'messages_sent':
                return this.evaluateMessagesSent(userId, criteria);
            case 'play_time':
                return this.evaluatePlayTime(userId, criteria, eventData);
            case 'global_rank':
                return this.evaluateGlobalRank(userId, criteria);
            case 'all_games_won':
                return this.evaluateAllGamesWon(userId, criteria);
            case 'combo_streak':
            case 'perfect_game':
            case 'comeback_win':
                return this.evaluateSessionBased(userId, criteria, eventData);
            default:
                return { unlocked: false, progress: { current: 0, required: criteria.required_count, percentage: 0 } };
        }
    }

    // ============================================
    // CRITERIA EVALUATORS
    // ============================================

    /**
     * Evaluate total_games criteria
     */
    static async evaluateTotalGames(userId, criteria) {
        let query = db('rankings').where('user_id', userId);
        
        // Filter by game_type if specified
        if (criteria.game_type && criteria.game_type.length > 0) {
            const games = await db('games').whereIn('type', criteria.game_type).select('id');
            const gameIds = games.map(g => g.id);
            query = query.whereIn('game_id', gameIds);
        }

        const result = await query.sum('total_games as total');
        const current = parseInt(result[0]?.total) || 0;
        const required = criteria.required_count;

        return {
            unlocked: current >= required,
            progress: {
                current,
                required,
                percentage: Math.min(100, Math.round((current / required) * 100))
            }
        };
    }

    /**
     * Evaluate total_wins criteria
     */
    static async evaluateTotalWins(userId, criteria) {
        let query = db('rankings').where('user_id', userId);
        
        if (criteria.game_type && criteria.game_type.length > 0) {
            const games = await db('games').whereIn('type', criteria.game_type).select('id');
            const gameIds = games.map(g => g.id);
            query = query.whereIn('game_id', gameIds);
        }

        const result = await query.sum('total_wins as total');
        const current = parseInt(result[0]?.total) || 0;
        const required = criteria.required_count;

        return {
            unlocked: current >= required,
            progress: {
                current,
                required,
                percentage: Math.min(100, Math.round((current / required) * 100))
            }
        };
    }

    /**
     * Evaluate game_wins criteria (wins in specific game types)
     */
    static async evaluateGameWins(userId, criteria) {
        // Same as total_wins but game_type is required
        return this.evaluateTotalWins(userId, criteria);
    }

    /**
     * Evaluate high_score criteria
     */
    static async evaluateHighScore(userId, criteria) {
        let query = db('rankings').where('user_id', userId);
        
        if (criteria.game_type && criteria.game_type.length > 0) {
            const games = await db('games').whereIn('type', criteria.game_type).select('id');
            const gameIds = games.map(g => g.id);
            query = query.whereIn('game_id', gameIds);
        }

        const result = await query.max('best_score as max');
        const current = parseInt(result[0]?.max) || 0;
        const required = criteria.required_count;

        return {
            unlocked: current >= required,
            progress: {
                current,
                required,
                percentage: Math.min(100, Math.round((current / required) * 100))
            }
        };
    }

    /**
     * Evaluate win_streak criteria
     */
    static async evaluateWinStreak(userId, criteria) {
        // Get recent sessions to calculate current streak
        const sessions = await db('game_sessions')
            .where('user_id', userId)
            .where('status', 'completed')
            .orderBy('ended_at', 'desc')
            .limit(100)
            .select('result');

        let currentStreak = 0;
        for (const session of sessions) {
            if (session.result === 'win') {
                currentStreak++;
            } else {
                break;
            }
        }

        const required = criteria.required_count;

        return {
            unlocked: currentStreak >= required,
            progress: {
                current: currentStreak,
                required,
                percentage: Math.min(100, Math.round((currentStreak / required) * 100))
            }
        };
    }

    /**
     * Evaluate win_time criteria (win under X seconds)
     */
    static async evaluateWinTime(userId, criteria, eventData) {
        const required = criteria.required_count; // max time in seconds
        
        // Check current session
        if (eventData.session && eventData.session.result === 'win') {
            const timeElapsed = eventData.session.time_elapsed || 0;
            
            // Check if game_type matches
            if (criteria.game_type && criteria.game_type.length > 0) {
                const game = await db('games').where('id', eventData.session.game_id).first();
                if (!criteria.game_type.includes(game?.type)) {
                    return { unlocked: false, progress: { current: 0, required, percentage: 0 } };
                }
            }

            if (timeElapsed > 0 && timeElapsed <= required) {
                return {
                    unlocked: true,
                    progress: { current: timeElapsed, required, percentage: 100 }
                };
            }
        }

        // Check historical wins
        let query = db('game_sessions')
            .where('user_id', userId)
            .where('result', 'win')
            .where('time_elapsed', '<=', required)
            .where('time_elapsed', '>', 0);

        if (criteria.game_type && criteria.game_type.length > 0) {
            const games = await db('games').whereIn('type', criteria.game_type).select('id');
            const gameIds = games.map(g => g.id);
            query = query.whereIn('game_id', gameIds);
        }

        const existingWin = await query.first();

        return {
            unlocked: !!existingWin,
            progress: {
                current: existingWin ? existingWin.time_elapsed : 0,
                required,
                percentage: existingWin ? 100 : 0
            }
        };
    }

    /**
     * Evaluate time_challenge criteria (complete under X seconds)
     */
    static async evaluateTimeChallenge(userId, criteria, eventData) {
        // Same logic as win_time but any completion counts
        const required = criteria.required_count;
        
        if (eventData.session && eventData.session.status === 'completed') {
            const timeElapsed = eventData.session.time_elapsed || 0;
            
            if (criteria.game_type && criteria.game_type.length > 0) {
                const game = await db('games').where('id', eventData.session.game_id).first();
                if (!criteria.game_type.includes(game?.type)) {
                    return { unlocked: false, progress: { current: 0, required, percentage: 0 } };
                }
            }

            if (timeElapsed > 0 && timeElapsed <= required) {
                return {
                    unlocked: true,
                    progress: { current: timeElapsed, required, percentage: 100 }
                };
            }
        }

        return { unlocked: false, progress: { current: 0, required, percentage: 0 } };
    }

    /**
     * Evaluate friend_count criteria
     */
    static async evaluateFriendCount(userId, criteria) {
        const result = await db('friends')
            .where(function() {
                this.where('user_id', userId).orWhere('friend_id', userId);
            })
            .where('status', 'accepted')
            .count('* as count');

        const current = parseInt(result[0]?.count) || 0;
        const required = criteria.required_count;

        return {
            unlocked: current >= required,
            progress: {
                current,
                required,
                percentage: Math.min(100, Math.round((current / required) * 100))
            }
        };
    }

    /**
     * Evaluate messages_sent criteria
     */
    static async evaluateMessagesSent(userId, criteria) {
        const result = await db('messages')
            .where('sender_id', userId)
            .count('* as count');

        const current = parseInt(result[0]?.count) || 0;
        const required = criteria.required_count;

        return {
            unlocked: current >= required,
            progress: {
                current,
                required,
                percentage: Math.min(100, Math.round((current / required) * 100))
            }
        };
    }

    /**
     * Evaluate play_time criteria (play during specific hours)
     */
    static async evaluatePlayTime(userId, criteria, eventData) {
        // Check if current session started during special hours (00:00 - 04:00)
        if (eventData.session) {
            const startedAt = new Date(eventData.session.started_at);
            const hours = startedAt.getHours();

            if (hours >= 0 && hours < 4) {
                return {
                    unlocked: true,
                    progress: { current: 1, required: 1, percentage: 100 }
                };
            }
        }

        // Check historical sessions
        const nightSession = await db('game_sessions')
            .where('user_id', userId)
            .whereRaw("EXTRACT(HOUR FROM started_at) >= 0 AND EXTRACT(HOUR FROM started_at) < 4")
            .first();

        return {
            unlocked: !!nightSession,
            progress: {
                current: nightSession ? 1 : 0,
                required: 1,
                percentage: nightSession ? 100 : 0
            }
        };
    }

    /**
     * Evaluate global_rank criteria
     */
    static async evaluateGlobalRank(userId, criteria) {
        const required = criteria.required_count; // top N rank

        let query = db('rankings').where('user_id', userId);
        
        if (criteria.game_type && criteria.game_type.length > 0) {
            const games = await db('games').whereIn('type', criteria.game_type).select('id');
            const gameIds = games.map(g => g.id);
            query = query.whereIn('game_id', gameIds);
        }

        const rankings = await query.select('global_rank');
        const bestRank = Math.min(...rankings.map(r => r.global_rank || Infinity));

        const unlocked = bestRank <= required && bestRank !== Infinity;

        return {
            unlocked,
            progress: {
                current: bestRank === Infinity ? 0 : bestRank,
                required,
                percentage: unlocked ? 100 : 0
            }
        };
    }

    /**
     * Evaluate all_games_won criteria (win at least 1 in each game type)
     */
    static async evaluateAllGamesWon(userId, criteria) {
        const requiredGameTypes = criteria.game_type || [];
        
        if (requiredGameTypes.length === 0) {
            return { unlocked: false, progress: { current: 0, required: 0, percentage: 0 } };
        }

        // Get all games with wins
        const winsPerGame = await db('rankings as r')
            .join('games as g', 'r.game_id', 'g.id')
            .where('r.user_id', userId)
            .where('r.total_wins', '>', 0)
            .whereIn('g.type', requiredGameTypes)
            .select('g.type');

        const wonGameTypes = new Set(winsPerGame.map(w => w.type));
        const current = wonGameTypes.size;
        const required = requiredGameTypes.length;

        return {
            unlocked: current >= required,
            progress: {
                current,
                required,
                percentage: Math.round((current / required) * 100)
            }
        };
    }

    /**
     * Evaluate session-based criteria (combo, perfect game, comeback)
     * These require specific game_state data from FE
     */
    static async evaluateSessionBased(userId, criteria, eventData) {
        const required = criteria.required_count;
        const type = criteria.type;

        if (!eventData.session || !eventData.session.game_state) {
            return { unlocked: false, progress: { current: 0, required, percentage: 0 } };
        }

        const gameState = eventData.session.game_state;

        // Check game_type filter
        if (criteria.game_type && criteria.game_type.length > 0) {
            const game = await db('games').where('id', eventData.session.game_id).first();
            if (!criteria.game_type.includes(game?.type)) {
                return { unlocked: false, progress: { current: 0, required, percentage: 0 } };
            }
        }

        let current = 0;
        let unlocked = false;

        switch (type) {
            case 'combo_streak':
                current = gameState.max_combo || gameState.combo_streak || 0;
                unlocked = current >= required;
                break;
            case 'perfect_game':
                current = gameState.mistakes === 0 ? 1 : 0;
                unlocked = current >= required;
                break;
            case 'comeback_win':
                current = gameState.was_comeback ? 1 : 0;
                unlocked = current >= required;
                break;
        }

        return {
            unlocked,
            progress: {
                current,
                required,
                percentage: unlocked ? 100 : Math.min(99, Math.round((current / required) * 100))
            }
        };
    }
}

module.exports = AchievementService;
