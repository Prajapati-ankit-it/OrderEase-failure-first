# User Profile & Session Sync Implementation

## Overview
This implementation ensures user profile and permissions are properly synced with the backend, removing all hardcoded user data and role checks.

## Key Changes

### 1. Module Structure Created
- `src/modules/user/api/` - User API services
- `src/modules/user/constants/` - User role constants matching backend
- `src/modules/user/hooks/` - User profile hooks

### 2. API Endpoint Corrections
- Fixed profile endpoint from `/auth/profile` to `/user/profile`
- Added USER endpoints section to API config
- Updated auth.api.js to use correct endpoint

### 3. User Role Constants
Created `UserRole` enum matching backend:
```javascript
export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};
```

Helper functions:
- `isAdmin(user)` - Check if user has admin role
- `isUser(user)` - Check if user has user role
- `hasValidRole(user)` - Check if user has valid role

### 4. Profile Loading & Sync

#### ProfileLoader Component
- Automatically loads user profile on app initialization if token exists
- Listens for `auth:tokenRefreshed` events to reload profile
- Ensures profile data is always fresh from backend

#### httpClient Updates
- Dispatches `auth:tokenRefreshed` event when token is refreshed
- Maintains token refresh queue to handle concurrent requests

### 5. State Management

#### authSlice Changes
- **Removed** hardcoded localStorage user initialization
- User data is now `null` initially and loaded via `fetchUserProfile` thunk
- Profile is fetched from backend, not localStorage

#### authPersistenceMiddleware Changes
- **Only persists token** to localStorage
- **Does NOT persist user data** to localStorage
- User data always comes fresh from backend

### 6. Protected Routes
Updated `App.js` ProtectedRoute to use `UserRole.ADMIN` constant instead of hardcoded `'admin'` string.

## Permission Flow

### Backend Enforcement
1. Backend controllers use `@Auth()` decorator to require authentication
2. Backend checks JWT token and extracts user role
3. Backend enforces role-based access control

### Frontend Checks
1. ProtectedRoute component checks `isAuthenticated` and `user.role`
2. If user is not admin, redirects to login page
3. All admin routes are wrapped with ProtectedRoute

### Profile Sync Flow
```
App Start
  ↓
Check if token exists in localStorage
  ↓
If token exists, ProfileLoader fetches profile from backend
  ↓
Profile loaded into Redux state
  ↓
ProtectedRoute uses profile data to check permissions
  ↓
If permission check fails, redirect to login
```

### Token Refresh Flow
```
API call returns 401
  ↓
httpClient intercepts and refreshes token
  ↓
Token refreshed successfully
  ↓
Dispatch 'auth:tokenRefreshed' event
  ↓
ProfileLoader hears event and reloads profile
  ↓
Profile updated in Redux state
```

## Testing

### User API Tests
- `user.api.test.js` - Tests all user API endpoints
  - getProfile
  - updateProfile
  - updatePassword
  - getUserOrders

### User Constants Tests
- `userRoles.test.js` - Tests role constants and helper functions
  - UserRole enum values
  - isAdmin() helper
  - isUser() helper
  - hasValidRole() helper

### Existing Tests Updated
- `auth.api.test.js` - Updated refreshToken test to verify token is set

## Usage Examples

### Using User Profile Hook
```javascript
import { useUserProfile } from '../modules/user';

function ProfilePage() {
  const { user, loading, refreshProfile, updateProfile } = useUserProfile();
  
  const handleUpdate = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      // Profile updated
    }
  };
  
  return <div>{user?.name}</div>;
}
```

### Checking User Role
```javascript
import { UserRole, isAdmin } from '../modules/user/constants';

function AdminButton() {
  const { user } = useSelector(state => state.auth);
  
  if (!isAdmin(user)) {
    return null;
  }
  
  return <button>Admin Action</button>;
}
```

### Protected Route Usage
```javascript
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

## Security Considerations

1. **No Hardcoded Roles** - All role checks use backend constants
2. **Fresh Profile Data** - Profile always loaded from backend, not stale localStorage
3. **Token Refresh** - Automatic token refresh with profile sync
4. **Backend Enforcement** - Primary security is at backend with JWT validation
5. **Frontend Checks** - Supplementary UX checks to hide UI elements

## Migration Notes

If you need to access user profile in existing code:

**Before:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
```

**After:**
```javascript
import { useSelector } from 'react-redux';

const user = useSelector(state => state.auth.user);
```

**Before:**
```javascript
if (user.role === 'admin') { ... }
```

**After:**
```javascript
import { UserRole } from './modules/user/constants';

if (user?.role === UserRole.ADMIN) { ... }
```

## Future Enhancements

1. Add permission-based UI components (e.g., `<RequirePermission role="ADMIN">`)
2. Add more granular permissions beyond just roles
3. Consider adding refresh profile button in user settings
4. Add profile caching with TTL to reduce API calls
