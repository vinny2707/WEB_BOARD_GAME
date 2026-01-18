/**
 * Seed: Messages
 * Tạo tin nhắn giữa các users
 * Dữ liệu trải dài 4 tháng
 */

const DATA_SPREAD_DAYS = 120;

// Mẫu tin nhắn tiếng Việt
const MESSAGE_TEMPLATES = [
    // Chào hỏi
    'Chào bạn! 👋',
    'Hello, khỏe không?',
    'Hi bro!',
    'Hôm nay thế nào?',
    'Lâu quá không gặp!',
    'Mình đang online nè',

    // Khen ngợi & Phản ứng game
    'Ván đó hay quá!',
    'GG! Bạn chơi giỏi lắm 🎮',
    'Haha, thua rồi 😅',
    'Lần sau tôi sẽ thắng!',
    'Wow, rank cao quá!',
    'Tuyệt vời! 🔥',
    'Ván này khó quá',
    'Good game! 👍',
    'Bạn chơi game nào giỏi nhất?',
    'Đánh hay quá, không đỡ kịp!',
    'Cao thủ đây rồi 😱',
    'May mắn thôi mà haha',

    // Rủ chơi game
    'Chơi lại không?',
    'Bạn có muốn chơi Caro không?',
    'Làm ván nữa nhé?',
    'Solo Rắn săn mồi đi!',
    'Vào room mình chơi này',
    'Có rảnh không, chơi vài ván?',
    'Đang tìm người chơi cùng, vào không?',
    'Lần tới nhớ rủ mình nhé',

    // Bàn luận & Hỏi han
    'Dạy mình chơi với 🙏',
    'Cảm ơn bạn nhé!',
    'Mình thích Candy Crush nhất',
    'Rắn săn mồi vui lắm!',
    'Cờ trí nhớ khó quá 🧠',
    'Bạn mới lên rank hả?',
    'Chúc mừng bạn!',
    'Mình mới unlock achievement',
    'Có tips gì không?',
    'Làm sao để thắng màn đó vậy?',
    'Leo rank mệt quá',
    'Hôm qua chơi đến mấy giờ thế?',
    'Game này update mới hay phết',
    'Hẹn gặp lại tối nay nha!',
    'Chơi cùng nhau nhé'
];

exports.seed = async function (knex) {
    await knex('messages').del();

    // Lấy danh sách friends đã accepted để gửi tin nhắn
    const acceptedFriends = await knex('friends')
        .where({ status: 'accepted' })
        .select('user_id', 'friend_id');

    const messages = [];
    let id = 1;

    // Mỗi cặp bạn bè có 15-30 tin nhắn
    for (const friendship of acceptedFriends) {
        const numMessages = 15 + ((friendship.user_id + friendship.friend_id) % 16);

        for (let m = 0; m < numMessages; m++) {
            // Xen kẽ người gửi
            const senderId = m % 2 === 0 ? friendship.user_id : friendship.friend_id;
            const receiverId = m % 2 === 0 ? friendship.friend_id : friendship.user_id;

            const messageIndex = (friendship.user_id + friendship.friend_id + m) % MESSAGE_TEMPLATES.length;
            // Trải dữ liệu trong 4 tháng
            const daysAgo = Math.floor(((friendship.user_id + m) / 150) * DATA_SPREAD_DAYS) + 1;
            const minutesOffset = m * 5;

            // 80% tin nhắn đã đọc
            const isRead = (friendship.user_id + m) % 5 !== 0;

            messages.push({
                id: id++,
                sender_id: senderId,
                receiver_id: receiverId,
                content: MESSAGE_TEMPLATES[messageIndex],
                is_read: isRead,
                sent_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days' + INTERVAL '${minutesOffset} minutes'`),
                read_at: isRead ? knex.raw(`NOW() - INTERVAL '${daysAgo} days' + INTERVAL '${minutesOffset + 10} minutes'`) : null
            });
        }
    }

    // Giới hạn số lượng messages (tăng lên cho 120 users với nhiều tin nhắn hơn)
    const limitedMessages = messages.slice(0, 20000);

    // Insert theo batch
    const batchSize = 500;
    for (let i = 0; i < limitedMessages.length; i += batchSize) {
        const batch = limitedMessages.slice(i, i + batchSize);
        await knex('messages').insert(batch);
    }

    await knex.raw('SELECT setval(\'messages_id_seq\', (SELECT MAX(id) FROM messages))');
};
