import api from './axios';

/**
 * Games API - CRUD operations for game management
 */

// Get all games with pagination, search, and filters
export const getGames = async (params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 10,
    ...(params.search && { search: params.search }),
    ...(params.enabled !== undefined && { enabled: params.enabled }),
  });
  
  const response = await api.get(`/api/games?${queryParams}`);
  return response.data;
};

// Get game details by ID
export const getGameById = async (id) => {
  const response = await api.get(`/api/games/${id}`);
  return response.data;
};

// Create new game (Admin only)
export const createGame = async (gameData) => {
  const response = await api.post('/api/games', gameData);
  return response.data;
};

// Update game (Admin only)
export const updateGame = async (id, gameData) => {
  const response = await api.put(`/api/games/${id}`, gameData);
  return response.data;
};

// Toggle game status (Admin only)
export const toggleGameStatus = async (id, enabled) => {
  const response = await api.patch(`/api/games/${id}/status`, { enabled });
  return response.data;
};

// Delete game (Admin only)
export const deleteGame = async (id) => {
  const response = await api.delete(`/api/games/${id}`);
  return response.data;
};

export default {
  getGames,
  getGameById,
  createGame,
  updateGame,
  toggleGameStatus,
  deleteGame,
};
