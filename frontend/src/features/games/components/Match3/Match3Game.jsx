import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RotateCcw, Settings, Trophy, Zap, Clock } from 'lucide-react';

const BOARD_SIZE = 8;
const CANDY_TYPES = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐'];
const CANDY_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#3b82f6'];

// Create initial board
const createBoard = () => {
    const board = [];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        board.push({
            type: Math.floor(Math.random() * CANDY_TYPES.length),
            id: Date.now() + i,
            fallDistance: 0,
            isNew: false
        });
    }
    return removeInitialMatches(board);
};

// Remove matches that exist on initial board creation
const removeInitialMatches = (board) => {
    const newBoard = [...board];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const row = Math.floor(i / BOARD_SIZE);
        const col = i % BOARD_SIZE;

        if (col >= 2) {
            while (
                newBoard[i].type === newBoard[i - 1].type &&
                newBoard[i].type === newBoard[i - 2].type
            ) {
                newBoard[i] = {
                    ...newBoard[i],
                    type: Math.floor(Math.random() * CANDY_TYPES.length)
                };
            }
        }

        if (row >= 2) {
            while (
                newBoard[i].type === newBoard[i - BOARD_SIZE].type &&
                newBoard[i].type === newBoard[i - BOARD_SIZE * 2].type
            ) {
                newBoard[i] = {
                    ...newBoard[i],
                    type: Math.floor(Math.random() * CANDY_TYPES.length)
                };
            }
        }
    }
    return newBoard;
};

// Explosion Particle Component
const ExplosionParticle = ({ x, y, color, delay }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 600);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 100
            }}
        >
            <div
                className="absolute animate-ping"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    opacity: 0.6,
                    transform: 'translate(-50%, -50%)',
                    animationDuration: '0.5s'
                }}
            />

            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="absolute text-lg"
                    style={{
                        animation: `particle-fly-${i % 4} 0.5s ease-out forwards`,
                        animationDelay: `${delay + i * 20}ms`,
                        opacity: 0
                    }}
                >
                    ✨
                </div>
            ))}

            <div
                className="absolute text-sm font-bold text-yellow-400 whitespace-nowrap"
                style={{
                    animation: 'score-popup 0.6s ease-out forwards',
                    textShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}
            >
                +10
            </div>
        </div>
    );
};

