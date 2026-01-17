import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Home,
    RotateCcw,
    Settings,
    Trophy,
    Clock,
    Zap,
    BookOpen,
    X,
    ChevronRight,
    Save,
} from "lucide-react";
import useGameSession from '../../hooks/useGameSession';

// Theme card symbols - fruits use Icons8 images, others use emoji
const THEMES = {
    fruits: [
        "/Icons8/icons8-strawberry-50.png",
        "/Icons8/icons8-orange-50.png",
        "/Icons8/icons8-banana-50.png",
        "/Icons8/icons8-grapes-50.png",
        "/Icons8/icons8-cherry-50.png",
        "/Icons8/icons8-blueberry-50.png",
        "/Icons8/icons8-watermelon-50.png",
        "/Icons8/icons8-apple-fruit-50.png",
        "/Icons8/icons8-avocado-50.png",
        "/Icons8/icons8-raspberry-50.png",
        "/Icons8/icons8-tomato-50.png",
        "/Icons8/icons8-natural-food-50.png",
        "/Icons8/icons8-hamburger-50.png",
        "/Icons8/icons8-ice-cream-cone-50.png",
        "/Icons8/icons8-birthday-cake-50.png",
        "/Icons8/icons8-salami-pizza-50.png",
        "/Icons8/icons8-french-fries-50.png",
        "/Icons8/icons8-cola-50.png",
    ],
    food: [
        "/Icons8/icons8-hamburger-50.png",
        "/Icons8/icons8-salami-pizza-50.png",
        "/Icons8/icons8-birthday-cake-50.png",
        "/Icons8/icons8-ice-cream-cone-50.png",
        "/Icons8/icons8-french-fries-50.png",
        "/Icons8/icons8-cola-50.png",
        "/Icons8/icons8-dessert-50.png",
        "/Icons8/icons8-cherry-cheesecake-50.png",
        "/Icons8/icons8-greek-salad-50.png",
        "/Icons8/icons8-salad-50.png",
        "/Icons8/icons8-ingredients-50.png",
        "/Icons8/icons8-cheese-50.png",
        "/Icons8/icons8-croissant-50.png",
        "/Icons8/icons8-baguette-50.png",
        "/Icons8/icons8-thanksgiving-50.png",
        "/Icons8/icons8-mcdonald`s-french-fries-50.png",
        "/Icons8/icons8-natural-food-50.png",
        "/Icons8/icons8-tomato-50.png",
    ],
    flags: [
        "/contries/icons8-vietnam-50.png",
        "/contries/icons8-japan-50.png",
        "/contries/icons8-south-korea-50.png",
        "/contries/icons8-china-50.png",
        "/contries/icons8-great-britain-50.png",
        "/contries/icons8-france-50.png",
        "/contries/icons8-germany-50.png",
        "/contries/icons8-italy-50.png",
        "/contries/icons8-spain-50.png",
        "/contries/icons8-brazil-50.png",
        "/contries/icons8-australia-50.png",
        "/contries/icons8-canada-50.png",
        "/contries/icons8-india-50.png",
        "/contries/icons8-mexico-50.png",
        "/contries/icons8-russian-federation-50.png",
        "/contries/icons8-singapore-50.png",
        "/contries/icons8-south-africa-50.png",
        "/contries/icons8-thailand-50.png",
    ],
};

// Helper to check if symbol is an image path
const isImageSymbol = (symbol) => symbol && symbol.startsWith('/');

const DIFFICULTY_SETTINGS = {
    easy: { previewTime: 3000, label: 'Dễ' },
    medium: { previewTime: 1000, label: 'Trung Bình' },
    hard: { previewTime: 0, label: 'Khó' },
};

// Tutorial board - fixed layout with known pairs
const createTutorialBoard = () => {
    // 4x4 board with pairs at known positions for tutorial
    // Pair 1: 🍎 at index 0 and 5
    // Pair 2: 🍊 at index 1 and 10
    const symbols = ["🍎", "🍊", "🍋", "🍇", "🍓", "🍎", "🫐", "🍌", "🥝", "🍑", "🍊", "🍒", "🥭", "🍍", "🍋", "🍇"];
    return symbols.map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
    }));
};

