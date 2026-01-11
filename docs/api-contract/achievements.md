# Achievements APIs

## Endpoints Overview

| Method | Endpoint              | Auth | Mô tả                              |
| ------ | --------------------- | ---- | ---------------------------------- |
| GET    | /api/achievements     | No   | Danh sách tất cả achievements      |
| GET    | /api/achievements/:id | No   | Chi tiết achievement               |
| GET    | /api/achievements/me  | User | Achievements của user với progress |

---

## 1. Danh sách Achievements

**Endpoint:** `GET /api/achievements`

**Query Parameters:**

| Param    | Type   | Mô tả                                     |
| -------- | ------ | ----------------------------------------- |
| category | string | Filter: beginner, expert, social, special |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": 1,
        "name": "First Steps",
        "description": "Complete your first game",
        "icon": "🎮",
        "category": "beginner",
        "points": 10,
        "unlock_criteria": {
          "type": "total_games",
          "game_type": null,
          "required_count": 1,
          "description": "Play 1 game of any type"
        }
      }
    ]
  }
}
```

---

## 2. Chi tiết Achievement

**Endpoint:** `GET /api/achievements/:id`

**Response 200:** Achievement object đầy đủ

**Errors:** 404 (not found)

---

## 3. Achievements của User

**Endpoint:** `GET /api/achievements/me`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "total_points": 150,
    "unlocked_count": 5,
    "total_count": 25,
    "achievements": {
      "unlocked": [
        {
          "id": 1,
          "name": "First Steps",
          "icon": "🎮",
          "category": "beginner",
          "points": 10,
          "progress": { "current": 3, "required": 1, "percentage": 100 },
          "unlocked_at": "2026-01-10T15:00:00.000+07:00",
          "is_unlocked": true
        }
      ],
      "in_progress": [
        {
          "id": 5,
          "name": "Century Player",
          "progress": { "current": 45, "required": 100, "percentage": 45 },
          "is_unlocked": false
        }
      ],
      "locked": [...]
    }
  }
}
```

---

## Achievement Check Flow

Khi user hoàn thành game qua `POST /api/sessions/complete`, backend sẽ:

1. Lưu session và cập nhật ranking
2. Gọi `AchievementService.checkAchievements()`
3. Kiểm tra tất cả achievements chưa unlock
4. Cập nhật progress hoặc unlock nếu đạt điều kiện
5. Trả về `newly_unlocked` trong response

**Response từ `/sessions/complete`:**

```json
{
  "success": true,
  "message": "Game completed successfully",
  "data": {
    "session": { ... },
    "newly_unlocked": [
      {
        "id": 1,
        "name": "First Steps",
        "icon": "🎮",
        "points": 10
      }
    ]
  }
}
```

---

## Unlock Criteria Types

| Type             | Mô tả                | Ví dụ                    |
| ---------------- | -------------------- | ------------------------ |
| `total_games`    | Tổng số game đã chơi | Chơi 100 game            |
| `total_wins`     | Tổng số thắng        | Thắng 50 game            |
| `game_wins`      | Thắng game cụ thể    | Thắng 20 ván Caro        |
| `high_score`     | Điểm cao             | Đạt 1000 điểm Snake      |
| `win_streak`     | Chuỗi thắng          | Thắng 10 ván liên tiếp   |
| `win_time`       | Thắng nhanh          | Thắng dưới 5 phút        |
| `time_challenge` | Hoàn thành nhanh     | Xong Memory dưới 60s     |
| `friend_count`   | Số bạn bè            | Có 10 bạn                |
| `messages_sent`  | Số tin nhắn          | Gửi 100 tin nhắn         |
| `play_time`      | Chơi theo giờ        | Chơi từ 0h-4h            |
| `global_rank`    | Đạt rank             | Top 10 Caro              |
| `all_games_won`  | Thắng mỗi game       | Thắng 1 ván mỗi loại     |
| `combo_streak`   | Combo liên tiếp      | Combo 10x trong Match3   |
| `perfect_game`   | Hoàn hảo             | Memory không sai lần nào |
| `comeback_win`   | Ngược dòng           | Thắng khi bị dẫn         |
