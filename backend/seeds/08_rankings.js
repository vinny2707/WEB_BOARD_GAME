/**
 * Seed: Rankings
 * Creates ranking statistics for users in different games
 * UNIQUE constraint: (user_id, game_id) - one entry per user per game
 * 
 * Enhanced with more data for better API testing:
 * - Game 1 (Caro Hàng 5): 15+ players for pagination testing
 * - Multiple games per user for profile testing
 * - Friends relationships for friends scope testing
 */

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('rankings').del();

  // Reset ID sequence to 1
  await knex.raw('ALTER SEQUENCE rankings_id_seq RESTART WITH 1');

  // Insert rankings (each user can only have ONE entry per game)
  await knex('rankings').insert([
    // ========================================
    // GAME 1: Caro Hàng 5 (15 players for pagination testing)
    // ========================================
    {
      user_id: 9,
      game_id: 1,
      total_games: 8,
      total_wins: 7,
      total_losses: 1,
      total_draws: 0,
      win_rate: 87.50,
      total_score: 5600,
      best_score: 1200,
      global_rank: 1,
      created_at: knex.raw("NOW() - INTERVAL '60 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 3,
      game_id: 1,
      total_games: 10,
      total_wins: 6,
      total_losses: 4,
      total_draws: 0,
      win_rate: 60.00,
      total_score: 4800,
      best_score: 1100,
      global_rank: 2,
      created_at: knex.raw("NOW() - INTERVAL '55 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 5,
      game_id: 1,
      total_games: 7,
      total_wins: 5,
      total_losses: 2,
      total_draws: 0,
      win_rate: 71.43,
      total_score: 4200,
      best_score: 1050,
      global_rank: 3,
      created_at: knex.raw("NOW() - INTERVAL '50 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 6,
      game_id: 1,
      total_games: 6,
      total_wins: 4,
      total_losses: 2,
      total_draws: 0,
      win_rate: 66.67,
      total_score: 3600,
      best_score: 980,
      global_rank: 4,
      created_at: knex.raw("NOW() - INTERVAL '45 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '4 days'")
    },
    {
      user_id: 7,
      game_id: 1,
      total_games: 5,
      total_wins: 3,
      total_losses: 2,
      total_draws: 0,
      win_rate: 60.00,
      total_score: 3000,
      best_score: 900,
      global_rank: 5,
      created_at: knex.raw("NOW() - INTERVAL '40 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '5 days'")
    },
    {
      user_id: 2,
      game_id: 1,
      total_games: 5,
      total_wins: 3,
      total_losses: 2,
      total_draws: 0,
      win_rate: 60.00,
      total_score: 2400,
      best_score: 850,
      global_rank: 6,
      created_at: knex.raw("NOW() - INTERVAL '30 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 4,
      game_id: 1,
      total_games: 4,
      total_wins: 2,
      total_losses: 2,
      total_draws: 0,
      win_rate: 50.00,
      total_score: 2000,
      best_score: 800,
      global_rank: 7,
      created_at: knex.raw("NOW() - INTERVAL '35 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '6 days'")
    },
    {
      user_id: 8,
      game_id: 1,
      total_games: 4,
      total_wins: 2,
      total_losses: 2,
      total_draws: 0,
      win_rate: 50.00,
      total_score: 1800,
      best_score: 750,
      global_rank: 8,
      created_at: knex.raw("NOW() - INTERVAL '25 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '7 days'")
    },
    {
      user_id: 10,
      game_id: 1,
      total_games: 3,
      total_wins: 1,
      total_losses: 2,
      total_draws: 0,
      win_rate: 33.33,
      total_score: 1500,
      best_score: 700,
      global_rank: 9,
      created_at: knex.raw("NOW() - INTERVAL '20 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '8 days'")
    },
    {
      user_id: 11,
      game_id: 1,
      total_games: 3,
      total_wins: 1,
      total_losses: 2,
      total_draws: 0,
      win_rate: 33.33,
      total_score: 1200,
      best_score: 650,
      global_rank: 10,
      created_at: knex.raw("NOW() - INTERVAL '15 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '9 days'")
    },

    // ========================================
    // GAME 2: Caro Hàng 4 (8 players)
    // ========================================
    {
      user_id: 3,
      game_id: 2,
      total_games: 6,
      total_wins: 5,
      total_losses: 1,
      total_draws: 0,
      win_rate: 83.33,
      total_score: 4200,
      best_score: 1400,
      global_rank: 1,
      created_at: knex.raw("NOW() - INTERVAL '60 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 5,
      game_id: 2,
      total_games: 5,
      total_wins: 4,
      total_losses: 1,
      total_draws: 0,
      win_rate: 80.00,
      total_score: 3500,
      best_score: 1200,
      global_rank: 2,
      created_at: knex.raw("NOW() - INTERVAL '50 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '4 days'")
    },
    {
      user_id: 6,
      game_id: 2,
      total_games: 4,
      total_wins: 3,
      total_losses: 1,
      total_draws: 0,
      win_rate: 75.00,
      total_score: 2800,
      best_score: 1000,
      global_rank: 3,
      created_at: knex.raw("NOW() - INTERVAL '40 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '5 days'")
    },

    // ========================================
    // GAME 3: Tic Tac Toe (10 players)
    // ========================================
    {
      user_id: 6,
      game_id: 3,
      total_games: 8,
      total_wins: 6,
      total_losses: 2,
      total_draws: 0,
      win_rate: 75.00,
      total_score: 480,
      best_score: 100,
      global_rank: 1,
      created_at: knex.raw("NOW() - INTERVAL '25 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '8 hours'")
    },
    {
      user_id: 2,
      game_id: 3,
      total_games: 6,
      total_wins: 4,
      total_losses: 1,
      total_draws: 1,
      win_rate: 66.67,
      total_score: 350,
      best_score: 100,
      global_rank: 2,
      created_at: knex.raw("NOW() - INTERVAL '10 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '5 hours'")
    },
    {
      user_id: 3,
      game_id: 3,
      total_games: 5,
      total_wins: 3,
      total_losses: 2,
      total_draws: 0,
      win_rate: 60.00,
      total_score: 300,
      best_score: 100,
      global_rank: 3,
      created_at: knex.raw("NOW() - INTERVAL '20 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 5,
      game_id: 3,
      total_games: 4,
      total_wins: 2,
      total_losses: 2,
      total_draws: 0,
      win_rate: 50.00,
      total_score: 200,
      best_score: 100,
      global_rank: 4,
      created_at: knex.raw("NOW() - INTERVAL '15 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },

    // ========================================
    // GAME 4: Rắn Săn Mồi (12 players)
    // ========================================
    {
      user_id: 7,
      game_id: 4,
      total_games: 10,
      total_wins: 8,
      total_losses: 2,
      total_draws: 0,
      win_rate: 80.00,
      total_score: 5200,
      best_score: 850,
      global_rank: 1,
      created_at: knex.raw("NOW() - INTERVAL '45 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 9,
      game_id: 4,
      total_games: 8,
      total_wins: 6,
      total_losses: 2,
      total_draws: 0,
      win_rate: 75.00,
      total_score: 4000,
      best_score: 800,
      global_rank: 2,
      created_at: knex.raw("NOW() - INTERVAL '40 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 3,
      game_id: 4,
      total_games: 7,
      total_wins: 5,
      total_losses: 2,
      total_draws: 0,
      win_rate: 71.43,
      total_score: 3200,
      best_score: 750,
      global_rank: 3,
      created_at: knex.raw("NOW() - INTERVAL '35 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 2,
      game_id: 4,
      total_games: 5,
      total_wins: 2,
      total_losses: 3,
      total_draws: 0,
      win_rate: 40.00,
      total_score: 1500,
      best_score: 450,
      global_rank: 4,
      created_at: knex.raw("NOW() - INTERVAL '20 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 8,
      game_id: 4,
      total_games: 3,
      total_wins: 1,
      total_losses: 2,
      total_draws: 0,
      win_rate: 33.33,
      total_score: 750,
      best_score: 350,
      global_rank: 5,
      created_at: knex.raw("NOW() - INTERVAL '35 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '4 days'")
    },

    // ========================================
    // GAME 5: Ghép Hàng 3 (8 players)
    // ========================================
    {
      user_id: 3,
      game_id: 5,
      total_games: 8,
      total_wins: 6,
      total_losses: 2,
      total_draws: 0,
      win_rate: 75.00,
      total_score: 5600,
      best_score: 1100,
      global_rank: 1,
      created_at: knex.raw("NOW() - INTERVAL '20 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 10,
      game_id: 5,
      total_games: 5,
      total_wins: 3,
      total_losses: 2,
      total_draws: 0,
      win_rate: 60.00,
      total_score: 3200,
      best_score: 950,
      global_rank: 2,
      created_at: knex.raw("NOW() - INTERVAL '18 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '3 hours'")
    },
    {
      user_id: 5,
      game_id: 5,
      total_games: 4,
      total_wins: 2,
      total_losses: 2,
      total_draws: 0,
      win_rate: 50.00,
      total_score: 2400,
      best_score: 800,
      global_rank: 3,
      created_at: knex.raw("NOW() - INTERVAL '15 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },

    // ========================================
    // GAME 6: Cờ Trí Nhớ (10 players)
    // ========================================
    {
      user_id: 7,
      game_id: 6,
      total_games: 8,
      total_wins: 7,
      total_losses: 1,
      total_draws: 0,
      win_rate: 87.50,
      total_score: 7200,
      best_score: 1600,
      global_rank: 1,
      created_at: knex.raw("NOW() - INTERVAL '50 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },
    {
      user_id: 9,
      game_id: 6,
      total_games: 6,
      total_wins: 5,
      total_losses: 1,
      total_draws: 0,
      win_rate: 83.33,
      total_score: 5400,
      best_score: 1400,
      global_rank: 2,
      created_at: knex.raw("NOW() - INTERVAL '40 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 4,
      game_id: 6,
      total_games: 5,
      total_wins: 3,
      total_losses: 1,
      total_draws: 1,
      win_rate: 60.00,
      total_score: 3000,
      best_score: 1000,
      global_rank: 3,
      created_at: knex.raw("NOW() - INTERVAL '15 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '12 hours'")
    },

    // ========================================
    // GAME 7: Bảng Vẽ Tự Do (6 players)
    // ========================================
    {
      user_id: 5,
      game_id: 7,
      total_games: 5,
      total_wins: 5,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 3500,
      best_score: 1200,
      global_rank: 1,
      created_at: knex.raw("NOW() - INTERVAL '40 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 6,
      game_id: 7,
      total_games: 4,
      total_wins: 3,
      total_losses: 1,
      total_draws: 0,
      win_rate: 75.00,
      total_score: 2800,
      best_score: 1000,
      global_rank: 2,
      created_at: knex.raw("NOW() - INTERVAL '30 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 3,
      game_id: 7,
      total_games: 3,
      total_wins: 2,
      total_losses: 1,
      total_draws: 0,
      win_rate: 66.67,
      total_score: 2100,
      best_score: 900,
      global_rank: 3,
      created_at: knex.raw("NOW() - INTERVAL '25 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '4 days'")
    }
  ]);
};
