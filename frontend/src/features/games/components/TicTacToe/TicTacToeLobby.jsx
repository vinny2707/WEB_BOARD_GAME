import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Trophy, Globe, Settings, ArrowLeft, Crown, Medal, X, Clock, User, Shuffle, Minus, Plus, ChevronLeft } from 'lucide-react';
import useClickSound from '../../hooks/useClickSound';
import GameReviews from '../GameReviews';

// Sample leaderboard data (replace with real API data later)
const sampleLeaderboard = [
    { rank: 1, name: 'ProGamer99', score: 11322, flag: '🇻🇳' },
    { rank: 2, name: 'ChessKing', score: 9308, flag: '🇺🇸' },
    { rank: 3, name: 'TicTacPro', score: 5579, flag: '🇯🇵' },
    { rank: 4, name: 'GameMaster', score: 5520, flag: '🇰🇷' },
    { rank: 5, name: 'WinnerX', score: 4792, flag: '🇬🇧' },
    { rank: 6, name: 'Player123', score: 3091, flag: '🇫🇷' },
    { rank: 7, name: 'StarPlayer', score: 3081, flag: '🇩🇪' },
    { rank: 8, name: 'TopScorer', score: 3014, flag: '🇮🇹' },
];

// Default game settings
const DEFAULT_SETTINGS = {
    boardSize: 3,
    timePerTurn: 30,
    timePerPlayer: 120,
    firstPlayer: 'random', // 'random', 'player', 'ai'
    difficulty: 'medium', // 'easy', 'medium', 'hard'
};

