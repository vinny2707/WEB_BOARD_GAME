import React from 'react';

/**
 * Player Card Component - Hiển thị thông tin người chơi
 * @param {string} name - Tên người chơi
 * @param {string} symbol - 'X' hoặc 'O'
 * @param {string} avatar - Emoji avatar
 * @param {boolean} isActive - Đang đến lượt?
 * @param {string} timer - Thời gian còn lại
 * @param {boolean} isLeft - Hiển thị bên trái?
 * @param {string} theme - 'emerald' hoặc 'amber'
 */
export const PlayerCard = ({ name, symbol, avatar, isActive, timer, isLeft, theme }) => {
    const borderColor = theme === 'amber' ? 'border-amber-500' : 'border-emerald-500';
    const shadowColor = theme === 'amber'
        ? 'shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
        : 'shadow-[0_0_0_3px_rgba(16,185,129,0.2)]';
    const symbolBg = symbol === 'X'
        ? (theme === 'amber' ? 'bg-amber-500/15' : 'bg-emerald-500/15')
        : 'bg-slate-500/15';
    const symbolColor = symbol === 'X'
        ? (theme === 'amber' ? 'bg-amber-500' : 'bg-emerald-500')
        : 'bg-slate-500';

    return (
        <div className={`flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl border-2 transition-all min-w-[140px]
            ${isActive ? `${borderColor} ${shadowColor}` : 'border-transparent'}
            ${isLeft ? '' : 'flex-row-reverse text-right'}`}
        >
            <div className="w-10 h-10 flex items-center justify-center bg-card rounded-full text-xl shadow-sm">
                {avatar}
            </div>
            <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{name}</div>
                <div className="font-mono text-xs text-muted-foreground">{timer}</div>
            </div>
            <div className={`w-7 h-7 flex items-center justify-center rounded-md ${symbolBg}`}>
                <div className={`w-5 h-5 rounded-full ${symbolColor}`} />
            </div>
        </div>
    );
};

/**
 * Score Display Component - Hiển thị điểm số
 * @param {number} playerScore - Điểm người chơi
 * @param {number} aiScore - Điểm AI
 * @param {string} theme - 'emerald' hoặc 'amber'
 */
export const ScoreDisplay = ({ playerScore, aiScore, theme }) => {
    const playerColor = theme === 'amber' ? 'text-amber-500' : 'text-emerald-500';
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-foreground rounded-full">
            <span className={`font-mono text-xl font-bold ${playerColor}`}>{playerScore}</span>
            <span className="font-bold text-background">-</span>
            <span className="font-mono text-xl font-bold text-orange-500">{aiScore}</span>
        </div>
    );
};

export default PlayerCard;
