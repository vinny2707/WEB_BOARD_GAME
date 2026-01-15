import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RotateCcw, Settings, Trophy, Zap, Clock, BookOpen, X, ChevronRight } from 'lucide-react';

const BOARD_SIZE = 8;
const CANDY_TYPES = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐'];
const CANDY_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#3b82f6'];

// Tutorial board - fixed layout for learning
// Swap [2,4] với [2,5] để tạo 3 🍎 theo cột 4
// Logic: [1,4]=🍎, [2,4]=🍊, [3,4]=🍎, [2,5]=🍎
// Sau swap [2,4]↔[2,5]: [2,4]=🍎 => cột 4 có 3 🍎 liên tiếp
const createTutorialBoard = () => {
    // CANDY_TYPES: 0=🍎, 1=🍊, 2=🍋, 3=🍇, 4=🍓, 5=🫐
    // [1,4]=12: 🍎(0), [2,4]=20: 🍊(1), [3,4]=28: 🍎(0), [2,5]=21: 🍎(0)
    const pattern = [
        2, 3, 4, 5, 3, 2, 4, 5,  // Row 0: tránh match
        3, 4, 5, 2, 0, 3, 5, 4,  // Row 1: col4=🍎
        4, 5, 3, 4, 1, 0, 2, 3,  // Row 2: col4=🍊(swap), col5=🍎(swap với)
        5, 2, 4, 3, 0, 4, 3, 2,  // Row 3: col4=🍎
        2, 3, 5, 4, 2, 5, 4, 3,  // Row 4: tránh match
        3, 4, 2, 5, 3, 2, 5, 4,  // Row 5
        4, 5, 3, 2, 4, 3, 2, 5,  // Row 6
        5, 2, 4, 3, 5, 4, 3, 2,  // Row 7
    ];
    return pattern.map((type, i) => ({ type, key: i }));
};

// Tutorial steps - Swap [2,4] with [2,5] (swap ngang để tạo match dọc)
// Cell indices: [1,4]=12, [2,4]=20, [2,5]=21, [3,4]=28
const TUTORIAL_STEPS = [
    {
        id: 1,
        title: "Chào mừng đến với Ghép Hàng 3! 🍬",
        message: "Hãy học cách ghép các viên kẹo để ghi điểm! Swap 2 viên kẹo cạnh nhau để tạo hàng 3+ viên giống nhau.",
        action: "click_next",
        highlightCells: [],
        swapPair: null,
    },
    {
        id: 2,
        title: "Bước 1: Nhận diện cơ hội! 👀",
        message: "Nhìn cột thứ 5: có 2 quả 🍎 ở hàng 2 và hàng 4. Nếu swap viên 🍊 ở giữa với 🍎 bên phải, sẽ tạo 3 🍎 liên tiếp theo cột!",
        action: "click_next",
        highlightCells: [12, 20, 28], // col 4: row 1,2,3 - highlight cột sẽ match
        swapPair: null,
    },
    {
        id: 3,
        title: "Bước 2: Chọn viên đầu tiên! ☝️",
        message: "Click vào viên 🍊 ở vị trí (hàng 3, cột 5) để chọn nó.",
        action: "click_cell",
        highlightCells: [20],
        targetCell: 20, // [2,4] - viên 🍊
        swapPair: null,
    },
    {
        id: 4,
        title: "Bước 3: Swap để tạo match! 🔄",
        message: "Giờ click vào viên 🍎 bên phải để hoán đổi! Kết quả: 3 quả 🍎 liên tiếp theo cột!",
        action: "click_cell",
        highlightCells: [21],
        targetCell: 21, // [2,5] - viên 🍎 bên phải
        swapPair: [20, 21],
    },
    {
        id: 5,
        title: "Tuyệt vời! Bạn đã tạo Match! 🎉",
        message: "3 quả 🍎 biến mất và bạn ghi điểm! Các viên phía trên rơi xuống lấp đầy chỗ trống.",
        action: "click_next",
        highlightCells: [],
        swapPair: null,
    },
    {
        id: 6,
        title: "Mẹo: Match 4+ viên! ⚡",
        message: "Ghép 4 viên = nhiều điểm hơn! Ghép 5 viên = SIÊU điểm! Hãy tìm cơ hội tạo combo dài!",
        action: "click_next",
        highlightCells: [],
        swapPair: null,
    },
    {
        id: 7,
        title: "Mẹo: Combo Chain! 🔥",
        message: "Khi viên kẹo rơi xuống có thể tạo thêm match mới → COMBO! Combo tăng điểm gấp bội!",
        action: "click_next",
        highlightCells: [],
        swapPair: null,
    },
    {
        id: 8,
        title: "Hoàn thành! 🚀",
        message: "Bạn đã sẵn sàng! Đạt 5000 điểm trong 30 lượt để thắng. Chúc may mắn!",
        action: "finish",
        highlightCells: [],
        swapPair: null,
    },
];

