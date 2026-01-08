/**
 * Seed: Rankings
 * Creates ranking statistics for users in different games
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('rankings').del();

  // Insert rankings
  await knex('rankings').insert([
    // John's rankings (user_id: 2)
    {
      user_id: 2,
      game_id: 1, // Caro Hàng 5
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 1200,
      best_score: 1200,
      global_rank: 3,
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 2,
      game_id: 4, // Rắn Săn Mồi
      total_games: 1,
      total_wins: 0,
      total_losses: 1,
      total_draws: 0,
      win_rate: 0.00,
      total_score: 380,
      best_score: 380,
      global_rank: 6,
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 2,
      game_id: 3, // Tic Tac Toe
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 100,
      best_score: 100,
      global_rank: 1,
      updated_at: knex.raw("NOW() - INTERVAL '5 hours'")
    },

    // Jane's rankings (user_id: 3)
    {
      user_id: 3,
      game_id: 2, // Caro Hàng 4
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 1350,
      best_score: 1350,
      global_rank: 1, // Top Caro Hàng 4 player
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 3,
      game_id: 5, // Ghép Hàng 3
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 950,
      best_score: 950,
      global_rank: 1,
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },

    // Mike's rankings (user_id: 4)
    {
      user_id: 4,
      game_id: 6, // Cờ Trí Nhớ
      total_games: 1,
      total_wins: 0,
      total_losses: 0,
      total_draws: 1,
      win_rate: 0.00,
      total_score: 500,
      best_score: 500,
      global_rank: 3,
      updated_at: knex.raw("NOW() - INTERVAL '12 hours'")
    },
    {
      user_id: 4,
      game_id: 1, // Caro Hàng 5 (in progress)
      total_games: 0,
      total_wins: 0,
      total_losses: 0,
      total_draws: 0,
      win_rate: 0.00,
      total_score: 0,
      best_score: 0,
      global_rank: null,
      updated_at: knex.raw("NOW() - INTERVAL '1 hour'")
    },

    // Sarah's rankings (user_id: 5)
    {
      user_id: 5,
      game_id: 7, // Bảng Vẽ Tự Do
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 1100,
      best_score: 1100,
      global_rank: 1,
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 5,
      game_id: 2, // Caro Hàng 4 (abandoned)
      total_games: 0,
      total_wins: 0,
      total_losses: 0,
      total_draws: 0,
      win_rate: 0.00,
      total_score: 0,
      best_score: 0,
      global_rank: null,
      updated_at: knex.raw("NOW() - INTERVAL '6 hours'")
    },

    // David's rankings (user_id: 6)
    {
      user_id: 6,
      game_id: 3, // Tic Tac Toe
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 100,
      best_score: 100,
      global_rank: 2,
      updated_at: knex.raw("NOW() - INTERVAL '8 hours'")
    },

    // Emily's rankings (user_id: 7)
    {
      user_id: 7,
      game_id: 6, // Cờ Trí Nhớ - High score due to fast complete
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 1500,
      best_score: 1500,
      global_rank: 1, // Top memory game player
      updated_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },

    // Robert's rankings (user_id: 8)
    {
      user_id: 8,
      game_id: 4, // Rắn Săn Mồi
      total_games: 1,
      total_wins: 0,
      total_losses: 1,
      total_draws: 0,
      win_rate: 0.00,
      total_score: 250,
      best_score: 250,
      global_rank: 2,
      updated_at: knex.raw("NOW() - INTERVAL '4 days'")
    },

    // Lisa's rankings (user_id: 9)
    {
      user_id: 9,
      game_id: 1, // Caro Hàng 5
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 1050,
      best_score: 1050,
      global_rank: 2, // #2 Caro Hàng 5 player
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },

    // Chris's rankings (user_id: 10)
    {
      user_id: 10,
      game_id: 5, // Ghép Hàng 3
      total_games: 1,
      total_wins: 1,
      total_losses: 0,
      total_draws: 0,
      win_rate: 100.00,
      total_score: 850,
      best_score: 850,
      global_rank: 2, // #2 Match-3 player
      updated_at: knex.raw("NOW() - INTERVAL '3 hours'")
    },

    // Additional rankings for active players
    {
      user_id: 2,
      game_id: 2, // Checkers
      total_games: 0,
      total_wins: 0,
      total_losses: 0,
      total_draws: 0,
      win_rate: 0.00,
      total_score: 0,
      best_score: 0,
      global_rank: null,
      updated_at: knex.fn.now()
    },
    {
      user_id: 3,
      game_id: 3, // Gomoku
      total_games: 0,
      total_wins: 0,
      total_losses: 0,
      total_draws: 0,
      win_rate: 0.00,
      total_score: 0,
      best_score: 0,
      global_rank: null,
      updated_at: knex.fn.now()
    },
    // {
    //   user_id: 4,
    //   game_id: 1, // Chess
    //   total_games: 0,
    //   total_wins: 0,
    //   total_losses: 0,
    //   total_draws: 0,
    //   win_rate: 0.00,
    //   total_score: 0,
    //   best_score: 0,
    //   global_rank: null,
    //   updated_at: knex.fn.now()
    // }
  ]);
};
