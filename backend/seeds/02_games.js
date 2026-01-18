/**
 * Seed: Games
 * Creates various board games with DEFAULT settings only
 * Full customization options are handled per game_session by frontend
 * Updated to match production data
 */

exports.seed = async function (knex) {
  // Insert games (01_users.js handles deletion)
  await knex('games').insert([
    {
      id: 1,
      name: 'Caro hàng 5',
      type: 'caro_5',
      description: 'Trò chơi cờ Caro cổ điển - Người chơi cần xếp được 5 quân liên tiếp (ngang, dọc hoặc chéo) để chiến thắng.',
      rows: 15,
      cols: 15,
      enabled: true,
      icon: 'https://cdn.shopify.com/s/files/1/0731/6514/4343/t/7/assets/choi-co-caro-luon-thang_2_.jpg?v=1708427173',
      rules: 'Hai người chơi lần lượt đánh dấu X và O. Người đầu tiên tạo được 5 quân liên tiếp sẽ thắng.',
      settings: JSON.stringify({
        winCondition: 5,
        allowOverline: false,
        turnTimeLimit: null
      }),
      created_at: knex.raw("NOW() - INTERVAL '120 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '120 days'")
    },
    {
      id: 2,
      name: 'Caro Hàng 4',
      type: 'caro_4',
      description: 'Biến thể cờ caro với điều kiện thắng là 4 quân liên tiếp. Nhanh và kịch tính hơn!',
      rows: 10,
      cols: 10,
      enabled: true,
      icon: 'https://papergames.io/en/assets/games/connect4/thumbnail.png',
      rules: 'Tương tự cờ caro nhưng chỉ cần 4 quân liên tiếp để thắng. Ván chơi nhanh hơn.',
      settings: JSON.stringify({
        winCondition: 4,
        allowOverline: true,
        turnTimeLimit: null
      }),
      created_at: knex.raw("NOW() - INTERVAL '115 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '115 days'")
    },
    {
      id: 3,
      name: 'Tic-Tac-Toe',
      type: 'tictactoe',
      description: 'Trò chơi O ăn quan kinh điển. Đơn giản nhưng vui!',
      rows: 3,
      cols: 3,
      enabled: true,
      icon: 'https://st.gamevui.vn/images/image/2023/01/30/tic-tac-toe-200.jpg',
      rules: 'Lần lượt đánh dấu X và O trên bàn cờ 3x3. Người đầu tiên có 3 ô liên tiếp chiến thắng.',
      settings: JSON.stringify({
        allowDraw: true
      }),
      created_at: knex.raw("NOW() - INTERVAL '110 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '110 days'")
    },
    {
      id: 4,
      name: 'Rắn Săn Mồi',
      type: 'snake',
      description: 'Điều khiển con rắn ăn thức ăn để lớn lên. Đừng để rắn va vào tường hoặc tự cắn mình!',
      rows: 20,
      cols: 20,
      enabled: true,
      icon: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/03/snake-game-3.jpg',
      rules: 'Dùng phím mũi tên để điều khiển. Ăn táo để tăng điểm và độ dài. Game over khi đâm vào tường hoặc thân mình.',
      settings: JSON.stringify({
        speed: 'normal',
        obstacles: false
      }),
      created_at: knex.raw("NOW() - INTERVAL '100 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '100 days'")
    },
    {
      id: 5,
      name: 'Ghép Hàng 3',
      type: 'match3',
      description: 'Ghép 3 viên giống nhau để ghi điểm. Kiểu Candy Crush!',
      rows: 8,
      cols: 8,
      enabled: true,
      icon: 'https://st.gamevui.vn/images/image/2020/08/12/candy-crush-saga-200.jpg',
      rules: 'Hoán đổi các viên kẹo liền kề để tạo thành hàng 3 hoặc nhiều hơn giống nhau. Càng nhiều combo càng nhiều điểm!',
      settings: JSON.stringify({
        gameMode: 'classic',
        candyTypes: 6
      }),
      created_at: knex.raw("NOW() - INTERVAL '90 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '90 days'")
    },
    {
      id: 6,
      name: 'Cờ Trí Nhớ',
      type: 'memory_cards',
      description: 'Lật các quân bài để tìm cặp giống nhau. Thử thách trí nhớ của bạn!',
      rows: 4,
      cols: 4,
      enabled: true,
      icon: 'https://st.gamevui.vn/images/image/2023/05/25/tim-cap-hinh-giong-nhau-200.jpg',
      rules: 'Lật từng lượt 2 lá bài. Nếu giống nhau thì giữ nguyên, không thì lật úp lại. Mục tiêu tìm hết tất cả các cặp.',
      settings: JSON.stringify({
        cardTheme: 'emojis',
        timerEnabled: true
      }),
      created_at: knex.raw("NOW() - INTERVAL '80 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '80 days'")
    },
    {
      id: 7,
      name: 'Bảng Vẽ Tự Do',
      type: 'draw_board',
      description: 'Pixel Art Editor - Tạo các tác phẩm nghệ thuật pixel bằng cách tô màu các chấm tròn!',
      rows: 30,
      cols: 40,
      enabled: true,
      icon: 'https://st.gamevui.vn/images/image/2020/09/18/ve-tranh-200.jpg',
      rules: 'Sử dụng chuột hoặc ngón tay để vẽ pixel art.',
      settings: JSON.stringify({
        gameMode: 'freeplay',
        saveDrawing: true
      }),
      created_at: knex.raw("NOW() - INTERVAL '60 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '60 days'")
    },
    {
      id: 8,
      name: 'Cờ vua',
      type: 'chess',
      description: 'Đỉnh cao chiến thuật phương Tây - Dùng mưu lược điều binh để Chiếu bí Vua đối phương.',
      rows: 8,
      cols: 8,
      enabled: false,
      icon: 'https://papergames.io/en/assets/games/chess/thumbnail.png',
      rules: 'Di chuyển các quân cờ theo quy tắc. Mục tiêu chiếu bí vua đối phương.',
      settings: JSON.stringify({}),
      created_at: knex.raw("NOW() - INTERVAL '150 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '150 days'")
    },
    {
      id: 9,
      name: 'Cờ Đam',
      type: 'checkers',
      description: 'Trò chơi nhảy quân tốc độ - Ăn hết quân đối thủ hoặc khiến họ hết đường đi.',
      rows: 8,
      cols: 8,
      enabled: false,
      icon: 'https://st.gamevui.vn/images/image/2017/05/05/co-dam.jpg',
      rules: 'Di chuyển quân theo đường chéo. Nhảy qua quân đối phương để ăn.',
      settings: JSON.stringify({}),
      created_at: knex.raw("NOW() - INTERVAL '140 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '140 days'")
    },
    {
      id: 10,
      name: 'Ô Ăn Quan',
      type: 'mancala',
      description: 'Trò chơi tuổi thơ - Tính toán rải sỏi để thu về nhiều quân nhất.',
      rows: 2,
      cols: 5,
      enabled: false,
      icon: 'https://s-m.game24h.vn//upload/2-2015/images/2015-06-08/1433731521-o-an-quan-1.jpg',
      rules: 'Rải sỏi theo vòng, thu về nhiều quân nhất để thắng.',
      settings: JSON.stringify({}),
      created_at: knex.raw("NOW() - INTERVAL '200 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '200 days'")
    },
    {
      id: 11,
      name: 'Thủy Chiến',
      type: 'battleship',
      description: 'Hải chiến mù - Dựa vào suy luận để đánh chìm hạm đội địch đang ẩn nấp.',
      rows: 10,
      cols: 10,
      enabled: false,
      icon: 'https://s-m.game24h.vn/upload/4-2020/images/2020-11-07/1604720219-game-chien-ham.jpg',
      rules: 'Đặt tàu bí mật. Lần lượt bắn vào vị trí trên bàn cờ để tìm và đánh chìm tàu địch.',
      settings: JSON.stringify({}),
      created_at: knex.raw("NOW() - INTERVAL '10 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '10 days'")
    }
  ]);

  // Reset sequence
  await knex.raw('SELECT setval(\'games_id_seq\', (SELECT MAX(id) FROM games))');
};
