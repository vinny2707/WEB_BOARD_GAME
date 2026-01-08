/**
 * Seed: Games
 * Creates various board games with DEFAULT settings only
 * Full customization options are handled per game_session by frontend
 */

exports.seed = async function(knex) {
  // Insert games (01_users.js handles deletion)
  await knex('games').insert([
    {
      id: 1,
      name: 'Caro Hàng 5',
      type: 'caro_5',
      description: 'Trò chơi cờ caro truyền thống. Đặt 5 quân liên tiếp theo hàng ngang, dọc hoặc chéo để chiến thắng.',
      rows: 15,
      cols: 15,
      enabled: true,
      icon: '⭕',
      rules: 'Hai người chơi lần lượt đánh dấu X và O. Người đầu tiên tạo được 5 quân liên tiếp sẽ thắng.',
      settings: JSON.stringify({
        winCondition: 5,
        allowOverline: false,
        turnTimeLimit: null // seconds, null = unlimited
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 2,
      name: 'Caro Hàng 4',
      type: 'caro_4',
      description: 'Biến thể cờ caro với điều kiện thắng là 4 quân liên tiếp. Nhanh và kịch tính hơn!',
      rows: 10,
      cols: 10,
      enabled: true,
      icon: '🔵',
      rules: 'Tương tự cờ caro nhưng chỉ cần 4 quân liên tiếp để thắng. Ván chơi nhanh hơn.',
      settings: JSON.stringify({
        winCondition: 4,
        allowOverline: true,
        turnTimeLimit: null
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 3,
      name: 'Tic-Tac-Toe',
      type: 'tictactoe',
      description: 'Trò chơi O ăn quan kinh điển. Đơn giản nhưng vui!',
      rows: 3,
      cols: 3,
      enabled: true,
      icon: '❌',
      rules: 'Lần lượt đánh dấu X và O trên bàn cờ 3x3. Người đầu tiên có 3 ô liên tiếp chiến thắng.',
      settings: JSON.stringify({
        allowDraw: true
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 4,
      name: 'Rắn Săn Mồi',
      type: 'snake',
      description: 'Điều khiển con rắn ăn thức ăn để lớn lên. Đừng để rắn va vào tường hoặc tự cắn mình!',
      rows: 20,
      cols: 20,
      enabled: true,
      icon: '🐍',
      rules: 'Dùng phím mũi tên để điều khiển. Ăn táo để tăng điểm và độ dài. Game over khi đâm vào tường hoặc thân mình.',
      settings: JSON.stringify({
        speed: 'normal',
        obstacles: false
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 5,
      name: 'Ghép Hàng 3',
      type: 'match3',
      description: 'Ghép 3 viên giống nhau để ghi điểm. Kiểu Candy Crush!',
      rows: 8,
      cols: 8,
      enabled: true,
      icon: '🍬',
      rules: 'Hoán đổi các viên kẹo liền kề để tạo thành hàng 3 hoặc nhiều hơn giống nhau. Càng nhiều combo càng nhiều điểm!',
      settings: JSON.stringify({
        gameMode: 'classic',
        candyTypes: 6
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 6,
      name: 'Cờ Trí Nhớ',
      type: 'memory_cards',
      description: 'Lật các quân bài để tìm cặp giống nhau. Thử thách trí nhớ của bạn!',
      rows: 4,
      cols: 4,
      enabled: true,
      icon: '🃏',
      rules: 'Lật từng lượt 2 lá bài. Nếu giống nhau thì giữ nguyên, không thì lật úp lại. Mục tiêu tìm hết tất cả các cặp.',
      settings: JSON.stringify({
        cardTheme: 'emojis',
        timerEnabled: true
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 7,
      name: 'Bảng Vẽ Tự Do',
      type: 'drawing_board',
      description: 'Vẽ tự do hoặc chơi Scribble với bạn bè. Thả sức sáng tạo!',
      rows: 30,
      cols: 40,
      enabled: true,
      icon: '🎨',
      rules: 'Sử dụng chuột hoặc ngón tay để vẽ. Có thể chơi mini game đoán tranh hoặc vẽ tự do.',
      settings: JSON.stringify({
        gameMode: 'freeplay',
        saveDrawing: true
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  // Reset sequence
  await knex.raw('SELECT setval(\'games_id_seq\', (SELECT MAX(id) FROM games))');
};