// Tutorial steps
const TUTORIAL_STEPS = [
    {
        id: 1,
        title: "Chào mừng đến với Cờ Trí Nhớ! 🧠",
        message:
            "Hãy học cách chơi trò lật thẻ tìm cặp! Mục tiêu: Tìm tất cả các cặp thẻ giống nhau.",
        action: "click_next",
        highlightCards: [],
        targetCards: [],
    },
    {
        id: 2,
        title: "Bước 1: Lật thẻ đầu tiên! 🃏",
        message: "Click vào thẻ đầu tiên (góc trái) để lật nó lên và xem biểu tượng bên trong.",
        action: "click_card",
        highlightCards: [0],
        targetCards: [0],
    },
    {
        id: 3,
        title: "Bước 2: Tìm thẻ giống nhau! 🔍",
        message: "Nhớ biểu tượng 🍎! Giờ hãy lật thẻ thứ 6 để tìm cặp.",
        action: "click_card",
        highlightCards: [5],
        targetCards: [5],
    },
    {
        id: 4,
        title: "Tuyệt vời! Bạn đã tìm được cặp! 🎉",
        message:
            "Khi 2 thẻ giống nhau, chúng sẽ giữ nguyên trạng thái lật. Tiếp tục tìm các cặp khác!",
        action: "click_next",
        highlightCards: [],
        targetCards: [],
    },
    {
        id: 5,
        title: "Bước 3: Thử lật thẻ khác! 🃏",
        message: "Giờ lật thẻ thứ 2 để xem biểu tượng mới.",
        action: "click_card",
        highlightCards: [1],
        targetCards: [1],
    },
    {
        id: 6,
        title: "Bước 4: Tìm cặp của nó! 🔍",
        message: "Nhớ biểu tượng 🍊! Hãy lật thẻ thứ 11 để tìm cặp.",
        action: "click_card",
        highlightCards: [10],
        targetCards: [10],
    },
    {
        id: 7,
        title: "Xuất sắc! Thêm một cặp nữa! 🎊",
        message:
            "Bạn đã thành thạo! Nhớ vị trí các thẻ đã lật để tìm cặp nhanh hơn.",
        action: "click_next",
        highlightCards: [],
        targetCards: [],
    },
    {
        id: 8,
        title: "Mẹo: Ghi nhớ vị trí! 💡",
        message:
            "Khi lật thẻ không khớp, hãy nhớ vị trí của chúng. Trí nhớ tốt = ít lượt hơn = điểm cao hơn!",
        action: "click_next",
        highlightCards: [],
        targetCards: [],
    },
    {
        id: 9,
        title: "Hoàn thành! 🚀",
        message:
            "Bạn đã sẵn sàng! Tìm tất cả các cặp thẻ trong thời gian và số lượt ít nhất. Chúc may mắn!",
        action: "finish",
        highlightCards: [],
        targetCards: [],
    },
];

const createBoard = (size, theme = 'fruits') => {
    const pairCount = (size * size) / 2;
    const cardSymbols = THEMES[theme] || THEMES.fruits;
    const symbols = cardSymbols.slice(0, pairCount);
    const cards = [...symbols, ...symbols]
        .sort(() => Math.random() - 0.5)
        .map((symbol, index) => ({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false,
        }));
    return cards;
};

