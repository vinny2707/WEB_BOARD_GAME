import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Globe, ArrowLeft, Crown, Medal, Gamepad2, Star, Settings, Brain } from 'lucide-react';

const sampleLeaderboard = [
    { rank: 1, name: 'MemoryKing', time: 45, moves: 12, flag: '🇻🇳' },
    { rank: 2, name: 'BrainMaster', time: 52, moves: 14, flag: '🇰🇷' },
    { rank: 3, name: 'QuickMind', time: 58, moves: 15, flag: '🇨🇳' },
    { rank: 4, name: 'CardPro', time: 63, moves: 16, flag: '🇯🇵' },
    { rank: 5, name: 'SharpEye', time: 70, moves: 18, flag: '🇺🇸' },
    { rank: 6, name: 'MemLord', time: 75, moves: 19, flag: '🇫🇷' },
    { rank: 7, name: 'Matcher99', time: 82, moves: 21, flag: '🇬🇧' },
    { rank: 8, name: 'FlipKing', time: 88, moves: 23, flag: '🇩🇪' },
];

const MemoryLobby = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState({ hours: 3, minutes: 42, seconds: 18 });
    const [currentUserRank] = useState({ rank: 156, name: 'You', time: 95, moves: 24 });
    const [bestTime, setBestTime] = useState(null);
    const [bestMoves, setBestMoves] = useState(null);

    useEffect(() => {
        const savedTime = localStorage.getItem('memoryBestTime_4');
        const savedMoves = localStorage.getItem('memoryBestMoves_4');
        if (savedTime) setBestTime(parseInt(savedTime, 10));
        if (savedMoves) setBestMoves(parseInt(savedMoves, 10));
    }, []);

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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                    <div className="w-[60px] h-[60px] bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl p-2 flex items-center justify-center border-2 border-border">
                        <Brain size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">Cờ Trí Nhớ</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">Lật và ghép các cặp thẻ giống nhau!</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-8 p-6 overflow-y-auto max-md:flex-col">
                {/* Left Side - Play Modes */}
                <div className="flex-1 max-w-[400px] max-md:max-w-full">
                    <div className="flex flex-col gap-3">
                        {/* Best Score Display */}
                        {bestTime !== null && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-500/15 to-transparent border border-indigo-500/30 rounded-xl">
                                <Trophy className="text-indigo-500" size={24} />
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground">Kỷ lục của bạn (4x4)</div>
                                    <div className="text-xl font-bold text-indigo-500">{formatTime(bestTime)} | {bestMoves} lượt</div>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3].map(i => (
                                        <Star key={i} size={16} className="text-indigo-500 fill-indigo-500" />
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 border border-indigo-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-indigo-600 hover:to-purple-700"
                            onClick={() => navigate('/games/memory/play')}
                        >
                            <Gamepad2 size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span className="font-semibold">Chơi ngay</span>
                                <span className="text-xs opacity-80">Tìm các cặp thẻ giống nhau</span>
                            </div>
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-indigo-500"
                            onClick={() => alert('Tính năng chơi với bạn bè đang được phát triển!')}
                        >
                            <Users size={20} />
                            <span className="flex-1 text-left">Chơi với bạn bè</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-indigo-500"
                            onClick={() => alert('Tính năng tạo giải đấu đang được phát triển!')}
                        >
                            <Trophy size={20} />
                            <span className="flex-1 text-left">Tạo giải đấu</span>
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-indigo-500"
                            onClick={() => alert('Tính năng chơi online đang được phát triển!')}
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
                            <li>🃏 Click vào một thẻ để lật mở</li>
                            <li>🔍 Ghi nhớ vị trí các hình ảnh</li>
                            <li>🎯 Lật 2 thẻ giống nhau để ghép cặp</li>
                            <li>⏱️ Hoàn thành nhanh nhất có thể</li>
                            <li>🏆 Ít lượt lật = điểm cao hơn!</li>
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
                                        ${player.rank <= 3 ? 'bg-indigo-500/10' : ''}`}
                                >
                                    <div className="w-7 text-center">{getRankIcon(player.rank)}</div>
                                    <div className="text-xl">{player.flag}</div>
                                    <span className="flex-1 text-sm font-medium text-foreground">{player.name}</span>
                                    <span className="text-xs text-muted-foreground">{formatTime(player.time)}</span>
                                    <span className="text-sm font-semibold text-muted-foreground">{player.moves}L</span>
                                </div>
                            ))}

                            {/* Current User */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500/15 to-transparent border border-indigo-500/30 mt-2">
                                <div className="w-7 text-center">
                                    <span className="text-sm font-semibold text-indigo-500">{currentUserRank.rank}.</span>
                                </div>
                                <div className="text-xl">🎮</div>
                                <span className="flex-1 text-sm font-medium text-foreground">{currentUserRank.name}</span>
                                <span className="text-xs text-muted-foreground">{formatTime(currentUserRank.time)}</span>
                                <span className="text-sm font-semibold text-muted-foreground">{currentUserRank.moves}L</span>
                            </div>
                        </div>

                        <button className="w-full py-3 mt-2 bg-transparent border-none text-indigo-500 text-sm font-medium cursor-pointer hover:text-indigo-600 transition-colors">
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

export default MemoryLobby;
