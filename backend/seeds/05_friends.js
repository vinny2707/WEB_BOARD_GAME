/**
 * Seed: Friends
 * Tạo mối quan hệ bạn bè giữa 100 users
 * Mỗi user có khoảng 3-10 bạn
 * Status: 'pending', 'accepted', 'blocked'
 * Dữ liệu trải dài 4 tháng
 */

const STATUSES = ['accepted', 'pending', 'blocked'];
const DATA_SPREAD_DAYS = 120;

exports.seed = async function (knex) {
    await knex('friends').del();

    const friends = [];
    const existingPairs = new Set(); // Tránh duplicate
    let id = 1;

    // Mỗi user gửi yêu cầu kết bạn cho 2-8 người khác
    for (let userId = 1; userId <= 120; userId++) {
        // Số lượng bạn dựa trên userId
        const numFriends = 2 + (userId % 7);

        for (let f = 0; f < numFriends; f++) {
            // Chọn friend_id ngẫu nhiên nhưng deterministic
            let friendId = ((userId * 7 + f * 13) % 99) + 1;

            // Không tự kết bạn với chính mình
            if (friendId === userId) friendId = (friendId % 100) + 1;
            if (friendId === userId) continue;

            // Tạo pair key để check duplicate
            const pairKey = userId < friendId
                ? `${userId}-${friendId}`
                : `${friendId}-${userId}`;

            if (existingPairs.has(pairKey)) continue;
            existingPairs.add(pairKey);

            // Status: phần lớn là accepted (rejected không còn trong DB)
            let status;
            const statusSeed = (userId + f) % 100;
            if (statusSeed < 80) status = 'accepted';      // 80% accepted
            else if (statusSeed < 97) status = 'pending';  // 17% pending
            else status = 'blocked';                        // 3% blocked

            // Trải dữ liệu trong 4 tháng
            const daysAgo = Math.floor(((userId + f) / 150) * DATA_SPREAD_DAYS) + 1;

            friends.push({
                id: id++,
                user_id: userId,
                friend_id: friendId,
                status: status,
                created_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`),
                updated_at: knex.raw(`NOW() - INTERVAL '${Math.max(1, daysAgo - 1)} days'`)
            });
        }
    }

    // Team members là bạn của nhau (user 1-4)
    const teamMembers = [1, 2, 3, 4];
    for (let i = 0; i < teamMembers.length; i++) {
        for (let j = i + 1; j < teamMembers.length; j++) {
            const pairKey = `${teamMembers[i]}-${teamMembers[j]}`;
            if (!existingPairs.has(pairKey)) {
                existingPairs.add(pairKey);
                friends.push({
                    id: id++,
                    user_id: teamMembers[i],
                    friend_id: teamMembers[j],
                    status: 'accepted',
                    created_at: knex.raw(`NOW() - INTERVAL '${DATA_SPREAD_DAYS} days'`),
                    updated_at: knex.raw(`NOW() - INTERVAL '${DATA_SPREAD_DAYS} days'`)
                });
            }
        }
    }

    // Insert theo batch
    const batchSize = 500;
    for (let i = 0; i < friends.length; i += batchSize) {
        const batch = friends.slice(i, i + batchSize);
        await knex('friends').insert(batch);
    }

    await knex.raw('SELECT setval(\'friends_id_seq\', (SELECT MAX(id) FROM friends))');
};
