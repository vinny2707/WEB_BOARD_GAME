import api from './axios';

/**
 * Statistics API - Dashboard analytics and statistics
 */

// Get dashboard overview statistics
export const getDashboardOverview = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.from_date) queryParams.append('from_date', params.from_date);
  if (params.to_date) queryParams.append('to_date', params.to_date);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/api/statistics/overview?${queryString}` : '/api/statistics/overview';
  
  const response = await api.get(url);
  return response.data;
};

// Get hot/popular games
export const getHotGames = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.from_date) queryParams.append('from_date', params.from_date);
  if (params.to_date) queryParams.append('to_date', params.to_date);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/api/statistics/games/hot?${queryString}` : '/api/statistics/games/hot';
  
  const response = await api.get(url);
  return response.data;
};

// Get detailed statistics for a specific game
export const getGameStatistics = async (gameId, params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.from_date) queryParams.append('from_date', params.from_date);
  if (params.to_date) queryParams.append('to_date', params.to_date);
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `/api/statistics/games/${gameId}?${queryString}` 
    : `/api/statistics/games/${gameId}`;
  
  const response = await api.get(url);
  return response.data;
};

// Get user statistics (Admin only)
export const getUserStatistics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.from_date) queryParams.append('from_date', params.from_date);
  if (params.to_date) queryParams.append('to_date', params.to_date);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/api/statistics/users?${queryString}` : '/api/statistics/users';
  
  const response = await api.get(url);
  return response.data;
};

export default {
  getDashboardOverview,
  getHotGames,
  getGameStatistics,
  getUserStatistics,
};
