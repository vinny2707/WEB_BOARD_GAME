import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Globe, ArrowLeft, Crown, Medal, Gamepad2, Star, Settings } from 'lucide-react';

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

    const handlePlayNow = () => {
        navigate('/games/match3/play');
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

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-pink-500 to-purple-600 border border-pink-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-pink-600 hover:to-purple-700"
                            onClick={handlePlayNow}
                        >
                            <Gamepad2 size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span className="font-semibold">Chơi ngay</span>
                                <span className="text-xs opacity-80">30 lượt - Mục tiêu 5000 điểm</span>
                            </div>
                        </button>

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
        </div>
    );
};

export default Match3Lobby;
