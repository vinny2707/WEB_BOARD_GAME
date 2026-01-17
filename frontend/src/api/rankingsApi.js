import api from './axios';

/**
 * Rankings API - Get game-specific rankings
 */

/**
 * Get rankings for a specific game
 * @param {number} gameId - Game ID
 * @param {Object} params - Query parameters
 * @param {string} [params.scope='global'] - Scope: 'global', 'friends', 'personal'
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 */
export const getGameRankings = async (gameId, params = {}) => {
    const queryParams = new URLSearchParams({
        scope: params.scope || 'global',
        page: params.page || 1,
        limit: params.limit || 10,
    });

    const response = await api.get(`/api/rankings/game/${gameId}?${queryParams}`);
    return response.data;
};

/**
 * Get current user's rank for a specific game
 * @param {number} gameId - Game ID
 * @returns {Object} User's ranking data including rank, percentile, stats
 */
export const getMyGameRanking = async (gameId) => {
    const response = await api.get(`/api/rankings/game/${gameId}/me`);
    return response.data;
};