const TicTacToeLobby = () => {
    const navigate = useNavigate();
    const playClick = useClickSound();
    const [countdown, setCountdown] = useState({ hours: 1, minutes: 48, seconds: 32 });
    const [currentUserRank, setCurrentUserRank] = useState({ rank: 1385, name: 'You', score: 1002 });

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsMode, setSettingsMode] = useState('robot');
    const [gameSettings, setGameSettings] = useState(DEFAULT_SETTINGS);
    const [isCustomMode, setIsCustomMode] = useState(false);

    // Countdown timer for daily leaderboard
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                let { hours, minutes, seconds } = prev;
                seconds--;
                if (seconds < 0) { seconds = 59; minutes--; }
                if (minutes < 0) { minutes = 59; hours--; }
                if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const openSettings = (mode, e) => {
        e.stopPropagation();
        playClick();
        setSettingsMode(mode);
        setIsCustomMode(false);
        setShowSettingsModal(true);
    };

    const handleSaveSettings = () => {
        playClick();
        setShowSettingsModal(false);
        setIsCustomMode(false);
        // Settings are saved in state, game starts when clicking "Chơi với máy"
    };

    const handleSetUnlimitedTime = () => {
        playClick();
        setGameSettings(prev => ({
            ...prev,
            timePerTurn: 0,
            timePerPlayer: 0
        }));
    };

    const handlePlayVsRobot = () => {
        playClick();
        navigate('/games/tic-tac-toe/play', { state: { settings: gameSettings } });
    };

    const handlePlayWithFriend = () => {
        playClick();
        alert('Tính năng chơi với bạn bè đang được phát triển!');
    };

    const handlePlayOnline = () => {
        playClick();
        alert('Tính năng chơi online đang được phát triển!');
    };

    const handleCreateTournament = () => {
        playClick();
        alert('Tính năng tạo giải đấu đang được phát triển!');
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-orange-400" size={16} />;
        if (rank === 2) return <Medal className="text-gray-400" size={16} />;
        if (rank === 3) return <Medal className="text-amber-700" size={16} />;
        return <span className="text-sm text-muted-foreground">{rank}.</span>;
    };

    const formatTime = (seconds) => {
        if (seconds === 0) return 'Không giới hạn';
        if (seconds < 60) return `${seconds} giây`;
        return `${Math.floor(seconds / 60)} phút`;
    };

    const getModeTitle = () => {
        if (isCustomMode) return 'Tùy chỉnh cài đặt';
        switch (settingsMode) {
            case 'friend': return 'Chơi với bạn bè';
            case 'robot': return 'Chơi với máy';
            case 'tournament': return 'Tạo giải đấu';
            case 'online': return 'Chơi online';
            default: return 'Cài đặt game';
        }
    };

    const getModeIcon = () => {
        if (isCustomMode) return <Settings size={24} className="text-emerald-500" />;
        switch (settingsMode) {
            case 'friend': return <Users size={24} className="text-emerald-500" />;
            case 'robot': return <Bot size={24} className="text-emerald-500" />;
            case 'tournament': return <Trophy size={24} className="text-emerald-500" />;
            case 'online': return <Globe size={24} className="text-emerald-500" />;
            default: return <Settings size={24} className="text-emerald-500" />;
        }
    };

    // Settings adjustment handlers
    const adjustTimePerTurn = (delta) => {
        setGameSettings(prev => ({
            ...prev,
            timePerTurn: Math.max(0, prev.timePerTurn + delta)
        }));
    };

    const adjustTimePerPlayer = (delta) => {
        setGameSettings(prev => ({
            ...prev,
            timePerPlayer: Math.max(0, prev.timePerPlayer + delta)
        }));
    };

    return (
        <div className="flex-1 flex flex-col w-full h-full bg-background text-foreground">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={() => navigate('/games')}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-[60px] h-[60px] bg-gradient-to-br from-slate-50 to-slate-200 rounded-xl p-2 flex items-center justify-center border-2 border-border">
                        <svg viewBox="0 0 60 60" className="w-full h-full">
                            <line x1="20" y1="10" x2="20" y2="50" stroke="#10b981" strokeWidth="3" />
                            <line x1="40" y1="10" x2="40" y2="50" stroke="#10b981" strokeWidth="3" />
                            <line x1="10" y1="20" x2="50" y2="20" stroke="#10b981" strokeWidth="3" />
                            <line x1="10" y1="40" x2="50" y2="40" stroke="#10b981" strokeWidth="3" />
                            <g stroke="#10b981" strokeWidth="3" strokeLinecap="round">
                                <line x1="12" y1="27" x2="17" y2="32" />
                                <line x1="17" y1="27" x2="12" y2="32" />
                            </g>
                            <circle cx="45" cy="30" r="5" fill="none" stroke="#64748b" strokeWidth="3" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">Tic Tac Toe</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">Xếp 3 ký hiệu thành hàng để chiến thắng</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Three Column Layout */}
            <div className="flex-1 flex gap-6 p-6 overflow-y-auto max-lg:flex-col">
                {/* Left Side - Leaderboard */}
                <div className="w-72 flex-shrink-0 max-lg:w-full max-lg:order-2">
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h3 className="text-base font-semibold text-foreground mb-4 m-0">Bảng xếp hạng</h3>
                        <div className="flex flex-col gap-2">
                            {sampleLeaderboard.map((player) => (
                                <div
                                    key={player.rank}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent
                                        ${player.rank <= 3 ? 'bg-yellow-500/15' : ''}`}
                                >
                                    <div className="w-7 text-center">
                                        {getRankIcon(player.rank)}
                                    </div>
                                    <div className="text-xl">
                                        {player.flag}
                                    </div>
                                    <span className="flex-1 text-sm font-medium text-foreground">{player.name}</span>
                                    <span className="text-sm font-semibold text-muted-foreground">{player.score.toLocaleString()}</span>
                                </div>
                            ))}

                            {/* Current User */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/15 to-transparent border border-emerald-500/30 mt-2">
                                <div className="w-7 text-center">
                                    <span className="text-sm font-semibold text-emerald-500">{currentUserRank.rank}.</span>
                                </div>
                                <div className="text-xl">🎮</div>
                                <span className="flex-1 text-sm font-medium text-foreground">{currentUserRank.name}</span>
                                <span className="text-sm font-semibold text-muted-foreground">{currentUserRank.score.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="w-full py-3 mt-2 bg-transparent border-none text-emerald-500 text-sm font-medium cursor-pointer hover:text-emerald-600 transition-colors">
                            Xem tất cả
                        </button>

                        <div className="text-center pt-3 border-t border-border mt-2">
                            <span className="block text-xs text-muted-foreground mb-2">Bảng xếp hạng ngày, kết thúc sau</span>
                            <div className="flex items-center justify-center gap-1 font-mono text-xl font-semibold text-foreground">
                                <span>{String(countdown.hours).padStart(2, '0')}</span>
                                <span className="text-muted-foreground">:</span>
                                <span>{String(countdown.minutes).padStart(2, '0')}</span>
                                <span className="text-muted-foreground">:</span>
                                <span>{String(countdown.seconds).padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center - Play Modes */}
                <div className="flex-1 max-w-[400px] max-lg:max-w-full max-lg:order-1">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                className="flex-1 flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-emerald-500"
                                onClick={handlePlayWithFriend}
                            >
                                <Users size={20} />
                                <span className="flex-1 text-left">Chơi với bạn bè</span>
                            </button>
                            <button
                                className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={(e) => openSettings('friend', e)}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="flex-1 flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-base font-medium cursor-pointer transition-all hover:bg-emerald-500/20"
                                onClick={handlePlayVsRobot}
                            >
                                <Bot size={20} />
                                <span className="flex-1 text-left">Chơi với máy</span>
                            </button>
                            <button
                                className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={(e) => openSettings('robot', e)}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="flex-1 flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-emerald-500"
                                onClick={handleCreateTournament}
                            >
                                <Trophy size={20} />
                                <span className="flex-1 text-left">Tạo giải đấu</span>
                            </button>
                        </div>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-emerald-600 hover:to-emerald-700"
                            onClick={handlePlayOnline}
                        >
                            <Globe size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span className="font-semibold">Chơi online</span>
                                <span className="text-xs opacity-80">với người chơi ngẫu nhiên</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Side - Reviews */}
                <div className="w-72 flex-shrink-0 max-lg:w-full max-lg:order-3">
                    <GameReviews gameId={3} />
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                {isCustomMode && (
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all mr-1"
                                        onClick={() => setIsCustomMode(false)}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                {getModeIcon()}
                                <h2 className="text-lg font-bold text-foreground m-0">{getModeTitle()}</h2>
                            </div>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={() => { setShowSettingsModal(false); setIsCustomMode(false); }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Game Info */}
                        <div className="px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-50 to-slate-200 rounded-lg p-1.5 flex items-center justify-center">
                                    <svg viewBox="0 0 60 60" className="w-full h-full">
                                        <line x1="20" y1="10" x2="20" y2="50" stroke="#10b981" strokeWidth="4" />
                                        <line x1="40" y1="10" x2="40" y2="50" stroke="#10b981" strokeWidth="4" />
                                        <line x1="10" y1="20" x2="50" y2="20" stroke="#10b981" strokeWidth="4" />
                                        <line x1="10" y1="40" x2="50" y2="40" stroke="#10b981" strokeWidth="4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground m-0">Tic Tac Toe</p>
                                    <p className="text-xs text-muted-foreground m-0">Xếp 3 ký hiệu thành hàng để chiến thắng</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Content */}
                        <div className="px-6 py-5 space-y-4">
                            {!isCustomMode ? (
                                <>
                                    {/* Current Settings Summary */}
                                    <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Board size:</span>
                                            <span className="font-semibold text-foreground">{gameSettings.boardSize}x{gameSettings.boardSize}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Time per turn:</span>
                                            <span className="font-semibold text-foreground">{formatTime(gameSettings.timePerTurn)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Minutes per player:</span>
                                            <span className="font-semibold text-foreground">{formatTime(gameSettings.timePerPlayer)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Who plays first?</span>
                                            <span className="font-semibold text-foreground">
                                                {gameSettings.firstPlayer === 'random' ? 'Random' :
                                                    gameSettings.firstPlayer === 'player' ? 'Bạn' : 'Máy'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Difficulty:</span>
                                            <span className={`font-semibold ${gameSettings.difficulty === 'easy' ? 'text-green-500' :
                                                gameSettings.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                                }`}>
                                                {gameSettings.difficulty === 'easy' ? 'Dễ' :
                                                    gameSettings.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            className="flex-1 py-2.5 bg-secondary rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all"
                                            onClick={handleSetUnlimitedTime}
                                        >
                                            Set unlimited time
                                        </button>
                                        <button
                                            className="flex-1 py-2.5 bg-secondary rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all"
                                            onClick={() => setIsCustomMode(true)}
                                        >
                                            Custom options
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Custom Settings Editor */}
                                    <div className="space-y-4">
                                        {/* Board Size */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Board size:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {[3, 5].map(size => (
                                                    <button
                                                        key={size}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.boardSize === size
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-secondary text-foreground hover:bg-accent'
                                                            }`}
                                                        onClick={() => setGameSettings(prev => ({ ...prev, boardSize: size }))}
                                                    >
                                                        {size}x{size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Time per Turn */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Time per turn:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-accent transition-all"
                                                    onClick={() => adjustTimePerTurn(-10)}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="text-sm font-semibold text-foreground w-24 text-center">
                                                    {formatTime(gameSettings.timePerTurn)}
                                                </span>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-accent transition-all"
                                                    onClick={() => adjustTimePerTurn(10)}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Minutes per Player */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Minutes per player:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-accent transition-all"
                                                    onClick={() => adjustTimePerPlayer(-60)}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="text-sm font-semibold text-foreground w-24 text-center">
                                                    {formatTime(gameSettings.timePerPlayer)}
                                                </span>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-accent transition-all"
                                                    onClick={() => adjustTimePerPlayer(60)}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Who Plays First */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shuffle size={16} className="text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Who plays first?</span>
                                            </div>
                                            <select
                                                className="px-3 py-2 bg-secondary rounded-lg text-foreground text-sm font-medium border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={gameSettings.firstPlayer}
                                                onChange={(e) => setGameSettings(prev => ({ ...prev, firstPlayer: e.target.value }))}
                                            >
                                                <option value="random">Random</option>
                                                <option value="player">Bạn đi trước</option>
                                                <option value="ai">Máy đi trước</option>
                                            </select>
                                        </div>

                                        {/* Difficulty */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Trophy size={16} className="text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Độ khó:</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[
                                                    { key: 'easy', label: 'Dễ', color: 'text-green-500 bg-green-500' },
                                                    { key: 'medium', label: 'TB', color: 'text-yellow-500 bg-yellow-500' },
                                                    { key: 'hard', label: 'Khó', color: 'text-red-500 bg-red-500' }
                                                ].map(diff => (
                                                    <button
                                                        key={diff.key}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.difficulty === diff.key
                                                            ? `${diff.color} text-white`
                                                            : 'bg-secondary text-foreground hover:bg-accent'
                                                            }`}
                                                        onClick={() => setGameSettings(prev => ({ ...prev, difficulty: diff.key }))}
                                                    >
                                                        {diff.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Reset */}
                                    <button
                                        className="w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                        onClick={() => setGameSettings(DEFAULT_SETTINGS)}
                                    >
                                        Đặt lại mặc định
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border bg-secondary/30">
                            <button
                                className="w-full py-3 bg-emerald-500 rounded-xl text-sm font-semibold text-white hover:bg-emerald-600 transition-all"
                                onClick={handleSaveSettings}
                            >
                                {isCustomMode ? 'Áp dụng & Bắt đầu' : 'Lưu cài đặt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicTacToeLobby;


