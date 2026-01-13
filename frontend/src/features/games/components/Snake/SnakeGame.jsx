import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Play, Pause, RotateCcw, Settings, Trophy } from 'lucide-react';

const BOARD_SIZE = 20;
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

const SnakeGame = () => {
    const navigate = useNavigate();
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 10 });
    const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
    const [gameStatus, setGameStatus] = useState('idle'); // 'idle', 'playing', 'paused', 'gameover'
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const [difficulty, setDifficulty] = useState('medium');
    const [showSettings, setShowSettings] = useState(false);

    const directionRef = useRef(direction);
    const gameLoopRef = useRef(null);

    // Generate random food position
    const generateFood = useCallback((currentSnake) => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE)
            };
        } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }, []);

    // Check collision with walls or self
    const checkCollision = useCallback((head, snakeBody) => {
        // Wall collision
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
            return true;
        }
        // Self collision (skip head)
        return snakeBody.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }, []);

    // Game loop
    const gameLoop = useCallback(() => {
        setSnake(prevSnake => {
            const newHead = {
                x: prevSnake[0].x + directionRef.current.x,
                y: prevSnake[0].y + directionRef.current.y
            };

            // Check collision
            if (checkCollision(newHead, prevSnake)) {
                setGameStatus('gameover');
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Check if eating food
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(prev => {
                    const newScore = prev + 10;
                    if (newScore > highScore) {
                        setHighScore(newScore);
                        localStorage.setItem('snakeHighScore', newScore.toString());
                    }
                    return newScore;
                });
                setFood(generateFood(newSnake));
                // Increase speed
                setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [food, generateFood, checkCollision, highScore]);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStatus !== 'playing') {
                if (e.key === ' ' && gameStatus === 'idle') {
                    startGame();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (directionRef.current !== DIRECTIONS.DOWN) {
                        directionRef.current = DIRECTIONS.UP;
                        setDirection(DIRECTIONS.UP);
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (directionRef.current !== DIRECTIONS.UP) {
                        directionRef.current = DIRECTIONS.DOWN;
                        setDirection(DIRECTIONS.DOWN);
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (directionRef.current !== DIRECTIONS.RIGHT) {
                        directionRef.current = DIRECTIONS.LEFT;
                        setDirection(DIRECTIONS.LEFT);
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (directionRef.current !== DIRECTIONS.LEFT) {
                        directionRef.current = DIRECTIONS.RIGHT;
                        setDirection(DIRECTIONS.RIGHT);
                    }
                    break;
                case ' ':
                    togglePause();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus]);

    // Game loop interval
    useEffect(() => {
        if (gameStatus === 'playing') {
            gameLoopRef.current = setInterval(gameLoop, speed);
        } else {
            clearInterval(gameLoopRef.current);
        }
        return () => clearInterval(gameLoopRef.current);
    }, [gameStatus, speed, gameLoop]);

    const startGame = () => {
        const initialSnake = [{ x: 10, y: 10 }];
        setSnake(initialSnake);
        setFood(generateFood(initialSnake));
        setDirection(DIRECTIONS.RIGHT);
        directionRef.current = DIRECTIONS.RIGHT;
        setScore(0);
        setSpeed(DIFFICULTY_SETTINGS[difficulty].speed);
        setGameStatus('playing');
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
        if (gameStatus !== 'playing') return;

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

        let cellClass = 'aspect-square rounded-sm transition-colors duration-100 ';

        if (isSnakeHead) {
            cellClass += 'bg-green-500 shadow-lg';
        } else if (isSnakeBody) {
            cellClass += 'bg-green-400';
        } else if (isFood) {
            cellClass += 'bg-red-500 animate-pulse rounded-full';
        } else {
            cellClass += 'bg-secondary/50';
        }

        return <div key={`${x}-${y}`} className={cellClass} />;
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
                <div className="text-lg font-bold tracking-wider text-foreground">RẮN SĂN MỒI</div>
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
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Cao nhất:</span>
                    <span className="font-mono text-xl font-bold text-yellow-500">{highScore}</span>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
                <div className="bg-card rounded-lg p-2 shadow-lg border-2 border-border relative">
                    <div
                        className="grid gap-[1px]"
                        style={{
                            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                            width: 'min(80vw, 400px)',
                            height: 'min(80vw, 400px)'
                        }}
                    >
                        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
                            const x = i % BOARD_SIZE;
                            const y = Math.floor(i / BOARD_SIZE);
                            return renderCell(x, y);
                        })}
                    </div>

                    {/* Overlay for idle/paused/gameover */}
                    {gameStatus !== 'playing' && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                            {gameStatus === 'idle' && (
                                <>
                                    <div className="text-2xl font-bold text-white mb-4">🐍 Rắn Săn Mồi</div>
                                    <button
                                        className="flex items-center gap-2 px-6 py-3 bg-green-500 rounded-xl text-white font-semibold hover:bg-green-600 transition-all"
                                        onClick={startGame}
                                    >
                                        <Play size={20} />
                                        Bắt đầu
                                    </button>
                                    <div className="text-sm text-gray-400 mt-4">Dùng phím mũi tên hoặc WASD</div>
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

                {/* Mobile Controls */}
                <div className="md:hidden grid grid-cols-3 gap-2 w-40">
                    <div />
                    <button
                        className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent"
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
                        onClick={togglePause}
                    >
                        {gameStatus === 'playing' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-foreground active:bg-accent"
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
