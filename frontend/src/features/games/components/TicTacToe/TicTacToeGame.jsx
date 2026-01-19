import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Home,
  BookOpen,
  X,
  ChevronRight,
  Save,
} from "lucide-react";
import TicTacToeBoard from "./TicTacToeBoard";
import { findBestMove, getHint, checkWinner, isDraw, getWinningLine } from "./TicTacToeAI";
import useGameSession from "../../hooks/useGameSession";
import GamepadController from "../GamepadController";
import { toast } from "sonner";

// Tutorial steps for TicTacToe - Kịch bản logic
// Board indices: 0=TopLeft, 1=TopCenter, 2=TopRight, 3=MidLeft, 4=Center, 5=MidRight, 6=BotLeft, 7=BotCenter, 8=BotRight
const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Chào mừng đến với Tic Tac Toe! 🎮",
    message:
      "Hãy cùng học cách chơi trò chơi cổ điển này nhé! Bạn sẽ là X (màu xanh), máy là O (màu xám). Mục tiêu: Tạo 3 ký hiệu liên tiếp theo hàng, cột hoặc đường chéo!",
    action: "click_next",
    highlightCells: [],
    allowedMoves: [],
  },
  {
    id: 2,
    title: "Bước 1: Chiếm ô giữa! ✖️",
    message:
      "Ô giữa (ô số 5) là vị trí chiến lược tốt nhất vì nằm trên cả 4 đường thắng! Nhấn vào ô giữa.",
    action: "click_cell",
    highlightCells: [4],
    allowedMoves: [4],
    boardState: Array(9).fill(null),
  },
  {
    id: 3,
    title: "Bước 2: Chiếm góc! 📍",
    message:
      "Máy đã đánh O ở góc trên trái. Hãy đánh X vào góc dưới phải để tạo đường chéo chính!",
    action: "click_cell",
    highlightCells: [8],
    allowedMoves: [8],
    // O đánh góc trên trái (0), X ở giữa (4)
    boardState: ["O", null, null, null, "X", null, null, null, null],
  },
  {
    id: 4,
    title: "Bước 3: Chặn đối thủ! 🛡️",
    message:
      "Cẩn thận! O ở góc trên trái (ô 1) và góc trên phải (ô 3) - sắp thắng hàng trên! Nhanh chặn bằng cách đánh X vào ô giữa hàng trên (ô 2)!",
    action: "click_cell",
    highlightCells: [1],
    allowedMoves: [1],
    // O thêm góc trên phải (2), X có 4 và 8. O đe dọa thắng hàng trên 0-1-2
    boardState: ["O", null, "O", null, "X", null, null, null, "X"],
  },
  {
    id: 5,
    title: "Bước 4: Chiến thắng! ⚡",
    message:
      "Tuyệt vời! Bây giờ bạn có X ở ô 2, 5, 9 theo đường chéo chính. Đường chéo gần hoàn thành! Nhưng khoan - hãy đánh vào ô 7 để hoàn thành cột giữa và thắng!",
    action: "click_cell",
    highlightCells: [7],
    allowedMoves: [7],
    // O đánh ô 6, X đã chặn ở 1. Board: O(0,2,6), X(1,4,8). X có thể thắng cột giữa 1-4-7
    boardState: ["O", "X", "O", null, "X", null, "O", null, "X"],
  },
  {
    id: 6,
    title: "Chiến thắng! 🏆",
    message:
      "Xuất sắc! Bạn đã tạo được 3 X liên tiếp theo cột giữa (ô 2-5-8)! Đó là cách để thắng trong Tic Tac Toe!",
    action: "click_next",
    highlightCells: [1, 4, 7],
    allowedMoves: [],
    // X thắng với cột giữa 1-4-7
    boardState: ["O", "X", "O", null, "X", null, "O", "X", "X"],
  },
  {
    id: 7,
    title: "Hoàn thành! 🎉",

    message:
      "Bạn đã sẵn sàng! Nhớ: tạo 3 ký hiệu liên tiếp (ngang, dọc, chéo) để thắng. Chúc may mắn!",
    action: "finish",
    highlightCells: [],
    allowedMoves: [],
  },
];

