const Image = require('../models/Image');
const { success, error } = require('../utils/response');

/**
 * Image Controller
 * Handles HTTP requests for images
 */

/**
 * Get all images with pagination
 * GET /api/images?page=1&limit=20
 */
const getAllImages = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await Image.findAll({ page, limit });

        return success(res, result, 'Images retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get image by ID
 * GET /api/images/:id
 */
const getImageById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const image = await Image.findById(id);

        if (!image) {
            return error(res, 'Image not found', 404);
        }

        return success(res, image, 'Image retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Create a new image
 * POST /api/images
 */
const createImage = async (req, res, next) => {
    try {
        const { url } = req.body;
        const uploadedBy = req.user?.id || null;

        const image = await Image.create({ url, uploadedBy });

        return success(res, image, 'Image created successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete an image
 * DELETE /api/images/:id
 */
const deleteImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await Image.delete(id);

        if (!deleted) {
            return error(res, 'Image not found', 404);
        }

        return success(res, null, 'Image deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllImages,
    getImageById,
    createImage,
    deleteImage
};
