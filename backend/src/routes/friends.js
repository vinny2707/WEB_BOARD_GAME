const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend relationship management
 */

// All friend routes require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: Get user's friends list
 *     tags: [Friends]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [accepted, pending, blocked]
 *           default: accepted
 *         description: Filter by friendship status
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
 *         description: Friends list retrieved with pagination
 */
router.get('/', friendController.getFriends);

/**
 * @swagger
 * /api/friends/requests/pending:
 *   get:
 *     summary: Get incoming friend requests
 *     tags: [Friends]
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
 *         description: Pending requests retrieved with pagination
 */
router.get('/requests/pending', friendController.getPendingRequests);

/**
 * @swagger
 * /api/friends/requests/sent:
 *   get:
 *     summary: Get outgoing friend requests
 *     tags: [Friends]
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
 *         description: Sent requests retrieved with pagination
 */
router.get('/requests/sent', friendController.getSentRequests);

/**
 * @swagger
 * /api/friends/request:
 *   post:
 *     summary: Send friend request
 *     tags: [Friends]
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
 *               - friendId
 *             properties:
 *               friendId:
 *                 type: integer
 *                 description: ID of user to send request to
 *     responses:
 *       201:
 *         description: Friend request sent
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Request already exists
 */
router.post('/request', friendController.sendFriendRequest);

/**
 * @swagger
 * /api/friends/{requesterId}/accept:
 *   put:
 *     summary: Accept friend request
 *     tags: [Friends]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requesterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of user who sent the request
 *     responses:
 *       200:
 *         description: Request accepted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Request not found
 */
router.put('/:requesterId/accept', friendController.acceptFriendRequest);

/**
 * @swagger
 * /api/friends/{requesterId}/reject:
 *   put:
 *     summary: Reject friend request
 *     tags: [Friends]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requesterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of user who sent the request
 *     responses:
 *       200:
 *         description: Request rejected
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Request not found
 */
router.put('/:requesterId/reject', friendController.rejectFriendRequest);

/**
 * @swagger
 * /api/friends/{friendId}/cancel:
 *   delete:
 *     summary: Cancel sent friend request
 *     tags: [Friends]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of user to cancel request to
 *     responses:
 *       200:
 *         description: Request cancelled
 *       404:
 *         description: Request not found
 */
router.delete('/:friendId/cancel', friendController.cancelFriendRequest);

/**
 * @swagger
 * /api/friends/{friendId}:
 *   delete:
 *     summary: Unfriend a user
 *     tags: [Friends]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of friend to remove
 *     responses:
 *       200:
 *         description: Friend removed
 *       404:
 *         description: Friendship not found
 */
router.delete('/:friendId', friendController.unfriend);

/**
 * @swagger
 * /api/friends/{userId}/block:
 *   put:
 *     summary: Block a user
 *     tags: [Friends]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of user to block
 *     responses:
 *       200:
 *         description: User blocked
 *       400:
 *         description: Cannot block yourself
 *       404:
 *         description: User not found
 */
router.put('/:userId/block', friendController.blockUser);

/**
 * @swagger
 * /api/friends/{userId}/unblock:
 *   put:
 *     summary: Unblock a user
 *     tags: [Friends]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of user to unblock
 *     responses:
 *       200:
 *         description: User unblocked
 *       404:
 *         description: User is not blocked or not found
 */
router.put('/:userId/unblock', friendController.unblockUser);

/**
 * @swagger
 * /api/friends/status/{userId}:
 *   get:
 *     summary: Check friendship status with another user
 *     tags: [Friends]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of user to check status with
 *     responses:
 *       200:
 *         description: Friendship status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [pending, accepted, blocked, null]
 *                       description: Current friendship status
 *                     direction:
 *                       type: string
 *                       enum: [incoming, outgoing, mutual, null]
 *                       description: Direction of relationship
 *                     friendship_id:
 *                       type: integer
 *                       nullable: true
 *                       description: ID of friendship record
 *       404:
 *         description: User not found
 */
router.get('/status/:userId', friendController.getFriendshipStatus);

/**
 * @swagger
 * /api/friends/check-bulk:
 *   post:
 *     summary: Check relationships with multiple users (for search/bulk operations)
 *     tags: [Friends]
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
 *               - user_ids
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of user IDs to check (max 100)
 *                 example: [3, 5, 7, 9]
 *     responses:
 *       200:
 *         description: Relationships checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [none, pending, accepted, blocked]
 *                       is_friend:
 *                         type: boolean
 *                       can_send_request:
 *                         type: boolean
 *                       can_message:
 *                         type: boolean
 *                       is_blocked:
 *                         type: boolean
 *                       blocked_by_me:
 *                         type: boolean
 *                       blocked_me:
 *                         type: boolean
 *       400:
 *         description: Invalid request (not array or too many users)
 */
router.post('/check-bulk', friendController.checkBulkRelationships);

module.exports = router;
