import api from './axios';

/**
 * Authentication API endpoints
 */

/**
 * Logout user - clears refresh token from database
 * @returns {Promise}
 */
export const logout = async () => {
  return await api.post('/api/auth/logout');
};

export default {
  logout,
};
