const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Achievements
 *   description: Achievement system - Badges and milestones
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Achievement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         category:
 *           type: string
 *           enum: [beginner, expert, social, special]
 *         points:
 *           type: integer
 *         unlock_criteria:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             game_type:
 *               type: array
 *               items:
 *                 type: string
 *             required_count:
 *               type: integer
 *             description:
 *               type: string
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/achievements:
 *   get:
 *     summary: Get all achievements
 *     description: Returns list of all available achievements
 *     tags: [Achievements]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [beginner, expert, social, special]
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Achievements list
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
 *                     achievements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Achievement'
 */
router.get('/', achievementController.getAllAchievements);

/**
 * @swagger
 * /api/achievements/me:
 *   get:
 *     summary: Get current user's achievements
 *     description: Returns user's achievements with progress, grouped by status
 *     tags: [Achievements]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User achievements with progress
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
 *                     total_points:
 *                       type: integer
 *                     unlocked_count:
 *                       type: integer
 *                     total_count:
 *                       type: integer
 *                     achievements:
 *                       type: object
 *                       properties:
 *                         unlocked:
 *                           type: array
 *                         in_progress:
 *                           type: array
 *                         locked:
 *                           type: array
 */
router.get('/me', authenticateJWT, achievementController.getMyAchievements);

/**
 * @swagger
 * /api/achievements/{id}:
 *   get:
 *     summary: Get achievement by ID
 *     tags: [Achievements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Achievement details
 *       404:
 *         description: Achievement not found
 */
router.get('/:id', achievementController.getAchievementById);

module.exports = router;
