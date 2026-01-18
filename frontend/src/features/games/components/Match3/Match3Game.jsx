import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, RotateCcw, Trophy, Zap, BookOpen, X, ChevronRight, Save, Lightbulb } from "lucide-react";
import useGameSession from '../../hooks/useGameSession';

// Local modules
import { 
  CELL_SIZE, DEFAULT_BOARD_SIZE, SWAP_DURATION, GRAVITY, BOUNCE_FACTOR, FALL_SPEED_LIMIT,
  ALL_CANDY_ICONS, CANDY_COLORS, DIFFICULTY_SETTINGS, TUTORIAL_STEPS 
} from './constants';
import { clampWithElastic } from './utils';
import { createBoard, findMatches, isAdjacent, getSwapTarget, findHint } from './gameLogic';
import { useMatch3Sound } from './useMatch3Sound';
import { useMatch3Images } from './useMatch3Images';
import { renderBoard, renderParticles, renderFloatingTexts } from './renderer';

const Match3Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const floatingTextsRef = useRef([]);
  const swapAnimRef = useRef(null);
  const fallingRef = useRef(false);

  // Audio refs
  const swapSoundRef = useRef(null);
  const matchSoundRef = useRef(null);
  const comboSoundRef = useRef(null);
  const failSoundRef = useRef(null);
  const gameStartSoundRef = useRef(null);
  const victorySoundRef = useRef(null);
  const keyboardSoundRef = useRef(null);
  // Drag-and-drop refs
  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragAnimationRef = useRef(null);
  const dragVelocityRef = useRef({ x: 0, y: 0 });
  const lastDragPosRef = useRef({ x: 0, y: 0 });

  // Custom hooks
  const { playSound } = useMatch3Sound();
  const { imagesRef, imagesLoadedRef } = useMatch3Images();

  // Settings and resume session
  const lobbySettings = location.state?.settings || {};
  const resumeSession = location.state?.resumeSession;
  const gameId = location.state?.gameId || location.state?.settings?.gameId;
  const boardSize = lobbySettings.boardSize || DEFAULT_BOARD_SIZE;
  const initialMoves = lobbySettings.moves || 30;
  const targetScore = lobbySettings.targetScore || 5000;
  const difficulty = lobbySettings.difficulty || 'medium';
  const candyCount = DIFFICULTY_SETTINGS[difficulty]?.candies || 6;

  // Session tracking (dynamic gameId)
  const { completeGame, startSession, saveProgress, updateGameState, isAuthenticated, setResumeSessionId } = useGameSession(gameId);

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

  // Drag-and-drop state
  const [dragCell, setDragCell] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Hint state
  const [hintCells, setHintCells] = useState(null);
  const hintTimeoutRef = useRef(null);

  // Tutorial
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialActionCompleted, setTutorialActionCompleted] = useState(false);
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

    swapSoundRef.current = new Audio('/sounds/swap.wav');
    matchSoundRef.current = new Audio('/sounds/match.wav');
    comboSoundRef.current = new Audio('/sounds/combo.wav');
    failSoundRef.current = new Audio('/sounds/fail-game.wav');
    gameStartSoundRef.current = new Audio('/sounds/GameStart.mp3');
    victorySoundRef.current = new Audio('/sounds/Victory.mp3');
    keyboardSoundRef.current = new Audio('/sounds/keyboard.wav');

    // Preload sounds
    swapSoundRef.current.load();
    matchSoundRef.current.load();
    comboSoundRef.current.load();
    failSoundRef.current.load();
    gameStartSoundRef.current.load();
    victorySoundRef.current.load();
    keyboardSoundRef.current.load();
  }, []);

  const playSoundRef = useCallback((soundRef) => {
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
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) return;

    if (typingRef.current) clearInterval(typingRef.current);
    setIsTyping(true);
    setDisplayedTitle("");
    setDisplayedText("");

    // Play keyboard typing sound
    playSound(keyboardSoundRef);

    let titleIdx = 0, msgIdx = 0, phase = 'title';
    typingRef.current = setInterval(() => {
      if (phase === 'title') {
        if (titleIdx < step.title.length) {
          setDisplayedTitle(step.title.slice(0, ++titleIdx));
        } else phase = 'message';
      } else {
        if (msgIdx < step.message.length) {
          setDisplayedText(step.message.slice(0, ++msgIdx));
        } else {
          clearInterval(typingRef.current);
          setIsTyping(false);
          stopSound(keyboardSoundRef);
        }
      }
    }, 40);

    return () => {
      clearInterval(typingRef.current);
      stopSound(keyboardSoundRef);
    };
  }, [tutorialStep, gameStatus, playSound, stopSound]);

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
    indices.forEach(idx => {
      const candy = currentBoard[idx];
      if (!candy || candy.type === null || candy.type === undefined) return;
      const col = idx % boardSize;
      const row = Math.floor(idx / boardSize);
      const x = col * CELL_SIZE + CELL_SIZE / 2;
      const y = candy.y !== undefined ? candy.y : (row * CELL_SIZE + CELL_SIZE / 2);
      const color = CANDY_COLORS[candy.type] || "#ff6b6b";

      // Explosion particles
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15 + Math.random() * 0.4;
        const speed = 3 + Math.random() * 6;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          color, life: 1, size: 5 + Math.random() * 5,
        });
      }

      // Glow particles
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          color: "#fff", life: 0.8, size: 3 + Math.random() * 3,
        });
      }
    });
  }, [boardSize]);

  // Process matches with falling animation
  const processMatches = useCallback(() => {
    const currentBoard = boardRef.current;
    const matches = findMatches(currentBoard, boardSize);

    if (matches.size === 0) {
      setIsAnimating(false);
      comboRef.current = 0;
      setCombo(0);
      return;
    }

    addParticles(Array.from(matches), currentBoard);
    playSound('match');

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
      playSound('combo');
      const texts = ["Nice!", "Great!", "Amazing!", "Incredible!"];
      floatingTextsRef.current.push({
        text: texts[Math.min(currentCombo, texts.length - 1)],
        x: canvasSize / 2, y: canvasSize / 2, life: 1,
      });
      if (currentCombo >= 2) {
        setShakeOffset({ x: 8, y: 0 });
        setTimeout(() => setShakeOffset({ x: -8, y: 4 }), 50);
        setTimeout(() => setShakeOffset({ x: 0, y: 0 }), 150);
      }
    }

    // Remove matched candies
    let newBoard = currentBoard.map((cell, idx) =>
      matches.has(idx) ? { ...cell, type: null, scale: 0 } : cell
    );
    boardRef.current = newBoard;

    // Apply gravity
    setTimeout(() => {
      for (let col = 0; col < boardSize; col++) {
        const column = [];
        for (let row = boardSize - 1; row >= 0; row--) {
          const idx = row * boardSize + col;
          if (newBoard[idx].type !== null) {
            column.push({ ...newBoard[idx] });
          }
        }

        for (let row = boardSize - 1; row >= 0; row--) {
          const idx = row * boardSize + col;
          const fromBottom = boardSize - 1 - row;
          const targetY = row * CELL_SIZE + CELL_SIZE / 2;

          if (fromBottom < column.length) {
            newBoard[idx] = {
              ...column[fromBottom],
              targetY,
              vy: column[fromBottom].y < targetY ? column[fromBottom].vy : 0,
            };
          } else {
            const spawnRow = fromBottom - column.length;
            newBoard[idx] = {
              type: Math.floor(Math.random() * candyCount),
              key: Date.now() + Math.random(),
              y: -CELL_SIZE * (spawnRow + 1) - CELL_SIZE / 2,
              targetY, vy: 0, scale: 1,
            };
          }
        }
      }

      boardRef.current = newBoard;
      fallingRef.current = true;
      setBoard([...newBoard]);
    }, 350);
  }, [boardSize, candyCount, highScore, canvasSize, addParticles, playSound]);

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

    // Tutorial action: select_candy
    const currentTutorialAction = TUTORIAL_STEPS[tutorialStep]?.action;

    if (selectedCell === null) {
      setSelectedCell(idx);
      // Tutorial: user selected a candy
      if (gameStatus === "tutorial" && currentTutorialAction === "select_candy") {
        setTutorialActionCompleted(true);
        setTimeout(() => {
          setTutorialStep(prev => prev + 1);
          setTutorialActionCompleted(false);
        }, 500);
      }
    } else if (selectedCell === idx) {
      setSelectedCell(null);
    } else {
      if (isAdjacent(selectedCell, idx, boardSize)) {
        const savedSelectedCell = selectedCell;
        playSound('swap');
        swapAnimRef.current = {
          idx1: savedSelectedCell, idx2: idx,
          startTime: performance.now(), duration: SWAP_DURATION,
        };

        // Tutorial: user made a swap
        if (gameStatus === "tutorial" && currentTutorialAction === "make_swap") {
          setTutorialActionCompleted(true);
          setTimeout(() => {
            setTutorialStep(prev => prev + 1);
            setTutorialActionCompleted(false);
          }, 500);
        }

        setTimeout(() => {
          const currentBoard = boardRef.current;
          const newBoard = currentBoard.map(cell => ({ ...cell }));
          const type1 = newBoard[savedSelectedCell].type;
          const type2 = newBoard[idx].type;
          newBoard[savedSelectedCell].type = type2;
          newBoard[idx].type = type1;
          swapAnimRef.current = null;

          if (findMatches(newBoard, boardSize).size > 0) {
            setIsAnimating(true);
            if (gameStatus === "playing") {
              setMoves(prev => prev - 1);
            }
            setHintCells(null);
            boardRef.current = newBoard;
            setBoard(newBoard);
            comboRef.current = 0;
            
            // Tutorial: user made a match
            if (gameStatus === "tutorial" && currentTutorialAction === "make_match") {
              setTutorialActionCompleted(true);
              setTimeout(() => {
                setTutorialStep(prev => prev + 1);
                setTutorialActionCompleted(false);
              }, 800);
            }
            
            setTimeout(() => processMatches(), 200);
          } else {
            // Invalid move - still count as a move (only in playing mode)
            if (gameStatus === "playing") {
              setMoves(prev => prev - 1);
            }
            setHintCells(null);
            swapAnimRef.current = {
              idx1: idx, idx2: savedSelectedCell,
              startTime: performance.now(), duration: SWAP_DURATION,
            };
            setTimeout(() => { swapAnimRef.current = null; }, SWAP_DURATION);
          }
        }, SWAP_DURATION);

        setSelectedCell(null);
      } else {
        setSelectedCell(idx);
      }
    }
  }, [selectedCell, boardSize, isAnimating, gameStatus, canvasSize, processMatches, playSound, tutorialStep]);

  // Drag handlers
  const getCanvasCell = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    if (col < 0 || col >= boardSize || row < 0 || row >= boardSize) return null;
    return { idx: row * boardSize + col, row, col, x, y };
  }, [canvasSize, boardSize]);

  const handleDragStart = useCallback((e) => {
    if (isAnimating || (gameStatus !== "playing" && gameStatus !== "tutorial")) return;
    if (swapAnimRef.current || fallingRef.current) return;
    
    const cell = getCanvasCell(e);
    if (!cell) return;
    
    dragStartRef.current = cell;
    isDraggingRef.current = true;
    lastDragPosRef.current = { x: cell.x, y: cell.y };
    dragVelocityRef.current = { x: 0, y: 0 };
    setDragCell(cell.idx);
    setDragOffset({ x: 0, y: 0 });
    setSelectedCell(null);
    
    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
      dragAnimationRef.current = null;
    }
  }, [isAnimating, gameStatus, getCanvasCell]);

  const handleDragMove = useCallback((e) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    e.preventDefault();
    
    const cell = getCanvasCell(e);
    if (!cell) return;
    
    const startCell = dragStartRef.current;
    const dx = cell.x - (startCell.col * CELL_SIZE + CELL_SIZE / 2);
    const dy = cell.y - (startCell.row * CELL_SIZE + CELL_SIZE / 2);
    
    dragVelocityRef.current = {
      x: cell.x - lastDragPosRef.current.x,
      y: cell.y - lastDragPosRef.current.y
    };
    lastDragPosRef.current = { x: cell.x, y: cell.y };
    
    const maxOffset = CELL_SIZE * 0.7;
    setDragOffset({
      x: clampWithElastic(dx, maxOffset),
      y: clampWithElastic(dy, maxOffset)
    });
  }, [getCanvasCell]);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current || !dragStartRef.current) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      setDragCell(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    const startCell = dragStartRef.current;
    const offset = dragOffset;
    const velocity = dragVelocityRef.current;
    
    const threshold = CELL_SIZE * 0.28;
    const velocityThreshold = 4;
    
    let targetIdx = null;

    // Check velocity first for flick gestures
    if (Math.abs(velocity.x) > velocityThreshold || Math.abs(velocity.y) > velocityThreshold) {
      targetIdx = getSwapTarget(startCell.idx, velocity, boardSize, velocityThreshold);
    }
    
    // Fall back to position-based
    if (targetIdx === null) {
      targetIdx = getSwapTarget(startCell.idx, offset, boardSize, threshold);
    }
    
    if (targetIdx !== null) {
      playSound('swap');
      swapAnimRef.current = {
        idx1: startCell.idx, idx2: targetIdx,
        startTime: performance.now(), duration: SWAP_DURATION,
      };
      
      // Tutorial: user made a swap via drag
      const currentTutorialAction = TUTORIAL_STEPS[tutorialStep]?.action;
      if (gameStatus === "tutorial" && currentTutorialAction === "make_swap") {
        setTutorialActionCompleted(true);
        setTimeout(() => {
          setTutorialStep(prev => prev + 1);
          setTutorialActionCompleted(false);
        }, 500);
      }
      
      const savedStartIdx = startCell.idx;
      setTimeout(() => {
        const currentBoard = boardRef.current;
        const newBoard = currentBoard.map(cell => ({ ...cell }));
        const type1 = newBoard[savedStartIdx].type;
        const type2 = newBoard[targetIdx].type;
        newBoard[savedStartIdx].type = type2;
        newBoard[targetIdx].type = type1;
        swapAnimRef.current = null;
        
        if (findMatches(newBoard, boardSize).size > 0) {
          setIsAnimating(true);
          if (gameStatus === "playing") {
            setMoves(prev => prev - 1);
          }
          setHintCells(null);
          boardRef.current = newBoard;
          setBoard(newBoard);
          comboRef.current = 0;
          
          // Tutorial: user made a match via drag
          if (gameStatus === "tutorial" && currentTutorialAction === "make_match") {
            setTutorialActionCompleted(true);
            setTimeout(() => {
              setTutorialStep(prev => prev + 1);
              setTutorialActionCompleted(false);
            }, 800);
          }
          
          setTimeout(() => processMatches(), 150);
        } else {
          // Invalid move - still count as a move (only in playing mode)
          if (gameStatus === "playing") {
            setMoves(prev => prev - 1);
          }
          setHintCells(null);
          swapAnimRef.current = {
            idx1: targetIdx, idx2: savedStartIdx,
            startTime: performance.now(), duration: SWAP_DURATION * 1.2,
          };
          setShakeOffset({ x: 4, y: 0 });
          setTimeout(() => setShakeOffset({ x: -4, y: 0 }), 50);
          setTimeout(() => setShakeOffset({ x: 0, y: 0 }), 100);
          setTimeout(() => { swapAnimRef.current = null; }, SWAP_DURATION * 1.2);
        }
      }, SWAP_DURATION);
    } else {
      // Animate back smoothly
      const animateBack = () => {
        setDragOffset(prev => {
          const newX = prev.x * 0.7;
          const newY = prev.y * 0.7;
          if (Math.abs(newX) < 1 && Math.abs(newY) < 1) return { x: 0, y: 0 };
          dragAnimationRef.current = requestAnimationFrame(animateBack);
          return { x: newX, y: newY };
        });
      };
      animateBack();
    }
    
    isDraggingRef.current = false;
    dragStartRef.current = null;
    setDragCell(null);
    if (targetIdx !== null) setDragOffset({ x: 0, y: 0 });
  }, [dragOffset, boardSize, processMatches, playSound, gameStatus, tutorialStep]);

  // Render loop with physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const render = () => {
      const swap = swapAnimRef.current;
      let swapProgress = 0;
      if (swap) {
        const elapsed = performance.now() - swap.startTime;
        swapProgress = Math.min(elapsed / swap.duration, 1);
      }

      // Update physics
      let stillFalling = false;
      const currentBoard = boardRef.current;

      currentBoard.forEach(candy => {
        if (candy.type === null) return;
        if (candy.y < candy.targetY) {
          candy.vy = Math.min(candy.vy + GRAVITY, FALL_SPEED_LIMIT);
          candy.y += candy.vy;
          if (candy.y >= candy.targetY) {
            candy.y = candy.targetY;
            if (candy.vy > 3) {
              candy.vy = -candy.vy * BOUNCE_FACTOR;
              candy.scale = 0.85;
            } else candy.vy = 0;
          }
          stillFalling = true;
        } else if (candy.y > candy.targetY) {
          candy.vy += GRAVITY;
          candy.y += candy.vy;
          if (candy.y >= candy.targetY && candy.vy > 0) {
            candy.y = candy.targetY;
            candy.vy = Math.abs(candy.vy) > 1 ? -candy.vy * BOUNCE_FACTOR : 0;
          }
          stillFalling = true;
        }
        if (candy.scale < 1) {
          candy.scale = Math.min(candy.scale + 0.08, 1);
          stillFalling = true;
        }
      });

      if (fallingRef.current && !stillFalling) {
        fallingRef.current = false;
        setTimeout(() => processMatches(), 350);
      }

      const dragIdx = isDraggingRef.current ? dragStartRef.current?.idx : null;

      renderBoard(ctx, {
        canvasSize, boardSize,
        board: currentBoard,
        selectedCell: selectedCellRef.current,
        dragIdx, dragOffset,
        swap, swapProgress,
        imagesLoaded: imagesLoadedRef.current,
        images: imagesRef.current,
        hintCells,
      });

      particlesRef.current = renderParticles(ctx, particlesRef.current);
      floatingTextsRef.current = renderFloatingTexts(ctx, floatingTextsRef.current);

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [boardSize, canvasSize, processMatches, dragOffset, hintCells]);

  // Check win/lose
  useEffect(() => {
    if (gameStatus === "playing" && !isAnimating && !fallingRef.current) {
      if (score >= targetScore) {
        setGameStatus("win");
        playSound('victory');
        if (isAuthenticated) {
          const simplifiedBoard = boardRef.current.map(cell => cell.type);
          completeGame({
            result: 'win', score,
            moves_count: initialMoves - moves,
            gameState: { board: simplifiedBoard, score, moves, combo: comboRef.current }
          });
        }
      } else if (moves <= 0) {
        setGameStatus("gameover");
        playSound('fail');
        if (isAuthenticated) {
          const simplifiedBoard = boardRef.current.map(cell => cell.type);
          completeGame({
            result: 'loss', score,
            moves_count: initialMoves,
            gameState: { board: simplifiedBoard, score, moves, combo: comboRef.current }
          });
        }
      }
    }
  }, [gameStatus, isAnimating, score, moves, targetScore, playSound, isAuthenticated, completeGame, initialMoves]);

  // Game controls
  const startGame = async () => {
    playSound('gameStart');
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

    if (isAuthenticated) {
      const simplifiedBoard = newBoard.map(cell => cell.type);
      await startSession(lobbySettings, { board: simplifiedBoard, score: 0, moves: initialMoves });
    }
  };

  const handleSaveGame = async () => {
    if (gameStatus !== 'playing') return;
    const simplifiedBoard = boardRef.current.map(cell => cell.type);
    await saveProgress({ board: simplifiedBoard, score, moves, combo: comboRef.current });
    import('sonner').then(({ toast }) => {
      toast.success('Đã lưu game!', { duration: 2000 });
    });
  };

  // Resume game from session
  useEffect(() => {
    if (resumeSession?.id && gameStatus === 'idle') {
      setResumeSessionId(resumeSession.id, resumeSession.started_at, resumeSession.moves_count);
      if (resumeSession.game_state?.board?.length > 0) {
        const { board: savedBoard, score: savedScore, moves: savedMoves, combo: savedCombo } = resumeSession.game_state;
        const restoredBoard = savedBoard.map((type, i) => ({
          type: typeof type === 'number' ? type : (type?.type ?? 0),
          key: Date.now() + i,
          y: Math.floor(i / boardSize) * CELL_SIZE + CELL_SIZE / 2,
          targetY: Math.floor(i / boardSize) * CELL_SIZE + CELL_SIZE / 2,
          vy: 0, scale: 1
        }));
        boardRef.current = restoredBoard;
        setBoard(restoredBoard);
        if (savedScore !== undefined) setScore(savedScore);
        if (savedMoves !== undefined) setMoves(savedMoves);
        if (savedCombo !== undefined) { comboRef.current = savedCombo; setCombo(savedCombo); }
        setGameStatus('playing');
        playSound('gameStart');
      } else {
        startGame();
      }
    }
  }, [resumeSession, boardSize, setResumeSessionId]);

  // Update game state for beforeunload save
  useEffect(() => {
    if (gameStatus === 'playing') {
      const simplifiedBoard = boardRef.current.map(cell => cell.type);
      updateGameState({ board: simplifiedBoard, score, moves, combo: comboRef.current });
    }
  }, [board, score, moves, gameStatus, updateGameState]);

  // Tutorial
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
    if (TUTORIAL_STEPS[tutorialStep]?.action === "finish") {
      stopSound(keyboardSoundRef);
      startGame();
    } else setTutorialStep(prev => prev + 1);
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
        {gameStatus === 'playing' ? (
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center bg-yellow-500/20 rounded-lg text-yellow-500 hover:bg-yellow-500/30 transition-all" onClick={() => {
              const hint = findHint(boardRef.current, boardSize);
              if (hint) {
                setHintCells(hint);
                if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
                hintTimeoutRef.current = setTimeout(() => setHintCells(null), 3000);
              }
            }} title="Gợi ý">
              <Lightbulb size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-pink-500/20 rounded-lg text-pink-500 hover:bg-pink-500/30 transition-all" onClick={handleSaveGame} title="Lưu game">
              <Save size={20} />
            </button>
          </div>
        ) : <div className="w-10" />}
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
            <canvas 
              ref={canvasRef} 
              width={canvasSize} 
              height={canvasSize} 
              onClick={handleCanvasClick}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              style={{ display: 'block', width: canvasSize, height: canvasSize, touchAction: 'none' }} 
            />
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
            
            {/* Show different UI based on action type */}
            {!isTyping && (
              <>
                {/* Welcome and finish steps - show button */}
                {(currentStep.action === "welcome" || currentStep.action === "finish") && (
                  <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600" onClick={nextTutorialStep}>
                    {currentStep.action === "finish" ? "🎮 Bắt đầu chơi!" : "Tiếp tục"} <ChevronRight size={16} />
                  </button>
                )}
                
                {/* Interactive steps - show action indicator */}
                {(currentStep.action === "select_candy" || currentStep.action === "make_swap" || currentStep.action === "make_match") && (
                  <div className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold ${tutorialActionCompleted ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground border-2 border-dashed border-orange-400'}`}>
                    {tutorialActionCompleted ? (
                      <>✅ Hoàn thành!</>
                    ) : (
                      <>
                        <span className="animate-pulse">👆</span>
                        {currentStep.action === "select_candy" && "Hãy click vào 1 viên kẹo"}
                        {currentStep.action === "make_swap" && "Đổi chỗ 2 viên kẹo"}
                        {currentStep.action === "make_match" && "Ghép 3+ cùng màu"}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
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
