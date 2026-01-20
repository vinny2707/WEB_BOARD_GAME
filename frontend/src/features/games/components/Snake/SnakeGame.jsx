import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Play, Pause, RotateCcw, Settings, Trophy, BookOpen, X, ChevronRight, Save } from 'lucide-react';
import useGameSession from '../../hooks/useGameSession';

// Game Constants
const CELL_SIZE = 20;
const GAME_SPEED = 120; // ms per game tick
const ANIMATION_SPEED = 0.15; // Interpolation speed (0-1)

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

const DIFFICULTY_SETTINGS = {
    easy: { speed: 180, label: 'Dễ' },
    medium: { speed: 120, label: 'Trung Bình' },
    hard: { speed: 70, label: 'Khó' }
};

// Tutorial steps - direction sequence: RIGHT → UP → LEFT → DOWN (each 90° turn)
const TUTORIAL_STEPS = [
    { id: 1, title: 'Chào mừng! 🐍', message: 'Hãy học cách điều khiển rắn!', action: 'click_next', requiredKey: null },
    { id: 2, title: 'Đi sang phải ➡️', message: 'Nhấn → hoặc D để đi phải!', action: 'press_key_and_eat', requiredKey: 'RIGHT' },
    { id: 3, title: 'Đi lên ⬆️', message: 'Nhấn ↑ hoặc W để đi lên!', action: 'press_key_and_eat', requiredKey: 'UP' },
    { id: 4, title: 'Đi sang trái ⬅️', message: 'Nhấn ← hoặc A để đi trái!', action: 'press_key_and_eat', requiredKey: 'LEFT' },
    { id: 5, title: 'Đi xuống ⬇️', message: 'Nhấn ↓ hoặc S để đi xuống!', action: 'press_key_and_eat', requiredKey: 'DOWN' },
    { id: 6, title: 'Cảnh báo! ⚠️', message: 'KHÔNG va vào tường và thân mình!', action: 'click_next', requiredKey: null },
    { id: 7, title: 'Hoàn thành! 🏆', message: 'Bạn đã sẵn sàng! Chúc may mắn!', action: 'finish', requiredKey: null }
];

