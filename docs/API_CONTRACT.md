# TÀI LIỆU API CONTRACT

Tài liệu này mô tả chi tiết các API endpoint cho Frontend triển khai.

---

## 1. THÔNG TIN CHUNG

### 1.1 Base URL

```
Development: http://localhost:3000
Production: [Chưa cấu hình]
```

### 1.2 Headers

| Header        | Giá trị          | Mô tả                            |
| ------------- | ---------------- | -------------------------------- |
| Content-Type  | application/json | Bắt buộc cho mọi request có body |
| Authorization | Bearer {token}   | Bắt buộc cho Protected routes    |

### 1.3 Response Format

Tất cả response đều có format chuẩn:

```json
{
  "success": true | false,
  "message": "Mô tả kết quả",
  "data": { ... } | null
}
```

---

## 2. AUTHENTICATION APIs

### 2.1 Đăng ký tài khoản

**Endpoint:** `POST /api/auth/register`

**Request Body:**

| Field     | Type   | Bắt buộc | Ràng buộc                         |
| --------- | ------ | -------- | --------------------------------- |
| username  | string | Có       | 3-50 ký tự, chỉ chứa [a-zA-Z0-9_] |
| email     | string | Có       | Email hợp lệ, unique              |
| password  | string | Có       | Tối thiểu 6 ký tự                 |
| full_name | string | Không    | Tối đa 100 ký tự                  |
| dob       | string | Không    | Format: YYYY-MM-DD                |

**Validation:**

- username: Không được trùng với user khác
- email: Không được trùng với user khác
- email: Không được sử dụng email đã bị banned

**Response 201 (Thành công):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 15,
    "username": "newuser",
    "email": "new@example.com",
    "full_name": "New User",
    "dob": "1990-01-01",
    "role": "user",
    "status": "active",
    "created_at": "2026-01-08T07:00:00.000Z"
  }
}
```

**Response 400 (Validation Error):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username must be between 3 and 50 characters"
    },
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

**Response 409 (Conflict):**

```json
{
  "success": false,
  "message": "Username already exists",
  "data": null
}
```

**Response 403 (Email bị banned):**

```json
{
  "success": false,
  "message": "This email has been banned and cannot be used for registration",
  "data": null
}
```

---

### 2.2 Đăng nhập

**Endpoint:** `POST /api/auth/login`

**Request Body:**

| Field    | Type   | Bắt buộc | Ràng buộc         |
| -------- | ------ | -------- | ----------------- |
| username | string | Có       | Tối thiểu 3 ký tự |
| password | string | Có       | Bắt buộc          |

**Response 200 (Thành công):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@boardgame.com",
      "full_name": "Administrator",
      "role": "admin",
      "status": "active",
      "last_login": "2026-01-08T07:00:00.000Z"
    }
  }
}
```

**Response 401 (Sai thông tin):**

```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null
}
```

**Response 403 (Tài khoản bị khóa):**

```json
{
  "success": false,
  "message": "Account is inactive or banned",
  "data": null
}
```

---

### 2.3 Đăng xuất

**Endpoint:** `POST /api/auth/logout`

**Headers:** Không bắt buộc

**Response 200:**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Lưu ý:** Backend không quản lý session. Token vẫn còn hiệu lực cho đến khi hết hạn. Frontend cần xóa token khỏi local storage.

---

### 2.4 Lấy thông tin profile

**Endpoint:** `GET /api/auth/profile`

**Headers:** `Authorization: Bearer {token}` (Bắt buộc)

