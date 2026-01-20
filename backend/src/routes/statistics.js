const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { authenticateJWT, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Statistics and analytics endpoints
 */

/**
 * @swagger
 * /api/statistics/games/hot:
 *   get:
 *     summary: Get hot/popular games
 *     description: Returns list of popular games ranked by activity (sessions, unique players)
 *     tags: [Statistics]
  *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD). Default is 7 days ago
 *         example: "2026-01-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD). Default is today
 *         example: "2026-01-18"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of games to return
 *     responses:
 *       200:
 *         description: Hot games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       game_id:
 *                         type: integer
 *                       game_name:
 *                         type: string
 *                       game_type:
 *                         type: string
 *                       game_icon:
 *                         type: string
 *                       stats:
 *                         type: object
 *                         properties:
 *                           total_sessions:
 *                             type: integer
 *                           unique_players:
 *                             type: integer
 *                           completed_sessions:
 *                             type: integer
 *                           completion_rate:
 *                             type: number
 *                           avg_time_elapsed:
 *                             type: integer
 *                           trend:
 *                             type: string
 *                             example: "+15%"
 *                 period:
 *                   type: string
 *       400:
 *         description: Invalid parameters
 */
router.get('/games/hot', authenticateJWT, authorize('admin'), statisticsController.getHotGames);

/**
 * @swagger
 * /api/statistics/games/{gameId}:
 *   get:
 *     summary: Get detailed statistics for a specific game
 *     description: Returns comprehensive statistics including overview, difficulty breakdown, daily trend, and top players
 *     tags: [Statistics]
  *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD). Default is 7 days ago
 *         example: "2026-01-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD). Default is today
 *         example: "2026-01-18"
 *     responses:
 *       200:
 *         description: Game statistics retrieved successfully
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
 *                     game:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         type:
 *                           type: string
 *                         icon:
 *                           type: string
 *                     overview:
 *                       type: object
 *                       properties:
 *                         total_sessions:
 *                           type: integer
 *                         unique_players:
 *                           type: integer
 *                         completed_sessions:
 *                           type: integer
 *                         completion_rate:
 *                           type: number
 *                         avg_score:
 *                           type: integer
 *                         avg_time_elapsed:
 *                           type: integer
 *                         avg_moves:
 *                           type: integer
 *                     difficulty_stats:
 *                       type: object
 *                     daily_trend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           sessions:
 *                             type: integer
 *                           unique_players:
 *                             type: integer
 *                     top_players:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Game not found
 */
router.get('/games/:gameId', authenticateJWT, authorize('admin'), statisticsController.getGameDetails);

/**
 * @swagger
 * /api/statistics/overview:
 *   get:
 *     summary: Get dashboard overview statistics
 *     description: Returns overall platform statistics including users, sessions, and games
 *     tags: [Statistics]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
  *     parameters:
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD). Default is 7 days ago
 *         example: "2026-01-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD). Default is today
 *         example: "2026-01-18"
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
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
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         new:
 *                           type: integer
 *                         growth:
 *                           type: string
 *                     sessions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         completion_rate:
 *                           type: number
 *                         growth:
 *                           type: string
 *                     games:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         enabled:
 *                           type: integer
 *                         most_popular:
 *                           type: object
 */
router.get('/overview', authenticateJWT, authorize('admin'), statisticsController.getDashboardOverview);

/**
 * @swagger
 * /api/statistics/users:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     description: Returns detailed user metrics including registration trends and top players
 *     tags: [Statistics]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD). Default is 7 days ago
 *         example: "2026-01-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD). Default is today
 *         example: "2026-01-18"
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         total_users:
 *                           type: integer
 *                         new_users:
 *                           type: integer
 *                         active_users:
 *                           type: integer
 *                         retention_rate:
 *                           type: number
 *                         growth_rate:
 *                           type: number
 *                     top_players:
 *                       type: array
 *                       items:
 *                         type: object
 *                     registration_trend:
 *                       type: array
 *                       items:
 *                         type: object
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/users', authenticateJWT, authorize('admin'), statisticsController.getUserStatistics);

module.exports = router;
