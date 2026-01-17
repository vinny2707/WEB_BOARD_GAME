import api from './axios';

/**
 * Images API Service
 * Handles fetching images for avatar selection
 */

/**
 * Get all images with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @returns {Promise<{images: Array, pagination: Object}>}
 */
export const getAllImages = async (page = 1, limit = 20) => {
  const response = await api.get('/api/images', {
    params: { page, limit }
  });
  return response.data.data;
};

/**
 * Get image by ID
 * @param {number} id - Image ID
 * @returns {Promise<Object>}
 */
export const getImageById = async (id) => {
  const response = await api.get(`/api/images/${id}`);
  return response.data.data;
};

export default {
  getAllImages,
  getImageById
};
