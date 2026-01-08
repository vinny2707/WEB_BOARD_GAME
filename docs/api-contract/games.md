# Games APIs

## 1. Danh sách games

**Endpoint:** `GET /api/games` (Chưa triển khai)

## 2. Chi tiết game

**Endpoint:** `GET /api/games/:id` (Chưa triển khai)

---

## 3. Game Settings Schema

Mỗi game có `settings` là JSON object chứa cấu hình mặc định. Frontend có thể override khi tạo game_session.

### Caro (caro_5, caro_4)

| Field         | Type      | Mô tả                                         | Default    |
| ------------- | --------- | --------------------------------------------- | ---------- |
| winCondition  | int       | Số quân liên tiếp để thắng                    | 5 hoặc 4   |
| allowOverline | bool      | Cho phép > winCondition quân vẫn thắng        | false/true |
| turnTimeLimit | int\|null | Giới hạn giây mỗi lượt, null = không giới hạn | null       |

### Tic-Tac-Toe (tictactoe)

| Field     | Type | Mô tả                       | Default |
| --------- | ---- | --------------------------- | ------- |
| allowDraw | bool | Cho phép hòa khi bàn cờ đầy | true    |

### Rắn Săn Mồi (snake)

| Field     | Type   | Mô tả                    | Default  |
| --------- | ------ | ------------------------ | -------- |
| speed     | string | Tốc độ: slow/normal/fast | "normal" |
| obstacles | bool   | Có chướng ngại vật       | false    |

### Ghép Hàng 3 (match3)

| Field      | Type   | Mô tả                         | Default   |
| ---------- | ------ | ----------------------------- | --------- |
| gameMode   | string | classic/timed/moves_limited   | "classic" |
| candyTypes | int    | Số loại kẹo (nhiều = khó hơn) | 6         |

### Cờ Trí Nhớ (memory_cards)

| Field        | Type   | Mô tả             | Default  |
| ------------ | ------ | ----------------- | -------- |
| cardTheme    | string | Theme hình ảnh    | "emojis" |
| timerEnabled | bool   | Bật đếm thời gian | true     |

### Bảng Vẽ Tự Do (drawing_board)

| Field       | Type   | Mô tả                  | Default    |
| ----------- | ------ | ---------------------- | ---------- |
| gameMode    | string | freeplay/guessing_game | "freeplay" |
| saveDrawing | bool   | Cho phép lưu tranh     | true       |

---

## 4. Lưu ý

- `settings` trong bảng `games` là **default settings**
- Khi tạo `game_session`, frontend có thể truyền `settings` để override
- Backend không validate settings chi tiết, FE chịu trách nhiệm xử lý logic game
