/**
 * Seed: Reviews
 * Creates sample reviews for games from existing users
 */

exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('reviews').del();

    // Insert reviews
    // Users: 1-12 (1 is admin, 2-12 are users)
    // Games: 1-7
    await knex('reviews').insert([
        // Caro Hàng 5 (Game ID: 1)
        {
            game_id: 1,
            user_id: 2, // john_doe
            rating: 5,
            comment: 'Game kinh điển, rất vui!',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            game_id: 1,
            user_id: 3, // jane_smith
            rating: 4,
            comment: 'Luật chơi đơn giản, dễ nghiện.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            game_id: 1,
            user_id: 4, // mike_wilson
            rating: 3, // Average
            comment: 'Cũng được, nhưng thích bản Hàng 4 hơn vì nhanh hơn.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },

        // Caro Hàng 4 (Game ID: 2)
        {
            game_id: 2,
            user_id: 2, // john_doe
            rating: 4,
            comment: 'Nhanh hơn bản gốc, chơi xả stress tốt.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            game_id: 2,
            user_id: 5, // sarah_jones
            rating: 5,
            comment: 'My favorite game!',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },

        // Tic-Tac-Toe (Game ID: 3)
        {
            game_id: 3,
            user_id: 6, // david_brown
            rating: 2, // Low rating
            comment: 'Hơi chán, dễ hòa quá.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            game_id: 3,
            user_id: 7, // emily_davis
            rating: 3,
            comment: null, // No comment
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },

        // Rắn Săn Mồi (Game ID: 4)
        {
            game_id: 4,
            user_id: 8, // robert_miller
            rating: 5,
            comment: 'Tuổi thơ ùa về! Giao diện đẹp.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            game_id: 4,
            user_id: 9, // lisa_garcia
            rating: 4,
            comment: 'Khó điều khiển trên điện thoại xíu, nhưng vẫn vui.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            game_id: 4,
            user_id: 3, // jane_smith
            rating: 5,
            comment: 'Rất hay!',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },

        // Ghép Hàng 3 (Game ID: 5)
        {
            game_id: 5,
            user_id: 10, // chris_martinez
            rating: 5,
            comment: 'Hiệu ứng đẹp mắt, chơi rất cuốn.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            game_id: 5,
            user_id: 2, // john_doe
            rating: 4,
            comment: null,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },

        // Cờ Trí Nhớ (Game ID: 6)
        {
            game_id: 6,
            user_id: 5, // sarah_jones
            rating: 3,
            comment: 'Cần thêm nhiều chủ đề hình ảnh hơn.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },

        // Bảng Vẽ Tự Do (Game ID: 7)
        {
            game_id: 7,
            user_id: 3, // jane_smith
            rating: 5,
            comment: 'Tuyệt vời để chơi với bạn bè!',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            game_id: 7,
            user_id: 4, // mike_wilson
            rating: 4,
            comment: 'Nên thêm tính năng lưu ảnh về máy.',
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }
    ]);
};
