# Games APIs

## Endpoints Overview

| Method | Endpoint              | Auth  | Mô tả                     |
| ------ | --------------------- | ----- | ------------------------- |
| GET    | /api/games            | No    | Danh sách games (tóm tắt) |
| GET    | /api/games/:id        | No    | Chi tiết game             |
| POST   | /api/games            | Admin | Tạo game mới              |
| PUT    | /api/games/:id        | Admin | Cập nhật game             |
| PATCH  | /api/games/:id/status | Admin | Bật/tắt game              |
| DELETE | /api/games/:id        | Admin | Xóa game                  |

---

## 1. Danh sách games

**Endpoint:** `GET /api/games`

**Mô tả:** Trả về tất cả games (kể cả disabled) với thông tin tóm tắt để FE hiển thị danh sách. Game bị disabled hiển thị mờ, không thể chọn.

**Query Parameters:**

| Param   | Type   | Mô tả                          | Default |
| ------- | ------ | ------------------------------ | ------- |
| page    | int    | Số trang                       | 1       |
| limit   | int    | Số items/trang                 | 10      |
| search  | string | Tìm theo name hoặc type        | -       |
| enabled | bool   | Filter theo trạng thái enabled | -       |

**Response 200:**

```json
{
  "success": true,
  "message": "Games retrieved successfully",
  "data": {
    "games": [
      {
        "id": 1,
        "name": "Caro Hàng 5",
        "type": "caro_5",
        "description": "Trò chơi cờ caro truyền thống...",
        "enabled": true,
        "icon": "⭕"
      },
      {
        "id": 4,
        "name": "Rắn Săn Mồi",
        "type": "snake",
        "description": "Điều khiển con rắn ăn thức ăn...",
        "enabled": false,
        "icon": "🐍"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 7,
      "totalPages": 1
    }
  }
}
```

**Lưu ý:** Response KHÔNG bao gồm `rows`, `cols`, `rules`, `settings` - dùng GET /:id để lấy chi tiết.

---

## 2. Chi tiết game

**Endpoint:** `GET /api/games/:id`

**Mô tả:** Trả về đầy đủ thông tin của 1 game, bao gồm cấu hình bàn chơi và settings.

**Response 200:**

```json
{
  "success": true,
  "message": "Game retrieved successfully",
  "data": {
    "id": 1,
    "name": "Caro Hàng 5",
    "type": "caro_5",
    "description": "Trò chơi cờ caro truyền thống...",
    "rows": 15,
    "cols": 15,
    "enabled": true,
    "icon": "⭕",
    "rules": "Hai người chơi lần lượt đánh dấu X và O...",
    "settings": {
      "winCondition": 5,
      "allowOverline": false,
      "turnTimeLimit": null
    },
    "created_at": "2026-01-08T10:00:00.000Z",
    "updated_at": "2026-01-08T10:00:00.000Z"
  }
}
```

**Errors:** 404 (game not found)

---

## 3. Tạo game mới (Admin)

**Endpoint:** `POST /api/games`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**

| Field       | Type   | Bắt buộc | Mô tả                         |
| ----------- | ------ | -------- | ----------------------------- |
| name        | string | Có       | Tên hiển thị                  |
| type        | string | Có       | Mã unique (vd: caro_5, snake) |
| description | string | Không    | Mô tả ngắn                    |
| rows        | int    | Có       | Số hàng bàn chơi              |
| cols        | int    | Có       | Số cột bàn chơi               |
| enabled     | bool   | Không    | Default: true                 |
| icon        | string | Không    | Emoji hoặc icon               |
| rules       | string | Không    | Luật chơi chi tiết            |
| settings    | object | Không    | Cấu hình mặc định của game    |

**Response 201:** Game object đầy đủ

**Errors:** 400 (validation), 409 (type đã tồn tại)

---

## 4. Cập nhật game (Admin)

**Endpoint:** `PUT /api/games/:id`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:** Các field cần update (tương tự POST, không cần tất cả)

**Response 200:** Game object đầy đủ

**Errors:** 404 (not found), 409 (type conflict)

---

## 5. Bật/tắt game (Admin)

**Endpoint:** `PATCH /api/games/:id/status`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**

```json
{ "enabled": false }
```

**Response 200:**

```json
{
  "success": true,
  "message": "Game disabled successfully",
  "data": {
    "id": 4,
    "name": "Rắn Săn Mồi",
    "type": "snake",
    "enabled": false,
    "updated_at": "2026-01-09T11:40:00.000Z"
  }
}
```

**Errors:** 400 (missing enabled), 404 (not found)

---

## 6. Xóa game (Admin)

**Endpoint:** `DELETE /api/games/:id`

**Headers:** `Authorization: Bearer {admin_token}`

**Response 200:** `{ "success": true, "message": "Game deleted successfully" }`

**Errors:** 404 (not found)

---

## Game Settings Schema

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

## Lưu ý

- `settings` trong bảng `games` là **default settings**
- Khi tạo `game_session`, frontend có thể truyền `settings` để override
- Backend không validate settings chi tiết, FE chịu trách nhiệm xử lý logic game
