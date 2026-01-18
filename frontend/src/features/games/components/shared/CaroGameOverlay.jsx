import React from 'react';
import { RotateCcw, ArrowLeft, BookOpen } from 'lucide-react';

/**
 * Idle Screen Overlay - Màn hình chờ trước khi bắt đầu game
 * @param {string} gameName - Tên game
 * @param {Object} colors - Object màu sắc theme
 * @param {function} startGame - Hàm bắt đầu game
 * @param {function} startTutorial - Hàm bắt đầu tutorial
 * @param {boolean} hasTutorial - Có tutorial không?
 */
export const CaroIdleScreen = ({
    gameName,
    colors,
    startGame,
    startTutorial,
    hasTutorial,
}) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 bg-card rounded-2xl shadow-lg border-2 border-border">
            <div className="text-3xl font-bold text-foreground mb-2">🎯 {gameName}</div>
            <button
                className={`flex items-center gap-2 px-6 py-3 ${colors.primary} rounded-xl text-white font-semibold ${colors.primaryHover} transition-all`}
                onClick={startGame}
            >
                <ArrowLeft size={20} className="rotate-180" />
                Bắt đầu chơi
            </button>
            {hasTutorial && (
                <button
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:bg-blue-600 transition-all"
                    onClick={startTutorial}
                >
                    <BookOpen size={20} />
                    Hướng dẫn chơi
                </button>
            )}
        </div>
    );
};

/**
 * Game Over Overlay - Overlay hiển thị khi game kết thúc (trong board)
 * @param {string} winner - 'X', 'O', hoặc null (hòa)
 * @param {string} statusMessage - Thông điệp trạng thái
 * @param {Object} colors - Object màu sắc theme
 * @param {function} onPlayAgain - Hàm chơi lại
 */
export const CaroGameOverOverlay = ({
    winner,
    statusMessage,
    colors,
    onPlayAgain,
}) => {
    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
            <div className={`text-3xl font-bold mb-2 ${winner === 'X' ? 'text-green-400' : winner === 'O' ? 'text-red-400' : 'text-yellow-400'}`}>
                {winner === 'X' ? '🎉 Chiến Thắng!' : winner === 'O' ? '💔 Thua Cuộc!' : '🤝 Hòa!'}
            </div>
            <div className="text-white text-lg mb-4">
                {statusMessage}
            </div>
            <button
                className={`flex items-center gap-2 px-6 py-3 ${colors.primary} rounded-xl text-white font-semibold ${colors.primaryHover} transition-all shadow-lg`}
                onClick={onPlayAgain}
            >
                <RotateCcw size={20} />
                Chơi lại
            </button>
        </div>
    );
};

export default CaroIdleScreen;
