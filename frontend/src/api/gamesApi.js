import api from './axios';

/**
 * Games API module
 */

// Get all games with pagination
export const getGames = async (page = 1, limit = 10) => {
    const response = await api.get('/api/games', {
        params: { page, limit }
    });
    return response.data;
};

// Get game by ID
export const getGameById = async (id) => {
    const response = await api.get(`/api/games/${id}`);
    return response.data;
};

// Get game by type
export const getGameByType = async (type) => {
    const response = await api.get(`/api/games/type/${type}`);
    return response.data;
};

export default {
    getGames,
    getGameById,
    getGameByType
};
