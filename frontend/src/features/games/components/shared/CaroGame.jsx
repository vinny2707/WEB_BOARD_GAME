import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Lightbulb, Settings, Home } from 'lucide-react';
import CaroBoard from './CaroBoard';

const DIFFICULTY_LABELS = {
    easy: 'Dễ',
    medium: 'Trung Bình',
    hard: 'Khó'
};

// Player Card Component
const PlayerCard = ({ name, symbol, avatar, isActive, timer, isLeft, theme }) => {
    const borderColor = theme === 'amber' ? 'border-amber-500' : 'border-emerald-500';
    const shadowColor = theme === 'amber'
        ? 'shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
        : 'shadow-[0_0_0_3px_rgba(16,185,129,0.2)]';
    const symbolBg = symbol === 'X'
        ? (theme === 'amber' ? 'bg-amber-500/15' : 'bg-emerald-500/15')
        : 'bg-slate-500/15';
    const symbolColor = symbol === 'X'
        ? (theme === 'amber' ? 'bg-amber-500' : 'bg-emerald-500')
        : 'bg-slate-500';

    return (
        <div className={`flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl border-2 transition-all min-w-[140px]
            ${isActive ? `${borderColor} ${shadowColor}` : 'border-transparent'}
            ${isLeft ? '' : 'flex-row-reverse text-right'}`}
        >
            <div className="w-10 h-10 flex items-center justify-center bg-card rounded-full text-xl shadow-sm">
                {avatar}
            </div>
            <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{name}</div>
                <div className="font-mono text-xs text-muted-foreground">{timer}</div>
            </div>
            <div className={`w-7 h-7 flex items-center justify-center rounded-md ${symbolBg}`}>
                <div className={`w-5 h-5 rounded-full ${symbolColor}`} />
            </div>
        </div>
    );
};

// Score Display
const ScoreDisplay = ({ playerScore, aiScore, theme }) => {
    const playerColor = theme === 'amber' ? 'text-amber-500' : 'text-emerald-500';
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-foreground rounded-full">
            <span className={`font-mono text-xl font-bold ${playerColor}`}>{playerScore}</span>
            <span className="font-bold text-background">-</span>
            <span className="font-mono text-xl font-bold text-orange-500">{aiScore}</span>
        </div>
    );
};

/**
 * Shared Game component for Caro games
 * @param {Object} props
 * @param {string} props.gameName - Display name (e.g., "CARO 5 HÀNG")
 * @param {string} props.lobbyPath - Path to lobby (e.g., "/games/gomoku")
 * @param {Object} props.ai - AI module with { findBestMove, getHint, checkWinner, isDraw, BOARD_SIZE }
 * @param {string} props.theme - 'emerald' or 'amber'
 */
