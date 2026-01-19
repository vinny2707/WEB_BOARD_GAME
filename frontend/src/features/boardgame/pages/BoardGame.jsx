import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { toast } from 'sonner';

// Components
import LEDMatrix from "../components/LEDMatrix";
import ControlPanel from "../components/ControlPanel";
import GameInfoSidebar from "../components/GameInfoSidebar";
import SnakeHintDialog from "../components/SnakeHintDialog";

// Game info components are now in GameInfoSidebar

// Utils
import { MODES, createEmptyMatrix, MATRIX_ROWS, MATRIX_COLS } from "../utils/constants";
import { GAME_PATTERNS, GAME_KEYS } from "../utils/gamePatterns";
import { drawCenteredText } from "../utils/ledUtils";

// Games
import { getGame } from "../games";

// API
import { getGameById, getGames } from "@/api/gamesApi";

// Game Session Hook
import { useGameSession } from "@/features/games/hooks/useGameSession";

// ============== HELPER PATTERNS ==============

const generateComingSoonPattern = (gameName) => {
  const pattern = createEmptyMatrix();
  drawCenteredText(pattern, gameName, 10, "cyan");
  drawCenteredText(pattern, "COMING SOON", 18, "yellow");
  return pattern;
};

const generateSettingsPattern = (gameType, sizeOptions, selectedIndex) => {
  const pattern = createEmptyMatrix();
  if (!sizeOptions || sizeOptions.length === 0) return pattern;

  const selectedSize = sizeOptions[selectedIndex]?.value || 3;
  const isLargeBoard = selectedSize > 5 || gameType?.startsWith?.("caro");
  const cellSize = isLargeBoard ? 1 : 3;
  const gap = isLargeBoard ? 1 : 2;
  const gridW = selectedSize * cellSize + (selectedSize - 1) * gap;
  const gridH = gridW;

  if (gridH > MATRIX_ROWS || gridW > MATRIX_COLS) {
    drawCenteredText(pattern, `${selectedSize}x${selectedSize}`, 10, "red");
    return pattern;
  }

  const oR = Math.floor((MATRIX_ROWS - gridH) / 2);
  const oC = Math.floor((MATRIX_COLS - gridW) / 2);

  for (let row = 0; row < selectedSize; row++) {
    for (let col = 0; col < selectedSize; col++) {
      const r = oR + row * (cellSize + gap);
      const c = oC + col * (cellSize + gap);

      if (isLargeBoard) {
        if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
          pattern[r][c] = "cyan";
        }
      } else {
        const centerR = r + 1;
        const centerC = c + 1;
        if (centerR < MATRIX_ROWS && centerC < MATRIX_COLS) pattern[centerR][centerC] = "yellow";
        if (r < MATRIX_ROWS && c < MATRIX_COLS) pattern[r][c] = "cyan";
        if (r < MATRIX_ROWS && c + 2 < MATRIX_COLS) pattern[r][c + 2] = "cyan";
        if (r + 2 < MATRIX_ROWS && c < MATRIX_COLS) pattern[r + 2][c] = "cyan";
        if (r + 2 < MATRIX_ROWS && c + 2 < MATRIX_COLS) pattern[r + 2][c + 2] = "cyan";
      }
    }
  }

  const arrowRow = Math.floor(MATRIX_ROWS / 2);
  if (selectedIndex > 0 && oC > 4) {
    pattern[arrowRow][2] = "white";
    pattern[arrowRow - 1][3] = "white";
    pattern[arrowRow + 1][3] = "white";
  }
  if (selectedIndex < sizeOptions.length - 1 && MATRIX_COLS - (oC + gridW) > 4) {
    pattern[arrowRow][MATRIX_COLS - 3] = "white";
    pattern[arrowRow - 1][MATRIX_COLS - 4] = "white";
    pattern[arrowRow + 1][MATRIX_COLS - 4] = "white";
  }

  return pattern;
};

// ============== MAIN COMPONENT ==============

