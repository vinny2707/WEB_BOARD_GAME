import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCcw, Lightbulb, Home, BookOpen, X, ChevronRight, ArrowLeft, Save } from 'lucide-react';
import CaroBoard from './CaroBoard';
import { createCaroAI } from './CaroAI';
import { PlayerCard, ScoreDisplay } from './CaroPlayerCard';
import { CaroTutorialPanel } from './CaroTutorialPanel';
import { CaroIdleScreen, CaroGameOverOverlay } from './CaroGameOverlay';
import useGameSession from '../../hooks/useGameSession';

/**
 * Shared Game component for Caro games with tutorial support
 * @param {Object} props
 * @param {number} props.gameId - Game ID for session tracking
 * @param {string} props.gameName - Display name (e.g., "CARO 5 HÀNG")
 * @param {string} props.lobbyPath - Path to lobby (e.g., "/games/gomoku")
 * @param {number} props.winCount - Number of pieces in a row to win (4 or 5)
 * @param {number} props.defaultBoardSize - Default board size if not in settings
 * @param {string} props.theme - 'emerald' or 'amber'
 * @param {Array} props.tutorialSteps - Optional tutorial steps array
 */
const CaroGame = ({ gameId, gameName, lobbyPath, winCount = 5, defaultBoardSize = 15, theme = 'emerald', tutorialSteps = null }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Session tracking for rankings
    const { completeGame, incrementMoves, isAuthenticated, startSession, saveProgress, updateGameState, setResumeSessionId } = useGameSession(gameId);

    // Get settings and possible resume session from lobby navigation state
    const lobbySettings = location.state?.settings || {};
    const resumeSession = location.state?.resumeSession || null;

    // Tutorial state needs to be defined early for boardSize calculation
    const [gameStatus, setGameStatus] = useState(tutorialSteps ? 'idle' : 'playing');
    const [tutorialStep, setTutorialStep] = useState(0);

    // If tutorialSteps exists, always use defaultBoardSize (15) since tutorial positions are hardcoded
    // This ensures board matches tutorial step positions
    const boardSize = tutorialSteps ? defaultBoardSize : (lobbySettings.boardSize || defaultBoardSize);
    const timePerTurn = lobbySettings.timePerTurn ?? 40; // seconds (0 = unlimited)
    const timePerPlayer = lobbySettings.timePerPlayer ?? 240; // seconds (0 = unlimited)
    const firstPlayer = lobbySettings.firstPlayer || 'random';
    const difficulty = lobbySettings.difficulty || 'medium';

    // Create AI dynamically based on boardSize and winCount
    const ai = useMemo(() => createCaroAI(winCount, boardSize), [winCount, boardSize]);
    const { findBestMove, getHint, checkWinner, isDraw } = ai;

    const [board, setBoard] = useState(Array(boardSize * boardSize).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [score, setScore] = useState({ player: 0, ai: 0 });
    // gameStatus already declared above for boardSize calculation
    const [winner, setWinner] = useState(null);
    const [winReason, setWinReason] = useState(null); // 'normal', 'timeout', 'turnTimeout', 'lessTime'
    const [winningLine, setWinningLine] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [playerTime, setPlayerTime] = useState(timePerPlayer);
    const [aiTime, setAiTime] = useState(timePerPlayer);
    const [turnTime, setTurnTime] = useState(timePerTurn);
    const [hintCell, setHintCell] = useState(null);
    const [isAIThinking, setIsAIThinking] = useState(false);

    // Tutorial state (tutorialStep already declared above for boardSize calculation)
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [displayedTitle, setDisplayedTitle] = useState('');
    const typingRef = useRef(null);

    // Audio
    const gameStartSoundRef = useRef(null);
    const victorySoundRef = useRef(null);
    const defeatSoundRef = useRef(null);
    const tickSoundRef = useRef(null);
    const keyboardSoundRef = useRef(null);

    useEffect(() => {
        gameStartSoundRef.current = new Audio('/sounds/GameStart.mp3');
        victorySoundRef.current = new Audio('/sounds/Victory.mp3');
        defeatSoundRef.current = new Audio('/sounds/Defeat.mp3');
        tickSoundRef.current = new Audio('/sounds/tick.mp3');
        keyboardSoundRef.current = new Audio('/sounds/keyboard.wav');
        gameStartSoundRef.current.load();
        victorySoundRef.current.load();
        defeatSoundRef.current.load();
        tickSoundRef.current.load();
        keyboardSoundRef.current.load();
    }, []);

    const playSound = useCallback((soundRef) => {
        if (soundRef.current) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(() => { });
        }
    }, []);

    const stopSound = useCallback((soundRef) => {
        if (soundRef.current) {
            soundRef.current.pause();
            soundRef.current.currentTime = 0;
        }
    }, []);

    const themeColors = {
        emerald: {
            primary: 'bg-emerald-500',
            primaryHover: 'hover:bg-emerald-600',
            border: 'border-emerald-500',
            hoverBorder: 'hover:border-emerald-500',
            text: 'text-emerald-500',
            textHover: 'hover:text-emerald-600',
            gradient: 'from-emerald-500 to-emerald-600',
            hintBg: 'hover:bg-emerald-500/15',
        },
        amber: {
            primary: 'bg-amber-500',
            primaryHover: 'hover:bg-amber-600',
            border: 'border-amber-500',
            hoverBorder: 'hover:border-amber-500',
            text: 'text-amber-500',
            textHover: 'hover:text-amber-600',
            gradient: 'from-amber-500 to-amber-600',
            hintBg: 'hover:bg-amber-500/15',
        }
    };

    const colors = themeColors[theme] || themeColors.emerald;

    // Typewriter effect for tutorial
    useEffect(() => {
        if (gameStatus !== 'tutorial' || !tutorialSteps) return;

        const currentStep = tutorialSteps[tutorialStep];
        if (!currentStep) return;

        if (typingRef.current) {
            clearInterval(typingRef.current);
        }

        setIsTyping(true);
        setDisplayedTitle('');
        setDisplayedText('');

        // Play keyboard typing sound
        playSound(keyboardSoundRef);

        const fullTitle = currentStep.title;
        const fullMessage = currentStep.message;
        let titleIndex = 0;
        let messageIndex = 0;
        let typingPhase = 'title';

        typingRef.current = setInterval(() => {
            if (typingPhase === 'title') {
                if (titleIndex < fullTitle.length) {
                    setDisplayedTitle(fullTitle.slice(0, titleIndex + 1));
                    titleIndex++;
                } else {
                    typingPhase = 'message';
                }
            } else {
                if (messageIndex < fullMessage.length) {
                    setDisplayedText(fullMessage.slice(0, messageIndex + 1));
                    messageIndex++;
                } else {
                    clearInterval(typingRef.current);
                    setIsTyping(false);
                    // Stop keyboard sound when typing is done
                    stopSound(keyboardSoundRef);
                }
            }
        }, 30);

        return () => {
            if (typingRef.current) {
                clearInterval(typingRef.current);
            }
            // Stop keyboard sound on cleanup
            stopSound(keyboardSoundRef);
        };
    }, [tutorialStep, gameStatus, tutorialSteps]);

    // Set board for tutorial steps
    useEffect(() => {
        if (gameStatus !== 'tutorial' || !tutorialSteps) return;

        const currentStep = tutorialSteps[tutorialStep];
        if (currentStep?.boardState) {
            setBoard(currentStep.boardState);
        }
    }, [tutorialStep, gameStatus, tutorialSteps]);

    // Play defeat sound when player loses (for timeout cases)
    useEffect(() => {
        if (gameStatus === 'win' && winner === 'O' && (winReason === 'timeout' || winReason === 'turnTimeout' || winReason === 'lessTime')) {
            playSound(defeatSoundRef);
        }
    }, [gameStatus, winner, winReason]);

    // Submit game results to rankings API when game ends
    useEffect(() => {
        if ((gameStatus === 'win' || gameStatus === 'draw') && isAuthenticated) {
            const result = gameStatus === 'draw' ? 'draw' : (winner === 'X' ? 'win' : 'loss');
            completeGame({
                result,
                score: result === 'win' ? 100 : (result === 'draw' ? 50 : 0),
                gameState: { board, winner, winReason },
            });
        }
    }, [gameStatus, winner, isAuthenticated]);

    // Timer for current player - countdown
    useEffect(() => {
        if (gameStatus !== 'playing') return;
        if (timePerPlayer === 0) return; // Unlimited time

        const timer = setInterval(() => {
            if (isXNext && !isAIThinking) {
                setPlayerTime(prev => {
                    if (prev <= 1) {
                        // Player ran out of time - loses
                        clearInterval(timer);
                        setGameStatus('win');
                        setWinner('O');
                        setWinReason('timeout');
                        setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
                        return 0;
                    }
                    return prev - 1;
                });
            } else if (!isXNext) {
                setAiTime(prev => {
                    if (prev <= 1) {
                        // AI ran out of time - player wins
                        clearInterval(timer);
                        setGameStatus('win');
                        setWinner('X');
                        setWinReason('timeout');
                        setScore(prev => ({ ...prev, player: prev.player + 1 }));
                        return 0;
                    }
                    return prev - 1;
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isXNext, gameStatus, isAIThinking, timePerPlayer]);

    // Turn timer countdown
    useEffect(() => {
        if (gameStatus !== 'playing') return;
        if (timePerTurn === 0) return; // Unlimited turn time

        // Reset turn time when turn changes
        setTurnTime(timePerTurn);

        const turnTimer = setInterval(() => {
            setTurnTime(prev => {
                if (prev <= 1) {
                    // Turn time ran out
                    clearInterval(turnTimer);
                    if (isXNext && !isAIThinking) {
                        // Player ran out of turn time - loses
                        setGameStatus('win');
                        setWinner('O');
                        setWinReason('turnTimeout');
                        setScore(prevScore => ({ ...prevScore, ai: prevScore.ai + 1 }));
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(turnTimer);
    }, [isXNext, gameStatus, isAIThinking, timePerTurn]);

    // AI makes a move
    useEffect(() => {
        if (!isXNext && gameStatus === 'playing' && !isAIThinking) {
            setIsAIThinking(true);
            setHintCell(null);

            const timer = setTimeout(() => {
                const aiMove = findBestMove(board, difficulty);
                if (aiMove !== -1) {
                    makeMove(aiMove, 'O');
                }
                setIsAIThinking(false);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [isXNext, gameStatus, board, difficulty]);

    const makeMove = useCallback((index, player) => {
        const newBoard = [...board];
        newBoard[index] = player;
        setBoard(newBoard);
        setMoveHistory(prev => [...prev, { index, player }]);

        // Track player moves for session
        if (player === 'X') {
            incrementMoves();
        }

        // Play tick sound for each move
        playSound(tickSoundRef);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result.winner);
            setWinReason('normal');
            setWinningLine(result.line);
            setGameStatus('win');
            setScore(prev => ({
                ...prev,
                [result.winner === 'X' ? 'player' : 'ai']: prev[result.winner === 'X' ? 'player' : 'ai'] + 1
            }));
            if (result.winner === 'X') {
                playSound(victorySoundRef);
            } else {
                playSound(defeatSoundRef);
            }
        } else if (isDraw(newBoard)) {
            // Check if time-based win should apply
            if (timePerPlayer > 0 && playerTime !== aiTime) {
                if (playerTime < aiTime) {
                    setWinner('O');
                    setWinReason('lessTime');
                    setGameStatus('win');
                    setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
                } else {
                    setWinner('X');
                    setWinReason('lessTime');
                    setGameStatus('win');
                    setScore(prev => ({ ...prev, player: prev.player + 1 }));
                }
            } else {
                setGameStatus('draw');
            }
        } else {
            setIsXNext(player === 'O');
        }
    }, [board, checkWinner, isDraw, timePerPlayer, playerTime, aiTime]);

    const handleCellClick = (index) => {
        // Tutorial mode
        if (gameStatus === 'tutorial' && tutorialSteps) {
            const currentStep = tutorialSteps[tutorialStep];
            if (currentStep?.action === 'click_cell' && currentStep.allowedMoves.includes(index)) {
                const newBoard = [...board];
                newBoard[index] = 'X';
                setBoard(newBoard);

                // Play tick sound in tutorial
                playSound(tickSoundRef);

                // Check if this completes win in tutorial
                const result = checkWinner(newBoard);

                // Delay before advancing to next step so user can see their move
                // before AI's response (which is baked into next step's boardState)
                setTimeout(() => {
                    setTutorialStep(prev => prev + 1);
                }, 600);
            }
            return;
        }

        // Normal game mode
        if (board[index] || gameStatus !== 'playing' || !isXNext || isAIThinking) return;
        setHintCell(null);
        makeMove(index, 'X');
    };

    const handleUndo = () => {
        if (moveHistory.length < 2 || gameStatus !== 'playing') return;

        const newHistory = moveHistory.slice(0, -2);
        const newBoard = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
        newHistory.forEach(move => {
            newBoard[move.index] = move.player;
        });

        setBoard(newBoard);
        setMoveHistory(newHistory);
        setIsXNext(true);
        setHintCell(null);
    };

    const handleHint = () => {
        if (gameStatus !== 'playing' || !isXNext || isAIThinking) return;

        const hint = getHint(board);
        if (hint !== null && hint !== undefined) {
            setHintCell(hint);
            setTimeout(() => setHintCell(null), 3000);
        }
    };

    const handlePlayAgain = async () => {
        // Start a new session for the new game
        if (isAuthenticated) {
            await startSession({ boardSize, timePerTurn, timePerPlayer, difficulty, winCount });
        }

        setBoard(Array(boardSize * boardSize).fill(null));
        setIsXNext(true);
        setGameStatus('playing');
        setWinner(null);
        setWinReason(null);
        setWinningLine(null);
        setMoveHistory([]);
        setPlayerTime(timePerPlayer);
        setAiTime(timePerPlayer);
        setTurnTime(timePerTurn);
        setHintCell(null);
    };

    const startGame = async () => {
        playSound(gameStartSoundRef);
        setBoard(Array(boardSize * boardSize).fill(null));
        // Determine who starts based on firstPlayer setting
        if (firstPlayer === 'ai') {
            setIsXNext(false);
        } else if (firstPlayer === 'random') {
            setIsXNext(Math.random() > 0.5);
        } else {
            setIsXNext(true);
        }
        setGameStatus('playing');
        setWinner(null);
        setWinReason(null);
        setWinningLine(null);
        setMoveHistory([]);
        setPlayerTime(timePerPlayer);
        setAiTime(timePerPlayer);
        setTurnTime(timePerTurn);
        setHintCell(null);
        setIsAIThinking(false);

        // Start a new session for tracking
        if (isAuthenticated) {
            await startSession({ boardSize, timePerTurn, timePerPlayer, difficulty, winCount });
        }
    };

    // Handle manual save game
    const handleSaveGame = async () => {
        if (gameStatus !== 'playing') return;
        const gameState = {
            board,
            isXNext,
            playerTime,
            aiTime,
            moveHistory,
            boardSize,
        };
        await saveProgress(gameState);
        // Show toast notification
        import('sonner').then(({ toast }) => {
            toast.success('Đã lưu game!', { duration: 2000 });
        });
    };

    // Resume game from session if provided
    useEffect(() => {
        if (resumeSession?.id && gameStatus === 'idle') {
            // Set session ID for completing later
            setResumeSessionId(resumeSession.id, resumeSession.started_at, resumeSession.moves_count);

            // If we have saved game_state, restore it
            if (resumeSession.game_state?.board) {
                const { board: savedBoard, isXNext: savedIsXNext, playerTime: savedPlayerTime, aiTime: savedAiTime, moveHistory: savedMoveHistory } = resumeSession.game_state;
                setBoard(savedBoard);
                setIsXNext(savedIsXNext ?? true);
                setPlayerTime(savedPlayerTime ?? timePerPlayer);
                setAiTime(savedAiTime ?? timePerPlayer);
                setMoveHistory(savedMoveHistory ?? []);
                setGameStatus('playing');
                playSound(gameStartSoundRef);
            } else {
                // No game_state saved yet - start fresh game with same session
                setBoard(Array(boardSize * boardSize).fill(null));
                if (firstPlayer === 'ai') {
                    setIsXNext(false);
                } else if (firstPlayer === 'random') {
                    setIsXNext(Math.random() > 0.5);
                } else {
                    setIsXNext(true);
                }
                setGameStatus('playing');
                setPlayerTime(timePerPlayer);
                setAiTime(timePerPlayer);
                setTurnTime(timePerTurn);
                setMoveHistory([]);
                playSound(gameStartSoundRef);
            }
        }
    }, [resumeSession, setResumeSessionId, boardSize, firstPlayer, timePerPlayer, timePerTurn]);

    // Update game state ref whenever state changes (for beforeunload save)
    useEffect(() => {
        if (gameStatus === 'playing') {
            updateGameState({
                board,
                isXNext,
                playerTime,
                aiTime,
                moveHistory,
                boardSize,
            });
        }
    }, [board, isXNext, playerTime, aiTime, moveHistory, gameStatus, updateGameState]);

    const startTutorial = () => {
        setBoard(Array(boardSize * boardSize).fill(null));
        setIsXNext(true);
        setGameStatus('tutorial');
        setWinner(null);
        setTutorialStep(0);
        setIsTyping(false);
        setDisplayedText('');
        setDisplayedTitle('');
        setHintCell(null);
    };

    const exitTutorial = () => {
        setGameStatus('idle');
        setTutorialStep(0);
        setBoard(Array(boardSize * boardSize).fill(null));
    };

    const nextTutorialStep = () => {
        if (!tutorialSteps) return;
        const currentStep = tutorialSteps[tutorialStep];
        if (currentStep?.action === 'finish') {
            stopSound(keyboardSoundRef);
            startGame();
        } else {
            setTutorialStep(prev => prev + 1);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusMessage = () => {
        if (gameStatus === 'tutorial') return '📖 Chế độ hướng dẫn';
        if (isAIThinking) return 'Đang suy nghĩ...';
        if (gameStatus === 'win') {
            if (winner === 'X') {
                if (winReason === 'timeout') return '🎉 Bạn thắng! (Máy hết giờ)';
                if (winReason === 'lessTime') return '🎉 Bạn thắng! (Hòa, máy ít thời gian hơn)';
                return '🎉 Bạn thắng!';
            } else {
                if (winReason === 'timeout') return '⏱️ Bạn thua! (Hết giờ)';
                if (winReason === 'turnTimeout') return '⏱️ Bạn thua! (Hết giờ lượt đi)';
                if (winReason === 'lessTime') return '⏱️ Bạn thua! (Hòa, bạn ít thời gian hơn)';
                return '🤖 Máy thắng!';
            }
        }
        if (gameStatus === 'draw') return '🤝 Hòa!';
        return isXNext ? 'Lượt của bạn' : 'Lượt của máy';
    };

    const currentTutorialStep = tutorialSteps ? tutorialSteps[tutorialStep] : null;
    const showNextButton = gameStatus === 'tutorial' && tutorialSteps &&
        (currentTutorialStep?.action === 'click_next' || currentTutorialStep?.action === 'finish') &&
        !isTyping;

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            {/* Top Navigation */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={() => navigate(lobbyPath)}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-wider text-foreground">
                        {gameStatus === 'tutorial' ? '📖 HƯỚNG DẪN' : gameName}
                    </span>
                    {gameStatus !== 'tutorial' && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                            difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                            {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'TB' : 'Khó'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {gameStatus === 'playing' && (
                        <>
                            <button
                                className={`w-10 h-10 flex items-center justify-center ${colors.hintBg} rounded-lg ${colors.text} transition-all disabled:opacity-50`}
                                onClick={handleHint}
                                disabled={!isXNext || isAIThinking}
                                title="Gợi ý"
                            >
                                <Lightbulb size={20} />
                            </button>
                            <button
                                className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-lg text-blue-500 hover:bg-blue-500/30 transition-all"
                                onClick={handleSaveGame}
                                title="Lưu game"
                            >
                                <Save size={20} />
                            </button>
                        </>
                    )}
                    <button
                        className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                        onClick={() => navigate('/games')}
                    >
                        <Home size={20} />
                    </button>
                </div>
            </div>

            {/* Players Bar - Hide in tutorial and idle */}
            {gameStatus !== 'tutorial' && gameStatus !== 'idle' && (
                <div className="flex items-center justify-center gap-4 p-4 bg-card">
                    <PlayerCard
                        name="Bạn"
                        symbol="X"
                        avatar="👤"
                        isActive={isXNext && gameStatus === 'playing'}
                        timer={timePerPlayer === 0 ? '∞' : formatTime(playerTime)}
                        isLeft={true}
                        theme={theme}
                    />
                    <div className="flex flex-col items-center gap-1">
                        <ScoreDisplay playerScore={score.player} aiScore={score.ai} theme={theme} />
                        {gameStatus === 'playing' && timePerTurn > 0 && (
                            <div className={`text-xs font-mono px-2 py-1 rounded ${turnTime <= 10 ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground'}`}>
                                ⏱️ {formatTime(turnTime)}
                            </div>
                        )}
                    </div>
                    <PlayerCard
                        name="Paper Man"
                        symbol="O"
                        avatar="🤖"
                        isActive={!isXNext && gameStatus === 'playing'}
                        timer={timePerPlayer === 0 ? '∞' : formatTime(aiTime)}
                        isLeft={false}
                        theme={theme}
                    />
                </div>
            )}

            {/* Game Area */}
            <div className="flex-1 flex items-center justify-center gap-6 p-4">
                {/* Idle Screen */}
                {gameStatus === 'idle' && (
                    <CaroIdleScreen
                        gameName={gameName}
                        colors={colors}
                        startGame={startGame}
                        startTutorial={startTutorial}
                        hasTutorial={!!tutorialSteps}
                    />
                )}

                {/* Game Board */}
                {gameStatus !== 'idle' && (
                    <div className="flex flex-col items-center gap-4">
                        {/* Board Container with Overlay */}
                        <div className="relative">
                            <CaroBoard
                                board={board}
                                onCellClick={handleCellClick}
                                winningLine={winningLine}
                                hintCell={gameStatus === 'tutorial' ? null : hintCell}
                                highlightCells={gameStatus === 'tutorial' ? (currentTutorialStep?.highlightCells ?? []) : []}
                                disabled={
                                    gameStatus === 'tutorial'
                                        ? !(currentTutorialStep?.action === 'click_cell' && !isTyping)
                                        : (gameStatus !== 'playing' || !isXNext || isAIThinking)
                                }
                                boardSize={boardSize}
                                theme={theme}
                            />

                            {/* Game Over Overlay */}
                            {(gameStatus === 'win' || gameStatus === 'draw') && (
                                <CaroGameOverOverlay
                                    winner={winner}
                                    statusMessage={getStatusMessage()}
                                    colors={colors}
                                    onPlayAgain={handlePlayAgain}
                                />
                            )}
                        </div>

                        {/* Status Message */}
                        <div className={`text-base font-medium px-4 py-2 rounded-full shadow-sm
                            ${gameStatus !== 'playing' && gameStatus !== 'tutorial' && gameStatus !== 'idle'
                                ? `text-xl font-bold bg-gradient-to-r ${colors.gradient} text-white`
                                : 'bg-card text-foreground'}`}
                        >
                            {getStatusMessage()}
                        </div>
                    </div>
                )}

                {/* Tutorial Panel */}
                {gameStatus === 'tutorial' && currentTutorialStep && tutorialSteps && (
                    <CaroTutorialPanel
                        tutorialSteps={tutorialSteps}
                        tutorialStep={tutorialStep}
                        currentTutorialStep={currentTutorialStep}
                        isTyping={isTyping}
                        displayedTitle={displayedTitle}
                        displayedText={displayedText}
                        showNextButton={showNextButton}
                        nextTutorialStep={nextTutorialStep}
                        exitTutorial={exitTutorial}
                    />
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-4 p-4 bg-card border-t border-border">
                {gameStatus === 'tutorial' && (
                    <button
                        className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                        onClick={exitTutorial}
                    >
                        <X size={18} />
                        <span>Thoát hướng dẫn</span>
                    </button>
                )}




            </div>
        </div >
    );
};

export default CaroGame;
