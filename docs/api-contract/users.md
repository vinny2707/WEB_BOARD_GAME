# Users APIs (Admin Only)

Tất cả các endpoint trong module này yêu cầu:

- **Authentication**: Bearer token
- **Authorization**: role = admin

---

## 1. Danh sách users

**Endpoint:** `GET /api/users`

**Query Parameters:**

| Param  | Type   | Mô tả                          |
| ------ | ------ | ------------------------------ |
| status | string | Filter: active/inactive/banned |
| role   | string | Filter: admin/user             |
| search | string | Tìm theo username/email/name   |
| page   | int    | Trang (default: 1)             |
| limit  | int    | Số items/trang (default: 10)   |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
  }
}
```

---

## 2. Chi tiết user

**Endpoint:** `GET /api/users/:id`

**Response 200:** User object

---

## 3. Cập nhật user

**Endpoint:** `PUT /api/users/:id`

**Request Body:**

| Field     | Type   | Mô tả                  |
| --------- | ------ | ---------------------- |
| full_name | string | Tên đầy đủ             |
| dob       | string | Ngày sinh (YYYY-MM-DD) |

---

## 4. Đổi role

**Endpoint:** `PATCH /api/users/:id/role`

**Request Body:**

```json
{ "role": "admin" }
```

**Lưu ý:** Admin không thể đổi role của chính mình.

---

## 5. Đổi status (Ban/Unban)

**Endpoint:** `PATCH /api/users/:id/status`

**Request Body:**

```json
{ "status": "banned" }
```

**Status values:**

- `active`: Kích hoạt tài khoản
- `inactive`: Vô hiệu hóa tạm thời
- `banned`: Cấm vĩnh viễn

**Lưu ý:** Admin không thể ban chính mình.

---

## 6. Xóa user

**Endpoint:** `DELETE /api/users/:id`
