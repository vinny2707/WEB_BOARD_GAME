# Hướng Dẫn Làm Việc Nhóm Frontend - Tránh Conflict

## 📋 Phân Chia Công Việc

### Người 1: UI Game (feature/UI_game)
Phụ trách các file/thư mục:
```
frontend/src/features/games/
├── pages/
│   └── Games.jsx           # Trang chọn game
├── components/             # Components riêng cho game
│   ├── GameBoard.jsx       # Bàn chơi chung
│   ├── TicTacToe/          # Thư mục game Tic-Tac-Toe
│   ├── Chess/              # Thư mục game Cờ vua
│   └── Checkers/           # Thư mục game Cờ đam
├── hooks/                  # Custom hooks cho game logic
└── utils/                  # Game utilities
```

### Người 2: UI Authentication (feature/UI_Authentication)
Phụ trách các file/thư mục:
```
frontend/src/features/auth/
frontend/src/features/profile/
frontend/src/features/userManagement/
```

---

## 🛡️ Nguyên Tắc Tránh Conflict

### 1. Không chạm vào file của nhau
- **KHÔNG** sửa file trong thư mục của người khác
- Nếu cần thay đổi, **thông báo trước** cho teammate

### 2. File dùng chung - Cẩn thận!
> [!CAUTION]
> Các file sau được cả 2 người sử dụng, cần phối hợp:

| File | Cách xử lý |
|------|-----------|
| `src/routes/router.jsx` | Thêm route phía dưới, không xóa route của người khác |
| `src/index.css` | Thêm CSS mới ở cuối file với comment tên người |
| `src/components/ui/*` | Không sửa, chỉ thêm mới nếu cần |
| `src/components/Sidebar.jsx` | Phối hợp khi cần thêm menu item |

### 3. Quy tắc đặt tên
- Component: `PascalCase` (VD: `GameBoard.jsx`)
- Thư mục game: Tên game (VD: `TicTacToe/`, `Chess/`)
- CSS class: prefix theo feature (VD: `.game-board`, `.auth-form`)

---

## 🔄 Quy Trình Git

### Trước khi code mới
```bash
# 1. Lấy code mới nhất từ main
git checkout main
git pull origin main

# 2. Quay lại nhánh của mình và merge
git checkout feature/UI_game
git merge main
```

### Commit thường xuyên
```bash
# Commit nhỏ, message rõ ràng
git add .
git commit -m "feat(games): add TicTacToe board component"
```

### Trước khi push
```bash
# Kiểm tra conflict với main
git fetch origin
git merge origin/main

# Nếu có conflict, giải quyết rồi mới push
git push origin feature/UI_game
```

---

## 🚨 Khi Có Conflict

### Bước 1: Xác định file conflict
```bash
git status
# Xem các file có conflict (both modified)
```

### Bước 2: Mở file và tìm markers
```
<<<<<<< HEAD
Code của bạn
=======
Code của người khác
>>>>>>> origin/main
```

### Bước 3: Giải quyết
- Giữ cả 2 phần nếu cần
- Hoặc chọn 1 phần phù hợp
- **Xóa hết markers** `<<<<<<<`, `=======`, `>>>>>>>`

### Bước 4: Commit sau khi resolve
```bash
git add .
git commit -m "resolve: merge conflict in router.jsx"
```

---

## 📞 Liên Lạc

> [!IMPORTANT]
> Khi cần sửa file dùng chung, **nhắn tin cho teammate trước** để tránh conflict!

### Checklist trước khi sửa file chung:
- [ ] Đã thông báo cho teammate
- [ ] Đã pull code mới nhất
- [ ] Commit ngay sau khi sửa xong

---

## 📁 Cấu Trúc Thư Mục Đề Xuất Cho Games

```
frontend/src/features/games/
├── pages/
│   └── Games.jsx              # Trang danh sách game
│
├── components/
│   ├── GameCard.jsx           # Card hiển thị game
│   ├── GameBoard.jsx          # Board component chung
│   │
│   ├── TicTacToe/
│   │   ├── TicTacToeGame.jsx  # Main game component
│   │   ├── TicTacToeBoard.jsx # Bàn chơi 3x3
│   │   ├── TicTacToeCell.jsx  # Ô vuông
│   │   └── TicTacToeAI.js     # Logic AI
│   │
│   ├── Chess/
│   │   ├── ChessGame.jsx
│   │   ├── ChessBoard.jsx
│   │   ├── ChessPiece.jsx
│   │   └── ChessLogic.js
│   │
│   └── Checkers/
│       ├── CheckersGame.jsx
│       ├── CheckersBoard.jsx
│       └── CheckersLogic.js
│
├── hooks/
│   ├── useGameState.js        # Hook quản lý state game
│   └── useGameTimer.js        # Hook đếm thời gian
│
└── utils/
    ├── gameHelpers.js         # Hàm helper chung
    └── constants.js           # Hằng số game
```

---

**Cập nhật lần cuối:** 2026-01-09
