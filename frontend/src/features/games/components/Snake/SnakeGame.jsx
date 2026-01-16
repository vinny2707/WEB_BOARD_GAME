import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Play, Pause, RotateCcw, Settings, Trophy, BookOpen, X, ChevronRight } from 'lucide-react';

const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

const DIFFICULTY_SETTINGS = {
    easy: { speed: 200, label: 'Dễ' },
    medium: { speed: 150, label: 'Trung Bình' },
    hard: { speed: 80, label: 'Khó' }
};

// Tutorial steps - press key → snake moves until eating food → next step
const TUTORIAL_STEPS = [
    {
        id: 1,
        title: 'Chào mừng! 🐍',
        message: 'Hãy học cách điều khiển rắn bằng bàn phím nhé!',
        action: 'click_next',
        snakePos: { x: 10, y: 10 },
        foodPos: { x: 14, y: 10 }, // Food to the right
        requiredKey: null
    },
    {
        id: 2,
        title: 'Đi sang phải ➡️',
        message: 'Nhấn phím → hoặc D. Rắn sẽ đi sang phải và ăn táo!',
        action: 'press_key_and_eat',
        snakePos: null,
        foodPos: { x: 14, y: 10 },
        requiredKey: 'RIGHT'
    },
    {
        id: 3,
        title: 'Đi lên ⬆️',
        message: 'Nhấn phím ↑ hoặc W. Rắn sẽ đi lên và ăn táo!',
        action: 'press_key_and_eat',
        snakePos: null,
        foodPos: { x: 14, y: 6 }, // Food above
        requiredKey: 'UP'
    },
    {
        id: 4,
        title: 'Đi xuống ⬇️',
        message: 'Nhấn phím ↓ hoặc S. Rắn sẽ đi xuống và ăn táo!',
        action: 'press_key_and_eat',
        snakePos: null,
        foodPos: { x: 14, y: 12 }, // Food below
        requiredKey: 'DOWN'
    },
    {
        id: 5,
        title: 'Đi sang trái ⬅️',
        message: 'Nhấn phím ← hoặc A. Rắn sẽ đi sang trái và ăn táo!',
        action: 'press_key_and_eat',
        snakePos: null,
        foodPos: { x: 8, y: 12 }, // Food to the left
        requiredKey: 'LEFT'
    },
    {
        id: 6,
        title: 'Cảnh báo! ⚠️',
        message: 'Nhớ: KHÔNG va vào tường và KHÔNG cắn thân mình!',
        action: 'click_next',
        snakePos: null,
        foodPos: null,
        requiredKey: null
    },
    {
        id: 7,
        title: 'Hoàn thành! 🏆',
        message: 'Bạn đã sẵn sàng! Chúc may mắn!',
        action: 'finish',
        snakePos: null,
        foodPos: null,
        requiredKey: null
    }
];