// Player Card Component
const PlayerCard = ({
  name,
  symbol,
  avatar,
  isActive,
  timer,
  score,
  isLeft,
}) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl border-2 transition-all min-w-[140px]
    ${isActive
        ? "border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
        : "border-transparent"
      }
    ${isLeft ? "" : "flex-row-reverse text-right"}`}
  >
    <div className="w-10 h-10 flex items-center justify-center bg-card rounded-full text-xl shadow-sm">
      {avatar}
    </div>
    <div className="flex-1">
      <div className="text-sm font-semibold text-foreground">{name}</div>
      <div className="font-mono text-xs text-muted-foreground">{timer}</div>
    </div>
    <div
      className={`w-7 h-7 flex items-center justify-center rounded-md text-base font-bold
      ${symbol === "X"
          ? "bg-emerald-500/15 text-emerald-500"
          : "bg-slate-500/15 text-slate-600"
        }`}
    >
      {symbol}
    </div>
  </div>
);

// Score Display
const ScoreDisplay = ({ playerScore, aiScore }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-foreground rounded-full">
    <span className="font-mono text-xl font-bold text-emerald-500">
      {playerScore}
    </span>
    <span className="font-bold text-background">-</span>
    <span className="font-mono text-xl font-bold text-orange-500">
      {aiScore}
    </span>
  </div>
);

const TicTacToeGame = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Session tracking for rankings (gameId=3 for TicTacToe)
  const { completeGame, incrementMoves, isAuthenticated, startSession, saveProgress, updateGameState, setResumeSessionId } = useGameSession(3);

  // Get settings and possible resume session from lobby navigation state
  const lobbySettings = location.state?.settings || {};
  const resumeSession = location.state?.resumeSession || null;
  const boardSize = lobbySettings.boardSize || 3;
  const timePerTurn = lobbySettings.timePerTurn || 30; // seconds
  const timePerPlayer = lobbySettings.timePerPlayer || 120; // seconds (0 = unlimited)
  const firstPlayer = lobbySettings.firstPlayer || 'random'; // 'random', 'player', 'ai'
  const difficulty = lobbySettings.difficulty || 'medium'; // 'easy', 'medium', 'hard'

  // Initialize board based on size
  const initialBoard = Array(boardSize * boardSize).fill(null);

  const [board, setBoard] = useState(initialBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameStatus, setGameStatus] = useState("idle"); // 'idle', 'playing', 'win', 'draw', 'tutorial'
  const [winner, setWinner] = useState(null);
  const [winReason, setWinReason] = useState(null); // 'normal', 'timeout', 'turnTimeout', 'lessTime'
  const [moveHistory, setMoveHistory] = useState([]);
  const [playerTime, setPlayerTime] = useState(timePerPlayer);
  const [aiTime, setAiTime] = useState(timePerPlayer);
  const [turnTime, setTurnTime] = useState(timePerTurn);
  const [hintCell, setHintCell] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [displayedTitle, setDisplayedTitle] = useState("");

  const typingRef = useRef(null);
  const turnTimerRef = useRef(null);

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

  // Typewriter effect for tutorial
  useEffect(() => {
    if (gameStatus !== "tutorial") return;

    const currentStep = TUTORIAL_STEPS[tutorialStep];
    if (!currentStep) return;

    // Clear previous typing
    if (typingRef.current) {
      clearInterval(typingRef.current);
    }

    setIsTyping(true);
    setDisplayedTitle("");
    setDisplayedText("");

    // Play keyboard typing sound
    playSound(keyboardSoundRef);

    const fullTitle = currentStep.title;
    const fullMessage = currentStep.message;
    let titleIndex = 0;
    let messageIndex = 0;
    let typingPhase = "title";

    typingRef.current = setInterval(() => {
      if (typingPhase === "title") {
        if (titleIndex < fullTitle.length) {
          setDisplayedTitle(fullTitle.slice(0, titleIndex + 1));
          titleIndex++;
        } else {
          typingPhase = "message";
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
    }, 40);

    return () => {
      if (typingRef.current) {
        clearInterval(typingRef.current);
      }
      // Stop keyboard sound on cleanup
      stopSound(keyboardSoundRef);
    };
  }, [tutorialStep, gameStatus, playSound, stopSound]);

  // Set board for tutorial steps
  useEffect(() => {
    if (gameStatus !== "tutorial") return;

    const currentStep = TUTORIAL_STEPS[tutorialStep];
    if (currentStep?.boardState) {
      setBoard(currentStep.boardState);
    }
  }, [tutorialStep, gameStatus]);

  // Play defeat sound when player loses (for timeout cases)
  useEffect(() => {
    if (gameStatus === "win" && winner === "O" && (winReason === "timeout" || winReason === "turnTimeout" || winReason === "lessTime")) {
      playSound(defeatSoundRef);
    }
  }, [gameStatus, winner, winReason]);

  // Submit game results to rankings API when game ends
  useEffect(() => {
    if ((gameStatus === "win" || gameStatus === "draw") && isAuthenticated) {
      const result = gameStatus === "draw" ? "draw" : (winner === "X" ? "win" : "loss");
      completeGame({
        result,
        score: result === "win" ? 100 : (result === "draw" ? 50 : 0),
        gameState: { board, winner, winReason },
      });
    }
  }, [gameStatus, winner, isAuthenticated]);

  // Timer for current player - countdown
  useEffect(() => {
    if (gameStatus !== "playing") return;
    if (timePerPlayer === 0) return; // Unlimited time

    const timer = setInterval(() => {
      if (isXNext && !isAIThinking) {
        setPlayerTime((prev) => {
          if (prev <= 1) {
            // Player ran out of time - loses
            clearInterval(timer);
            setGameStatus("win");
            setWinner("O");
            setWinReason("timeout");
            setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
            return 0;
          }
          return prev - 1;
        });
      } else if (!isXNext) {
        setAiTime((prev) => {
          if (prev <= 1) {
            // AI ran out of time - player wins
            clearInterval(timer);
            setGameStatus("win");
            setWinner("X");
            setWinReason("timeout");
            setScore((prev) => ({ ...prev, player: prev.player + 1 }));
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
    if (gameStatus !== "playing") return;
    if (timePerTurn === 0) return; // Unlimited turn time

    // Reset turn time when turn changes
    setTurnTime(timePerTurn);

    const turnTimer = setInterval(() => {
      setTurnTime((prev) => {
        if (prev <= 1) {
          // Turn time ran out
          clearInterval(turnTimer);
          if (isXNext && !isAIThinking) {
            // Player ran out of turn time - loses
            setGameStatus("win");
            setWinner("O");
            setWinReason("turnTimeout");
            setScore((prevScore) => ({ ...prevScore, ai: prevScore.ai + 1 }));
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
    if (!isXNext && gameStatus === "playing" && !isAIThinking) {
      setIsAIThinking(true);
      setHintCell(null);

      const timer = setTimeout(() => {
        const aiMove = findBestMove(board, difficulty, boardSize);
        if (aiMove !== -1) {
          makeMove(aiMove, "O");
        }
        setIsAIThinking(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isXNext, gameStatus, board, difficulty, boardSize]);

  const makeMove = useCallback(
    (index, player) => {
      const newBoard = [...board];
      newBoard[index] = player;
      setBoard(newBoard);
      setMoveHistory((prev) => [...prev, { index, player }]);

      // Track player moves for session
      if (player === "X") {
        incrementMoves();
      }

      // Play tick sound for each move
      playSound(tickSoundRef);

      const winnerMark = checkWinner(newBoard, boardSize);
      if (winnerMark) {
        setWinner(winnerMark);
        setWinReason("normal");
        setGameStatus("win");
        setScore((prev) => ({
          ...prev,
          [winnerMark === "X" ? "player" : "ai"]:
            prev[winnerMark === "X" ? "player" : "ai"] + 1,
        }));
        if (winnerMark === "X") {
          playSound(victorySoundRef);
        } else {
          playSound(defeatSoundRef);
        }
      } else if (isDraw(newBoard, boardSize)) {
        // Check if time-based win should apply (when there's a time limit)
        if (timePerPlayer > 0 && playerTime !== aiTime) {
          // Player with less remaining time loses
          if (playerTime < aiTime) {
            setWinner("O");
            setWinReason("lessTime");
            setGameStatus("win");
            setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
          } else {
            setWinner("X");
            setWinReason("lessTime");
            setGameStatus("win");
            setScore((prev) => ({ ...prev, player: prev.player + 1 }));
          }
        } else {
          // No time limit or equal time - true draw
          setGameStatus("draw");
        }
      } else {
        setIsXNext(player === "O");
      }
    },
    [board, boardSize, timePerPlayer, playerTime, aiTime]
  );

  const handleCellClick = useCallback(
    (index) => {
      // Tutorial mode - only allow specific moves
      if (gameStatus === "tutorial") {
        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (
          currentStep?.action === "click_cell" &&
          currentStep.allowedMoves.includes(index)
        ) {
          const newBoard = [...board];
          newBoard[index] = "X";
          setBoard(newBoard);

          // Play tick sound in tutorial
          playSound(tickSoundRef);

          // Check if this completes the win condition in tutorial
          const winnerMark = checkWinner(newBoard, 3); // Tutorial is always 3x3
          if (winnerMark === "X") {
            setTutorialStep((prev) => prev + 1);
            return;
          }

          // Move to next step
          setTutorialStep((prev) => prev + 1);
        }
        return;
      }

      // Normal game mode
      if (!isXNext || board[index] || gameStatus !== "playing" || isAIThinking)
        return;
      setHintCell(null);
      makeMove(index, "X");
    },
    [board, isXNext, gameStatus, isAIThinking, makeMove, tutorialStep]
  );

  const handleReset = useCallback(async () => {
    // Start a new session for the new game
    if (isAuthenticated) {
      await startSession({ boardSize, timePerTurn, timePerPlayer, difficulty });
    }

    setBoard(initialBoard);
    setIsXNext(true);
    setGameStatus("playing");
    setWinner(null);
    setWinReason(null);
    setMoveHistory([]);
    setPlayerTime(timePerPlayer);
    setAiTime(timePerPlayer);
    setTurnTime(timePerTurn);
    setHintCell(null);
    setIsAIThinking(false);
  }, [initialBoard, timePerPlayer, timePerTurn, isAuthenticated, startSession, boardSize, difficulty]);

  const startGame = async () => {
    playSound(gameStartSoundRef);
    setBoard(initialBoard);
    // Determine who starts based on firstPlayer setting
    if (firstPlayer === 'ai') {
      setIsXNext(false);
    } else if (firstPlayer === 'random') {
      setIsXNext(Math.random() > 0.5);
    } else {
      setIsXNext(true);
    }
    setGameStatus("playing");
    setWinner(null);
    setWinReason(null);
    setMoveHistory([]);
    setPlayerTime(timePerPlayer);
    setAiTime(timePerPlayer);
    setTurnTime(timePerTurn);
    setHintCell(null);
    setIsAIThinking(false);

    // Start a new session for tracking
    if (isAuthenticated) {
      await startSession({ boardSize, timePerTurn, timePerPlayer, difficulty });
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
        // No game_state saved yet (session just started) - start fresh game with same session
        setBoard(initialBoard);
        // Determine who starts based on firstPlayer setting
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
  }, [resumeSession, setResumeSessionId, initialBoard, firstPlayer, timePerPlayer, timePerTurn]);

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
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus("tutorial");
    setWinner(null);
    setTutorialStep(0);
    setIsTyping(false);
    setDisplayedText("");
    setDisplayedTitle("");
    setHintCell(null);
  };

  const exitTutorial = () => {
    setGameStatus("idle");
    setTutorialStep(0);
    setBoard(Array(9).fill(null));
  };

  const nextTutorialStep = () => {
    const currentStep = TUTORIAL_STEPS[tutorialStep];
    if (currentStep?.action === "finish") {
      stopSound(keyboardSoundRef);
      startGame();
    } else {
      setTutorialStep((prev) => prev + 1);
    }
  };

  const handleUndo = useCallback(() => {
    if (moveHistory.length < 2 || gameStatus !== "playing" || isAIThinking)
      return;

    const newHistory = [...moveHistory];
    const newBoard = [...board];

    // Undo AI move + player move
    newBoard[newHistory.pop().index] = null;
    newBoard[newHistory.pop().index] = null;

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setIsXNext(true);
    setHintCell(null);
  }, [board, moveHistory, gameStatus, isAIThinking]);

  const handleHint = useCallback(() => {
    if (gameStatus === "tutorial") {
      // In tutorial mode, show tutorial tips
      toast.info("📖 Nhấn vào ô được đánh dấu sáng để tiếp tục hướng dẫn!");
      return;
    }
    if (gameStatus !== "playing" || isAIThinking) {
      toast.info("💡 Gợi ý chỉ khả dụng khi đang chơi và đến lượt bạn!");
      return;
    }
    const hint = getHint(board, boardSize);
    if (hint !== -1) {
      setHintCell(hint);
      toast.success("💡 Đây là nước đi gợi ý cho bạn!");
      setTimeout(() => setHintCell(null), 3000);
    } else {
      toast.info("Không có gợi ý nào khả dụng!");
    }
  }, [board, boardSize, gameStatus, isAIThinking]);

  // Gamepad navigation state for board cells
  const [selectedCellIndex, setSelectedCellIndex] = useState(Math.floor((boardSize * boardSize) / 2)); // Start at center

  // Current tutorial step - moved up to be available for gamepad handlers
  const currentTutorialStep = TUTORIAL_STEPS[tutorialStep];

  // Gamepad handlers
  const handleGamepadLeft = useCallback(() => {
    if (gameStatus === "idle" || gameStatus === "win" || gameStatus === "draw") return;
    
    // Move cursor left on board
    setSelectedCellIndex(prev => {
      const col = prev % boardSize;
      if (col > 0) return prev - 1;
      return prev + boardSize - 1; // Wrap to end of row
    });
  }, [gameStatus, boardSize]);

  const handleGamepadRight = useCallback(() => {
    if (gameStatus === "idle" || gameStatus === "win" || gameStatus === "draw") return;
    
    // Move cursor right on board
    setSelectedCellIndex(prev => {
      const col = prev % boardSize;
      if (col < boardSize - 1) return prev + 1;
      return prev - boardSize + 1; // Wrap to start of row
    });
  }, [gameStatus, boardSize]);

  const handleGamepadUp = useCallback(() => {
    if (gameStatus === "idle" || gameStatus === "win" || gameStatus === "draw") return;
    
    // Move cursor up on board
    setSelectedCellIndex(prev => {
      const row = Math.floor(prev / boardSize);
      if (row > 0) return prev - boardSize;
      return prev + boardSize * (boardSize - 1); // Wrap to bottom
    });
  }, [gameStatus, boardSize]);

  const handleGamepadDown = useCallback(() => {
    if (gameStatus === "idle" || gameStatus === "win" || gameStatus === "draw") return;
    
    // Move cursor down on board
    setSelectedCellIndex(prev => {
      const row = Math.floor(prev / boardSize);
      if (row < boardSize - 1) return prev + boardSize;
      return prev - boardSize * (boardSize - 1); // Wrap to top
    });
  }, [gameStatus, boardSize]);

  const handleGamepadEnter = useCallback(() => {
    if (gameStatus === "idle") {
      startGame();
      return;
    }
    if (gameStatus === "win" || gameStatus === "draw") {
      handleReset();
      return;
    }
    if (gameStatus === "tutorial") {
      if (currentTutorialStep?.action === "click_next" || currentTutorialStep?.action === "finish") {
        nextTutorialStep();
      } else if (currentTutorialStep?.action === "click_cell") {
        // Click the allowed cell
        const allowedMoves = currentTutorialStep?.allowedMoves || [];
        if (allowedMoves.length > 0) {
          handleCellClick(allowedMoves[0]);
        }
      }
      return;
    }
    if (gameStatus === "playing" && isXNext && !isAIThinking) {
      // Click the selected cell
      handleCellClick(selectedCellIndex);
    }
  }, [gameStatus, isXNext, isAIThinking, selectedCellIndex, handleCellClick, startGame, handleReset, currentTutorialStep, nextTutorialStep]);

  const handleGamepadBack = useCallback(() => {
    if (gameStatus === "tutorial") {
      exitTutorial();
      return;
    }
    // Go back to lobby
    navigate('/games/tic-tac-toe');
  }, [gameStatus, navigate, exitTutorial]);

  const handleGamepadHintButton = useCallback(() => {
    if (gameStatus === "idle") {
      // Show tutorial
      startTutorial();
      return;
    }
    // Show hint or game rules
    handleHint();
  }, [gameStatus, handleHint, startTutorial]);

  // Keyboard navigation for board (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus === "idle" || gameStatus === "win" || gameStatus === "draw") return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleGamepadUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleGamepadDown();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleGamepadLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleGamepadRight();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          handleGamepadHintButton();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleGamepadUp, handleGamepadDown, handleGamepadLeft, handleGamepadRight, handleGamepadHintButton]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Use imported getWinningLine from AI module for dynamic board support
  const winningLine = winner ? getWinningLine(board, boardSize) : null;

  const getStatusMessage = () => {
    if (gameStatus === "tutorial") return "📖 Chế độ hướng dẫn";
    if (isAIThinking) return "Đang suy nghĩ...";
    if (gameStatus === "win") {
      if (winner === "X") {
        if (winReason === "timeout") return "🎉 Bạn thắng! (Máy hết giờ)";
        if (winReason === "lessTime") return "🎉 Bạn thắng! (Hòa, máy ít thời gian hơn)";
        return "🎉 Bạn thắng!";
      } else {
        if (winReason === "timeout") return "⏱️ Bạn thua! (Hết giờ)";
        if (winReason === "turnTimeout") return "⏱️ Bạn thua! (Hết giờ lượt đi)";
        if (winReason === "lessTime") return "⏱️ Bạn thua! (Hòa, bạn ít thời gian hơn)";
        return "🤖 Máy thắng!";
      }
    }
    if (gameStatus === "draw") return "🤝 Hòa!";
    return isXNext ? "Lượt của bạn" : "Lượt của máy";
  };

  const showNextButton =
    gameStatus === "tutorial" &&
    (currentTutorialStep?.action === "click_next" ||
      currentTutorialStep?.action === "finish") &&
    !isTyping;

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-background">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <button
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          onClick={() => navigate("/games/tic-tac-toe")}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wider text-foreground">
            {gameStatus === "tutorial" ? "📖 HƯỚNG DẪN" : (
              boardSize === 5 ? "TIC TAC TOE 5×5" : "TIC TAC TOE"
            )}
          </span>
          {gameStatus !== "tutorial" && (
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
                className="w-10 h-10 flex items-center justify-center bg-amber-500/20 rounded-lg text-amber-500 hover:bg-amber-500/30 transition-all disabled:opacity-50"
                onClick={handleHint}
                disabled={isAIThinking}
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
            onClick={() => navigate("/games")}
          >
            <Home size={20} />
          </button>
        </div>
      </div>

      {/* Player Bar - Hide in tutorial */}
      {gameStatus !== "tutorial" && (
        <div className="flex items-center justify-center gap-4 p-4 bg-card">
          <PlayerCard
            name="Bạn"
            symbol="X"
            avatar="👤"
            isActive={isXNext && gameStatus === "playing"}
            timer={timePerPlayer === 0 ? "∞" : formatTime(playerTime)}
            score={score.player}
            isLeft={true}
          />

          <div className="flex flex-col items-center gap-1">
            <ScoreDisplay playerScore={score.player} aiScore={score.ai} />
            {gameStatus === "playing" && timePerTurn > 0 && (
              <div className={`text-xs font-mono px-2 py-1 rounded ${turnTime <= 10 ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground'}`}>
                ⏱️ {turnTime}s
              </div>
            )}
          </div>

          <PlayerCard
            name="Paper Man"
            symbol="O"
            avatar="🤖"
            isActive={!isXNext && gameStatus === "playing"}
            timer={timePerPlayer === 0 ? "∞" : formatTime(aiTime)}
            score={score.ai}
            isLeft={false}
          />
        </div>
      )}

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center p-8 gap-6">
        {/* Left side - Game Board */}
        <div className="flex flex-col items-center gap-6">
          {/* Idle Screen Overlay */}
          {gameStatus === "idle" && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-card rounded-2xl shadow-lg border-2 border-border">
              <div className="text-3xl font-bold text-foreground mb-2">
                ⭕ Tic Tac Toe ❌
              </div>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 rounded-xl text-white font-semibold hover:bg-emerald-600 transition-all"
                onClick={startGame}
              >
                <ArrowLeft size={20} className="rotate-180" />
                Bắt đầu chơi
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:bg-blue-600 transition-all"
                onClick={startTutorial}
              >
                <BookOpen size={20} />
                Hướng dẫn chơi
              </button>
            </div>
          )}

          {/* Game Board */}
          {gameStatus !== "idle" && (
            <>
              {/* Board Container with Overlay */}
              <div className="relative">
                <TicTacToeBoard
                  board={board}
                  onCellClick={handleCellClick}
                  winningLine={winningLine}
                  hintCell={gameStatus === "tutorial" ? null : hintCell}
                  highlightCells={
                    gameStatus === "tutorial"
                      ? currentTutorialStep?.highlightCells ?? []
                      : []
                  }
                  disabled={
                    gameStatus === "tutorial"
                      ? !(
                        currentTutorialStep?.action === "click_cell" &&
                        !isTyping
                      )
                      : !isXNext || isAIThinking || gameStatus !== "playing"
                  }
                  boardSize={boardSize}
                  selectedCell={gameStatus === "playing" && isXNext && !isAIThinking ? selectedCellIndex : -1}
                />

                {/* Game Over Overlay */}
                {(gameStatus === 'win' || gameStatus === 'draw') && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                    <div className={`text-3xl font-bold mb-2 ${winner === 'X' ? 'text-green-400' : winner === 'O' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {winner === 'X' ? '🎉 Chiến Thắng!' : winner === 'O' ? '💔 Thua Cuộc!' : '🤝 Hòa!'}
                    </div>
                    <div className="text-white text-lg mb-4">
                      {getStatusMessage()}
                    </div>
                    <button
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-500 rounded-xl text-white font-semibold hover:bg-emerald-600 transition-all shadow-lg"
                      onClick={handleReset}
                    >
                      <RotateCcw size={20} />
                      Chơi lại
                    </button>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div
                className={`text-base font-medium px-4 py-2 rounded-full shadow-sm
                ${gameStatus !== "playing" && gameStatus !== "tutorial"
                    ? "text-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                    : "bg-card text-foreground"
                  }`}
              >
                {getStatusMessage()}
              </div>
            </>
          )}
        </div>

        {/* Right side - Tutorial Panel */}
        {gameStatus === "tutorial" && currentTutorialStep && (
          <div className="hidden md:flex flex-col w-80 h-fit p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">
                  Hướng dẫn chơi
                </span>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent transition-all"
                onClick={exitTutorial}
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1 mb-4">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1.5 rounded-full transition-colors
                    ${idx < tutorialStep
                      ? "bg-emerald-500"
                      : idx === tutorialStep
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-secondary"
                    }`}
                />
              ))}
            </div>

            {/* Step Content */}
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-2">
                Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}
              </div>
              <div className="text-xl font-bold text-foreground mb-3 min-h-[2rem]">
                {displayedTitle}
                {isTyping && displayedText.length === 0 && (
                  <span className="animate-pulse">|</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                {displayedText}
                {isTyping && displayedText.length > 0 && (
                  <span className="animate-pulse text-emerald-400">|</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {showNextButton && (
              <button
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-md"
                onClick={nextTutorialStep}
              >
                {currentTutorialStep.action === "finish" ? (
                  <>🎮 Bắt đầu chơi</>
                ) : (
                  <>
                    Tiếp tục
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            )}

            {/* Hint for click_cell action */}
            {!isTyping && currentTutorialStep?.action === "click_cell" && (
              <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl border border-emerald-500/50">
                <div className="text-sm text-muted-foreground">
                  Nhấn vào ô được đánh dấu!
                </div>
                <div className="text-3xl animate-bounce">👆</div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground leading-relaxed">
                💡{" "}
                {currentTutorialStep?.action === "click_cell" &&
                  !isTyping &&
                  "Nhấn vào ô sáng lên để tiếp tục"}
                {currentTutorialStep?.action === "click_next" &&
                  !isTyping &&
                  "Nhấn nút Tiếp tục bên dưới"}
                {currentTutorialStep?.action === "finish" &&
                  !isTyping &&
                  "Bạn đã sẵn sàng chiến đấu!"}
                {isTyping && "Đang hiển thị hướng dẫn..."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-card border-t border-border">
        {gameStatus === "tutorial" && (
          <button
            className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            onClick={exitTutorial}
          >
            <X size={18} />
            <span>Thoát hướng dẫn</span>
          </button>
        )}

        {/* Gamepad Controller */}
        <GamepadController
          onLeft={handleGamepadLeft}
          onRight={handleGamepadRight}
          onBack={handleGamepadBack}
          onEnter={handleGamepadEnter}
          onHint={handleGamepadHintButton}
          showHint={true}
        />
      </div>
    </div>
  );
};

export default TicTacToeGame;
