/**
 * Seed: Rankings
 * Tạo rankings với ELO hợp lý cho 100 users
 * Bao gồm game_id = 0 để lưu tổng điểm achievement
 * Dữ liệu trải dài 4 tháng
 * 
 * ELO Distribution (giống thực tế):
 * - Bronze (0-999): ~15% users
 * - Silver (1000-1299): ~35% users  
 * - Gold (1300-1599): ~30% users
 * - Platinum (1600-1899): ~12% users
 * - Diamond (1900-2199): ~5% users
 * - Master (2200-2499): ~2% users
 * - Grandmaster (2500+): ~1% users
 */

const DATA_SPREAD_DAYS = 120;

// Bot ELO reference (from botConfig.js)
const BOT_ELO = {
    caro_5: { easy: 700, medium: 1100, hard: 1600 },
    caro_4: { easy: 650, medium: 1050, hard: 1550 },
    tictactoe: { easy: 600, medium: 1000, hard: 1500 },
    snake: { easy: 650, medium: 1000, hard: 1450 },
    match3: { easy: 600, medium: 950, hard: 1400 },
    memory_cards: { easy: 550, medium: 900, hard: 1350 },
    drawing_board: { easy: 500, medium: 800, hard: 1200 }
};

// Games có ELO (exclude drawing_board)
const GAMES_WITH_ELO = [
    { id: 1, type: 'caro_5' },
    { id: 2, type: 'caro_4' },
    { id: 3, type: 'tictactoe' },
    { id: 4, type: 'snake' },
    { id: 5, type: 'match3' },
    { id: 6, type: 'memory_cards' },
    { id: 7, type: 'drawing_board' }
];

/**
 * Generate ELO với phân phối thực tế
 */
function generateElo(userIndex, gameIndex) {
    // Seed random dựa trên userIndex + gameIndex để consistent
    const seed = (userIndex * 7 + gameIndex * 13) % 1000;
    const rand = seed / 1000;

    // Phân phối ELO theo tỉ lệ thực tế
    let elo;
    if (rand < 0.15) {
        // Bronze: 500-999
        elo = 500 + Math.floor((rand / 0.15) * 500);
    } else if (rand < 0.50) {
        // Silver: 1000-1299
        elo = 1000 + Math.floor(((rand - 0.15) / 0.35) * 300);
    } else if (rand < 0.80) {
        // Gold: 1300-1599
        elo = 1300 + Math.floor(((rand - 0.50) / 0.30) * 300);
    } else {
        // Grandmaster: 1600-1899
        elo = 1600 + Math.floor(((rand - 0.80) / 0.12) * 300);
    }

    return elo;
}

/**
 * Generate game stats hợp lý với ELO
 */
function generateStats(elo, userIndex, gameIndex) {
    const seed = (userIndex * 11 + gameIndex * 17) % 100;

    // Số game tỉ lệ với ELO - Giảm xuống mức vừa phải (trung bình 20-40 games)
    const baseGames = 10 + Math.floor((elo - 500) / 40);
    const totalGames = Math.max(5, baseGames + (seed % 20));

    // Win rate dựa trên ELO
    let winRate;
    if (elo < 1000) winRate = 30 + (seed % 20);
    else if (elo < 1300) winRate = 45 + (seed % 15);
    else if (elo < 1600) winRate = 55 + (seed % 15);
    else if (elo < 1900) winRate = 65 + (seed % 12);
    else winRate = 72 + (seed % 10);

    const totalWins = Math.floor(totalGames * winRate / 100);
    const remaining = totalGames - totalWins;
    const totalDraws = Math.floor(remaining * 0.2);
    const totalLosses = remaining - totalDraws;

    return {
        total_games: totalGames,
        total_wins: totalWins,
        total_losses: totalLosses,
        total_draws: totalDraws,
        win_rate: (totalWins / totalGames * 100).toFixed(2)
    };
}

