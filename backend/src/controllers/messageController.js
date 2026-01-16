const Message = require('../models/Message');
const User = require('../models/User');
const { success, error } = require('../utils/response');

/**
 * Message Controller
 * Handles HTTP requests for messaging
 */

/**
 * Send a message to another user
 */
const sendMessage = async (req, res, next) => {
    try {
        const { receiver_id, content } = req.body;
        const senderId = req.user.id;

        // Validation
        if (!receiver_id || !content) {
            return error(res, 'receiver_id and content are required', 400);
        }

        if (receiver_id === senderId) {
            return error(res, 'Cannot send message to yourself', 400);
        }

        if (content.length > 5000) {
            return error(res, 'Message content too long (max 5000 characters)', 400);
        }

        // Check if receiver exists
        const receiver = await User.findById(receiver_id);
        if (!receiver) {
            return error(res, 'Receiver not found', 404);
        }

        // Create message
        const message = await Message.create(senderId, receiver_id, content);

        return success(res, message, 'Message sent successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Get inbox - list of conversations
 */
const getInbox = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page, limit } = req.query;

        const result = await Message.getInbox(userId, { page, limit });

        return success(res, result.data, 'Inbox retrieved successfully', 200, result.pagination);
    } catch (err) {
        next(err);
    }
};

/**
 * Get conversation with a specific user
 */
const getConversation = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;
        const { page, limit } = req.query;

        // Validation
        if (parseInt(otherUserId) === userId) {
            return error(res, 'Cannot view conversation with yourself', 400);
        }

        // Check if other user exists
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) {
            return error(res, 'User not found', 404);
        }

        const result = await Message.getConversation(userId, otherUserId, { page, limit });

        return success(res, result.data, 'Conversation retrieved successfully', 200, result.pagination);
    } catch (err) {
        next(err);
    }
};

/**
 * Mark all messages from a user as read
 */
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        // Validation
        if (parseInt(otherUserId) === userId) {
            return error(res, 'Invalid operation', 400);
        }

        // Check if other user exists
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) {
            return error(res, 'User not found', 404);
        }

        const count = await Message.markAsRead(userId, otherUserId);

        return success(res, { marked_count: count }, `${count} message(s) marked as read`);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a message (only sender can delete)
 */
const deleteMessage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { messageId } = req.params;

        // Check if message exists
        const message = await Message.findById(messageId);
        if (!message) {
            return error(res, 'Message not found', 404);
        }

        // Check if user is the sender
        if (message.sender_id !== userId) {
            return error(res, 'You can only delete your own messages', 403);
        }

        await Message.deleteById(messageId, userId);

        return success(res, null, 'Message deleted successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get unread message count
 */
const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const count = await Message.getUnreadCount(userId);

        return success(res, { unread_count: count }, 'Unread count retrieved successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    sendMessage,
    getInbox,
    getConversation,
    markAsRead,
    deleteMessage,
    getUnreadCount
};
