const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { authenticateJWT, authorize } = require('../middleware/auth');

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
 *     summary: Get all achievements (paginated, filtered, sorted)
 *     description: Returns paginated list of all available achievements with filter, sort, and search capabilities
 *     tags: [Achievements]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [beginner, expert, social, special]
 *         description: Filter by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (default 10)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [category, points, name, created_at]
 *           default: category
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *     responses:
 *       200:
 *         description: Achievements list with pagination
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
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get('/', achievementController.getAllAchievements);

/**
 * @swagger
 * /api/achievements/me:
 *   get:
 *     summary: Get current user's achievements (paginated, filtered, sorted)
 *     description: Returns user's achievements with progress. When status=all (default), achievements are grouped by status. When filtering by specific status, returns flat list.
 *     tags: [Achievements]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (default 10)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, unlocked, in_progress, locked]
 *           default: all
 *         description: Filter by achievement status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [beginner, expert, social, special]
 *         description: Filter by category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [category, points, name, unlocked_at]
 *           default: category
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: User achievements with progress and pagination
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
 *                       oneOf:
 *                         - type: object
 *                           description: Grouped achievements (when status=all)
 *                           properties:
 *                             unlocked:
 *                               type: array
 *                             in_progress:
 *                               type: array
 *                             locked:
 *                               type: array
 *                         - type: array
 *                           description: Flat list (when filtering by specific status)
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get('/me', authenticateJWT, achievementController.getMyAchievements);

/**
 * @swagger
 * /api/achievements/{id}:
 *   get:
 *     summary: Get achievement by ID
 *     tags: [Achievements]
 *     security:
 *       - apiKeyAuth: []
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

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/achievements:
 *   post:
 *     summary: Create new achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *                 default: 🏆
 *               category:
 *                 type: string
 *                 enum: [beginner, expert, social, special]
 *               points:
 *                 type: integer
 *                 default: 10
 *               unlock_criteria:
 *                 type: object
 *     responses:
 *       201:
 *         description: Achievement created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', authenticateJWT, authorize('admin'), achievementController.createAchievement);

/**
 * @swagger
 * /api/achievements/{id}:
 *   put:
 *     summary: Update achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [beginner, expert, social, special]
 *               points:
 *                 type: integer
 *               unlock_criteria:
 *                 type: object
 *     responses:
 *       200:
 *         description: Achievement updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Achievement not found
 */
router.put('/:id', authenticateJWT, authorize('admin'), achievementController.updateAchievement);

/**
 * @swagger
 * /api/achievements/{id}:
 *   delete:
 *     summary: Delete achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Achievement deleted successfully
 *       404:
 *         description: Achievement not found
 */
router.delete('/:id', authenticateJWT, authorize('admin'), achievementController.deleteAchievement);

module.exports = router;
