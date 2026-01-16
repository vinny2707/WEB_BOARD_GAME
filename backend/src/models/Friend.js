const db = require('../config/database');

/**
 * Friend Model
 * Handles all database operations related to friend relationships
 * Note: Relationships are unidirectional in DB, but queries handle bidirectional logic
 */

class Friend {
    /**
     * Get user's friends (bidirectional) with pagination
     * @param {number} userId 
     * @param {Object} options - { status, page, limit }
     * @returns {Promise<Object>} - { data, pagination }
     */
    static async getFriends(userId, options = {}) {
        const status = options.status || 'accepted';
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        // Get total count
        const [{ count }] = await db('friends')
            .where(function () {
                this.where('user_id', userId)
                    .orWhere('friend_id', userId);
            })
            .andWhere('status', status)
            .count('* as count');

        const total = parseInt(count);

        // Query both directions with pagination
        const friends = await db('friends')
            .where(function () {
                this.where('user_id', userId)
                    .orWhere('friend_id', userId);
            })
            .andWhere('status', status)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset)
            .select('*');

        // Map to get the friend's user info
        const friendIds = friends.map(f =>
            f.user_id === userId ? f.friend_id : f.user_id
        );

        if (friendIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }

        // Get user details
        const users = await db('users')
            .whereIn('id', friendIds)
            .select('id', 'username', 'full_name', 'email', 'status');

        // Combine with friendship data
        const data = friends.map(f => {
            const friendId = f.user_id === userId ? f.friend_id : f.user_id;
            const user = users.find(u => u.id === friendId);
            return {
                friendship_id: f.id,
                friend: user,
                status: f.status,
                created_at: f.created_at,
                updated_at: f.updated_at
            };
        });

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
     * Get incoming friend requests with pagination
     * @param {number} userId 
     * @param {Object} options - { page, limit }
     * @returns {Promise<Object>} - { data, pagination }
     */
    static async getPendingRequests(userId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        // Get total count
        const [{ count }] = await db('friends')
            .where('friend_id', userId)
            .andWhere('status', 'pending')
            .count('* as count');

        const total = parseInt(count);

        // Get requests with pagination
        const requests = await db('friends')
            .join('users', 'friends.user_id', 'users.id')
            .where('friends.friend_id', userId)
            .andWhere('friends.status', 'pending')
            .orderBy('friends.created_at', 'desc')
            .limit(limit)
            .offset(offset)
            .select(
                'friends.id as friendship_id',
                'friends.user_id as requester_id',
                'users.username',
                'users.full_name',
                'users.email',
                'friends.created_at'
            );

        const data = requests.map(r => ({
            friendship_id: r.friendship_id,
            requester: {
                id: r.requester_id,
                username: r.username,
                full_name: r.full_name,
                email: r.email
            },
            created_at: r.created_at
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
     * Get outgoing friend requests with pagination
     * @param {number} userId 
     * @param {Object} options - { page, limit }
     * @returns {Promise<Object>} - { data, pagination }
     */
    static async getSentRequests(userId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        // Get total count
        const [{ count }] = await db('friends')
            .where('user_id', userId)
            .andWhere('status', 'pending')
            .count('* as count');

        const total = parseInt(count);

        // Get requests with pagination
        const requests = await db('friends')
            .join('users', 'friends.friend_id', 'users.id')
            .where('friends.user_id', userId)
            .andWhere('friends.status', 'pending')
            .orderBy('friends.created_at', 'desc')
            .limit(limit)
            .offset(offset)
            .select(
                'friends.id as friendship_id',
                'friends.friend_id',
                'users.username',
                'users.full_name',
                'users.email',
                'friends.created_at'
            );

        const data = requests.map(r => ({
            friendship_id: r.friendship_id,
            recipient: {
                id: r.friend_id,
                username: r.username,
                full_name: r.full_name,
                email: r.email
            },
            created_at: r.created_at
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
     * Check friendship status between two users (bidirectional)
     * @param {number} userId 
     * @param {number} friendId 
     * @returns {Promise<Object|null>}
     */
    static async checkFriendship(userId, friendId) {
        return db('friends')
            .where(function () {
                this.where({ user_id: userId, friend_id: friendId })
                    .orWhere({ user_id: friendId, friend_id: userId });
            })
            .first();
    }

    /**
     * Send friend request
     * @param {number} userId 
     * @param {number} friendId 
     * @returns {Promise<Object>}
     */
    static async sendRequest(userId, friendId) {
        const [request] = await db('friends')
            .insert({
                user_id: userId,
                friend_id: friendId,
                status: 'pending'
            })
            .returning('*');
        return request;
    }

    /**
     * Accept friend request
     * @param {number} userId - User accepting the request
     * @param {number} requesterId - User who sent the request
     * @returns {Promise<Object>}
     */
    static async acceptRequest(userId, requesterId) {
        const [updated] = await db('friends')
            .where({ user_id: requesterId, friend_id: userId, status: 'pending' })
            .update({
                status: 'accepted',
                updated_at: db.fn.now()
            })
            .returning('*');
        return updated;
    }

    /**
     * Reject friend request (DELETE instead of UPDATE)
     * @param {number} userId 
     * @param {number} requesterId 
     * @returns {Promise<boolean>}
     */
    static async rejectRequest(userId, requesterId) {
        const deleted = await db('friends')
            .where({ user_id: requesterId, friend_id: userId, status: 'pending' })
            .del();
        return deleted > 0;
    }

    /**
     * Unfriend (delete friendship - bidirectional)
     * @param {number} userId 
     * @param {number} friendId 
     * @returns {Promise<boolean>}
     */
    static async unfriend(userId, friendId) {
        const deleted = await db('friends')
            .where(function () {
                this.where({ user_id: userId, friend_id: friendId })
                    .orWhere({ user_id: friendId, friend_id: userId });
            })
            .andWhere('status', 'accepted')
            .del();
        return deleted > 0;
    }

    /**
     * Block user
     * @param {number} userId 
     * @param {number} targetId 
     * @returns {Promise<Object>}
     */
    static async blockUser(userId, targetId) {
        // Check if relationship exists
        const existing = await this.checkFriendship(userId, targetId);

        if (existing) {
            // Update existing relationship
            const [blocked] = await db('friends')
                .where('id', existing.id)
                .update({
                    user_id: userId,
                    friend_id: targetId,
                    status: 'blocked',
                    updated_at: db.fn.now()
                })
                .returning('*');
            return blocked;
        } else {
            // Create new blocked relationship
            const [blocked] = await db('friends')
                .insert({
                    user_id: userId,
                    friend_id: targetId,
                    status: 'blocked'
                })
                .returning('*');
            return blocked;
        }
    }

    /**
     * Cancel sent request
     * @param {number} userId 
     * @param {number} friendId 
     * @returns {Promise<boolean>}
     */
    static async cancelRequest(userId, friendId) {
        const deleted = await db('friends')
            .where({ user_id: userId, friend_id: friendId, status: 'pending' })
            .del();
        return deleted > 0;
    }

    /**
     * Unblock user
     * @param {number} userId 
     * @param {number} targetId 
     * @returns {Promise<boolean>}
     */
    static async unblockUser(userId, targetId) {
        const deleted = await db('friends')
            .where({ user_id: userId, friend_id: targetId, status: 'blocked' })
            .del();
        return deleted > 0;
    }
}

module.exports = Friend;
