const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Rankings
 *   description: Game ranking management
 */

/**
 * @swagger
 * /api/rankings/me:
 *   get:
 *     summary: Get all rankings for current user (across all games)
 *     tags: [Rankings]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     responses:
 *       200:
 *         description: User's rankings retrieved successfully
 */
router.get('/me', authenticateJWT, rankingController.getMyRankings);

/**
 * @swagger
 * /api/rankings/game/{gameId}/me:
 *   get:
 *     summary: Get current user's ranking in a specific game
 *     tags: [Rankings]
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
 *         description: User's ranking retrieved successfully
 *       404:
 *         description: Game not found or user has not played this game
 */
router.get('/game/:gameId/me', authenticateJWT, rankingController.getMyGameRanking);

/**
 * @swagger
 * /api/rankings/game/{gameId}:
 *   get:
 *     summary: Get rankings for a specific game
 *     tags: [Rankings]
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
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [global, friends, personal]
 *           default: global
 *         description: Ranking scope (global = all users, friends = friends only, personal = current user only)
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
 *         description: Rankings retrieved with pagination
 *       404:
 *         description: Game not found
 */
router.get('/game/:gameId', authenticateJWT, rankingController.getGameRankings);

/**
 * @swagger
 * /api/rankings/achievements:
 *   get:
 *     summary: Get achievement rankings (leaderboard by achievement points)
 *     tags: [Rankings]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [global, friends]
 *           default: global
 *         description: Ranking scope
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
 *     responses:
 *       200:
 *         description: Achievement rankings retrieved
 */
router.get('/achievements', authenticateJWT, rankingController.getAchievementRankings);

/**
 * @swagger
 * /api/rankings/achievements/me:
 *   get:
 *     summary: Get current user's achievement ranking
 *     tags: [Rankings]
 *     security:
 *       - apiKeyAuth: []
 *         bearerAuth: []
 *     responses:
 *       200:
 *         description: User's achievement ranking retrieved
 */
router.get('/achievements/me', authenticateJWT, rankingController.getMyAchievementRanking);

module.exports = router;
