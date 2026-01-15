import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Trophy, Globe, Settings, ArrowLeft, Crown, Medal } from 'lucide-react';

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

const TicTacToeLobby = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState({ hours: 1, minutes: 48, seconds: 32 });
    const [currentUserRank, setCurrentUserRank] = useState({ rank: 1385, name: 'You', score: 1002 });

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

    const handlePlayVsRobot = () => {
        navigate('/games/tic-tac-toe/play');
    };

    const handlePlayWithFriend = () => {
        // TODO: Implement multiplayer
        alert('Tính năng chơi với bạn bè đang được phát triển!');
    };

    const handlePlayOnline = () => {
        // TODO: Implement online matchmaking
        alert('Tính năng chơi online đang được phát triển!');
    };

    const handleCreateTournament = () => {
        // TODO: Implement tournament creation
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

            {/* Main Content - Two Column Layout */}
            <div className="flex-1 flex gap-8 p-6 overflow-y-auto max-md:flex-col">
                {/* Left Side - Play Modes */}
                <div className="flex-1 max-w-[400px] max-md:max-w-full">
                    {/* Play Modes */}
                    <div className="flex flex-col gap-3">
                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-emerald-500"
                            onClick={handlePlayWithFriend}
                        >
                            <Users size={20} />
                            <span className="flex-1 text-left">Chơi với bạn bè</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-emerald-500"
                            onClick={handlePlayVsRobot}
                        >
                            <Bot size={20} />
                            <span className="flex-1 text-left">Chơi với máy</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-emerald-500"
                            onClick={handleCreateTournament}
                        >
                            <Trophy size={20} />
                            <span className="flex-1 text-left">Tạo giải đấu</span>
                        </button>

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
            </div>
        </div>
    );
};

export default TicTacToeLobby;
