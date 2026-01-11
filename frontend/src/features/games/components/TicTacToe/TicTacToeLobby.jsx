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
        if (rank === 1) return <Crown className="rank-icon gold" size={16} />;
        if (rank === 2) return <Medal className="rank-icon silver" size={16} />;
        if (rank === 3) return <Medal className="rank-icon bronze" size={16} />;
        return <span className="rank-number">{rank}.</span>;
    };

    return (
        <div className="game-lobby">
            {/* Header */}
            <div className="lobby-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="game-banner">
                    <div className="game-icon">
                        <svg viewBox="0 0 60 60" className="game-icon-svg">
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
                    <div className="game-info">
                        <h1>Tic Tac Toe</h1>
                        <p>Xếp 3 ký hiệu thành hàng để chiến thắng</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="lobby-content">
                {/* Left Side - Play Modes */}
                <div className="lobby-left">
                    {/* Play Modes */}
                    <div className="play-modes">
                        <button className="play-mode-btn" onClick={handlePlayWithFriend}>
                            <Users size={20} />
                            <span>Chơi với bạn bè</span>
                            <Settings size={16} className="settings-icon" />
                        </button>

                        <button className="play-mode-btn" onClick={handlePlayVsRobot}>
                            <Bot size={20} />
                            <span>Chơi với máy</span>
                            <Settings size={16} className="settings-icon" />
                        </button>

                        <button className="play-mode-btn" onClick={handleCreateTournament}>
                            <Trophy size={20} />
                            <span>Tạo giải đấu</span>
                        </button>

                        <button className="play-mode-btn primary" onClick={handlePlayOnline}>
                            <Globe size={20} />
                            <div className="btn-text">
                                <span className="main-text">Chơi online</span>
                                <span className="sub-text">với người chơi ngẫu nhiên</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Side - Leaderboard */}
                <div className="lobby-right">
                    <div className="leaderboard-section">
                        <h3 className="leaderboard-title">Bảng xếp hạng</h3>
                        <div className="leaderboard-list">
                            {sampleLeaderboard.map((player) => (
                                <div key={player.rank} className={`leaderboard-item ${player.rank <= 3 ? 'top3' : ''}`}>
                                    <div className="player-rank">
                                        {getRankIcon(player.rank)}
                                    </div>
                                    <div className="player-avatar-small">
                                        {player.flag}
                                    </div>
                                    <span className="player-name">{player.name}</span>
                                    <span className="player-score">{player.score.toLocaleString()}</span>
                                </div>
                            ))}

                            {/* Current User */}
                            <div className="leaderboard-item current-user">
                                <div className="player-rank highlight">
                                    <span className="rank-number">{currentUserRank.rank}.</span>
                                </div>
                                <div className="player-avatar-small">🎮</div>
                                <span className="player-name">{currentUserRank.name}</span>
                                <span className="player-score">{currentUserRank.score.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="see-all-btn">Xem tất cả</button>

                        <div className="leaderboard-timer">
                            <span className="timer-label">Bảng xếp hạng ngày, kết thúc sau</span>
                            <div className="timer-countdown">
                                <span>{String(countdown.hours).padStart(2, '0')}</span>
                                <span className="separator">:</span>
                                <span>{String(countdown.minutes).padStart(2, '0')}</span>
                                <span className="separator">:</span>
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
