# Friends API Documentation for Frontend

## Overview
Complete API documentation for Friend management system. All endpoints require authentication.

## Authentication
All requests must include:
```javascript
headers: {
  'X-API-Key': 'boardgame-app-key-2026-secure',
  'Authorization': 'Bearer <JWT_TOKEN>'
}
```

---

## API Endpoints (11 total)

### 1. Get Friends List
**GET** `/api/friends?status=accepted`

**Query Parameters:**
- `status` (optional): `accepted` | `pending` | `blocked` (default: `accepted`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "friendship_id": 1,
      "friend": {
        "id": 3,
        "username": "jane_smith",
        "full_name": "Jane Smith",
        "email": "jane@example.com",
        "status": "active"
      },
      "status": "accepted",
      "created_at": "2025-12-15T10:30:00Z",
      "updated_at": "2025-12-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Incoming Friend Requests
**GET** `/api/friends/requests/pending`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "friendship_id": 5,
      "requester": {
        "id": 8,
        "username": "robert_miller",
        "full_name": "Robert Miller",
        "email": "robert@example.com"
      },
      "created_at": "2026-01-13T15:20:00Z"
    }
  ]
}
```

**UI Logic:**
```javascript
// Show "Accept" and "Reject" buttons for each request
requests.forEach(req => {
  showButtons(['Accept', 'Reject'], req.requester.id);
});
```

---

### 3. Get Outgoing Friend Requests
**GET** `/api/friends/requests/sent`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "friendship_id": 4,
      "recipient": {
        "id": 9,
        "username": "lisa_garcia",
        "full_name": "Lisa Garcia",
        "email": "lisa@example.com"
      },
      "created_at": "2026-01-14T09:15:00Z"
    }
  ]
}
```

**UI Logic:**
```javascript
// Show "Cancel Request" button for each sent request
sentRequests.forEach(req => {
  showButton('Cancel Request', req.recipient.id);
});
```

---

### 4. Check Friendship Status 
**GET** `/api/friends/status/:userId`

**Parameters:**
- `userId`: ID of user to check status with

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "direction": "incoming",
    "friendship_id": 10
  }
}
```

**Possible Values:**

| status | direction | Meaning | UI Action |
|--------|-----------|---------|-----------|
| `null` | `null` | No relationship | Show **"Add Friend"** |
| `pending` | `incoming` | They sent request | Show **"Accept / Reject"** |
| `pending` | `outgoing` | You sent request | Show **"Cancel Request"** |
| `accepted` | `mutual` | Friends | Show **"Unfriend / Message"** |
| `blocked` | `outgoing` | You blocked them | Show **"Unblock"** |

**UI Logic Example:**
```javascript
const { status, direction } = await checkFriendshipStatus(userId);

if (status === null) {
  showButton('Add Friend');
} else if (status === 'pending' && direction === 'incoming') {
  showButtons(['Accept', 'Reject']);
} else if (status === 'pending' && direction === 'outgoing') {
  showButton('Cancel Request');
} else if (status === 'accepted') {
  showButtons(['Unfriend', 'Message']);
} else if (status === 'blocked') {
  showButton('Unblock');
}
```

---

### 5. Send Friend Request
**POST** `/api/friends/request`

**Request Body:**
```json
{
  "friendId": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "user_id": 2,
    "friend_id": 5,
    "status": "pending",
    "created_at": "2026-01-15T20:30:00Z"
  },
  "message": "Friend request sent successfully"
}
```

**Error Cases:**
- `400`: Cannot send to yourself
- `404`: User not found
- `409`: Already friends / Request already sent
- `403`: Cannot send to blocked user

---

### 6. Accept Friend Request
**PUT** `/api/friends/:requesterId/accept`

**Parameters:**
- `requesterId`: ID of user who sent the request

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "user_id": 8,
    "friend_id": 2,
    "status": "accepted",
    "updated_at": "2026-01-15T20:35:00Z"
  },
  "message": "Friend request accepted"
}
```

---

### 7. Reject Friend Request
**PUT** `/api/friends/:requesterId/reject`

**Parameters:**
- `requesterId`: ID of user who sent the request

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Friend request rejected"
}
```

**Note:** Record is **DELETED**, so they can send request again later.

---

### 8. Cancel Sent Request
**DELETE** `/api/friends/:friendId/cancel`

**Parameters:**
- `friendId`: ID of user you sent request to

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Friend request cancelled"
}
```

