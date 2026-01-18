/**
 * Seed: User Achievements
 * Gán achievements cho 100 users dựa trên stats từ rankings
 * Dữ liệu trải dài 4 tháng
 */

const DATA_SPREAD_DAYS = 120;

exports.seed = async function(knex) {
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
        userStats[ranking.user_id].game_stats[ranking.game_id] = {
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
    
    // Check từng user có đủ điều kiện unlock achievement nào
    for (let userId = 1; userId <= 100; userId++) {
        const stats = userStats[userId] || { total_games: 0, total_wins: 0, game_stats: {}, best_rank: Infinity };
        const friendCount = friendCountMap[userId] || 0;
        const messageCount = messageCountMap[userId] || 0;
        
        for (const achievement of achievements) {
            const criteria = parseCriteria(achievement.unlock_criteria);
            let unlocked = false;
            let progress = { current: 0, required: criteria.required_count || 1 };
            
            switch (criteria.type) {
                case 'total_games':
                    if (criteria.game_type) {
                        // Game-specific
                        const gameId = getGameId(criteria.game_type);
                        progress.current = stats.game_stats[gameId]?.wins + (stats.game_stats[gameId]?.wins || 0) || 0;
                        // Estimate total games from wins (assume 50% win rate)
                        progress.current = Math.floor(progress.current * 2);
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
                    unlocked = progress.current > 0 && progress.current <= progress.required;
                    break;
                    
                case 'win_streak':
                    // Estimate win streak from win rate
                    const winRate = stats.total_games > 0 ? stats.total_wins / stats.total_games : 0;
                    progress.current = Math.floor(winRate * 10); // Rough estimate
                    unlocked = progress.current >= progress.required;
                    break;
                    
                default:
                    // Các loại special achievement - unlock random cho một số users
                    if ((userId + achievement.id) % 10 === 0) {
                        unlocked = true;
                        progress.current = progress.required;
                    }
                    break;
            }
            
            // Chỉ insert nếu đã unlock hoặc có progress > 0
            if (unlocked || progress.current > 0) {
                // Trải dữ liệu trong 4 tháng
                const daysAgo = Math.floor(((userId + achievement.id) / 150) * DATA_SPREAD_DAYS) + 1;
                
                userAchievements.push({
                    id: id++,
                    user_id: userId,
                    achievement_id: achievement.id,
                    progress: JSON.stringify({
                        current: progress.current,
                        required: progress.required,
                        percentage: Math.min(100, Math.floor(progress.current / progress.required * 100))
                    }),
                    unlocked_at: unlocked ? knex.raw(`NOW() - INTERVAL '${daysAgo} days'`) : null
                });
            }
        }
    }
    
    // Insert theo batch
    const batchSize = 500;
    for (let i = 0; i < userAchievements.length; i += batchSize) {
        const batch = userAchievements.slice(i, i + batchSize);
        await knex('user_achievements').insert(batch);
    }
    
    await knex.raw('SELECT setval(\'user_achievements_id_seq\', (SELECT MAX(id) FROM user_achievements))');
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
