/**
 * Seed: User Achievements
 * Tracks which achievements users have unlocked
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('user_achievements').del();

  // Insert user achievements
  await knex('user_achievements').insert([
    // John (user_id: 2) - Has completed some games
    {
      user_id: 2,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 3 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 2,
      achievement_id: 2, // Getting Started
      progress: JSON.stringify({ gamesWon: 2 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 2,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 3 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '30 days'")
    },

    // Jane (user_id: 3) - Advanced player
    {
      user_id: 3,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 2 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 3,
      achievement_id: 2, // Getting Started
      progress: JSON.stringify({ gamesWon: 2 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 3,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 4 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '28 days'")
    },
    {
      user_id: 3,
      achievement_id: 9, // Popular
      progress: JSON.stringify({ friendsCount: 4 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '10 days'")
    },

    // Mike (user_id: 4) - Moderator with progress
    {
      user_id: 4,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 2 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '12 hours'")
    },
    {
      user_id: 4,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 3 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '22 days'")
    },

    // Sarah (user_id: 5) - Active player
    {
      user_id: 5,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 2 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 5,
      achievement_id: 2, // Getting Started
      progress: JSON.stringify({ gamesWon: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 5,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 4 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '25 days'")
    },

    // David (user_id: 6) - Beginner
    {
      user_id: 6,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '8 hours'")
    },
    {
      user_id: 6,
      achievement_id: 2, // Getting Started
      progress: JSON.stringify({ gamesWon: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '8 hours'")
    },
    {
      user_id: 6,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 3 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '20 days'")
    },

    // Emily (user_id: 7) - Speed player
    {
      user_id: 7,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },
    {
      user_id: 7,
      achievement_id: 2, // Getting Started
      progress: JSON.stringify({ gamesWon: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },
    {
      user_id: 7,
      achievement_id: 11, // Speed Demon (won in under 5 minutes)
      progress: JSON.stringify({ fastestWin: 280 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '10 hours'")
    },
    {
      user_id: 7,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 2 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '15 days'")
    },

    // Robert (user_id: 8) - Some progress
    {
      user_id: 8,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '4 days'")
    },
    {
      user_id: 8,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 2 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '16 days'")
    },

    // Lisa (user_id: 9) - Active
    {
      user_id: 9,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 9,
      achievement_id: 2, // Getting Started
      progress: JSON.stringify({ gamesWon: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 9,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 3 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '10 days'")
    },

    // Chris (user_id: 10) - Connect Four enthusiast
    {
      user_id: 10,
      achievement_id: 1, // First Steps
      progress: JSON.stringify({ gamesCompleted: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '3 hours'")
    },
    {
      user_id: 10,
      achievement_id: 2, // Getting Started
      progress: JSON.stringify({ gamesWon: 1 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '3 hours'")
    },
    {
      user_id: 10,
      achievement_id: 3, // Social Butterfly
      progress: JSON.stringify({ friendsCount: 2 }),
      unlocked_at: knex.raw("NOW() - INTERVAL '12 days'")
    },

    // Some users working towards achievements (not yet unlocked)
    {
      user_id: 2,
      achievement_id: 4, // Winning Streak
      progress: JSON.stringify({ currentStreak: 2, maxCount: 10 }),
      unlocked_at: null
    },
    {
      user_id: 3,
      achievement_id: 5, // Century Player
      progress: JSON.stringify({ gamesCompleted: 2, maxCount: 100 }),
      unlocked_at: null
    },
    {
      user_id: 3,
      achievement_id: 7, // Chess Master
      progress: JSON.stringify({ chessWins: 2, maxCount: 20 }),
      unlocked_at: null
    },
    {
      user_id: 5,
      achievement_id: 10, // Chatterbox
      progress: JSON.stringify({ messagesSent: 3, maxCount: 100 }),
      unlocked_at: null
    },
    {
      user_id: 9,
      achievement_id: 8, // Gomoku Grandmaster
      progress: JSON.stringify({ gomokuWins: 1, maxCount: 15 }),
      unlocked_at: null
    }
  ]);
};