const Match3Game = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState(() => createBoard());
    const [selectedCell, setSelectedCell] = useState(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(30);
    const [gameStatus, setGameStatus] = useState('playing');
    const [combo, setCombo] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [matchedCells, setMatchedCells] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [targetScore, setTargetScore] = useState(5000);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('match3HighScore');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [swappingCells, setSwappingCells] = useState({ from: null, to: null });
    const [explosions, setExplosions] = useState([]);
    const [fallingCells, setFallingCells] = useState({});

    const areAdjacent = (index1, index2) => {
        const row1 = Math.floor(index1 / BOARD_SIZE);
        const col1 = index1 % BOARD_SIZE;
        const row2 = Math.floor(index2 / BOARD_SIZE);
        const col2 = index2 % BOARD_SIZE;

        return (
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2)
        );
    };

    const getSwapDirection = (from, to) => {
        const rowFrom = Math.floor(from / BOARD_SIZE);
        const colFrom = from % BOARD_SIZE;
        const rowTo = Math.floor(to / BOARD_SIZE);
        const colTo = to % BOARD_SIZE;

        if (rowTo < rowFrom) return 'up';
        if (rowTo > rowFrom) return 'down';
        if (colTo < colFrom) return 'left';
        if (colTo > colFrom) return 'right';
        return null;
    };

    const findMatches = useCallback((boardState) => {
        const matches = new Set();

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE - 2; col++) {
                const idx = row * BOARD_SIZE + col;
                const type = boardState[idx].type;

                if (type !== null &&
                    boardState[idx + 1].type === type &&
                    boardState[idx + 2].type === type) {
                    matches.add(idx);
                    matches.add(idx + 1);
                    matches.add(idx + 2);

                    let k = 3;
                    while (col + k < BOARD_SIZE && boardState[idx + k].type === type) {
                        matches.add(idx + k);
                        k++;
                    }
                }
            }
        }

        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE - 2; row++) {
                const idx = row * BOARD_SIZE + col;
                const type = boardState[idx].type;

                if (type !== null &&
                    boardState[idx + BOARD_SIZE].type === type &&
                    boardState[idx + BOARD_SIZE * 2].type === type) {
                    matches.add(idx);
                    matches.add(idx + BOARD_SIZE);
                    matches.add(idx + BOARD_SIZE * 2);

                    let k = 3;
                    while (row + k < BOARD_SIZE && boardState[idx + BOARD_SIZE * k].type === type) {
                        matches.add(idx + BOARD_SIZE * k);
                        k++;
                    }
                }
            }
        }

        return Array.from(matches);
    }, []);

    // Drop candies with fall distance tracking
    const dropCandies = useCallback((boardState) => {
        const newBoard = [...boardState];
        const newFallingCells = {};

        for (let col = 0; col < BOARD_SIZE; col++) {
            let emptyCount = 0;

            // Count empty cells and track fall distances
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                const idx = row * BOARD_SIZE + col;
                if (newBoard[idx].type === null) {
                    emptyCount++;
                } else if (emptyCount > 0) {
                    // This candy needs to fall
                    const targetRow = row + emptyCount;
                    const targetIdx = targetRow * BOARD_SIZE + col;

                    newBoard[targetIdx] = {
                        ...newBoard[idx],
                        fallDistance: emptyCount,
                        isNew: false
                    };
                    newBoard[idx] = { ...newBoard[idx], type: null };
                    newFallingCells[targetIdx] = emptyCount;
                }
            }

            // Fill empty spaces at top with new candies
            for (let i = 0; i < emptyCount; i++) {
                const idx = i * BOARD_SIZE + col;
                const fallDist = emptyCount - i + BOARD_SIZE; // Extra distance for "from above"
                newBoard[idx] = {
                    type: Math.floor(Math.random() * CANDY_TYPES.length),
                    id: Date.now() + idx + Math.random() * 1000,
                    fallDistance: fallDist,
                    isNew: true
                };
                newFallingCells[idx] = fallDist;
            }
        }

        setFallingCells(newFallingCells);

        // Clear falling state after animation
        setTimeout(() => {
            setFallingCells({});
        }, 500);

        return newBoard;
    }, []);

    const createExplosions = (matches, boardState) => {
        const newExplosions = matches.map((idx, i) => {
            const row = Math.floor(idx / BOARD_SIZE);
            const col = idx % BOARD_SIZE;
            const cellSize = 100 / BOARD_SIZE;
            const candyType = boardState[idx].type;

            return {
                id: Date.now() + idx,
                x: (col + 0.5) * cellSize,
                y: (row + 0.5) * cellSize,
                color: CANDY_COLORS[candyType] || '#fff',
                delay: i * 30
            };
        });

        setExplosions(prev => [...prev, ...newExplosions]);

        setTimeout(() => {
            setExplosions(prev => prev.filter(e => !newExplosions.find(ne => ne.id === e.id)));
        }, 800);
    };

    const processMatches = useCallback(async (boardState, currentCombo = 0) => {
        const matches = findMatches(boardState);

        if (matches.length === 0) {
            setCombo(0);
            setIsAnimating(false);
            return boardState;
        }

        setMatchedCells(matches);
        createExplosions(matches, boardState);

        await new Promise(resolve => setTimeout(resolve, 400));

        const matchScore = matches.length * 10 * (currentCombo + 1);
        setScore(prev => {
            const newScore = prev + matchScore;
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('match3HighScore', newScore.toString());
            }
            return newScore;
        });
        setCombo(currentCombo + 1);

        let newBoard = [...boardState];
        matches.forEach(idx => {
            newBoard[idx] = { ...newBoard[idx], type: null };
        });

        setMatchedCells([]);
        setBoard(newBoard);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Drop with animation
        newBoard = dropCandies(newBoard);
        setBoard(newBoard);

        // Wait for fall animation to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        return processMatches(newBoard, currentCombo + 1);
    }, [findMatches, dropCandies, highScore]);

    const handleCellClick = async (index) => {
        if (isAnimating || gameStatus !== 'playing') return;

        if (selectedCell === null) {
            setSelectedCell(index);
        } else if (selectedCell === index) {
            setSelectedCell(null);
        } else if (areAdjacent(selectedCell, index)) {
            setIsAnimating(true);
            const fromIndex = selectedCell;
            const toIndex = index;
            setSelectedCell(null);

            setSwappingCells({ from: fromIndex, to: toIndex });
            await new Promise(resolve => setTimeout(resolve, 300));

            const newBoard = [...board];
            const temp = newBoard[fromIndex];
            newBoard[fromIndex] = newBoard[toIndex];
            newBoard[toIndex] = temp;
            setBoard(newBoard);
            setSwappingCells({ from: null, to: null });

            const matches = findMatches(newBoard);

            if (matches.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setSwappingCells({ from: toIndex, to: fromIndex });
                await new Promise(resolve => setTimeout(resolve, 300));

                const revertBoard = [...newBoard];
                const temp2 = revertBoard[fromIndex];
                revertBoard[fromIndex] = revertBoard[toIndex];
                revertBoard[toIndex] = temp2;
                setBoard(revertBoard);
                setSwappingCells({ from: null, to: null });
                setIsAnimating(false);
            } else {
                setMoves(prev => prev - 1);
                await processMatches(newBoard);
            }
        } else {
            setSelectedCell(index);
        }
    };

    useEffect(() => {
        if (score >= targetScore) {
            setGameStatus('win');
        } else if (moves <= 0) {
            setGameStatus('gameover');
        }
    }, [score, moves, targetScore]);

    const restartGame = () => {
        setBoard(createBoard());
        setScore(0);
        setMoves(30);
        setCombo(0);
        setSelectedCell(null);
        setGameStatus('playing');
        setIsAnimating(false);
        setMatchedCells([]);
        setSwappingCells({ from: null, to: null });
        setExplosions([]);
        setFallingCells({});
    };

    const getSwapTransform = (index) => {
        if (swappingCells.from === null || swappingCells.to === null) return '';

        const cellSize = 100 / BOARD_SIZE;

        if (index === swappingCells.from) {
            const dir = getSwapDirection(swappingCells.from, swappingCells.to);
            switch (dir) {
                case 'up': return `translateY(-${cellSize}%)`;
                case 'down': return `translateY(${cellSize}%)`;
                case 'left': return `translateX(-${cellSize}%)`;
                case 'right': return `translateX(${cellSize}%)`;
                default: return '';
            }
        }

        if (index === swappingCells.to) {
            const dir = getSwapDirection(swappingCells.from, swappingCells.to);
            switch (dir) {
                case 'up': return `translateY(${cellSize}%)`;
                case 'down': return `translateY(-${cellSize}%)`;
                case 'left': return `translateX(${cellSize}%)`;
                case 'right': return `translateX(-${cellSize}%)`;
                default: return '';
            }
        }

        return '';
    };

    const renderCell = (candy, index) => {
        const isSelected = selectedCell === index;
        const isMatched = matchedCells.includes(index);
        const isSwapping = swappingCells.from === index || swappingCells.to === index;
        const candyType = candy.type;
        const swapTransform = getSwapTransform(index);
        const isFalling = fallingCells[index] !== undefined;
        const fallDistance = fallingCells[index] || 0;

        // Calculate fall animation
        const cellHeight = 100 / BOARD_SIZE;
        const fallOffset = isFalling ? -fallDistance * cellHeight : 0;

        return (
            <div
                key={candy.id}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl sm:text-3xl bg-secondary border border-border relative overflow-visible
                    ${isSelected ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-background z-10' : ''}
                    ${!isAnimating && gameStatus === 'playing' ? 'hover:scale-105 cursor-pointer hover:bg-accent' : 'cursor-default'}
                `}
                style={{
                    transform: swapTransform || (isSelected ? 'scale(1.1)' : ''),
                    transition: isSwapping
                        ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : 'transform 0.15s ease-out',
                    zIndex: isSwapping ? 20 : isSelected ? 10 : 1
                }}
                onClick={() => handleCellClick(index)}
            >
                {candyType !== null && (
                    <span
                        className="drop-shadow-lg absolute"
                        style={{
                            transform: isMatched
                                ? 'scale(1.5) rotate(15deg)'
                                : isFalling
                                    ? `translateY(${fallOffset}%)`
                                    : 'scale(1)',
                            opacity: isMatched ? 0 : 1,
                            transition: isFalling
                                ? `transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${candy.isNew ? '0.1s' : '0s'}`
                                : 'all 0.3s ease-out',
                            animationName: isFalling ? 'none' : undefined
                        }}
                    >
                        {CANDY_TYPES[candyType]}
                    </span>
                )}

                {isMatched && (
                    <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: `radial-gradient(circle, ${CANDY_COLORS[candyType]}80 0%, transparent 70%)`,
                            animation: 'pulse 0.3s ease-out'
                        }}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            <style>{`
                @keyframes particle-fly-0 {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + 30px), calc(-50% - 30px)) scale(0); opacity: 0; }
                }
                @keyframes particle-fly-1 {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + 40px), calc(-50% + 10px)) scale(0); opacity: 0; }
                }
                @keyframes particle-fly-2 {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% - 30px), calc(-50% + 30px)) scale(0); opacity: 0; }
                }
                @keyframes particle-fly-3 {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% - 40px), calc(-50% - 20px)) scale(0); opacity: 0; }
                }
                @keyframes score-popup {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    50% { transform: translate(-50%, -80%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -120%) scale(1); opacity: 0; }
                }
                @keyframes bounce-in {
                    0% { transform: translateY(-100%) scale(0.8); }
                    60% { transform: translateY(10%) scale(1.1); }
                    80% { transform: translateY(-5%) scale(0.95); }
                    100% { transform: translateY(0) scale(1); }
                }
            `}</style>

            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={() => navigate('/games/match3')}
                >
                    <Home size={20} />
                </button>
                <div className="text-lg font-bold tracking-wider text-foreground">GHÉP HÀNG 3</div>
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <Settings size={20} />
                </button>
            </div>

            <div className="flex items-center justify-center gap-4 p-3 bg-card">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Mục tiêu:</span>
                    <span className="font-mono text-xl font-bold text-yellow-500">{targetScore.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
                    <Zap size={16} className="text-pink-500" />
                    <span className="text-sm text-muted-foreground">Điểm:</span>
                    <span className="font-mono text-xl font-bold text-pink-500">{score.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
                    <Clock size={16} className="text-cyan-500" />
                    <span className="text-sm text-muted-foreground">Lượt:</span>
                    <span className="font-mono text-xl font-bold text-cyan-500">{moves}</span>
                </div>
            </div>

            {combo > 1 && (
                <div className="text-center py-2 animate-bounce">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
                        🔥 COMBO x{combo}! 🔥
                    </span>
                </div>
            )}

            <div className="px-4 py-2">
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl p-2 shadow-lg border-2 border-border relative overflow-hidden">
                    <div
                        className="grid gap-1 relative"
                        style={{
                            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                            width: 'min(85vw, 400px)',
                            height: 'min(85vw, 400px)'
                        }}
                    >
                        {board.map((candy, index) => renderCell(candy, index))}
                    </div>

                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                        {explosions.map(exp => (
                            <ExplosionParticle
                                key={exp.id}
                                x={exp.x}
                                y={exp.y}
                                color={exp.color}
                                delay={exp.delay}
                            />
                        ))}
                    </div>

                    {gameStatus !== 'playing' && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl">
                            {gameStatus === 'win' ? (
                                <>
                                    <div className="text-4xl mb-2">🎉</div>
                                    <div className="text-2xl font-bold text-green-400 mb-2">THẮNG RỒI!</div>
                                    <div className="text-lg text-white mb-4">Điểm: {score.toLocaleString()}</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-4xl mb-2">😢</div>
                                    <div className="text-2xl font-bold text-red-400 mb-2">HẾT LƯỢT!</div>
                                    <div className="text-lg text-white mb-4">Điểm: {score.toLocaleString()}</div>
                                </>
                            )}
                            <button
                                className="flex items-center gap-2 px-6 py-3 bg-pink-500 rounded-xl text-white font-semibold hover:bg-pink-600 transition-all"
                                onClick={restartGame}
                            >
                                <RotateCcw size={20} />
                                Chơi lại
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center pb-2">
                <span className="text-muted-foreground text-sm">Điểm cao nhất: </span>
                <span className="text-yellow-500 font-bold">{highScore.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-center gap-4 p-4 bg-card border-t border-border">
                <button
                    className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                    onClick={restartGame}
                >
                    <RotateCcw size={18} />
                    <span>Chơi lại</span>
                </button>
            </div>
        </div>
    );
};

export default Match3Game;
