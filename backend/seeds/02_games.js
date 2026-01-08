/**
 * Seed: Games
 * Creates various board games with configurations
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
        boardSize: ['15x15', '19x19'],
        allowOverline: false,
        firstMoveAdvantage: true,
        timeControl: ['unlimited', '5min', '10min', '15min']
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
        boardSize: ['8x8', '10x10', '12x12'],
        allowOverline: true,
        quickPlay: true
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
        allowDraw: true,
        aiDifficulty: ['easy', 'medium', 'hard', 'impossible'],
        quickGame: true
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
        speed: ['slow', 'normal', 'fast', 'extreme'],
        boardSize: ['15x15', '20x20', '25x25'],
        obstacles: false,
        scoring: 'length_and_speed',
        powerUps: ['slow_down', 'speed_up', 'invincible']
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
        gridSize: ['8x8', '10x10'],
        timeLimit: [60, 120, 180, 300],
        moveLimit: [20, 30, 50],
        gameMode: ['classic', 'timed', 'moves_limited'],
        candyTypes: 6,
        specialCandies: ['striped', 'wrapped', 'color_bomb']
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
        gridSize: ['4x4', '4x6', '6x6'],
        cardThemes: ['animals', 'fruits', 'numbers', 'emojis', 'flags'],
        difficulty: ['easy', 'medium', 'hard'],
        timerEnabled: true,
        movesCounter: true
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
        canvasSize: ['600x400', '800x600', '1000x700'],
        brushSizes: [1, 2, 5, 10, 20],
        colors: 'palette',
        tools: ['pencil', 'brush', 'eraser', 'fill', 'line', 'rectangle', 'circle'],
        gameMode: ['freeplay', 'guessing_game', 'collaborative'],
        saveDrawing: true,
        timeLimit: [30, 60, 90, 120]
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  // Reset sequence
  await knex.raw('SELECT setval(\'games_id_seq\', (SELECT MAX(id) FROM games))');
};
