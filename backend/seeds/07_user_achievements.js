/**
 * Seed: User Achievements
 * Gán achievements cho 100 users dựa trên stats từ rankings
 * Dữ liệu trải dài 4 tháng
 */

const DATA_SPREAD_DAYS = 120;

exports.seed = async function (knex) {
    await knex('user_achievements').del();

    // Lấy tất cả achievements
    const achievements = await knex('achievements').select('*');

    // Lấy rankings để tính stats
    const rankings = await knex('rankings').select('*');

    // Lấy friends count
    const friendCounts = await knex('friends')
        .where({ status: 'accepted' })
        .select('user_id')
        .count('* as count')
        .groupBy('user_id');
    const friendCountMap = {};
    friendCounts.forEach(f => friendCountMap[f.user_id] = parseInt(f.count));

    // Lấy message counts
    const messageCounts = await knex('messages')
        .select('sender_id')
        .count('* as count')
        .groupBy('sender_id');
    const messageCountMap = {};
    messageCounts.forEach(m => messageCountMap[m.sender_id] = parseInt(m.count));

    // Tính tổng stats cho mỗi user (exclude game_id = 0 vì đó là tổng achievement)
    const userStats = {};
    for (const ranking of rankings) {
        // Skip game_id = 0 (achievement total) để không đếm trùng
        if (ranking.game_id === 0) continue;

        if (!userStats[ranking.user_id]) {
            userStats[ranking.user_id] = {
                total_games: 0,
                total_wins: 0,
                game_stats: {},
                best_rank: Infinity
            };
        }
        userStats[ranking.user_id].total_games += ranking.total_games;
        userStats[ranking.user_id].total_wins += ranking.total_wins;
        // Lưu thêm total_games vào game_stats
        userStats[ranking.user_id].game_stats[ranking.game_id] = {
            total_games: ranking.total_games,
            wins: ranking.total_wins,
            score: ranking.total_score,
            rank: ranking.global_rank
        };
        if (ranking.global_rank && ranking.global_rank < userStats[ranking.user_id].best_rank) {
            userStats[ranking.user_id].best_rank = ranking.global_rank;
        }
    }

    const userAchievements = [];
    let id = 1;

    // Helper để parse criteria an toàn
    const parseCriteria = (criteriaData) => {
        if (typeof criteriaData === 'object') return criteriaData;
        try {
            return JSON.parse(criteriaData);
        } catch {
            return { type: 'unknown', required_count: 1 };
        }
    };

    // Map achievement points
    const achievementPointsMap = {};
    achievements.forEach(a => achievementPointsMap[a.id] = a.points);

    // Store updates for rankings
    const rankingUpdates = [];

    // Check từng user có đủ điều kiện unlock achievement nào
    for (let userId = 1; userId <= 120; userId++) {
        const stats = userStats[userId] || { total_games: 0, total_wins: 0, game_stats: {}, best_rank: Infinity };
        const friendCount = friendCountMap[userId] || 0;
        const messageCount = messageCountMap[userId] || 0;

        // Track unlocked points for this user
        let userTotalPoints = 0;

        for (const achievement of achievements) {
            const criteria = parseCriteria(achievement.unlock_criteria);
            let unlocked = false;
            let progress = { current: 0, required: criteria.required_count || 1 };
            let percentage = 0;

            switch (criteria.type) {
                case 'total_games':
                    if (criteria.game_type) {
                        // Game-specific
                        const gameId = getGameId(criteria.game_type);
                        progress.current = stats.game_stats[gameId]?.total_games || 0;
                    } else {
                        progress.current = stats.total_games;
                    }
                    unlocked = progress.current >= progress.required;
                    break;

                case 'total_wins':
                    progress.current = stats.total_wins;
                    unlocked = progress.current >= progress.required;
                    break;

                case 'game_wins':
                    const gId = getGameId(criteria.game_type);
                    progress.current = stats.game_stats[gId]?.wins || 0;
                    unlocked = progress.current >= progress.required;
                    break;

                case 'high_score':
                    const gIdScore = getGameId(criteria.game_type);
                    progress.current = stats.game_stats[gIdScore]?.score || 0;
                    unlocked = progress.current >= progress.required;
                    break;

                case 'friend_count':
                    progress.current = friendCount;
                    unlocked = progress.current >= progress.required;
                    break;

                case 'messages_sent':
                    progress.current = messageCount;
                    unlocked = progress.current >= progress.required;
                    break;

                case 'global_rank':
                    progress.current = stats.best_rank === Infinity ? 0 : stats.best_rank;
                    // Với rank, số nhỏ hơn là tốt hơn (rank 1 < rank 100)
                    // Unlock nếu current > 0 và current <= required
                    unlocked = progress.current > 0 && progress.current <= progress.required;

                    // Logic tính percentage đặc biệt cho rank
                    if (unlocked) {
                        percentage = 100;
                    } else if (progress.current > 0) {
                        percentage = Math.max(0, Math.floor((1 - (progress.current - progress.required) / progress.current) * 80));
                    }
                    break;

                case 'win_streak':
                    // Giả lập win streak 
                    // Nếu win rate cao (> 50%) -> giả định có streak cao
                    const winRate = stats.total_games > 0 ? stats.total_wins / stats.total_games : 0;
                    if (winRate > 0.8) progress.current = 10;
                    else if (winRate > 0.6) progress.current = 5;
                    else if (winRate > 0.4) progress.current = 3;
                    else progress.current = 1;

                    unlocked = progress.current >= progress.required;
                    break;
                case 'all_games_won':
                    // Check xem user có win ở tất cả các game không
                    // Lấy danh sách unique gameIds user đã chơi và thắng
                    const wonGameIds = Object.keys(stats.game_stats).filter(gid => stats.game_stats[gid].wins >= progress.required);
                    progress.current = wonGameIds.length;
                    progress.required = 7; // Tổng số game
                    unlocked = progress.current >= progress.required;
                    break;
                case 'perfect_game':
                case 'combo_streak':
                case 'comeback_win':
                case 'fast_win':
                    // Random cho vui
                    if (Math.random() > 0.8) {
                        unlocked = true;
                        progress.current = progress.required;
                    }
                    break;

                default:
                    // Các loại special achievement - unlock random cho một số users
                    if ((userId + achievement.id) % 10 === 0) {
                        unlocked = true;
                        progress.current = progress.required;
                    }
                    break;
            }

            // Tính percentage chuẩn cho các loại không phải rank
            if (criteria.type !== 'global_rank') {
                if (unlocked) {
                    percentage = 100;
                    // Ensure current >= required for UI consistency
                    if (progress.current < progress.required) {
                        progress.current = progress.required;
                    }
                } else {
                    percentage = Math.min(100, Math.floor(progress.current / progress.required * 100));
                }
            }

            // Chỉ insert nếu đã unlock hoặc có progress > 0
            if (unlocked || (progress.current > 0 && criteria.type !== 'global_rank')) {
                // Trải dữ liệu trong 4 tháng
                const daysAgo = Math.floor(((userId + achievement.id) / 150) * DATA_SPREAD_DAYS) + 1;

                if (unlocked) {
                    userTotalPoints += (achievementPointsMap[achievement.id] || 0);
                }

                userAchievements.push({
                    id: id++,
                    user_id: userId,
                    achievement_id: achievement.id,
                    progress: JSON.stringify({
                        current: progress.current,
                        required: progress.required,
                        percentage: percentage
                    }),
                    unlocked_at: unlocked ? knex.raw(`NOW() - INTERVAL '${daysAgo} days'`) : null
                });
            }
        }

        // Push total points to updates list
        rankingUpdates.push({
            user_id: userId,
            total_score: userTotalPoints
        });
    }

    // Insert theo batch
    const batchSize = 500;
    for (let i = 0; i < userAchievements.length; i += batchSize) {
        const batch = userAchievements.slice(i, i + batchSize);
        await knex('user_achievements').insert(batch);
    }

    await knex.raw('SELECT setval(\'user_achievements_id_seq\', (SELECT MAX(id) FROM user_achievements))');

    // --- SYNC RANKING SCORES ---
    // Update rankings table with correct achievement points
    for (const update of rankingUpdates) {
        await knex('rankings')
            .where({ user_id: update.user_id, game_id: 0 })
            .update({
                total_score: update.total_score,
                best_score: update.total_score, // Assuming current is best
                updated_at: knex.fn.now()
            });
    }

    // Recalculate Global Rank for Achievement Leaderboard (Game ID 0)
    const achievementRankings = await knex('rankings')
        .where({ game_id: 0 })
        .orderBy('total_score', 'desc')
        .select('id');

    for (let rank = 0; rank < achievementRankings.length; rank++) {
        await knex('rankings')
            .where({ id: achievementRankings[rank].id })
            .update({ global_rank: rank + 1 });
    }
};

function getGameId(gameType) {
    const map = {
        'caro_5': 1,
        'caro_4': 2,
        'tictactoe': 3,
        'snake': 4,
        'match3': 5,
        'memory_cards': 6,
        'drawing_board': 7
    };
    return map[gameType] || 0;
}
