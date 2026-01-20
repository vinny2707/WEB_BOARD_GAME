/**
 * useGameControls Hook
 * Handles keyboard navigation and input for board games
 */
import { useCallback, useEffect } from 'react';
import { MODES } from '../utils/constants';
import { GAME_KEYS } from '../utils/gamePatterns';

/**
 * @param {Object} params
 * @param {string} params.mode - Current game mode (GAME_SELECT, SETTINGS, PLAYING)
 * @param {string} params.activeGameKey - Currently active game key
 * @param {Object} params.gameModule - Game module with navigation functions
 * @param {React.MutableRefObject} params.gameStateRef - Ref to current game state
 * @param {Function} params.setGameState - State setter for game state
 * @param {Function} params.setCurrentGameIndex - State setter for game selection index
 * @param {Function} params.setSelectedSizeIndex - State setter for size selection
 * @param {Function} params.setHoverCell - State setter for hover cell
 * @param {number} params.sizeOptionsLength - Length of size options array
 * @param {Object} params.handlers - Object with enterSettings, startGame, handlePlayerMove, resetGame, backToSelect, navigate, handleHint, saveProgress, completeGameSession
 * @param {Object} params.gameState - Current game state
 */
export const useGameControls = ({
  mode,
  activeGameKey,
  gameModule,
  gameStateRef,
  setGameState,
  setCurrentGameIndex,
  setSelectedSizeIndex,
  setHoverCell,
  sizeOptionsLength,
  handlers,
  gameState,
  sessionCompletedRef,
  isAuthenticated,
  apiGameId,
}) => {
  const {
    enterSettings,
    startGame,
    handlePlayerMove,
    resetGame,
    backToSelect,
    navigate,
    handleHint,
    saveProgress,
    completeGameSession,
    setMode,
  } = handlers;

  // ============== NAVIGATION HANDLERS ==============

  const handleLeft = useCallback(() => {
    if (mode === MODES.GAME_SELECT) {
      setCurrentGameIndex(prev => (prev - 1 + GAME_KEYS.length) % GAME_KEYS.length);
    } else if (mode === MODES.SETTINGS) {
      setSelectedSizeIndex(prev => Math.max(0, prev - 1));
    } else if (mode === MODES.PLAYING && gameModule) {
      const currentState = gameStateRef.current;
      if (!currentState) return;

      if (activeGameKey === 'snake' && currentState.status === 'playing') {
        const newDirection = gameModule.getCellFromNav(currentState, 'left');
        setGameState(prev => ({ ...prev, direction: newDirection }));
      } else if (currentState.status === 'playing' && currentState.currentPlayer === 'X' && !currentState.isAIThinking) {
        const newCell = gameModule.getCellFromNav(currentState, 'left');
        setGameState(prev => ({ ...prev, selectedCell: newCell }));
      }
    }
  }, [mode, activeGameKey, gameModule, gameStateRef, setGameState, setCurrentGameIndex, setSelectedSizeIndex]);

  const handleRight = useCallback(() => {
    if (mode === MODES.GAME_SELECT) {
      setCurrentGameIndex(prev => (prev + 1) % GAME_KEYS.length);
    } else if (mode === MODES.SETTINGS) {
      setSelectedSizeIndex(prev => Math.min(sizeOptionsLength - 1, prev + 1));
    } else if (mode === MODES.PLAYING && gameModule) {
      const currentState = gameStateRef.current;
      if (!currentState) return;

      if (activeGameKey === 'snake' && currentState.status === 'playing') {
        const newDirection = gameModule.getCellFromNav(currentState, 'right');
        setGameState(prev => ({ ...prev, direction: newDirection }));
      } else if (currentState.status === 'playing' && currentState.currentPlayer === 'X' && !currentState.isAIThinking) {
        const newCell = gameModule.getCellFromNav(currentState, 'right');
        setGameState(prev => ({ ...prev, selectedCell: newCell }));
      }
    }
  }, [mode, activeGameKey, sizeOptionsLength, gameModule, gameStateRef, setGameState, setCurrentGameIndex, setSelectedSizeIndex]);

  const handleUp = useCallback(() => {
    if (mode === MODES.PLAYING && gameModule) {
      const currentState = gameStateRef.current;
      if (!currentState) return;

      if (activeGameKey === 'snake' && currentState.status === 'playing') {
        const newDirection = gameModule.getCellFromNav(currentState, 'up');
        setGameState(prev => ({ ...prev, direction: newDirection }));
      } else if (currentState.status === 'playing' && currentState.currentPlayer === 'X' && !currentState.isAIThinking) {
        const newCell = gameModule.getCellFromNav(currentState, 'up');
        setGameState(prev => ({ ...prev, selectedCell: newCell }));
      }
    }
  }, [mode, activeGameKey, gameModule, gameStateRef, setGameState]);

  const handleDown = useCallback(() => {
    if (mode === MODES.PLAYING && gameModule) {
      const currentState = gameStateRef.current;
      if (!currentState) return;

      if (activeGameKey === 'snake' && currentState.status === 'playing') {
        const newDirection = gameModule.getCellFromNav(currentState, 'down');
        setGameState(prev => ({ ...prev, direction: newDirection }));
      } else if (currentState.status === 'playing' && currentState.currentPlayer === 'X' && !currentState.isAIThinking) {
        const newCell = gameModule.getCellFromNav(currentState, 'down');
        setGameState(prev => ({ ...prev, selectedCell: newCell }));
      }
    }
  }, [mode, activeGameKey, gameModule, gameStateRef, setGameState]);

  // ============== ACTION HANDLERS ==============

  const handleEnter = useCallback(() => {
    console.log('handleEnter called', { mode, activeGameKey, gameState });

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
        // For turn-based games, Enter makes a move
        console.log('Making player move...');
        handlePlayerMove();
      } else {
        // For other games, Enter restarts
        console.log('Restarting game...');
        if (activeGameKey === 'snake') {
          resetGame();
        } else {
          startGame();
        }
      }
    }
  }, [mode, activeGameKey, gameState, enterSettings, startGame, handlePlayerMove, resetGame]);

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
          sessionCompletedRef: sessionCompletedRef?.current
        });
        // If game is over but session not completed yet, complete it now
        if (sessionCompletedRef && !sessionCompletedRef.current) {
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
  }, [mode, activeGameKey, gameState, saveProgress, completeGameSession, backToSelect, navigate, isAuthenticated, apiGameId, sessionCompletedRef, setMode, setGameState, setHoverCell]);

  // ============== KEYBOARD EFFECT ==============

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

  return {
    handleLeft,
    handleRight,
    handleUp,
    handleDown,
    handleEnter,
    handleBack,
  };
};

export default useGameControls;
