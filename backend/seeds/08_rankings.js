/**
 * Seed: Rankings
 * Creates ranking statistics for users in different games
 * UNIQUE constraint: (user_id, game_id) - one entry per user per game
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('rankings').del();

  // Insert rankings (each user can only have ONE entry per game)
  await knex('rankings').insert([
    // John's rankings (user_id: 2)
    {
      user_id: 2,
      game_id: 1, // Caro Hàng 5
      total_games: 3,
      total_wins: 2,
      total_losses: 1,
      total_draws: 0,
      win_rate: 66.67,
      total_score: 2400,
      best_score: 1200,
      global_rank: 3,
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 2,
      game_id: 4, // Rắn Săn Mồi
      total_games: 5,
      total_wins: 2,
      total_losses: 3,
      total_draws: 0,
      win_rate: 40.00,
      total_score: 1500,
      best_score: 450,
      global_rank: 4,
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 2,
      game_id: 3, // Tic Tac Toe
      total_games: 2,
      total_wins: 1,
      total_losses: 0,
      total_draws: 1,
      win_rate: 50.00,
      total_score: 150,
      best_score: 100,
      global_rank: 2,
      updated_at: knex.raw("NOW() - INTERVAL '5 hours'")
    },

    // Jane's rankings (user_id: 3)
    {
      user_id: 3,
      game_id: 2, // Caro Hàng 4
      total_games: 4,
      total_wins: 3,
      total_losses: 1,
      total_draws: 0,
      win_rate: 75.00,
      total_score: 3200,
      best_score: 1350,
      global_rank: 1,
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 3,
      game_id: 5, // Ghép Hàng 3
      total_games: 6,
      total_wins: 4,
      total_losses: 2,
      total_draws: 0,
      win_rate: 66.67,
      total_score: 4500,
      best_score: 950,
      global_rank: 1,
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },

    // Mike's rankings (user_id: 4)
    {
      user_id: 4,
      game_id: 6, // Cờ Trí Nhớ
      total_games: 3,
      total_wins: 1,
      total_losses: 1,
      total_draws: 1,
      win_rate: 33.33,
      total_score: 1200,
      best_score: 500,
      global_rank: 3,
      updated_at: knex.raw("NOW() - INTERVAL '12 hours'")
    },

    // Sarah's rankings (user_id: 5)
    {
      user_id: 5,
      game_id: 7, // Bảng Vẽ Tự Do
      total_games: 2,
      total_wins: 2,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 2200,
      best_score: 1100,
      global_rank: 1,
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },

    // David's rankings (user_id: 6)
    {
      user_id: 6,
      game_id: 3, // Tic Tac Toe
      total_games: 4,
      total_wins: 3,
      total_losses: 1,
      total_draws: 0,
      win_rate: 75.00,
      total_score: 300,
      best_score: 100,
      global_rank: 1,
      updated_at: knex.raw("NOW() - INTERVAL '8 hours'")
    },

    // Emily's rankings (user_id: 7)
    {
      user_id: 7,
      game_id: 6, // Cờ Trí Nhớ
      total_games: 5,
      total_wins: 5,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 6500,
      best_score: 1500,
      global_rank: 1,
      updated_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },

    // Robert's rankings (user_id: 8)
    {
      user_id: 8,
      game_id: 4, // Rắn Săn Mồi
      total_games: 3,
      total_wins: 1,
      total_losses: 2,
      total_draws: 0,
      win_rate: 33.33,
      total_score: 750,
      best_score: 350,
      global_rank: 5,
      updated_at: knex.raw("NOW() - INTERVAL '4 days'")
    },

    // Lisa's rankings (user_id: 9)
    {
      user_id: 9,
      game_id: 1, // Caro Hàng 5
      total_games: 5,
      total_wins: 4,
      total_losses: 1,
      total_draws: 0,
      win_rate: 80.00,
      total_score: 4200,
      best_score: 1050,
      global_rank: 2,
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },

    // Chris's rankings (user_id: 10)
    {
      user_id: 10,
      game_id: 5, // Ghép Hàng 3
      total_games: 3,
      total_wins: 2,
      total_losses: 1,
      total_draws: 0,
      win_rate: 66.67,
      total_score: 2550,
      best_score: 850,
      global_rank: 2,
      updated_at: knex.raw("NOW() - INTERVAL '3 hours'")
    }
  ]);
};
