import React, { useState, useEffect, useCallback, useRef } from 'react';
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
            id: i
        });
    }
    // Remove initial matches
    return removeInitialMatches(board);
};

// Remove matches that exist on initial board creation
const removeInitialMatches = (board) => {
    const newBoard = [...board];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const row = Math.floor(i / BOARD_SIZE);
        const col = i % BOARD_SIZE;

        // Check horizontal matches
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

        // Check vertical matches
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

const Match3Game = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState(() => createBoard());
    const [selectedCell, setSelectedCell] = useState(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(30);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'gameover', 'win'
    const [combo, setCombo] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [matchedCells, setMatchedCells] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [targetScore, setTargetScore] = useState(5000);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('match3HighScore');
        return saved ? parseInt(saved, 10) : 0;
    });

    // Check if two cells are adjacent
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

    // Find all matches on the board
    const findMatches = useCallback((boardState) => {
        const matches = new Set();

        // Check horizontal matches
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

                    // Check for longer matches
                    let k = 3;
                    while (col + k < BOARD_SIZE && boardState[idx + k].type === type) {
                        matches.add(idx + k);
                        k++;
                    }
                }
            }
        }

        // Check vertical matches
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

                    // Check for longer matches
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

    // Swap two cells
    const swapCells = useCallback((index1, index2) => {
        setBoard(prev => {
            const newBoard = [...prev];
            const temp = newBoard[index1];
            newBoard[index1] = newBoard[index2];
            newBoard[index2] = temp;
            return newBoard;
        });
    }, []);

    // Drop candies to fill empty spaces
    const dropCandies = useCallback((boardState) => {
        const newBoard = [...boardState];

        // Process each column
        for (let col = 0; col < BOARD_SIZE; col++) {
            let emptyRow = BOARD_SIZE - 1;

            // Move existing candies down
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                const idx = row * BOARD_SIZE + col;
                if (newBoard[idx].type !== null) {
                    const targetIdx = emptyRow * BOARD_SIZE + col;
                    if (idx !== targetIdx) {
                        newBoard[targetIdx] = { ...newBoard[idx] };
                        newBoard[idx] = { ...newBoard[idx], type: null };
                    }
                    emptyRow--;
                }
            }

            // Fill empty spaces at top with new candies
            for (let row = emptyRow; row >= 0; row--) {
                const idx = row * BOARD_SIZE + col;
                newBoard[idx] = {
                    type: Math.floor(Math.random() * CANDY_TYPES.length),
                    id: Date.now() + idx
                };
            }
        }

        return newBoard;
    }, []);

    // Process matches and cascade
    const processMatches = useCallback(async (boardState, currentCombo = 0) => {
        const matches = findMatches(boardState);

        if (matches.length === 0) {
            setCombo(0);
            setIsAnimating(false);
            return boardState;
        }

        // Highlight matched cells
        setMatchedCells(matches);
        await new Promise(resolve => setTimeout(resolve, 300));

        // Calculate score with combo multiplier
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

        // Remove matched candies
        let newBoard = [...boardState];
        matches.forEach(idx => {
            newBoard[idx] = { ...newBoard[idx], type: null };
        });

        setMatchedCells([]);
        await new Promise(resolve => setTimeout(resolve, 200));

        // Drop candies
        newBoard = dropCandies(newBoard);
        setBoard(newBoard);

        await new Promise(resolve => setTimeout(resolve, 300));

        // Recursively check for new matches (cascade)
        return processMatches(newBoard, currentCombo + 1);
    }, [findMatches, dropCandies, highScore]);

    // Handle cell click
    const handleCellClick = async (index) => {
        if (isAnimating || gameStatus !== 'playing') return;

        if (selectedCell === null) {
            setSelectedCell(index);
        } else if (selectedCell === index) {
            setSelectedCell(null);
        } else if (areAdjacent(selectedCell, index)) {
            setIsAnimating(true);
            setSelectedCell(null);

            // Swap cells
            swapCells(selectedCell, index);

            await new Promise(resolve => setTimeout(resolve, 200));

            // Check for matches after swap
            const newBoard = [...board];
            const temp = newBoard[selectedCell];
            newBoard[selectedCell] = newBoard[index];
            newBoard[index] = temp;

            const matches = findMatches(newBoard);

            if (matches.length === 0) {
                // No match, swap back
                await new Promise(resolve => setTimeout(resolve, 200));
                swapCells(selectedCell, index);
                setIsAnimating(false);
            } else {
                // Valid move, process matches
                setMoves(prev => prev - 1);
                await processMatches(newBoard);
            }
        } else {
            setSelectedCell(index);
        }
    };

    // Check game status
    useEffect(() => {
        if (score >= targetScore) {
            setGameStatus('win');
        } else if (moves <= 0) {
            setGameStatus('gameover');
        }
    }, [score, moves, targetScore]);

    // Restart game
    const restartGame = () => {
        setBoard(createBoard());
        setScore(0);
        setMoves(30);
        setCombo(0);
        setSelectedCell(null);
        setGameStatus('playing');
        setIsAnimating(false);
        setMatchedCells([]);
    };

    const renderCell = (candy, index) => {
        const isSelected = selectedCell === index;
        const isMatched = matchedCells.includes(index);
        const candyType = candy.type;

        return (
            <button
                key={candy.id}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl sm:text-3xl transition-all duration-200 transform bg-secondary border border-border
                    ${isSelected ? 'scale-110 ring-2 ring-pink-500 ring-offset-2 ring-offset-transparent' : ''}
                    ${isMatched ? 'animate-pulse scale-110' : ''}
                    ${!isAnimating && gameStatus === 'playing' ? 'hover:scale-105 cursor-pointer hover:bg-accent' : 'cursor-default'}
                `}
                onClick={() => handleCellClick(index)}
                disabled={isAnimating || gameStatus !== 'playing'}
            >
                {candyType !== null && (
                    <span className={`drop-shadow-lg ${isMatched ? 'animate-bounce' : ''}`}>
                        {CANDY_TYPES[candyType]}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            {/* Top Navigation */}
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

            {/* Score Bar */}
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

            {/* Combo Display */}
            {combo > 1 && (
                <div className="text-center py-2 animate-bounce">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
                        🔥 COMBO x{combo}! 🔥
                    </span>
                </div>
            )}

            {/* Progress Bar */}
            <div className="px-4 py-2">
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl p-2 shadow-lg border-2 border-border relative">
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                            width: 'min(85vw, 400px)',
                            height: 'min(85vw, 400px)'
                        }}
                    >
                        {board.map((candy, index) => renderCell(candy, index))}
                    </div>

                    {/* Game Over / Win Overlay */}
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

            {/* High Score */}
            <div className="text-center pb-2">
                <span className="text-muted-foreground text-sm">Điểm cao nhất: </span>
                <span className="text-yellow-500 font-bold">{highScore.toLocaleString()}</span>
            </div>

            {/* Bottom Actions */}
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
