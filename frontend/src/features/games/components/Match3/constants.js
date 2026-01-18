// Match3 Game Constants

// Game settings
export const CELL_SIZE = 56;
export const DEFAULT_BOARD_SIZE = 8;
export const SWAP_DURATION = 180;
export const GRAVITY = 1.0;
export const BOUNCE_FACTOR = 0.25;
export const FALL_SPEED_LIMIT = 22;

// Candy icons - using 50px icons (native size, crisp rendering)
export const ALL_CANDY_ICONS = [
  "/Icons8/icons8-strawberry-50.png",
  "/Icons8/icons8-orange-50.png",
  "/Icons8/icons8-banana-50.png",
  "/Icons8/icons8-grapes-50.png",
  "/Icons8/icons8-cherry-50.png",
  "/Icons8/icons8-blueberry-50.png",
  "/Icons8/icons8-watermelon-50.png",
];

// Candy colors for fallback rendering and effects
export const CANDY_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4"
];

// Difficulty settings
export const DIFFICULTY_SETTINGS = {
  easy: { candies: 5, label: 'Dễ' },
  medium: { candies: 6, label: 'Trung Bình' },
  hard: { candies: 7, label: 'Khó' }
};

// Tutorial steps with interactive actions
// action types:
// - "welcome": just introduction, click to continue  
// - "select_candy": user must click to select any candy
// - "make_swap": user must swap two adjacent candies
// - "make_match": user must successfully match 3+ candies
// - "finish": complete tutorial
export const TUTORIAL_STEPS = [
  { id: 1, title: "Chào mừng! 🍬", message: "Hãy học cách chơi Match3! Nhấn 'Tiếp tục' để bắt đầu.", action: "welcome" },
  { id: 2, title: "Chọn kẹo 🎯", message: "Click vào bất kỳ viên kẹo nào để chọn nó!", action: "select_candy" },
  { id: 3, title: "Đổi chỗ kẹo 🔄", message: "Giờ kéo viên kẹo vào viên kẹo bên cạnh để đổi chỗ chúng!", action: "make_swap" },
  { id: 4, title: "Ghép 3 kẹo ⭐", message: "Tìm và ghép 3+ viên kẹo cùng màu để ghi điểm!", action: "make_match" },
  { id: 5, title: "Hoàn thành! 🚀", message: "Tuyệt vời! Bạn đã sẵn sàng. Chúc may mắn!", action: "finish" }
];
