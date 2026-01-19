/**
 * Seed: Achievements
 * Tạo 60+ achievements đa dạng theo game type và category
 * 
 * Categories: beginner, expert, social, special
 * Criteria Types: total_games, total_wins, game_wins, win_streak, 
 *                 friend_count, messages_sent, global_rank, high_score, etc.
 */

exports.seed = async function(knex) {
    await knex('achievements').del();

    const achievements = [
        // ============================================
        // BEGINNER ACHIEVEMENTS (Người mới)
        // ============================================
        {
            id: 1,
            name: 'Bước Đầu Tiên',
            description: 'Hoàn thành ván chơi đầu tiên',
            icon: '🎮',
            category: 'beginner',
            points: 10,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: null,
                required_count: 1
            })
        },
        {
            id: 2,
            name: 'Chiến Thắng Đầu Tay',
            description: 'Giành chiến thắng đầu tiên',
            icon: '🏆',
            category: 'beginner',
            points: 20,
            unlock_criteria: JSON.stringify({
                type: 'total_wins',
                game_type: null,
                required_count: 1
            })
        },
        {
            id: 3,
            name: 'Người Mới Caro 5',
            description: 'Hoàn thành ván Caro 5 đầu tiên',
            icon: '⭕',
            category: 'beginner',
            points: 15,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: 'caro_5',
                required_count: 1
            })
        },
        {
            id: 4,
            name: 'Người Mới Caro 4',
            description: 'Hoàn thành ván Caro 4 đầu tiên',
            icon: '❌',
            category: 'beginner',
            points: 15,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: 'caro_4',
                required_count: 1
            })
        },
        {
            id: 5,
            name: 'Người Mới Tic-Tac-Toe',
            description: 'Hoàn thành ván Tic-Tac-Toe đầu tiên',
            icon: '✖️',
            category: 'beginner',
            points: 15,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: 'tictactoe',
                required_count: 1
            })
        },
        {
            id: 6,
            name: 'Thợ Săn Rắn Mới',
            description: 'Chơi Rắn Săn Mồi lần đầu',
            icon: '🐍',
            category: 'beginner',
            points: 15,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: 'snake',
                required_count: 1
            })
        },
        {
            id: 7,
            name: 'Nghiền Kẹo Mới',
            description: 'Chơi Candy Crush lần đầu',
            icon: '🍬',
            category: 'beginner',
            points: 15,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: 'match3',
                required_count: 1
            })
        },
        {
            id: 8,
            name: 'Trí Nhớ Khởi Động',
            description: 'Chơi Cờ Trí Nhớ lần đầu',
            icon: '🧠',
            category: 'beginner',
            points: 15,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: 'memory_cards',
                required_count: 1
            })
        },
        {
            id: 9,
            name: 'Hoạ Sĩ Mới',
            description: 'Sử dụng Bảng Vẽ Tự Do lần đầu',
            icon: '🎨',
            category: 'beginner',
            points: 10,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: 'drawing_board',
                required_count: 1
            })
        },
        {
            id: 10,
            name: 'Chơi 10 Ván',
            description: 'Hoàn thành 10 ván chơi bất kỳ',
            icon: '🔟',
            category: 'beginner',
            points: 30,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: null,
                required_count: 10
            })
        },

        // ============================================
        // EXPERT ACHIEVEMENTS (Chuyên gia)
        // ============================================
        {
            id: 11,
            name: 'Chiến Binh 50 Trận',
            description: 'Hoàn thành 50 ván chơi',
            icon: '⚔️',
            category: 'expert',
            points: 50,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: null,
                required_count: 50
            })
        },
        {
            id: 12,
            name: 'Bách Chiến Bách Thắng',
            description: 'Hoàn thành 100 ván chơi',
            icon: '💯',
            category: 'expert',
            points: 100,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: null,
                required_count: 100
            })
        },
        {
            id: 13,
            name: 'Nghìn Trận',
            description: 'Hoàn thành 1000 ván chơi',
            icon: '🏅',
            category: 'expert',
            points: 500,
            unlock_criteria: JSON.stringify({
                type: 'total_games',
                game_type: null,
                required_count: 1000
            })
        },
        {
            id: 14,
            name: 'Thắng 10 Trận',
            description: 'Giành 10 chiến thắng',
            icon: '🥇',
            category: 'expert',
            points: 40,
            unlock_criteria: JSON.stringify({
                type: 'total_wins',
                game_type: null,
                required_count: 10
            })
        },
        {
            id: 15,
            name: 'Thắng 50 Trận',
            description: 'Giành 50 chiến thắng',
            icon: '🏆',
            category: 'expert',
            points: 100,
            unlock_criteria: JSON.stringify({
                type: 'total_wins',
                game_type: null,
                required_count: 50
            })
        },
        {
            id: 16,
            name: 'Thắng 100 Trận',
            description: 'Giành 100 chiến thắng',
            icon: '👑',
            category: 'expert',
            points: 200,
            unlock_criteria: JSON.stringify({
                type: 'total_wins',
                game_type: null,
                required_count: 100
            })
        },
        {
            id: 17,
            name: 'Chuỗi 3 Thắng',
            description: 'Thắng 3 ván liên tiếp',
            icon: '🔥',
            category: 'expert',
            points: 30,
            unlock_criteria: JSON.stringify({
                type: 'win_streak',
                game_type: null,
                required_count: 3
            })
        },
        {
            id: 18,
            name: 'Chuỗi 5 Thắng',
            description: 'Thắng 5 ván liên tiếp',
            icon: '🔥🔥',
            category: 'expert',
            points: 60,
            unlock_criteria: JSON.stringify({
                type: 'win_streak',
                game_type: null,
                required_count: 5
            })
        },
        {
            id: 19,
            name: 'Chuỗi 10 Thắng',
            description: 'Thắng 10 ván liên tiếp',
            icon: '🔥🔥🔥',
            category: 'expert',
            points: 150,
            unlock_criteria: JSON.stringify({
                type: 'win_streak',
                game_type: null,
                required_count: 10
            })
        },

        // ============================================
        // GAME-SPECIFIC ACHIEVEMENTS - Caro 5
        // ============================================
        {
            id: 20,
            name: 'Vua Caro 5',
            description: 'Thắng 10 ván Caro 5',
            icon: '⭕👑',
            category: 'expert',
            points: 50,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'caro_5',
                required_count: 10
            })
        },
        {
            id: 21,
            name: 'Caro 5 Master',
            description: 'Thắng 50 ván Caro 5',
            icon: '⭕💎',
            category: 'expert',
            points: 150,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'caro_5',
                required_count: 50
            })
        },
        {
            id: 22,
            name: 'Caro 5 Legend',
            description: 'Thắng 100 ván Caro 5',
            icon: '⭕🌟',
            category: 'special',
            points: 300,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'caro_5',
                required_count: 100
            })
        },

        // ============================================
        // GAME-SPECIFIC ACHIEVEMENTS - Caro 4
        // ============================================
        {
            id: 23,
            name: 'Vua Caro 4',
            description: 'Thắng 10 ván Caro 4',
            icon: '❌👑',
            category: 'expert',
            points: 50,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'caro_4',
                required_count: 10
            })
        },
        {
            id: 24,
            name: 'Caro 4 Master',
            description: 'Thắng 50 ván Caro 4',
            icon: '❌💎',
            category: 'expert',
            points: 150,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'caro_4',
                required_count: 50
            })
        },
        {
            id: 25,
            name: 'Caro 4 Legend',
            description: 'Thắng 100 ván Caro 4',
            icon: '❌🌟',
            category: 'special',
            points: 300,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'caro_4',
                required_count: 100
            })
        },

        // ============================================
        // GAME-SPECIFIC ACHIEVEMENTS - Tic-Tac-Toe
        // ============================================
        {
            id: 26,
            name: 'Vua Tic-Tac-Toe',
            description: 'Thắng 10 ván Tic-Tac-Toe',
            icon: '✖️👑',
            category: 'expert',
            points: 50,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'tictactoe',
                required_count: 10
            })
        },
        {
            id: 27,
            name: 'Tic-Tac-Toe Master',
            description: 'Thắng 50 ván Tic-Tac-Toe',
            icon: '✖️💎',
            category: 'expert',
            points: 150,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'tictactoe',
                required_count: 50
            })
        },

        // ============================================
        // GAME-SPECIFIC ACHIEVEMENTS - Snake
        // ============================================
        {
            id: 28,
            name: 'Rắn Nhỏ',
            description: 'Đạt 500 điểm trong Rắn Săn Mồi',
            icon: '🐍',
            category: 'beginner',
            points: 20,
            unlock_criteria: JSON.stringify({
                type: 'high_score',
                game_type: 'snake',
                required_count: 500
            })
        },
        {
            id: 29,
            name: 'Rắn Trung',
            description: 'Đạt 1000 điểm trong Rắn Săn Mồi',
            icon: '🐍🐍',
            category: 'expert',
            points: 60,
            unlock_criteria: JSON.stringify({
                type: 'high_score',
                game_type: 'snake',
                required_count: 1000
            })
        },
        {
            id: 30,
            name: 'Rắn Khổng Lồ',
            description: 'Đạt 1500 điểm trong Rắn Săn Mồi',
            icon: '🐍🐍🐍',
            category: 'expert',
            points: 120,
            unlock_criteria: JSON.stringify({
                type: 'high_score',
                game_type: 'snake',
                required_count: 1500
            })
        },
        {
            id: 31,
            name: 'Vua Rắn',
            description: 'Đạt 2000 điểm trong Rắn Săn Mồi',
            icon: '🐍👑',
            category: 'special',
            points: 250,
            unlock_criteria: JSON.stringify({
                type: 'high_score',
                game_type: 'snake',
                required_count: 2000
            })
        },
        {
            id: 32,
            name: 'Thợ Săn Rắn',
            description: 'Thắng 10 ván Rắn Săn Mồi',
            icon: '🐍🏆',
            category: 'expert',
            points: 50,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'snake',
                required_count: 10
            })
        },

        // ============================================
        // GAME-SPECIFIC ACHIEVEMENTS - Candy Crush
        // ============================================
        {
            id: 33,
            name: 'Nghiền Kẹo Nhỏ',
            description: 'Đạt 1500 điểm trong Candy Crush',
            icon: '🍬',
            category: 'beginner',
            points: 20,
            unlock_criteria: JSON.stringify({
                type: 'high_score',
                game_type: 'match3',
                required_count: 1500
            })
        },
        {
            id: 34,
            name: 'Nghiền Kẹo Pro',
            description: 'Đạt 3000 điểm trong Candy Crush',
            icon: '🍬🍬',
            category: 'expert',
            points: 80,
            unlock_criteria: JSON.stringify({
                type: 'high_score',
                game_type: 'match3',
                required_count: 3000
            })
        },
        {
            id: 35,
            name: 'Vua Kẹo',
            description: 'Đạt 5000 điểm trong Candy Crush',
            icon: '🍬👑',
            category: 'special',
            points: 200,
            unlock_criteria: JSON.stringify({
                type: 'high_score',
                game_type: 'match3',
                required_count: 5000
            })
        },
        {
            id: 36,
            name: 'Thợ Kẹo',
            description: 'Thắng 10 ván Candy Crush',
            icon: '🍬🏆',
            category: 'expert',
            points: 50,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'match3',
                required_count: 10
            })
        },

        // ============================================
        // GAME-SPECIFIC ACHIEVEMENTS - Memory Cards
        // ============================================
        {
            id: 37,
            name: 'Trí Nhớ Tốt',
            description: 'Thắng 5 ván Cờ Trí Nhớ',
            icon: '🧠',
            category: 'beginner',
            points: 30,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'memory_cards',
                required_count: 5
            })
        },
        {
            id: 38,
            name: 'Siêu Trí Nhớ',
            description: 'Thắng 20 ván Cờ Trí Nhớ',
            icon: '🧠🧠',
            category: 'expert',
            points: 80,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'memory_cards',
                required_count: 20
            })
        },
        {
            id: 39,
            name: 'Bậc Thầy Trí Nhớ',
            description: 'Thắng 50 ván Cờ Trí Nhớ',
            icon: '🧠👑',
            category: 'special',
            points: 180,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'memory_cards',
                required_count: 50
            })
        },

        // ============================================
        // SOCIAL ACHIEVEMENTS
        // ============================================
        {
            id: 40,
            name: 'Kết Bạn Đầu Tiên',
            description: 'Thêm bạn đầu tiên',
            icon: '👥',
            category: 'social',
            points: 15,
            unlock_criteria: JSON.stringify({
                type: 'friend_count',
                game_type: null,
                required_count: 1
            })
        },
        {
            id: 41,
            name: 'Có 5 Bạn',
            description: 'Có 5 người bạn',
            icon: '👥👥',
            category: 'social',
            points: 30,
            unlock_criteria: JSON.stringify({
                type: 'friend_count',
                game_type: null,
                required_count: 5
            })
        },
        {
            id: 42,
            name: 'Có 10 Bạn',
            description: 'Có 10 người bạn',
            icon: '👥👥👥',
            category: 'social',
            points: 50,
            unlock_criteria: JSON.stringify({
                type: 'friend_count',
                game_type: null,
                required_count: 10
            })
        },
        {
            id: 43,
            name: 'Ngôi Sao Xã Hội',
            description: 'Có 25 người bạn',
            icon: '⭐👥',
            category: 'social',
            points: 100,
            unlock_criteria: JSON.stringify({
                type: 'friend_count',
                game_type: null,
                required_count: 25
            })
        },
        {
            id: 44,
            name: 'Influencer',
            description: 'Có 50 người bạn',
            icon: '🌟👥',
            category: 'social',
            points: 200,
            unlock_criteria: JSON.stringify({
                type: 'friend_count',
                game_type: null,
                required_count: 50
            })
        },
        {
            id: 45,
            name: 'Nói Chuyện Đầu Tiên',
            description: 'Gửi tin nhắn đầu tiên',
            icon: '💬',
            category: 'social',
            points: 10,
            unlock_criteria: JSON.stringify({
                type: 'messages_sent',
                game_type: null,
                required_count: 1
            })
        },
        {
            id: 46,
            name: 'Người Nói Nhiều',
            description: 'Gửi 50 tin nhắn',
            icon: '💬💬',
            category: 'social',
            points: 40,
            unlock_criteria: JSON.stringify({
                type: 'messages_sent',
                game_type: null,
                required_count: 50
            })
        },
        {
            id: 47,
            name: 'Người Hay Chuyện',
            description: 'Gửi 200 tin nhắn',
            icon: '💬💬💬',
            category: 'social',
            points: 100,
            unlock_criteria: JSON.stringify({
                type: 'messages_sent',
                game_type: null,
                required_count: 200
            })
        },

        // ============================================
        // RANKING ACHIEVEMENTS
        // ============================================
        {
            id: 48,
            name: 'Top 100',
            description: 'Đạt top 100 trong bảng xếp hạng',
            icon: '📊',
            category: 'expert',
            points: 50,
            unlock_criteria: JSON.stringify({
                type: 'global_rank',
                game_type: null,
                required_count: 100
            })
        },
        {
            id: 49,
            name: 'Top 50',
            description: 'Đạt top 50 trong bảng xếp hạng',
            icon: '📊📊',
            category: 'expert',
            points: 100,
            unlock_criteria: JSON.stringify({
                type: 'global_rank',
                game_type: null,
                required_count: 50
            })
        },
        {
            id: 50,
            name: 'Top 10',
            description: 'Đạt top 10 trong bảng xếp hạng',
            icon: '🔝',
            category: 'special',
            points: 200,
            unlock_criteria: JSON.stringify({
                type: 'global_rank',
                game_type: null,
                required_count: 10
            })
        },
        {
            id: 51,
            name: 'Top 3',
            description: 'Đạt top 3 trong bảng xếp hạng',
            icon: '🥉🥈🥇',
            category: 'special',
            points: 350,
            unlock_criteria: JSON.stringify({
                type: 'global_rank',
                game_type: null,
                required_count: 3
            })
        },
        {
            id: 52,
            name: 'Số 1',
            description: 'Đạt hạng 1 trong bảng xếp hạng',
            icon: '🥇',
            category: 'special',
            points: 500,
            unlock_criteria: JSON.stringify({
                type: 'global_rank',
                game_type: null,
                required_count: 1
            })
        },

        // ============================================
        // SPECIAL ACHIEVEMENTS
        // ============================================
        {
            id: 53,
            name: 'Đa Tài',
            description: 'Thắng ít nhất 1 ván ở mỗi game',
            icon: '🎯',
            category: 'special',
            points: 150,
            unlock_criteria: JSON.stringify({
                type: 'all_games_won',
                game_type: null,
                required_count: 1
            })
        },
        {
            id: 54,
            name: 'Chiến Thần',
            description: 'Thắng ít nhất 10 ván ở mỗi game',
            icon: '⚡',
            category: 'special',
            points: 400,
            unlock_criteria: JSON.stringify({
                type: 'all_games_won',
                game_type: null,
                required_count: 10
            })
        },
        {
            id: 55,
            name: 'Hoàn Hảo',
            description: 'Hoàn thành ván không mắc lỗi',
            icon: '✨',
            category: 'special',
            points: 100,
            unlock_criteria: JSON.stringify({
                type: 'perfect_game',
                game_type: null,
                required_count: 1
            })
        },
        {
            id: 56,
            name: 'Combo 5',
            description: 'Tạo combo 5 trong Candy Crush',
            icon: '💥',
            category: 'expert',
            points: 80,
            unlock_criteria: JSON.stringify({
                type: 'combo_streak',
                game_type: 'match3',
                required_count: 5
            })
        },
        {
            id: 57,
            name: 'Lội Ngược Dòng',
            description: 'Thắng khi đang thua sát nút',
            icon: '🔄',
            category: 'special',
            points: 120,
            unlock_criteria: JSON.stringify({
                type: 'comeback_win',
                game_type: null,
                required_count: 1
            })
        },
        {
            id: 58,
            name: 'Thần Tốc',
            description: 'Thắng trong vòng 30 giây',
            icon: '⚡',
            category: 'special',
            points: 100,
            unlock_criteria: JSON.stringify({
                type: 'win_time',
                game_type: null,
                required_count: 30
            })
        },
        {
            id: 59,
            name: 'Kiên Nhẫn',
            description: 'Chơi ván kéo dài hơn 30 phút',
            icon: '⏰',
            category: 'special',
            points: 60,
            unlock_criteria: JSON.stringify({
                type: 'play_time',
                game_type: null,
                required_count: 1800
            })
        },
        {
            id: 60,
            name: 'Người Chơi Đêm',
            description: 'Chơi game sau 12 giờ đêm',
            icon: '🌙',
            category: 'special',
            points: 30,
            unlock_criteria: JSON.stringify({
                type: 'time_challenge',
                game_type: null,
                required_count: 0
            })
        },
        {
            id: 61,
            name: 'Thắng 1000 Trận',
            description: 'Giành 1000 chiến thắng',
            icon: '👑👑',
            category: 'expert',
            points: 500,
            unlock_criteria: JSON.stringify({
                type: 'total_wins',
                game_type: null,
                required_count: 1000   
            })
        },
        {
            id: 62,
            name: 'Bậc Thầy Trí Nhớ',
            description: 'Thắng 100 ván Cờ Trí Nhớ',
            icon: '🧠👑',
            category: 'special',
            points: 280,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'memory_cards',
                required_count: 100
            })
        },
        {
            id: 63,
            name: 'Thợ Kẹo',
            description: 'Thắng 50 ván Candy Crush',
            icon: '🍬🏆',
            category: 'expert',
            points: 150,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'match3',
                required_count: 50
            })
        },
        {
            id: 64,
            name: 'Thợ Kẹo',
            description: 'Thắng 100 ván Candy Crush',
            icon: '🍬🏆',
            category: 'expert',
            points: 300,
            unlock_criteria: JSON.stringify({
                type: 'game_wins',
                game_type: 'match3',
                required_count: 100
            })
        },
    ];

    // Add created_at to all
    achievements.forEach(a => {
        a.created_at = knex.fn.now();
    });

    await knex('achievements').insert(achievements);
    await knex.raw('SELECT setval(\'achievements_id_seq\', (SELECT MAX(id) FROM achievements))');
};
