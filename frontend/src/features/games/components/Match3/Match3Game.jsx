import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, RotateCcw, Settings, Trophy, Zap, BookOpen, X, ChevronRight } from "lucide-react";

// Game Constants
const CELL_SIZE = 50;
const ANIMATION_SPEED = 0.12;
const GRAVITY = 0.8;
const BOUNCE_FACTOR = 0.3;
const DEFAULT_BOARD_SIZE = 8;

// Candy icons
const ALL_CANDY_ICONS = [
  "/Icons8/icons8-strawberry-50.png",
  "/Icons8/icons8-orange-50.png",
  "/Icons8/icons8-banana-50.png",
  "/Icons8/icons8-grapes-50.png",
  "/Icons8/icons8-cherry-50.png",
  "/Icons8/icons8-blueberry-50.png",
  "/Icons8/icons8-watermelon-50.png",
];

const ALL_CANDY_TYPES = ["🍓", "🍊", "🍌", "🍇", "🍒", "🫐", "🍉"];

const CANDY_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4"
];

const DIFFICULTY_SETTINGS = {
  easy: { candies: 5, label: 'Dễ' },
  medium: { candies: 6, label: 'Trung Bình' },
  hard: { candies: 7, label: 'Khó' }
};

// Tutorial steps
const TUTORIAL_STEPS = [
  { id: 1, title: "Chào mừng! 🍬", message: "Swap 2 viên kẹo cạnh nhau để tạo hàng 3+!", action: "click_next" },
  { id: 2, title: "Click chọn kẹo 🎯", message: "Click vào viên kẹo để chọn, rồi click viên bên cạnh!", action: "click_next" },
  { id: 3, title: "Hoàn thành! 🚀", message: "Đạt điểm mục tiêu để thắng. Chúc may mắn!", action: "finish" }
];

// Create board without initial matches
const createBoard = (size, candyCount) => {
  const board = [];
  for (let i = 0; i < size * size; i++) {
    board.push({
      type: Math.floor(Math.random() * candyCount),
      key: Date.now() + i,
      x: (i % size) * CELL_SIZE + CELL_SIZE / 2,
      y: Math.floor(i / size) * CELL_SIZE + CELL_SIZE / 2,
      targetX: (i % size) * CELL_SIZE + CELL_SIZE / 2,
      targetY: Math.floor(i / size) * CELL_SIZE + CELL_SIZE / 2,
      scale: 1,
      velocityY: 0,
      matched: false,
      falling: false,
    });
  }
  return removeInitialMatches(board, size, candyCount);
};

const removeInitialMatches = (board, size, candyCount) => {
  const newBoard = [...board];
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    if (col >= 2) {
      while (newBoard[i].type === newBoard[i - 1].type && newBoard[i].type === newBoard[i - 2].type) {
        newBoard[i] = { ...newBoard[i], type: Math.floor(Math.random() * candyCount) };
      }
    }
    if (row >= 2) {
      while (newBoard[i].type === newBoard[i - size].type && newBoard[i].type === newBoard[i - size * 2].type) {
        newBoard[i] = { ...newBoard[i], type: Math.floor(Math.random() * candyCount) };
      }
    }
  }
  return newBoard;
};

