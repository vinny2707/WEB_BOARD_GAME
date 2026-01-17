import React from "react";
import { CaroGame } from "../shared";

const BOARD_SIZE = 15;
// User dùng tọa độ 1-indexed, code dùng 0-indexed
const pos = (row, col) => (row - 1) * BOARD_SIZE + (col - 1);

// Kịch bản CHÍNH XÁC theo yêu cầu user - FIX 14/01/2026
const CARO4_TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Chào mừng đến với Caro 4 Hàng! 🎯",
    message:
      "Chỉ cần 4 quân liên tiếp để thắng! Hãy học các bước chơi thông minh.",
    action: "click_next",
    highlightCells: [],
    allowedMoves: [],
  },
  // BƯỚC 1: Khởi đầu - X tại (8,8)
  {
    id: 2,
    title: "Bước 1: Khởi đầu! ✖️",
    message: "Hãy đánh vào trung tâm (8,8) để kiểm soát bàn cờ.",
    action: "click_cell",
    highlightCells: [pos(8, 8)],
    allowedMoves: [pos(8, 8)],
    boardState: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
  },
  // BƯỚC 2: Tạo liên kết - O tại (6,6), X tại (9,8) → XX ngang
  {
    id: 3,
    title: "Bước 2: Tạo liên kết! ➡️",
    message: "Đánh gần quân của bạn để tạo liên kết. Đánh sang phải tại (9,8)!",
    action: "click_cell",
    highlightCells: [pos(9, 8)],
    allowedMoves: [pos(9, 8)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      b[pos(8, 8)] = "X"; // Quân đầu tiên của người chơi
      b[pos(6, 6)] = "O"; // Máy đi
      return b;
    })(),
  },
  // BƯỚC 3: Tấn công (Hàng 3) - O tại (5,5), X tại (10,8) → XXX ngang
  {
    id: 4,
    title: "Bước 3: Tấn công! ⚔️",
    message: "Tiếp tục nối dài hàng quân để gây áp lực. Đánh tại (10,8)!",
    action: "click_cell",
    highlightCells: [pos(10, 8)],
    allowedMoves: [pos(10, 8)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      b[pos(8, 8)] = "X"; // Quân 1
      b[pos(9, 8)] = "X"; // Quân 2
      b[pos(6, 6)] = "O"; // Máy đi lượt 1
      b[pos(5, 5)] = "O"; // Máy đi lượt 2
      return b;
    })(),
  },
  // BƯỚC 4: Phòng thủ bắt buộc - Máy tạo 3 quân dọc tại (12,5)(12,6)(12,7), X chặn tại (12,8)
  {
    id: 5,
    title: "Bước 4: Phòng thủ bắt buộc! 🛡️",
    message: "Cẩn thận! Đối thủ sắp có 4 quân. Hãy chặn ngay đầu ô (12,8)!",
    action: "click_cell",
    highlightCells: [pos(12, 8)],
    allowedMoves: [pos(12, 8)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      // X có 3 quân ngang
      b[pos(8, 8)] = "X";
      b[pos(9, 8)] = "X";
      b[pos(10, 8)] = "X";
      // O tạo 3 quân dọc đe dọa tại cột 12!
      b[pos(12, 5)] = "O";
      b[pos(12, 6)] = "O";
      b[pos(12, 7)] = "O";
      // O cũ
      b[pos(6, 6)] = "O";
      b[pos(5, 5)] = "O";
      return b;
    })(),
  },
  // BƯỚC 5: Mở rộng tấn công - O tại (2,2), X tại (7,8) → XXXX ngang (Open 4)
  {
    id: 6,
    title: "Bước 5: Mở rộng tấn công! 🎯",
    message:
      "Quay lại tấn công. Hãy kéo dài chuỗi quân của bạn thành 4 tại (7,8)!",
    action: "click_cell",
    highlightCells: [pos(7, 8)],
    allowedMoves: [pos(7, 8)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      // X có 3 quân ngang + đã chặn
      b[pos(8, 8)] = "X";
      b[pos(9, 8)] = "X";
      b[pos(10, 8)] = "X";
      b[pos(12, 8)] = "X"; // Đã chặn O
      // O quân cũ
      b[pos(12, 5)] = "O";
      b[pos(12, 6)] = "O";
      b[pos(12, 7)] = "O";
      b[pos(6, 6)] = "O";
      b[pos(5, 5)] = "O";
      b[pos(2, 2)] = "O"; // Máy đánh vu vơ
      return b;
    })(),
  },
  // BƯỚC 6: Chiến thắng - O tại (6,10), X tại (11,8) hoặc (6,8) → 5 quân liên tiếp WIN!
  {
    id: 7,
    title: "Bước 6: Chiến thắng! 🏆",
    message: "Kết liễu! Đánh nước thứ 5 để chiến thắng tại (11,8)!",
    action: "click_cell",
    highlightCells: [pos(11, 8)],
    allowedMoves: [pos(11, 8)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      // X có 4 quân ngang: (7,8) - (8,8) - (9,8) - (10,8) - Open 4!
      b[pos(7, 8)] = "X";
      b[pos(8, 8)] = "X";
      b[pos(9, 8)] = "X";
      b[pos(10, 8)] = "X";
      b[pos(12, 8)] = "X"; // Đã chặn O trước đó
      // O quân cũ
      b[pos(12, 5)] = "O";
      b[pos(12, 6)] = "O";
      b[pos(12, 7)] = "O";
      b[pos(6, 6)] = "O";
      b[pos(5, 5)] = "O";
      b[pos(2, 2)] = "O";
      b[pos(6, 10)] = "O"; // Máy cố chặn nhưng đã muộn
      return b;
    })(),
  },
  // Hiển thị chiến thắng - 5 quân liên tiếp
  {
    id: 8,
    title: "Chiến thắng! 🎉",
    message:
      "Xuất sắc! 5 X liên tiếp theo hàng ngang (7,8) → (11,8)! Bạn đã học được cách tấn công, phòng thủ và chiến thắng!",
    action: "click_next",
    highlightCells: [pos(7, 8), pos(8, 8), pos(9, 8), pos(10, 8), pos(11, 8)],
    allowedMoves: [],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      // X WIN! 5 quân liên tiếp ngang
      b[pos(7, 8)] = "X";
      b[pos(8, 8)] = "X";
      b[pos(9, 8)] = "X";
      b[pos(10, 8)] = "X";
      b[pos(11, 8)] = "X"; // WIN!
      b[pos(12, 8)] = "X"; // Đã chặn O
      // O quân cũ
      b[pos(12, 5)] = "O";
      b[pos(12, 6)] = "O";
      b[pos(12, 7)] = "O";
      b[pos(6, 6)] = "O";
      b[pos(5, 5)] = "O";
      b[pos(2, 2)] = "O";
      b[pos(6, 10)] = "O";
      return b;
    })(),
  },
  // Hoàn thành
  {
    id: 9,
    title: "Hoàn thành! 🚀",
    message:
      "Bạn đã học: 1) Chiếm trung tâm. 2) Tạo liên kết. 3) Tấn công nối dài. 4) Nhận biết nguy hiểm & chặn. 5) Mở rộng tấn công. 6) Kết liễu chiến thắng!",
    action: "finish",
    highlightCells: [],
    allowedMoves: [],
  },
];

const Caro4Game = () => {
  return (
    <CaroGame
      gameId={2}
      gameName="CARO 4 HÀNG"
      lobbyPath="/games/caro4"
      winCount={4}
      defaultBoardSize={15}
      theme="amber"
      tutorialSteps={CARO4_TUTORIAL_STEPS}
    />
  );
};

export default Caro4Game;
