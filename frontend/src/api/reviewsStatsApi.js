import api from "./axios";

/**
 * Reviews Statistics API
 */

// Get overall review statistics
export const getOverallReviewStats = async () => {
  const response = await api.get("/api/reviews/stats/overall");
  return response.data;
};

export default {
  getOverallReviewStats,
};