const Match3Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const imagesRef = useRef([]);
  const imagesLoadedRef = useRef(false);

  // Settings
  const lobbySettings = location.state?.settings || {};
  const boardSize = lobbySettings.boardSize || DEFAULT_BOARD_SIZE;
  const initialMoves = lobbySettings.moves || 30;
  const targetScore = lobbySettings.targetScore || 5000;
  const difficulty = lobbySettings.difficulty || 'medium';
  const candyCount = DIFFICULTY_SETTINGS[difficulty]?.candies || 6;

  // Game state
  const [board, setBoard] = useState(() => createBoard(boardSize, candyCount));
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(initialMoves);
  const [combo, setCombo] = useState(0);
  const [gameStatus, setGameStatus] = useState("idle");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("match3HighScore");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Animation state
  const [particles, setParticles] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });

  // Tutorial
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [displayedTitle, setDisplayedTitle] = useState("");
  const typingRef = useRef(null);

  const boardRef = useRef(board);
  const canvasSize = boardSize * CELL_SIZE;

  useEffect(() => { boardRef.current = board; }, [board]);

  // Load images
  useEffect(() => {
    const images = ALL_CANDY_ICONS.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    imagesRef.current = images;

    Promise.all(images.map(img => new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    }))).then(() => {
      imagesLoadedRef.current = true;
    });
  }, []);

  // Check for matches
  const findMatches = useCallback((currentBoard) => {
    const matches = new Set();

    // Horizontal
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize - 2; col++) {
        const idx = row * boardSize + col;
        const type = currentBoard[idx].type;
        if (type !== null &&
          currentBoard[idx + 1].type === type &&
          currentBoard[idx + 2].type === type) {
          matches.add(idx);
          matches.add(idx + 1);
          matches.add(idx + 2);
          // Check for 4+ match
          if (col < boardSize - 3 && currentBoard[idx + 3].type === type) matches.add(idx + 3);
          if (col < boardSize - 4 && currentBoard[idx + 4].type === type) matches.add(idx + 4);
        }
      }
    }

    // Vertical
    for (let col = 0; col < boardSize; col++) {
      for (let row = 0; row < boardSize - 2; row++) {
        const idx = row * boardSize + col;
        const type = currentBoard[idx].type;
        if (type !== null &&
          currentBoard[idx + boardSize].type === type &&
          currentBoard[idx + boardSize * 2].type === type) {
          matches.add(idx);
          matches.add(idx + boardSize);
          matches.add(idx + boardSize * 2);
          if (row < boardSize - 3 && currentBoard[idx + boardSize * 3].type === type) matches.add(idx + boardSize * 3);
          if (row < boardSize - 4 && currentBoard[idx + boardSize * 4].type === type) matches.add(idx + boardSize * 4);
        }
      }
    }

    return matches;
  }, [boardSize]);

  // Process matches and gravity
  const processMatches = useCallback(() => {
    const currentBoard = [...boardRef.current];
    const matches = findMatches(currentBoard);

    if (matches.size === 0) {
      setIsAnimating(false);
      setCombo(0);
      return;
    }

    // Create particles for matched cells
    const newParticles = [];
    matches.forEach(idx => {
      const candy = currentBoard[idx];
      const color = CANDY_COLORS[candy.type] || "#fff";
      for (let i = 0; i < 6; i++) {
        newParticles.push({
          id: Date.now() + Math.random(),
          x: candy.x,
          y: candy.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8 - 3,
          color,
          life: 1,
          size: 4 + Math.random() * 4,
        });
      }
    });
    setParticles(prev => [...prev, ...newParticles]);

    // Update score
    const matchScore = matches.size * 10 * (combo + 1);
    setScore(prev => {
      const newScore = prev + matchScore;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("match3HighScore", newScore.toString());
      }
      return newScore;
    });
    setCombo(prev => prev + 1);

    // Show combo text
    if (combo > 0) {
      const texts = ["Nice!", "Great!", "Amazing!", "Incredible!", "LEGENDARY!"];
      const textIdx = Math.min(combo, texts.length - 1);
      setFloatingTexts(prev => [...prev, {
        id: Date.now(),
        text: texts[textIdx],
        x: canvasSize / 2,
        y: canvasSize / 2,
        life: 1,
        scale: 1,
      }]);

      // Screen shake for big combos
      if (combo >= 2) {
        setShakeOffset({ x: 5, y: 0 });
        setTimeout(() => setShakeOffset({ x: -5, y: 3 }), 50);
        setTimeout(() => setShakeOffset({ x: 3, y: -3 }), 100);
        setTimeout(() => setShakeOffset({ x: 0, y: 0 }), 150);
      }
    }

    // Mark matched as null and start falling
    matches.forEach(idx => {
      currentBoard[idx] = { ...currentBoard[idx], type: null, matched: true, scale: 0 };
    });

    // Apply gravity
    setTimeout(() => {
      const newBoard = [...currentBoard];

      for (let col = 0; col < boardSize; col++) {
        let emptySpaces = 0;

        for (let row = boardSize - 1; row >= 0; row--) {
          const idx = row * boardSize + col;

          if (newBoard[idx].type === null) {
            emptySpaces++;
          } else if (emptySpaces > 0) {
            const newIdx = (row + emptySpaces) * boardSize + col;
            newBoard[newIdx] = {
              ...newBoard[idx],
              targetY: (row + emptySpaces) * CELL_SIZE + CELL_SIZE / 2,
              falling: true,
              velocityY: 0,
            };
            newBoard[idx] = { ...newBoard[idx], type: null };
          }
        }

        // Fill empty spaces from top
        for (let i = 0; i < emptySpaces; i++) {
          const idx = i * boardSize + col;
          newBoard[idx] = {
            type: Math.floor(Math.random() * candyCount),
            key: Date.now() + Math.random(),
            x: col * CELL_SIZE + CELL_SIZE / 2,
            y: -CELL_SIZE * (emptySpaces - i),
            targetX: col * CELL_SIZE + CELL_SIZE / 2,
            targetY: i * CELL_SIZE + CELL_SIZE / 2,
            scale: 1,
            velocityY: 0,
            matched: false,
            falling: true,
          };
        }
      }

      setBoard(newBoard);

      // Check for new matches after gravity
      setTimeout(() => processMatches(), 400);
    }, 200);

  }, [findMatches, boardSize, candyCount, combo, highScore, canvasSize]);

  // Handle cell click
  const handleCanvasClick = useCallback((e) => {
    if (isAnimating || gameStatus !== "playing") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    const idx = row * boardSize + col;

    if (idx < 0 || idx >= board.length) return;

    if (selectedCell === null) {
      setSelectedCell(idx);
    } else if (selectedCell === idx) {
      setSelectedCell(null);
    } else {
      // Check if adjacent
      const row1 = Math.floor(selectedCell / boardSize);
      const col1 = selectedCell % boardSize;
      const row2 = Math.floor(idx / boardSize);
      const col2 = idx % boardSize;
      const isAdjacent = (Math.abs(row1 - row2) === 1 && col1 === col2) ||
        (Math.abs(col1 - col2) === 1 && row1 === row2);

      if (isAdjacent) {
        // Swap
        setIsAnimating(true);
        const newBoard = [...board];
        const temp = newBoard[selectedCell].type;
        newBoard[selectedCell] = {
          ...newBoard[selectedCell],
          type: newBoard[idx].type,
          targetX: newBoard[idx].x,
          targetY: newBoard[idx].y,
        };
        newBoard[idx] = {
          ...newBoard[idx],
          type: temp,
          targetX: newBoard[selectedCell].x,
          targetY: newBoard[selectedCell].y,
        };

        // Check if swap creates match
        const matches = findMatches(newBoard);

        if (matches.size > 0) {
          setMoves(prev => prev - 1);
          setBoard(newBoard);
          setTimeout(() => processMatches(), 250);
        } else {
          // Swap back
          setTimeout(() => setIsAnimating(false), 300);
        }

        setSelectedCell(null);
      } else {
        setSelectedCell(idx);
      }
    }
  }, [board, selectedCell, boardSize, isAnimating, gameStatus, findMatches, processMatches, canvasSize]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear
    ctx.fillStyle = "#fef3e2";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid
    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= boardSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvasSize, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw cell backgrounds
    for (let i = 0; i < boardSize * boardSize; i++) {
      const col = i % boardSize;
      const row = Math.floor(i / boardSize);
      const x = col * CELL_SIZE;
      const y = row * CELL_SIZE;

      ctx.fillStyle = (row + col) % 2 === 0 ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.02)";
      ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    }

    // Update and draw candies
    const currentBoard = boardRef.current;
    const newBoard = currentBoard.map((candy, idx) => {
      if (candy.type === null) return candy;

      let newCandy = { ...candy };

      // Smooth position interpolation
      if (candy.falling) {
        newCandy.velocityY += GRAVITY;
        newCandy.y += newCandy.velocityY;

        if (newCandy.y >= newCandy.targetY) {
          newCandy.y = newCandy.targetY;
          if (Math.abs(newCandy.velocityY) > 1) {
            newCandy.velocityY = -newCandy.velocityY * BOUNCE_FACTOR;
          } else {
            newCandy.velocityY = 0;
            newCandy.falling = false;
          }
        }
      } else {
        newCandy.x += (newCandy.targetX - newCandy.x) * ANIMATION_SPEED;
        newCandy.y += (newCandy.targetY - newCandy.y) * ANIMATION_SPEED;
      }

      // Draw candy
      const isSelected = selectedCell === idx;
      const scale = isSelected ? 1.1 : candy.scale;
      const drawSize = (CELL_SIZE - 8) * scale;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.arc(newCandy.x + 2, newCandy.y + 2, drawSize / 2 - 2, 0, Math.PI * 2);
      ctx.fill();

      // Candy image
      if (imagesLoadedRef.current && imagesRef.current[candy.type]) {
        ctx.save();
        if (isSelected) {
          ctx.shadowColor = CANDY_COLORS[candy.type];
          ctx.shadowBlur = 15;
        }
        ctx.drawImage(
          imagesRef.current[candy.type],
          newCandy.x - drawSize / 2,
          newCandy.y - drawSize / 2,
          drawSize,
          drawSize
        );
        ctx.restore();
      } else {
        // Fallback: draw colored circle
        const gradient = ctx.createRadialGradient(
          newCandy.x - drawSize * 0.2, newCandy.y - drawSize * 0.2, 0,
          newCandy.x, newCandy.y, drawSize / 2
        );
        gradient.addColorStop(0, "#fff");
        gradient.addColorStop(0.3, CANDY_COLORS[candy.type]);
        gradient.addColorStop(1, CANDY_COLORS[candy.type]);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(newCandy.x, newCandy.y, drawSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      return newCandy;
    });

    setBoard(newBoard);

    // Draw particles
    setParticles(prev => prev.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= 0.03;

      if (p.life <= 0) return false;

      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      return true;
    }));

    // Draw floating texts
    setFloatingTexts(prev => prev.filter(t => {
      t.y -= 2;
      t.life -= 0.02;
      t.scale += 0.02;

      if (t.life <= 0) return false;

      ctx.globalAlpha = t.life;
      ctx.font = `bold ${24 * t.scale}px sans-serif`;
      ctx.fillStyle = "#ff6b6b";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;

      return true;
    }));

    // Check win/lose
    if (gameStatus === "playing") {
      if (score >= targetScore) {
        setGameStatus("win");
      } else if (moves <= 0 && !isAnimating) {
        setGameStatus("gameover");
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [boardSize, canvasSize, selectedCell, score, moves, targetScore, gameStatus, isAnimating]);

  // Start/stop animation
  useEffect(() => {
    if (gameStatus === "playing" || gameStatus === "tutorial") {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameStatus, animate]);

  // Game controls
  const startGame = () => {
    setBoard(createBoard(boardSize, candyCount));
    setScore(0);
    setMoves(initialMoves);
    setCombo(0);
    setSelectedCell(null);
    setIsAnimating(false);
    setGameStatus("playing");
  };

  const startTutorial = () => {
    setBoard(createBoard(boardSize, candyCount));
    setScore(0);
    setMoves(99);
    setTutorialStep(0);
    setGameStatus("tutorial");
  };

  const exitTutorial = () => {
    setGameStatus("idle");
    setTutorialStep(0);
  };

  const nextTutorialStep = () => {
    const step = TUTORIAL_STEPS[tutorialStep];
    if (step?.action === "finish") startGame();
    else setTutorialStep(prev => prev + 1);
  };

  // Typewriter effect
  useEffect(() => {
    if (gameStatus !== "tutorial") return;
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) return;

    if (typingRef.current) clearInterval(typingRef.current);
    setIsTyping(true);
    setDisplayedTitle("");
    setDisplayedText("");

    let titleIdx = 0, msgIdx = 0, phase = "title";
    typingRef.current = setInterval(() => {
      if (phase === "title") {
        if (titleIdx < step.title.length) setDisplayedTitle(step.title.slice(0, ++titleIdx));
        else phase = "message";
      } else {
        if (msgIdx < step.message.length) setDisplayedText(step.message.slice(0, ++msgIdx));
        else { clearInterval(typingRef.current); setIsTyping(false); }
      }
    }, 35);

    return () => clearInterval(typingRef.current);
  }, [tutorialStep, gameStatus]);

  const currentStep = TUTORIAL_STEPS[tutorialStep];

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <button
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all"
          onClick={() => navigate("/games/match3")}
        >
          <Home size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wider text-foreground">
            {gameStatus === "tutorial" ? "📖 HƯỚNG DẪN" : "🍬 GHÉP HÀNG 3"}
          </span>
          {gameStatus !== "tutorial" && (
            <>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                  difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                }`}>
                {DIFFICULTY_SETTINGS[difficulty]?.label}
              </span>
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-500/20 text-purple-500">
                {boardSize}x{boardSize}
              </span>
            </>
          )}
        </div>
        <button
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Score Bar */}
      {gameStatus !== "idle" && gameStatus !== "tutorial" && (
        <div className="flex items-center justify-center gap-4 p-3 bg-card border-b border-border">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-sm text-muted-foreground">Mục tiêu:</span>
            <span className="font-mono font-bold text-yellow-500">{targetScore.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <Zap size={16} className="text-green-500" />
            <span className="text-sm text-muted-foreground">Điểm:</span>
            <span className="font-mono font-bold text-green-500">{score.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <span className="text-sm text-muted-foreground">Lượt:</span>
            <span className={`font-mono font-bold ${moves <= 5 ? 'text-red-500' : 'text-foreground'}`}>{moves}</span>
          </div>
          {combo > 1 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg animate-pulse">
              <span className="font-bold text-pink-500">COMBO x{combo}!</span>
            </div>
          )}
        </div>
      )}

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center gap-6 p-4">
        {/* Game Board */}
        <div
          className="relative bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-2xl p-3"
          style={{
            boxShadow: '8px 8px 16px rgba(0,0,0,0.15), -8px -8px 16px rgba(255,255,255,0.8)',
            transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`
          }}
        >
          <div
            className="rounded-xl overflow-hidden cursor-pointer"
            style={{ boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.5)' }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              onClick={handleCanvasClick}
              style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {/* Overlays */}
          {(gameStatus === "idle" || gameStatus === "win" || gameStatus === "gameover") && (
            <div className="absolute inset-3 bg-black/60 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
              {gameStatus === "idle" && (
                <>
                  <div className="text-3xl font-bold text-white mb-4">🍬 Ghép Hàng 3</div>
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg mb-3"
                    onClick={startGame}
                  >
                    <Zap size={20} /> Bắt đầu
                  </button>
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                    onClick={startTutorial}
                  >
                    <BookOpen size={20} /> Hướng dẫn
                  </button>
                  <div className="text-sm text-gray-400 mt-4">
                    {boardSize}x{boardSize} | {initialMoves} lượt | {targetScore.toLocaleString()} điểm
                  </div>
                </>
              )}
              {gameStatus === "win" && (
                <>
                  <div className="text-3xl font-bold text-green-400 mb-2">🎉 Chiến Thắng!</div>
                  <div className="text-xl text-white mb-4">Điểm: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span></div>
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold shadow-lg"
                    onClick={startGame}
                  >
                    <RotateCcw size={20} /> Chơi lại
                  </button>
                </>
              )}
              {gameStatus === "gameover" && (
                <>
                  <div className="text-3xl font-bold text-red-400 mb-2">💔 Hết lượt!</div>
                  <div className="text-xl text-white mb-4">Điểm: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span></div>
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg"
                    onClick={startGame}
                  >
                    <RotateCcw size={20} /> Thử lại
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tutorial Panel */}
        {gameStatus === "tutorial" && currentStep && (
          <div className="hidden md:flex flex-col w-64 h-fit p-4 bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">Hướng dẫn</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent" onClick={exitTutorial}>
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-1 mb-4">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div key={idx} className={`flex-1 h-1.5 rounded-full transition-colors ${idx < tutorialStep ? 'bg-orange-500' :
                    idx === tutorialStep ? 'bg-orange-400 animate-pulse' : 'bg-secondary'
                  }`} />
              ))}
            </div>

            <div className="mb-4">
              <div className="text-lg font-bold text-foreground mb-2">
                {displayedTitle}
                {isTyping && displayedText.length === 0 && <span className="animate-pulse">|</span>}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                {displayedText}
                {isTyping && displayedText.length > 0 && <span className="animate-pulse text-orange-400">|</span>}
              </div>
            </div>

            {!isTyping && (currentStep.action === "click_next" || currentStep.action === "finish") && (
              <button
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-all"
                onClick={nextTutorialStep}
              >
                {currentStep.action === "finish" ? "🎮 Bắt đầu chơi" : "Tiếp tục"} <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* High Score */}
      <div className="flex justify-center p-2 bg-card border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy size={14} className="text-yellow-500" />
          Điểm cao nhất: <span className="font-bold text-yellow-500">{highScore.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Match3Game;
