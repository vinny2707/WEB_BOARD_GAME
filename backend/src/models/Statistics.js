const db = require('../config/database');

/**
 * Statistics Model
 * Handles all database operations related to statistics and analytics
 */

class Statistics {
    /**
     * Get time range filter from date range
     * @param {Object} options - { from_date, to_date }
     * @returns {Object} - { startDate, endDate }
     */
    static getTimeRange(options = {}) {
        const { from_date, to_date } = options;

        // Default: last 7 days if no dates provided
        const startDate = from_date ? new Date(from_date) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const endDate = to_date ? new Date(to_date) : new Date();

        // Set start date to beginning of day (00:00:00)
        startDate.setHours(0, 0, 0, 0);

        // Set end date to end of day (23:59:59)
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
    }

    /**
     * Get hot/popular games ranked by activity
     * @param {Object} options - { period, from_date, to_date, limit }
     * @returns {Promise<Array>}
     */
    static async getHotGames(options = {}) {
        const limit = options.limit || 10;
        const { startDate } = this.getTimeRange(options);

        // Get current period stats
        const currentStats = await db.raw(`
            SELECT 
                g.id as game_id,
                g.name as game_name,
                g.type as game_type,
                g.icon as game_icon,
                COUNT(DISTINCT gs.id) as total_sessions,
                COUNT(DISTINCT gs.user_id) as unique_players,
                COUNT(DISTINCT CASE WHEN gs.status = 'completed' THEN gs.id END) as completed_sessions,
                ROUND(
                    COUNT(DISTINCT CASE WHEN gs.status = 'completed' THEN gs.id END)::numeric / 
                    NULLIF(COUNT(DISTINCT gs.id), 0) * 100, 
                    1
                ) as completion_rate,
                ROUND(AVG(CASE WHEN gs.status = 'completed' THEN gs.time_elapsed END), 0) as avg_time_elapsed
            FROM games g
            LEFT JOIN game_sessions gs ON g.id = gs.game_id 
                AND gs.started_at >= ?
            WHERE g.enabled = true
            GROUP BY g.id, g.name, g.type, g.icon
            ORDER BY total_sessions DESC, unique_players DESC
            LIMIT ?
        `, [startDate, limit]);

        // Calculate trend (compare with previous period)
        const previousPeriodStart = new Date(startDate);
        const periodDuration = new Date() - startDate;
        previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);

        const games = currentStats.rows.map(game => {
            return {
                game_id: game.game_id,
                game_name: game.game_name,
                game_type: game.game_type,
                game_icon: game.game_icon,
                stats: {
                    total_sessions: parseInt(game.total_sessions) || 0,
                    unique_players: parseInt(game.unique_players) || 0,
                    completed_sessions: parseInt(game.completed_sessions) || 0,
                    completion_rate: parseFloat(game.completion_rate) || 0,
                    avg_time_elapsed: parseInt(game.avg_time_elapsed) || 0
                }
            };
        });

        // Get previous period stats for trend calculation
        const previousStats = await db.raw(`
            SELECT 
                g.id as game_id,
                COUNT(DISTINCT gs.id) as total_sessions
            FROM games g
            LEFT JOIN game_sessions gs ON g.id = gs.game_id 
                AND gs.started_at >= ? AND gs.started_at < ?
            WHERE g.enabled = true
            GROUP BY g.id
        `, [previousPeriodStart, startDate]);

        const previousMap = {};
        previousStats.rows.forEach(row => {
            previousMap[row.game_id] = parseInt(row.total_sessions) || 0;
        });

        // Add trend to each game
        games.forEach(game => {
            const currentSessions = game.stats.total_sessions;
            const previousSessions = previousMap[game.game_id] || 0;

            if (previousSessions === 0) {
                game.stats.trend = currentSessions > 0 ? '+100%' : '0%';
            } else {
                const change = ((currentSessions - previousSessions) / previousSessions * 100).toFixed(0);
                game.stats.trend = change >= 0 ? `+${change}%` : `${change}%`;
            }
        });

