# Authentication Flow Integration Test Guide

This document describes how to manually test the authentication flow integration.

## Prerequisites

1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:3000`
3. Database seeded with admin user

## Test Cases

### 1. Login Flow (End-to-End)

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Enter valid admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123` (or your seeded admin password)
3. Click "Sign In" button

**Expected Results:**
- ✅ Login request sent to `/api/auth/login`
- ✅ Backend returns: `{ success: true, message: "...", data: { user, accessToken, refreshToken } }`
- ✅ Frontend unwraps response and extracts `data` field
- ✅ `accessToken` stored in localStorage as `token`
- ✅ `refreshToken` stored in localStorage as `refreshToken`
- ✅ User object stored in localStorage as `user`
- ✅ Redux state updated with user and token
- ✅ User redirected to `/admin/dashboard`
- ✅ Navigation bar shows admin controls

**Verification:**
```javascript
// Check localStorage in browser console
localStorage.getItem('token')         // Should show accessToken
localStorage.getItem('refreshToken')  // Should show refreshToken
localStorage.getItem('user')          // Should show user JSON
```

### 2. Token Storage Security

**Steps:**
1. After successful login, open browser DevTools
2. Check Application > Local Storage

**Expected Results:**
- ✅ `token` key contains JWT accessToken
- ✅ `refreshToken` key contains JWT refreshToken
- ✅ `user` key contains user data (no password)
- ✅ All tokens are properly formatted JWTs

### 3. Auto-Logout on 401

**Test Case 3a: Invalid Token**

**Steps:**
1. Login successfully
2. Open DevTools console
3. Manually corrupt the token:
   ```javascript
   localStorage.setItem('token', 'invalid-token')
   ```
4. Navigate to `/admin/orders` or refresh page

**Expected Results:**
- ✅ Request fails with 401 Unauthorized
- ✅ httpClient interceptor catches 401
- ✅ Attempts token refresh with refreshToken
- ✅ If refresh fails, dispatches `auth:logout` event
- ✅ AuthListener catches event
- ✅ Calls logout action in Redux
- ✅ Clears all tokens from localStorage
- ✅ Redirects to `/admin/login`
- ✅ Shows appropriate error message

**Test Case 3b: No Refresh Token**

**Steps:**
1. Login successfully
2. Remove refresh token:
   ```javascript
   localStorage.removeItem('refreshToken')
   ```
3. Manually corrupt the access token:
   ```javascript
   localStorage.setItem('token', 'invalid-token')
   ```
4. Navigate to `/admin/orders` or make an API call

**Expected Results:**
- ✅ Request fails with 401
- ✅ httpClient finds no refresh token
- ✅ Immediately dispatches `auth:logout` event
- ✅ Clears tokens and redirects to login

### 4. Token Refresh Mechanism

**Steps:**
1. Login successfully
2. Wait for access token to expire (or manually set expired token)
3. Make any authenticated API request

**Expected Results:**
- ✅ Request fails with 401
- ✅ httpClient intercepts 401
- ✅ Checks for refresh token
- ✅ Calls `/api/auth/refresh` with refreshToken
- ✅ Backend returns: `{ success: true, data: { user, accessToken, refreshToken } }`
- ✅ Frontend unwraps response
- ✅ Updates localStorage with new tokens
- ✅ Retries original request with new token
- ✅ Original request succeeds

**Concurrent Requests:**
- ✅ Multiple failed requests queue up during refresh
- ✅ All queued requests retry with new token after refresh
- ✅ Only one refresh request is made

### 5. Logout Functionality

**Steps:**
1. Login successfully
2. Navigate to dashboard
3. Click "Logout" button (in AdminNavbar)

**Expected Results:**
- ✅ Calls `authApi.logout()`
- ✅ Sends POST to `/api/auth/logout` (best effort)
- ✅ Clears all tokens using `TokenManager.clearAll()`
- ✅ Dispatches logout action to Redux
- ✅ Clears Redux auth state
- ✅ Removes `token`, `refreshToken`, `user` from localStorage
- ✅ Redirects to `/admin/login`

