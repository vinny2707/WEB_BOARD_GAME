const Friend = require('../models/Friend');
const User = require('../models/User');
const { success, error } = require('../utils/response');

/**
 * Friend Controller
 * Handles HTTP requests for friend relationships
 */

/**
 * Get user's friends list
 */
const getFriends = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const friends = await Friend.getFriends(userId, status || 'accepted');

        return success(res, friends, 'Friends retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get incoming friend requests
 */
const getPendingRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const requests = await Friend.getPendingRequests(userId);

        return success(res, requests, 'Pending requests retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get outgoing friend requests
 */
const getSentRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const requests = await Friend.getSentRequests(userId);

        return success(res, requests, 'Sent requests retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Send friend request
 */
const sendFriendRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.body;

        // Validate input
        if (!friendId) {
            return error(res, 'friendId is required', 400);
        }

        // Check if trying to add self
        if (userId === parseInt(friendId)) {
            return error(res, 'Cannot send friend request to yourself', 400);
        }

        // Check if target user exists
        const targetUser = await User.findById(friendId);
        if (!targetUser) {
            return error(res, 'User not found', 404);
        }

        // Check if friendship already exists
        const existing = await Friend.checkFriendship(userId, friendId);
        if (existing) {
            if (existing.status === 'accepted') {
                return error(res, 'Already friends', 409);
            } else if (existing.status === 'pending') {
                return error(res, 'Friend request already sent', 409);
            } else if (existing.status === 'blocked') {
                return error(res, 'Cannot send request to blocked user', 403);
            }
        }

        // Send request
        const request = await Friend.sendRequest(userId, friendId);

        return success(res, request, 'Friend request sent successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Accept friend request
 */
const acceptFriendRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { requesterId } = req.params;

        // Check if request exists
        const existing = await Friend.checkFriendship(requesterId, userId);
        if (!existing) {
            return error(res, 'Friend request not found', 404);
        }

        if (existing.status !== 'pending') {
            return error(res, 'Request is not pending', 400);
        }

        // Make sure current user is the recipient
        if (existing.friend_id !== userId) {
            return error(res, 'Not authorized to accept this request', 403);
        }

        // Accept request
        const accepted = await Friend.acceptRequest(userId, requesterId);

        return success(res, accepted, 'Friend request accepted');
    } catch (err) {
        next(err);
    }
};

/**
 * Reject friend request
 */
const rejectFriendRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { requesterId } = req.params;

        // Check if request exists
        const existing = await Friend.checkFriendship(requesterId, userId);
        if (!existing) {
            return error(res, 'Friend request not found', 404);
        }

        if (existing.status !== 'pending') {
            return error(res, 'Request is not pending', 400);
        }

        // Make sure current user is the recipient
        if (existing.friend_id !== userId) {
            return error(res, 'Not authorized to reject this request', 403);
        }

        // Reject request (DELETE)
        const rejected = await Friend.rejectRequest(userId, requesterId);

        if (!rejected) {
            return error(res, 'Failed to reject request', 500);
        }

        return success(res, null, 'Friend request rejected');
    } catch (err) {
        next(err);
    }
};

/**
 * Cancel sent friend request
 */
const cancelFriendRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.params;

        const cancelled = await Friend.cancelRequest(userId, friendId);

        if (!cancelled) {
            return error(res, 'Request not found or already processed', 404);
        }

        return success(res, null, 'Friend request cancelled');
    } catch (err) {
        next(err);
    }
};

/**
 * Unfriend
 */
const unfriend = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.params;

        const removed = await Friend.unfriend(userId, friendId);

        if (!removed) {
            return error(res, 'Friendship not found', 404);
        }

        return success(res, null, 'Friend removed successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Block user
 */
const blockUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { userId: targetId } = req.params;

        // Check if trying to block self
        if (userId === parseInt(targetId)) {
            return error(res, 'Cannot block yourself', 400);
        }

        // Check if target user exists
        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            return error(res, 'User not found', 404);
        }

        const blocked = await Friend.blockUser(userId, targetId);

        return success(res, blocked, 'User blocked successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getFriends,
    getPendingRequests,
    getSentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    unfriend,
    blockUser
};
