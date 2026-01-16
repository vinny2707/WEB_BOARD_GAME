import api from './axios';

/**
 * Sessions API - Game session management for tracking history and rankings
 */

/**
 * Complete a game session - Submit game results
 * @param {Object} data - Game completion data
 * @param {number} data.game_id - Game ID
 * @param {string} data.result - Result: 'win', 'loss', 'draw'
 * @param {number} [data.score] - Score achieved
 * @param {number} [data.moves_count] - Number of moves
 * @param {number} [data.time_elapsed] - Time played in seconds
 * @param {Object} [data.game_state] - Final game state
 * @param {Object} [data.settings] - Game settings used
 * @param {string} [data.started_at] - ISO 8601 start time
 */
export const completeGame = async (data) => {
    const response = await api.post('/api/sessions/complete', data);
    return response.data;
};

/**
 * Get game history for current user
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {number} [params.game_id] - Filter by game ID
 * @param {string} [params.status] - Filter: 'in_progress', 'completed', 'abandoned'
 */
export const getHistory = async (params = {}) => {
    const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.game_id && { game_id: params.game_id }),
        ...(params.status && { status: params.status }),
    });

    const response = await api.get(`/api/sessions/history?${queryParams}`);
    return response.data;
};

/**
 * Start a new game session
 * @param {Object} data - Session start data
 * @param {number} data.game_id - Game ID
 * @param {Object} [data.game_state] - Initial game state
 * @param {Object} [data.settings] - Custom game settings
 */
export const startSession = async (data) => {
    const response = await api.post('/api/sessions/start', data);
    return response.data;
};

/**
 * Get session details by ID
 * @param {string} id - Session UUID
 */
export const getSession = async (id) => {
    const response = await api.get(`/api/sessions/${id}`);
    return response.data;
};

/**
 * Save game progress for an in-progress session
 * @param {string} id - Session UUID
 * @param {Object} data - Progress data
 * @param {Object} data.game_state - Current game state
 * @param {number} [data.moves_count] - Number of moves made
 * @param {number} [data.time_elapsed] - Time elapsed in seconds
 */
export const saveSession = async (id, data) => {
    const response = await api.put(`/api/sessions/${id}/save`, data);
    return response.data;
};

/**
 * Delete a session from history
 * @param {string} id - Session UUID
 */
export const deleteSession = async (id) => {
    const response = await api.delete(`/api/sessions/${id}`);
    return response.data;
};

export default {
    completeGame,
    getHistory,
    startSession,
    getSession,
    saveSession,
    deleteSession,
};
