# TÀI LIỆU LUỒNG HOẠT ĐỘNG BACKEND

## 1. TỔNG QUAN HỆ THỐNG

Backend được xây dựng trên nền tảng Node.js với Express.js 5.x, sử dụng PostgreSQL (Supabase) làm database. Hệ thống hỗ trợ xác thực bằng JWT và phân quyền theo vai trò.

### 1.1 Công nghệ sử dụng

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL (Supabase)
- **ORM**: Knex.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs (10 rounds)
- **Validation**: express-validator
- **API Documentation**: Swagger/OpenAPI 3.0

### 1.2 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Cấu hình database, swagger
│   ├── controllers/     # Xử lý request/response
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Tiện ích (logger, response helpers)
├── migrations/          # Database migrations
├── seeds/               # Dữ liệu mẫu
└── server.js            # Entry point
```

---

## 2. LUỒNG XÁC THỰC (AUTHENTICATION FLOW)

### 2.1 Đăng ký tài khoản (Register)

```
Client                          Server                         Database
  |                               |                               |
  |-- POST /api/auth/register --> |                               |
  |   {username, email, password} |                               |
  |                               |-- Validate input -----------> |
  |                               |-- Check username unique ----> |
  |                               |<-- Kết quả ----------------- |
  |                               |-- Check email unique -------> |
  |                               |<-- Kết quả ----------------- |
  |                               |-- Hash password (bcrypt) ---> |
  |                               |-- INSERT user -------------> |
  |                               |<-- User đã tạo ------------- |
  |<-- 201 Created, user data --- |                               |
```

**Quy tắc:**

- Username phải duy nhất (unique)
- Email phải duy nhất (unique)
- Password được hash trước khi lưu (bcrypt, 10 rounds)
- User mới được tạo với status = "active" và role = "user"

### 2.2 Đăng nhập (Login)

```
Client                          Server                         Database
  |                               |                               |
  |-- POST /api/auth/login -----> |                               |
  |   {username, password}        |                               |
  |                               |-- Tìm user theo username ---> |
  |                               |<-- User data hoặc null ------ |
  |                               |                               |
  |                               |-- [1] Kiểm tra user tồn tại   |
  |                               |-- [2] Kiểm tra status = active|
  |                               |-- [3] Xác thực password       |
  |                               |                               |
  |                               |-- Tạo JWT token               |
  |                               |-- Cập nhật last_login ------> |
  |<-- 200 OK, {token, user} ---- |                               |
```

**Quy tắc:**

- User không tồn tại: trả về 401
- User có status = "inactive" hoặc "banned": trả về 403
- Password sai: trả về 401
- Thành công: trả về JWT token (hết hạn sau 7 ngày)

### 2.3 Truy cập Protected Routes

```
Client                          Server                         Database
  |                               |                               |
  |-- GET /api/auth/profile ----> |                               |
  |   Header: Bearer <token>      |                               |
  |                               |-- Xác thực JWT token          |
  |                               |-- Query user từ DB ---------> |
  |                               |<-- User data ----------------- |
  |                               |-- Kiểm tra status = active    |
  |                               |                               |
  |<-- 200 OK, user profile ----- |                               |
```

**Bảo mật realtime:**

- Mỗi request đều query DB để kiểm tra status hiện tại
- Nếu user bị ban giữa session, các request tiếp theo sẽ bị từ chối (403)
- Token hết hạn: trả về 401

---

## 3. PHÂN QUYỀN (AUTHORIZATION)

### 3.1 Vai trò (Roles)

| Role  | Mô tả             | Quyền hạn                     |
| ----- | ----------------- | ----------------------------- |
| user  | Người dùng thường | Truy cập các chức năng cơ bản |
| admin | Quản trị cao nhất | Toàn quyền hệ thống           |

### 3.2 Trạng thái tài khoản (Status)

| Status   | Mô tả                 | Ảnh hưởng                                                   |
| -------- | --------------------- | ----------------------------------------------------------- |
| active   | Hoạt động bình thường | Truy cập đầy đủ                                             |
| inactive | Tạm khóa              | Không thể đăng nhập hoặc gọi API, có thể đăng ký email khác |
| banned   | Bị cấm vĩnh viễn      | Không thể đăng nhập, gọi API, hoặc đăng ký với cùng email   |

### 3.3 Middleware phân quyền

```javascript
// Sử dụng trong routes
router.get("/admin", authenticateJWT, authorize("admin"), handler);
router.get("/all-users", authenticateJWT, authorize("admin", "user"), handler);
```

---

## 4. XỬ LÝ LỖI (ERROR HANDLING)

### 4.1 HTTP Status Codes

| Code | Ý nghĩa               | Sử dụng                               |
| ---- | --------------------- | ------------------------------------- |
| 200  | OK                    | Request thành công                    |
| 201  | Created               | Tạo mới thành công                    |
| 400  | Bad Request           | Dữ liệu đầu vào không hợp lệ          |
| 401  | Unauthorized          | Chưa xác thực hoặc token không hợp lệ |
| 403  | Forbidden             | Không có quyền truy cập               |
| 404  | Not Found             | Không tìm thấy tài nguyên             |
| 409  | Conflict              | Trùng lặp dữ liệu (username, email)   |
| 500  | Internal Server Error | Lỗi server                            |

### 4.2 Response Format

**Thành công:**

```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... }
}
```

**Thất bại:**

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "data": null
}
```

**Validation Error:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

---

## 5. BẢO MẬT (SECURITY)

### 5.1 JWT Token

- **Algorithm**: HS256
- **Expiration**: 7 ngày (cấu hình được)
- **Payload**: userId, username, email, role
- **Secret**: Tối thiểu 32 ký tự

### 5.2 Password

- **Hashing**: bcrypt
- **Salt Rounds**: 10 (cấu hình được)
- **Validation**: Tối thiểu 6 ký tự

### 5.3 CORS

- Chỉ cho phép origin được cấu hình trong .env
- Mặc định: http://localhost:5173

### 5.4 Row Level Security (RLS)

- Đã bật RLS cho tất cả các bảng trong Supabase
- Backend sử dụng service role để truy cập dữ liệu

---

## 6. LOGGING

### 6.1 HTTP Request Logging

Mỗi request đều được ghi log với format:

```
[14:21:47] GET     /api/auth/profile 200 15.234 ms
[14:21:48] POST    /api/auth/login   401 25.123 ms
```

### 6.2 Application Logging

```javascript
logger.info("Thông tin");
logger.success("Thành công");
logger.warn("Cảnh báo");
logger.error("Lỗi");
logger.debug("Debug (chỉ hiện trong dev)");
```

---

## 7. CẤU HÌNH MÔI TRƯỜNG

### 7.1 Biến môi trường bắt buộc

| Biến           | Mô tả                                   | Bắt buộc               |
| -------------- | --------------------------------------- | ---------------------- |
| DATABASE_URL   | Connection string PostgreSQL            | Có                     |
| JWT_SECRET     | Secret key cho JWT (tối thiểu 32 ký tự) | Có                     |
| JWT_EXPIRES_IN | Thời gian hết hạn token                 | Không (mặc định: 7d)   |
| PORT           | Cổng server                             | Không (mặc định: 3000) |
| CORS_ORIGIN    | Domain cho phép CORS                    | Không                  |
| BCRYPT_ROUNDS  | Số vòng hash password                   | Không (mặc định: 10)   |

### 7.2 Khởi động server

Server sẽ tự động kiểm tra:

1. JWT_SECRET phải được cấu hình
2. JWT_SECRET nên dài tối thiểu 32 ký tự
3. Database connection phải hoạt động
