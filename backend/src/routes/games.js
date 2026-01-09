const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticateJWT, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Game management - Public listing and Admin CRUD
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get all games (summary info)
 *     description: Returns all games including disabled ones. Summary fields only for list display. Supports pagination, search, and filter.
 *     tags: [Games]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or type
 *       - in: query
 *         name: enabled
 *         schema:
 *           type: boolean
 *         description: Filter by enabled status
 *     responses:
 *       200:
 *         description: Games list retrieved
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
 *                   example: Games retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     games:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           enabled:
 *                             type: boolean
 *                           icon:
 *                             type: string
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
router.get('/', gameController.getAllGames);

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Get game by ID (full details)
 *     description: Returns complete game info including rows, cols, rules, and settings
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 */
router.get('/:id', gameController.getGameById);

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Create new game (Admin only)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - rows
 *               - cols
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Game"
 *               type:
 *                 type: string
 *                 example: "new_game"
 *               description:
 *                 type: string
 *               rows:
 *                 type: integer
 *                 example: 10
 *               cols:
 *                 type: integer
 *                 example: 10
 *               enabled:
 *                 type: boolean
 *                 default: true
 *               icon:
 *                 type: string
 *               rules:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       201:
 *         description: Game created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Game type already exists
 */
router.post('/', authenticateJWT, authorize('admin'), gameController.createGame);

/**
 * @swagger
 * /api/games/{id}:
 *   put:
 *     summary: Update game (Admin only)
 *     tags: [Games]
 *     security:
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
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               rows:
 *                 type: integer
 *               cols:
 *                 type: integer
 *               icon:
 *                 type: string
 *               rules:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Game updated
 *       404:
 *         description: Game not found
 *       409:
 *         description: Game type already exists
 */
router.put('/:id', authenticateJWT, authorize('admin'), gameController.updateGame);

/**
 * @swagger
 * /api/games/{id}/status:
 *   patch:
 *     summary: Toggle game enabled status (Admin only)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status toggled
 *       404:
 *         description: Game not found
 */
router.patch('/:id/status', authenticateJWT, authorize('admin'), gameController.toggleGameStatus);

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: Delete game (Admin only)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Game deleted
 *       404:
 *         description: Game not found
 */
router.delete('/:id', authenticateJWT, authorize('admin'), gameController.deleteGame);

module.exports = router;
