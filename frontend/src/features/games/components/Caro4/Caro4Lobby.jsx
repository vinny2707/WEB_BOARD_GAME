import React from 'react';
import { CaroLobby } from '../shared';

// Sample leaderboard data
const leaderboard = [
    { rank: 1, name: 'Caro4Master', score: 12420, flag: '🇻🇳' },
    { rank: 2, name: 'Quick4', score: 10308, flag: '🇰🇷' },
    { rank: 3, name: 'FourWin', score: 8579, flag: '🇨🇳' },
    { rank: 4, name: 'Connect4Pro', score: 6520, flag: '🇯🇵' },
    { rank: 5, name: 'FastCaro', score: 5792, flag: '🇺🇸' },
    { rank: 6, name: 'Row4King', score: 4091, flag: '🇫🇷' },
    { rank: 7, name: 'Line4', score: 3081, flag: '🇬🇧' },
    { rank: 8, name: 'QuadWin', score: 2514, flag: '🇩🇪' },
];

const Caro4Icon = () => (
    <svg viewBox="0 0 60 60" className="w-full h-full">
        <line x1="15" y1="15" x2="45" y2="15" stroke="#94a3b8" strokeWidth="1" />
        <line x1="15" y1="30" x2="45" y2="30" stroke="#94a3b8" strokeWidth="1" />
        <line x1="15" y1="45" x2="45" y2="45" stroke="#94a3b8" strokeWidth="1" />
        <line x1="15" y1="15" x2="15" y2="45" stroke="#94a3b8" strokeWidth="1" />
        <line x1="30" y1="15" x2="30" y2="45" stroke="#94a3b8" strokeWidth="1" />
        <line x1="45" y1="15" x2="45" y2="45" stroke="#94a3b8" strokeWidth="1" />
        {/* 4 stones in a row */}
        <circle cx="15" cy="30" r="6" fill="#1a1a2e" />
        <circle cx="22.5" cy="30" r="6" fill="#1a1a2e" />
        <circle cx="30" cy="30" r="6" fill="#1a1a2e" />
        <circle cx="37.5" cy="30" r="6" fill="#1a1a2e" />
    </svg>
);

const Caro4Lobby = () => {
    return (
        <CaroLobby
            gameName="Caro 4 Hàng"
            gameDescription="Xếp 4 quân liên tiếp để chiến thắng"
            playPath="/games/caro4/play"
            leaderboard={leaderboard}
            currentUser={{ rank: 756, name: 'You', score: 1850 }}
            theme="amber"
            icon={<Caro4Icon />}
            defaultBoardSize={10}
            showBoardSizeSelector={true}
            gameId={2}
        />
    );
};

export default Caro4Lobby;
