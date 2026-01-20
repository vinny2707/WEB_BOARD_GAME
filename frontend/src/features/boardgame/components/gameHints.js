/**
 * Game Hints Data
 * Chứa thông tin hướng dẫn cho từng game
 */

export const GAME_HINTS = {
  snake: {
    emoji: "🐍",
    title: "SNAKE GAME",
    controls: [{ key: "↑ ↓ ← →", desc: "Điều khiển hướng rắn" }],
    rules: [
      { icon: "🔴", color: "green", desc: "Ăn thức ăn để lớn lên và ghi điểm" },
      { icon: "⚠️", color: "yellow", desc: "Tránh cắn vào thân mình" },
      { icon: "🔄", color: "blue", desc: "Rắn xuyên tường" },
    ],
    tips: null,
  },

  tictactoe: {
    emoji: "⭕",
    title: "TIC TAC TOE",
    controls: [
      { key: "↑ ↓ ← →", desc: "Di chuyển ô chọn" },
      { key: "Enter", desc: "Đánh dấu ô" },
    ],
    rules: [
      { icon: "🎯", color: "cyan", desc: "Tạo 3 ô liên tiếp để thắng" },
      { icon: "⏱️", color: "yellow", desc: "Hết giờ = thua lượt" },
    ],
    tips: "Nút Hint gợi ý nước đi tốt nhất",
  },

  caro4: {
    emoji: "🔵",
    title: "CARO 4",
    controls: [
      { key: "↑ ↓ ← →", desc: "Di chuyển ô chọn" },
      { key: "Enter", desc: "Đánh dấu ô" },
    ],
    rules: [
      { icon: "4️⃣", color: "cyan", desc: "Tạo 4 ô liên tiếp để thắng" },
      { icon: "🚫", color: "red", desc: "Không được tạo 2 đầu hở" },
      { icon: "⏱️", color: "yellow", desc: "30 giây mỗi lượt" },
    ],
    tips: "Nút Hint gợi ý nước đi tốt nhất",
  },

  caro5: {
    emoji: "🟣",
    title: "CARO 5",
    controls: [
      { key: "↑ ↓ ← →", desc: "Di chuyển ô chọn" },
      { key: "Enter", desc: "Đánh dấu ô" },
    ],
    rules: [
      { icon: "5️⃣", color: "cyan", desc: "Tạo 5 ô liên tiếp để thắng" },
      {
        icon: "🎯",
        color: "green",
        desc: "Bàn cờ lớn hơn, chiến thuật phức tạp",
      },
      { icon: "⏱️", color: "yellow", desc: "30 giây mỗi lượt" },
    ],
    tips: "Nút Hint gợi ý nước đi tốt nhất",
  },

  memory: {
    emoji: "🧠",
    title: "MEMORY MATCH",
    controls: [
      { key: "↑ ↓ ← →", desc: "Di chuyển giữa các thẻ" },
      { key: "Enter", desc: "Lật thẻ" },
    ],
    rules: [
      { icon: "🃏", color: "cyan", desc: "Lật 2 thẻ mỗi lượt" },
      { icon: "✅", color: "green", desc: "Cặp giống nhau sẽ giữ nguyên" },
      { icon: "🔄", color: "yellow", desc: "Không khớp sẽ úp lại sau 1 giây" },
      { icon: "🏆", color: "purple", desc: "Hoàn thành với ít lượt nhất!" },
    ],
    tips: null,
  },

  match3: {
    emoji: "💎",
    title: "MATCH 3",
    controls: [
      { key: "↑ ↓ ← →", desc: "Di chuyển ô chọn" },
      { key: "Enter", desc: "Chọn/đổi viên đá" },
    ],
    rules: [
      { icon: "3️⃣", color: "cyan", desc: "Đổi chỗ 2 viên kề nhau" },
      { icon: "💥", color: "green", desc: "3+ viên cùng màu = nổ điểm" },
      { icon: "⬇️", color: "yellow", desc: "Viên mới rơi từ trên xuống" },
      { icon: "🎯", color: "purple", desc: "Đạt điểm mục tiêu để thắng" },
    ],
    tips: null,
  },

  dotart: {
    emoji: "🎨",
    title: "DOT ART",
    controls: [
      { key: "↑ ↓ ← →", desc: "Di chuyển con trỏ" },
      { key: "Enter", desc: "Vẽ/Xóa pixel" },
      { key: "1-8", desc: "Chọn màu nhanh" },
    ],
    rules: [
      { icon: "🖌️", color: "cyan", desc: "Vẽ pixel art trên LED matrix" },
      { icon: "🎨", color: "green", desc: "8 màu sắc cơ bản" },
      { icon: "💾", color: "yellow", desc: "Tự động lưu tiến trình" },
    ],
    tips: "Click chuột để vẽ nhanh hơn",
  },
};
