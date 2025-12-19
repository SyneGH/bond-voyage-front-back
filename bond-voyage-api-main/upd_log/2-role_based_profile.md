# 🔐 BondVoyage Authentication API Documentation
# Role-based Profile

# 🟢 Hosting is live 🟢

## Base URL
- **Development:** `http://localhost:8087/api/v1`
- **Production:** `https://bond-voyage-api.onrender.com/api/v1`

---

## 🔑 Authentication Endpoints

### 1. **Register New User**

**Endpoint:** `POST /auth/register`

**Request Payload:**
```json
{
  "firstName": "John",
  "middleName": "Michael",  // Optional
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecurePass123!",
  "role": "USER",  // Optional, defaults to "USER", can be "ADMIN"
  "birthday": "1990-01-15",
  "employeeId": "EMP001"  // Optional, auto-generated if not provided
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cminv8eh40000126zyqv2il5o",
      "firstName": "John",
      "middleName": "Michael",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "employeeId": "EMP001",
      "birthday": "1990-01-15T00:00:00.000Z",
      "email": "john.doe@example.com",
      "role": "USER",
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2025-12-02T00:54:34.313Z",
      "updatedAt": "2025-12-02T00:54:34.313Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**409 Conflict** - User already exists:
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**Notes:**
- Password must contain: uppercase, lowercase, number, special character, min 8 chars
- Phone number must be valid format (E.164 recommended)
- Email must be unique
- EmployeeId must be unique
- PhoneNumber must be unique
- `refreshToken` cookie is automatically set (httpOnly, secure)

---

### 2. **Login**

**Endpoint:** `POST /auth/login`

**Request Payload:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Success Response (200 OK) - Current Implementation:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cminv8eh40000126zyqv2il5o",
      "firstName": "Admin",
      "middleName": null,
      "lastName": "User",
      "phoneNumber": "+1234567890",
      "employeeId": "00002616",
      "birthday": null,
      "email": "admin@example.com",
      "role": "ADMIN",
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2025-12-02T00:54:34.313Z",
      "updatedAt": "2025-12-02T00:54:34.313Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Success Response (200 OK) - Planned Admin Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "phone": "+1234567890",
      "location": "New York, USA",
      "companyName": "BondVoyage Inc.",
      "yearsInOperation": "5",
      "customerRating": "4.85"
    }
  }
}
```

**Success Response (200 OK) - Planned User Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "firstName": "Regular",
      "lastName": "User",
      "email": "user@example.com",
      "phone": "+1234567891",
      "address": "123 Main Street, Los Angeles, CA 90001"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**403 Forbidden** - Account deactivated:
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

**Notes:**
- `accessToken` expires in 14 minutes
- `refreshToken` cookie is set (httpOnly, secure, 7 days expiry)
- Store `accessToken` in memory (NOT localStorage for security)
- Use `refreshToken` cookie for token refresh

---

### 3. **Refresh Access Token**

**Endpoint:** `POST /auth/refresh-token`

**Request:** No body required (uses httpOnly cookie)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**401 Unauthorized** - Missing or invalid refresh token:
```json
{
  "success": false,
  "message": "Refresh token required"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

**Notes:**
- Automatically rotates refresh token (old one invalidated)
- New refresh token set in httpOnly cookie
- Call this endpoint when access token expires (401 on API calls)

---

### 4. **Logout (Current Device)**

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:** No body required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Notes:**
- Removes refresh token from database
- Clears httpOnly cookie
- User must re-login to access protected routes

---

### 5. **Logout All Devices**

**Endpoint:** `POST /auth/logout-all`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:** No body required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

**Notes:**
- Removes ALL refresh tokens for this user
- Logs out from all browsers/devices
- User must re-login on all devices

---

### 6. **Get User Profile**

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:** No body required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "cminv8eh40000126zyqv2il5o",
      "firstName": "Admin",
      "middleName": null,
      "lastName": "User",
      "phoneNumber": "+1234567890",
      "employeeId": "00002616",
      "birthday": null,
      "email": "admin@example.com",
      "role": "ADMIN",
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2025-12-02T00:54:34.313Z",
      "updatedAt": "2025-12-02T00:54:34.313Z"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized** - Invalid/expired token:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 🔄 Password Reset Flow

### 7. **Send OTP (Step 1)**

**Endpoint:** `POST /auth/send-otp`

**Request Payload:**
```json
{
  "email": "user@example.com",
  "firstName": "Jane"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Email and first name are required"
}
```

**Notes:**
- OTP is 6 digits
- Valid for 10 minutes
- Sent to user's email address
- User should check spam folder if not received

---

### 8. **Verify OTP (Step 2)**

**Endpoint:** `POST /auth/verify-otp`

**Request Payload:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You may now reset your password."
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "success": false,
  "message": "Email and OTP are required"
}
```

**400 Bad Request** - OTP expired:
```json
{
  "success": false,
  "message": "OTP has expired or is invalid"
}
```

**400 Bad Request** - Wrong OTP:
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**Notes:**
- Creates a 5-minute reset session in Redis
- OTP is consumed after verification (can't be reused)
- User must call reset password within 5 minutes

---

### 9. **Reset Password (Step 3)**

**Endpoint:** `POST /auth/reset-password`

**Request Payload:**
```json
{
  "email": "user@example.com",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "success": false,
  "message": "Email and new password are required"
}
```

**401 Unauthorized** - Session expired:
```json
{
  "success": false,
  "message": "Session expired or unauthorized. Please verify OTP again."
}
```

**Notes:**
- Must be called within 5 minutes of OTP verification
- All refresh tokens are cleared (user logged out from all devices)
- User must login again with new password
- Password requirements: 8+ chars, uppercase, lowercase, number, special char

---


## 📊 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | User registered successfully |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | Invalid credentials, expired token |
| 403 | Forbidden | Account deactivated |
| 409 | Conflict | User already exists |
| 500 | Internal Server Error | Server error |

---

## 🧪 Test Credentials

After running database seed:

**Admin Account:**
```
Email: admin@example.com
Password: Admin@123
Employee ID: 00002616
```

**User Account:**
```
Email: user@example.com
Password: User@123
Employee ID: 00002617
```

**Additional Admin:**
```
Email: sarah.admin@example.com
Password: Admin@123
Employee ID: ADMIN002
```

**Additional User:**
```
Email: jane.user@example.com
Password: User@123
Employee ID: USER002
```

---

**Last Updated:** December 2, 2025  
**API Version:** 1.0.0  
**Backend Status:** ✅ Deployed on Render
