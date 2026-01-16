import { useState, useEffect, useCallback } from 'react';
import { getGameReviews } from '../../../api/reviewsApi';

/**
 * Custom hook for fetching and managing game reviews
 * @param {number} gameId - The ID of the game
 * @param {Object} initialParams - Initial query parameters
 * @returns {Object} Reviews data, loading state, error, and refetch function
 */
const useGameReviews = (gameId, initialParams = {}) => {
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 3,
        total: 0,
        totalPages: 0,
    });
    const [stats, setStats] = useState({
        average_rating: '0',
        total_reviews: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [params, setParams] = useState({
        page: 1,
        limit: 3,
        sort: 'newest',
        ...initialParams,
    });

    const fetchReviews = useCallback(async () => {
        if (!gameId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await getGameReviews(gameId, params);

            if (response.success) {
                setReviews(response.data.reviews || []);
                setPagination(response.data.pagination || pagination);
                setStats(response.data.stats || stats);
            } else {
                setError(response.message || 'Failed to fetch reviews');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [gameId, params]);

    // Fetch reviews when gameId or params change
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Update params and trigger refetch
    const updateParams = useCallback((newParams) => {
        setParams((prev) => ({
            ...prev,
            ...newParams,
            // Reset to page 1 when filters change (except when changing page)
            page: newParams.page !== undefined ? newParams.page : 1,
        }));
    }, []);

    // Go to specific page
    const goToPage = useCallback((page) => {
        setParams((prev) => ({ ...prev, page }));
    }, []);

    // Change sort order
    const setSortOrder = useCallback((sort) => {
        setParams((prev) => ({ ...prev, sort, page: 1 }));
    }, []);

    // Filter by rating
    const filterByRating = useCallback((rating) => {
        setParams((prev) => {
            const newParams = { ...prev, page: 1 };
            if (rating) {
                newParams.rating = rating;
            } else {
                delete newParams.rating;
            }
            return newParams;
        });
    }, []);

    // Filter by minimum rating
    const filterByMinRating = useCallback((minRating) => {
        setParams((prev) => {
            const newParams = { ...prev, page: 1 };
            if (minRating) {
                newParams.minRating = minRating;
            } else {
                delete newParams.minRating;
            }
            return newParams;
        });
    }, []);

    return {
        reviews,
        pagination,
        stats,
        loading,
        error,
        params,
        refetch: fetchReviews,
        updateParams,
        goToPage,
        setSortOrder,
        filterByRating,
        filterByMinRating,
    };
};

export default useGameReviews;
