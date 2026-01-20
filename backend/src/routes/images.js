const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Image management - Store and retrieve image URLs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         url:
 *           type: string
 *         uploaded_by:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: Get all images (paginated)
 *     description: Returns paginated list of all images
 *     tags: [Images]
 *     security:
 *       - apiKeyAuth: []
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
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Images list with pagination
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
 *                     images:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Image'
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
router.get('/', imageController.getAllImages);

/**
 * @swagger
 * /api/images/{id}:
 *   get:
 *     summary: Get image by ID
 *     tags: [Images]
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
 *         description: Image details
 *       404:
 *         description: Image not found
 */
router.get('/:id', imageController.getImageById);

// ============================================
// AUTHENTICATED ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/images:
 *   post:
 *     summary: Create a new image
 *     tags: [Images]
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
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Image created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticateJWT, imageController.createImage);

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete an image
 *     tags: [Images]
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
 *         description: Image deleted successfully
 *       404:
 *         description: Image not found
 */
router.delete('/:id', authenticateJWT, imageController.deleteImage);

module.exports = router;