const CaroGame = ({ gameName, lobbyPath, ai, theme = 'emerald' }) => {
    const navigate = useNavigate();
    const { findBestMove, getHint, checkWinner, isDraw, BOARD_SIZE } = ai;

    const [board, setBoard] = useState(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [score, setScore] = useState({ player: 0, ai: 0 });
    const [gameStatus, setGameStatus] = useState('playing');
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [playerTime, setPlayerTime] = useState(0);
    const [aiTime, setAiTime] = useState(0);
    const [difficulty, setDifficulty] = useState('medium');
    const [hintCell, setHintCell] = useState(null);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const themeColors = {
        emerald: {
            primary: 'bg-emerald-500',
            primaryHover: 'hover:bg-emerald-600',
            border: 'border-emerald-500',
            hoverBorder: 'hover:border-emerald-500',
            text: 'text-emerald-500',
            textHover: 'hover:text-emerald-600',
            gradient: 'from-emerald-500 to-emerald-600',
            hintBg: 'hover:bg-emerald-500/15',
        },
        amber: {
            primary: 'bg-amber-500',
            primaryHover: 'hover:bg-amber-600',
            border: 'border-amber-500',
            hoverBorder: 'hover:border-amber-500',
            text: 'text-amber-500',
            textHover: 'hover:text-amber-600',
            gradient: 'from-amber-500 to-amber-600',
            hintBg: 'hover:bg-amber-500/15',
        }
    };

    const colors = themeColors[theme] || themeColors.emerald;

    // Timer for current player
    useEffect(() => {
        if (gameStatus !== 'playing') return;

        const timer = setInterval(() => {
            if (isXNext && !isAIThinking) {
                setPlayerTime(prev => prev + 1);
            } else if (!isXNext) {
                setAiTime(prev => prev + 1);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isXNext, gameStatus, isAIThinking]);

    // AI makes a move
    useEffect(() => {
        if (!isXNext && gameStatus === 'playing' && !isAIThinking) {
            setIsAIThinking(true);
            setHintCell(null);

            const timer = setTimeout(() => {
                const aiMove = findBestMove(board, difficulty);
                if (aiMove !== -1) {
                    makeMove(aiMove, 'O');
                }
                setIsAIThinking(false);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [isXNext, gameStatus, board, difficulty]);

    const makeMove = useCallback((index, player) => {
        const newBoard = [...board];
        newBoard[index] = player;
        setBoard(newBoard);
        setMoveHistory(prev => [...prev, { index, player }]);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setGameStatus('win');
            setScore(prev => ({
                ...prev,
                [result.winner === 'X' ? 'player' : 'ai']: prev[result.winner === 'X' ? 'player' : 'ai'] + 1
            }));
        } else if (isDraw(newBoard)) {
            setGameStatus('draw');
        } else {
            setIsXNext(player === 'O');
        }
    }, [board, checkWinner, isDraw]);

    const handleCellClick = (index) => {
        if (board[index] || gameStatus !== 'playing' || !isXNext || isAIThinking) return;
        setHintCell(null);
        makeMove(index, 'X');
    };

    const handleUndo = () => {
        if (moveHistory.length < 2 || gameStatus !== 'playing') return;

        const newHistory = moveHistory.slice(0, -2);
        const newBoard = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
        newHistory.forEach(move => {
            newBoard[move.index] = move.player;
        });

        setBoard(newBoard);
        setMoveHistory(newHistory);
        setIsXNext(true);
        setHintCell(null);
    };

    const handleHint = () => {
        if (gameStatus !== 'playing' || !isXNext || isAIThinking) return;

        const hint = getHint(board);
        if (hint !== null && hint !== undefined) {
            setHintCell(hint);
            setTimeout(() => setHintCell(null), 3000);
        }
    };

    const handlePlayAgain = () => {
        setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
        setIsXNext(true);
        setGameStatus('playing');
        setWinner(null);
        setWinningLine(null);
        setMoveHistory([]);
        setPlayerTime(0);
        setAiTime(0);
        setHintCell(null);
    };

    const handleDifficultyChange = (newDifficulty) => {
        setDifficulty(newDifficulty);
        handlePlayAgain();
        setShowSettings(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusMessage = () => {
        if (isAIThinking) return 'Đang suy nghĩ...';
        if (gameStatus === 'win') return winner === 'X' ? '🎉 Bạn thắng!' : '🤖 Máy thắng!';
        if (gameStatus === 'draw') return '🤝 Hòa!';
        return isXNext ? 'Lượt của bạn' : 'Lượt của máy';
    };

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            {/* Top Navigation */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={() => navigate(lobbyPath)}
                >
                    <Home size={20} />
                </button>
                <div className="text-lg font-bold tracking-wider text-foreground">{gameName}</div>
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
                        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                            <button
                                key={key}
                                className={`flex-1 py-2 px-4 bg-secondary border-2 rounded-lg text-sm font-medium transition-all
                                    ${difficulty === key
                                        ? `${colors.primary} text-white ${colors.border}`
                                        : `text-muted-foreground border-transparent ${colors.hoverBorder}`}`}
                                onClick={() => handleDifficultyChange(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Players Bar */}
            <div className="flex items-center justify-center gap-4 p-4 bg-card">
                <PlayerCard
                    name="Bạn"
                    symbol="X"
                    avatar="👤"
                    isActive={isXNext && gameStatus === 'playing'}
                    timer={formatTime(playerTime)}
                    isLeft={true}
                    theme={theme}
                />
                <ScoreDisplay playerScore={score.player} aiScore={score.ai} theme={theme} />
                <PlayerCard
                    name="Paper Man"
                    symbol="O"
                    avatar="🤖"
                    isActive={!isXNext && gameStatus === 'playing'}
                    timer={formatTime(aiTime)}
                    isLeft={false}
                    theme={theme}
                />
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
                <CaroBoard
                    board={board}
                    onCellClick={handleCellClick}
                    winningLine={winningLine}
                    hintCell={hintCell}
                    disabled={gameStatus !== 'playing' || !isXNext || isAIThinking}
                    boardSize={BOARD_SIZE}
                    theme={theme}
                />

                {/* Status Message */}
                <div className={`text-base font-medium px-4 py-2 rounded-full shadow-sm
                    ${gameStatus !== 'playing'
                        ? `text-xl font-bold bg-gradient-to-r ${colors.gradient} text-white`
                        : 'bg-card text-foreground'}`}
                >
                    {getStatusMessage()}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-4 p-4 bg-card border-t border-border">
                <button
                    className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={handleUndo}
                    disabled={moveHistory.length < 2 || gameStatus !== 'playing' || isAIThinking}
                >
                    <RotateCcw size={18} />
                    <span>Quay lại</span>
                </button>

                {gameStatus === 'playing' ? (
                    <button
                        className={`flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium ${colors.text} transition-all ${colors.hintBg} ${colors.textHover} disabled:opacity-40 disabled:cursor-not-allowed`}
                        onClick={handleHint}
                        disabled={!isXNext || isAIThinking}
                    >
                        <Lightbulb size={18} />
                        <span>Gợi ý</span>
                    </button>
                ) : (
                    <button
                        className={`flex items-center gap-2 px-5 py-3 ${colors.primary} rounded-xl text-sm font-medium text-white transition-all ${colors.primaryHover}`}
                        onClick={handlePlayAgain}
                    >
                        <RotateCcw size={18} />
                        <span>Chơi lại</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CaroGame;
