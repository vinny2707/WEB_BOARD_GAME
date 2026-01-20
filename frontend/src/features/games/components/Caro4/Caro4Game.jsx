import React from "react";
import { CaroGame } from "../shared";

const BOARD_SIZE = 15;
// User dùng tọa độ 1-indexed, code dùng 0-indexed
const pos = (row, col) => (row - 1) * BOARD_SIZE + (col - 1);

// Kịch bản mới: Smart Diagonal Win - Đánh chéo thông minh
const CARO4_TUTORIAL_STEPS = [
  // Bước 0: Giới thiệu
  {
    id: 1,
    title: "Chào mừng đến với Caro 4 Hàng! 🎯",
    message:
      "Chỉ cần 4 quân liên tiếp để thắng! Hãy học chiến thuật đường chéo thông minh.",
    action: "click_next",
    highlightCells: [],
    allowedMoves: [],
  },
  // Bước 1: Khai cuộc - X tại (8,8)
  {
    id: 2,
    title: "Bước 1: Khai cuộc! ✖️",
    message: "Bắt đầu tại trung tâm (8,8) để kiểm soát bàn cờ.",
    action: "click_cell",
    highlightCells: [pos(8, 8)],
    allowedMoves: [pos(8, 8)],
    boardState: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
  },
  // Bước 2: Chuyển hướng - O đánh (8,9), X đánh (9,8)
  {
    id: 3,
    title: "Bước 2: Chuyển hướng! 🔄",
    message: "Máy chặn ngang. Hãy đánh (9,8) để tạo thế dọc.",
    action: "click_cell",
    highlightCells: [pos(9, 8)],
    allowedMoves: [pos(9, 8)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      b[pos(8, 8)] = "X"; // Quân đầu tiên của người chơi
      b[pos(8, 9)] = "O"; // Máy chặn ngang
      return b;
    })(),
  },
  // Bước 3: Mở đường chéo - O đánh (10,8), X đánh (9,7)
  {
    id: 4,
    title: "Bước 3: Mở đường chéo! ↗️",
    message: "Dọc bị chặn dưới. Đánh (9,7) để bí mật tạo đường chéo với quân trung tâm.",
    action: "click_cell",
    highlightCells: [pos(9, 7)],
    allowedMoves: [pos(9, 7)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      b[pos(8, 8)] = "X"; // Quân 1
      b[pos(9, 8)] = "X"; // Quân 2
      b[pos(8, 9)] = "O"; // Máy chặn ngang
      b[pos(10, 8)] = "O"; // Máy chặn dọc
      return b;
    })(),
  },
  // Bước 4: Tạo Open 3 (Thế thắng) - O đánh (9,6), X đánh (10,6)
  {
    id: 5,
    title: "Bước 4: Tạo Open 3! 🎯",
    message: "Máy mắc bẫy chặn ngang! Đánh ngay (10,6) để hoàn thành bộ 3 đường chéo không thể cản phá.",
    action: "click_cell",
    highlightCells: [pos(10, 6)],
    allowedMoves: [pos(10, 6)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      b[pos(8, 8)] = "X"; // Quân 1 - trung tâm
      b[pos(9, 8)] = "X"; // Quân 2 - dọc
      b[pos(9, 7)] = "X"; // Quân 3 - chéo
      b[pos(8, 9)] = "O"; // Máy chặn ngang
      b[pos(10, 8)] = "O"; // Máy chặn dọc
      b[pos(9, 6)] = "O"; // Máy mắc bẫy chặn ngang (không nhận ra đường chéo)
      return b;
    })(),
  },
  // Bước 5: Chiến thắng - O đánh (7,9), X đánh (11,5)
  {
    id: 6,
    title: "Bước 5: Chiến thắng! 🏆",
    message: "Kết thúc trận đấu! Đánh vào (11,5) để hoàn thành 4 quân liên tiếp đường chéo.",
    action: "click_cell",
    highlightCells: [pos(11, 5)],
    allowedMoves: [pos(11, 5)],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      // Chuỗi chéo X: (8,8) - (9,7) - (10,6) - sẽ thêm (11,5)
      b[pos(8, 8)] = "X"; // Quân 1
      b[pos(9, 8)] = "X"; // Quân phụ (dọc)
      b[pos(9, 7)] = "X"; // Quân 2 - chéo
      b[pos(10, 6)] = "X"; // Quân 3 - chéo
      // Máy
      b[pos(8, 9)] = "O";
      b[pos(10, 8)] = "O";
      b[pos(9, 6)] = "O";
      b[pos(7, 9)] = "O"; // Máy đánh lung tung
      return b;
    })(),
  },
  // Hiển thị chiến thắng
  {
    id: 7,
    title: "Chiến thắng! 🎉",
    message:
      "Xuất sắc! 4 X liên tiếp theo đường chéo (8,8) → (9,7) → (10,6) → (11,5)! Bạn đã học được chiến thuật đường chéo bất ngờ!",
    action: "click_next",
    highlightCells: [pos(8, 8), pos(9, 7), pos(10, 6), pos(11, 5)],
    allowedMoves: [],
    boardState: (() => {
      const b = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
      // Chuỗi chéo thắng: (8,8) - (9,7) - (10,6) - (11,5)
      b[pos(8, 8)] = "X"; // Quân 1
      b[pos(9, 7)] = "X"; // Quân 2
      b[pos(10, 6)] = "X"; // Quân 3
      b[pos(11, 5)] = "X"; // Quân 4 - WIN!
      b[pos(9, 8)] = "X"; // Quân phụ (dọc)
      // Máy
      b[pos(8, 9)] = "O";
      b[pos(10, 8)] = "O";
      b[pos(9, 6)] = "O";
      b[pos(7, 9)] = "O";
      return b;
    })(),
  },
  // Hoàn thành
  {
    id: 8,
    title: "Hoàn thành! 🚀",
    message:
      "Bạn đã học: 1) Chiếm trung tâm. 2) Chuyển hướng khi bị chặn. 3) Tạo đường chéo bí mật. 4) Kết liễu chiến thắng bằng đường chéo!",
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
