import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Settings,
  Home,
  BookOpen,
  X,
  ChevronRight,
} from "lucide-react";
import TicTacToeBoard from "./TicTacToeBoard";
import { findBestMove, getHint, checkWinner, isDraw } from "./TicTacToeAI";

const DIFFICULTY_LABELS = {
  easy: "Dễ",
  medium: "Trung Bình",
  hard: "Khó",
};

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
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameStatus, setGameStatus] = useState("idle"); // 'idle', 'playing', 'win', 'draw', 'tutorial'
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [playerTime, setPlayerTime] = useState(0);
  const [aiTime, setAiTime] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [hintCell, setHintCell] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [displayedTitle, setDisplayedTitle] = useState("");

  const typingRef = useRef(null);

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
        }
      }
    }, 40);

    return () => {
      if (typingRef.current) {
        clearInterval(typingRef.current);
      }
    };
  }, [tutorialStep, gameStatus]);

  // Set board for tutorial steps
  useEffect(() => {
    if (gameStatus !== "tutorial") return;

    const currentStep = TUTORIAL_STEPS[tutorialStep];
    if (currentStep?.boardState) {
      setBoard(currentStep.boardState);
    }
  }, [tutorialStep, gameStatus]);

  // Timer for current player
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const timer = setInterval(() => {
      if (isXNext && !isAIThinking) {
        setPlayerTime((prev) => prev + 1);
      } else if (!isXNext) {
        setAiTime((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isXNext, gameStatus, isAIThinking]);

  // AI makes a move
  useEffect(() => {
    if (!isXNext && gameStatus === "playing" && !isAIThinking) {
      setIsAIThinking(true);
      setHintCell(null);

      const timer = setTimeout(() => {
        const aiMove = findBestMove(board, difficulty);
        if (aiMove !== -1) {
          makeMove(aiMove, "O");
        }
        setIsAIThinking(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isXNext, gameStatus, board, difficulty]);

  const makeMove = useCallback(
    (index, player) => {
      const newBoard = [...board];
      newBoard[index] = player;
      setBoard(newBoard);
      setMoveHistory((prev) => [...prev, { index, player }]);

      const winnerMark = checkWinner(newBoard);
      if (winnerMark) {
        setWinner(winnerMark);
        setGameStatus("win");
        setScore((prev) => ({
          ...prev,
          [winnerMark === "X" ? "player" : "ai"]:
            prev[winnerMark === "X" ? "player" : "ai"] + 1,
        }));
      } else if (isDraw(newBoard)) {
        setGameStatus("draw");
      } else {
        setIsXNext(player === "O");
      }
    },
    [board]
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

          // Check if this completes the win condition in tutorial
          const winnerMark = checkWinner(newBoard);
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

  const handleReset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus("playing");
    setWinner(null);
    setMoveHistory([]);
    setPlayerTime(0);
    setAiTime(0);
    setHintCell(null);
    setIsAIThinking(false);
  }, []);

  const startGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus("playing");
    setWinner(null);
    setMoveHistory([]);
    setPlayerTime(0);
    setAiTime(0);
    setHintCell(null);
    setIsAIThinking(false);
  };

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
    if (gameStatus !== "playing" || isAIThinking) return;
    const hint = getHint(board);
    if (hint !== -1) {
      setHintCell(hint);
      setTimeout(() => setHintCell(null), 3000);
    }
  }, [board, gameStatus, isAIThinking]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getWinningLine = () => {
    if (!winner) return null;
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return line;
      }
    }
    return null;
  };

  const getStatusMessage = () => {
    if (gameStatus === "tutorial") return "📖 Chế độ hướng dẫn";
    if (isAIThinking) return "Đang suy nghĩ...";
    if (gameStatus === "win")
      return winner === "X" ? "🎉 Bạn thắng!" : "🤖 Máy thắng!";
    if (gameStatus === "draw") return "🤝 Hòa!";
    return isXNext ? "Lượt của bạn" : "Lượt của máy";
  };

  const currentTutorialStep = TUTORIAL_STEPS[tutorialStep];
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
          onClick={() => navigate("/games")}
        >
          <Home size={20} />
        </button>
        <div className="text-lg font-bold tracking-wider text-foreground">
          {gameStatus === "tutorial" ? "📖 HƯỚNG DẪN" : "TIC TAC TOE"}
        </div>
        <button
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-card border-b border-border">
          <div className="text-sm font-semibold text-foreground mb-2">
            Độ khó
          </div>
          <div className="flex gap-2">
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`flex-1 py-2 px-4 bg-secondary border-2 rounded-lg text-sm font-medium transition-all
                  ${difficulty === key
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "text-muted-foreground border-transparent hover:border-emerald-500"
                  }`}
                onClick={() => {
                  setDifficulty(key);
                  handleReset();
                  setShowSettings(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player Bar - Hide in tutorial */}
      {gameStatus !== "tutorial" && (
        <div className="flex items-center justify-center gap-4 p-4 bg-card">
          <PlayerCard
            name="Bạn"
            symbol="X"
            avatar="👤"
            isActive={isXNext && gameStatus === "playing"}
            timer={formatTime(playerTime)}
            score={score.player}
            isLeft={true}
          />

          <ScoreDisplay playerScore={score.player} aiScore={score.ai} />

          <PlayerCard
            name="Paper Man"
            symbol="O"
            avatar="🤖"
            isActive={!isXNext && gameStatus === "playing"}
            timer={formatTime(aiTime)}
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
              <TicTacToeBoard
                board={board}
                onCellClick={handleCellClick}
                winningLine={getWinningLine()}
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
              />

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

        {gameStatus === "playing" && (
          <>
            <button
              className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleUndo}
              disabled={moveHistory.length < 2 || isAIThinking}
            >
              <ArrowLeft size={18} />
              <span>Quay lại</span>
            </button>

            <button
              className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-amber-500 transition-all hover:bg-amber-500/15 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleHint}
              disabled={isAIThinking}
            >
              <Lightbulb size={18} />
              <span>Gợi ý</span>
            </button>
          </>
        )}

        {(gameStatus === "win" || gameStatus === "draw") && (
          <button
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 rounded-xl text-sm font-medium text-white transition-all hover:bg-emerald-600"
            onClick={handleReset}
          >
            <RotateCcw size={18} />
            <span>Chơi lại</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TicTacToeGame;