const SnakeGame = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const lastTimeRef = useRef(0);
    const gameTickRef = useRef(0);

    // Session tracking for rankings (gameId=4 for Snake)
    const { completeGame, startSession, saveProgress, updateGameState, isAuthenticated, setResumeSessionId } = useGameSession(4);

    // Settings from lobby and resume session
    const lobbySettings = location.state?.settings || {};
    const resumeSession = location.state?.resumeSession;
    const boardSize = lobbySettings.boardSize || 20;
    const wallMode = lobbySettings.wallMode || 'solid';
    const initialDifficulty = lobbySettings.difficulty || 'medium';

    // Game state
    const [snake, setSnake] = useState([{ x: Math.floor(boardSize / 2), y: Math.floor(boardSize / 2) }]);
    const [food, setFood] = useState({ x: Math.floor(boardSize / 2) + 5, y: Math.floor(boardSize / 2) });
    const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
    const [gameStatus, setGameStatus] = useState('idle');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [speed, setSpeed] = useState(DIFFICULTY_SETTINGS[initialDifficulty].speed);
    const [difficulty] = useState(initialDifficulty);
    // const [showSettings, setShowSettings] = useState(false); // Unused

    // Animation state - smooth positions
    const [smoothSnake, setSmoothSnake] = useState([]);
    const [smoothFood, setSmoothFood] = useState({ x: 0, y: 0, scale: 1, glow: 0 });
    const [foodBounce, setFoodBounce] = useState(0);
    const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
    const [gameOverOpacity, setGameOverOpacity] = useState(0);

    // Tutorial state
    const [tutorialStep, setTutorialStep] = useState(0);
    const [tutorialFoodEaten, setTutorialFoodEaten] = useState(0);
    const [tutorialMoving, setTutorialMoving] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [displayedTitle, setDisplayedTitle] = useState('');

    const directionRef = useRef(direction);
    const snakeRef = useRef(snake);
    const foodRef = useRef(food);
    const gameStatusRef = useRef(gameStatus);
    const scoreRef = useRef(score);
    const tutorialStepRef = useRef(tutorialStep);
    const typingRef = useRef(null);

    // Audio refs
    const eatSoundRef = useRef(null);
    const failSoundRef = useRef(null);
    const turnSoundRef = useRef(null);
    const collisionSoundRef = useRef(null);
    const gameStartSoundRef = useRef(null);
    const keyboardSoundRef = useRef(null);

    // Canvas size
    const canvasSize = boardSize * CELL_SIZE;

    // Update refs
    useEffect(() => { directionRef.current = direction; }, [direction]);
    useEffect(() => { snakeRef.current = snake; }, [snake]);
    useEffect(() => { foodRef.current = food; }, [food]);
    useEffect(() => { gameStatusRef.current = gameStatus; }, [gameStatus]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { tutorialStepRef.current = tutorialStep; }, [tutorialStep]);

    useEffect(() => {
        eatSoundRef.current = new Audio('/sounds/eat.wav');
        failSoundRef.current = new Audio('/sounds/fail-game.wav');
        turnSoundRef.current = new Audio('/sounds/re-huong.wav');
        collisionSoundRef.current = new Audio('/sounds/vatuong-tucan.wav');
        gameStartSoundRef.current = new Audio('/sounds/GameStart.mp3');
        keyboardSoundRef.current = new Audio('/sounds/keyboard.wav');

        // Preload
        eatSoundRef.current.load();
        failSoundRef.current.load();
        turnSoundRef.current.load();
        collisionSoundRef.current.load();
        gameStartSoundRef.current.load();
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

    // Initialize smooth positions
    useEffect(() => {
        setSmoothSnake(snake.map(seg => ({
            x: seg.x * CELL_SIZE + CELL_SIZE / 2,
            y: seg.y * CELL_SIZE + CELL_SIZE / 2
        })));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setSmoothFood({
            x: food.x * CELL_SIZE + CELL_SIZE / 2,
            y: food.y * CELL_SIZE + CELL_SIZE / 2,
            scale: 1,
            glow: 1
        });
    }, [food]);

    // Generate food position
    const generateFood = useCallback((currentSnake) => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * boardSize),
                y: Math.floor(Math.random() * boardSize)
            };
        } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        return newFood;
    }, [boardSize]);

    // Generate tutorial food based on next step's required direction
    const generateTutorialFood = useCallback((currentSnake, nextStepIndex) => {
        const head = currentSnake[0];
        const nextStep = TUTORIAL_STEPS[nextStepIndex];
        const requiredDir = nextStep?.requiredKey;

        // Calculate food position based on required direction (3 cells away)
        const dirOffsets = {
            RIGHT: { x: 3, y: 0 },
            LEFT: { x: -3, y: 0 },
            UP: { x: 0, y: -3 },
            DOWN: { x: 0, y: 3 }
        };

        const offset = dirOffsets[requiredDir] || { x: 3, y: 0 };
        let newFood = {
            x: Math.max(1, Math.min(boardSize - 2, head.x + offset.x)),
            y: Math.max(1, Math.min(boardSize - 2, head.y + offset.y))
        };

        // Make sure food isn't on snake
        while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) {
            newFood.x = (newFood.x + 1) % boardSize;
            newFood.y = (newFood.y + 1) % boardSize;
        }

        return newFood;
    }, [boardSize]);

    // Check collision
    const checkCollision = useCallback((head, snakeBody) => {
        if (wallMode === 'solid') {
            if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
                return true;
            }
        }
        return snakeBody.slice(1).some(seg => seg.x === head.x && seg.y === head.y);
    }, [boardSize, wallMode]);

    // Wrap position
    const wrapPosition = useCallback((pos) => {
        let { x, y } = pos;
        if (x < 0) x = boardSize - 1;
        if (x >= boardSize) x = 0;
        if (y < 0) y = boardSize - 1;
        if (y >= boardSize) y = 0;
        return { x, y };
    }, [boardSize]);

    // Game tick logic
    const gameTick = useCallback(() => {
        if (gameStatusRef.current !== 'playing' &&
            !(gameStatusRef.current === 'tutorial' && tutorialMoving)) return;

        const currentSnake = snakeRef.current;
        const currentDir = directionRef.current;
        const currentFood = foodRef.current;

        let newHead = {
            x: currentSnake[0].x + currentDir.x,
            y: currentSnake[0].y + currentDir.y
        };

        if (wallMode === 'wrap') {
            newHead = wrapPosition(newHead);
        }

        if (checkCollision(newHead, currentSnake)) {
            if (gameStatusRef.current === 'tutorial') {
                const center = Math.floor(boardSize / 2);
                setSnake([{ x: center, y: center }]);
                return;
            }
            // Game over with shake animation
            playSound(collisionSoundRef);
            playSound(failSoundRef);
            setShakeOffset({ x: 10, y: 0 });
            setTimeout(() => setShakeOffset({ x: -10, y: 5 }), 50);
            setTimeout(() => setShakeOffset({ x: 5, y: -5 }), 100);
            setTimeout(() => setShakeOffset({ x: 0, y: 0 }), 150);
            setGameOverOpacity(1);
            setGameStatus('gameover');

            // Submit game result to API
            if (isAuthenticated) {
                completeGame({
                    result: 'loss',
                    score: scoreRef.current,
                    gameState: { snake: currentSnake, food: currentFood },
                });
            }
            return;
        }

        const newSnake = [newHead, ...currentSnake];

        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
            // Ate food!
            playSound(eatSoundRef);
            if (gameStatusRef.current === 'tutorial') {
                setTutorialFoodEaten(prev => prev + 1);
            }
            setScore(prev => {
                const newScore = prev + 10;
                if (newScore > highScore && gameStatusRef.current !== 'tutorial') {
                    setHighScore(newScore);
                    localStorage.setItem('snakeHighScore', newScore.toString());
                }
                return newScore;
            });
            // In tutorial mode, don't place food here - it will be placed after snake stops
            if (gameStatusRef.current !== 'tutorial') {
                setFood(generateFood(newSnake));
                setSpeed(prev => Math.max(50, prev - 3));
            }
        } else {
            newSnake.pop();
        }

        setSnake(newSnake);
    }, [generateFood, checkCollision, wrapPosition, highScore, boardSize, wallMode, tutorialMoving, completeGame, isAuthenticated, playSound]);

    // Animation loop (60fps)
    const animate = useCallback((timestamp) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const deltaTime = timestamp - lastTimeRef.current;

        // Game tick based on speed
        gameTickRef.current += deltaTime;
        const currentSpeed = gameStatusRef.current === 'tutorial' ? 150 : speed;
        if (gameTickRef.current >= currentSpeed) {
            gameTick();
            gameTickRef.current = 0;
        }

        // Smooth interpolation for snake positions
        const targetSnake = snakeRef.current.map(seg => ({
            x: seg.x * CELL_SIZE + CELL_SIZE / 2,
            y: seg.y * CELL_SIZE + CELL_SIZE / 2
        }));

        setSmoothSnake(prev => {
            if (prev.length !== targetSnake.length) {
                return targetSnake;
            }
            return prev.map((pos, i) => {
                const target = targetSnake[i];
                // Normalize current position to [0, canvasSize) to prevent drift
                let px = pos.x % canvasSize;
                if (px < 0) px += canvasSize;
                let py = pos.y % canvasSize;
                if (py < 0) py += canvasSize;

                // Calculate shortest distance on torus
                let dx = target.x - px;
                let dy = target.y - py;

                if (Math.abs(dx) > canvasSize / 2) {
                    dx = dx > 0 ? dx - canvasSize : dx + canvasSize;
                }
                if (Math.abs(dy) > canvasSize / 2) {
                    dy = dy > 0 ? dy - canvasSize : dy + canvasSize;
                }

                return {
                    x: px + dx * ANIMATION_SPEED,
                    y: py + dy * ANIMATION_SPEED
                };
            });
        });

        // Food bounce animation
        setFoodBounce(prev => (prev + 0.1) % (Math.PI * 2));

        lastTimeRef.current = timestamp;
        animationRef.current = requestAnimationFrame(animate);
    }, [gameTick, speed]);

    // Start/stop animation loop
    useEffect(() => {
        if (gameStatus === 'playing' || (gameStatus === 'tutorial' && tutorialMoving)) {
            lastTimeRef.current = 0;
            gameTickRef.current = 0;
            animationRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameStatus, tutorialMoving, animate]);

    // Canvas rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.fillStyle = '#f0f4f8';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Draw grid pattern
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
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

        // Draw food with bounce and glow
        const foodX = smoothFood.x;
        const foodY = smoothFood.y;
        const bounceScale = 1 + Math.sin(foodBounce) * 0.15;
        const foodRadius = CELL_SIZE * 0.4 * bounceScale;

        // Glow effect
        const gradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, foodRadius * 2);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(foodX, foodY, foodRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Food body (3D candy style)
        const foodGradient = ctx.createRadialGradient(
            foodX - foodRadius * 0.3, foodY - foodRadius * 0.3, 0,
            foodX, foodY, foodRadius
        );
        foodGradient.addColorStop(0, '#ff6b6b');
        foodGradient.addColorStop(0.7, '#ef4444');
        foodGradient.addColorStop(1, '#dc2626');
        ctx.fillStyle = foodGradient;
        ctx.beginPath();
        ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
        ctx.fill();

        // Food highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(foodX - foodRadius * 0.3, foodY - foodRadius * 0.3, foodRadius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Draw snake shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        smoothSnake.forEach((pos, i) => {
            const radius = i === 0 ? CELL_SIZE * 0.5 : CELL_SIZE * 0.4;

            // Function to draw circle at pos
            const drawShadow = (x, y) => {
                ctx.beginPath();
                ctx.arc((x + canvasSize) % canvasSize + 2, (y + canvasSize) % canvasSize + 2, radius, 0, Math.PI * 2);
                ctx.fill();
            };

            drawShadow(pos.x, pos.y);
            // Draw duplicate if near edge for smooth wrap
            if (pos.x < CELL_SIZE) drawShadow(pos.x + canvasSize, pos.y);
            if (pos.x > canvasSize - CELL_SIZE) drawShadow(pos.x - canvasSize, pos.y);
            if (pos.y < CELL_SIZE) drawShadow(pos.x, pos.y + canvasSize);
            if (pos.y > canvasSize - CELL_SIZE) drawShadow(pos.x, pos.y - canvasSize);
        });

        // Draw snake body (gradient from head to tail)
        smoothSnake.slice().reverse().forEach((pos, reverseIdx) => {
            const i = smoothSnake.length - 1 - reverseIdx;
            const ratio = i / Math.max(smoothSnake.length - 1, 1);

            // Gradient color: bright green → dark green
            const r = Math.floor(34 + ratio * 20);
            const g = Math.floor(197 - ratio * 60);
            const b = Math.floor(94 - ratio * 40);

            const radius = i === 0 ? CELL_SIZE * 0.5 : CELL_SIZE * 0.4 - ratio * 0.05 * CELL_SIZE;

            // Body segment with gradient
            const segGradient = ctx.createRadialGradient(
                -radius * 0.3, -radius * 0.3, 0,
                0, 0, radius
            );
            segGradient.addColorStop(0, `rgb(${r + 40}, ${g + 30}, ${b + 30})`);
            segGradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);

            ctx.fillStyle = segGradient;

            // Helper to draw segment at position (handling wrap)
            const drawSegment = (x, y) => {
                const drawX = (x + canvasSize) % canvasSize; // Normalize to canvas
                const drawY = (y + canvasSize) % canvasSize;

                ctx.save();
                ctx.translate(drawX, drawY);
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };

            drawSegment(pos.x, pos.y);
            // Draw duplicates for wrapping
            if (pos.x < CELL_SIZE) drawSegment(pos.x + canvasSize, pos.y);
            if (pos.x > canvasSize - CELL_SIZE) drawSegment(pos.x - canvasSize, pos.y);
            if (pos.y < CELL_SIZE) drawSegment(pos.x, pos.y + canvasSize);
            if (pos.y > canvasSize - CELL_SIZE) drawSegment(pos.x, pos.y - canvasSize);
        });

        // Draw snake head details (eyes and mouth)
        // Draw snake head details (eyes and mouth)
        if (smoothSnake.length > 0) {
            const head = smoothSnake[0];
            const headRadius = CELL_SIZE * 0.5;
            const dir = directionRef.current;

            const drawHead = (x, y) => {
                const drawX = (x + canvasSize) % canvasSize;
                const drawY = (y + canvasSize) % canvasSize;

                ctx.save();
                ctx.translate(drawX, drawY);

                // Eye positions relative to center (0,0)
                const eyeOffset = headRadius * 0.4;
                const eyeForward = headRadius * 0.2;
                let eye1X, eye1Y, eye2X, eye2Y;

                if (dir === DIRECTIONS.RIGHT) {
                    eye1X = eyeForward; eye1Y = -eyeOffset;
                    eye2X = eyeForward; eye2Y = eyeOffset;
                } else if (dir === DIRECTIONS.LEFT) {
                    eye1X = -eyeForward; eye1Y = -eyeOffset;
                    eye2X = -eyeForward; eye2Y = eyeOffset;
                } else if (dir === DIRECTIONS.UP) {
                    eye1X = -eyeOffset; eye1Y = -eyeForward;
                    eye2X = eyeOffset; eye2Y = -eyeForward;
                } else {
                    eye1X = -eyeOffset; eye1Y = eyeForward;
                    eye2X = eyeOffset; eye2Y = eyeForward;
                }

                // Eyes (white)
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(eye1X, eye1Y, headRadius * 0.25, 0, Math.PI * 2);
                ctx.arc(eye2X, eye2Y, headRadius * 0.25, 0, Math.PI * 2);
                ctx.fill();

                // Pupils (black)
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(eye1X + dir.x * 2, eye1Y + dir.y * 2, headRadius * 0.12, 0, Math.PI * 2);
                ctx.arc(eye2X + dir.x * 2, eye2Y + dir.y * 2, headRadius * 0.12, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            };

            drawHead(head.x, head.y);
            // Draw duplicates for wrapping head
            if (head.x < CELL_SIZE) drawHead(head.x + canvasSize, head.y);
            if (head.x > canvasSize - CELL_SIZE) drawHead(head.x - canvasSize, head.y);
            if (head.y < CELL_SIZE) drawHead(head.x, head.y + canvasSize);
            if (head.y > canvasSize - CELL_SIZE) drawHead(head.x, head.y - canvasSize);
        }

        // Game over blur overlay
        if (gameStatus === 'gameover' && gameOverOpacity > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${gameOverOpacity * 0.5})`;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
        }

    }, [smoothSnake, smoothFood, foodBounce, boardSize, canvasSize, gameStatus, gameOverOpacity]);

    // Keyboard handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Handle idle state keyboard shortcuts
            if (gameStatus === 'idle') {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startGame();
                    return;
                }
                if (e.key === 'h' || e.key === 'H') {
                    e.preventDefault();
                    startTutorial();
                    return;
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    navigate('/games/snake');
                    return;
                }
                return;
            }

            // Handle gameover state
            if (gameStatus === 'gameover') {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startGame();
                    return;
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    navigate('/games/snake');
                    return;
                }
                return;
            }

            // Handle paused state
            if (gameStatus === 'paused') {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                    e.preventDefault();
                    togglePause();
                    return;
                }
                return;
            }

            if (gameStatus !== 'playing' && gameStatus !== 'tutorial') {
                return;
            }

            const currentStep = TUTORIAL_STEPS[tutorialStep];
            let pressedDir = null;

            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W': e.preventDefault(); pressedDir = 'UP'; break;
                case 'ArrowDown': case 's': case 'S': e.preventDefault(); pressedDir = 'DOWN'; break;
                case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); pressedDir = 'LEFT'; break;
                case 'ArrowRight': case 'd': case 'D': e.preventDefault(); pressedDir = 'RIGHT'; break;
                case ' ':
                    e.preventDefault();
                    if (gameStatus === 'playing') togglePause();
                    return;
                default: return;
            }

            // Tutorial key validation
            if (gameStatus === 'tutorial' && currentStep?.action === 'press_key_and_eat' && !tutorialMoving) {
                if (pressedDir === currentStep.requiredKey) {
                    directionRef.current = DIRECTIONS[pressedDir];
                    setDirection(DIRECTIONS[pressedDir]);
                    setTutorialMoving(true);
                }
                return;
            }

            // Prevent 180° turn
            const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
            const currentDirName = Object.keys(DIRECTIONS).find(k => DIRECTIONS[k] === directionRef.current);
            if (pressedDir !== opposite[currentDirName] && pressedDir !== currentDirName) {
                playSound(turnSoundRef);
                directionRef.current = DIRECTIONS[pressedDir];
                setDirection(DIRECTIONS[pressedDir]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStatus, tutorialStep, tutorialMoving, navigate]);

    // Tutorial food advancement - place food AFTER snake has stopped
    useEffect(() => {
        if (gameStatus !== 'tutorial') return;
        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (currentStep?.action === 'press_key_and_eat') {
            const expectedEaten = tutorialStep - 1;
            if (tutorialFoodEaten > expectedEaten) {
                setTutorialMoving(false);
                // Place food for next step AFTER snake has stopped at its final position
                // Use setTimeout to ensure snake state has updated
                setTimeout(() => {
                    const currentSnake = snakeRef.current;
                    const nextStepIndex = tutorialStep + 1;
                    setFood(generateTutorialFood(currentSnake, nextStepIndex));
                }, 50);
                setTutorialStep(prev => prev + 1);
            }
        }
    }, [tutorialFoodEaten, tutorialStep, gameStatus, generateTutorialFood]);

    // Typewriter effect
    useEffect(() => {
        if (gameStatus !== 'tutorial') return;
        const step = TUTORIAL_STEPS[tutorialStep];
        if (!step) return;

        if (typingRef.current) clearInterval(typingRef.current);
        setIsTyping(true);
        setDisplayedTitle('');
        setDisplayedText('');

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
                    // Stop keyboard sound when typing is done
                    stopSound(keyboardSoundRef);
                }
            }
        }, 40);

        return () => {
            clearInterval(typingRef.current);
            // Stop keyboard sound on cleanup
            stopSound(keyboardSoundRef);
        };
    }, [tutorialStep, gameStatus, playSound, stopSound]);

    // Game controls
    const startGame = async () => {
        playSound(gameStartSoundRef);
        const center = Math.floor(boardSize / 2);
        const initialSnake = [{ x: center, y: center }];
        setSnake(initialSnake);
        setSmoothSnake([{ x: center * CELL_SIZE + CELL_SIZE / 2, y: center * CELL_SIZE + CELL_SIZE / 2 }]);
        setFood(generateFood(initialSnake));
        setDirection(DIRECTIONS.RIGHT);
        directionRef.current = DIRECTIONS.RIGHT;
        setScore(0);
        setSpeed(DIFFICULTY_SETTINGS[difficulty].speed);
        setGameOverOpacity(0);
        setGameStatus('playing');

        // Start session for API tracking
        if (isAuthenticated) {
            await startSession(lobbySettings, { snake: initialSnake, food: generateFood(initialSnake) });
        }
    };

    // Save game progress manually
    const handleSaveGame = async () => {
        if (gameStatus !== 'playing' && gameStatus !== 'paused') return;

        // Pause the game first
        setGameStatus('paused');

        const gameState = {
            snake: snakeRef.current,
            food: foodRef.current,
            direction: Object.keys(DIRECTIONS).find(k => DIRECTIONS[k] === directionRef.current),
            score: score,
        };
        await saveProgress(gameState);
        import('sonner').then(({ toast }) => {
            toast.success('Đã lưu game!', { duration: 2000 });
        });
    };

    // Resume game from session if provided
    useEffect(() => {
        if (resumeSession?.id && gameStatus === 'idle') {
            // Set session ID for completing later
            setResumeSessionId(resumeSession.id, resumeSession.started_at, resumeSession.moves_count);

            // If we have saved game_state with snake data, restore it
            if (resumeSession.game_state?.snake && resumeSession.game_state.snake.length > 0) {
                const { snake: savedSnake, food: savedFood, score: savedScore, direction: savedDirection } = resumeSession.game_state;
                setSnake(savedSnake);
                setSmoothSnake(savedSnake.map(seg => ({
                    x: seg.x * CELL_SIZE + CELL_SIZE / 2,
                    y: seg.y * CELL_SIZE + CELL_SIZE / 2
                })));
                if (savedFood) setFood(savedFood);
                if (savedScore) setScore(savedScore);
                if (savedDirection && DIRECTIONS[savedDirection]) {
                    setDirection(DIRECTIONS[savedDirection]);
                    directionRef.current = DIRECTIONS[savedDirection];
                }
                setGameStatus('playing');
                playSound(gameStartSoundRef);
            } else {
                // No game_state saved yet - start fresh game with same session
                const center = Math.floor(boardSize / 2);
                const initialSnake = [{ x: center, y: center }];
                setSnake(initialSnake);
                setSmoothSnake([{ x: center * CELL_SIZE + CELL_SIZE / 2, y: center * CELL_SIZE + CELL_SIZE / 2 }]);
                setFood(generateFood(initialSnake));
                setDirection(DIRECTIONS.RIGHT);
                directionRef.current = DIRECTIONS.RIGHT;
                setScore(0);
                setSpeed(DIFFICULTY_SETTINGS[difficulty].speed);
                setGameOverOpacity(0);
                setGameStatus('playing');
                playSound(gameStartSoundRef);
            }
        }
    }, [resumeSession, setResumeSessionId, boardSize, difficulty, generateFood]);

    // Update game state ref whenever state changes (for beforeunload save)
    useEffect(() => {
        if (gameStatus === 'playing' || gameStatus === 'paused') {
            updateGameState({
                snake: snakeRef.current,
                food: foodRef.current,
                direction: Object.keys(DIRECTIONS).find(k => DIRECTIONS[k] === directionRef.current),
                score: score,
            });
        }
    }, [snake, food, score, gameStatus, updateGameState]);

    const startTutorial = () => {
        const initialSnake = [{ x: 5, y: 10 }];
        setSnake(initialSnake);
        setSmoothSnake([{ x: 5 * CELL_SIZE + CELL_SIZE / 2, y: 10 * CELL_SIZE + CELL_SIZE / 2 }]);
        // Place food to the RIGHT for step 1 (index 1 = "Đi sang phải")
        setFood({ x: 8, y: 10 }); // 3 cells to the right
        setDirection(DIRECTIONS.RIGHT);
        directionRef.current = DIRECTIONS.RIGHT;
        setScore(0);
        setTutorialStep(0);
        tutorialStepRef.current = 0;
        setTutorialFoodEaten(0);
        setTutorialMoving(false);
        setGameStatus('tutorial');
    };

    const exitTutorial = () => {
        setGameStatus('idle');
        setTutorialStep(0);
    };

    const nextTutorialStep = () => {
        const step = TUTORIAL_STEPS[tutorialStep];
        if (step?.action === 'finish') {
            stopSound(keyboardSoundRef);
            startGame();
        } else setTutorialStep(prev => prev + 1);
    };

    const togglePause = () => {
        if (gameStatus === 'playing') setGameStatus('paused');
        else if (gameStatus === 'paused') setGameStatus('playing');
    };

    // const handleDifficultyChange = (newDiff) => {
    //     setDifficulty(newDiff);
    //     // setShowSettings(false);
    //     if (gameStatus === 'idle') setSpeed(DIFFICULTY_SETTINGS[newDiff].speed);
    // };

    // Mobile controls
    const handleMobileControl = (dir) => {
        if (gameStatus !== 'playing' && gameStatus !== 'tutorial') return;
        const opposite = { UP: DIRECTIONS.DOWN, DOWN: DIRECTIONS.UP, LEFT: DIRECTIONS.RIGHT, RIGHT: DIRECTIONS.LEFT };
        if (directionRef.current !== opposite[dir]) {
            directionRef.current = DIRECTIONS[dir];
            setDirection(DIRECTIONS[dir]);
        }
    };

    const currentStep = TUTORIAL_STEPS[tutorialStep];

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all"
                    onClick={() => navigate('/games/snake')}
                >
                    <Home size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-wider text-foreground">
                        {gameStatus === 'tutorial' ? '📖 HƯỚNG DẪN' : '🐍 RẮN SĂN MỒI'}
                    </span>
                    {gameStatus !== 'tutorial' && (
                        <>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                                difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-red-500/20 text-red-500'
                                }`}>
                                {DIFFICULTY_SETTINGS[difficulty]?.label}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${wallMode === 'solid' ? 'bg-orange-500/20 text-orange-500' :
                                'bg-purple-500/20 text-purple-500'
                                }`}>
                                {wallMode === 'solid' ? '🧱' : '🌀'}
                            </span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Save Button - only during play/paused */}
                    {(gameStatus === 'playing' || gameStatus === 'paused') && (
                        <button
                            className="w-10 h-10 flex items-center justify-center bg-emerald-500/20 rounded-lg text-emerald-500 hover:bg-emerald-500/30 transition-all"
                            onClick={handleSaveGame}
                            title="Lưu game"
                        >
                            <Save size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Score Bar */}
            <div className="flex items-center justify-center gap-8 p-4 bg-card">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                    <span className="text-sm text-muted-foreground">Điểm:</span>
                    <span className="font-mono text-xl font-bold text-green-500">{score}</span>
                </div>
                {gameStatus !== 'tutorial' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                        <Trophy size={16} className="text-yellow-500" />
                        <span className="text-sm text-muted-foreground">Cao nhất:</span>
                        <span className="font-mono text-xl font-bold text-yellow-500">{highScore}</span>
                    </div>
                )}
            </div>

            {/* Game Area */}
            <div className="flex-1 flex items-center justify-center gap-6 p-4">
                {/* Game Board - Neumorphism Style */}
                <div
                    className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-3"
                    style={{
                        boxShadow: '8px 8px 16px rgba(0,0,0,0.15), -8px -8px 16px rgba(255,255,255,0.8)',
                        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`
                    }}
                >
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.5)'
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            width={canvasSize}
                            height={canvasSize}
                            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                        />
                    </div>

                    {/* Overlay for idle/paused/gameover */}
                    {(gameStatus === 'idle' || gameStatus === 'paused' || gameStatus === 'gameover') && (
                        <div className="absolute inset-3 bg-black/60 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                            {gameStatus === 'idle' && (
                                <>
                                    <div className="text-3xl font-bold text-white mb-4">🐍 Rắn Săn Mồi</div>
                                    <button
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg mb-3"
                                        onClick={startGame}
                                    >
                                        <Play size={20} /> Bắt đầu
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                                        onClick={startTutorial}
                                    >
                                        <BookOpen size={20} /> Hướng dẫn
                                    </button>
                                    <div className="text-sm text-gray-400 mt-4">Dùng phím mũi tên hoặc WASD</div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {boardSize}x{boardSize} | {DIFFICULTY_SETTINGS[difficulty]?.label} | {wallMode === 'solid' ? 'Tường cứng' : 'Xuyên tường'}
                                    </div>
                                </>
                            )}
                            {gameStatus === 'paused' && (
                                <>
                                    <div className="text-3xl font-bold text-white mb-4">⏸️ Tạm dừng</div>
                                    <button
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                                        onClick={togglePause}
                                    >
                                        <Play size={20} /> Tiếp tục
                                    </button>
                                </>
                            )}
                            {gameStatus === 'gameover' && (
                                <>
                                    <div className="text-3xl font-bold text-red-400 mb-2 animate-pulse">💀 Game Over</div>
                                    <div className="text-xl text-white mb-4">Điểm: <span className="text-green-400 font-bold">{score}</span></div>
                                    <button
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                                        onClick={startGame}
                                    >
                                        <RotateCcw size={20} /> Chơi lại
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Tutorial Panel */}
                {gameStatus === 'tutorial' && currentStep && (
                    <div className="hidden md:flex flex-col w-64 h-fit p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <BookOpen size={18} className="text-green-400" />
                                <span className="text-sm font-semibold text-green-400">Hướng dẫn</span>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent" onClick={exitTutorial}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex gap-1 mb-4">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div key={idx} className={`flex-1 h-1.5 rounded-full transition-colors ${idx < tutorialStep ? 'bg-green-500' :
                                    idx === tutorialStep ? 'bg-green-400 animate-pulse' : 'bg-secondary'
                                    }`} />
                            ))}
                        </div>

                        <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-1">Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}</div>
                            <div className="text-lg font-bold text-foreground mb-2">
                                {displayedTitle}
                                {isTyping && displayedText.length === 0 && <span className="animate-pulse">|</span>}
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                                {displayedText}
                                {isTyping && displayedText.length > 0 && <span className="animate-pulse text-green-400">|</span>}
                            </div>
                        </div>

                        {!isTyping && currentStep.action === 'click_next' && (
                            <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all" onClick={nextTutorialStep}>
                                Tiếp tục <ChevronRight size={16} />
                            </button>
                        )}

                        {!isTyping && currentStep.action === 'press_key_and_eat' && !tutorialMoving && (
                            <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/50">
                                <div className="text-sm text-muted-foreground">Nhấn phím:</div>
                                <div className="text-4xl font-bold text-green-400 animate-pulse">
                                    {currentStep.requiredKey === 'UP' && '↑ W'}
                                    {currentStep.requiredKey === 'DOWN' && '↓ S'}
                                    {currentStep.requiredKey === 'LEFT' && '← A'}
                                    {currentStep.requiredKey === 'RIGHT' && '→ D'}
                                </div>
                            </div>
                        )}

                        {tutorialMoving && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-green-500/20 rounded-xl border border-green-500/50">
                                <div className="text-sm text-green-400 animate-pulse">🐍 Đang di chuyển...</div>
                            </div>
                        )}

                        {!isTyping && currentStep.action === 'finish' && (
                            <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all" onClick={nextTutorialStep}>
                                🎮 Bắt đầu chơi
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex justify-center p-2">
                <div className="grid grid-cols-3 gap-2 w-40">
                    <div />
                    <button className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent text-xl" onClick={() => handleMobileControl('UP')}>▲</button>
                    <div />
                    <button className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent text-xl" onClick={() => handleMobileControl('LEFT')}>◀</button>
                    <button className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent" onClick={gameStatus === 'playing' ? togglePause : undefined}>
                        {gameStatus === 'playing' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent text-xl" onClick={() => handleMobileControl('RIGHT')}>▶</button>
                    <div />
                    <button className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent text-xl" onClick={() => handleMobileControl('DOWN')}>▼</button>
                    <div />
                </div>
            </div>
        </div>
    );
};

export default SnakeGame;
