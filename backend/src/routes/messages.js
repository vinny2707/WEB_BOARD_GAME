const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: 1-1 messaging between users
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message to another user
 *     tags: [Messages]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - content
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 description: ID of the message receiver
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input or cannot send to self
 *       404:
 *         description: Receiver not found
 */
router.post('/', authenticateJWT, messageController.sendMessage);

/**
 * @swagger
 * /api/messages/inbox:
 *   get:
 *     summary: Get inbox - list of conversations with latest message
 *     tags: [Messages]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Inbox retrieved with pagination
 */
router.get('/inbox', authenticateJWT, messageController.getInbox);

/**
 * @swagger
 * /api/messages/unread-count:
 *   get:
 *     summary: Get total unread message count
 *     tags: [Messages]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 */
router.get('/unread-count', authenticateJWT, messageController.getUnreadCount);

/**
 * @swagger
 * /api/messages/conversation/{otherUserId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the other user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Conversation retrieved with pagination
 *       400:
 *         description: Cannot view conversation with self
 *       404:
 *         description: User not found
 */
router.get('/conversation/:otherUserId', authenticateJWT, messageController.getConversation);

/**
 * @swagger
 * /api/messages/conversation/{otherUserId}/read:
 *   put:
 *     summary: Mark all messages from a user as read
 *     tags: [Messages]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the other user
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       404:
 *         description: User not found
 */
router.put('/conversation/:otherUserId/read', authenticateJWT, messageController.markAsRead);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Delete a message (only sender can delete)
 *     tags: [Messages]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       403:
 *         description: Can only delete own messages
 *       404:
 *         description: Message not found
 */
router.delete('/:messageId', authenticateJWT, messageController.deleteMessage);

module.exports = router;