**Response 200:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@boardgame.com",
    "full_name": "Administrator",
    "dob": "1990-05-15",
    "role": "admin",
    "status": "active",
    "created_at": "2025-12-30T00:00:00.000Z",
    "last_login": "2026-01-08T07:00:00.000Z"
  }
}
```

**Response 401 (Token không hợp lệ):**

```json
{
  "success": false,
  "message": "Invalid token",
  "data": null
}
```

**Response 403 (Tài khoản bị khóa):**

```json
{
  "success": false,
  "message": "Your account has been banned",
  "data": null
}
```

---

### 2.5 Cập nhật profile

**Endpoint:** `PUT /api/auth/profile`

**Headers:** `Authorization: Bearer {token}` (Bắt buộc)

**Request Body:**

| Field     | Type   | Bắt buộc | Ràng buộc          |
| --------- | ------ | -------- | ------------------ |
| full_name | string | Không    | Tối đa 100 ký tự   |
| dob       | string | Không    | Format: YYYY-MM-DD |

**Lưu ý:** User KHÔNG được phép tự thay đổi username, email, role, status.

**Response 200:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@boardgame.com",
    "full_name": "Updated Name",
    "dob": "1990-05-15",
    "role": "admin",
    "status": "active"
  }
}
```

---

## 3. GAMES APIs

> Phần này sẽ được bổ sung khi phát triển các endpoint liên quan đến games.

### 3.1 Danh sách games

**Endpoint:** `GET /api/games` (Chưa triển khai)

### 3.2 Chi tiết game

**Endpoint:** `GET /api/games/:id` (Chưa triển khai)

---

## 4. GAME SESSIONS APIs

> Phần này sẽ được bổ sung khi phát triển các endpoint liên quan đến game sessions.

### 4.1 Tạo phiên chơi mới

**Endpoint:** `POST /api/sessions` (Chưa triển khai)

### 4.2 Cập nhật trạng thái game

**Endpoint:** `PUT /api/sessions/:id` (Chưa triển khai)

### 4.3 Lịch sử chơi

**Endpoint:** `GET /api/sessions` (Chưa triển khai)

---

## 5. FRIENDS APIs

> Phần này sẽ được bổ sung khi phát triển các endpoint liên quan đến bạn bè.

### 5.1 Danh sách bạn bè

**Endpoint:** `GET /api/friends` (Chưa triển khai)

### 5.2 Gửi lời mời kết bạn

**Endpoint:** `POST /api/friends/request` (Chưa triển khai)

### 5.3 Chấp nhận/Từ chối lời mời

**Endpoint:** `PUT /api/friends/:id` (Chưa triển khai)

---

## 6. MESSAGES APIs

> Phần này sẽ được bổ sung khi phát triển các endpoint liên quan đến tin nhắn.

### 6.1 Danh sách tin nhắn

**Endpoint:** `GET /api/messages` (Chưa triển khai)

### 6.2 Gửi tin nhắn

**Endpoint:** `POST /api/messages` (Chưa triển khai)

---

## 7. ACHIEVEMENTS APIs

> Phần này sẽ được bổ sung khi phát triển các endpoint liên quan đến thành tích.

### 7.1 Danh sách achievements

**Endpoint:** `GET /api/achievements` (Chưa triển khai)

### 7.2 Achievements của user

**Endpoint:** `GET /api/users/:id/achievements` (Chưa triển khai)

---

## 8. RANKINGS APIs

> Phần này sẽ được bổ sung khi phát triển các endpoint liên quan đến xếp hạng.

### 8.1 Bảng xếp hạng

**Endpoint:** `GET /api/rankings` (Chưa triển khai)

### 8.2 Xếp hạng theo game

**Endpoint:** `GET /api/rankings/:gameId` (Chưa triển khai)

---

## 9. TRẠNG THÁI TÀI KHOẢN (USER STATUS)

### 9.1 Định nghĩa Status

| Status   | Mô tả                                              | Login         | Gọi API       | Tạo tài khoản mới                  |
| -------- | -------------------------------------------------- | ------------- | ------------- | ---------------------------------- |
| active   | Hoạt động bình thường                              | Cho phép      | Cho phép      | -                                  |
| inactive | Tạm khóa (user tự vô hiệu hóa hoặc chưa kích hoạt) | Từ chối (403) | Từ chối (403) | Cho phép (account mới từ email cũ) |
| banned   | Bị cấm vĩnh viễn (vi phạm quy định)                | Từ chối (403) | Từ chối (403) | Không cho phép (cùng email)        |

### 9.2 Xử lý trên Frontend

