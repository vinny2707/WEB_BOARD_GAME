/**
 * Seed: Achievements
 * Creates various achievements that users can unlock
 */

exports.seed = async function(knex) {
  // Insert achievements (01_users.js handles deletion)
  await knex('achievements').insert([
    // Beginner achievements
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first game',
      icon: '🎮',
      category: 'beginner',
      points: 10,
      unlock_criteria: JSON.stringify({
        type: 'games_completed',
        count: 1
      }),
      created_at: knex.fn.now()
    },
    {
      id: 2,
      name: 'Getting Started',
      description: 'Win your first game',
      icon: '🏆',
      category: 'beginner',
      points: 25,
      unlock_criteria: JSON.stringify({
        type: 'games_won',
        count: 1
      }),
      created_at: knex.fn.now()
    },
    {
      id: 3,
      name: 'Social Butterfly',
      description: 'Add your first friend',
      icon: '👥',
      category: 'social',
      points: 15,
      unlock_criteria: JSON.stringify({
        type: 'friends_count',
        count: 1
      }),
      created_at: knex.fn.now()
    },

    // Expert achievements
    {
      id: 4,
      name: 'Winning Streak',
      description: 'Win 10 games in a row',
      icon: '🔥',
      category: 'expert',
      points: 100,
      unlock_criteria: JSON.stringify({
        type: 'win_streak',
        count: 10
      }),
      created_at: knex.fn.now()
    },
    {
      id: 5,
      name: 'Century Player',
      description: 'Play 100 games',
      icon: '💯',
      category: 'expert',
      points: 200,
      unlock_criteria: JSON.stringify({
        type: 'games_completed',
        count: 100
      }),
      created_at: knex.fn.now()
    },
    {
      id: 6,
      name: 'Champion',
      description: 'Win 50 games',
      icon: '👑',
      category: 'expert',
      points: 150,
      unlock_criteria: JSON.stringify({
        type: 'games_won',
        count: 50
      }),
      created_at: knex.fn.now()
    },

    // Game-specific achievements
    {
      id: 7,
      name: 'Cao Thủ Caro',
      description: 'Thắng 20 ván Caro Hàng 5',
      icon: '⭕',
      category: 'expert',
      points: 75,
      unlock_criteria: JSON.stringify({
        type: 'game_wins',
        gameType: 'caro_5',
        count: 20
      }),
      created_at: knex.fn.now()
    },
    {
      id: 8,
      name: 'Rắn Săn Mồi Pro',
      description: 'Đạt 500 điểm trong game Rắn Săn Mồi',
      icon: '🐍',
      category: 'expert',
      points: 60,
      unlock_criteria: JSON.stringify({
        type: 'high_score',
        gameType: 'snake',
        score: 500
      }),
      created_at: knex.fn.now()
    },

    // Social achievements
    {
      id: 9,
      name: 'Popular',
      description: 'Have 10 friends',
      icon: '🌟',
      category: 'social',
      points: 50,
      unlock_criteria: JSON.stringify({
        type: 'friends_count',
        count: 10
      }),
      created_at: knex.fn.now()
    },
    {
      id: 10,
      name: 'Chatterbox',
      description: 'Send 100 messages',
      icon: '💬',
      category: 'social',
      points: 40,
      unlock_criteria: JSON.stringify({
        type: 'messages_sent',
        count: 100
      }),
      created_at: knex.fn.now()
    },

    // Special achievements
    {
      id: 11,
      name: 'Speed Demon',
      description: 'Win a game in under 5 minutes',
      icon: '⚡',
      category: 'special',
      points: 30,
      unlock_criteria: JSON.stringify({
        type: 'win_time',
        maxSeconds: 300
      }),
      created_at: knex.fn.now()
    },
    {
      id: 12,
      name: 'Bộ Nhớ Siêu Phàm',
      description: 'Hoàn thành Cờ Trí Nhớ mức khó trong 60 giây',
      icon: '💎',
      category: 'special',
      points: 120,
      unlock_criteria: JSON.stringify({
        type: 'time_challenge',
        gameType: 'memory_cards',
        maxSeconds: 60,
        difficulty: 'hard'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 13,
      name: 'Night Owl',
      description: 'Play a game between midnight and 4 AM',
      icon: '🦉',
      category: 'special',
      points: 20,
      unlock_criteria: JSON.stringify({
        type: 'play_time',
        hourRange: [0, 4]
      }),
      created_at: knex.fn.now()
    },
    {
      id: 14,
      name: 'Comeback King',
      description: 'Win a game after being down by 50% score',
      icon: '🎪',
      category: 'special',
      points: 80,
      unlock_criteria: JSON.stringify({
        type: 'comeback_win',
        minDeficit: 0.5
      }),
      created_at: knex.fn.now()
    },
    {
      id: 15,
      name: 'Jack of All Trades',
      description: 'Win at least one game in each game type',
      icon: '🎯',
      category: 'special',
      points: 100,
      unlock_criteria: JSON.stringify({
        type: 'all_games_won',
        minPerGame: 1
      }),
      created_at: knex.fn.now()
    }
  ]);

  // Reset sequence
  await knex.raw('SELECT setval(\'achievements_id_seq\', (SELECT MAX(id) FROM achievements))');
};
