import React from 'react';
import { CaroLobby } from '../shared';

// Sample leaderboard data
const leaderboard = [
    { rank: 1, name: 'GoMaster', score: 15420, flag: '🇻🇳' },
    { rank: 2, name: 'CaroPro', score: 12308, flag: '🇰🇷' },
    { rank: 3, name: 'WuZiQi', score: 9579, flag: '🇨🇳' },
    { rank: 4, name: 'FiveStone', score: 7520, flag: '🇯🇵' },
    { rank: 5, name: 'Renju99', score: 6792, flag: '🇺🇸' },
    { rank: 6, name: 'BlackStone', score: 5091, flag: '🇫🇷' },
    { rank: 7, name: 'GomokuKing', score: 4081, flag: '🇬🇧' },
    { rank: 8, name: 'Connect5', score: 3514, flag: '🇩🇪' },
];

const GomokuIcon = () => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
        <line x1="15" y1="15" x2="45" y2="15" stroke="#94a3b8" strokeWidth="1" />
        <line x1="15" y1="30" x2="45" y2="30" stroke="#94a3b8" strokeWidth="1" />
        <line x1="15" y1="45" x2="45" y2="45" stroke="#94a3b8" strokeWidth="1" />
        <line x1="15" y1="15" x2="15" y2="45" stroke="#94a3b8" strokeWidth="1" />
        <line x1="30" y1="15" x2="30" y2="45" stroke="#94a3b8" strokeWidth="1" />
        <line x1="45" y1="15" x2="45" y2="45" stroke="#94a3b8" strokeWidth="1" />
        <circle cx="15" cy="15" r="6" fill="#1a1a2e" />
        <circle cx="30" cy="30" r="6" fill="#1a1a2e" />
        <circle cx="45" cy="45" r="6" fill="#f8f8f8" stroke="#333" strokeWidth="1" />
        <circle cx="30" cy="15" r="6" fill="#f8f8f8" stroke="#333" strokeWidth="1" />
    </svg>
);

const GomokuLobby = () => {
    return (
        <CaroLobby
            gameName="Caro 5 Hàng"
            gameDescription="Xếp 5 quân liên tiếp để chiến thắng"
            playPath="/games/gomoku/play"
            leaderboard={leaderboard}
            currentUser={{ rank: 892, name: 'You', score: 2150 }}
            theme="emerald"
            icon={<GomokuIcon />}
        />
    );
};

export default GomokuLobby;