**Trường hợp 1: User đăng nhập thành công nhưng sau đó bị ban**

1. User đăng nhập, nhận token
2. Admin ban user (status = "banned")
3. User gọi bất kỳ API protected nào
4. Backend trả về 403: "Your account has been banned"
5. Frontend phải:
   - Xóa token khỏi storage
   - Redirect về trang login
   - Hiển thị thông báo phù hợp

**Trường hợp 2: User có status = inactive**

1. User có thể tạo tài khoản mới với email khác
2. User KHÔNG thể đăng nhập với tài khoản inactive
3. Nếu có tính năng "Kích hoạt lại", cần API riêng

**Trường hợp 3: User có status = banned**

1. User KHÔNG thể đăng nhập
2. User KHÔNG thể tạo tài khoản mới với cùng email (vì email đã tồn tại)
3. Không có cách khôi phục tự động, cần liên hệ admin

### 9.3 Error Messages theo Status

```javascript
// Frontend nên xử lý như sau:
if (response.status === 403) {
  if (response.message.includes("banned")) {
    showMessage("Tài khoản của bạn đã bị cấm. Liên hệ admin để biết thêm.");
    logout();
  } else if (response.message.includes("inactive")) {
    showMessage("Tài khoản của bạn đã bị khóa. Vui lòng kích hoạt lại.");
    logout();
  }
}
```

---

## 10. PHÂN QUYỀN (USER ROLES)

### 10.1 Định nghĩa Roles

| Role  | Mô tả             | Quyền hạn                          |
| ----- | ----------------- | ---------------------------------- |
| user  | Người dùng thường | Chơi game, chat, kết bạn           |
| admin | Quản trị cao nhất | + Quản lý user, ban user, thống kê |

### 10.2 Kiểm tra Role trên Frontend

```javascript
// Lấy role từ user profile hoặc token
const user = jwtDecode(token);

if (user.role === "admin") {
  showAdminPanel();
}
// Người dùng thường hiển thị giao diện chuẩn
```

### 10.3 Protected Routes theo Role

| API               | Roles cho phép |
| ----------------- | -------------- |
| GET /api/admin/\* | admin          |
| Các API khác      | user, admin    |

---

## 11. JWT TOKEN

### 11.1 Token Payload

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

### 11.2 Token Expiration

- Token hết hạn sau 7 ngày
- Khi token hết hạn, API trả về 401: "Token expired"
- Frontend phải redirect về login

### 11.3 Xử lý Token trên Frontend

```javascript
// Lưu token
localStorage.setItem("token", response.data.token);

// Gửi token trong header
fetch("/api/auth/profile", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});

// Kiểm tra token hết hạn
function isTokenExpired(token) {
  const payload = jwtDecode(token);
  return payload.exp * 1000 < Date.now();
}
```

---

## 12. ERROR CODES REFERENCE

| HTTP Code | Message                      | Nguyên nhân                  | Xử lý Frontend             |
| --------- | ---------------------------- | ---------------------------- | -------------------------- |
| 400       | Validation failed            | Dữ liệu đầu vào không hợp lệ | Hiển thị lỗi validation    |
| 401       | No token provided            | Thiếu header Authorization   | Redirect login             |
| 401       | Invalid token                | Token sai format hoặc bị sửa | Redirect login             |
| 401       | Token expired                | Token đã hết hạn             | Redirect login             |
| 401       | Invalid username or password | Sai thông tin đăng nhập      | Hiển thị lỗi               |
| 403       | Your account has been banned | User bị cấm                  | Logout + thông báo         |
| 403       | Your account is inactive     | User bị khóa                 | Logout + thông báo         |
| 403       | Access denied                | Không có quyền               | Hiển thị lỗi hoặc redirect |
| 404       | Route not found              | API không tồn tại            | Log lỗi                    |
| 409       | Username already exists      | Username đã tồn tại          | Hiển thị lỗi               |
| 409       | Email already exists         | Email đã tồn tại             | Hiển thị lỗi               |
| 500       | Internal server error        | Lỗi server                   | Hiển thị lỗi chung         |
