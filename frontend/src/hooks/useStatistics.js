import { useState, useEffect, useCallback } from "react";
import {
  getDashboardOverview,
  getHotGames,
  getGameStatistics,
  getUserStatistics,
} from "@/api/statisticsApi";
import { getOverallReviewStats } from "@/api/reviewsStatsApi";

/**
 * Custom hook for fetching dashboard overview statistics
 */
export const useOverviewStats = (dateRange = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardOverview(dateRange);
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch overview statistics",
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange.from_date, dateRange.to_date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for fetching hot/popular games
 */
export const useHotGames = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getHotGames(params);
      setData(response.data || []);
      setPeriod(response.period || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch hot games");
    } finally {
      setLoading(false);
    }
  }, [params.from_date, params.to_date, params.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, period, refetch: fetchData };
};

/**
 * Custom hook for fetching specific game statistics
 */
export const useGameStatistics = (gameId, dateRange = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getGameStatistics(gameId, dateRange);
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch game statistics",
      );
    } finally {
      setLoading(false);
    }
  }, [gameId, dateRange.from_date, dateRange.to_date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for fetching user statistics
 */
export const useUserStatistics = (dateRange = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserStatistics(dateRange);
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch user statistics",
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange.from_date, dateRange.to_date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for fetching review statistics
 */
export const useReviewStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOverallReviewStats();
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch review statistics",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default {
  useOverviewStats,
  useHotGames,
  useGameStatistics,
  useUserStatistics,
  useReviewStats,
};
