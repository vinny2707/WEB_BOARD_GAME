const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateJWT, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Game review management
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/reviews/game/{gameId}:
 *   get:
 *     summary: Get reviews for a specific game
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, highest, lowest]
 *           default: newest
 *         description: Sort order (newest, oldest, highest rating, lowest rating)
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by specific rating (1-5)
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by minimum rating
 *     responses:
 *       200:
 *         description: Reviews retrieved
 */
router.get('/game/:gameId', reviewController.getGameReviews);

// ============================================
// PROTECTED ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review for a game
 *     tags: [Reviews]
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
 *               - gameId
 *               - rating
 *             properties:
 *               gameId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Already reviewed
 */
router.post('/', authenticateJWT, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 */
router.put('/:id', authenticateJWT, reviewController.updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 */
router.delete('/:id', authenticateJWT, reviewController.deleteReview);

// ============================================
// USER-SPECIFIC ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/reviews/user/game/{gameId}:
 *   get:
 *     summary: Check if current user has reviewed a game
 *     tags: [Reviews]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Review check result
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
 *                     hasReviewed:
 *                       type: boolean
 *                     review:
 *                       type: object
 *                       nullable: true
 *       404:
 *         description: Game not found
 */
router.get('/user/game/:gameId', authenticateJWT, reviewController.getUserReviewForGame);

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/reviews/stats/overall:
 *   get:
 *     summary: Get overall review statistics (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics
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
 *                     total_reviews:
 *                       type: integer
 *                     average_rating:
 *                       type: string
 *                     total_games_reviewed:
 *                       type: integer
 *                     total_users_reviewed:
 *                       type: integer
 */
router.get('/stats/overall', authenticateJWT, authorize('admin'), reviewController.getOverallStats);

module.exports = router;
