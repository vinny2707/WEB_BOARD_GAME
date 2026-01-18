/**
 * Seed: Reviews
 * Tạo reviews cho 7 games từ 100 users
 * Dữ liệu trải dài 4 tháng
 */

const DATA_SPREAD_DAYS = 120;

exports.seed = async function(knex) {
    await knex('reviews').del();
    
    const reviewTemplates = {
        positive: [
            'Game tuyệt vời, chơi hoài không chán!',
            'Đồ họa đẹp, gameplay mượt mà.',
            'Rất hay, đã giới thiệu cho bạn bè.',
            'Game cổ điển nhưng vẫn rất cuốn.',
            'Chơi xả stress cực kỳ tốt!',
            'AI bot rất thông minh, thử thách.',
            'Dễ học, khó master. Thích!',
            'Giao diện đẹp, điều khiển dễ dàng.',
            'Chơi online với bạn bè rất vui.',
            'Game này gắn liền tuổi thơ tôi.',
            '5 sao không cần suy nghĩ!',
            'Đơn giản nhưng gây nghiện.',
            'Thích cách tính ELO của game.',
            'Bot hard khó thật sự, đáng chơi.',
            'Game chiến thuật hay nhất!',
        ],
        neutral: [
            'Cũng được, chơi qua thời gian.',
            'Tạm ổn, có thể cải thiện thêm.',
            'Không tệ, nhưng cũng không xuất sắc.',
            'Chơi được, nhưng hơi đơn giản.',
            'OK thôi, không có gì đặc biệt.',
            'Bình thường, cần thêm tính năng.',
            'Gameplay ổn, đồ họa cần cải thiện.',
            'Game giải trí nhẹ nhàng.',
            'Có thể chơi khi rảnh.',
            'Tạm chấp nhận được.',
        ],
        negative: [
            'Hơi nhàm chán sau một thời gian.',
            'Cần update thêm tính năng mới.',
            'Bot dễ quá, không thử thách.',
            'Đồ họa hơi cũ, cần làm mới.',
            'Còn nhiều bug cần fix.',
            'Thiếu nhiều tính năng cần thiết.',
            'Không như kỳ vọng.',
            'Game quá đơn giản.',
        ]
    };
    
    const reviews = [];
    let id = 1;
    const usedPairs = new Set(); // Đảm bảo mỗi user chỉ review mỗi game 1 lần
    
    // Tạo khoảng 20-40 reviews cho mỗi game (giảm cho 100 users)
    for (let gameId = 1; gameId <= 7; gameId++) {
        const reviewCount = 20 + Math.floor(Math.random() * 25); // 20-45 reviews per game
        
        for (let i = 0; i < reviewCount; i++) {
            // Random user từ 1-100
            const userId = Math.floor(Math.random() * 100) + 1;
            const pairKey = `${userId}-${gameId}`;
            
            if (usedPairs.has(pairKey)) continue;
            usedPairs.add(pairKey);
            
            // Phân bố rating: 60% positive (4-5), 25% neutral (3), 15% negative (1-2)
            const rand = Math.random();
            let rating, comment;
            
            if (rand < 0.35) {
                rating = 5;
                comment = reviewTemplates.positive[Math.floor(Math.random() * reviewTemplates.positive.length)];
            } else if (rand < 0.60) {
                rating = 4;
                comment = reviewTemplates.positive[Math.floor(Math.random() * reviewTemplates.positive.length)];
            } else if (rand < 0.85) {
                rating = 3;
                comment = reviewTemplates.neutral[Math.floor(Math.random() * reviewTemplates.neutral.length)];
            } else if (rand < 0.95) {
                rating = 2;
                comment = reviewTemplates.negative[Math.floor(Math.random() * reviewTemplates.negative.length)];
            } else {
                rating = 1;
                comment = reviewTemplates.negative[Math.floor(Math.random() * reviewTemplates.negative.length)];
            }
            
            // 20% reviews không có comment
            if (Math.random() < 0.2) {
                comment = null;
            }
            
            // Trải dữ liệu trong 4 tháng
            const daysAgo = Math.floor(Math.random() * DATA_SPREAD_DAYS) + 1;
            
            reviews.push({
                id: id++,
                game_id: gameId,
                user_id: userId,
                rating: rating,
                comment: comment,
                created_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`),
                updated_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`)
            });
        }
    }
    
    // Đảm bảo team members có reviews
    const teamReviews = [
        // Admin (user 1)
        { user_id: 1, game_id: 1, rating: 5, comment: 'Game tuyệt vời từ team phát triển!' },
        { user_id: 1, game_id: 4, rating: 5, comment: 'Rắn săn mồi - cổ điển không bao giờ lỗi mốt!' },
        
        // Trần Quốc Vy (user 2)
        { user_id: 2, game_id: 1, rating: 5, comment: 'Caro 5 - game chiến thuật kinh điển!' },
        { user_id: 2, game_id: 2, rating: 4, comment: 'Caro 4 nhanh hơn, phù hợp chơi nhanh.' },
        { user_id: 2, game_id: 5, rating: 5, comment: 'Candy Crush phiên bản tự làm, rất đã!' },
        
        // Nguyễn Duy Khang (user 3)
        { user_id: 3, game_id: 3, rating: 4, comment: 'Tic-tac-toe đơn giản nhưng hay.' },
        { user_id: 3, game_id: 6, rating: 5, comment: 'Memory cards giúp rèn luyện trí nhớ!' },
        { user_id: 3, game_id: 7, rating: 5, comment: 'Drawing board sáng tạo, thích vẽ!' },
        
        // Phạm Bình Minh (user 4)
        { user_id: 4, game_id: 1, rating: 5, comment: 'Hệ thống ELO tính rất chuẩn!' },
        { user_id: 4, game_id: 4, rating: 4, comment: 'Snake game hoài niệm tuổi thơ.' },
        { user_id: 4, game_id: 5, rating: 5, comment: 'Match 3 gây nghiện kinh khủng!' },
    ];
    
    for (const tr of teamReviews) {
        const pairKey = `${tr.user_id}-${tr.game_id}`;
        if (!usedPairs.has(pairKey)) {
            const daysAgo = Math.floor(Math.random() * DATA_SPREAD_DAYS) + 1;
            reviews.push({
                id: id++,
                game_id: tr.game_id,
                user_id: tr.user_id,
                rating: tr.rating,
                comment: tr.comment,
                created_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`),
                updated_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`)
            });
        }
    }
    
    // Insert theo batch
    const batchSize = 200;
    for (let i = 0; i < reviews.length; i += batchSize) {
        const batch = reviews.slice(i, i + batchSize);
        await knex('reviews').insert(batch);
    }
    
    await knex.raw('SELECT setval(\'reviews_id_seq\', (SELECT MAX(id) FROM reviews))');
};