const SnakeGame = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get settings from lobby navigation state
    const lobbySettings = location.state?.settings || {};
    const boardSize = lobbySettings.boardSize || 20;
    const wallMode = lobbySettings.wallMode || 'solid'; // 'solid' or 'wrap'
    const initialDifficulty = lobbySettings.difficulty || 'medium';

    const [snake, setSnake] = useState([{ x: Math.floor(boardSize / 2), y: Math.floor(boardSize / 2) }]);
    const [food, setFood] = useState({ x: Math.floor(boardSize / 2) + 5, y: Math.floor(boardSize / 2) });
    const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
    const [gameStatus, setGameStatus] = useState('idle'); // 'idle', 'playing', 'paused', 'gameover', 'tutorial'
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [speed, setSpeed] = useState(DIFFICULTY_SETTINGS[initialDifficulty].speed);
    const [difficulty, setDifficulty] = useState(initialDifficulty);
    const [showSettings, setShowSettings] = useState(false);

    // Tutorial state
    const [tutorialStep, setTutorialStep] = useState(0);
    const [tutorialFoodEaten, setTutorialFoodEaten] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [displayedTitle, setDisplayedTitle] = useState('');
    const [isNearDanger, setIsNearDanger] = useState(null);
    const [tutorialMoving, setTutorialMoving] = useState(false); // Snake is moving after key press

    const directionRef = useRef(direction);
    const gameLoopRef = useRef(null);
    const typingRef = useRef(null);

    // Check if snake is near danger (wall or body)
    const checkNearDanger = useCallback((snakeHead, snakeBody) => {
        // Only check for wall danger in solid mode
        if (wallMode === 'solid') {
            if (snakeHead.x <= 1 || snakeHead.x >= boardSize - 2 ||
                snakeHead.y <= 1 || snakeHead.y >= boardSize - 2) {
                return 'wall';
            }
        }
        // Check near body (adjacent to any body segment)
        const adjacentPositions = [
            { x: snakeHead.x + 1, y: snakeHead.y },
            { x: snakeHead.x - 1, y: snakeHead.y },
            { x: snakeHead.x, y: snakeHead.y + 1 },
            { x: snakeHead.x, y: snakeHead.y - 1 }
        ];
        for (const pos of adjacentPositions) {
            if (snakeBody.slice(2).some(seg => seg.x === pos.x && seg.y === pos.y)) {
                return 'body';
            }
        }
        return null;
    }, [boardSize, wallMode]);

    // Generate random food position
    const generateFood = useCallback((currentSnake) => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * boardSize),
                y: Math.floor(Math.random() * boardSize)
            };
        } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }, [boardSize]);

    // Check collision with walls or self
    const checkCollision = useCallback((head, snakeBody) => {
        // Wall collision - only in solid mode
        if (wallMode === 'solid') {
            if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
                return true;
            }
        }
        // Self collision (skip head)
        return snakeBody.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }, [boardSize, wallMode]);

    // Wrap position for wrap mode
    const wrapPosition = useCallback((pos) => {
        let { x, y } = pos;
        if (x < 0) x = boardSize - 1;
        if (x >= boardSize) x = 0;
        if (y < 0) y = boardSize - 1;
        if (y >= boardSize) y = 0;
        return { x, y };
    }, [boardSize]);

    // Game loop
    const gameLoop = useCallback(() => {
        setSnake(prevSnake => {
            let newHead = {
                x: prevSnake[0].x + directionRef.current.x,
                y: prevSnake[0].y + directionRef.current.y
            };

            // Wrap position in wrap mode
            if (wallMode === 'wrap') {
                newHead = wrapPosition(newHead);
            }

            // Check collision
            if (checkCollision(newHead, prevSnake)) {
                if (gameStatus === 'tutorial') {
                    // In tutorial, just reset position
                    return [{ x: Math.floor(boardSize / 2), y: Math.floor(boardSize / 2) }];
                }
                setGameStatus('gameover');
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Check if eating food
            if (newHead.x === food.x && newHead.y === food.y) {
                if (gameStatus === 'tutorial') {
                    setTutorialFoodEaten(prev => prev + 1);
                }
                setScore(prev => {
                    const newScore = prev + 10;
                    if (newScore > highScore && gameStatus !== 'tutorial') {
                        setHighScore(newScore);
                        localStorage.setItem('snakeHighScore', newScore.toString());
                    }
                    return newScore;
                });
                setFood(generateFood(newSnake));
                // Increase speed (only in normal game)
                if (gameStatus !== 'tutorial') {
                    setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
                }
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [food, generateFood, checkCollision, highScore, gameStatus, wallMode, wrapPosition, boardSize]);

    // Check danger proximity for tutorial warning
    useEffect(() => {
        if (gameStatus !== 'tutorial' && gameStatus !== 'playing') return;
        const danger = checkNearDanger(snake[0], snake);
        setIsNearDanger(danger);
    }, [snake, gameStatus, checkNearDanger]);

    // Tutorial step advancement when eating food
    useEffect(() => {
        if (gameStatus !== 'tutorial') return;

        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (!currentStep) return;

        // press_key_and_eat: when food is eaten, stop moving and go to next step
        if (currentStep.action === 'press_key_and_eat') {
            // Count how many foods should have been eaten by this step
            const expectedEaten = tutorialStep - 1; // step 1=0, step 2=1, step 3=2, etc
            if (tutorialFoodEaten > expectedEaten) {
                setTutorialMoving(false);
                setTutorialStep(prev => prev + 1);
            }
        }
    }, [tutorialFoodEaten, tutorialStep, gameStatus]);

    // Place food according to tutorial step
    useEffect(() => {
        if (gameStatus !== 'tutorial') return;

        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (currentStep?.foodPos) {
            setFood(currentStep.foodPos);
        }
    }, [tutorialStep, gameStatus]);

    // Typewriter effect for tutorial
    useEffect(() => {
        if (gameStatus !== 'tutorial') return;

        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (!currentStep) return;

        // Clear previous typing
        if (typingRef.current) {
            clearInterval(typingRef.current);
        }

        setIsTyping(true);
        setDisplayedTitle('');
        setDisplayedText('');

        const fullTitle = currentStep.title;
        const fullMessage = currentStep.message;
        let titleIndex = 0;
        let messageIndex = 0;
        let typingPhase = 'title'; // 'title' then 'message'

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
                }
            }
        }, 40); // 40ms per character

        return () => {
            if (typingRef.current) {
                clearInterval(typingRef.current);
            }
        };
    }, [tutorialStep, gameStatus]);

    // Handle direction change for tutorial (press_button_up action)
    const handleTutorialButtonUp = () => {
        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (currentStep?.action === 'press_button_up') {
            directionRef.current = DIRECTIONS.UP;
            setDirection(DIRECTIONS.UP);
            setTutorialStep(3); // Move to next step
        }
    };

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStatus !== 'playing' && gameStatus !== 'tutorial') {
                if (e.key === ' ' && gameStatus === 'idle') {
                    startGame();
                }
                return;
            }

            // Get current tutorial step
            const currentStep = TUTORIAL_STEPS[tutorialStep];

            // Map key to direction name
            let pressedDirection = null;
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    pressedDirection = 'UP';
                    break;
                case 'ArrowDown': case 's': case 'S':
                    pressedDirection = 'DOWN';
                    break;
                case 'ArrowLeft': case 'a': case 'A':
                    pressedDirection = 'LEFT';
                    break;
                case 'ArrowRight': case 'd': case 'D':
                    pressedDirection = 'RIGHT';
                    break;
                case ' ':
                    if (gameStatus === 'playing') togglePause();
                    return;
                default:
                    return;
            }

            // In tutorial with press_key_and_eat action, only accept correct key
            if (gameStatus === 'tutorial' && currentStep?.action === 'press_key_and_eat' && !tutorialMoving) {
                if (pressedDirection === currentStep.requiredKey) {
                    // Correct key! Change direction, move one step, and advance
                    directionRef.current = DIRECTIONS[pressedDirection];
                    setDirection(DIRECTIONS[pressedDirection]);
                    // Start continuous movement - step advances when food is eaten
                    setTutorialMoving(true);
                }
                // Wrong key - ignore
                return;
            }

            // Normal play or eat_food_free tutorial step - allow any valid direction
            const opposite = {
                UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT'
            };
            const currentDirName = Object.keys(DIRECTIONS).find(
                key => DIRECTIONS[key] === directionRef.current
            );

            if (pressedDirection !== opposite[currentDirName]) {
                directionRef.current = DIRECTIONS[pressedDirection];
                setDirection(DIRECTIONS[pressedDirection]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus, tutorialStep]);

    // Game loop interval - run when playing or tutorialMoving
    useEffect(() => {
        if (gameStatus === 'playing' || (gameStatus === 'tutorial' && tutorialMoving && !isTyping)) {
            const currentSpeed = gameStatus === 'tutorial' ? 180 : speed;
            gameLoopRef.current = setInterval(gameLoop, currentSpeed);
        } else {
            clearInterval(gameLoopRef.current);
        }
        return () => clearInterval(gameLoopRef.current);
    }, [gameStatus, speed, gameLoop, isTyping, tutorialMoving]);

    const startGame = () => {
        const center = Math.floor(boardSize / 2);
        const initialSnake = [{ x: center, y: center }];
        setSnake(initialSnake);
        setFood(generateFood(initialSnake));
        setDirection(DIRECTIONS.RIGHT);
        directionRef.current = DIRECTIONS.RIGHT;
        setScore(0);
        setSpeed(DIFFICULTY_SETTINGS[difficulty].speed);
        setGameStatus('playing');
    };

    const startTutorial = () => {
        const initialSnake = [{ x: 5, y: 10 }];
        setSnake(initialSnake);
        setFood({ x: 12, y: 10 }); // Food to the right - logical!
        setDirection(DIRECTIONS.RIGHT);
        directionRef.current = DIRECTIONS.RIGHT;
        setScore(0);
        setTutorialStep(0);
        setTutorialFoodEaten(0);
        setIsTyping(false);
        setGameStatus('tutorial');
    };

    const exitTutorial = () => {
        setGameStatus('idle');
        setTutorialStep(0);
        setTutorialFoodEaten(0);
    };

    const nextTutorialStep = () => {
        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (currentStep.action === 'finish') {
            startGame();
        } else {
            setTutorialStep(prev => prev + 1);
        }
    };

    const togglePause = () => {
        if (gameStatus === 'playing') {
            setGameStatus('paused');
        } else if (gameStatus === 'paused') {
            setGameStatus('playing');
        }
    };

    const handleDifficultyChange = (newDifficulty) => {
        setDifficulty(newDifficulty);
        setShowSettings(false);
        if (gameStatus === 'idle') {
            setSpeed(DIFFICULTY_SETTINGS[newDifficulty].speed);
        }
    };

    // Mobile controls
    const handleMobileControl = (dir) => {
        if (gameStatus !== 'playing' && gameStatus !== 'tutorial') return;

        const newDir = DIRECTIONS[dir];
        const opposite = {
            UP: DIRECTIONS.DOWN,
            DOWN: DIRECTIONS.UP,
            LEFT: DIRECTIONS.RIGHT,
            RIGHT: DIRECTIONS.LEFT
        };

        if (directionRef.current !== opposite[dir]) {
            directionRef.current = newDir;
            setDirection(newDir);
        }
    };

    const renderCell = (x, y) => {
        const isSnakeHead = snake[0].x === x && snake[0].y === y;
        const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;

        const currentStep = TUTORIAL_STEPS[tutorialStep];
        const shouldHighlightFood = gameStatus === 'tutorial' && currentStep?.highlight === 'food' && isFood;

        let cellClass = 'aspect-square rounded-sm transition-colors duration-100 ';

        if (isSnakeHead) {
            cellClass += 'bg-green-500 shadow-lg';
        } else if (isSnakeBody) {
            cellClass += 'bg-green-400';
        } else if (isFood) {
            cellClass += shouldHighlightFood
                ? 'bg-red-500 animate-ping rounded-full'
                : 'bg-red-500 animate-pulse rounded-full';
        } else {
            cellClass += 'bg-secondary/50';
        }

        return <div key={`${x}-${y}`} className={cellClass} />;
    };

    const currentTutorialStep = TUTORIAL_STEPS[tutorialStep];
    const showNextButton = currentTutorialStep?.action === 'click_next' || currentTutorialStep?.action === 'finish';

    // Calculate cell size based on board size
    const getCellSize = () => {
        const maxBoardPx = 400;
        return Math.floor(maxBoardPx / boardSize);
    };

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            {/* Top Navigation */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={() => navigate('/games/snake')}
                >
                    <Home size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-wider text-foreground">
                        {gameStatus === 'tutorial' ? '📖 HƯỚNG DẪN' : 'RẮN SĂN MỒI'}
                    </span>
                    {gameStatus !== 'tutorial' && (
                        <>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                                difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                                }`}>
                                {DIFFICULTY_SETTINGS[difficulty]?.label}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${wallMode === 'solid' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'
                                }`}>
                                {wallMode === 'solid' ? '🧱' : '🌀'}
                            </span>
                        </>
                    )}
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
                    <div className="text-sm font-semibold text-foreground mb-2">Độ khó</div>
                    <div className="flex gap-2">
                        {Object.entries(DIFFICULTY_SETTINGS).map(([key, { label }]) => (
                            <button
                                key={key}
                                className={`flex-1 py-2 px-4 bg-secondary border-2 rounded-lg text-sm font-medium transition-all
                                    ${difficulty === key
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'text-muted-foreground border-transparent hover:border-green-500'}`}
                                onClick={() => handleDifficultyChange(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}



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
                {gameStatus !== 'tutorial' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                        <span className="text-sm text-muted-foreground">Bàn:</span>
                        <span className="font-mono text-sm font-bold text-foreground">{boardSize}x{boardSize}</span>
                    </div>
                )}
            </div>

            {/* Game Area */}
            <div className="flex-1 flex items-center justify-center gap-6 p-4">
                {/* Game Board Container */}
                <div className="flex flex-col items-center gap-4">
                    <div className={`bg-card rounded-lg p-2 shadow-lg relative
                        ${gameStatus === 'tutorial' && isNearDanger === 'wall' ? 'border-4 border-red-500' :
                            gameStatus === 'tutorial' && isNearDanger === 'body' ? 'border-4 border-orange-500' :
                                'border-2 border-border'}`}>
                        <div
                            className="grid gap-[1px]"
                            style={{
                                gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                                width: 'min(80vw, 400px)',
                                height: 'min(80vw, 400px)'
                            }}
                        >
                            {Array.from({ length: boardSize * boardSize }).map((_, i) => {
                                const x = i % boardSize;
                                const y = Math.floor(i / boardSize);
                                return renderCell(x, y);
                            })}
                        </div>

                        {/* Overlay for idle/paused/gameover */}
                        {(gameStatus === 'idle' || gameStatus === 'paused' || gameStatus === 'gameover') && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                                {gameStatus === 'idle' && (
                                    <>
                                        <div className="text-2xl font-bold text-white mb-4">🐍 Rắn Săn Mồi</div>
                                        <button
                                            className="flex items-center gap-2 px-6 py-3 bg-green-500 rounded-xl text-white font-semibold hover:bg-green-600 transition-all mb-3"
                                            onClick={startGame}
                                        >
                                            <Play size={20} />
                                            Bắt đầu
                                        </button>
                                        <button
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:bg-blue-600 transition-all"
                                            onClick={startTutorial}
                                        >
                                            <BookOpen size={20} />
                                            Hướng dẫn
                                        </button>
                                        <div className="text-sm text-gray-400 mt-4">Dùng phím mũi tên hoặc WASD</div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            {boardSize}x{boardSize} | {DIFFICULTY_SETTINGS[difficulty]?.label} | {wallMode === 'solid' ? 'Tường cứng' : 'Xuyên tường'}
                                        </div>
                                    </>
                                )}
                                {gameStatus === 'paused' && (
                                    <>
                                        <div className="text-2xl font-bold text-white mb-4">⏸️ Tạm dừng</div>
                                        <button
                                            className="flex items-center gap-2 px-6 py-3 bg-green-500 rounded-xl text-white font-semibold hover:bg-green-600 transition-all"
                                            onClick={togglePause}
                                        >
                                            <Play size={20} />
                                            Tiếp tục
                                        </button>
                                    </>
                                )}
                                {gameStatus === 'gameover' && (
                                    <>
                                        <div className="text-2xl font-bold text-red-400 mb-2">💀 Game Over</div>
                                        <div className="text-lg text-white mb-4">Điểm: {score}</div>
                                        <button
                                            className="flex items-center gap-2 px-6 py-3 bg-green-500 rounded-xl text-white font-semibold hover:bg-green-600 transition-all"
                                            onClick={startGame}
                                        >
                                            <RotateCcw size={20} />
                                            Chơi lại
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tutorial Panel - Right Side */}
                {gameStatus === 'tutorial' && currentTutorialStep && (
                    <div className="hidden md:flex flex-col w-64 h-fit p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl shadow-lg">
                        {/* Progress */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <BookOpen size={18} className="text-blue-400" />
                                <span className="text-sm font-semibold text-blue-400">Hướng dẫn</span>
                            </div>
                            <button
                                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent"
                                onClick={exitTutorial}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Step Progress Bar */}
                        <div className="flex gap-1 mb-4">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-1.5 rounded-full transition-colors
                                        ${idx < tutorialStep ? 'bg-blue-500' : idx === tutorialStep ? 'bg-blue-400 animate-pulse' : 'bg-secondary'}`}
                                />
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-1">Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}</div>
                            <div className="text-lg font-bold text-foreground mb-2">
                                {displayedTitle}
                                {isTyping && displayedText.length === 0 && <span className="animate-pulse">|</span>}
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                                {displayedText}
                                {isTyping && displayedText.length > 0 && <span className="animate-pulse text-blue-400">|</span>}
                            </div>
                        </div>

                        {/* Action Button - only show when typing is done */}
                        {!isTyping && currentTutorialStep.action === 'click_next' && (
                            <button
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-all"
                                onClick={nextTutorialStep}
                            >
                                Tiếp tục
                                <ChevronRight size={16} />
                            </button>
                        )}

                        {/* Keyboard Key Indicator for press_key_and_eat steps (show when waiting for key) */}
                        {!isTyping && currentTutorialStep.action === 'press_key_and_eat' && !tutorialMoving && (
                            <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/50">
                                <div className="text-sm text-muted-foreground">Nhấn phím:</div>
                                <div className="text-4xl font-bold text-green-400 animate-pulse">
                                    {currentTutorialStep.requiredKey === 'UP' && '↑ W'}
                                    {currentTutorialStep.requiredKey === 'DOWN' && '↓ S'}
                                    {currentTutorialStep.requiredKey === 'LEFT' && '← A'}
                                    {currentTutorialStep.requiredKey === 'RIGHT' && '→ D'}
                                </div>
                            </div>
                        )}

                        {/* Moving indicator - show when snake is moving toward food */}
                        {tutorialMoving && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-blue-500/20 rounded-xl border border-blue-500/50">
                                <div className="text-sm text-blue-400 animate-pulse">🐍 Rắn đang di chuyển đến táo...</div>
                            </div>
                        )}

                        {/* Finish Button */}
                        {!isTyping && currentTutorialStep.action === 'finish' && (
                            <button
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all"
                                onClick={nextTutorialStep}
                            >
                                🎮 Bắt đầu chơi
                            </button>
                        )}

                        {/* Tips */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                                💡 {currentTutorialStep.action === 'press_key_and_eat' && !tutorialMoving && `Nhấn ${currentTutorialStep.requiredKey === 'UP' ? '↑/W' : currentTutorialStep.requiredKey === 'DOWN' ? '↓/S' : currentTutorialStep.requiredKey === 'LEFT' ? '←/A' : '→/D'} để bắt đầu`}
                                {currentTutorialStep.action === 'press_key_and_eat' && tutorialMoving && 'Chờ rắn ăn táo...'}
                                {currentTutorialStep.action === 'click_next' && 'Nhấn Tiếp tục'}
                                {currentTutorialStep.action === 'finish' && 'Sẵn sàng chơi!'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex justify-center p-2">
                <div className="grid grid-cols-3 gap-2 w-40">
                    <div />
                    <button
                        className={`aspect-square rounded-lg flex items-center justify-center text-foreground active:bg-accent
                            ${gameStatus === 'tutorial' && currentTutorialStep?.highlight === 'up'
                                ? 'bg-blue-500 text-white animate-pulse'
                                : 'bg-secondary'}`}
                        onClick={() => handleMobileControl('UP')}
                    >
                        ▲
                    </button>
                    <div />
                    <button
                        className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent"
                        onClick={() => handleMobileControl('LEFT')}
                    >
                        ◀
                    </button>
                    <button
                        className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent"
                        onClick={gameStatus === 'tutorial' ? undefined : togglePause}
                    >
                        {gameStatus === 'playing' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        className={`aspect-square rounded-lg flex items-center justify-center text-foreground active:bg-accent
                            ${gameStatus === 'tutorial' && currentTutorialStep?.highlight === 'right'
                                ? 'bg-blue-500 text-white animate-pulse'
                                : 'bg-secondary'}`}
                        onClick={() => handleMobileControl('RIGHT')}
                    >
                        ▶
                    </button>
                    <div />
                    <button
                        className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent"
                        onClick={() => handleMobileControl('DOWN')}
                    >
                        ▼
                    </button>
                    <div />
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-4 p-4 bg-card border-t border-border">
                {gameStatus === 'playing' && (
                    <button
                        className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                        onClick={togglePause}
                    >
                        <Pause size={18} />
                        <span>Tạm dừng (Space)</span>
                    </button>
                )}
                {gameStatus === 'tutorial' && (
                    <button
                        className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                        onClick={exitTutorial}
                    >
                        <X size={18} />
                        <span>Thoát hướng dẫn</span>
                    </button>
                )}
                {(gameStatus === 'paused' || gameStatus === 'gameover') && (
                    <button
                        className="flex items-center gap-2 px-5 py-3 bg-green-500 rounded-xl text-sm font-medium text-white transition-all hover:bg-green-600"
                        onClick={startGame}
                    >
                        <RotateCcw size={18} />
                        <span>Chơi lại</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SnakeGame;
