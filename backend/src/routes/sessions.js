const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Game session management - History, Complete, Save
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GameSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: integer
 *         game_id:
 *           type: integer
 *         game_state:
 *           type: object
 *         result:
 *           type: string
 *           enum: [win, loss, draw]
 *         score:
 *           type: integer
 *         moves_count:
 *           type: integer
 *         time_elapsed:
 *           type: integer
 *           description: Time in seconds
 *         status:
 *           type: string
 *           enum: [in_progress, completed, abandoned]
 *         settings:
 *           type: object
 *         started_at:
 *           type: string
 *           format: date-time
 *         ended_at:
 *           type: string
 *           format: date-time
 */

// ============================================
// ALL ENDPOINTS REQUIRE AUTHENTICATION
// ============================================

/**
 * @swagger
 * /api/sessions/complete:
 *   post:
 *     summary: Complete a game and record results
 *     description: Submit a completed game session. This will update the user's ranking automatically.
 *     tags: [Sessions]
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
 *               - game_id
 *               - result
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *               result:
 *                 type: string
 *                 enum: [win, loss, draw]
 *                 example: "win"
 *               score:
 *                 type: integer
 *                 example: 100
 *               moves_count:
 *                 type: integer
 *                 example: 15
 *               time_elapsed:
 *                 type: integer
 *                 description: Time in seconds
 *                 example: 120
 *               game_state:
 *                 type: object
 *                 description: Final game state (optional)
 *               settings:
 *                 type: object
 *                 description: Game settings used
 *               started_at:
 *                 type: string
 *                 format: date-time
 *                 description: When game actually started (optional)
 *     responses:
 *       201:
 *         description: Game completed and ranking updated
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
 *                   example: Game completed successfully
 *                 data:
 *                   $ref: '#/components/schemas/GameSession'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Game not found
 */
router.post('/complete', authenticateJWT, sessionController.completeGame);

/**
 * @swagger
 * /api/sessions/history:
 *   get:
 *     summary: Get user's game history
 *     description: Returns paginated list of user's completed and in-progress games
 *     tags: [Sessions]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
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
 *         name: game_id
 *         schema:
 *           type: integer
 *         description: Filter by game
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_progress, completed, abandoned]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: History retrieved
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
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           game_id:
 *                             type: integer
 *                           game_name:
 *                             type: string
 *                           game_type:
 *                             type: string
 *                           game_icon:
 *                             type: string
 *                           result:
 *                             type: string
 *                           score:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           started_at:
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
router.get('/history', authenticateJWT, sessionController.getHistory);

/**
 * @swagger
 * /api/sessions/start:
 *   post:
 *     summary: Start a new game session
 *     description: Create an in-progress session for games that need resume capability
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: integer
 *                 example: 1
 *               game_state:
 *                 type: object
 *                 description: Initial game state
 *               settings:
 *                 type: object
 *                 description: Custom game settings
 *     responses:
 *       201:
 *         description: Session started
 *       404:
 *         description: Game not found
 */
router.post('/start', authenticateJWT, sessionController.startSession);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     description: Returns full details of a specific session (must be owned by user)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session UUID
 *     responses:
 *       200:
 *         description: Session found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GameSession'
 *       404:
 *         description: Session not found
 */
router.get('/:id', authenticateJWT, sessionController.getSessionById);

/**
 * @swagger
 * /api/sessions/{id}/save:
 *   put:
 *     summary: Save in-progress game state
 *     description: Update game state for an in-progress session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_state
 *             properties:
 *               game_state:
 *                 type: object
 *                 description: Current game state
 *               moves_count:
 *                 type: integer
 *               time_elapsed:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Session saved
 *       404:
 *         description: Session not found or not in progress
 */
router.put('/:id/save', authenticateJWT, sessionController.saveSession);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     description: Remove a session from history (must be owned by user)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session deleted
 *       404:
 *         description: Session not found
 */
router.delete('/:id', authenticateJWT, sessionController.deleteSession);

module.exports = router;
