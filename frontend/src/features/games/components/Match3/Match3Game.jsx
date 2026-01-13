import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RotateCcw, Settings, Trophy, Zap, Clock } from 'lucide-react';

const BOARD_SIZE = 8;
const CANDY_TYPES = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐'];
const CANDY_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#3b82f6'];

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
    const [gameStatus, setGameStatus] = useState('playing');
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

    // Prepare the new board state after removing matches
    const prepareNewBoard = useCallback((b, matchedSet) => {
        const result = [];

        for (let col = 0; col < BOARD_SIZE; col++) {
            // Get existing candies (non-matched) from bottom to top
            const survivors = [];
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                const idx = row * BOARD_SIZE + col;
                if (!matchedSet.has(idx)) {
                    survivors.push({ ...b[idx], originalRow: row });
                }
            }

            // Calculate how many new candies needed
            const newCount = BOARD_SIZE - survivors.length;

            // Create new candies
            const newCandies = [];
            for (let i = 0; i < newCount; i++) {
                keyRef.current++;
                newCandies.push({
                    type: Math.floor(Math.random() * CANDY_TYPES.length),
                    key: keyRef.current,
                    originalRow: -(newCount - i), // Above screen
                    isNew: true
                });
            }

            // Build column from top: new candies first, then survivors (reversed)
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

        // Show match flash
        setMatchedCells(matches);
        createExplosions(matches, b);

        // Update score immediately for feedback
        const pts = matches.length * 10 * (comboCount + 1);
        setScore(prev => {
            const ns = prev + pts;
            if (ns > highScore) { setHighScore(ns); localStorage.setItem('match3HighScore', ns.toString()); }
            return ns;
        });
        setCombo(comboCount + 1);

        // Wait for match animation
        await new Promise(r => setTimeout(r, 250));
        setMatchedCells([]);

        // Prepare new board with fall info
        const newBoard = prepareNewBoard(b, matchedSet);
        setBoard(newBoard);

        // Wait for fall animation
        await new Promise(r => setTimeout(r, 400));

        // Clear fall info
        setBoard(prev => prev.map(c => ({ type: c.type, key: c.key })));

        // Check for chain reactions
        return processMatches(newBoard.map(c => ({ type: c.type, key: c.key })), comboCount + 1);
    }, [findMatches, prepareNewBoard, createExplosions, highScore]);

    const handleCellClick = async (index) => {
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
        if (score >= targetScore) setGameStatus('win');
        else if (moves <= 0) setGameStatus('gameover');
    }, [score, moves, targetScore]);

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

    const renderCell = (candy, idx) => {
        const isSelected = selectedCell === idx;
        const isMatched = matchedCells.includes(idx);
        const isSwapping = swappingCells.from === idx || swappingCells.to === idx;
        const swapTf = getSwapTransform(idx);

        // Calculate fall animation
        const hasFall = candy.fallDistance > 0;
        const fallOffset = hasFall ? -candy.fallDistance * 100 : 0;

        return (
            <div
                key={idx}
                className={`aspect-square rounded-lg flex items-center justify-center bg-secondary border border-border relative overflow-hidden
                    ${isSelected ? 'ring-2 ring-pink-500 ring-offset-1' : ''}
                    ${!isAnimating && gameStatus === 'playing' ? 'cursor-pointer hover:bg-accent' : ''}`}
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
                <div className="text-lg font-bold tracking-wider text-foreground">GHÉP HÀNG 3</div>
                <button className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all" onClick={() => setShowSettings(!showSettings)}><Settings size={20} /></button>
            </div>

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

            {/* Fixed height container for combo - prevents layout shift */}
            <div className="h-8 flex items-center justify-center">
                {combo > 1 && (
                    <span
                        key={combo}
                        className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"
                        style={{ animation: 'comboPopIn 0.3s ease-out' }}
                    >
                        🔥 COMBO x{combo}! 🔥
                    </span>
                )}
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
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

                    {gameStatus !== 'playing' && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl">
                            {gameStatus === 'win' ? <><div className="text-4xl mb-2">🎉</div><div className="text-xl font-bold text-green-400 mb-2">THẮNG!</div></> : <><div className="text-4xl mb-2">😢</div><div className="text-xl font-bold text-red-400 mb-2">HẾT LƯỢT!</div></>}
                            <div className="text-base text-white mb-3">Điểm: {score.toLocaleString()}</div>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 rounded-xl text-white font-semibold hover:bg-pink-600 transition-all" onClick={restartGame}><RotateCcw size={18} /> Chơi lại</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center pb-1.5">
                <span className="text-muted-foreground text-xs">Điểm cao nhất: </span>
                <span className="text-yellow-500 font-bold text-sm">{highScore.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 bg-card border-t border-border">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all" onClick={restartGame}><RotateCcw size={16} /><span>Chơi lại</span></button>
            </div>
        </div>
    );
};

export default Match3Game;