const createBoard = () => {
    const board = [];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        board.push({
            type: Math.floor(Math.random() * CANDY_TYPES.length),
            key: Date.now() + i
        });
    }
    return removeInitialMatches(board);
};

const removeInitialMatches = (board) => {
    const newBoard = [...board];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const row = Math.floor(i / BOARD_SIZE);
        const col = i % BOARD_SIZE;
        if (col >= 2) {
            while (newBoard[i].type === newBoard[i - 1].type && newBoard[i].type === newBoard[i - 2].type) {
                newBoard[i] = { ...newBoard[i], type: Math.floor(Math.random() * CANDY_TYPES.length) };
            }
        }
        if (row >= 2) {
            while (newBoard[i].type === newBoard[i - BOARD_SIZE].type && newBoard[i].type === newBoard[i - BOARD_SIZE * 2].type) {
                newBoard[i] = { ...newBoard[i], type: Math.floor(Math.random() * CANDY_TYPES.length) };
            }
        }
    }
    return newBoard;
};

const Match3Game = () => {
    const navigate = useNavigate();
    const keyRef = useRef(1000);
    const [board, setBoard] = useState(() => createBoard());
    const [selectedCell, setSelectedCell] = useState(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(30);
    const [gameStatus, setGameStatus] = useState('idle'); // 'idle', 'playing', 'win', 'gameover', 'tutorial'
    const [combo, setCombo] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [matchedCells, setMatchedCells] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [targetScore] = useState(5000);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('match3HighScore');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [swappingCells, setSwappingCells] = useState({ from: null, to: null });
    const [explosions, setExplosions] = useState([]);

    // Tutorial states
    const [tutorialStep, setTutorialStep] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [displayedTitle, setDisplayedTitle] = useState('');
    const typingRef = useRef(null);

    // Typewriter effect
    useEffect(() => {
        if (gameStatus !== 'tutorial') return;
        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (!currentStep) return;

        if (typingRef.current) clearInterval(typingRef.current);

        setIsTyping(true);
        setDisplayedTitle('');
        setDisplayedText('');

        const fullTitle = currentStep.title;
        const fullMessage = currentStep.message;
        let titleIndex = 0;
        let messageIndex = 0;
        let typingPhase = 'title';

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
        }, 35);

        return () => { if (typingRef.current) clearInterval(typingRef.current); };
    }, [tutorialStep, gameStatus]);

    const areAdjacent = (i1, i2) => {
        const r1 = Math.floor(i1 / BOARD_SIZE), c1 = i1 % BOARD_SIZE;
        const r2 = Math.floor(i2 / BOARD_SIZE), c2 = i2 % BOARD_SIZE;
        return (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
    };

    const getSwapDir = (from, to) => {
        const rf = Math.floor(from / BOARD_SIZE), cf = from % BOARD_SIZE;
        const rt = Math.floor(to / BOARD_SIZE), ct = to % BOARD_SIZE;
        if (rt < rf) return 'up'; if (rt > rf) return 'down';
        if (ct < cf) return 'left'; if (ct > cf) return 'right';
        return null;
    };

    const findMatches = useCallback((b) => {
        const matches = new Set();
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE - 2; c++) {
                const i = r * BOARD_SIZE + c;
                const t = b[i].type;
                if (t !== null && b[i + 1].type === t && b[i + 2].type === t) {
                    matches.add(i); matches.add(i + 1); matches.add(i + 2);
                    let k = 3; while (c + k < BOARD_SIZE && b[i + k].type === t) { matches.add(i + k); k++; }
                }
            }
        }
        for (let c = 0; c < BOARD_SIZE; c++) {
            for (let r = 0; r < BOARD_SIZE - 2; r++) {
                const i = r * BOARD_SIZE + c;
                const t = b[i].type;
                if (t !== null && b[i + BOARD_SIZE].type === t && b[i + BOARD_SIZE * 2].type === t) {
                    matches.add(i); matches.add(i + BOARD_SIZE); matches.add(i + BOARD_SIZE * 2);
                    let k = 3; while (r + k < BOARD_SIZE && b[i + BOARD_SIZE * k].type === t) { matches.add(i + BOARD_SIZE * k); k++; }
                }
            }
        }
        return Array.from(matches);
    }, []);

    const prepareNewBoard = useCallback((b, matchedSet) => {
        const result = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            const survivors = [];
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                const idx = row * BOARD_SIZE + col;
                if (!matchedSet.has(idx)) {
                    survivors.push({ ...b[idx], originalRow: row });
                }
            }
            const newCount = BOARD_SIZE - survivors.length;
            const newCandies = [];
            for (let i = 0; i < newCount; i++) {
                keyRef.current++;
                newCandies.push({
                    type: Math.floor(Math.random() * CANDY_TYPES.length),
                    key: keyRef.current,
                    originalRow: -(newCount - i),
                    isNew: true
                });
            }
            const column = [...newCandies.reverse(), ...survivors.reverse()];
            for (let row = 0; row < BOARD_SIZE; row++) {
                const candy = column[row];
                const idx = row * BOARD_SIZE + col;
                const fallDistance = row - candy.originalRow;
                result[idx] = {
                    type: candy.type,
                    key: candy.key,
                    fallFrom: candy.originalRow,
                    fallTo: row,
                    fallDistance: fallDistance,
                    isNew: candy.isNew || false
                };
            }
        }
        return result;
    }, []);

    const createExplosions = useCallback((matches, b) => {
        const exps = matches.map((idx, i) => ({
            id: Date.now() + idx,
            x: ((idx % BOARD_SIZE) + 0.5) * (100 / BOARD_SIZE),
            y: (Math.floor(idx / BOARD_SIZE) + 0.5) * (100 / BOARD_SIZE),
            color: CANDY_COLORS[b[idx].type] || '#fff',
            delay: i * 10
        }));
        setExplosions(prev => [...prev, ...exps]);
        setTimeout(() => setExplosions(prev => prev.filter(e => !exps.find(ex => ex.id === e.id))), 500);
    }, []);

    const processMatches = useCallback(async (b, comboCount = 0) => {
        const matches = findMatches(b);
        if (matches.length === 0) {
            setCombo(0);
            setIsAnimating(false);
            return b;
        }
        const matchedSet = new Set(matches);
        setMatchedCells(matches);
        createExplosions(matches, b);
        const pts = matches.length * 10 * (comboCount + 1);
        setScore(prev => {
            const ns = prev + pts;
            if (ns > highScore) { setHighScore(ns); localStorage.setItem('match3HighScore', ns.toString()); }
            return ns;
        });
        setCombo(comboCount + 1);
        await new Promise(r => setTimeout(r, 250));
        setMatchedCells([]);
        const newBoard = prepareNewBoard(b, matchedSet);
        setBoard(newBoard);
        await new Promise(r => setTimeout(r, 400));
        setBoard(prev => prev.map(c => ({ type: c.type, key: c.key })));
        return processMatches(newBoard.map(c => ({ type: c.type, key: c.key })), comboCount + 1);
    }, [findMatches, prepareNewBoard, createExplosions, highScore]);

    const handleCellClick = async (index) => {
        // Tutorial mode
        if (gameStatus === 'tutorial') {
            const currentStep = TUTORIAL_STEPS[tutorialStep];
            if (currentStep?.action === 'click_cell' && !isTyping) {
                if (currentStep.targetCell === index) {
                    // Step 3: Chọn cell đầu tiên
                    if (!currentStep.swapPair) {
                        setSelectedCell(index);
                        setTutorialStep(prev => prev + 1);
                    } else {
                        // Step 4: Thực hiện swap và tạo match effect
                        const [from, to] = currentStep.swapPair;
                        setSelectedCell(null);
                        setSwappingCells({ from, to });
                        await new Promise(r => setTimeout(r, 250));
                        
                        const newBoard = [...board];
                        [newBoard[from], newBoard[to]] = [newBoard[to], newBoard[from]];
                        setBoard(newBoard);
                        setSwappingCells({ from: null, to: null });
                        
                        // Hiệu ứng match: highlight các cells sẽ match
                        const matchCells = [12, 20, 28]; // col 4: row 1,2,3
                        setMatchedCells(matchCells);
                        
                        // Tạo hiệu ứng explosion
                        createExplosions(matchCells, newBoard);
                        
                        await new Promise(r => setTimeout(r, 400));
                        
                        // Xóa các cells match và tạo hiệu ứng rơi
                        const matchedSet = new Set(matchCells);
                        const fallingBoard = prepareNewBoard(newBoard, matchedSet);
                        setMatchedCells([]);
                        setBoard(fallingBoard);
                        
                        await new Promise(r => setTimeout(r, 400));
                        
                        // Reset board state sau animation
                        setBoard(prev => prev.map(c => ({ type: c.type, key: c.key })));
                        
                        setTutorialStep(prev => prev + 1);
                    }
                }
            }
            return;
        }

        if (isAnimating || gameStatus !== 'playing') return;

        if (selectedCell === null) {
            setSelectedCell(index);
        } else if (selectedCell === index) {
            setSelectedCell(null);
        } else if (areAdjacent(selectedCell, index)) {
            setIsAnimating(true);
            const from = selectedCell, to = index;
            setSelectedCell(null);

            setSwappingCells({ from, to });
            await new Promise(r => setTimeout(r, 250));

            const newBoard = [...board];
            [newBoard[from], newBoard[to]] = [newBoard[to], newBoard[from]];
            setBoard(newBoard);
            setSwappingCells({ from: null, to: null });

            const matches = findMatches(newBoard);
            if (matches.length === 0) {
                await new Promise(r => setTimeout(r, 100));
                setSwappingCells({ from: to, to: from });
                await new Promise(r => setTimeout(r, 250));
                [newBoard[from], newBoard[to]] = [newBoard[to], newBoard[from]];
                setBoard(newBoard);
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
        if (gameStatus === 'playing') {
            if (score >= targetScore) setGameStatus('win');
            else if (moves <= 0) setGameStatus('gameover');
        }
    }, [score, moves, targetScore, gameStatus]);

    const startGame = () => {
        keyRef.current = 1000;
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
    };

    const startTutorial = () => {
        setBoard(createTutorialBoard());
        setScore(0);
        setMoves(30);
        setCombo(0);
        setSelectedCell(null);
        setGameStatus('tutorial');
        setTutorialStep(0);
        setIsTyping(false);
        setDisplayedText('');
        setDisplayedTitle('');
        setMatchedCells([]);
    };

    const exitTutorial = () => {
        setGameStatus('idle');
        setTutorialStep(0);
        setBoard(createBoard());
        setSelectedCell(null);
    };

    const nextTutorialStep = () => {
        const currentStep = TUTORIAL_STEPS[tutorialStep];
        if (currentStep?.action === 'finish') {
            startGame();
        } else {
            setTutorialStep(prev => prev + 1);
        }
    };

    const restartGame = () => {
        keyRef.current = 1000;
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
    };

    const getSwapTransform = (idx) => {
        if (swappingCells.from === null) return null;
        const dir = getSwapDir(swappingCells.from, swappingCells.to);
        if (idx === swappingCells.from) {
            switch (dir) { case 'up': return 'translateY(-100%)'; case 'down': return 'translateY(100%)'; case 'left': return 'translateX(-100%)'; case 'right': return 'translateX(100%)'; }
        }
        if (idx === swappingCells.to) {
            switch (dir) { case 'up': return 'translateY(100%)'; case 'down': return 'translateY(-100%)'; case 'left': return 'translateX(100%)'; case 'right': return 'translateX(-100%)'; }
        }
        return null;
    };

    const currentTutorialStep = TUTORIAL_STEPS[tutorialStep];
    const showNextButton = gameStatus === 'tutorial' && (currentTutorialStep?.action === 'click_next' || currentTutorialStep?.action === 'finish') && !isTyping;

    const renderCell = (candy, idx) => {
        const isSelected = selectedCell === idx;
        const isMatched = matchedCells.includes(idx);
        const isSwapping = swappingCells.from === idx || swappingCells.to === idx;
        const swapTf = getSwapTransform(idx);
        const hasFall = candy.fallDistance > 0;
        const fallOffset = hasFall ? -candy.fallDistance * 100 : 0;
        const isHighlighted = gameStatus === 'tutorial' && currentTutorialStep?.highlightCells?.includes(idx);

        return (
            <div
                key={idx}
                className={`aspect-square rounded-lg flex items-center justify-center bg-secondary border border-border relative overflow-hidden
                    ${isSelected ? 'ring-2 ring-pink-500 ring-offset-1' : ''}
                    ${isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-1 animate-pulse' : ''}
                    ${!isAnimating && (gameStatus === 'playing' || gameStatus === 'tutorial') ? 'cursor-pointer hover:bg-accent' : ''}`}
                onClick={() => handleCellClick(idx)}
            >
                {candy.type !== null && (
                    <div
                        key={candy.key}
                        className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl select-none will-change-transform"
                        style={{
                            '--fall-from': `${fallOffset}%`,
                            '--fall-to': '0%',
                            transform: swapTf || (isMatched ? 'scale(0) rotate(180deg)' : (isSelected ? 'scale(1.1)' : 'translateY(var(--fall-to))')),
                            opacity: isMatched ? 0 : 1,
                            animation: hasFall && !swapTf && !isMatched
                                ? `candyFall 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards`
                                : 'none',
                            transition: swapTf
                                ? 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                : isMatched
                                    ? 'transform 0.2s ease-out, opacity 0.2s ease-out'
                                    : 'transform 0.1s ease-out',
                            zIndex: isSwapping ? 10 : 1,
                            animationDelay: hasFall ? `${(idx % BOARD_SIZE) * 15}ms` : '0ms'
                        }}
                    >
                        <span className="drop-shadow">{CANDY_TYPES[candy.type]}</span>
                    </div>
                )}
                {isMatched && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-8 h-8 rounded-full animate-ping"
                            style={{ backgroundColor: CANDY_COLORS[candy.type] + '80' }}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            <style>{`
                @keyframes candyFall {
                    from { transform: translateY(var(--fall-from)); }
                    to { transform: translateY(var(--fall-to)); }
                }
                @keyframes comboPopIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes particle-fly-0 { 0%{transform:translate(-50%,-50%)scale(1);opacity:1}100%{transform:translate(calc(-50%+20px),calc(-50%-20px))scale(0);opacity:0} }
                @keyframes particle-fly-1 { 0%{transform:translate(-50%,-50%)scale(1);opacity:1}100%{transform:translate(calc(-50%+25px),calc(-50%+10px))scale(0);opacity:0} }
                @keyframes particle-fly-2 { 0%{transform:translate(-50%,-50%)scale(1);opacity:1}100%{transform:translate(calc(-50%-20px),calc(-50%+20px))scale(0);opacity:0} }
                @keyframes particle-fly-3 { 0%{transform:translate(-50%,-50%)scale(1);opacity:1}100%{transform:translate(calc(-50%-25px),calc(-50%-10px))scale(0);opacity:0} }
                @keyframes score-fly { 0%{transform:translate(-50%,-50%)scale(.5);opacity:0}40%{transform:translate(-50%,-70%)scale(1);opacity:1}100%{transform:translate(-50%,-100%)scale(.8);opacity:0} }
            `}</style>

            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all" onClick={() => navigate('/games/match3')}><Home size={20} /></button>
                <div className="text-lg font-bold tracking-wider text-foreground">{gameStatus === 'tutorial' ? '📖 HƯỚNG DẪN' : 'GHÉP HÀNG 3'}</div>
                <button className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all" onClick={() => setShowSettings(!showSettings)}><Settings size={20} /></button>
            </div>

            {gameStatus !== 'idle' && gameStatus !== 'tutorial' && (
                <div className="flex items-center justify-center gap-3 p-3 bg-card flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="text-xs text-muted-foreground">Mục tiêu:</span>
                        <span className="font-mono text-lg font-bold text-yellow-500">{targetScore.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                        <Zap size={14} className="text-pink-500" />
                        <span className="text-xs text-muted-foreground">Điểm:</span>
                        <span className="font-mono text-lg font-bold text-pink-500">{score.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                        <Clock size={14} className="text-cyan-500" />
                        <span className="text-xs text-muted-foreground">Lượt:</span>
                        <span className="font-mono text-lg font-bold text-cyan-500">{moves}</span>
                    </div>
                </div>
            )}

            {/* Fixed height container for combo */}
            {gameStatus === 'playing' && (
                <div className="h-8 flex items-center justify-center">
                    {combo > 1 && (
                        <span key={combo} className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500" style={{ animation: 'comboPopIn 0.3s ease-out' }}>
                            🔥 COMBO x{combo}! 🔥
                        </span>
                    )}
                </div>
            )}

            <div className={`flex-1 flex items-center justify-center p-4 gap-6 ${gameStatus === 'tutorial' ? 'md:pb-4 pb-48' : ''}`}>
                {/* Idle Screen */}
                {gameStatus === 'idle' && (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-card rounded-2xl shadow-lg border-2 border-border">
                        <div className="text-3xl font-bold text-foreground mb-2">🍬 Ghép Hàng 3 🍬</div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-pink-500 rounded-xl text-white font-semibold hover:bg-pink-600 transition-all" onClick={startGame}>
                            🎮 Bắt đầu chơi
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:bg-blue-600 transition-all" onClick={startTutorial}>
                            <BookOpen size={20} /> Hướng dẫn chơi
                        </button>
                    </div>
                )}

                {/* Game Board */}
                {gameStatus !== 'idle' && (
                    <div className="bg-card rounded-2xl p-1.5 shadow-lg border-2 border-border relative overflow-hidden">
                        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, width: 'min(88vw, 380px)', height: 'min(88vw, 380px)' }}>
                            {board.map((candy, idx) => renderCell(candy, idx))}
                        </div>

                        <div className="absolute inset-0 pointer-events-none">
                            {explosions.map(exp => (
                                <div key={exp.id} className="absolute" style={{ left: `${exp.x}%`, top: `${exp.y}%`, transform: 'translate(-50%,-50%)', zIndex: 50 }}>
                                    <div className="absolute animate-ping" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: exp.color, opacity: 0.6, transform: 'translate(-50%,-50%)', animationDuration: '0.3s' }} />
                                    {[0, 1, 2, 3].map(i => <div key={i} className="absolute text-xs" style={{ animation: `particle-fly-${i} 0.3s ease-out forwards`, animationDelay: `${exp.delay + i * 10}ms`, opacity: 0 }}>✨</div>)}
                                    <div className="absolute text-[10px] font-bold text-yellow-400" style={{ animation: 'score-fly 0.4s ease-out forwards', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>+10</div>
                                </div>
                            ))}
                        </div>

                        {(gameStatus === 'win' || gameStatus === 'gameover') && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl">
                                {gameStatus === 'win' ? <><div className="text-4xl mb-2">🎉</div><div className="text-xl font-bold text-green-400 mb-2">THẮNG!</div></> : <><div className="text-4xl mb-2">😢</div><div className="text-xl font-bold text-red-400 mb-2">HẾT LƯỢT!</div></>}
                                <div className="text-base text-white mb-3">Điểm: {score.toLocaleString()}</div>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 rounded-xl text-white font-semibold hover:bg-pink-600 transition-all" onClick={restartGame}><RotateCcw size={18} /> Chơi lại</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tutorial Panel - Desktop */}
                {gameStatus === 'tutorial' && currentTutorialStep && (
                    <div className="hidden md:flex flex-col w-80 h-fit p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen size={20} className="text-pink-400" />
                                <span className="text-sm font-semibold text-pink-400">Hướng dẫn chơi</span>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent transition-all" onClick={exitTutorial}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex gap-1 mb-4">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div key={idx} className={`flex-1 h-1.5 rounded-full transition-colors ${idx < tutorialStep ? 'bg-pink-500' : idx === tutorialStep ? 'bg-pink-400 animate-pulse' : 'bg-secondary'}`} />
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-2">Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}</div>
                            <div className="text-xl font-bold text-foreground mb-3 min-h-[2rem]">
                                {displayedTitle}
                                {isTyping && displayedText.length === 0 && <span className="animate-pulse">|</span>}
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                                {displayedText}
                                {isTyping && displayedText.length > 0 && <span className="animate-pulse text-pink-400">|</span>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {showNextButton && (
                            <button className="flex items-center justify-center gap-2 w-full py-3 bg-pink-500 text-white text-sm font-semibold rounded-xl hover:bg-pink-600 transition-all shadow-md" onClick={nextTutorialStep}>
                                {currentTutorialStep.action === 'finish' ? <>🎮 Bắt đầu chơi</> : <>Tiếp tục<ChevronRight size={18} /></>}
                            </button>
                        )}

                        {/* Hint for click_cell */}
                        {!isTyping && currentTutorialStep?.action === 'click_cell' && (
                            <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/50">
                                <div className="text-sm text-muted-foreground">Nhấn vào ô được đánh dấu!</div>
                                <div className="text-3xl animate-bounce">👆</div>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                💡 {currentTutorialStep?.action === 'click_cell' && !isTyping && 'Nhấn vào ô sáng lên'}
                                {currentTutorialStep?.action === 'click_next' && !isTyping && 'Nhấn nút Tiếp tục'}
                                {currentTutorialStep?.action === 'finish' && !isTyping && 'Bạn đã sẵn sàng!'}
                                {isTyping && 'Đang hiển thị hướng dẫn...'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tutorial Panel - Mobile (shown below board) */}
                {gameStatus === 'tutorial' && currentTutorialStep && (
                    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-t border-pink-500/30 shadow-lg z-50">
                        {/* Progress Bar */}
                        <div className="flex gap-1 mb-3">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div key={idx} className={`flex-1 h-1 rounded-full transition-colors ${idx < tutorialStep ? 'bg-pink-500' : idx === tutorialStep ? 'bg-pink-400 animate-pulse' : 'bg-secondary'}`} />
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}</div>
                            <div className="text-base font-bold text-foreground mb-2">
                                {displayedTitle}
                                {isTyping && displayedText.length === 0 && <span className="animate-pulse">|</span>}
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                {displayedText}
                                {isTyping && displayedText.length > 0 && <span className="animate-pulse text-pink-400">|</span>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {showNextButton && (
                            <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-xl hover:bg-pink-600 transition-all shadow-md" onClick={nextTutorialStep}>
                                {currentTutorialStep.action === 'finish' ? <>🎮 Bắt đầu chơi</> : <>Tiếp tục<ChevronRight size={18} /></>}
                            </button>
                        )}

                        {/* Hint for click_cell */}
                        {!isTyping && currentTutorialStep?.action === 'click_cell' && (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                                <span className="animate-bounce">👆</span>
                                <span>Nhấn vào ô được đánh dấu!</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {gameStatus === 'playing' && (
                <div className="text-center pb-1.5">
                    <span className="text-muted-foreground text-xs">Điểm cao nhất: </span>
                    <span className="text-yellow-500 font-bold text-sm">{highScore.toLocaleString()}</span>
                </div>
            )}

            <div className="flex items-center justify-center gap-3 p-3 bg-card border-t border-border">
                {gameStatus === 'tutorial' && (
                    <button className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground" onClick={exitTutorial}>
                        <X size={18} /><span>Thoát hướng dẫn</span>
                    </button>
                )}
                {gameStatus === 'playing' && (
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all" onClick={restartGame}><RotateCcw size={16} /><span>Chơi lại</span></button>
                )}
            </div>
        </div>
    );
};

export default Match3Game;