const BoardGame = () => {
  const navigate = useNavigate();

  // Mode state
  const [mode, setMode] = useState(MODES.GAME_SELECT);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [activeGameKey, setActiveGameKey] = useState(null);
  const [loading, setLoading] = useState(false);

  // Settings
  const [sizeOptions, setSizeOptions] = useState([]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [apiGameId, setApiGameId] = useState(null);

  // Game ID map from backend (backendType -> { id, enabled })
  const [gameIdMap, setGameIdMap] = useState({});

  // Game state (managed by game module)
  const [gameState, setGameState] = useState(null);
  const [showHint, setShowHint] = useState(false); // For Snake hint dialog
  const [hoverCell, setHoverCell] = useState(-1); // For mouse hover effect
  const gameModule = activeGameKey ? getGame(activeGameKey) : null;

  // Game session hook (for API integration)
  const {
    startSession,
    completeGame: completeGameSession,
    incrementMoves,
    isAuthenticated,
    checkInProgressSession,
    setResumeSessionId,
    saveProgress,
  } = useGameSession(apiGameId);

  // Audio refs
  const tickRef = useRef(null);
  const winRef = useRef(null);
  const loseRef = useRef(null);

  // Game state ref for stable callbacks
  const gameStateRef = useRef(gameState);

  // Track if session has been completed to avoid duplicates
  const sessionCompletedRef = useRef(false);

  useEffect(() => {
    tickRef.current = new Audio("/sounds/tick.mp3");
    winRef.current = new Audio("/sounds/Victory.mp3");
    loseRef.current = new Audio("/sounds/Defeat.mp3");
  }, []);

  const playSound = useCallback((ref) => {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => { });
    }
  }, []);

  // Fetch all games to build ID map on mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await getGames({ limit: 50 });
        if (response.success && response.data?.games) {
          const idMap = {};
          response.data.games.forEach(game => {
            if (game.type) {
              idMap[game.type] = { id: game.id, enabled: game.enabled };
            }
          });
          setGameIdMap(idMap);
          console.log("Game ID Map:", idMap);
        }
      } catch (err) {
        console.error("Failed to fetch games:", err);
      }
    };
    fetchGames();
  }, []);

  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Timer effect (for turn-based games like TicTacToe)
  useEffect(() => {
    if (mode === MODES.PLAYING && gameState?.status === 'playing' && gameState?.turnTime !== undefined) {
      const timer = setInterval(() => {
        setGameState(prev => {
          if (!prev || prev.status !== 'playing') return prev;
          if (prev.turnTime <= 0) {
            // Timeout - current player loses
            const winner = prev.currentPlayer === 'X' ? 'O' : 'X';
            playSound(winner === 'X' ? winRef : loseRef);
            return { ...prev, status: 'win', winner, winLine: [] };
          }
          return { ...prev, turnTime: prev.turnTime - 1 };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, gameState?.status, gameState?.turnTime]);

  // Automatic movement for Snake game
  useEffect(() => {
    // Only start timer when entering Snake game
    if (mode !== MODES.PLAYING || activeGameKey !== 'snake') {
      return;
    }

    console.log('Starting Snake movement timer');

    const moveTimer = setInterval(() => {
      // Use callback form to always get latest state
      setGameState(currentState => {
        if (!currentState || currentState.status !== 'playing') {
          return currentState;
        }

        const module = getGame('snake');
        if (!module) return currentState;

        const newState = module.makeMove(currentState, 0, null);

        if (newState.status === 'gameover') {
          console.log('🔴 Game Over! Saving session...', {
            score: newState.score,
            isAuthenticated,
            apiGameId,
            sessionCompletedRef: sessionCompletedRef.current
          });
          playSound(loseRef);

          // Save game session only if not already completed
          if (!sessionCompletedRef.current) {
            sessionCompletedRef.current = true;
            console.log('💾 Calling completeGameSession...');
            setTimeout(() => {
              try {
                completeGameSession({
                  result: 'loss',
                  score: newState.score,
                  gameState: newState,
                });
                console.log('✅ completeGameSession called successfully');
              } catch (error) {
                console.error('❌ Error calling completeGameSession:', error);
              }
            }, 100);
          } else {
            console.log('⚠️ Session already completed, skipping');
          }

          return newState;
        }

        // Play sound if ate food
        if (newState.score > currentState.score) {
          playSound(tickRef);
        }

        return newState;
      });
    }, 120); // Fixed speed, or get from initial state

    return () => {
      console.log('Cleaning up Snake movement timer');
      clearInterval(moveTimer);
    };
    // Only recreate when mode or game changes, NOT on state changes
  }, [mode, activeGameKey, completeGameSession, playSound, tickRef, loseRef]);


  // Current game pattern (for game select screen)
  const currentGamePatternKey = GAME_KEYS[currentGameIndex];
  const currentGamePattern = GAME_PATTERNS[currentGamePatternKey];

  // ============== ACTIONS ==============

  // Load game settings from API
  const loadGameSettings = useCallback(async () => {
    setLoading(true);

    // Get dynamic ID from gameIdMap, fallback to hardcoded apiId
    const backendType = currentGamePattern?.backendType;
    const dynamicId = gameIdMap[backendType]?.id;
    const gameApiId = dynamicId || currentGamePattern?.apiId;

    if (gameApiId) setApiGameId(gameApiId);

    // Get game module to use as fallback
    const module = getGame(currentGamePatternKey);
    const fallbackOptions = module?.sizeOptions || [{ label: "3x3", value: 3 }];

    try {
      if (gameApiId) {
        const detailRes = await getGameById(gameApiId);
        if (detailRes.success && detailRes.data?.settings?.boardSize) {
          setSizeOptions(detailRes.data.settings.boardSize.options || fallbackOptions);
          const defaultIdx = detailRes.data.settings.boardSize.options?.findIndex(
            o => o.value === detailRes.data.settings.boardSize.value
          ) ?? 0;
          setSelectedSizeIndex(Math.max(0, defaultIdx));
        } else {
          // Use game module's size options as fallback
          setSizeOptions(fallbackOptions);
          setSelectedSizeIndex(0);
        }
      } else {
        setSizeOptions(fallbackOptions);
        setSelectedSizeIndex(0);
      }
    } catch (err) {
      console.error("Failed to load game settings:", err);
      setSizeOptions(fallbackOptions);
      setSelectedSizeIndex(0);
    } finally {
      setLoading(false);
    }
  }, [currentGamePattern, currentGamePatternKey, gameIdMap]);

  // Enter settings mode
  const enterSettings = useCallback(async () => {
    // Check if game is enabled
    const backendType = currentGamePattern?.backendType;
    const gameInfo = gameIdMap[backendType];

    if (gameInfo && gameInfo.enabled === false) {
      toast.error(`Game "${currentGamePattern?.name}" đang tạm khóa!`);
      return;
    }

    setActiveGameKey(currentGamePatternKey);
    await loadGameSettings();
    setMode(MODES.SETTINGS);
  }, [currentGamePatternKey, currentGamePattern, gameIdMap, loadGameSettings]);

  // Handle manual resume from history
  const handleResume = useCallback((session) => {
    if (session && session.game_state) {
      console.log("Resuming session:", session);

      // key from session or current pattern (normalize API format to game key)
      let gameType = session.game_type || currentGamePatternKey;
      // API returns 'caro_4' but game key is 'caro4'
      if (gameType === 'caro_4') gameType = 'caro4';
      if (gameType === 'caro_5') gameType = 'caro5';
      setActiveGameKey(gameType);

      // Ensure apiGameId is set for the session hook
      if (session.game_id) {
        setApiGameId(session.game_id);
      }

      // Load game state
      const rawState = session.game_state || {};
      const settings = session.settings || {};
      const size = rawState.size || rawState.boardSize || settings.boardSize || 3;
      const turnTime = rawState.turnTime || settings.timePerTurn || 30;

      setGameState({
        ...rawState,
        size: size,
        boardSize: size, // Keep both for safety
        turnTime: turnTime,
        currentPlayer: 'X', // User's turn by default as requested
        status: 'playing',   // Force status to playing to ensure controls work
        winLine: rawState.winLine || [],
        winner: rawState.winner || null,
        selectedCell: (rawState.selectedCell !== undefined && rawState.selectedCell !== null)
          ? rawState.selectedCell
          : Math.floor((size * size) / 2)
      });

      // Update session ID for tracking
      setResumeSessionId(session.id, session.started_at, session.moves_count);

      // Switch to playing mode
      setMode(MODES.PLAYING);

      toast.success("Đã khôi phục ván chơi!");
    }
  }, [setResumeSessionId, currentGamePatternKey]);

  // Start game
  const startGame = useCallback(async () => {
    console.log('startGame called', { gameModule, activeGameKey, sizeOptions, selectedSizeIndex });

    if (!gameModule) {
      console.error("No game module for:", activeGameKey);
      return;
    }

    // Session completion is already handled by executeMove when game ends
    // No need to complete here - just reset the ref for the new game

    const selectedSize = sizeOptions[selectedSizeIndex]?.value || 3;
    console.log('Creating initial state with size:', selectedSize);

    const initialState = gameModule.createInitialState({
      size: selectedSize,
      difficulty: 'medium',
      turnTime: 30,
    });

    // Reset session completed flag for new game
    sessionCompletedRef.current = false;

    // Start game session (API) - MUST await to get new session ID
    if (isAuthenticated && apiGameId) {
      console.log('Starting game session with API...', { apiGameId, selectedSize });
      const newSessionId = await startSession({ size: selectedSize, difficulty: 'medium' }, initialState);
      console.log('New session started with ID:', newSessionId);
    } else {
      console.log('Not authenticated or no apiGameId', { isAuthenticated, apiGameId });
    }

    // Set game state AFTER session is started (ensures sessionId is available)
    console.log('Initial state created:', initialState);
    setGameState(initialState);
    setMode(MODES.PLAYING);
    playSound(tickRef);
  }, [gameModule, activeGameKey, sizeOptions, selectedSizeIndex, isAuthenticated, apiGameId, startSession, playSound]);

  // Back to selection
  const backToSelect = useCallback(() => {
    setMode(MODES.GAME_SELECT);
    setActiveGameKey(null);
    setGameState(null);
    setSizeOptions([]);
  }, []);

  // Execute move logic (shared between keyboard and mouse)
  const executeMove = useCallback((cellIndex) => {
    if (!gameModule || !gameState) return;

    // IMPORTANT: Do NOT override selectedCell here.
    // Match3's makeMove() manages selection internally:
    // - If selectedCell === -1 -> selects first
    // - If same cell -> deselects
    // - If adjacent -> attempts swap
    const newState = gameModule.makeMove({ ...gameState }, cellIndex, 'X');
    playSound(tickRef);

    // Handle terminal states
    if (newState.status === 'win' || (activeGameKey === 'match3' && newState.status === 'gameover')) {
      setGameState(newState);

      if (activeGameKey === 'match3') {
        const isWin = newState.status === 'win';
        playSound(isWin ? winRef : loseRef);
        sessionCompletedRef.current = true;
        completeGameSession({
          result: isWin ? 'win' : 'loss',
          score: typeof newState.score === 'number' ? newState.score : (isWin ? 100 : 0),
          gameState: newState,
        });
      } else {
        // Default behavior for other games using 'win'
        playSound(newState.winner === 'X' ? winRef : loseRef);
        sessionCompletedRef.current = true;
        completeGameSession({
          result: newState.winner === 'X' ? 'win' : 'loss',
          score: newState.winner === 'X' ? 100 : 0,
          gameState: newState,
        });
      }
      return;
    }

    // Generic gameover handling (non-Match3 games that return 'gameover')
    if (newState.status === 'gameover') {
      setGameState(newState);
      playSound(loseRef);
      sessionCompletedRef.current = true;
      completeGameSession({
        result: 'loss',
        score: typeof newState.score === 'number' ? newState.score : 0,
        gameState: newState,
      });
      return;
    }

    if (newState.status === 'draw') {
      setGameState(newState);
      sessionCompletedRef.current = true;
      completeGameSession({ result: 'draw', score: 50, gameState: newState });
      return;
    }

    incrementMoves();
    saveProgress(newState);

    setGameState({ ...newState, isAIThinking: true });

    setTimeout(() => {
      // Check if AI function exists (some games like match3 don't have AI)
      if (!gameModule.getAIMove) {
        setGameState({ ...newState, isAIThinking: false });
        return;
      }
      
      const aiMove = gameModule.getAIMove(newState);
      if (aiMove !== -1) {
        const afterAI = gameModule.makeMove(newState, aiMove, 'O');
        playSound(tickRef);

        if (afterAI.status === 'win') {
          playSound(afterAI.winner === 'X' ? winRef : loseRef);
          sessionCompletedRef.current = true;
          completeGameSession({
            result: afterAI.winner === 'X' ? 'win' : 'loss',
            score: afterAI.winner === 'X' ? 100 : 0,
            gameState: afterAI,
          });
        } else if (afterAI.status === 'draw') {
          sessionCompletedRef.current = true;
          completeGameSession({
            result: 'draw',
            score: 50,
            gameState: afterAI,
          });
        } else {
          // Save progress after AI move if game continues
          saveProgress(afterAI);
        }

        setGameState({ ...afterAI, isAIThinking: false });
      } else {
        setGameState({ ...newState, isAIThinking: false });
      }
    }, 300);
  }, [gameModule, gameState, completeGameSession, incrementMoves, saveProgress, playSound, tickRef, winRef, loseRef]);

  // Handle click on matrix (mouse support) - DISABLED FOR MATCH3
  const handleMatrixClick = useCallback((row, col) => {
    // Disable mouse click for Match3 - only use arrow keys + Enter
    if (activeGameKey === 'match3') return;
    
    if (mode === MODES.PLAYING && gameModule && gameState) {
      if (gameState.status === 'playing' && gameState.currentPlayer === 'X' && !gameState.isAIThinking) {

        let cellIndex = -1;
        if (gameModule.getCellFromMatrix) {
          cellIndex = gameModule.getCellFromMatrix(gameState, row, col);
        }

        if (cellIndex !== -1) {
          // Move selection to clicked cell
          setGameState(prev => ({ ...prev, selectedCell: cellIndex }));

          // If valid move, execute immediately
          if (gameModule.isValidMove(gameState, cellIndex)) {
            executeMove(cellIndex);
          }
        }
      }
    }
  }, [mode, gameModule, gameState, executeMove, activeGameKey]);

  // ============== DRAG & DROP SUPPORT (MATCH-3) - DISABLED ==============
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState(-1);

  const handleMatrixMouseDown = useCallback((row, col) => {
    // DISABLED: Match3 only uses arrow keys + Enter
    return;
    
    if (mode !== MODES.PLAYING || activeGameKey !== 'match3') return;

    if (gameModule?.getCellFromMatrix) {
      const cellIndex = gameModule.getCellFromMatrix(gameState, row, col);
      if (cellIndex !== -1) {
        setIsDragging(true);
        setDragStartCell(cellIndex);
        // Also set cursor/selection for visual feedback
        setCursorPos(cellIndex);
        setGameState(prev => ({ ...prev, selectedCell: cellIndex }));
      }
    }
  }, [mode, activeGameKey, gameModule, gameState]);

  const handleMatrixMouseUp = useCallback(() => {
    // DISABLED: Match3 only uses arrow keys + Enter
    return;
    
    setIsDragging(false);
    setDragStartCell(-1);
  }, []);

  // Update hover to handle drag-swap - DISABLED FOR MATCH3
  const handleMatrixHover = useCallback((row, col) => {
    // Disable hover/drag for Match3 - only use arrow keys + Enter
    if (activeGameKey === 'match3') return;
    
    if (mode === MODES.PLAYING && gameModule && gameState) {
      let cellIndex = -1;

      // Calculate cell index
      if (gameModule.getCellFromMatrix) {
        cellIndex = gameModule.getCellFromMatrix(gameState, row, col);
      } else {
        // Fallback for simple grids if needed, but not used for Match3
      }

      // 1. Handle Drag Swap
      if (isDragging && activeGameKey === 'match3' && dragStartCell !== -1 && cellIndex !== -1) {
        if (cellIndex !== dragStartCell) {
          // User dragged to a DIFFERENT cell. Attempt swap/move.
          // But first, check if it's adjacent? The game logic checks that.
          // We can just trigger the move.

          // To prevent multiple swaps while dragging, we should check if we already swapped?
          // Actually, 'executeMove' will deselect if swap fails, or process if supports.
          // For Match-3, 'makeMove' handles logic. 
          // We should trigger executeMove(cellIndex).
          // Since dragStartCell is ALREADY selected (in MouseDown), executeMove(cellIndex) will try to swap Selected <-> CellIndex.
          executeMove(cellIndex);

          // After swap attempt, stop dragging to prevent chaos
          setIsDragging(false);
          setDragStartCell(-1);
        }
      }

      // 2. Standard Hover Effect
      if (row === -1 || col === -1) {
        setHoverCell(-1);
        return;
      }
      if (gameState.status === 'playing' && gameState.currentPlayer === 'X' && !gameState.isAIThinking) {
        setHoverCell(cellIndex !== -1 && (gameState.board ? !gameState.board[cellIndex] : false) ? cellIndex : -1);
      }
    } else {
      setHoverCell(-1);
    }
  }, [mode, gameModule, gameState, isDragging, activeGameKey, dragStartCell, executeMove]);

  // Player move (Enter key)
  const handlePlayerMove = useCallback(() => {
    if (!gameModule || !gameState) return;
    if (gameState.status !== 'playing' || gameState.currentPlayer !== 'X') return;
    if (gameModule.isValidMove(gameState, gameState.selectedCell)) {
      executeMove(gameState.selectedCell);
    }
  }, [gameModule, gameState, executeMove]);

  // Reset game (delegates to startGame for proper session handling)
  const resetGame = useCallback(() => {
    if (!gameModule) return;
    // Use startGame which handles completing old session and starting new one
    startGame();
  }, [gameModule, startGame]);

  // ============== CONTROLS ==============

  // ============== CONTROLS ==============

  // Cursor state for navigation (separate from game selection)
  const [cursorPos, setCursorPos] = useState(0);

  // Sync cursor with selection when selection changes externally (optional)
  useEffect(() => {
    if (gameState?.selectedCell !== undefined && gameState.selectedCell !== -1) {
      // Logic decision: Should cursor jump to selection?
      // Usually yes, if the user clicked something, cursor should go there.
      setCursorPos(gameState.selectedCell);
    }
  }, [gameState?.selectedCell]);

  const handleLeft = useCallback(() => {
    if (mode === MODES.GAME_SELECT) {
      setCurrentGameIndex(prev => (prev - 1 + GAME_KEYS.length) % GAME_KEYS.length);
    } else if (mode === MODES.SETTINGS) {
      setSelectedSizeIndex(prev => Math.max(0, prev - 1));
    } else if (mode === MODES.PLAYING && gameModule) {
      const currentState = gameStateRef.current;
      if (!currentState) return;

      if (activeGameKey === 'snake' && currentState.status === 'playing') {
        // Snake uses direction
        const newDirection = gameModule.getCellFromNav(currentState, 'left');
        setGameState(prev => ({ ...prev, direction: newDirection }));
      } else if (currentState.status === 'playing' && currentState.currentPlayer === 'X' && !currentState.isAIThinking) {
        // MATCH-3 SPECIFIC: Move Cursor, NOT Selection
        if (activeGameKey === 'match3') {
          const newCursor = gameModule.getCellFromNav(currentState, 'left', cursorPos);
          setCursorPos(newCursor);
        } else {
          // ORIGINAL LOGIC for TicTacToe/Caro
          const newCell = gameModule.getCellFromNav(currentState, 'left');
          setGameState(prev => ({ ...prev, selectedCell: newCell }));
        }
      }
    }
  }, [mode, activeGameKey, gameModule, cursorPos]);

  const handleRight = useCallback(() => {
    if (mode === MODES.GAME_SELECT) {
      setCurrentGameIndex(prev => (prev + 1) % GAME_KEYS.length);
    } else if (mode === MODES.SETTINGS) {
      setSelectedSizeIndex(prev => Math.min(sizeOptions.length - 1, prev + 1));
    } else if (mode === MODES.PLAYING && gameModule) {
      const currentState = gameStateRef.current;
      if (!currentState) return;

      if (activeGameKey === 'snake' && currentState.status === 'playing') {
        const newDirection = gameModule.getCellFromNav(currentState, 'right');
        setGameState(prev => ({ ...prev, direction: newDirection }));
      } else if (currentState.status === 'playing' && currentState.currentPlayer === 'X' && !currentState.isAIThinking) {
        if (activeGameKey === 'match3') {
          const newCursor = gameModule.getCellFromNav(currentState, 'right', cursorPos);
          setCursorPos(newCursor);
        } else {
          const newCell = gameModule.getCellFromNav(currentState, 'right');
          setGameState(prev => ({ ...prev, selectedCell: newCell }));
        }
      }
    }
  }, [mode, activeGameKey, sizeOptions.length, gameModule, cursorPos]);

  const handleUp = useCallback(() => {
    if (mode === MODES.PLAYING && gameModule) {
      const currentState = gameStateRef.current;
      if (!currentState) return;

      if (activeGameKey === 'snake' && currentState.status === 'playing') {
        const newDirection = gameModule.getCellFromNav(currentState, 'up');
        setGameState(prev => ({ ...prev, direction: newDirection }));
      } else if (currentState.status === 'playing' && currentState.currentPlayer === 'X' && !currentState.isAIThinking) {
        if (activeGameKey === 'match3') {
          const newCursor = gameModule.getCellFromNav(currentState, 'up', cursorPos);
          setCursorPos(newCursor);
        } else {
          const newCell = gameModule.getCellFromNav(currentState, 'up');
          setGameState(prev => ({ ...prev, selectedCell: newCell }));
        }
      }
    }
  }, [mode, activeGameKey, gameModule, cursorPos]);

  const handleDown = useCallback(() => {
    if (mode === MODES.PLAYING && gameModule) {
      const currentState = gameStateRef.current;
      if (!currentState) return;

      if (activeGameKey === 'snake' && currentState.status === 'playing') {
        const newDirection = gameModule.getCellFromNav(currentState, 'down');
        setGameState(prev => ({ ...prev, direction: newDirection }));
      } else if (currentState.status === 'playing' && currentState.currentPlayer === 'X' && !currentState.isAIThinking) {
        if (activeGameKey === 'match3') {
          const newCursor = gameModule.getCellFromNav(currentState, 'down', cursorPos);
          setCursorPos(newCursor);
        } else {
          const newCell = gameModule.getCellFromNav(currentState, 'down');
          setGameState(prev => ({ ...prev, selectedCell: newCell }));
        }
      }
    }
  }, [mode, activeGameKey, gameModule, cursorPos]);

  const handleEnter = useCallback(() => {
    console.log('handleEnter called', { mode, activeGameKey, gameState, cursorPos });

    if (mode === MODES.GAME_SELECT) {
      console.log('Entering settings...');
      enterSettings();
    } else if (mode === MODES.SETTINGS) {
      console.log('Starting game from settings...');
      startGame();
    } else if (mode === MODES.PLAYING) {
      // For Snake, Enter restarts on game over
      if (activeGameKey === 'snake' && gameState?.status === 'gameover') {
        console.log('Restarting Snake game...');
        resetGame();
      } else if (gameState?.status === 'playing') {
        // MATCH-3 SPECIFIC: "Select with Cursor" or "Swap with Cursor"
        if (activeGameKey === 'match3') {
          // Execute move on the CURSOR position
          executeMove(cursorPos);
        } else {
          // For other turn-based games
          console.log('Making player move...');
          handlePlayerMove();
        }
      } else {
        // For other games, Enter restarts
        console.log('Restarting game...');
        if (activeGameKey === 'snake') {
          resetGame();
        } else {
          toast.info("Bắt đầu ván mới!");
          startGame();
        }
      }
    }
  }, [mode, activeGameKey, gameState, enterSettings, startGame, handlePlayerMove, resetGame, cursorPos, executeMove]);

  const handleBack = useCallback(() => {
    // Save game state for Snake before going back
    if (mode === MODES.PLAYING && activeGameKey === 'snake' && gameState) {
      if (gameState.status === 'playing') {
        console.log('Saving Snake game state (in progress) before back...');
        const gameStateToSave = {
          snake: gameState.snake,
          food: gameState.food,
          direction: gameState.direction,
          score: gameState.score,
          size: gameState.size,
        };
        saveProgress(gameStateToSave);
      } else if (gameState.status === 'gameover') {
        console.log('🔴 Game already over, completing session before back...', {
          score: gameState.score,
          isAuthenticated,
          apiGameId,
          sessionCompletedRef: sessionCompletedRef.current
        });
        // If game is over but session not completed yet, complete it now
        if (!sessionCompletedRef.current) {
          sessionCompletedRef.current = true;
          console.log('💾 Calling completeGameSession from handleBack...');
          try {
            completeGameSession({
              result: 'loss',
              score: gameState.score,
              gameState: gameState,
            });
            console.log('✅ completeGameSession called successfully from handleBack');
          } catch (error) {
            console.error('❌ Error calling completeGameSession from handleBack:', error);
          }
        } else {
          console.log('⚠️ Session already completed, skipping');
        }
      }
    }

    if (mode === MODES.PLAYING) {
      // From playing, go back to settings (size selection)
      setMode(MODES.SETTINGS);
      setGameState(null);
      setHoverCell(-1);
    } else if (mode === MODES.SETTINGS) {
      // From settings, go back to game selection
      backToSelect();
    } else {
      navigate("/games");
    }
  }, [mode, activeGameKey, gameState, saveProgress, completeGameSession, backToSelect, navigate, isAuthenticated, apiGameId]);

  const handleHint = useCallback(() => {
    console.log('🔍 handleHint called', { mode, activeGameKey, showHint });
    if (mode === MODES.PLAYING && activeGameKey === 'snake') {
      // For Snake, toggle hint display
      console.log('🎯 Toggling hint for Snake');
      setShowHint(prev => {
        console.log('📝 showHint changing from', prev, 'to', !prev);
        return !prev;
      });
    } else if (mode === MODES.PLAYING && gameModule && gameState) {
      // For other games, show AI hint move
      if (gameState.status === 'playing' && gameState.currentPlayer === 'X') {
        // Check hints remaining
        const hintsRemaining = gameState.hintsRemaining ?? 3;
        if (hintsRemaining <= 0) {
          toast.error("Đã hết lượt gợi ý!");
          return;
        }

        // Use getHintMove (hard AI) if available, fallback to getAIMove
        const hintFn = gameModule.getHintMove || gameModule.getAIMove;
        
        if (!hintFn) {
          console.log('⚠️ No hint function available for this game');
          return;
        }
        
        const hintMove = hintFn(gameState);

        if (hintMove !== -1) {
          setGameState(prev => ({
            ...prev,
            selectedCell: hintMove,
            hintsRemaining: (prev.hintsRemaining ?? 3) - 1
          }));
          toast.info(`Gợi ý! Còn ${hintsRemaining - 1} lượt`);
        }
      }
    }
  }, [mode, activeGameKey, gameModule, gameState, showHint]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handleLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleRight();
          break;
        case "ArrowUp":
          e.preventDefault();
          handleUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          handleDown();
          break;
        case "Enter":
          e.preventDefault();
          handleEnter();
          break;
        case "Escape":
          handleBack();
          break;
        case "h":
        case "H":
          e.preventDefault();
          handleHint();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLeft, handleRight, handleUp, handleDown, handleEnter, handleBack, handleHint]);

  // ============== DISPLAY ==============

  const displayPattern = useMemo(() => {
    if (mode === MODES.GAME_SELECT) {
      return currentGamePattern?.pattern || createEmptyMatrix();
    }

    if (mode === MODES.SETTINGS) {
      // Use custom settings renderer if available
      if (gameModule?.renderSettingsToMatrix) {
        const selectedSize = sizeOptions[selectedSizeIndex]?.value || 8;
        const pattern = gameModule.renderSettingsToMatrix(selectedSize);

        // Add arrows for navigation
        const arrowRow = Math.floor(MATRIX_ROWS / 2);

        // Left arrow
        if (selectedSizeIndex > 0) {
          pattern[arrowRow][2] = "white";
          pattern[arrowRow - 1][3] = "white";
          pattern[arrowRow + 1][3] = "white";
        }

        // Right arrow
        if (selectedSizeIndex < sizeOptions.length - 1) {
          pattern[arrowRow][MATRIX_COLS - 3] = "white";
          pattern[arrowRow - 1][MATRIX_COLS - 4] = "white";
          pattern[arrowRow + 1][MATRIX_COLS - 4] = "white";
        }

        return pattern;
      }
      // For other games, use default settings pattern
      return generateSettingsPattern(currentGamePattern?.type, sizeOptions, selectedSizeIndex);
    }


    if (mode === MODES.PLAYING && gameModule && gameState) {
      // Show hint overlay for Snake if showHint is true
      if (activeGameKey === 'snake' && showHint && gameModule?.renderHint) {
        return gameModule.renderHint();
      }

      // For Match-3, pass cursorPos
      if (activeGameKey === 'match3') {
        return gameModule.renderToMatrix({ ...gameState, cursorPos, hoverCell });
      }

      // For other games, pass hover state if needed (standard render)
      return gameModule.renderToMatrix({ ...gameState, hoverCell });
    }

    return createEmptyMatrix();
  }, [mode, currentGamePattern, sizeOptions, selectedSizeIndex, gameModule, gameState, activeGameKey, showHint, hoverCell, cursorPos]);

  // ============== RENDER ==============

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-12">
        {/* Game title */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">
            {mode === MODES.GAME_SELECT
              ? currentGamePattern?.name || "SELECT GAME"
              : gameModule?.name || currentGamePattern?.name || "GAME"
            }
          </h1>
        </div>

        {/* Match-3 HUD: Score + Moves (and Target) */}
        {mode === MODES.PLAYING && activeGameKey === 'match3' && gameState && (
          <div className="mb-3 flex items-center gap-3">
            <div className="px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-cyan-300">
              Score: {gameState.score}
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-amber-300">
              Moves: {gameState.movesLeft}
            </div>
            {(() => {
              const val = gameState.targetScore;
              const num = typeof val === 'number' ? val : Number(String(val ?? '').replace(/[^0-9]/g, ''));
              return Number.isFinite(num) && num > 0;
            })() && (
              <div className="px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-emerald-300">
                Target: {(() => {
                  const val = gameState.targetScore;
                  const num = typeof val === 'number' ? val : Number(String(val ?? '').replace(/[^0-9]/g, ''));
                  return Number.isFinite(num) && num > 0 ? num : '';
                })()}
              </div>
            )}
          </div>
        )}

        {/* LED Matrix Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-slate-800/30 rounded-2xl blur-xl" />
          <div className="relative bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50">
            <LEDMatrix
              pattern={displayPattern}
              onCellClick={mode === MODES.PLAYING && activeGameKey !== 'match3' ? handleMatrixClick : null}
              onCellHover={activeGameKey !== 'match3' ? handleMatrixHover : null}
              onMouseDown={null}
              onMouseUp={null}
            />
          </div>
        </div>

        {/* End-of-game banner for Match-3 */}
        {mode === MODES.PLAYING && activeGameKey === 'match3' && gameState && gameState.status !== 'playing' && (
          <div className="mt-4 px-4 py-3 rounded-xl border text-center select-none
                          border-slate-700 bg-slate-900/70 text-slate-200">
            <div className="text-lg font-semibold mb-1">
              {gameState.status === 'win' ? '🎉 Bạn đã THẮNG!' : '💀 Bạn đã THUA!'}
            </div>
            <div className="text-sm text-slate-300">
              Điểm: {gameState.score}{typeof gameState.targetScore === 'number' ? ` / Mục tiêu: ${gameState.targetScore}` : ''}
            </div>
            <div className="text-xs mt-2 text-cyan-300">Nhấn Enter để chơi ván mới</div>
          </div>
        )}

        {/* Control Panel */}
        <div className="mt-4">
          <ControlPanel
            onLeft={handleLeft}
            onRight={handleRight}
            onUp={handleUp}
            onDown={handleDown}
            onEnter={handleEnter}
            onBack={handleBack}
            onHint={handleHint}
          />
        </div>

        {/* Bottom panel: Rankings | History | Reviews */}
        {apiGameId && mode === MODES.SETTINGS && (
          <GameInfoSidebar gameId={apiGameId} onResume={handleResume} />
        )}
      </div>

      {/* Hint Dialog for Snake */}
      {showHint && activeGameKey === 'snake' && (
        <SnakeHintDialog onClose={() => setShowHint(false)} />
      )}
    </div>
  );
};

export default BoardGame;
