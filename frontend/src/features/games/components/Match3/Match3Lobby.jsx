import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Globe, ArrowLeft, Crown, Medal, Gamepad2, Star, Settings, X, ChevronLeft } from 'lucide-react';

// Default game settings
const DEFAULT_SETTINGS = {
    boardSize: 8,
    moves: 30,
    targetScore: 5000,
    difficulty: 'medium', // easy: 5 types, medium: 6 types, hard: 7 types
};

const DIFFICULTY_SETTINGS = {
    easy: { candyTypes: 5, label: 'Dễ' },
    medium: { candyTypes: 6, label: 'Trung Bình' },
    hard: { candyTypes: 7, label: 'Khó' }
};

// Sample leaderboard data
const sampleLeaderboard = [
    { rank: 1, name: 'CandyKing', score: 158420, flag: '🇻🇳' },
    { rank: 2, name: 'SweetPro', score: 142308, flag: '🇰🇷' },
    { rank: 3, name: 'MatchMaster', score: 128579, flag: '🇨🇳' },
    { rank: 4, name: 'ComboQueen', score: 115520, flag: '🇯🇵' },
    { rank: 5, name: 'CrushLord', score: 98792, flag: '🇺🇸' },
    { rank: 6, name: 'SugarRush', score: 85091, flag: '🇫🇷' },
    { rank: 7, name: 'GemHunter', score: 72081, flag: '🇬🇧' },
    { rank: 8, name: 'Matcher99', score: 65514, flag: '🇩🇪' },
];

