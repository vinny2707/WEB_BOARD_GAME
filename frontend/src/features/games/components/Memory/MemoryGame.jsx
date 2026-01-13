import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RotateCcw, Settings, Trophy, Clock, Zap } from 'lucide-react';

const CARD_SYMBOLS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍌', '🥝', '🍑', '🍒', '🥭', '🍍', '🥥', '🍐', '🍈', '🫒', '🍆', '🥕'];

const createBoard = (size) => {
    const pairCount = (size * size) / 2;
    const symbols = CARD_SYMBOLS.slice(0, pairCount);
    const cards = [...symbols, ...symbols]
        .sort(() => Math.random() - 0.5)
        .map((symbol, index) => ({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false
        }));
    return cards;
};

const MemoryGame = () => {
    const navigate = useNavigate();
    const [boardSize, setBoardSize] = useState(4);
    const [cards, setCards] = useState(() => createBoard(4));
    const [flippedCards, setFlippedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing');
    const [isChecking, setIsChecking] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [bestTime, setBestTime] = useState(() => {
        const saved = localStorage.getItem(`memoryBestTime_${4}`);
        return saved ? parseInt(saved, 10) : null;
    });
    const [bestMoves, setBestMoves] = useState(() => {
        const saved = localStorage.getItem(`memoryBestMoves_${4}`);
        return saved ? parseInt(saved, 10) : null;
    });

    // Timer
    useEffect(() => {
        let interval;
        if (isTimerRunning && gameStatus === 'playing') {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, gameStatus]);

    // Check for win
    useEffect(() => {
        const totalPairs = (boardSize * boardSize) / 2;
        if (matchedPairs === totalPairs && matchedPairs > 0) {
            setGameStatus('win');
            setIsTimerRunning(false);

            // Save best scores
            const currentBestTime = localStorage.getItem(`memoryBestTime_${boardSize}`);
            const currentBestMoves = localStorage.getItem(`memoryBestMoves_${boardSize}`);

            if (!currentBestTime || timer < parseInt(currentBestTime, 10)) {
                localStorage.setItem(`memoryBestTime_${boardSize}`, timer.toString());
                setBestTime(timer);
            }
            if (!currentBestMoves || moves < parseInt(currentBestMoves, 10)) {
                localStorage.setItem(`memoryBestMoves_${boardSize}`, moves.toString());
                setBestMoves(moves);
            }
        }
    }, [matchedPairs, boardSize, timer, moves]);

    const handleCardClick = useCallback((cardId) => {
        if (isChecking || gameStatus !== 'playing') return;

        const card = cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched) return;

        // Start timer on first click
        if (!isTimerRunning) {
            setIsTimerRunning(true);
        }

        // Flip the card
        setCards(prev => prev.map(c =>
            c.id === cardId ? { ...c, isFlipped: true } : c
        ));

        const newFlipped = [...flippedCards, cardId];
        setFlippedCards(newFlipped);

        // Check for match when 2 cards are flipped
        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            setIsChecking(true);

            const [firstId, secondId] = newFlipped;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard.symbol === secondCard.symbol) {
                // Match found
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === firstId || c.id === secondId
                            ? { ...c, isMatched: true }
                            : c
                    ));
                    setMatchedPairs(prev => prev + 1);
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 300);
            } else {
                // No match - flip back
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === firstId || c.id === secondId
                            ? { ...c, isFlipped: false }
                            : c
                    ));
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 800);
            }
        }
    }, [cards, flippedCards, isChecking, gameStatus, isTimerRunning]);

    const restartGame = () => {
        setCards(createBoard(boardSize));
        setFlippedCards([]);
        setMoves(0);
        setMatchedPairs(0);
        setGameStatus('playing');
        setIsChecking(false);
        setTimer(0);
        setIsTimerRunning(false);
    };

    const changeDifficulty = (size) => {
        setBoardSize(size);
        setCards(createBoard(size));
        setFlippedCards([]);
        setMoves(0);
        setMatchedPairs(0);
        setGameStatus('playing');
        setIsChecking(false);
        setTimer(0);
        setIsTimerRunning(false);
        setShowSettings(false);

        // Load best scores for new size
        const savedTime = localStorage.getItem(`memoryBestTime_${size}`);
        const savedMoves = localStorage.getItem(`memoryBestMoves_${size}`);
        setBestTime(savedTime ? parseInt(savedTime, 10) : null);
        setBestMoves(savedMoves ? parseInt(savedMoves, 10) : null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderCard = (card) => {
        const isFlipped = card.isFlipped || card.isMatched;

        return (
            <div
                key={card.id}
                className={`aspect-square cursor-pointer perspective-1000`}
                onClick={() => handleCardClick(card.id)}
            >
                <div
                    className={`relative w-full h-full transition-transform duration-300 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transition: 'transform 0.4s ease-in-out'
                    }}
                >
                    {/* Back of card */}
                    <div
                        className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-indigo-400 shadow-lg backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <span className="text-2xl sm:text-3xl text-white/30">?</span>
                    </div>

                    {/* Front of card */}
                    <div
                        className={`absolute inset-0 rounded-lg flex items-center justify-center border-2 shadow-lg backface-hidden
                            ${card.isMatched
                                ? 'bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-600'
                                : 'bg-card border-border'}`}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <span
                            className={`text-2xl sm:text-4xl transition-transform duration-200 ${card.isMatched ? 'scale-110' : ''}`}
                        >
                            {card.symbol}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const totalPairs = (boardSize * boardSize) / 2;

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all"
                    onClick={() => navigate('/games/memory')}
                >
                    <Home size={20} />
                </button>
                <div className="text-lg font-bold tracking-wider text-foreground">CỜ TRÍ NHỚ</div>
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-3 p-3 bg-card flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                    <Clock size={14} className="text-cyan-500" />
                    <span className="font-mono text-lg font-bold text-cyan-500">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                    <Zap size={14} className="text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Lượt:</span>
                    <span className="font-mono text-lg font-bold text-yellow-500">{moves}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                    <Trophy size={14} className="text-green-500" />
                    <span className="text-xs text-muted-foreground">Cặp:</span>
                    <span className="font-mono text-lg font-bold text-green-500">{matchedPairs}/{totalPairs}</span>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="px-4 py-2 bg-card border-b border-border">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">Độ khó:</span>
                        {[4, 6].map(size => (
                            <button
                                key={size}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${boardSize === size
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-secondary text-muted-foreground hover:bg-accent'}`}
                                onClick={() => changeDifficulty(size)}
                            >
                                {size}x{size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Game Board */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl p-2 shadow-lg border-2 border-border relative">
                    <div
                        className="grid gap-1.5"
                        style={{
                            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                            width: boardSize === 4 ? 'min(85vw, 340px)' : 'min(90vw, 420px)',
                            height: boardSize === 4 ? 'min(85vw, 340px)' : 'min(90vw, 420px)'
                        }}
                    >
                        {cards.map(card => renderCard(card))}
                    </div>

                    {/* Win Overlay */}
                    {gameStatus === 'win' && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl">
                            <div className="text-4xl mb-2">🎉</div>
                            <div className="text-xl font-bold text-green-400 mb-2">HOÀN THÀNH!</div>
                            <div className="text-base text-white mb-1">Thời gian: {formatTime(timer)}</div>
                            <div className="text-base text-white mb-3">Số lượt: {moves}</div>
                            {bestTime !== null && (
                                <div className="text-sm text-yellow-400 mb-3">
                                    Kỷ lục: {formatTime(bestTime)} | {bestMoves} lượt
                                </div>
                            )}
                            <button
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 rounded-xl text-white font-semibold hover:bg-indigo-600 transition-all"
                                onClick={restartGame}
                            >
                                <RotateCcw size={18} /> Chơi lại
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Best Scores */}
            {bestTime !== null && gameStatus === 'playing' && (
                <div className="text-center pb-1.5">
                    <span className="text-muted-foreground text-xs">Kỷ lục ({boardSize}x{boardSize}): </span>
                    <span className="text-yellow-500 font-bold text-sm">{formatTime(bestTime)} | {bestMoves} lượt</span>
                </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-3 p-3 bg-card border-t border-border">
                <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={restartGame}
                >
                    <RotateCcw size={16} /><span>Chơi lại</span>
                </button>
            </div>
        </div>
    );
};

export default MemoryGame;
