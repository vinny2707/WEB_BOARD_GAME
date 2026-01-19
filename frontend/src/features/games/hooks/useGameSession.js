import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { completeGame, startSession, saveSession, getSession, getInProgressSession } from '../../../api/sessionsApi';

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
    const sessionIdRef = useRef(null); // Use ref to ensure latest value in callbacks

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
        if (!isAuthenticated() || !gameId) {
            console.warn('Cannot start session: no auth or gameId', { gameId, isAuth: isAuthenticated() });
            return null;
        }

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
                // Update BOTH ref and state immediately
                sessionIdRef.current = response.data.id;
                setSessionId(response.data.id);
                console.log('✅ Session started successfully:', response.data.id);
                return response.data.id;
            } else {
                console.error('Failed to start session: invalid response', response);
                return null;
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
        // Use sessionIdRef to ensure we have the latest value (state might not be updated yet due to batching)
        const currentSessionId = sessionIdRef.current || sessionId;
        if (!isAuthenticated() || !gameId) {
            console.warn('❌ Cannot complete game: missing auth or gameId', { gameId, isAuth: isAuthenticated() });
            return;
        }

        if (!currentSessionId) {
            console.warn('❌ Cannot complete game: missing sessionId', { 
                gameId, 
                currentSessionId, 
                sessionIdState: sessionId,
                sessionIdRef: sessionIdRef.current,
                isAuth: isAuthenticated() 
            });
            return;
        }

        // Clear auto-save interval
        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
        }

        const timeElapsed = startTimeRef.current
            ? Math.floor((Date.now() - new Date(startTimeRef.current).getTime()) / 1000)
            : result.time_elapsed || 0;

        const payload = {
            result: result.result, // 'win', 'loss', 'draw'
            score: result.score || 0,
            moves_count: result.moves_count || movesCountRef.current,
            time_elapsed: timeElapsed,
            game_state: result.gameState || gameStateRef.current,
        };

        console.log('🚀 Calling completeGame API...', {
            sessionId: currentSessionId,
            payload
        });

        // Fire-and-forget: don't await, don't set loading state
        // This allows user to navigate away immediately
        completeGame(currentSessionId, payload).then((response) => {
            console.log('📥 completeGame API response:', response);
            if (response.success) {
                console.log('✅ Game completed successfully!');
                sessionIdRef.current = null;
                setSessionId(null);

                // Play notification sound
                const playNotificationSound = () => {
                    const audio = new Audio('/sounds/eat.wav');
                    audio.volume = 0.6;
                    audio.play().catch(() => { });
                };

                // Show elo change notification
                const eloChange = response.data?.session?.elo_change_details;
                if (eloChange && eloChange.change !== 0) {
                    playNotificationSound();
                    const isPositive = eloChange.change > 0;
                    const sign = isPositive ? '+' : '';
                    toast(isPositive ? '📈 Điểm ELO tăng!' : '📉 Điểm ELO giảm', {
                        description: `${sign}${eloChange.change} điểm (${eloChange.previous} → ${eloChange.current})`,
                        duration: 4000,
                        type: 'complete',
                    });
                }

                // Show newly unlocked items notifications
                const newlyUnlocked = response.data?.newly_unlocked;
                if (newlyUnlocked && newlyUnlocked.length > 0) {
                    newlyUnlocked.forEach((item, index) => {
                        // Stagger the toasts so they don't overlap
                        setTimeout(() => {
                            playNotificationSound();
                            toast('🎉 Mở khóa thành tựu mới!', {
                                description: item.name || item.title || item,
                                duration: 5000,
                                type: 'complete',
                            });
                        }, index * 1200);
                    });
                }
            } else {
                console.error('❌ completeGame API returned success=false:', response);
            }
        }).catch((err) => {
            console.error('❌ Failed to complete game (API error):', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                response: err.response
            });
            // Silently fail - user has already moved on
        });

        // Reset local state immediately (don't wait for response)
        startTimeRef.current = null;
        movesCountRef.current = 0;
        gameStateRef.current = null;
    }, [gameId, isAuthenticated, sessionId]);

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
     * Check if there's an in-progress session for this game
     * @returns {Object|null} Session data if exists
     */
    const checkInProgressSession = useCallback(async () => {
        if (!isAuthenticated() || !gameId) return null;

        try {
            const session = await getInProgressSession(gameId);
            return session;
        } catch (error) {
            console.error('Failed to check in-progress session:', error);
            return null;
        }
    }, [gameId, isAuthenticated]);

    /**
     * Update game state ref (for beforeunload save)
     * @param {Object} state - Current game state
     */
    const updateGameState = useCallback((state) => {
        gameStateRef.current = state;
    }, []);

    /**
     * Set session ID from a resumed session
     * Call this when resuming a game from history
     * @param {string} id - Session ID from resumeSession
     * @param {string} startedAt - Original start time
     * @param {number} movesCount - Moves count so far
     */
    const setResumeSessionId = useCallback((id, startedAt = null, movesCount = 0) => {
        if (id) {
            sessionIdRef.current = id; // Set ref immediately for use in callbacks
            setSessionId(id);
            if (startedAt) startTimeRef.current = startedAt;
            if (movesCount) movesCountRef.current = movesCount;
            console.log('Resume session ID set:', id);
        }
    }, []);

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

    // Setup beforeunload handler to save on unexpected exit
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (sessionId && gameStateRef.current) {
                // Use sendBeacon for reliable save on page unload
                const token = localStorage.getItem('token');
                const data = JSON.stringify({
                    game_state: gameStateRef.current,
                    moves_count: movesCountRef.current,
                    time_elapsed: startTimeRef.current
                        ? Math.floor((Date.now() - new Date(startTimeRef.current).getTime()) / 1000)
                        : 0,
                });

                // Use sendBeacon API for reliable delivery during unload
                const baseUrl = import.meta.env.VITE_API_URL || '';
                navigator.sendBeacon(
                    `${baseUrl}/api/sessions/${sessionId}/save`,
                    new Blob([data], { type: 'application/json' })
                );
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [sessionId]);

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
        setResumeSessionId,
        incrementMoves,
        getElapsedTime,
        checkInProgressSession,
        updateGameState,
    };
};

export default useGameSession;

