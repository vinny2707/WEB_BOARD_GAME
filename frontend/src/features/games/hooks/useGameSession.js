import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { completeGame, startSession, saveSession, getSession } from '../../../api/sessionsApi';

/**
 * Custom hook for managing game sessions
 * Provides functions to track game progress and submit results
 * 
 * @param {number} gameId - The ID of the game
 * @param {Object} options - Additional options
 * @param {boolean} options.autoStart - Automatically start session on mount
 * @param {boolean} options.autoSave - Enable periodic auto-save for complex games
 * @param {number} options.saveInterval - Auto-save interval in seconds (default: 30)
 */
export const useGameSession = (gameId, options = {}) => {
    const { autoStart = false, autoSave = false, saveInterval = 30 } = options;

    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const startTimeRef = useRef(null);
    const movesCountRef = useRef(0);
    const autoSaveIntervalRef = useRef(null);
    const gameStateRef = useRef(null);

    // Check if user is authenticated (has token)
    const isAuthenticated = useCallback(() => {
        const token = localStorage.getItem('token');
        return !!token;
    }, []);

    /**
     * Start a new game session
     * @param {Object} settings - Game settings
     * @param {Object} initialState - Initial game state
     */
    const startGameSession = useCallback(async (settings = {}, initialState = null) => {
        if (!isAuthenticated() || !gameId) return null;

        setIsLoading(true);
        setError(null);
        startTimeRef.current = new Date().toISOString();
        movesCountRef.current = 0;

        try {
            const response = await startSession({
                game_id: gameId,
                settings,
                game_state: initialState,
            });

            if (response.success && response.data?.id) {
                setSessionId(response.data.id);
                return response.data.id;
            }
        } catch (err) {
            console.error('Failed to start session:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
        return null;
    }, [gameId, isAuthenticated]);

    /**
     * Save current game progress
     * @param {Object} gameState - Current game state
     */
    const saveProgress = useCallback(async (gameState) => {
        if (!sessionId || !isAuthenticated()) return;

        gameStateRef.current = gameState;

        try {
            const timeElapsed = startTimeRef.current
                ? Math.floor((Date.now() - new Date(startTimeRef.current).getTime()) / 1000)
                : 0;

            await saveSession(sessionId, {
                game_state: gameState,
                moves_count: movesCountRef.current,
                time_elapsed: timeElapsed,
            });
        } catch (err) {
            console.error('Failed to save progress:', err);
        }
    }, [sessionId, isAuthenticated]);

    /**
     * Complete the game and submit results (fire-and-forget)
     * Non-blocking - user can navigate away before response
     * Shows toast notifications for newly_unlocked items when response returns
     * 
     * @param {Object} result - Game result data
     * @param {string} result.result - 'win', 'loss', or 'draw'
     * @param {number} result.score - Score achieved
     * @param {Object} result.gameState - Final game state
     */
    const completeGameSession = useCallback((result) => {
        if (!isAuthenticated() || !gameId) return;

        // Clear auto-save interval
        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
        }

        const timeElapsed = startTimeRef.current
            ? Math.floor((Date.now() - new Date(startTimeRef.current).getTime()) / 1000)
            : result.time_elapsed || 0;

        // Fire-and-forget: don't await, don't set loading state
        // This allows user to navigate away immediately
        completeGame({
            game_id: gameId,
            result: result.result, // 'win', 'loss', 'draw'
            score: result.score || 0,
            moves_count: result.moves_count || movesCountRef.current,
            time_elapsed: timeElapsed,
            game_state: result.gameState || gameStateRef.current,
            started_at: startTimeRef.current,
        }).then((response) => {
            if (response.success) {
                setSessionId(null);

                // Play notification sound
                const playNotificationSound = () => {
                    const audio = new Audio('/sounds/eat.wav');
                    audio.volume = 0.6;
                    audio.play().catch(() => { });
                };

                // Show elo change notification
                const eloChange = response.data?.session?.elo_change;
                if (eloChange && eloChange.change !== 0) {
                    playNotificationSound();
                    const isPositive = eloChange.change > 0;
                    toast(isPositive ? '📈 Điểm ELO tăng!' : '📉 Điểm ELO giảm', {
                        description: `${isPositive ? '+' : ''}${eloChange.change} (${eloChange.previous} → ${eloChange.current})`,
                        duration: 4000,
                    });
                }

                // Show newly unlocked items notifications
                const newlyUnlocked = response.data?.newly_unlocked;
                if (newlyUnlocked && newlyUnlocked.length > 0) {
                    newlyUnlocked.forEach((item, index) => {
                        // Stagger the toasts so they don't overlap
                        setTimeout(() => {
                            playNotificationSound();
                            toast.success('🎉 Mở khóa thành tựu mới!', {
                                description: item.name || item.title || item,
                                duration: 5000,
                            });
                        }, index * 1200);
                    });
                }
            }
        }).catch((err) => {
            console.error('Failed to complete game:', err);
            // Silently fail - user has already moved on
        });

        // Reset local state immediately (don't wait for response)
        startTimeRef.current = null;
        movesCountRef.current = 0;
        gameStateRef.current = null;
    }, [gameId, isAuthenticated]);

    /**
     * Resume a game from saved session
     * @param {string} id - Session ID to resume
     */
    const resumeSession = useCallback(async (id) => {
        if (!isAuthenticated()) return null;

        setIsLoading(true);
        try {
            const response = await getSession(id);
            if (response.success && response.data) {
                setSessionId(id);
                startTimeRef.current = response.data.started_at;
                movesCountRef.current = response.data.moves_count || 0;
                return response.data;
            }
        } catch (err) {
            console.error('Failed to resume session:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
        return null;
    }, [isAuthenticated]);

    /**
     * Increment move count
     */
    const incrementMoves = useCallback(() => {
        movesCountRef.current += 1;
    }, []);

    /**
     * Get elapsed time in seconds
     */
    const getElapsedTime = useCallback(() => {
        if (!startTimeRef.current) return 0;
        return Math.floor((Date.now() - new Date(startTimeRef.current).getTime()) / 1000);
    }, []);

    // Auto-start session on mount if enabled
    useEffect(() => {
        if (autoStart && gameId && isAuthenticated()) {
            startGameSession();
        }
    }, [autoStart, gameId]);

    // Setup auto-save interval for complex games
    useEffect(() => {
        if (autoSave && sessionId) {
            autoSaveIntervalRef.current = setInterval(() => {
                if (gameStateRef.current) {
                    saveProgress(gameStateRef.current);
                }
            }, saveInterval * 1000);
        }

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [autoSave, sessionId, saveInterval, saveProgress]);

    return {
        // State
        sessionId,
        isLoading,
        error,
        isAuthenticated: isAuthenticated(),

        // Actions
        startSession: startGameSession,
        saveProgress,
        completeGame: completeGameSession,
        resumeSession,
        incrementMoves,
        getElapsedTime,
    };
};

export default useGameSession;