---

### 9. Unfriend
**DELETE** `/api/friends/:friendId`

**Parameters:**
- `friendId`: ID of friend to remove

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Friend removed successfully"
}
```

---

### 10. Block User
**PUT** `/api/friends/:userId/block`

**Parameters:**
- `userId`: ID of user to block

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "user_id": 2,
    "friend_id": 11,
    "status": "blocked",
    "updated_at": "2026-01-15T20:40:00Z"
  },
  "message": "User blocked successfully"
}
```

---

### 11. Unblock User
**PUT** `/api/friends/:userId/unblock`

**Parameters:**
- `userId`: ID of user to unblock

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "User unblocked successfully"
}
```

**Note:** Record is **DELETED**, so they can send friend request again.

---

## Complete User Flow

### Scenario 1: Send Friend Request
```javascript
// 1. Check status first
const status = await GET('/api/friends/status/5');
// { status: null, direction: null }

// 2. Send request
await POST('/api/friends/request', { friendId: 5 });

// 3. Check status again
const newStatus = await GET('/api/friends/status/5');
// { status: "pending", direction: "outgoing" }
```

### Scenario 2: Accept Friend Request
```javascript
// 1. Get pending requests
const requests = await GET('/api/friends/requests/pending');
// [{ requester: { id: 8, ... }, ... }]

// 2. Accept request
await PUT('/api/friends/8/accept');

// 3. Now they're in friends list
const friends = await GET('/api/friends?status=accepted');
```

### Scenario 3: Block and Unblock
```javascript
// 1. Block user
await PUT('/api/friends/11/block');

// 2. Check status
const status = await GET('/api/friends/status/11');
// { status: "blocked", direction: "outgoing" }

// 3. Unblock
await PUT('/api/friends/11/unblock');

// 4. Status is now null
const newStatus = await GET('/api/friends/status/11');
// { status: null, direction: null }
```

---

## UI Component Example

```javascript
// FriendButton.jsx
function FriendButton({ userId }) {
  const [friendStatus, setFriendStatus] = useState(null);

  useEffect(() => {
    checkStatus();
  }, [userId]);

  const checkStatus = async () => {
    const res = await api.get(`/friends/status/${userId}`);
    setFriendStatus(res.data);
  };

  const handleAction = async (action) => {
    switch(action) {
      case 'add':
        await api.post('/friends/request', { friendId: userId });
        break;
      case 'accept':
        await api.put(`/friends/${userId}/accept`);
        break;
      case 'reject':
        await api.put(`/friends/${userId}/reject`);
        break;
      case 'cancel':
        await api.delete(`/friends/${userId}/cancel`);
        break;
      case 'unfriend':
        await api.delete(`/friends/${userId}`);
        break;
      case 'block':
        await api.put(`/friends/${userId}/block`);
        break;
      case 'unblock':
        await api.put(`/friends/${userId}/unblock`);
        break;
    }
    checkStatus(); // Refresh status
  };

  const { status, direction } = friendStatus || {};

  if (status === null) {
    return <Button onClick={() => handleAction('add')}>Add Friend</Button>;
  }
  
  if (status === 'pending' && direction === 'incoming') {
    return (
      <>
        <Button onClick={() => handleAction('accept')}>Accept</Button>
        <Button onClick={() => handleAction('reject')}>Reject</Button>
      </>
    );
  }
  
  if (status === 'pending' && direction === 'outgoing') {
    return <Button onClick={() => handleAction('cancel')}>Cancel Request</Button>;
  }
  
  if (status === 'accepted') {
    return (
      <>
        <Button onClick={() => handleAction('unfriend')}>Unfriend</Button>
        <Button onClick={() => navigate(`/messages/${userId}`)}>Message</Button>
      </>
    );
  }
  
  if (status === 'blocked') {
    return <Button onClick={() => handleAction('unblock')}>Unblock</Button>;
  }
}
```

---

## Notes

1. **Authentication Required:** All endpoints need JWT token
2. **API Key Required:** Include `X-API-Key` header
3. **Reject = DELETE:** Rejected requests are deleted, not stored
4. **Bidirectional:** Friends can see each other in friends list
5. **Status Check:** Always check status before showing UI buttons
6. **Error Handling:** Handle 401, 403, 404, 409 errors appropriately
---

## Swagger Documentation
Full interactive API docs: `https://localhost:3000/api-docs`
