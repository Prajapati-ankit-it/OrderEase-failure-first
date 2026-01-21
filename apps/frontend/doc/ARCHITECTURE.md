# Frontend Architecture Documentation

## Overview

This document describes the frontend architecture of the OrderEase application, which follows clean architecture principles with a focus on scalability, maintainability, and security.

## Architecture Principles

### 1. Separation of Concerns
- **Presentation Layer**: React components for UI
- **Business Logic**: Redux for state management
- **Data Layer**: API service layer for backend communication
- **Utilities**: Reusable helper functions

### 2. Dependency Flow
```
Components → Redux Slices → API Services → HTTP Client → Backend
```

### 3. Single Responsibility
Each module has a single, well-defined purpose:
- Components render UI
- Services handle API calls
- Redux manages state
- Utils provide helper functions

## Directory Structure

```
frontend/src/
├── api/                      # Legacy API (deprecated)
│   └── axios.js
├── services/                 # New API service layer
│   └── api/
│       ├── httpClient.js     # Axios with interceptors
│       ├── auth.api.js       # Auth endpoints
│       ├── menu.api.js       # Menu endpoints
│       ├── orders.api.js     # Orders endpoints
│       └── index.js          # Service exports
├── config/                   # Configuration
│   └── api.config.js         # API endpoints & settings
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   ├── customer/             # Customer components
│   └── admin/                # Admin components
├── pages/                    # Page components
│   ├── customer/             # Customer pages
│   └── admin/                # Admin pages
├── redux/                    # State management
│   ├── store.js              # Redux store
│   └── slices/               # Redux slices
│       ├── authSlice.js
│       ├── cartSlice.js
│       ├── menuSlice.js
│       └── ordersSlice.js
├── hooks/                    # Custom React hooks
│   ├── useApi.js
│   ├── useAuth.js
│   └── useDebounce.js
├── utils/                    # Utility functions
│   ├── validation.js
│   └── format.js
├── App.js                    # Main app component
└── index.js                  # Entry point
```

## Key Components

### 1. HTTP Client (`services/api/httpClient.js`)

The HTTP client is a configured Axios instance with interceptors for:

#### Request Interceptor
- Automatically adds JWT token to Authorization header
- Runs before every API request

#### Response Interceptor
- Handles successful responses
- Manages errors globally
- Implements automatic token refresh
- Handles 401 (Unauthorized) errors
- Normalizes error messages

**Token Refresh Flow:**
```
Request fails with 401
    ↓
Check if refresh in progress
    ↓ (No)
Get refresh token
    ↓
Call refresh endpoint
    ↓
Update tokens
    ↓
Retry original request
```

### 2. API Services

API services provide a clean interface for backend communication:

```javascript
// Example: auth.api.js
const authApi = {
  login: async (credentials) => { /* ... */ },
  register: async (userData) => { /* ... */ },
  getProfile: async () => { /* ... */ },
  logout: async () => { /* ... */ },
};
```

**Benefits:**
- Type safety with JSDoc
- Centralized error handling
- Easy to mock for testing
- Consistent interface

### 3. Redux State Management

#### State Structure
```javascript
{
  auth: {
    user: Object,
    token: String,
    isAuthenticated: Boolean,
    loading: Boolean,
    error: String
  },
  cart: {
    items: Array
  },
  menu: {
    items: Array,
    currentItem: Object,
    loading: Boolean,
    error: String,
    lastFetched: String
  },
  orders: {
    orders: Array,
    currentOrder: Object,
    stats: Object,
    loading: Boolean,
    error: String
  }
}
```

#### Async Thunks
Used for asynchronous operations:

```javascript
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (params, { rejectWithValue }) => {
    try {
      return await menuApi.getMenuItems(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### 4. UI Component Library

Reusable components with accessibility:

- **ErrorBoundary**: Catches React errors
- **LoadingSpinner**: Loading indicator
- **LoadingSkeleton**: Placeholder content
- **ErrorMessage**: Error display with retry
- **EmptyState**: No-data state
- **Button**: Accessible button with variants
- **Input**: Form input with validation

### 5. Custom Hooks

#### useApi
Generic hook for API calls with state management:
```javascript
const { data, loading, error, execute } = useApi(apiFunc);
```

#### useAuth
Authentication operations:
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

#### useDebounce
Debounce values for search/filter:
```javascript
const debouncedSearch = useDebounce(searchTerm, 500);
```

## Data Flow

### Example: Fetching Menu Items

```
1. User navigates to MenuPage
   ↓
2. MenuPage dispatches fetchMenuItems()
   ↓
3. Redux thunk calls menuApi.getMenuItems()
   ↓
4. menuApi uses httpClient to make request
   ↓
5. httpClient adds auth token via interceptor
   ↓
6. Backend processes request
   ↓
7. Response received
   ↓
8. httpClient intercepts response
   ↓
9. Redux updates state
   ↓
10. MenuPage re-renders with new data
```

### Example: Handling 401 Error

```
1. API request fails with 401
   ↓
2. Response interceptor catches error
   ↓
3. Check if refresh already in progress
   ↓ (No)
4. Mark refresh as in progress
   ↓
5. Get refresh token from localStorage
   ↓
6. Call /auth/refresh endpoint
   ↓ (Success)
7. Update tokens in localStorage
   ↓
8. Retry original request with new token
   ↓
9. Return response to caller

   OR
   
   ↓ (Failure)
7. Clear tokens
   ↓
