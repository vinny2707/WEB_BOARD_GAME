const db = require('../config/database');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const Ranking = require('../models/Ranking');

/**
 * Achievement Service
 * Handles achievement checking and unlocking logic
 */

class AchievementService {
    /**
     * Main entry point - Check all achievements after an event (PRO MAX VERSION)
     * @param {number} userId 
     * @param {Object} eventData - { type: 'game_complete', session: {...} }
     * @param {Object} options - { background: false, incremental: true }
     * @returns {Promise<Array>} - Newly unlocked achievements
     */
    static async checkAchievements(userId, eventData = {}, options = {}) {
        const { background = false, incremental = true } = options;

        // If background mode, don't wait for completion
        if (background) {
            this.checkAchievementsAsync(userId, eventData, options).catch(err => {
                console.error('Background achievement check failed:', err);
            });
            return []; // Return immediately
        }

        return this.checkAchievementsAsync(userId, eventData, options);
    }

    /**
     * Internal async achievement checker (PRO MAX)
     */
    static async checkAchievementsAsync(userId, eventData = {}, options = {}) {
        const { incremental = true } = options;
        const newlyUnlocked = [];

        try {
            const startTime = Date.now();

            // STEP 1: Fetch achievements and unlocked status in parallel
            const [allAchievements, unlockedAchievements, userData] = await Promise.all([
                Achievement.findAllWithCriteria(),
                db('user_achievements')
                    .where({ user_id: userId })
                    .whereNotNull('unlocked_at')
                    .pluck('achievement_id'),
                this.fetchUserDataBatch(userId)
            ]);

            const unlockedSet = new Set(unlockedAchievements);

            // STEP 2: Filter achievements to check (SMART FILTERING)
            let achievementsToCheck = allAchievements.filter(a => !unlockedSet.has(a.id));

            // INCREMENTAL MODE: Only check achievements relevant to current event
            if (incremental && eventData.type === 'game_complete' && eventData.session) {
                achievementsToCheck = this.filterRelevantAchievements(
                    achievementsToCheck, 
                    eventData, 
                    userData
                );
            }

            console.log(`[Achievement] Checking ${achievementsToCheck.length}/${allAchievements.length} achievements (filtered)`);

            // STEP 3: Skip obviously impossible achievements
            achievementsToCheck = this.filterPossibleAchievements(achievementsToCheck, userData);

            console.log(`[Achievement] After filtering impossible: ${achievementsToCheck.length} achievements`);

            // STEP 3.5: PRIORITIZE - Check easier achievements first (likely to unlock)
            achievementsToCheck.sort((a, b) => {
                const priorityA = this.getAchievementPriority(a, userData);
                const priorityB = this.getAchievementPriority(b, userData);
                return priorityB - priorityA; // Higher priority first
            });

            // STEP 4: PARALLEL EVALUATION - Check all achievements at once (with batching)
            // Process in batches of 20 to avoid overwhelming the system
            const BATCH_SIZE = 20;
            const evaluationResults = [];

            for (let i = 0; i < achievementsToCheck.length; i += BATCH_SIZE) {
                const batch = achievementsToCheck.slice(i, i + BATCH_SIZE);
                const batchResults = await Promise.all(
                    batch.map(async (achievement) => {
                        try {
                            const result = await this.evaluateCriteria(userId, achievement, eventData, userData);
                            return { achievement, result };
                        } catch (err) {
                            console.error(`Failed to evaluate achievement ${achievement.id}:`, err);
                            return null;
                        }
                    })
                );
                evaluationResults.push(...batchResults);
            }

            // STEP 5: Process results in parallel
            const unlockPromises = [];
            const progressPromises = [];

            for (const item of evaluationResults) {
                if (!item) continue;

                const { achievement, result } = item;

                if (result.unlocked) {
                    // Queue unlock operation
                    unlockPromises.push(
                        (async () => {
                            const unlockedAchievement = await UserAchievement.unlock(
                                userId, 
                                achievement.id, 
                                result.progress
                            );
                            
                            // Update achievement points
                            await Ranking.updateAchievementPoints(userId, achievement.points)
                                .catch(err => console.error('Failed to update achievement points:', err));
                            
                            return unlockedAchievement;
                        })()
                    );
                } else if (result.progress.current > 0) {
                    // Queue progress update
                    progressPromises.push(
                        UserAchievement.upsertProgress(userId, achievement.id, result.progress)
                    );
                }
            }

            // Execute all unlocks and progress updates in parallel
            const [unlocked] = await Promise.all([
                Promise.all(unlockPromises),
                Promise.all(progressPromises)
            ]);

            newlyUnlocked.push(...unlocked);

            const elapsed = Date.now() - startTime;
            console.log(`[Achievement] Completed in ${elapsed}ms - ${newlyUnlocked.length} newly unlocked`);

        } catch (error) {
            console.error('[Achievement] Check error:', error);
        }

        return newlyUnlocked;
    }

