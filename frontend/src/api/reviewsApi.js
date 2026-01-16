import api from './axios';

/**
 * Reviews API - Operations for game reviews
 */

/**
 * Get reviews for a specific game
 * @param {number} gameId - The ID of the game
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Number of reviews per page (default: 10)
 * @param {string} params.sort - Sort order: 'newest', 'oldest', 'highest_rating', 'lowest_rating'
 * @param {number} params.rating - Filter by specific rating (1-5)
 * @param {number} params.minRating - Filter by minimum rating
 * @returns {Promise<Object>} Response with reviews, pagination, and stats
 */
export const getGameReviews = async (gameId, params = {}) => {
    const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.sort && { sort: params.sort }),
        ...(params.rating && { rating: params.rating }),
        ...(params.minRating && { minRating: params.minRating }),
    });

    const response = await api.get(`/api/reviews/game/${gameId}?${queryParams}`);
    return response.data;
};

/**
 * Create a new review for a game
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.gameId - The ID of the game
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @returns {Promise<Object>} Created review
 */
export const createReview = async (reviewData) => {
    const response = await api.post('/api/reviews', reviewData);
    return response.data;
};

/**
 * Update an existing review
 * @param {number} reviewId - The ID of the review
 * @param {Object} reviewData - Updated review data
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @returns {Promise<Object>} Updated review
 */
export const updateReview = async (reviewId, reviewData) => {
    const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
    return response.data;
};

/**
 * Delete a review
 * @param {number} reviewId - The ID of the review
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/api/reviews/${reviewId}`);
    return response.data;
};

/**
 * Get user's review for a specific game
 * @param {number} gameId - The ID of the game
 * @returns {Promise<Object>} User's review or null
 */
export const getUserReviewForGame = async (gameId) => {
    const response = await api.get(`/api/reviews/game/${gameId}/my-review`);
    return response.data;
};

export default {
    getGameReviews,
    createReview,
    updateReview,
    deleteReview,
    getUserReviewForGame,
};