const MemoryGame = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get settings from lobby navigation state
    const lobbySettings = location.state?.settings || {};
    const initialGridSize = lobbySettings.gridSize || 4;
    const theme = lobbySettings.theme || 'fruits';
    const difficulty = lobbySettings.difficulty || 'medium';
    const previewTime = DIFFICULTY_SETTINGS[difficulty]?.previewTime ?? 1000;
    const resumeSession = location.state?.resumeSession;

    // Session management
    const { startSession, saveProgress, completeGame, updateGameState, isAuthenticated, setResumeSessionId } = useGameSession(5);

    const [boardSize, setBoardSize] = useState(initialGridSize);
    const [cards, setCards] = useState(() => createBoard(initialGridSize, theme));
    const [flippedCards, setFlippedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [gameStatus, setGameStatus] = useState("idle"); // 'idle', 'playing', 'win', 'tutorial', 'preview'
    const [isChecking, setIsChecking] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [bestTime, setBestTime] = useState(() => {
        const saved = localStorage.getItem(`memoryBestTime_${initialGridSize}`);
        return saved ? parseInt(saved, 10) : null;
    });
    const [bestMoves, setBestMoves] = useState(() => {
        const saved = localStorage.getItem(`memoryBestMoves_${initialGridSize}`);
        return saved ? parseInt(saved, 10) : null;
    });

    // Tutorial states
    const [tutorialStep, setTutorialStep] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [displayedTitle, setDisplayedTitle] = useState("");
    const typingRef = useRef(null);

    // Audio
    const gameStartSoundRef = useRef(null);
    const victorySoundRef = useRef(null);
    const flipSoundRef = useRef(null);
    const keyboardSoundRef = useRef(null);

    useEffect(() => {
        gameStartSoundRef.current = new Audio('/sounds/GameStart.mp3');
        victorySoundRef.current = new Audio('/sounds/Victory.mp3');
        flipSoundRef.current = new Audio('/sounds/swap.wav');
        keyboardSoundRef.current = new Audio('/sounds/keyboard.wav');
        gameStartSoundRef.current.load();
        victorySoundRef.current.load();
        flipSoundRef.current.load();
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

    // Typewriter effect
    useEffect(() => {
        if (gameStatus !== "tutorial") return;
        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (!currentStep) return;

        if (typingRef.current) clearInterval(typingRef.current);

        setIsTyping(true);
        setDisplayedTitle("");
        setDisplayedText("");

        // Play keyboard typing sound
        playSound(keyboardSoundRef);

        const fullTitle = currentStep.title;
        const fullMessage = currentStep.message;
        let titleIndex = 0;
        let messageIndex = 0;
        let typingPhase = "title";

        typingRef.current = setInterval(() => {
            if (typingPhase === "title") {
                if (titleIndex < fullTitle.length) {
                    setDisplayedTitle(fullTitle.slice(0, titleIndex + 1));
                    titleIndex++;
                } else {
                    typingPhase = "message";
                }
            } else {
                if (messageIndex < fullMessage.length) {
                    setDisplayedText(fullMessage.slice(0, messageIndex + 1));
                    messageIndex++;
                } else {
                    clearInterval(typingRef.current);
                    setIsTyping(false);
                    // Stop keyboard sound when typing is done
                    stopSound(keyboardSoundRef);
                }
            }
        }, 35);

        return () => {
            if (typingRef.current) clearInterval(typingRef.current);
            // Stop keyboard sound on cleanup
            stopSound(keyboardSoundRef);
        };
    }, [tutorialStep, gameStatus, playSound, stopSound]);

    // Timer
    useEffect(() => {
        let interval;
        if (isTimerRunning && gameStatus === "playing") {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, gameStatus]);

    // Check for win
    useEffect(() => {
        const totalPairs = (boardSize * boardSize) / 2;
        if (matchedPairs === totalPairs && matchedPairs > 0 && gameStatus === "playing") {
            setGameStatus("win");
            setIsTimerRunning(false);
            playSound(victorySoundRef);

            // Save best scores
            const currentBestTime = localStorage.getItem(
                `memoryBestTime_${boardSize}`
            );
            const currentBestMoves = localStorage.getItem(
                `memoryBestMoves_${boardSize}`
            );

            if (!currentBestTime || timer < parseInt(currentBestTime, 10)) {
                localStorage.setItem(`memoryBestTime_${boardSize}`, timer.toString());
                setBestTime(timer);
            }
            if (!currentBestMoves || moves < parseInt(currentBestMoves, 10)) {
                localStorage.setItem(`memoryBestMoves_${boardSize}`, moves.toString());
                setBestMoves(moves);
            }

            // Complete session with win
            if (isAuthenticated) {
                const symbols = cards.map(c => c.symbol);
                const matchedIds = cards.filter(c => c.isMatched).map(c => c.id);
                completeGame({
                    result: 'win',
                    score: totalPairs - moves, // Score based on efficiency
                    moves_count: moves,
                    time_elapsed: timer,
                    gameState: { symbols, matchedIds, moves, matchedPairs, timer }
                });
            }
        }
    }, [matchedPairs, boardSize, timer, moves, gameStatus, isAuthenticated, completeGame, cards]);

    const handleCardClick = useCallback(
        async (cardId) => {
            // Tutorial mode
            if (gameStatus === "tutorial") {
                const currentStep = TUTORIAL_STEPS[tutorialStep];
                if (currentStep?.action === "click_card" && !isTyping) {
                    if (currentStep.targetCards.includes(cardId)) {
                        // Flip the target card
                        setCards((prev) =>
                            prev.map((c) =>
                                c.id === cardId ? { ...c, isFlipped: true } : c
                            )
                        );

                        // Check if this is the second card of a pair
                        const flippedCount = cards.filter((c) => c.isFlipped && !c.isMatched).length;
                        if (flippedCount === 1) {
                            // This is the second card - mark as matched after delay
                            await new Promise((r) => setTimeout(r, 500));
                            setCards((prev) =>
                                prev.map((c) =>
                                    c.isFlipped && !c.isMatched ? { ...c, isMatched: true } : c
                                )
                            );
                        }

                        setTutorialStep((prev) => prev + 1);
                    }
                }
                return;
            }

            if (isChecking || gameStatus !== "playing") return;

            const card = cards.find((c) => c.id === cardId);
            if (!card || card.isFlipped || card.isMatched) return;

            // Start timer on first click
            if (!isTimerRunning) {
                setIsTimerRunning(true);
            }

            // Flip the card
            playSound(flipSoundRef);
            setCards((prev) =>
                prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
            );

            const newFlipped = [...flippedCards, cardId];
            setFlippedCards(newFlipped);

            // Check for match when 2 cards are flipped
            if (newFlipped.length === 2) {
                setMoves((prev) => prev + 1);
                setIsChecking(true);

                const [firstId, secondId] = newFlipped;
                const firstCard = cards.find((c) => c.id === firstId);
                const secondCard = cards.find((c) => c.id === secondId);

                if (firstCard.symbol === secondCard.symbol) {
                    // Match found
                    setTimeout(() => {
                        setCards((prev) =>
                            prev.map((c) =>
                                c.id === firstId || c.id === secondId
                                    ? { ...c, isMatched: true }
                                    : c
                            )
                        );
                        setMatchedPairs((prev) => prev + 1);
                        setFlippedCards([]);
                        setIsChecking(false);
                    }, 300);
                } else {
                    // No match - flip back
                    setTimeout(() => {
                        setCards((prev) =>
                            prev.map((c) =>
                                c.id === firstId || c.id === secondId
                                    ? { ...c, isFlipped: false }
                                    : c
                            )
                        );
                        setFlippedCards([]);
                        setIsChecking(false);
                    }, 800);
                }
            }
        },
        [cards, flippedCards, isChecking, gameStatus, isTimerRunning, tutorialStep, isTyping]
    );

    const startGame = async () => {
        playSound(gameStartSoundRef);
        const newCards = createBoard(boardSize, theme);
        setCards(newCards);
        setFlippedCards([]);
        setMoves(0);
        setMatchedPairs(0);
        setIsChecking(false);
        setTimer(0);
        setIsTimerRunning(false);

        // Preview mode - show all cards briefly based on difficulty
        if (previewTime > 0) {
            setGameStatus("preview");
            // Flip all cards for preview
            setCards(newCards.map(c => ({ ...c, isFlipped: true })));
            await new Promise(r => setTimeout(r, previewTime));
            // Hide all cards
            setCards(newCards.map(c => ({ ...c, isFlipped: false })));
        }
        setGameStatus("playing");

        // Start session for API tracking
        if (isAuthenticated) {
            const symbols = newCards.map(c => c.symbol);
            await startSession(lobbySettings, { symbols, matchedIds: [], moves: 0, matchedPairs: 0, timer: 0 });
        }
    };

    const startTutorial = () => {
        setCards(createTutorialBoard());
        setFlippedCards([]);
        setMoves(0);
        setMatchedPairs(0);
        setGameStatus("tutorial");
        setTutorialStep(0);
        setIsTyping(false);
        setDisplayedText("");
        setDisplayedTitle("");
        setIsChecking(false);
        setTimer(0);
        setIsTimerRunning(false);
    };

    const exitTutorial = () => {
        setGameStatus("idle");
        setTutorialStep(0);
        setCards(createBoard(boardSize, theme));
    };

    const nextTutorialStep = () => {
        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (currentStep?.action === "finish") {
            stopSound(keyboardSoundRef);
            startGame();
        } else {
            setTutorialStep((prev) => prev + 1);
        }
    };

    const restartGame = async () => {
        // Start a new session for the new game
        if (isAuthenticated) {
            const newCards = createBoard(boardSize, theme);
            const symbols = newCards.map(c => c.symbol);
            await startSession(lobbySettings, { symbols, matchedIds: [], moves: 0, matchedPairs: 0, timer: 0 });
        }

        const newCards = createBoard(boardSize, theme);
        setCards(newCards);
        setFlippedCards([]);
        setMoves(0);
        setMatchedPairs(0);
        setIsChecking(false);
        setTimer(0);
        setIsTimerRunning(false);

        // Preview mode
        if (previewTime > 0) {
            setGameStatus("preview");
            setCards(newCards.map(c => ({ ...c, isFlipped: true })));
            await new Promise(r => setTimeout(r, previewTime));
            setCards(newCards.map(c => ({ ...c, isFlipped: false })));
        }
        setGameStatus("playing");
    };

    const changeDifficulty = async (size) => {
        setBoardSize(size);
        const newCards = createBoard(size, theme);
        setCards(newCards);
        setFlippedCards([]);
        setMoves(0);
        setMatchedPairs(0);
        setIsChecking(false);
        setTimer(0);
        setIsTimerRunning(false);
        setShowSettings(false);

        // Preview mode
        if (previewTime > 0) {
            setGameStatus("preview");
            setCards(newCards.map(c => ({ ...c, isFlipped: true })));
            await new Promise(r => setTimeout(r, previewTime));
            setCards(newCards.map(c => ({ ...c, isFlipped: false })));
        }
        setGameStatus("playing");

        // Load best scores for new size
        const savedTime = localStorage.getItem(`memoryBestTime_${size}`);
        const savedMoves = localStorage.getItem(`memoryBestMoves_${size}`);
        setBestTime(savedTime ? parseInt(savedTime, 10) : null);
        setBestMoves(savedMoves ? parseInt(savedMoves, 10) : null);
    };

    // Save game function
    const handleSaveGame = async () => {
        if (gameStatus !== 'playing') return;

        const symbols = cards.map(c => c.symbol);
        const matchedIds = cards.filter(c => c.isMatched).map(c => c.id);
        await saveProgress({
            symbols,
            matchedIds,
            moves,
            matchedPairs,
            timer
        });
        import('sonner').then(({ toast }) => {
            toast.success('Đã lưu game!', { duration: 2000 });
        });
    };

    // Resume game from saved session
    useEffect(() => {
        if (resumeSession?.id && gameStatus === 'idle') {
            // Set session ID for completing later
            setResumeSessionId(resumeSession.id, resumeSession.started_at, resumeSession.moves_count);

            // If we have saved game_state with symbols, restore it
            if (resumeSession.game_state?.symbols && resumeSession.game_state.symbols.length > 0) {
                const { symbols, matchedIds, moves: savedMoves, matchedPairs: savedMatchedPairs, timer: savedTimer } = resumeSession.game_state;
                // Reconstruct cards from saved state
                const restoredCards = symbols.map((symbol, id) => ({
                    id,
                    symbol,
                    isFlipped: matchedIds?.includes(id) || false,
                    isMatched: matchedIds?.includes(id) || false,
                }));
                setCards(restoredCards);
                if (savedMoves !== undefined) setMoves(savedMoves);
                if (savedMatchedPairs !== undefined) setMatchedPairs(savedMatchedPairs);
                if (savedTimer !== undefined) setTimer(savedTimer);
                setGameStatus('playing');
                setIsTimerRunning(true);
                playSound(gameStartSoundRef);
            } else {
                // No game_state saved yet - start fresh game with same session
                const newCards = createBoard(boardSize, theme);
                setCards(newCards);
                setFlippedCards([]);
                setMoves(0);
                setMatchedPairs(0);
                setIsChecking(false);
                setTimer(0);
                setIsTimerRunning(false);
                setGameStatus('playing');
                playSound(gameStartSoundRef);
            }
        }
    }, [resumeSession, playSound, setResumeSessionId, boardSize, theme]);

    // Update game state for auto-save
    useEffect(() => {
        if (gameStatus === 'playing') {
            const symbols = cards.map(c => c.symbol);
            const matchedIds = cards.filter(c => c.isMatched).map(c => c.id);
            updateGameState({
                symbols,
                matchedIds,
                moves,
                matchedPairs,
                timer
            });
        }
    }, [cards, moves, matchedPairs, timer, gameStatus, updateGameState]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentTutorialStep = TUTORIAL_STEPS[tutorialStep];
    const showNextButton =
        gameStatus === "tutorial" &&
        (currentTutorialStep?.action === "click_next" ||
            currentTutorialStep?.action === "finish") &&
        !isTyping;

    const renderCard = (card) => {
        const isFlipped = card.isFlipped || card.isMatched;
        const isHighlighted =
            gameStatus === "tutorial" &&
            currentTutorialStep?.highlightCards?.includes(card.id);

        return (
            <div
                key={card.id}
                className={`aspect-square cursor-pointer perspective-1000 ${isHighlighted ? "ring-2 ring-yellow-400 ring-offset-2 animate-pulse rounded-lg" : ""
                    }`}
                onClick={() => handleCardClick(card.id)}
            >
                <div
                    className={`relative w-full h-full transition-transform duration-300 transform-style-3d ${isFlipped ? "rotate-y-180" : ""
                        }`}
                    style={{
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        transition: "transform 0.4s ease-in-out",
                    }}
                >
                    {/* Back of card */}
                    <div
                        className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-indigo-400 shadow-lg backface-hidden"
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <span className="text-2xl sm:text-3xl text-white/30">?</span>
                    </div>

                    {/* Front of card */}
                    <div
                        className={`absolute inset-0 rounded-lg flex items-center justify-center border-2 shadow-lg backface-hidden
                            ${card.isMatched
                                ? "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-600"
                                : "bg-card border-border"
                            }`}
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                        }}
                    >
                        {isImageSymbol(card.symbol) ? (
                            <img
                                src={card.symbol}
                                alt="card"
                                className={`w-8 h-8 sm:w-10 sm:h-10 object-contain transition-transform duration-200 ${card.isMatched ? "scale-110" : ""}`}
                                draggable={false}
                            />
                        ) : (
                            <span
                                className={`text-2xl sm:text-4xl transition-transform duration-200 ${card.isMatched ? "scale-110" : ""}`}
                            >
                                {card.symbol}
                            </span>
                        )}
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
                    onClick={() => navigate("/games/memory")}
                >
                    <Home size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-wider text-foreground">
                        {gameStatus === "tutorial" ? "📖 HƯỚNG DẪN" : gameStatus === "preview" ? "👀 XEM TRƯỚC..." : "CỜ TRÍ NHỚ"}
                    </span>
                    {gameStatus !== "tutorial" && gameStatus !== "idle" && (
                        <>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                                difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                                }`}>
                                {DIFFICULTY_SETTINGS[difficulty]?.label}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-500/20 text-purple-500">
                                {boardSize}x{boardSize}
                            </span>
                        </>
                    )}
                </div>
                {/* Save Button - only during playing */}
                {gameStatus === 'playing' ? (
                    <button
                        className="w-10 h-10 flex items-center justify-center bg-indigo-500/20 rounded-lg text-indigo-500 hover:bg-indigo-500/30 transition-all"
                        onClick={handleSaveGame}
                        title="Lưu game"
                    >
                        <Save size={20} />
                    </button>
                ) : (
                    <div className="w-10" />
                )}
            </div>

            {/* Stats Bar - Hide in idle and tutorial */}
            {gameStatus !== "idle" && gameStatus !== "tutorial" && (
                <div className="flex items-center justify-center gap-3 p-3 bg-card flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                        <Clock size={14} className="text-cyan-500" />
                        <span className="font-mono text-lg font-bold text-cyan-500">
                            {formatTime(timer)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                        <Zap size={14} className="text-yellow-500" />
                        <span className="text-xs text-muted-foreground">Lượt:</span>
                        <span className="font-mono text-lg font-bold text-yellow-500">
                            {moves}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                        <Trophy size={14} className="text-green-500" />
                        <span className="text-xs text-muted-foreground">Cặp:</span>
                        <span className="font-mono text-lg font-bold text-green-500">
                            {matchedPairs}/{totalPairs}
                        </span>
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && gameStatus === "playing" && (
                <div className="px-4 py-2 bg-card border-b border-border">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">Độ khó:</span>
                        {[4, 6].map((size) => (
                            <button
                                key={size}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${boardSize === size
                                        ? "bg-indigo-500 text-white"
                                        : "bg-secondary text-muted-foreground hover:bg-accent"
                                    }`}
                                onClick={() => changeDifficulty(size)}
                            >
                                {size}x{size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 flex items-center justify-center p-4 gap-6 ${gameStatus === "tutorial" ? "md:pb-4 pb-48" : ""}`}>
                {/* Idle Screen */}
                {gameStatus === "idle" && (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-card rounded-2xl shadow-lg border-2 border-border">
                        <div className="text-3xl font-bold text-foreground mb-2">
                            🧠 Cờ Trí Nhớ 🧠
                        </div>
                        <button
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 rounded-xl text-white font-semibold hover:bg-indigo-600 transition-all"
                            onClick={startGame}
                        >
                            🎮 Bắt đầu chơi
                        </button>
                        <button
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:bg-blue-600 transition-all"
                            onClick={startTutorial}
                        >
                            <BookOpen size={20} /> Hướng dẫn chơi
                        </button>
                    </div>
                )}

                {/* Game Board */}
                {gameStatus !== "idle" && (
                    <div className="bg-card rounded-2xl p-2 shadow-lg border-2 border-border relative">
                        <div
                            className="grid gap-1.5"
                            style={{
                                gridTemplateColumns: `repeat(${gameStatus === "tutorial" ? 4 : boardSize}, 1fr)`,
                                width:
                                    (gameStatus === "tutorial" ? 4 : boardSize) === 4
                                        ? "min(85vw, 340px)"
                                        : "min(90vw, 420px)",
                                height:
                                    (gameStatus === "tutorial" ? 4 : boardSize) === 4
                                        ? "min(85vw, 340px)"
                                        : "min(90vw, 420px)",
                            }}
                        >
                            {cards.map((card) => renderCard(card))}
                        </div>

                        {/* Win Overlay */}
                        {gameStatus === "win" && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl">
                                <div className="text-4xl mb-2">🎉</div>
                                <div className="text-xl font-bold text-green-400 mb-2">
                                    HOÀN THÀNH!
                                </div>
                                <div className="text-base text-white mb-1">
                                    Thời gian: {formatTime(timer)}
                                </div>
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
                )}

                {/* Tutorial Panel - Desktop */}
                {gameStatus === "tutorial" && currentTutorialStep && (
                    <div className="hidden md:flex flex-col w-80 h-fit p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen size={20} className="text-indigo-400" />
                                <span className="text-sm font-semibold text-indigo-400">
                                    Hướng dẫn chơi
                                </span>
                            </div>
                            <button
                                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent transition-all"
                                onClick={exitTutorial}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex gap-1 mb-4">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-1.5 rounded-full transition-colors ${idx < tutorialStep
                                        ? "bg-indigo-500"
                                        : idx === tutorialStep
                                            ? "bg-indigo-400 animate-pulse"
                                            : "bg-secondary"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-2">
                                Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                            </div>
                            <div className="text-xl font-bold text-foreground mb-3 min-h-[2rem]">
                                {displayedTitle}
                                {isTyping && displayedText.length === 0 && (
                                    <span className="animate-pulse">|</span>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                                {displayedText}
                                {isTyping && displayedText.length > 0 && (
                                    <span className="animate-pulse text-indigo-400">|</span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {showNextButton && (
                            <button
                                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-all shadow-md"
                                onClick={nextTutorialStep}
                            >
                                {currentTutorialStep.action === "finish" ? (
                                    <>🎮 Bắt đầu chơi</>
                                ) : (
                                    <>
                                        Tiếp tục
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        )}

                        {/* Hint for click_card */}
                        {!isTyping && currentTutorialStep?.action === "click_card" && (
                            <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/50">
                                <div className="text-sm text-muted-foreground">
                                    Nhấn vào thẻ được đánh dấu!
                                </div>
                                <div className="text-3xl animate-bounce">👆</div>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                💡{" "}
                                {currentTutorialStep?.action === "click_card" &&
                                    !isTyping &&
                                    "Nhấn vào thẻ sáng lên"}
                                {currentTutorialStep?.action === "click_next" &&
                                    !isTyping &&
                                    "Nhấn nút Tiếp tục"}
                                {currentTutorialStep?.action === "finish" &&
                                    !isTyping &&
                                    "Bạn đã sẵn sàng!"}
                                {isTyping && "Đang hiển thị hướng dẫn..."}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tutorial Panel - Mobile */}
                {gameStatus === "tutorial" && currentTutorialStep && (
                    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-t border-indigo-500/30 shadow-lg z-50">
                        {/* Progress Bar */}
                        <div className="flex gap-1 mb-3">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-1 rounded-full transition-colors ${idx < tutorialStep
                                        ? "bg-indigo-500"
                                        : idx === tutorialStep
                                            ? "bg-indigo-400 animate-pulse"
                                            : "bg-secondary"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">
                                Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                            </div>
                            <div className="text-base font-bold text-foreground mb-2">
                                {displayedTitle}
                                {isTyping && displayedText.length === 0 && (
                                    <span className="animate-pulse">|</span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                {displayedText}
                                {isTyping && displayedText.length > 0 && (
                                    <span className="animate-pulse text-indigo-400">|</span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {showNextButton && (
                            <button
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-all shadow-md"
                                onClick={nextTutorialStep}
                            >
                                {currentTutorialStep.action === "finish" ? (
                                    <>🎮 Bắt đầu chơi</>
                                ) : (
                                    <>
                                        Tiếp tục
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        )}

                        {/* Hint for click_card */}
                        {!isTyping && currentTutorialStep?.action === "click_card" && (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                                <span className="animate-bounce">👆</span>
                                <span>Nhấn vào thẻ được đánh dấu!</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Best Scores */}
            {bestTime !== null && gameStatus === "playing" && (
                <div className="text-center pb-1.5">
                    <span className="text-muted-foreground text-xs">
                        Kỷ lục ({boardSize}x{boardSize}):{" "}
                    </span>
                    <span className="text-yellow-500 font-bold text-sm">
                        {formatTime(bestTime)} | {bestMoves} lượt
                    </span>
                </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-3 p-3 bg-card border-t border-border">
                {gameStatus === "tutorial" && (
                    <button
                        className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                        onClick={exitTutorial}
                    >
                        <X size={18} />
                        <span>Thoát hướng dẫn</span>
                    </button>
                )}

            </div>
        </div>
    );
};

export default MemoryGame;