        return games;
    }

    /**
     * Get detailed statistics for a specific game
     * @param {number} gameId 
     * @param {Object} options - { period, from_date, to_date }
     * @returns {Promise<Object>}
     */
    static async getGameDetails(gameId, options = {}) {
        const { startDate } = this.getTimeRange(options);

        // Get game info
        const game = await db('games')
            .where({ id: gameId })
            .select('id', 'name', 'type', 'icon')
            .first();

        if (!game) {
            return null;
        }

        // Get overview stats
        const overviewResult = await db.raw(`
            SELECT 
                COUNT(DISTINCT gs.id) as total_sessions,
                COUNT(DISTINCT gs.user_id) as unique_players,
                COUNT(DISTINCT CASE WHEN gs.status = 'completed' THEN gs.id END) as completed_sessions,
                ROUND(
                    COUNT(DISTINCT CASE WHEN gs.status = 'completed' THEN gs.id END)::numeric / 
                    NULLIF(COUNT(DISTINCT gs.id), 0) * 100, 
                    1
                ) as completion_rate,
                ROUND(AVG(CASE WHEN gs.status = 'completed' THEN r.total_score END), 0) as avg_score,
                ROUND(AVG(CASE WHEN gs.status = 'completed' THEN gs.time_elapsed END), 0) as avg_time_elapsed,
                ROUND(AVG(CASE WHEN gs.status = 'completed' THEN gs.moves_count END), 0) as avg_moves
            FROM game_sessions gs
            LEFT JOIN rankings r ON gs.user_id = r.user_id AND gs.game_id = r.game_id
            WHERE gs.game_id = ? AND gs.started_at >= ?
        `, [gameId, startDate]);

        const overview = overviewResult.rows[0];

        // Get difficulty stats (from settings JSON)
        const difficultyResult = await db.raw(`
            SELECT 
                COALESCE(gs.settings->>'difficulty', 'NORMAL') as difficulty,
                COUNT(DISTINCT gs.id) as sessions,
                ROUND(AVG(CASE WHEN gs.status = 'completed' THEN r.total_score END), 0) as avg_score,
                ROUND(
                    COUNT(DISTINCT CASE WHEN gs.status = 'completed' THEN gs.id END)::numeric / 
                    NULLIF(COUNT(DISTINCT gs.id), 0) * 100, 
                    1
                ) as completion_rate
            FROM game_sessions gs
            LEFT JOIN rankings r ON gs.user_id = r.user_id AND gs.game_id = r.game_id
            WHERE gs.game_id = ? AND gs.started_at >= ?
            GROUP BY difficulty
            ORDER BY difficulty
        `, [gameId, startDate]);

        const difficultyStats = {};
        difficultyResult.rows.forEach(row => {
            difficultyStats[row.difficulty] = {
                sessions: parseInt(row.sessions) || 0,
                avg_score: parseInt(row.avg_score) || 0,
                completion_rate: parseFloat(row.completion_rate) || 0
            };
        });

        // Get daily trend
        const dailyResult = await db.raw(`
            SELECT 
                DATE(gs.started_at) as date,
                COUNT(DISTINCT gs.id) as sessions,
                COUNT(DISTINCT gs.user_id) as unique_players
            FROM game_sessions gs
            WHERE gs.game_id = ? AND gs.started_at >= ?
            GROUP BY DATE(gs.started_at)
            ORDER BY date ASC
        `, [gameId, startDate]);

        const dailyTrend = dailyResult.rows.map(row => ({
            date: row.date,
            sessions: parseInt(row.sessions) || 0,
            unique_players: parseInt(row.unique_players) || 0
        }));

        // Get top 5 players
        const topPlayersResult = await db.raw(`
            SELECT 
                ROW_NUMBER() OVER (ORDER BY r.total_score DESC) as rank,
                r.user_id,
                u.username,
                u.full_name,
                i.url as avatar_url,
                r.total_score,
                r.total_games,
                r.win_rate
            FROM rankings r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN images i ON u.avatar_id = i.id
            WHERE r.game_id = ?
            ORDER BY r.total_score DESC
            LIMIT 5
        `, [gameId]);

        const topPlayers = topPlayersResult.rows.map(row => ({
            rank: parseInt(row.rank),
            user_id: row.user_id,
            username: row.username,
            full_name: row.full_name,
            avatar_url: row.avatar_url,
            total_score: row.total_score,
            total_games: row.total_games,
            win_rate: parseFloat(row.win_rate)
        }));

        return {
            game: {
                id: game.id,
                name: game.name,
                type: game.type,
                icon: game.icon
            },
            overview: {
                total_sessions: parseInt(overview.total_sessions) || 0,
                unique_players: parseInt(overview.unique_players) || 0,
                completed_sessions: parseInt(overview.completed_sessions) || 0,
                completion_rate: parseFloat(overview.completion_rate) || 0,
                avg_score: parseInt(overview.avg_score) || 0,
                avg_time_elapsed: parseInt(overview.avg_time_elapsed) || 0,
                avg_moves: parseInt(overview.avg_moves) || 0
            },
            difficulty_stats: difficultyStats,
            daily_trend: dailyTrend,
            top_players: topPlayers
        };
    }

    /**
     * Get dashboard overview statistics
     * @param {Object} options - { period, from_date, to_date }
     * @returns {Promise<Object>}
     */
    static async getDashboardOverview(options = {}) {
        const { startDate } = this.getTimeRange(options);

        // Calculate previous period for growth
        const previousPeriodStart = new Date(startDate);
        const periodDuration = new Date() - startDate;
        previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);

        // User stats
        const userStatsResult = await db.raw(`
            SELECT 
                COUNT(DISTINCT u.id) FILTER (WHERE u.created_at < ?) as total_users,
                COUNT(DISTINCT u.id) FILTER (WHERE u.last_login >= ?) as active_users,
                COUNT(DISTINCT u.id) FILTER (WHERE u.created_at >= ?) as new_users,
                COUNT(DISTINCT u.id) FILTER (WHERE u.created_at >= ? AND u.created_at < ?) as previous_new_users
            FROM users u
        `, [new Date(), startDate, startDate, previousPeriodStart, startDate]);

        const userStats = userStatsResult.rows[0];
        const newUsers = parseInt(userStats.new_users) || 0;
        const previousNewUsers = parseInt(userStats.previous_new_users) || 0;
        const userGrowth = previousNewUsers === 0
            ? (newUsers > 0 ? '+100%' : '0%')
            : `${((newUsers - previousNewUsers) / previousNewUsers * 100).toFixed(0)}%`;

        // Session stats
        const sessionStatsResult = await db.raw(`
            SELECT 
                COUNT(DISTINCT gs.id) FILTER (WHERE gs.started_at >= ?) as total_sessions,
                COUNT(DISTINCT gs.id) FILTER (WHERE gs.status = 'completed' AND gs.started_at >= ?) as completed_sessions,
                COUNT(DISTINCT gs.id) FILTER (WHERE gs.started_at >= ? AND gs.started_at < ?) as previous_sessions
            FROM game_sessions gs
        `, [startDate, startDate, previousPeriodStart, startDate]);

        const sessionStats = sessionStatsResult.rows[0];
        const totalSessions = parseInt(sessionStats.total_sessions) || 0;
        const completedSessions = parseInt(sessionStats.completed_sessions) || 0;
        const previousSessions = parseInt(sessionStats.previous_sessions) || 0;
        const sessionGrowth = previousSessions === 0
            ? (totalSessions > 0 ? '+100%' : '0%')
            : `${((totalSessions - previousSessions) / previousSessions * 100).toFixed(0)}%`;
        const completionRate = totalSessions === 0
            ? 0
            : (completedSessions / totalSessions * 100).toFixed(1);

        // Game stats
        const gameStatsResult = await db.raw(`
            SELECT 
                COUNT(DISTINCT g.id) as total_games,
                COUNT(DISTINCT g.id) FILTER (WHERE g.enabled = true) as enabled_games
            FROM games g
        `);

        const gameStats = gameStatsResult.rows[0];

        // Most popular game
        const popularGameResult = await db.raw(`
            SELECT 
                g.id,
                g.name,
                COUNT(DISTINCT gs.id) as sessions
            FROM games g
            LEFT JOIN game_sessions gs ON g.id = gs.game_id AND gs.started_at >= ?
            WHERE g.enabled = true
            GROUP BY g.id, g.name
            ORDER BY sessions DESC
            LIMIT 1
        `, [startDate]);

        const mostPopular = popularGameResult.rows[0] || null;

        return {
            users: {
                total: parseInt(userStats.total_users) || 0,
                active: parseInt(userStats.active_users) || 0,
                new: newUsers,
                growth: userGrowth
            },
            sessions: {
                total: totalSessions,
                completed: completedSessions,
                completion_rate: parseFloat(completionRate),
                growth: sessionGrowth
            },
            games: {
                total: parseInt(gameStats.total_games) || 0,
                enabled: parseInt(gameStats.enabled_games) || 0,
                most_popular: mostPopular ? {
                    id: mostPopular.id,
                    name: mostPopular.name,
                    sessions: parseInt(mostPopular.sessions) || 0
                } : null
            }
        };
    }

    /**
     * Get user statistics
     * @param {Object} options - { period, from_date, to_date }
     * @returns {Promise<Object>}
     */
    static async getUserStatistics(options = {}) {
        const { startDate } = this.getTimeRange(options);

        // Calculate previous period
        const previousPeriodStart = new Date(startDate);
        const periodDuration = new Date() - startDate;
        previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);

        // User registration stats
        const registrationResult = await db.raw(`
            SELECT 
                COUNT(DISTINCT id) FILTER (WHERE created_at >= ?) as new_users,
                COUNT(DISTINCT id) FILTER (WHERE created_at >= ? AND created_at < ?) as previous_new_users,
                COUNT(DISTINCT id) FILTER (WHERE last_login >= ?) as active_users,
                COUNT(DISTINCT id) as total_users
            FROM users
        `, [startDate, previousPeriodStart, startDate, startDate]);

        const regStats = registrationResult.rows[0];
        const newUsers = parseInt(regStats.new_users) || 0;
        const previousNewUsers = parseInt(regStats.previous_new_users) || 0;
        const growthRate = previousNewUsers === 0
            ? (newUsers > 0 ? 100 : 0)
            : ((newUsers - previousNewUsers) / previousNewUsers * 100).toFixed(1);

        // Active users (played at least one game in period)
        const activeResult = await db.raw(`
            SELECT COUNT(DISTINCT user_id) as count
            FROM game_sessions
            WHERE started_at >= ?
        `, [startDate]);

        const activeUsers = parseInt(activeResult.rows[0].count) || 0;
        const totalUsers = parseInt(regStats.total_users) || 0;
        const retentionRate = totalUsers === 0
            ? 0
            : (activeUsers / totalUsers * 100).toFixed(1);

        // Top active players
        const topPlayersResult = await db.raw(`
            SELECT 
                u.id,
                u.username,
                u.full_name,
                i.url as avatar_url,
                COUNT(DISTINCT gs.id) as total_games,
                COUNT(DISTINCT gs.id) FILTER (WHERE gs.result = 'win') as total_wins,
                ROUND(
                    COUNT(DISTINCT gs.id) FILTER (WHERE gs.result = 'win')::numeric / 
                    NULLIF(COUNT(DISTINCT gs.id), 0) * 100,
                    1
                ) as win_rate
            FROM users u
            LEFT JOIN images i ON u.avatar_id = i.id
            LEFT JOIN game_sessions gs ON u.id = gs.user_id AND gs.started_at >= ?
            WHERE gs.id IS NOT NULL
            GROUP BY u.id, u.username, u.full_name, i.url
            ORDER BY total_games DESC
            LIMIT 10
        `, [startDate]);

        const topPlayers = topPlayersResult.rows.map(row => ({
            user_id: row.id,
            username: row.username,
            full_name: row.full_name,
            avatar_url: row.avatar_url,
            total_games: parseInt(row.total_games) || 0,
            total_wins: parseInt(row.total_wins) || 0,
            win_rate: parseFloat(row.win_rate) || 0
        }));

        // User registration trend (daily)
        const trendResult = await db.raw(`
            SELECT 
                DATE(created_at) as date,
                COUNT(DISTINCT id) as new_users
            FROM users
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [startDate]);

        const registrationTrend = trendResult.rows.map(row => ({
            date: row.date,
            new_users: parseInt(row.new_users) || 0
        }));

        return {
            overview: {
                total_users: totalUsers,
                new_users: newUsers,
                active_users: activeUsers,
                retention_rate: parseFloat(retentionRate),
                growth_rate: parseFloat(growthRate)
            },
            top_players: topPlayers,
            registration_trend: registrationTrend
        };
    }
}

module.exports = Statistics;
