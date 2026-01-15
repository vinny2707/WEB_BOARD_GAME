import React from 'react';
import { CaroGame, gomokuAI } from '../shared';

// Board size: 15x15 = 225 cells
// Index formula: row * 15 + col (0-indexed)
// Center of board: row=7, col=7 -> index = 7*15+7 = 112
const BOARD_SIZE = 15;
const CENTER = 7 * BOARD_SIZE + 7; // 112

// Helper to convert row, col to index
const pos = (row, col) => row * BOARD_SIZE + col;

// Tutorial steps for Gomoku (Caro 5 hàng) - Kịch bản đơn giản hóa
const GOMOKU_TUTORIAL_STEPS = [
    {
        id: 1,
        title: "Chào mừng đến với Caro 5 Hàng! 🎯",
        message: "Mục tiêu: Tạo 5 quân liên tiếp theo hàng ngang, dọc hoặc chéo để thắng. Bạn là X (xanh), máy là O (xám).",
        action: "click_next",
        highlightCells: [],
        allowedMoves: [],
    },
    {
        id: 2,
        title: "Bước 1: Chiếm trung tâm! ✖️",
        message: "Ô giữa bàn cờ là vị trí chiến lược nhất! Nhấn vào ô được đánh dấu.",
        action: "click_cell",
        highlightCells: [CENTER], // 112
        allowedMoves: [CENTER],
        boardState: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
    },
    {
        id: 3,
        title: "Bước 2: Mở rộng theo đường chéo! ↗️",
        message: "Máy đã đánh O. Hãy tiếp tục phát triển theo đường chéo - đánh X vào ô tiếp theo!",
        action: "click_cell",
        highlightCells: [pos(6, 8)], // Trên phải của center
        allowedMoves: [pos(6, 8)],
        boardState: (() => {
            const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
            b[CENTER] = 'X';         // Giữa
            b[pos(7, 6)] = 'O';      // O đánh bên trái
            return b;
        })(),
    },
    {
        id: 4,
        title: "Bước 3: Tiếp tục đường chéo! ↗️",
        message: "Tốt lắm! Tiếp tục mở rộng đường chéo để tạo 5 quân liên tiếp!",
        action: "click_cell",
        highlightCells: [pos(5, 9)], // Tiếp theo đường chéo
        allowedMoves: [pos(5, 9)],
        boardState: (() => {
            const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
            b[CENTER] = 'X';         // 7,7
            b[pos(6, 8)] = 'X';      // 6,8
            b[pos(7, 6)] = 'O';      // O1
            b[pos(8, 6)] = 'O';      // O2 - bắt đầu tạo đường dọc
            return b;
        })(),
    },
    {
        id: 5,
        title: "Bước 4: Chặn đối thủ! 🛡️",
        message: "Cẩn thận! O đang tạo đường dọc (đã có 3 quân). Phải chặn ngay! Đánh X vào ô được đánh dấu!",
        action: "click_cell",
        highlightCells: [pos(6, 6)], // Chặn đường dọc của O
        allowedMoves: [pos(6, 6)],
        boardState: (() => {
            const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
            b[CENTER] = 'X';         // 7,7
            b[pos(6, 8)] = 'X';      // 6,8
            b[pos(5, 9)] = 'X';      // 5,9
            b[pos(7, 6)] = 'O';      // O1 - 7,6
            b[pos(8, 6)] = 'O';      // O2 - 8,6
            b[pos(9, 6)] = 'O';      // O3 - 9,6 (3 quân dọc!)
            return b;
        })(),
    },
    {
        id: 6,
        title: "Bước 5: Quay lại tấn công! ⚔️",
        message: "Đã chặn thành công! Giờ tiếp tục đường chéo của bạn. Đánh X!",
        action: "click_cell",
        highlightCells: [pos(4, 10)], // Tiếp tục chéo
        allowedMoves: [pos(4, 10)],
        boardState: (() => {
            const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
            b[CENTER] = 'X';         // 7,7
            b[pos(6, 8)] = 'X';      // 6,8
            b[pos(5, 9)] = 'X';      // 5,9
            b[pos(6, 6)] = 'X';      // Đã chặn
            b[pos(7, 6)] = 'O';
            b[pos(8, 6)] = 'O';
            b[pos(9, 6)] = 'O';
            b[pos(8, 8)] = 'O';      // O đánh thêm
            return b;
        })(),
    },
    {
        id: 7,
        title: "Bước 6: Chiến thắng! 🏆",
        message: "Hoàn hảo! Đánh X vào ô cuối cùng để hoàn thành 5 quân chéo và thắng!",
        action: "click_cell",
        highlightCells: [pos(3, 11)], // Vị trí để hoàn thành 5 quân chéo
        allowedMoves: [pos(3, 11)],
        boardState: (() => {
            const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
            b[CENTER] = 'X';         // 7,7
            b[pos(6, 8)] = 'X';      // 6,8
            b[pos(5, 9)] = 'X';      // 5,9
            b[pos(4, 10)] = 'X';     // 4,10
            b[pos(6, 6)] = 'X';      // Đã chặn
            b[pos(7, 6)] = 'O';
            b[pos(8, 6)] = 'O';
            b[pos(9, 6)] = 'O';
            b[pos(8, 8)] = 'O';
            b[pos(10, 6)] = 'O';     // O cố đánh tiếp
            return b;
        })(),
    },
    {
        id: 8,
        title: "Chiến thắng! 🎉",
        message: "Xuất sắc! Bạn đã tạo 5 X liên tiếp theo đường chéo! Bí quyết: Chiếm giữa → Mở rộng → Chặn khi cần thiết!",
        action: "click_next",
        highlightCells: [
            pos(3, 11), pos(4, 10), pos(5, 9), pos(6, 8), CENTER
        ],
        allowedMoves: [],
        boardState: (() => {
            const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
            // Đường thắng chéo: (7,7) -> (6,8) -> (5,9) -> (4,10) -> (3,11)
            b[CENTER] = 'X';         // 7,7
            b[pos(6, 8)] = 'X';      // 6,8
            b[pos(5, 9)] = 'X';      // 5,9
            b[pos(4, 10)] = 'X';     // 4,10
            b[pos(3, 11)] = 'X';     // 3,11 - WIN!
            b[pos(6, 6)] = 'X';      // Đã chặn
            b[pos(7, 6)] = 'O';
            b[pos(8, 6)] = 'O';
            b[pos(9, 6)] = 'O';
            b[pos(8, 8)] = 'O';
            b[pos(10, 6)] = 'O';
            return b;
        })(),
    },
    {
        id: 9,
        title: "Hoàn thành! 🚀",
        message: "Mẹo quan trọng: 1) Luôn chặn khi thấy 3+ quân liên tiếp. 2) Tạo 'đôi' (2 đường cùng lúc) để đối thủ không thể chặn. Chúc may mắn!",
        action: "finish",
        highlightCells: [],
        allowedMoves: [],
    }
];

const GomokuGame = () => {
    return (
        <CaroGame
            gameName="CARO 5 HÀNG"
            lobbyPath="/games/gomoku"
            ai={gomokuAI}
            theme="emerald"
            tutorialSteps={GOMOKU_TUTORIAL_STEPS}
        />
    );
};

export default GomokuGame;
