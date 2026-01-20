const Review = require('../models/Review');
const Game = require('../models/Game');
const { success, error } = require('../utils/response');

/**
 * Review Controller
 * Handles HTTP requests for game reviews
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * Get reviews for a specific game
 */
const getGameReviews = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { page, limit, sort, rating, minRating } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        // Run game check and stats in parallel
        const [game, stats] = await Promise.all([
            Game.findById(gameId),
            Review.getStats(gameId)
        ]);

        if (!game) {
            return error(res, 'Game not found', 404);
        }

        // Get reviews with filters and sorting
        const reviews = await Review.findByGameId(gameId, {
            page: pageNum,
            limit: limitNum,
            sort,
            rating,
            minRating
        });

        // Build pagination from stats
        const pagination = {
            page: pageNum,
            limit: limitNum,
            total: stats.total_reviews,
            totalPages: Math.ceil(stats.total_reviews / limitNum)
        };

        return success(res, { reviews, pagination, stats }, 'Reviews retrieved successfully');
    } catch (err) {
        next(err);
    }
};

// ============================================
// PROTECTED ENDPOINTS
// ============================================

/**
 * Create a new review
 */
const createReview = async (req, res, next) => {
    try {
        const { gameId, rating, comment } = req.body;
        const userId = req.user.id; // From auth middleware

        // Validate input
        if (!gameId || !rating) {
            return error(res, 'gameId and rating are required', 400);
        }

        if (rating < 1 || rating > 5) {
            return error(res, 'Rating must be between 1 and 5', 400);
        }

        // Check if game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return error(res, 'Game not found', 404);
        }

        // Check availability (User can only review once per game)
        const existingReview = await Review.findByUserAndGame(userId, gameId);
        if (existingReview) {
            return error(res, 'You have already reviewed this game', 409);
        }

        // Create review
        const review = await Review.create({
            user_id: userId,
            game_id: gameId,
            rating,
            comment
        });

        return success(res, review, 'Review created successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Update an existing review
 */
const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Find existing review
        const review = await Review.findById(id);
        if (!review) {
            return error(res, 'Review not found', 404);
        }

        // Check ownership
        if (review.user_id !== userId && req.user.role !== 'admin') {
            return error(res, 'Not authorized to update this review', 403);
        }

        // Validate input if provided
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return error(res, 'Rating must be between 1 and 5', 400);
        }

        // Update
        const updateData = {};
        if (rating !== undefined) updateData.rating = rating;
        if (comment !== undefined) updateData.comment = comment;

        const updatedReview = await Review.update(id, updateData);

        return success(res, updatedReview, 'Review updated successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a review
 */
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find existing review
        const review = await Review.findById(id);
        if (!review) {
            return error(res, 'Review not found', 404);
        }

        // Check ownership (Admin can delete any review)
        if (review.user_id !== userId && req.user.role !== 'admin') {
            return error(res, 'Not authorized to delete this review', 403);
        }

        await Review.delete(id);

        return success(res, null, 'Review deleted successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Check if user has reviewed a specific game
 */
const getUserReviewForGame = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id;

        // Check if game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return error(res, 'Game not found', 404);
        }

        // Get user's review for this game
        const review = await Review.findByUserAndGame(userId, gameId);

        if (!review) {
            return success(res, { hasReviewed: false, review: null }, 'No review found');
        }

        return success(res, { hasReviewed: true, review }, 'Review found');
    } catch (err) {
        next(err);
    }
};

/**
 * Get overall review statistics (Admin only)
 */
const getOverallStats = async (req, res, next) => {
    try {
        const stats = await Review.getOverallStats();
        return success(res, stats, 'Overall statistics retrieved successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getGameReviews,
    createReview,
    updateReview,
    deleteReview,
    getUserReviewForGame,
    getOverallStats
};
