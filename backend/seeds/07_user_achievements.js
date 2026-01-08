/**
 * Seed: User Achievements
 * Tracks which achievements users have unlocked
 * Progress format follows achievements.unlock_criteria structure from database_documentation.md
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('user_achievements').del();

  // Insert user achievements
  // Progress format: { current, required, percentage, last_updated }
  await knex('user_achievements').insert([
    // John (user_id: 2)
    {
      user_id: 2,
      achievement_id: 1, // First Steps (total_games >= 1)
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 2,
      achievement_id: 2, // Getting Started (total_wins >= 1)
      progress: JSON.stringify({ current: 2, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 2,
      achievement_id: 3, // Social Butterfly (friend_count >= 1)
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '30 days'")
    },

    // Jane (user_id: 3)
    {
      user_id: 3,
      achievement_id: 1,
      progress: JSON.stringify({ current: 10, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 3,
      achievement_id: 2,
      progress: JSON.stringify({ current: 7, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 3,
      achievement_id: 3,
      progress: JSON.stringify({ current: 4, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '28 days'")
    },

    // Mike (user_id: 4)
    {
      user_id: 4,
      achievement_id: 1,
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '12 hours'")
    },
    {
      user_id: 4,
      achievement_id: 3,
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '22 days'")
    },

    // Sarah (user_id: 5)
    {
      user_id: 5,
      achievement_id: 1,
      progress: JSON.stringify({ current: 2, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 5,
      achievement_id: 2,
      progress: JSON.stringify({ current: 2, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 5,
      achievement_id: 3,
      progress: JSON.stringify({ current: 4, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '25 days'")
    },

    // David (user_id: 6)
    {
      user_id: 6,
      achievement_id: 1,
      progress: JSON.stringify({ current: 4, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '8 hours'")
    },
    {
      user_id: 6,
      achievement_id: 2,
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '8 hours'")
    },
    {
      user_id: 6,
      achievement_id: 3,
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '20 days'")
    },

    // Emily (user_id: 7) - Speed player
    {
      user_id: 7,
      achievement_id: 1,
      progress: JSON.stringify({ current: 5, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },
    {
      user_id: 7,
      achievement_id: 2,
      progress: JSON.stringify({ current: 5, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },
    {
      user_id: 7,
      achievement_id: 11, // Speed Demon (win_time <= 300 seconds) - 180s < 300s = UNLOCKED
      progress: JSON.stringify({ current: 180, required: 300, percentage: 100 }), // For time: current <= required = 100%
      unlocked_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },
    {
      user_id: 7,
      achievement_id: 3,
      progress: JSON.stringify({ current: 2, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '15 days'")
    },

    // Robert (user_id: 8)
    {
      user_id: 8,
      achievement_id: 1,
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '4 days'")
    },
    {
      user_id: 8,
      achievement_id: 3,
      progress: JSON.stringify({ current: 2, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '16 days'")
    },

    // Lisa (user_id: 9)
    {
      user_id: 9,
      achievement_id: 1,
      progress: JSON.stringify({ current: 5, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 9,
      achievement_id: 2,
      progress: JSON.stringify({ current: 4, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 9,
      achievement_id: 3,
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '10 days'")
    },

    // Chris (user_id: 10)
    {
      user_id: 10,
      achievement_id: 1,
      progress: JSON.stringify({ current: 3, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '3 hours'")
    },
    {
      user_id: 10,
      achievement_id: 2,
      progress: JSON.stringify({ current: 2, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '3 hours'")
    },
    {
      user_id: 10,
      achievement_id: 3,
      progress: JSON.stringify({ current: 2, required: 1, percentage: 100 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '12 days'")
    },

    // In-progress achievements (not yet unlocked)
    {
      user_id: 2,
      achievement_id: 4, // Winning Streak (win_streak >= 10)
      progress: JSON.stringify({ current: 3, required: 10, percentage: 30 }),
      unlocked_at: null
    },
    {
      user_id: 3,
      achievement_id: 5, // Century Player (total_games >= 100)
      progress: JSON.stringify({ current: 10, required: 100, percentage: 10 }),
      unlocked_at: null
    },
    {
      user_id: 3,
      achievement_id: 7, // Cao Thủ Caro (game_wins caro_5 >= 20)
      progress: JSON.stringify({ current: 4, required: 20, percentage: 20 }),
      unlocked_at: null
    },
    {
      user_id: 5,
      achievement_id: 10, // Chatterbox (messages_sent >= 100)
      progress: JSON.stringify({ current: 15, required: 100, percentage: 15 }),
      unlocked_at: null
    },
    {
      user_id: 9,
      achievement_id: 8, // Rắn Săn Mồi Pro (high_score snake >= 500)
      progress: JSON.stringify({ current: 350, required: 500, percentage: 70 }),
      unlocked_at: null
    }
  ]);
};
