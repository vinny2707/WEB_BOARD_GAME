import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, RotateCcw, Settings, Trophy, Zap, BookOpen, X, ChevronRight } from "lucide-react";

// Game Constants
const CELL_SIZE = 50;
const DEFAULT_BOARD_SIZE = 8;
const SWAP_DURATION = 200;
const GRAVITY = 0.8;
const BOUNCE_FACTOR = 0.3;
const FALL_SPEED_LIMIT = 18;

// Easing functions
const easeOutBounce = (t) => {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
};

const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

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

const CANDY_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4"
];

const DIFFICULTY_SETTINGS = {
  easy: { candies: 5, label: 'Dễ' },
  medium: { candies: 6, label: 'Trung Bình' },
  hard: { candies: 7, label: 'Khó' }
};

const TUTORIAL_STEPS = [
  { id: 1, title: "Chào mừng! 🍬", message: "Swap 2 viên kẹo cạnh nhau để tạo hàng 3+!", action: "click_next" },
  { id: 2, title: "Click chọn kẹo 🎯", message: "Click vào viên kẹo để chọn, rồi click viên bên cạnh!", action: "click_next" },
  { id: 3, title: "Hoàn thành! 🚀", message: "Đạt điểm mục tiêu để thắng. Chúc may mắn!", action: "finish" }
];

