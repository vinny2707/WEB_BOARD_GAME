# API Contract Documentation

Tài liệu này mô tả chi tiết các API endpoint cho Frontend triển khai.

## Base URL

```
Development: http://localhost:3000
Production: [Chưa cấu hình]
```

## Headers

| Header        | Giá trị          | Mô tả                            |
| ------------- | ---------------- | -------------------------------- |
| Content-Type  | application/json | Bắt buộc cho mọi request có body |
| Authorization | Bearer {token}   | Bắt buộc cho Protected routes    |

## Response Format

Tất cả response đều có format chuẩn:

```json
{
  "success": true | false,
  "message": "Mô tả kết quả",
  "data": { ... } | null
}
```

---

## API Modules

| Module         | File                                 | Mô tả                            |
| -------------- | ------------------------------------ | -------------------------------- |
| Authentication | [auth.md](./auth.md)                 | Đăng ký, đăng nhập, OTP, profile |
| Games          | [games.md](./games.md)               | Quản lý games                    |
| Sessions       | [sessions.md](./sessions.md)         | Game sessions                    |
| Friends        | [friends.md](./friends.md)           | Kết bạn                          |
| Messages       | [messages.md](./messages.md)         | Tin nhắn                         |
| Achievements   | [achievements.md](./achievements.md) | Thành tích                       |
| Rankings       | [rankings.md](./rankings.md)         | Xếp hạng                         |

---

## Trạng thái tài khoản (User Status)

| Status   | Mô tả                                  | Login                |
| -------- | -------------------------------------- | -------------------- |
| active   | Hoạt động bình thường                  | Cho phép             |
| inactive | Cần xác thực lại (14 ngày không login) | Gửi OTP để kích hoạt |
| banned   | Bị cấm vĩnh viễn                       | Từ chối (403)        |

---

## Phân quyền (Roles)

| Role  | Mô tả             | Quyền hạn                          |
| ----- | ----------------- | ---------------------------------- |
| user  | Người dùng thường | Chơi game, chat, kết bạn           |
| admin | Quản trị cao nhất | + Quản lý user, ban user, thống kê |

---

## JWT Token

**Payload:**

```json
{
  "userId": 1,
  "username": "admin",
  "email": "admin@boardgame.com",
  "role": "admin",
  "iat": 1704700800,
  "exp": 1705305600
}
```

- Token hết hạn sau 7 ngày
- Frontend lưu trong localStorage (remember me) hoặc sessionStorage

---

## Error Codes

| Code | Message                 | Xử lý Frontend          |
| ---- | ----------------------- | ----------------------- |
| 400  | Validation failed       | Hiển thị lỗi validation |
| 401  | Invalid token           | Redirect login          |
| 401  | Token expired           | Redirect login          |
| 403  | Account banned/inactive | Logout + thông báo      |
| 404  | Not found               | Hiển thị lỗi            |
| 409  | Already exists          | Hiển thị lỗi            |
| 429  | Too many attempts       | Chờ hoặc retry          |
| 500  | Server error            | Hiển thị lỗi chung      |
