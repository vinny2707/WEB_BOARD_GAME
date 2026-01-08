# Authentication APIs

## 1. Đăng ký tài khoản (Bước 1 - Gửi OTP)

**Endpoint:** `POST /api/auth/register`

**Mô tả:** Khởi tạo đăng ký và gửi OTP qua email. User chưa được tạo cho đến khi verify OTP thành công.

**Request Body:**

| Field     | Type   | Bắt buộc | Ràng buộc                         |
| --------- | ------ | -------- | --------------------------------- |
| username  | string | Có       | 3-50 ký tự, chỉ chứa [a-zA-Z0-9_] |
| email     | string | Có       | Email hợp lệ, unique              |
| password  | string | Có       | Tối thiểu 6 ký tự                 |
| full_name | string | Không    | Tối đa 100 ký tự                  |
| dob       | string | Không    | Format: YYYY-MM-DD                |

**Response 200 (OTP đã gửi):**

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "otpSessionId": "550e8400-e29b-41d4-a716-446655440000",
    "maskedEmail": "n***r@example.com",
    "otpExpiresIn": 300
  }
}
```

**Errors:** 400 (validation), 403 (email banned), 409 (already exists)

---

## 2. Xác thực OTP (Bước 2 - Hoàn tất đăng ký)

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**

| Field        | Type   | Bắt buộc | Ràng buộc             |
| ------------ | ------ | -------- | --------------------- |
| otpSessionId | string | Có       | UUID từ bước register |
| otpCode      | string | Có       | 6 chữ số              |

**Response 201 (Đăng ký thành công):**

```json
{
  "success": true,
  "message": "Email verified successfully. Registration complete!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 15,
      "username": "newuser",
      "role": "user",
      "status": "active"
    }
  }
}
```

**Errors:** 400 (invalid/expired OTP), 404 (session not found), 429 (max attempts)

---

## 3. Gửi lại OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Request Body:**

| Field        | Type   | Bắt buộc |
| ------------ | ------ | -------- |
| otpSessionId | string | Có       |

**Response 200:** Trả về otpSessionId, maskedEmail, otpExpiresIn mới

---

## 4. Đăng nhập

**Endpoint:** `POST /api/auth/login`

**Request Body:**

| Field    | Type   | Bắt buộc |
| -------- | ------ | -------- |
| username | string | Có       |
| password | string | Có       |

**Response 200 (Active user):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "status": "active"
    }
  }
}
```

**Response 200 (Inactive user - cần OTP):**

```json
{
  "success": true,
  "message": "Account inactive. OTP sent for reactivation.",
  "data": {
    "requiresOtp": true,
    "otpSessionId": "550e8400-e29b-41d4-a716-446655440000",
    "maskedEmail": "a***n@example.com",
    "otpExpiresIn": 300
  }
}
```

**Lưu ý về Inactive:**

- Admin set status = inactive → yêu cầu OTP
- User đã có last_login + 14 ngày không login → auto set inactive + yêu cầu OTP
- User mới đăng ký (last_login = null) → cho login bình thường

**Errors:** 401 (wrong credentials), 403 (banned)

---

## 5. Đăng xuất

**Endpoint:** `POST /api/auth/logout`

**Response 200:** `{ "success": true, "message": "Logout successful" }`

**Lưu ý:** Backend không quản lý session. Frontend cần xóa token khỏi storage.

---

## 6. Lấy thông tin profile

**Endpoint:** `GET /api/auth/profile`

**Headers:** `Authorization: Bearer {token}` (Bắt buộc)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@boardgame.com",
    "full_name": "Administrator",
    "role": "admin",
    "status": "active",
    "last_login": "2026-01-08T07:00:00.000Z"
  }
}
```

---

## 7. Cập nhật profile

**Endpoint:** `PUT /api/auth/profile`

**Headers:** `Authorization: Bearer {token}` (Bắt buộc)

**Request Body:**

| Field     | Type   | Bắt buộc |
| --------- | ------ | -------- |
| full_name | string | Không    |
| dob       | string | Không    |

**Lưu ý:** User KHÔNG được phép thay đổi username, email, role, status.

---

## 8. Quên mật khẩu (Gửi OTP)

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**

| Field | Type   | Bắt buộc |
| ----- | ------ | -------- |
| email | string | Có       |

**Response 200:**

```json
{
  "success": true,
  "message": "OTP sent to your email for password reset.",
  "data": {
    "otpSessionId": "550e8400-e29b-41d4-a716-446655440000",
    "maskedEmail": "u***r@example.com",
    "otpExpiresIn": 300
  }
}
```

**Errors:** 404 (email not found), 403 (banned)

---

## 9. Đặt lại mật khẩu

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**

| Field        | Type   | Bắt buộc | Ràng buộc               |
| ------------ | ------ | -------- | ----------------------- |
| otpSessionId | string | Có       | UUID từ forgot-password |
| otpCode      | string | Có       | 6 chữ số                |
| newPassword  | string | Có       | Tối thiểu 6 ký tự       |

**Response 200:**

```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

**Errors:** 400 (invalid/expired OTP), 429 (max attempts)

**Lưu ý:** Nếu user đang inactive, reset password sẽ tự động kích hoạt lại account.