8. Dispatch auth:logout event
   ↓
9. Redirect to login page
```

## Security Measures

### 1. XSS Prevention
- React's built-in escaping
- `sanitizeInput()` utility function
- Validation on all user inputs

### 2. Token Security
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh
- Tokens cleared on logout
- No tokens in URL or cookies

### 3. Input Validation
- Email validation with comprehensive regex
- Phone number validation
- Password strength requirements
- Required field validation

### 4. CORS
- Backend configured for allowed origins
- Credentials not sent by default

### 5. Error Handling
- Sensitive data not exposed in error messages
- Generic error messages for users
- Detailed errors logged to console (dev only)

## Performance Optimizations

### 1. Code Splitting
```javascript
// Lazy loading pages
const MenuPage = lazy(() => import('./pages/customer/MenuPage'));
```

**Benefits:**
- Smaller initial bundle
- Faster page load
- Better cache utilization

### 2. Memoization
- React.memo for component optimization
- useMemo for expensive calculations
- useCallback for function references

### 3. Bundle Optimization
- Tree shaking (automatic)
- Minification in production
- Gzip compression
- Code split into chunks (~92KB main bundle)

### 4. API Optimization
- Request debouncing for search
- Caching with lastFetched timestamps
- Optimistic UI updates

## Error Handling Strategy

### 1. Error Types
```javascript
{
  NETWORK_ERROR: 'Network connection failed',
  UNAUTHORIZED: 'Session expired',
  FORBIDDEN: 'No permission',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Invalid request',
  SERVER_ERROR: 'Server error',
  TIMEOUT: 'Request timeout'
}
```

### 2. Error Boundaries
- React ErrorBoundary for component errors
- Fallback UI with error details (dev mode)
- Recovery options (retry, go home)

### 3. API Error Handling
```javascript
try {
  const data = await menuApi.getMenuItems();
} catch (error) {
  // error.type: ERROR_TYPE
  // error.message: User-friendly message
  // error.status: HTTP status code
}
```

## Testing Strategy

### 1. Unit Tests
- Test utility functions
- Test custom hooks
- Test Redux reducers

### 2. Integration Tests
- Test API service layer
- Test Redux thunks
- Mock HTTP client

### 3. Component Tests
- Test UI components
- Test user interactions
- Test error states

### 4. E2E Tests (Future)
- Test complete user flows
- Test authentication
- Test order placement

## Migration Guide

### From Old to New Architecture

#### Before (Deprecated):
```javascript
import api from '../../api/axios';

const fetchData = async () => {
  const { data } = await api.get('/menu');
  setMenuItems(data);
};
```

#### After (New):
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../../redux/slices/menuSlice';

const dispatch = useDispatch();
const { items, loading, error } = useSelector(state => state.menu);

useEffect(() => {
  dispatch(fetchMenuItems());
}, [dispatch]);
```

## Best Practices

### 1. Component Design
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic to hooks
- Use PropTypes or TypeScript

### 2. State Management
- Keep state as local as possible
- Use Redux for shared state only
- Normalize nested data
- Use selectors for derived state

### 3. API Integration
- Always use service layer
- Handle errors gracefully
- Show loading states
- Provide retry mechanisms

### 4. Styling
- Use Tailwind CSS utility classes
- Keep styles close to components
- Use consistent spacing/colors
- Ensure responsive design

### 5. Accessibility
- Use semantic HTML
- Add ARIA attributes
- Support keyboard navigation
- Test with screen readers

## Development Workflow

### 1. Setup
```bash
npm install
cp .env.example .env
# Configure API URL
npm start
```

### 2. Making Changes
1. Create feature branch
2. Make minimal changes
3. Test locally
4. Run linter
5. Build for production
6. Create PR

### 3. Adding New Features

#### New API Endpoint:
1. Add to `config/api.config.js`
2. Create service in `services/api/`
3. Export from `services/api/index.js`
4. Create Redux slice if needed
5. Use in components

#### New Component:
1. Create in appropriate directory
2. Add PropTypes/JSDoc
3. Ensure accessibility
4. Test edge cases
5. Document usage

## Future Improvements

### 1. TypeScript Migration
- Add TypeScript for type safety
- Better IDE support
- Catch errors at compile time

### 2. Testing
- Increase test coverage
- Add E2E tests
- Add visual regression tests

### 3. Performance
- Implement service workers
- Add offline support
- Optimize images
- Add analytics

### 4. Developer Experience
- Add Storybook for components
- Generate API types from OpenAPI
- Add pre-commit hooks
- Improve documentation

### 5. Security
- Implement CSP headers
- Add rate limiting on frontend
- Use httpOnly cookies for tokens
- Add 2FA support

## Troubleshooting

### Common Issues

**Issue**: API calls failing
- Check backend is running
- Verify API URL in .env
- Check network tab in browser
- Verify token is present

**Issue**: State not updating
- Check Redux DevTools
- Verify dispatch calls
- Check reducer logic
- Check if component is subscribed

**Issue**: Build errors
- Clear node_modules and reinstall
- Check for syntax errors
- Verify all imports exist
- Check ESLint errors

**Issue**: Slow performance
- Check for unnecessary re-renders
- Use React DevTools Profiler
- Optimize heavy computations
- Check bundle size

## Resources

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Axios](https://axios-http.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

## Contact

For questions or issues:
- Check this documentation
- Review API Integration Guide
- Check inline code comments
- Contact the development team

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Maintained by**: TechSign
