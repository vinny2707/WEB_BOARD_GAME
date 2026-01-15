import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Trophy, Globe, Settings, ArrowLeft, Crown, Medal } from 'lucide-react';

/**
 * Shared Lobby component for Caro games
 * @param {Object} props
 * @param {string} props.gameName - Display name
 * @param {string} props.gameDescription - Description
 * @param {string} props.playPath - Path to play (e.g., "/games/gomoku/play")
 * @param {string} props.gamesPath - Path to games list (default "/games")
 * @param {Array} props.leaderboard - Leaderboard data
 * @param {Object} props.currentUser - Current user rank info
 * @param {string} props.theme - 'emerald' or 'amber'
 * @param {React.ReactNode} props.icon - Icon component
 */
const CaroLobby = ({
    gameName,
    gameDescription,
    playPath,
    gamesPath = '/games',
    leaderboard = [],
    currentUser = { rank: 999, name: 'You', score: 1000 },
    theme = 'emerald',
    icon
}) => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState({ hours: 2, minutes: 15, seconds: 45 });

    const themeColors = {
        emerald: {
            iconBg: 'from-emerald-200 to-emerald-400',
            primary: 'from-emerald-500 to-emerald-600',
            primaryHover: 'hover:from-emerald-600 hover:to-emerald-700',
            border: 'border-emerald-500',
            hoverBorder: 'hover:border-emerald-500',
            text: 'text-emerald-500',
            textHover: 'hover:text-emerald-600',
            userBg: 'from-emerald-500/15',
            userBorder: 'border-emerald-500/30',
        },
        amber: {
            iconBg: 'from-amber-300 to-amber-500',
            primary: 'from-amber-500 to-amber-600',
            primaryHover: 'hover:from-amber-600 hover:to-amber-700',
            border: 'border-amber-500',
            hoverBorder: 'hover:border-amber-500',
            text: 'text-amber-500',
            textHover: 'hover:text-amber-600',
            userBg: 'from-amber-500/15',
            userBorder: 'border-amber-500/30',
        }
    };

    const colors = themeColors[theme] || themeColors.emerald;

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
        navigate(playPath);
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
                    onClick={() => navigate(gamesPath)}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                    <div className={`w-[60px] h-[60px] bg-gradient-to-br ${colors.iconBg} rounded-xl p-2 flex items-center justify-center border-2 border-border`}>
                        {icon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">{gameName}</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">{gameDescription}</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="flex-1 flex gap-8 p-6 overflow-y-auto max-md:flex-col">
                {/* Left Side - Play Modes */}
                <div className="flex-1 max-w-[400px] max-md:max-w-full">
                    <div className="flex flex-col gap-3">
                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent ${colors.hoverBorder}`}
                            onClick={handlePlayWithFriend}
                        >
                            <Users size={20} />
                            <span className="flex-1 text-left">Chơi với bạn bè</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent ${colors.hoverBorder}`}
                            onClick={handlePlayVsRobot}
                        >
                            <Bot size={20} />
                            <span className="flex-1 text-left">Chơi với máy</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent ${colors.hoverBorder}`}
                            onClick={handleCreateTournament}
                        >
                            <Trophy size={20} />
                            <span className="flex-1 text-left">Tạo giải đấu</span>
                        </button>

                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${colors.primary} ${colors.border} rounded-xl text-white text-base font-medium cursor-pointer transition-all ${colors.primaryHover}`}
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
                            {leaderboard.map((player) => (
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
                            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r ${colors.userBg} to-transparent border ${colors.userBorder} mt-2`}>
                                <div className="w-7 text-center">
                                    <span className={`text-sm font-semibold ${colors.text}`}>{currentUser.rank}.</span>
                                </div>
                                <div className="text-xl">🎮</div>
                                <span className="flex-1 text-sm font-medium text-foreground">{currentUser.name}</span>
                                <span className="text-sm font-semibold text-muted-foreground">{currentUser.score.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className={`w-full py-3 mt-2 bg-transparent border-none ${colors.text} text-sm font-medium cursor-pointer ${colors.textHover} transition-colors`}>
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

export default CaroLobby;