// Create board with positions
const createBoard = (size, candyCount) => {
  const board = [];
  for (let i = 0; i < size * size; i++) {
    const col = i % size;
    const row = Math.floor(i / size);
    board.push({
      type: Math.floor(Math.random() * candyCount),
      key: Date.now() + i,
      y: row * CELL_SIZE + CELL_SIZE / 2,
      targetY: row * CELL_SIZE + CELL_SIZE / 2,
      vy: 0,
      scale: 1,
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
  const particlesRef = useRef([]);
  const floatingTextsRef = useRef([]);
  const swapAnimRef = useRef(null);
  const fallingRef = useRef(false);

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
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("match3HighScore");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Tutorial
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [displayedTitle, setDisplayedTitle] = useState("");
  const typingRef = useRef(null);

  const canvasSize = boardSize * CELL_SIZE;
  const boardRef = useRef(board);
  const selectedCellRef = useRef(selectedCell);
  const comboRef = useRef(0);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { selectedCellRef.current = selectedCell; }, [selectedCell]);

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
    }))).then(() => { imagesLoadedRef.current = true; });
  }, []);

  // Find matches
  const findMatches = useCallback((currentBoard) => {
    const matches = new Set();
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize - 2; col++) {
        const idx = row * boardSize + col;
        const type = currentBoard[idx]?.type;
        if (type !== null && type !== undefined && currentBoard[idx + 1]?.type === type && currentBoard[idx + 2]?.type === type) {
          matches.add(idx); matches.add(idx + 1); matches.add(idx + 2);
          if (col < boardSize - 3 && currentBoard[idx + 3]?.type === type) matches.add(idx + 3);
        }
      }
    }
    for (let col = 0; col < boardSize; col++) {
      for (let row = 0; row < boardSize - 2; row++) {
        const idx = row * boardSize + col;
        const type = currentBoard[idx]?.type;
        if (type !== null && type !== undefined && currentBoard[idx + boardSize]?.type === type && currentBoard[idx + boardSize * 2]?.type === type) {
          matches.add(idx); matches.add(idx + boardSize); matches.add(idx + boardSize * 2);
          if (row < boardSize - 3 && currentBoard[idx + boardSize * 3]?.type === type) matches.add(idx + boardSize * 3);
        }
      }
    }
    return matches;
  }, [boardSize]);

  // Add particles for explosion effect
  const addParticles = useCallback((indices, currentBoard) => {
    const idxArray = Array.from(indices);
    idxArray.forEach(idx => {
      const candy = currentBoard[idx];
      if (!candy || candy.type === null || candy.type === undefined) return;
      const col = idx % boardSize;
      const row = Math.floor(idx / boardSize);
      const x = col * CELL_SIZE + CELL_SIZE / 2;
      const y = candy.y !== undefined ? candy.y : (row * CELL_SIZE + CELL_SIZE / 2);
      const color = CANDY_COLORS[candy.type] || "#ff6b6b";

      // Create explosion particles
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15 + Math.random() * 0.4;
        const speed = 3 + Math.random() * 6;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          color,
          life: 1,
          size: 5 + Math.random() * 5,
        });
      }

      // Add glow particles
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          color: "#fff",
          life: 0.8,
          size: 3 + Math.random() * 3,
        });
      }
    });
  }, [boardSize]);

  // Process matches with falling animation
  const processMatches = useCallback(() => {
    const currentBoard = boardRef.current;
    const matches = findMatches(currentBoard);

    if (matches.size === 0) {
      setIsAnimating(false);
      comboRef.current = 0;
      setCombo(0);
      return;
    }

    addParticles(matches, currentBoard);

    const currentCombo = comboRef.current;
    const matchScore = matches.size * 10 * (currentCombo + 1);
    setScore(prev => {
      const newScore = prev + matchScore;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("match3HighScore", newScore.toString());
      }
      return newScore;
    });

    comboRef.current = currentCombo + 1;
    setCombo(comboRef.current);

    if (currentCombo > 0) {
      const texts = ["Nice!", "Great!", "Amazing!", "Incredible!"];
      floatingTextsRef.current.push({
        text: texts[Math.min(currentCombo, texts.length - 1)],
        x: canvasSize / 2,
        y: canvasSize / 2,
        life: 1,
      });
      if (currentCombo >= 2) {
        setShakeOffset({ x: 8, y: 0 });
        setTimeout(() => setShakeOffset({ x: -8, y: 4 }), 50);
        setTimeout(() => setShakeOffset({ x: 0, y: 0 }), 150);
      }
    }

    // Remove matched - set scale to 0 for pop animation
    let newBoard = currentBoard.map((cell, idx) =>
      matches.has(idx) ? { ...cell, type: null, scale: 0 } : cell
    );
    boardRef.current = newBoard;

    // Apply gravity after short delay
    setTimeout(() => {
      // For each column, calculate new positions
      for (let col = 0; col < boardSize; col++) {
        const column = [];
        for (let row = boardSize - 1; row >= 0; row--) {
          const idx = row * boardSize + col;
          if (newBoard[idx].type !== null) {
            column.push({ ...newBoard[idx] });
          }
        }

        // Place existing candies from bottom
        for (let row = boardSize - 1; row >= 0; row--) {
          const idx = row * boardSize + col;
          const fromBottom = boardSize - 1 - row;
          const targetY = row * CELL_SIZE + CELL_SIZE / 2;

          if (fromBottom < column.length) {
            // Existing candy falls down
            newBoard[idx] = {
              ...column[fromBottom],
              targetY: targetY,
              vy: column[fromBottom].y < targetY ? column[fromBottom].vy : 0,
            };
          } else {
            // New candy spawns above
            const spawnRow = fromBottom - column.length;
            newBoard[idx] = {
              type: Math.floor(Math.random() * candyCount),
              key: Date.now() + Math.random(),
              y: -CELL_SIZE * (spawnRow + 1) - CELL_SIZE / 2,
              targetY: targetY,
              vy: 0,
              scale: 1,
            };
          }
        }
      }

      boardRef.current = newBoard;
      fallingRef.current = true;
      setBoard([...newBoard]);
    }, 150);
  }, [findMatches, boardSize, candyCount, highScore, canvasSize, addParticles]);

  // Handle click
  const handleCanvasClick = useCallback((e) => {
    if (isAnimating || (gameStatus !== "playing" && gameStatus !== "tutorial")) return;
    if (swapAnimRef.current || fallingRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    if (col < 0 || col >= boardSize || row < 0 || row >= boardSize) return;
    const idx = row * boardSize + col;

    if (selectedCell === null) {
      setSelectedCell(idx);
    } else if (selectedCell === idx) {
      setSelectedCell(null);
    } else {
      const row1 = Math.floor(selectedCell / boardSize);
      const col1 = selectedCell % boardSize;
      const isAdjacent = (Math.abs(row1 - row) === 1 && col1 === col) || (Math.abs(col1 - col) === 1 && row1 === row);

      if (isAdjacent) {
        const savedSelectedCell = selectedCell; // Save before clearing
        swapAnimRef.current = {
          idx1: savedSelectedCell,
          idx2: idx,
          startTime: performance.now(),
          duration: SWAP_DURATION,
        };

        setTimeout(() => {
          const currentBoard = boardRef.current;
          const newBoard = currentBoard.map((cell, i) => ({ ...cell }));

          // Swap only the type between two cells
          const type1 = newBoard[savedSelectedCell].type;
          const type2 = newBoard[idx].type;
          newBoard[savedSelectedCell].type = type2;
          newBoard[idx].type = type1;

          swapAnimRef.current = null;

          if (findMatches(newBoard).size > 0) {
            setIsAnimating(true);
            setMoves(prev => prev - 1);
            boardRef.current = newBoard;
            setBoard(newBoard);
            comboRef.current = 0;
            setTimeout(() => processMatches(), 50);
          } else {
            // Invalid swap - swap back with animation
            swapAnimRef.current = {
              idx1: idx,
              idx2: savedSelectedCell,
              startTime: performance.now(),
              duration: SWAP_DURATION,
            };
            setTimeout(() => { swapAnimRef.current = null; }, SWAP_DURATION);
          }
        }, SWAP_DURATION);

        setSelectedCell(null);
      } else {
        setSelectedCell(idx);
      }
    }
  }, [board, selectedCell, boardSize, isAnimating, gameStatus, findMatches, processMatches, canvasSize]);

  // Render loop with physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      ctx.fillStyle = "#fff8f0";
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Grid
      ctx.strokeStyle = "rgba(0,0,0,0.03)";
      for (let i = 0; i <= boardSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, canvasSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(canvasSize, i * CELL_SIZE);
        ctx.stroke();
      }

      // Cell backgrounds
      for (let i = 0; i < boardSize * boardSize; i++) {
        const col = i % boardSize;
        const row = Math.floor(i / boardSize);
        ctx.fillStyle = (row + col) % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,240,220,0.3)";
        ctx.beginPath();
        ctx.roundRect(col * CELL_SIZE + 2, row * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8);
        ctx.fill();
      }

      // Swap animation
      const swap = swapAnimRef.current;
      let swapProgress = 0;
      if (swap) {
        const elapsed = performance.now() - swap.startTime;
        swapProgress = Math.min(elapsed / swap.duration, 1);
      }

      // Update falling physics
      let stillFalling = false;
      const currentBoard = boardRef.current;

      currentBoard.forEach((candy, idx) => {
        if (candy.type === null) return;

        // Physics update
        if (candy.y < candy.targetY) {
          candy.vy = Math.min(candy.vy + GRAVITY, FALL_SPEED_LIMIT);
          candy.y += candy.vy;

          // Check if reached target
          if (candy.y >= candy.targetY) {
            candy.y = candy.targetY;
            // Bounce effect
            if (candy.vy > 3) {
              candy.vy = -candy.vy * BOUNCE_FACTOR;
              candy.scale = 0.85; // Squish on impact
            } else {
              candy.vy = 0;
            }
          }
          stillFalling = true;
        } else if (candy.y > candy.targetY) {
          // Bouncing back up
          candy.vy += GRAVITY;
          candy.y += candy.vy;
          if (candy.y >= candy.targetY && candy.vy > 0) {
            candy.y = candy.targetY;
            candy.vy = Math.abs(candy.vy) > 1 ? -candy.vy * BOUNCE_FACTOR : 0;
          }
          stillFalling = true;
        }

        // Scale recovery
        if (candy.scale < 1) {
          candy.scale = Math.min(candy.scale + 0.08, 1);
          stillFalling = true;
        }
      });

      // Check if falling finished
      if (fallingRef.current && !stillFalling) {
        fallingRef.current = false;
        // Check for chain matches
        setTimeout(() => processMatches(), 100);
      }

      // Draw candies
      const selected = selectedCellRef.current;

      currentBoard.forEach((candy, idx) => {
        if (candy.type === null || candy.type === undefined) return;

        const col = idx % boardSize;
        let x = col * CELL_SIZE + CELL_SIZE / 2;
        let y = candy.y;

        // Swap animation offset
        if (swap) {
          const eased = easeInOutCubic(swapProgress);
          if (idx === swap.idx1) {
            const col2 = swap.idx2 % boardSize;
            const row2 = Math.floor(swap.idx2 / boardSize);
            const targetX = col2 * CELL_SIZE + CELL_SIZE / 2;
            const targetY = row2 * CELL_SIZE + CELL_SIZE / 2;
            x = x + (targetX - x) * eased;
            y = candy.targetY + (targetY - candy.targetY) * eased;
          } else if (idx === swap.idx2) {
            const col1 = swap.idx1 % boardSize;
            const row1 = Math.floor(swap.idx1 / boardSize);
            const targetX = col1 * CELL_SIZE + CELL_SIZE / 2;
            const targetY = row1 * CELL_SIZE + CELL_SIZE / 2;
            x = x + (targetX - x) * eased;
            y = candy.targetY + (targetY - candy.targetY) * eased;
          }
        }

        const isSelected = selected === idx;
        const baseSize = CELL_SIZE - 10;
        let drawSize = baseSize * candy.scale;

        // Pulse for selected
        if (isSelected) {
          const pulse = Math.sin(performance.now() / 150) * 0.08 + 1.1;
          drawSize = baseSize * pulse;
        }

        // Squish effect (wider when compressed)
        const squishX = candy.scale < 1 ? 1 + (1 - candy.scale) * 0.5 : 1;
        const squishY = candy.scale;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.beginPath();
        ctx.ellipse(x + 2, y + 3, (drawSize / 2) * squishX, (drawSize / 2) * squishY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw candy
        ctx.save();
        if (isSelected) {
          ctx.shadowColor = CANDY_COLORS[candy.type];
          ctx.shadowBlur = 25;
        }

        ctx.translate(x, y);
        ctx.scale(squishX, squishY);

        if (imagesLoadedRef.current && imagesRef.current[candy.type]) {
          ctx.drawImage(imagesRef.current[candy.type], -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        } else {
          const gradient = ctx.createRadialGradient(-drawSize * 0.2, -drawSize * 0.2, 0, 0, 0, drawSize / 2);
          gradient.addColorStop(0, "#fff");
          gradient.addColorStop(0.4, CANDY_COLORS[candy.type]);
          gradient.addColorStop(1, CANDY_COLORS[candy.type]);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, drawSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= 0.025;
        if (p.life <= 0) return false;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      // Floating texts
      floatingTextsRef.current = floatingTextsRef.current.filter(t => {
        t.y -= 1.5;
        t.life -= 0.018;
        if (t.life <= 0) return false;
        const scale = easeOutBack(Math.min(1, (1 - t.life) * 3));
        ctx.globalAlpha = t.life;
        ctx.font = `bold ${28 * scale}px sans-serif`;
        ctx.fillStyle = "#ff6b6b";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 4;
        ctx.textAlign = "center";
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillText(t.text, t.x, t.y);
        ctx.globalAlpha = 1;
        return true;
      });

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [boardSize, canvasSize, processMatches]);

  // Check win/lose
  useEffect(() => {
    if (gameStatus === "playing" && !isAnimating && !fallingRef.current) {
      if (score >= targetScore) setGameStatus("win");
      else if (moves <= 0) setGameStatus("gameover");
    }
  }, [gameStatus, isAnimating, score, moves, targetScore]);

  // Game controls
  const startGame = () => {
    const newBoard = createBoard(boardSize, candyCount);
    boardRef.current = newBoard;
    setBoard(newBoard);
    setScore(0);
    setMoves(initialMoves);
    setCombo(0);
    comboRef.current = 0;
    setSelectedCell(null);
    setIsAnimating(false);
    particlesRef.current = [];
    floatingTextsRef.current = [];
    swapAnimRef.current = null;
    fallingRef.current = false;
    setGameStatus("playing");
  };

  const startTutorial = () => {
    const newBoard = createBoard(boardSize, candyCount);
    boardRef.current = newBoard;
    setBoard(newBoard);
    setScore(0);
    setMoves(99);
    setTutorialStep(0);
    setGameStatus("tutorial");
  };

  const exitTutorial = () => { setGameStatus("idle"); setTutorialStep(0); };

  const nextTutorialStep = () => {
    if (TUTORIAL_STEPS[tutorialStep]?.action === "finish") startGame();
    else setTutorialStep(prev => prev + 1);
  };

  // Typewriter
  useEffect(() => {
    if (gameStatus !== "tutorial") return;
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) return;
    if (typingRef.current) clearInterval(typingRef.current);
    setIsTyping(true);
    setDisplayedTitle("");
    setDisplayedText("");
    let ti = 0, mi = 0, phase = "title";
    typingRef.current = setInterval(() => {
      if (phase === "title") {
        if (ti < step.title.length) setDisplayedTitle(step.title.slice(0, ++ti));
        else phase = "message";
      } else {
        if (mi < step.message.length) setDisplayedText(step.message.slice(0, ++mi));
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
        <button className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all" onClick={() => navigate("/games/match3")}>
          <Home size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wider text-foreground">
            {gameStatus === "tutorial" ? "📖 HƯỚNG DẪN" : "🍬 GHÉP HÀNG 3"}
          </span>
          {gameStatus !== "tutorial" && (
            <>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficulty === 'easy' ? 'bg-green-500/20 text-green-500' : difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                {DIFFICULTY_SETTINGS[difficulty]?.label}
              </span>
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-500/20 text-purple-500">{boardSize}x{boardSize}</span>
            </>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* Score */}
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
            <div className="px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg animate-pulse">
              <span className="font-bold text-pink-500">COMBO x{combo}!</span>
            </div>
          )}
        </div>
      )}

      {/* Game */}
      <div className="flex-1 flex items-center justify-center gap-6 p-4">
        <div className="relative bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl p-3"
          style={{ boxShadow: '8px 8px 20px rgba(0,0,0,0.12), -8px -8px 20px rgba(255,255,255,0.9)', transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)` }}>
          <div className="rounded-xl overflow-hidden cursor-pointer" style={{ boxShadow: 'inset 4px 4px 10px rgba(0,0,0,0.08), inset -4px -4px 10px rgba(255,255,255,0.6)' }}>
            <canvas ref={canvasRef} width={canvasSize} height={canvasSize} onClick={handleCanvasClick} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
          </div>

          {(gameStatus === "idle" || gameStatus === "win" || gameStatus === "gameover") && (
            <div className="absolute inset-3 bg-black/60 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
              {gameStatus === "idle" && (
                <>
                  <div className="text-3xl font-bold text-white mb-4">🍬 Ghép Hàng 3</div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg mb-3" onClick={startGame}>
                    <Zap size={20} /> Bắt đầu
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-semibold shadow-lg" onClick={startTutorial}>
                    <BookOpen size={20} /> Hướng dẫn
                  </button>
                  <div className="text-sm text-gray-400 mt-4">{boardSize}x{boardSize} | {initialMoves} lượt | {targetScore.toLocaleString()} điểm</div>
                </>
              )}
              {gameStatus === "win" && (
                <>
                  <div className="text-3xl font-bold text-green-400 mb-2">🎉 Chiến Thắng!</div>
                  <div className="text-xl text-white mb-4">Điểm: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span></div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold shadow-lg" onClick={startGame}>
                    <RotateCcw size={20} /> Chơi lại
                  </button>
                </>
              )}
              {gameStatus === "gameover" && (
                <>
                  <div className="text-3xl font-bold text-red-400 mb-2">💔 Hết lượt!</div>
                  <div className="text-xl text-white mb-4">Điểm: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span></div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg" onClick={startGame}>
                    <RotateCcw size={20} /> Thử lại
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {gameStatus === "tutorial" && currentStep && (
          <div className="hidden md:flex flex-col w-64 h-fit p-4 bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">Hướng dẫn</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent" onClick={exitTutorial}><X size={16} /></button>
            </div>
            <div className="flex gap-1 mb-4">
              {TUTORIAL_STEPS.map((_, i) => <div key={i} className={`flex-1 h-1.5 rounded-full ${i < tutorialStep ? 'bg-orange-500' : i === tutorialStep ? 'bg-orange-400 animate-pulse' : 'bg-secondary'}`} />)}
            </div>
            <div className="mb-4">
              <div className="text-lg font-bold text-foreground mb-2">{displayedTitle}{isTyping && !displayedText && <span className="animate-pulse">|</span>}</div>
              <div className="text-sm text-muted-foreground min-h-[3rem]">{displayedText}{isTyping && displayedText && <span className="animate-pulse text-orange-400">|</span>}</div>
            </div>
            {!isTyping && <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600" onClick={nextTutorialStep}>
              {currentStep.action === "finish" ? "🎮 Bắt đầu" : "Tiếp tục"} <ChevronRight size={16} />
            </button>}
          </div>
        )}
      </div>

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