    /**
     * Filter achievements relevant to current event (INCREMENTAL)
     */
    static filterRelevantAchievements(achievements, eventData, userData) {
        const session = eventData.session;
        if (!session) return achievements;

        const gameType = userData.gameTypeMap[session.game_id];
        
        return achievements.filter(achievement => {
            const criteria = achievement.unlock_criteria;
            const type = criteria.type;

            // Always check these types (they update on every game)
            const alwaysCheckTypes = [
                'total_games', 'total_wins', 'win_streak', 
                'play_time', 'combo_streak', 'perfect_game'
            ];

            if (alwaysCheckTypes.includes(type)) {
                return true;
            }

            // Check if achievement is for specific game type
            if (criteria.game_type) {
                let gameTypes = Array.isArray(criteria.game_type) 
                    ? criteria.game_type 
                    : [criteria.game_type];
                
                // If achievement requires specific game type, only check if matches
                if (gameTypes.length > 0 && !gameTypes.includes(gameType)) {
                    return false;
                }
            }

            // Check session-specific achievements
            if (['win_time', 'time_challenge', 'comeback_win'].includes(type)) {
                return true;
            }

            // Skip social/friend achievements on game completion
            if (['friend_count', 'messages_sent'].includes(type)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Filter out achievements that are obviously impossible (SMART SKIP)
     */
    static filterPossibleAchievements(achievements, userData) {
        return achievements.filter(achievement => {
            const criteria = achievement.unlock_criteria;
            const type = criteria.type;
            const required = criteria.required_count;

            // Quick checks based on cached data
            switch (type) {
                case 'total_games': {
                    const totalGames = userData.rankings.reduce((sum, r) => sum + (r.total_games || 0), 0);
                    return totalGames >= required * 0.5; // At least 50% progress
                }
                case 'total_wins': {
                    const totalWins = userData.rankings.reduce((sum, r) => sum + (r.total_wins || 0), 0);
                    return totalWins >= required * 0.5;
                }
                case 'friend_count': {
                    return userData.friendCount >= required * 0.5;
                }
                case 'messages_sent': {
                    return userData.messageCount >= required * 0.5;
                }
                case 'win_streak': {
                    // Always check streak (can change rapidly)
                    return true;
                }
                default:
                    return true; // Don't skip others
            }
        });
    }

    /**
     * Calculate priority score for achievement (higher = more likely to unlock)
     */
    static getAchievementPriority(achievement, userData) {
        const criteria = achievement.unlock_criteria;
        const type = criteria.type;
        const required = criteria.required_count || 1;

        switch (type) {
            case 'total_games': {
                const current = userData.rankings.reduce((sum, r) => sum + (r.total_games || 0), 0);
                return (current / required) * 100; // Progress percentage
            }
            case 'total_wins': {
                const current = userData.rankings.reduce((sum, r) => sum + (r.total_wins || 0), 0);
                return (current / required) * 100;
            }
            case 'friend_count': {
                return (userData.friendCount / required) * 100;
            }
            case 'messages_sent': {
                return (userData.messageCount / required) * 100;
            }
            case 'win_streak': {
                // High priority - can unlock immediately
                return 150;
            }
            case 'win_time':
            case 'time_challenge':
            case 'combo_streak':
            case 'perfect_game': {
                // Session-based - high priority
                return 140;
            }
            default:
                return 100; // Medium priority
        }
    }

    /**
     * Fetch all user data needed for achievement evaluations in one go
     * @param {number} userId 
     * @returns {Promise<Object>} - Pre-fetched user data
     */
    static async fetchUserDataBatch(userId) {
        const [
            rankings,
            friendCount,
            messageCount,
            recentSessions,
            games
        ] = await Promise.all([
            // Get all rankings for this user
            db('rankings').where('user_id', userId),
            
            // Get friend count
            db('friends')
                .where({ user_id: userId, status: 'accepted' })
                .orWhere({ friend_id: userId, status: 'accepted' })
                .count('* as count')
                .first()
                .then(r => parseInt(r?.count) || 0),
            
            // Get message count
            db('messages')
                .where('sender_id', userId)
                .count('* as count')
                .first()
                .then(r => parseInt(r?.count) || 0),
            
            // Get recent sessions for streak calculation
            db('game_sessions')
                .where('user_id', userId)
                .where('status', 'completed')
                .orderBy('ended_at', 'desc')
                .limit(100)
                .select('result', 'time_elapsed', 'game_id'),
            
            // Get all games (for type mapping)
            db('games').select('id', 'type')
        ]);

        // Create game type map
        const gameTypeMap = {};
        games.forEach(g => gameTypeMap[g.id] = g.type);

        // Create ranking map by game_id
        const rankingMap = {};
        rankings.forEach(r => rankingMap[r.game_id] = r);

        return {
            rankings,
            rankingMap,
            friendCount,
            messageCount,
            recentSessions,
            gameTypeMap
        };
    }

    /**
     * Evaluate achievement criteria for a user
     * @param {number} userId 
     * @param {Object} achievement 
     * @param {Object} eventData 
     * @param {Object} userData - Pre-fetched user data (optional, for optimization)
     * @returns {Promise<Object>} - { unlocked: boolean, progress: {...} }
     */
    static async evaluateCriteria(userId, achievement, eventData, userData = null) {
        const criteria = achievement.unlock_criteria;
        const type = criteria.type;

        // Route to specific evaluator
        switch (type) {
            case 'total_games':
                return this.evaluateTotalGames(userId, criteria, userData);
            case 'total_wins':
                return this.evaluateTotalWins(userId, criteria, userData);
            case 'game_wins':
                return this.evaluateGameWins(userId, criteria, userData);
            case 'high_score':
                return this.evaluateHighScore(userId, criteria, userData);
            case 'win_streak':
                return this.evaluateWinStreak(userId, criteria, userData);
            case 'win_time':
                return this.evaluateWinTime(userId, criteria, eventData);
            case 'time_challenge':
                return this.evaluateTimeChallenge(userId, criteria, eventData);
            case 'friend_count':
                return this.evaluateFriendCount(userId, criteria, userData);
            case 'messages_sent':
                return this.evaluateMessagesSent(userId, criteria, userData);
            case 'play_time':
                return this.evaluatePlayTime(userId, criteria, eventData);
            case 'global_rank':
                return this.evaluateGlobalRank(userId, criteria, userData);
            case 'all_games_won':
                return this.evaluateAllGamesWon(userId, criteria, userData);
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
    static async evaluateTotalGames(userId, criteria, userData = null) {
        let current = 0;

        // Use cached data if available
        if (userData && userData.rankings) {
            // Normalize game_type to array
            let gameTypes = criteria.game_type;
            if (gameTypes && !Array.isArray(gameTypes)) {
                gameTypes = [gameTypes];
            }

            if (gameTypes && gameTypes.length > 0) {
                // Filter rankings by game type
                const gameIds = Object.keys(userData.rankingMap)
                    .filter(gid => {
                        const gameType = userData.gameTypeMap[gid];
                        return gameTypes.includes(gameType);
                    })
                    .map(Number);

                current = userData.rankings
                    .filter(r => gameIds.includes(r.game_id))
                    .reduce((sum, r) => sum + (r.total_games || 0), 0);
            } else {
                // Sum all games
                current = userData.rankings.reduce((sum, r) => sum + (r.total_games || 0), 0);
            }
        } else {
            // Fallback to DB query (for non-optimized calls)
            let query = db('rankings').where('user_id', userId);
            
            let gameTypes = criteria.game_type;
            if (gameTypes && !Array.isArray(gameTypes)) {
                gameTypes = [gameTypes];
            }
            
            if (gameTypes && gameTypes.length > 0) {
                const games = await db('games').whereIn('type', gameTypes).select('id');
                const gameIds = games.map(g => g.id);
                if (gameIds.length > 0) {
                    query = query.whereIn('game_id', gameIds);
                } else {
                    return {
                        unlocked: false,
                        progress: { current: 0, required: criteria.required_count, percentage: 0 }
                    };
                }
            }

            const result = await query.sum('total_games as total');
            current = parseInt(result[0]?.total) || 0;
        }

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
    static async evaluateTotalWins(userId, criteria, userData = null) {
        let current = 0;

        if (userData && userData.rankings) {
            let gameTypes = criteria.game_type;
            if (gameTypes && !Array.isArray(gameTypes)) {
                gameTypes = [gameTypes];
            }

            if (gameTypes && gameTypes.length > 0) {
                const gameIds = Object.keys(userData.rankingMap)
                    .filter(gid => {
                        const gameType = userData.gameTypeMap[gid];
                        return gameTypes.includes(gameType);
                    })
                    .map(Number);

                current = userData.rankings
                    .filter(r => gameIds.includes(r.game_id))
                    .reduce((sum, r) => sum + (r.total_wins || 0), 0);
            } else {
                current = userData.rankings.reduce((sum, r) => sum + (r.total_wins || 0), 0);
            }
        } else {
            let query = db('rankings').where('user_id', userId);
            
            let gameTypes = criteria.game_type;
            if (gameTypes && !Array.isArray(gameTypes)) {
                gameTypes = [gameTypes];
            }
            
            if (gameTypes && gameTypes.length > 0) {
                const games = await db('games').whereIn('type', gameTypes).select('id');
                const gameIds = games.map(g => g.id);
                if (gameIds.length > 0) {
                    query = query.whereIn('game_id', gameIds);
                } else {
                    return {
                        unlocked: false,
                        progress: { current: 0, required: criteria.required_count, percentage: 0 }
                    };
                }
            }

            const result = await query.sum('total_wins as total');
            current = parseInt(result[0]?.total) || 0;
        }

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
    static async evaluateGameWins(userId, criteria, userData = null) {
        return this.evaluateTotalWins(userId, criteria, userData);
    }

    /**
     * Evaluate high_score criteria
     */
    static async evaluateHighScore(userId, criteria, userData = null) {
        let current = 0;

        if (userData && userData.rankings) {
            let gameTypes = criteria.game_type;
            if (gameTypes && !Array.isArray(gameTypes)) {
                gameTypes = [gameTypes];
            }

            if (gameTypes && gameTypes.length > 0) {
                const gameIds = Object.keys(userData.rankingMap)
                    .filter(gid => {
                        const gameType = userData.gameTypeMap[gid];
                        return gameTypes.includes(gameType);
                    })
                    .map(Number);

                current = userData.rankings
                    .filter(r => gameIds.includes(r.game_id))
                    .reduce((max, r) => Math.max(max, r.best_score || 0), 0);
            } else {
                current = userData.rankings.reduce((max, r) => Math.max(max, r.best_score || 0), 0);
            }
        } else {
            let query = db('rankings').where('user_id', userId);
            
            let gameTypes = criteria.game_type;
            if (gameTypes && !Array.isArray(gameTypes)) {
                gameTypes = [gameTypes];
            }
            
            if (gameTypes && gameTypes.length > 0) {
                const games = await db('games').whereIn('type', gameTypes).select('id');
                const gameIds = games.map(g => g.id);
                if (gameIds.length > 0) {
                    query = query.whereIn('game_id', gameIds);
                } else {
                    return {
                        unlocked: false,
                        progress: { current: 0, required: criteria.required_count, percentage: 0 }
                    };
                }
            }

            const result = await query.max('best_score as max');
            current = parseInt(result[0]?.max) || 0;
        }

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
    static async evaluateWinStreak(userId, criteria, userData = null) {
        let currentStreak = 0;

        if (userData && userData.recentSessions) {
            // Use cached sessions
            for (const session of userData.recentSessions) {
                if (session.result === 'win') {
                    currentStreak++;
                } else {
                    break;
                }
            }
        } else {
            // Fallback to DB query
            const sessions = await db('game_sessions')
                .where('user_id', userId)
                .where('status', 'completed')
                .orderBy('ended_at', 'desc')
                .limit(100)
                .select('result');

            for (const session of sessions) {
                if (session.result === 'win') {
                    currentStreak++;
                } else {
                    break;
                }
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
    static async evaluateFriendCount(userId, criteria, userData = null) {
        let current = 0;

        if (userData && userData.friendCount !== undefined) {
            current = userData.friendCount;
        } else {
            const result = await db('friends')
                .where(function() {
                    this.where('user_id', userId).orWhere('friend_id', userId);
                })
                .where('status', 'accepted')
                .count('* as count');

            current = parseInt(result[0]?.count) || 0;
        }

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
    static async evaluateMessagesSent(userId, criteria, userData = null) {
        let current = 0;

        if (userData && userData.messageCount !== undefined) {
            current = userData.messageCount;
        } else {
            const result = await db('messages')
                .where('sender_id', userId)
                .count('* as count');

            current = parseInt(result[0]?.count) || 0;
        }

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
    static async evaluateGlobalRank(userId, criteria, userData = null) {
        const required = criteria.required_count; // top N rank
        let bestRank = Infinity;

        if (userData && userData.rankings) {
            let gameTypes = criteria.game_type;
            if (gameTypes && !Array.isArray(gameTypes)) {
                gameTypes = [gameTypes];
            }

            if (gameTypes && gameTypes.length > 0) {
                const gameIds = Object.keys(userData.rankingMap)
                    .filter(gid => {
                        const gameType = userData.gameTypeMap[gid];
                        return gameTypes.includes(gameType);
                    })
                    .map(Number);

                bestRank = userData.rankings
                    .filter(r => gameIds.includes(r.game_id))
                    .reduce((min, r) => Math.min(min, r.global_rank || Infinity), Infinity);
            } else {
                bestRank = userData.rankings.reduce((min, r) => Math.min(min, r.global_rank || Infinity), Infinity);
            }
        } else {
            let query = db('rankings').where('user_id', userId);
            
            let gameTypes = criteria.game_type;
            if (gameTypes && !Array.isArray(gameTypes)) {
                gameTypes = [gameTypes];
            }
            
            if (gameTypes && gameTypes.length > 0) {
                const games = await db('games').whereIn('type', gameTypes).select('id');
                const gameIds = games.map(g => g.id);
                if (gameIds.length > 0) {
                    query = query.whereIn('game_id', gameIds);
                }
            }

            const rankings = await query.select('global_rank');
            bestRank = Math.min(...rankings.map(r => r.global_rank || Infinity));
        }

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
