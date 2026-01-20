const db = require('../config/database');

/**
 * Message Model
 * Handles all database operations for 1-1 messaging
 */

class Message {
    /**
     * Send a message to another user
     * @param {number} senderId 
     * @param {number} receiverId 
     * @param {string} content 
     * @returns {Promise<Object>}
     */
    static async create(senderId, receiverId, content) {
        const [message] = await db('messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content,
                is_read: false,
                sent_at: db.fn.now()
            })
            .returning('*');

        return message;
    }

    /**
     * Get inbox - list of conversations with latest message
     * @param {number} userId 
     * @param {Object} options - { page, limit }
     * @returns {Promise<Object>} - { data, pagination }
     */
    static async getInbox(userId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        // Get list of users with messages and their latest message
        const conversations = await db.raw(`
            WITH conversation_users AS (
                SELECT DISTINCT
                    CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                    END as other_user_id
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
            ),
            latest_messages AS (
                SELECT 
                    cu.other_user_id,
                    m.id,
                    m.sender_id,
                    m.receiver_id,
                    m.content,
                    m.is_read,
                    m.sent_at,
                    ROW_NUMBER() OVER (PARTITION BY cu.other_user_id ORDER BY m.sent_at DESC) as rn
                FROM conversation_users cu
                JOIN messages m ON (
                    (m.sender_id = ? AND m.receiver_id = cu.other_user_id) OR
                    (m.receiver_id = ? AND m.sender_id = cu.other_user_id)
                )
            ),
            unread_counts AS (
                SELECT 
                    sender_id as other_user_id,
                    COUNT(*) as unread_count
                FROM messages
                WHERE receiver_id = ? AND is_read = false
                GROUP BY sender_id
            )
            SELECT 
                lm.other_user_id,
                lm.content as last_message_content,
                lm.sent_at as last_message_at,
                lm.sender_id = ? as is_from_me,
                COALESCE(uc.unread_count, 0) as unread_count,
                u.username,
                u.full_name,
                u.email,
                i.url as avatar_url
            FROM latest_messages lm
            LEFT JOIN unread_counts uc ON lm.other_user_id = uc.other_user_id
            JOIN users u ON lm.other_user_id = u.id
            LEFT JOIN images i ON u.avatar_id = i.id
            WHERE lm.rn = 1
            ORDER BY lm.sent_at DESC
            LIMIT ? OFFSET ?
        `, [userId, userId, userId, userId, userId, userId, userId, limit, offset]);

        // Get total count
        const countResult = await db.raw(`
            SELECT COUNT(DISTINCT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END
            ) as count
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
        `, [userId, userId, userId]);

        const total = parseInt(countResult.rows[0].count);

        const data = conversations.rows.map(row => ({
            user: {
                id: row.other_user_id,
                username: row.username,
                full_name: row.full_name,
                email: row.email,
                avatar_url: row.avatar_url || null
            },
            last_message: {
                content: row.last_message_content,
                sent_at: row.last_message_at,
                is_from_me: row.is_from_me
            },
            unread_count: parseInt(row.unread_count)
        }));

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get conversation with a specific user
     * @param {number} userId 
     * @param {number} otherUserId 
     * @param {Object} options - { page, limit }
     * @returns {Promise<Object>} - { data, pagination }
     */
    static async getConversation(userId, otherUserId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const offset = (page - 1) * limit;

        // Get total count
        const [{ count }] = await db('messages')
            .where(function () {
                this.where({ sender_id: userId, receiver_id: otherUserId })
                    .orWhere({ sender_id: otherUserId, receiver_id: userId });
            })
            .count('* as count');

        const total = parseInt(count);

        // Get messages
        const messages = await db('messages as m')
            .leftJoin('users as sender', 'm.sender_id', 'sender.id')
            .leftJoin('users as receiver', 'm.receiver_id', 'receiver.id')
            .leftJoin('images as sender_avatar', 'sender.avatar_id', 'sender_avatar.id')
            .leftJoin('images as receiver_avatar', 'receiver.avatar_id', 'receiver_avatar.id')
            .where(function () {
                this.where({ 'm.sender_id': userId, 'm.receiver_id': otherUserId })
                    .orWhere({ 'm.sender_id': otherUserId, 'm.receiver_id': userId });
            })
            .select(
                'm.id',
                'm.sender_id',
                'm.receiver_id',
                'm.content',
                'm.is_read',
                'm.sent_at',
                'm.read_at',
                'sender.username as sender_username',
                'sender.full_name as sender_full_name',
                'sender_avatar.url as sender_avatar_url',
                'receiver.username as receiver_username',
                'receiver.full_name as receiver_full_name',
                'receiver_avatar.url as receiver_avatar_url'
            )
            .orderBy('m.sent_at', 'desc')
            .limit(limit)
            .offset(offset);

        const data = messages.map(m => ({
            id: m.id,
            sender: {
                id: m.sender_id,
                username: m.sender_username || '[Deleted]',
                full_name: m.sender_full_name || 'Deleted User',
                avatar_url: m.sender_avatar_url || null
            },
            receiver: {
                id: m.receiver_id,
                username: m.receiver_username || '[Deleted]',
                full_name: m.receiver_full_name || 'Deleted User',
                avatar_url: m.receiver_avatar_url || null
            },
            content: m.content,
            is_read: m.is_read,
            sent_at: m.sent_at,
            read_at: m.read_at,
            is_from_me: m.sender_id === userId
        }));

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Mark all messages from a user as read
     * @param {number} userId - Current user (receiver)
     * @param {number} otherUserId - Sender
     * @returns {Promise<number>} - Number of messages marked as read
     */
    static async markAsRead(userId, otherUserId) {
        const count = await db('messages')
            .where({
                sender_id: otherUserId,
                receiver_id: userId,
                is_read: false
            })
            .update({
                is_read: true,
                read_at: db.fn.now()
            });

        return count;
    }

    /**
     * Delete a message (only sender can delete)
     * @param {number} messageId 
     * @param {number} userId - Must be sender
     * @returns {Promise<boolean>}
     */
    static async deleteById(messageId, userId) {
        const count = await db('messages')
            .where({
                id: messageId,
                sender_id: userId
            })
            .del();

        return count > 0;
    }

    /**
     * Get total unread message count for user
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static async getUnreadCount(userId) {
        const [{ count }] = await db('messages')
            .where({
                receiver_id: userId,
                is_read: false
            })
            .count('* as count');

        return parseInt(count);
    }

    /**
     * Find message by ID
     * @param {number} messageId 
     * @returns {Promise<Object|null>}
     */
    static async findById(messageId) {
        return await db('messages')
            .where({ id: messageId })
            .first();
    }
}

module.exports = Message;