**Edge Case: Logout with Network Error**
- ✅ Even if logout API fails, tokens are still cleared
- ✅ User is still logged out locally
- ✅ Redirects to login page

### 6. Backend Error Display

**Test Case 6a: Invalid Credentials**

**Steps:**
1. Navigate to login page
2. Enter incorrect credentials
3. Click "Sign In"

**Expected Results:**
- ✅ Request returns 401 with error message
- ✅ httpClient extracts error from response
- ✅ Error format: `{ message: "...", type: "UNAUTHORIZED", status: 401 }`
- ✅ LoginPage displays error message in ErrorMessage component
- ✅ Error message shows: "Invalid credentials" or backend's error message

**Test Case 6b: Network Error**

**Steps:**
1. Stop backend server
2. Try to login

**Expected Results:**
- ✅ httpClient detects network error
- ✅ Returns: `{ message: "Network error. Please check your connection.", type: "NETWORK_ERROR" }`
- ✅ Error displayed to user

**Test Case 6c: Server Error (500)**

**Steps:**
1. Trigger a server error (e.g., database down)
2. Try to login

**Expected Results:**
- ✅ httpClient catches 500 error
- ✅ Returns: `{ message: "Server error. Please try again later.", type: "SERVER_ERROR", status: 500 }`
- ✅ Error displayed to user

### 7. Protected Routes

**Test Case 7a: Access Without Login**

**Steps:**
1. Clear all localStorage
2. Navigate directly to `/admin/dashboard`

**Expected Results:**
- ✅ ProtectedRoute checks `isAuthenticated`
- ✅ Redirects to `/admin/login`

**Test Case 7b: Access with Non-Admin User**

**Steps:**
1. Login with regular user account (not admin)
2. Try to access `/admin/dashboard`

**Expected Results:**
- ✅ ProtectedRoute checks `user.role !== 'admin'`
- ✅ Redirects to `/admin/login`
- ✅ Shows error message: "Access denied. Admin credentials required."

### 8. Session Persistence

**Steps:**
1. Login successfully
2. Close browser tab
3. Open new tab and navigate to `/admin/dashboard`

**Expected Results:**
- ✅ Auth state loads from localStorage
- ✅ User remains logged in
- ✅ Dashboard displays correctly
- ✅ If token expired, auto-refresh occurs

### 9. Concurrent Login Sessions

**Steps:**
1. Login in Browser 1
2. Login in Browser 2 with same account
3. Make requests from both browsers

**Expected Results:**
- ✅ Both sessions work independently
- ✅ Each has its own token pair
- ✅ Logout in one browser doesn't affect the other

## Integration Checklist

- [x] Login endpoint calls correct backend URL (`/api/auth/login`)
- [x] Response unwrapping handles backend format correctly
- [x] Token field naming uses `accessToken` (not `token`)
- [x] User object properly extracted from response
- [x] Tokens stored in localStorage securely
- [x] Redux state updated correctly
- [x] Auto-logout on 401 triggers properly
- [x] Token refresh mechanism implemented
- [x] Concurrent request queuing during refresh
- [x] Logout clears all stored data
- [x] Error messages extracted from backend responses
- [x] Protected routes enforce authentication
- [x] Admin role checking works correctly

## API Response Format Reference

### Backend Success Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "123",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Backend Error Response Format
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Invalid credentials",
  "statusCode": 401
}
```

## Browser Console Debugging

### Check Current Auth State
```javascript
// Check Redux state
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__

// Check localStorage
console.log('Token:', localStorage.getItem('token'))
console.log('Refresh Token:', localStorage.getItem('refreshToken'))
console.log('User:', JSON.parse(localStorage.getItem('user')))

// Test auth event
window.dispatchEvent(new CustomEvent('auth:logout'))
```

### Manually Trigger Logout
```javascript
window.dispatchEvent(new CustomEvent('auth:logout'))
```

## Notes

- All tests should be performed with browser DevTools Network tab open to observe API calls
- Check Redux DevTools to observe state changes
- Verify localStorage updates after each action
- Test on multiple browsers for compatibility
