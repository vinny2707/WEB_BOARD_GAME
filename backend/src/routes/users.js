const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin sees all info, User sees public info for friend search)
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, banned]
 *         description: Filter by status (Admin only)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *         description: Filter by role (Admin only)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username, email, or full_name
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
 *         description: Users list retrieved (Admin gets full info, User gets public info only)
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, authorize('admin', 'user'), userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateJWT, authorize('admin'), userController.getUserById);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Change user role
 *     tags: [Users]
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: Role changed
 *       403:
 *         description: Cannot change own role
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', authenticateJWT, authorize('admin'), userController.changeRole);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Change user status (ban/unban)
 *     tags: [Users]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, banned]
 *     responses:
 *       200:
 *         description: Status changed
 *       403:
 *         description: Cannot ban yourself
 *       404:
 *         description: User not found
 */
router.patch('/:id/status', authenticateJWT, authorize('admin'), userController.changeStatus);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user permanently
 *     tags: [Users]
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
 *         description: User deleted
 *       403:
 *         description: Cannot delete yourself
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticateJWT, authorize('admin'), userController.deleteUser);

module.exports = router;