exports.seed = async function (knex) {
    await knex('rankings').del();

    const rankings = [];
    let id = 1;

    // Tạo rankings cho mỗi user cho mỗi game
    // Nhưng không phải ai cũng chơi tất cả game
    for (let userId = 1; userId <= 120; userId++) {
        // Mỗi user chơi 2-5 games random
        const numGames = 2 + (userId % 4);
        const startGameIndex = userId % GAMES_WITH_ELO.length;

        // Biến lưu tổng stats cho achievement ranking
        let totalGamesAll = 0;
        let totalWinsAll = 0;
        let totalLossesAll = 0;
        let totalDrawsAll = 0;

        for (let g = 0; g < numGames; g++) {
            const gameIndex = (startGameIndex + g) % GAMES_WITH_ELO.length;
            const game = GAMES_WITH_ELO[gameIndex];

            const elo = generateElo(userId, gameIndex);
            const stats = generateStats(elo, userId, gameIndex);

            // Cộng dồn stats
            totalGamesAll += stats.total_games;
            totalWinsAll += stats.total_wins;
            totalLossesAll += stats.total_losses;
            totalDrawsAll += stats.total_draws;

            // Peak ELO (best_score) = current ELO + 0-150
            const peakElo = elo + ((userId * 3 + gameIndex * 7) % 150);

            // Trải dữ liệu trong 4 tháng
            const daysAgo = Math.floor((userId / 100) * DATA_SPREAD_DAYS);

            rankings.push({
                id: id++,
                user_id: userId,
                game_id: game.id,
                total_games: stats.total_games,
                total_wins: stats.total_wins,
                total_losses: stats.total_losses,
                total_draws: stats.total_draws,
                win_rate: stats.win_rate,
                total_score: elo,      // Current ELO
                best_score: peakElo,   // Peak ELO
                global_rank: null,     // Sẽ tính sau
                created_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`),
                updated_at: knex.raw(`NOW() - INTERVAL '${Math.max(1, daysAgo - 7)} days'`)
            });
        }

        // Thêm ranking game_id = 0 cho tổng achievement
        const overallWinRate = totalGamesAll > 0 ? (totalWinsAll / totalGamesAll * 100).toFixed(2) : '0.00';
        const achievementScore = totalWinsAll * 10 + totalGamesAll * 2; // Điểm achievement
        const daysAgo = Math.floor((userId / 100) * DATA_SPREAD_DAYS);

        rankings.push({
            id: id++,
            user_id: userId,
            game_id: 0,  // 0 = tổng achievement
            total_games: totalGamesAll,
            total_wins: totalWinsAll,
            total_losses: totalLossesAll,
            total_draws: totalDrawsAll,
            win_rate: overallWinRate,
            total_score: achievementScore,
            best_score: achievementScore,
            global_rank: null,
            created_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`),
            updated_at: knex.raw(`NOW() - INTERVAL '${Math.max(1, daysAgo - 7)} days'`)
        });
    }

    // Insert theo batch
    const batchSize = 500;
    for (let i = 0; i < rankings.length; i += batchSize) {
        const batch = rankings.slice(i, i + batchSize);
        await knex('rankings').insert(batch);
    }

    // Tính global_rank cho từng game
    for (const game of GAMES_WITH_ELO) {
        // Lấy tất cả rankings của game này, sắp xếp theo ELO giảm dần
        const gameRankings = await knex('rankings')
            .where({ game_id: game.id })
            .orderBy('total_score', 'desc')
            .select('id');

        // Update rank
        for (let rank = 0; rank < gameRankings.length; rank++) {
            await knex('rankings')
                .where({ id: gameRankings[rank].id })
                .update({ global_rank: rank + 1 });
        }
    }

    // Tính global_rank cho achievement (game_id = 0)
    const achievementRankings = await knex('rankings')
        .where({ game_id: 0 })
        .orderBy('total_score', 'desc')
        .select('id');

    for (let rank = 0; rank < achievementRankings.length; rank++) {
        await knex('rankings')
            .where({ id: achievementRankings[rank].id })
            .update({ global_rank: rank + 1 });
    }

    await knex.raw('SELECT setval(\'rankings_id_seq\', (SELECT MAX(id) FROM rankings))');
};