const Match3Lobby = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState({ hours: 2, minutes: 15, seconds: 45 });
    const [currentUserRank, setCurrentUserRank] = useState({ rank: 324, name: 'You', score: 45680 });
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('match3HighScore');
        return saved ? parseInt(saved, 10) : 0;
    });

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState({ ...DEFAULT_SETTINGS });
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

    const openSettings = (e) => {
        e?.stopPropagation();
        setIsCustomMode(false);
        setShowSettingsModal(true);
    };

    const handleSaveSettings = () => {
        setShowSettingsModal(false);
        setIsCustomMode(false);
    };

    const handlePlayNow = () => {
        navigate('/games/match3/play', { state: { settings: gameSettings } });
    };

    const handlePlayWithFriend = () => {
        alert('Tính năng chơi với bạn bè đang được phát triển!');
    };

    const handlePlayOnline = () => {
        alert('Tính năng chơi online đang được phát triển!');
    };

    const handleCreateTournament = () => {
        alert('Tính năng tạo giải đấu đang được phát triển!');
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-orange-400" size={16} />;
        if (rank === 2) return <Medal className="text-gray-400" size={16} />;
        if (rank === 3) return <Medal className="text-amber-700" size={16} />;
        return <span className="text-sm text-muted-foreground">{rank}.</span>;
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
                    <div className="w-[60px] h-[60px] bg-gradient-to-br from-pink-300 to-purple-500 rounded-xl p-2 flex items-center justify-center border-2 border-border text-3xl">
                        🍬
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">Ghép Hàng 3</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">Ghép 3 viên kẹo giống nhau!</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="flex-1 flex gap-8 p-6 overflow-y-auto max-md:flex-col">
                {/* Left Side - Play Modes */}
                <div className="flex-1 max-w-[400px] max-md:max-w-full">
                    <div className="flex flex-col gap-3">
                        {/* High Score Display */}
                        {highScore > 0 && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-yellow-500/15 to-transparent border border-yellow-500/30 rounded-xl">
                                <Trophy className="text-yellow-500" size={24} />
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground">Điểm cao nhất của bạn</div>
                                    <div className="text-xl font-bold text-yellow-500">{highScore.toLocaleString()}</div>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3].map(i => (
                                        <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Play Now Button with Settings */}
                        <div className="flex items-center gap-2">
                            <button
                                className="flex-1 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-pink-500 to-purple-600 border border-pink-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-pink-600 hover:to-purple-700"
                                onClick={handlePlayNow}
                            >
                                <Gamepad2 size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Chơi ngay</span>
                                    <span className="text-xs opacity-80">{gameSettings.moves} lượt - Mục tiêu {gameSettings.targetScore.toLocaleString()} điểm</span>
                                </div>
                            </button>
                            <button
                                className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={openSettings}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500"
                            onClick={handlePlayWithFriend}
                        >
                            <Users size={20} />
                            <span className="flex-1 text-left">Chơi với bạn bè</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500"
                            onClick={handleCreateTournament}
                        >
                            <Trophy size={20} />
                            <span className="flex-1 text-left">Tạo giải đấu</span>
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500"
                            onClick={handlePlayOnline}
                        >
                            <Globe size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span>Chơi online</span>
                                <span className="text-xs text-muted-foreground">với người chơi ngẫu nhiên</span>
                            </div>
                        </button>
                    </div>

                    {/* How to Play */}
                    <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                        <h3 className="text-base font-semibold text-foreground mb-3">Cách chơi</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>🍬 Click vào một viên kẹo để chọn</li>
                            <li>↔️ Click vào viên kẹo bên cạnh để hoán đổi</li>
                            <li>✨ Ghép 3 viên kẹo giống nhau để ghi điểm</li>
                            <li>🔥 Tạo combo để nhân đôi điểm!</li>
                            <li>🎯 Đạt mục tiêu trước khi hết lượt</li>
                        </ul>
                    </div>
                </div>

                {/* Right Side - Leaderboard */}
                <div className="w-80 flex-shrink-0 max-md:w-full">
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
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500/15 to-transparent border border-pink-500/30 mt-2">
                                <div className="w-7 text-center">
                                    <span className="text-sm font-semibold text-pink-500">{currentUserRank.rank}.</span>
                                </div>
                                <div className="text-xl">🎮</div>
                                <span className="flex-1 text-sm font-medium text-foreground">{currentUserRank.name}</span>
                                <span className="text-sm font-semibold text-muted-foreground">{currentUserRank.score.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="w-full py-3 mt-2 bg-transparent border-none text-pink-500 text-sm font-medium cursor-pointer hover:text-pink-600 transition-colors">
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
                                <Gamepad2 size={20} className="text-pink-500" />
                                <h2 className="text-lg font-bold text-foreground m-0">
                                    {isCustomMode ? 'Tùy chỉnh cài đặt' : 'Cài đặt game'}
                                </h2>
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
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-500 rounded-lg p-1.5 flex items-center justify-center text-xl">
                                    🍬
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground m-0">Ghép Hàng 3</p>
                                    <p className="text-xs text-muted-foreground m-0">Ghép 3 viên kẹo giống nhau!</p>
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
                                            <span className="text-muted-foreground">Kích thước bàn:</span>
                                            <span className="font-semibold text-foreground">{gameSettings.boardSize}x{gameSettings.boardSize}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Số lượt chơi:</span>
                                            <span className="font-semibold text-foreground">{gameSettings.moves} lượt</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Mục tiêu điểm:</span>
                                            <span className="font-semibold text-foreground">{gameSettings.targetScore.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Độ khó:</span>
                                            <span className={`font-semibold ${gameSettings.difficulty === 'easy' ? 'text-green-500' :
                                                gameSettings.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                                }`}>
                                                {DIFFICULTY_SETTINGS[gameSettings.difficulty]?.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <button
                                        className="w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all"
                                        onClick={() => setIsCustomMode(true)}
                                    >
                                        Tùy chỉnh cài đặt
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Custom Settings Editor */}
                                    <div className="space-y-4">
                                        {/* Board Size */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Kích thước bàn:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {[6, 8, 10].map(size => (
                                                    <button
                                                        key={size}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.boardSize === size
                                                            ? 'bg-pink-500 text-white'
                                                            : 'bg-secondary text-foreground hover:bg-accent'
                                                            }`}
                                                        onClick={() => setGameSettings(prev => ({ ...prev, boardSize: size }))}
                                                    >
                                                        {size}x{size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Moves */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Số lượt:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {[20, 30, 40, 50].map(moves => (
                                                    <button
                                                        key={moves}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.moves === moves
                                                            ? 'bg-pink-500 text-white'
                                                            : 'bg-secondary text-foreground hover:bg-accent'
                                                            }`}
                                                        onClick={() => setGameSettings(prev => ({ ...prev, moves }))}
                                                    >
                                                        {moves}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Target Score */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Mục tiêu:</span>
                                            </div>
                                            <div className="flex items-center gap-1 flex-wrap justify-end">
                                                {[3000, 5000, 8000, 10000].map(score => (
                                                    <button
                                                        key={score}
                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${gameSettings.targetScore === score
                                                            ? 'bg-pink-500 text-white'
                                                            : 'bg-secondary text-foreground hover:bg-accent'
                                                            }`}
                                                        onClick={() => setGameSettings(prev => ({ ...prev, targetScore: score }))}
                                                    >
                                                        {score.toLocaleString()}
                                                    </button>
                                                ))}
                                            </div>
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
                                        className="w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                        onClick={() => setGameSettings({ ...DEFAULT_SETTINGS })}
                                    >
                                        Đặt lại mặc định
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border">
                            <button
                                className="w-full py-3 bg-pink-500 rounded-xl text-white text-sm font-semibold hover:bg-pink-600 transition-all shadow-md"
                                onClick={handleSaveSettings}
                            >
                                {isCustomMode ? 'Áp dụng' : 'Lưu cài đặt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Match3Lobby;
