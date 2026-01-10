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
        type: 'total_games',
        game_type: null,
        required_count: 1,
        description: 'Play 1 game of any type'
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
        type: 'total_wins',
        game_type: null,
        required_count: 1,
        description: 'Win 1 game of any type'
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
        type: 'friend_count',
        game_type: null,
        required_count: 1,
        description: 'Have at least 1 friend'
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
        game_type: null,
        required_count: 10,
        description: 'Win 10 consecutive games'
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
        type: 'total_games',
        game_type: null,
        required_count: 100,
        description: 'Play 100 games of any type'
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
        type: 'total_wins',
        game_type: null,
        required_count: 50,
        description: 'Win 50 games of any type'
      }),
      created_at: knex.fn.now()
    },

    // Game-specific achievements
    {
      id: 7,
      name: 'Cao Thủ Caro',
      description: 'Thắng 20 ván Caro',
      icon: '⭕',
      category: 'expert',
      points: 75,
      unlock_criteria: JSON.stringify({
        type: 'game_wins',
        game_type: ['caro_5', 'caro_4'],
        required_count: 20,
        description: 'Win 20 games in Caro (5 or 4)'
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
        game_type: ['snake'],
        required_count: 500,
        description: 'Score 500 points in Snake'
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
        type: 'friend_count',
        game_type: null,
        required_count: 10,
        description: 'Have at least 10 friends'
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
        game_type: null,
        required_count: 100,
        description: 'Send 100 messages'
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
        game_type: null,
        required_count: 300,
        description: 'Win any game in under 300 seconds'
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
        game_type: ['memory_cards'],
        required_count: 60,
        description: 'Complete Memory Cards in under 60 seconds'
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
        game_type: null,
        required_count: 1,
        description: 'Play 1 game between 00:00 - 04:00'
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
        game_type: null,
        required_count: 1,
        description: 'Win after trailing by 50%'
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
        game_type: ['caro_5', 'caro_4', 'tictactoe', 'snake', 'match3', 'memory_cards', 'drawing_board'],
        required_count: 1,
        description: 'Win 1 game in each game type'
      }),
      created_at: knex.fn.now()
    },

    // Game-specific achievements (10 more)
    {
      id: 16,
      name: 'Tic-Tac-Toe Master',
      description: 'Thắng 50 ván Tic-Tac-Toe',
      icon: '❌',
      category: 'expert',
      points: 80,
      unlock_criteria: JSON.stringify({
        type: 'game_wins',
        game_type: ['tictactoe'],
        required_count: 50,
        description: 'Win 50 games of Tic-Tac-Toe'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 17,
      name: 'Candy Crusher',
      description: 'Đạt 10,000 điểm trong Ghép Hàng 3',
      icon: '🍭',
      category: 'expert',
      points: 90,
      unlock_criteria: JSON.stringify({
        type: 'high_score',
        game_type: ['match3'],
        required_count: 10000,
        description: 'Score 10,000 points in Match 3'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 18,
      name: 'Memory King',
      description: 'Thắng 30 ván Cờ Trí Nhớ',
      icon: '🧠',
      category: 'expert',
      points: 85,
      unlock_criteria: JSON.stringify({
        type: 'game_wins',
        game_type: ['memory_cards'],
        required_count: 30,
        description: 'Win 30 games of Memory Cards'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 19,
      name: 'Rắn Huyền Thoại',
      description: 'Đạt 1000 điểm trong Rắn Săn Mồi',
      icon: '🐉',
      category: 'special',
      points: 150,
      unlock_criteria: JSON.stringify({
        type: 'high_score',
        game_type: ['snake'],
        required_count: 1000,
        description: 'Score 1000 points in Snake'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 20,
      name: 'Nghệ Sĩ Tài Ba',
      description: 'Hoàn thành 20 bản vẽ trong Bảng Vẽ',
      icon: '🖼️',
      category: 'expert',
      points: 70,
      unlock_criteria: JSON.stringify({
        type: 'game_wins',
        game_type: ['drawing_board'],
        required_count: 20,
        description: 'Complete 20 drawings'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 21,
      name: 'Caro Chớp Nhoáng',
      description: 'Thắng ván Caro trong dưới 2 phút',
      icon: '⚡',
      category: 'special',
      points: 60,
      unlock_criteria: JSON.stringify({
        type: 'win_time',
        game_type: ['caro_5', 'caro_4'],
        required_count: 120,
        description: 'Win a Caro game in under 120 seconds'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 22,
      name: 'Candy Combo',
      description: 'Tạo combo 10 lần liên tiếp trong Match 3',
      icon: '💥',
      category: 'special',
      points: 50,
      unlock_criteria: JSON.stringify({
        type: 'combo_streak',
        game_type: ['match3'],
        required_count: 10,
        description: 'Create a 10-combo streak in Match 3'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 23,
      name: 'Perfect Memory',
      description: 'Hoàn thành Memory Cards không sai lần nào',
      icon: '✨',
      category: 'special',
      points: 100,
      unlock_criteria: JSON.stringify({
        type: 'perfect_game',
        game_type: ['memory_cards'],
        required_count: 1,
        description: 'Complete Memory Cards with no mistakes'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 24,
      name: 'Caro 5 Legend',
      description: 'Đạt hạng top 10 trong Caro Hàng 5',
      icon: '🥇',
      category: 'special',
      points: 200,
      unlock_criteria: JSON.stringify({
        type: 'global_rank',
        game_type: ['caro_5'],
        required_count: 10,
        description: 'Reach top 10 in Caro 5 rankings'
      }),
      created_at: knex.fn.now()
    },
    {
      id: 25,
      name: 'Snake Marathon',
      description: 'Chơi tổng cộng 100 ván Rắn Săn Mồi',
      icon: '🏃',
      category: 'expert',
      points: 65,
      unlock_criteria: JSON.stringify({
        type: 'total_games',
        game_type: ['snake'],
        required_count: 100,
        description: 'Play 100 games of Snake'
      }),
      created_at: knex.fn.now()
    }
  ]);

  // Reset sequence
  await knex.raw('SELECT setval(\'achievements_id_seq\', (SELECT MAX(id) FROM achievements))');
};

