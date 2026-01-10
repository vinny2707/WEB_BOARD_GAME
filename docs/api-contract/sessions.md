# Game Sessions APIs

## Endpoints Overview

| Method | Endpoint               | Auth | Mô tả                              |
| ------ | ---------------------- | ---- | ---------------------------------- |
| POST   | /api/sessions/complete | User | Kết thúc game, cập nhật ranking    |
| GET    | /api/sessions/history  | User | Lịch sử chơi của user (phân trang) |
| POST   | /api/sessions/start    | User | Bắt đầu session mới (cho resume)   |
| GET    | /api/sessions/:id      | User | Chi tiết 1 session                 |
| PUT    | /api/sessions/:id/save | User | Lưu trạng thái game đang chơi      |
| DELETE | /api/sessions/:id      | User | Xóa session khỏi lịch sử           |

> **Lưu ý:** Tất cả endpoints đều yêu cầu JWT token. User chỉ có thể truy cập session của chính mình.

---

## 1. Kết thúc game

**Endpoint:** `POST /api/sessions/complete`

**Mô tả:** Submit kết quả game đã hoàn thành. Backend sẽ tự động cập nhật bảng `rankings`.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

| Field        | Type   | Bắt buộc | Mô tả                        |
| ------------ | ------ | -------- | ---------------------------- |
| game_id      | int    | Có       | ID của game                  |
| result       | string | Có       | Kết quả: win, loss, draw     |
| score        | int    | Không    | Điểm đạt được                |
| moves_count  | int    | Không    | Số nước đi                   |
| time_elapsed | int    | Không    | Thời gian chơi (giây)        |
| game_state   | object | Không    | Trạng thái cuối của game     |
| settings     | object | Không    | Cấu hình game đã dùng        |
| started_at   | string | Không    | Thời điểm bắt đầu (ISO 8601) |

**Request Example:**

```json
{
  "game_id": 1,
  "result": "win",
  "score": 100,
  "moves_count": 15,
  "time_elapsed": 120,
  "game_state": {
    "board": [
      ["X", "O", "X"],
      ["O", "X", "O"],
      ["X", null, null]
    ],
    "winner": "X"
  }
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Game completed successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": 2,
    "game_id": 1,
    "result": "win",
    "score": 100,
    "moves_count": 15,
    "time_elapsed": 120,
    "status": "completed",
    "started_at": "2026-01-10T08:00:00.000Z",
    "ended_at": "2026-01-10T08:02:00.000Z"
  }
}
```

**Errors:** 400 (validation), 404 (game not found)

---

## 2. Lịch sử chơi

**Endpoint:** `GET /api/sessions/history`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Param   | Type   | Mô tả                                     | Default |
| ------- | ------ | ----------------------------------------- | ------- |
| page    | int    | Số trang                                  | 1       |
| limit   | int    | Số items/trang                            | 10      |
| game_id | int    | Filter theo game cụ thể                   | -       |
| status  | string | Filter: in_progress, completed, abandoned | -       |

**Response 200:**

```json
{
  "success": true,
  "message": "History retrieved successfully",
  "data": {
    "sessions": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "game_id": 1,
        "game_name": "Caro Hàng 5",
        "game_type": "caro_5",
        "game_icon": "⭕",
        "result": "win",
        "score": 100,
        "moves_count": 15,
        "time_elapsed": 120,
        "status": "completed",
        "started_at": "2026-01-10T08:00:00.000Z",
        "ended_at": "2026-01-10T08:02:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

## 3. Bắt đầu session mới

**Endpoint:** `POST /api/sessions/start`

**Mô tả:** Tạo session với status `in_progress` cho games cần tính năng resume/reconnect.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

| Field      | Type   | Bắt buộc | Mô tả                   |
| ---------- | ------ | -------- | ----------------------- |
| game_id    | int    | Có       | ID của game             |
| game_state | object | Không    | Trạng thái ban đầu      |
| settings   | object | Không    | Cấu hình game tùy chỉnh |

**Response 201:** Session object với status = `in_progress`

---

## 4. Chi tiết session

**Endpoint:** `GET /api/sessions/:id`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**

```json
{
  "success": true,
  "message": "Session retrieved successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": 2,
    "game_id": 1,
    "game_name": "Caro Hàng 5",
    "game_type": "caro_5",
    "game_icon": "⭕",
    "game_state": { "board": [...], "currentPlayer": "X" },
    "result": null,
    "score": 0,
    "status": "in_progress",
    "settings": { "winCondition": 5 },
    "started_at": "2026-01-10T08:00:00.000Z",
    "ended_at": null
  }
}
```

**Errors:** 404 (not found hoặc không phải owner)

---

## 5. Lưu trạng thái game

**Endpoint:** `PUT /api/sessions/:id/save`

**Mô tả:** Cập nhật `game_state` cho session đang `in_progress`.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

| Field        | Type   | Bắt buộc | Mô tả                    |
| ------------ | ------ | -------- | ------------------------ |
| game_state   | object | Có       | Trạng thái game hiện tại |
| moves_count  | int    | Không    | Số nước đi đã thực hiện  |
| time_elapsed | int    | Không    | Thời gian đã chơi (giây) |

**Response 200:** Session object đã cập nhật

**Errors:** 404 (not found hoặc không phải `in_progress`)

---

## 6. Xóa session

**Endpoint:** `DELETE /api/sessions/:id`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**

```json
{
  "success": true,
  "message": "Session deleted successfully",
  "data": null
}
```

**Errors:** 404 (not found)

---

## Flow hoạt động

### Simple Games (TicTacToe, Snake...)

```
FE: Chơi game (logic 100% ở FE)
    ↓
FE: Game kết thúc
    ↓
FE: POST /api/sessions/complete {game_id, result, score, ...}
    ↓
BE: Insert vào game_sessions
    ↓
BE: Update rankings (total_games++, total_score+=, recalc win_rate, rank)
    ↓
FE: Nhận response, hiển thị kết quả
```

### Complex Games (cần resume)

```
FE: POST /api/sessions/start {game_id} → Nhận session_id
    ↓
FE: Chơi game, định kỳ PUT /api/sessions/:id/save
    ↓
FE: (Nếu mất kết nối) GET /api/sessions/:id → Resume game
    ↓
FE: Game kết thúc → POST /api/sessions/complete
```
