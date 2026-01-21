# OrderEase Frontend

Production-ready React frontend application with clean architecture, scalable API integration, and modern development practices.

## 🏗️ Architecture Overview

This frontend application follows clean architecture principles with:

- **Feature-based folder structure** for scalability
- **Centralized API Gateway integration** through a service layer
- **Redux Toolkit** for predictable state management
- **Reusable UI component library** with accessibility support
- **Comprehensive error handling** with boundaries and retry mechanisms
- **Security best practices** (XSS prevention, input sanitization, secure token storage)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                    # Legacy API client (deprecated)
│   ├── services/               # New API service layer
│   │   └── api/
│   │       ├── httpClient.js   # Axios instance with interceptors
│   │       ├── auth.api.js     # Authentication API calls
│   │       ├── menu.api.js     # Menu API calls
│   │       ├── orders.api.js   # Orders API calls
│   │       └── index.js        # Service exports
│   ├── config/                 # Configuration files
│   │   └── api.config.js       # API endpoints and settings
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Input.jsx
│   │   ├── customer/           # Customer-facing components
│   │   └── admin/              # Admin components
│   ├── pages/                  # Page components
│   │   ├── customer/           # Customer pages
│   │   └── admin/              # Admin pages
│   ├── redux/                  # State management
│   │   ├── store.js            # Redux store configuration
│   │   └── slices/             # Redux slices
│   │       ├── authSlice.js    # Auth state with async thunks
│   │       ├── cartSlice.js    # Cart state
│   │       ├── menuSlice.js    # Menu state with async thunks
│   │       └── ordersSlice.js  # Orders state with async thunks
│   ├── App.js                  # Main app component with routing
│   └── index.js                # Entry point
├── public/                     # Static assets
└── package.json                # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your API Gateway URL:
```env
REACT_APP_API_GATEWAY_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

Create an optimized production build:
```bash
npm run build
```

### Running Tests

Run the test suite:
```bash
npm test
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_GATEWAY_URL` | API Gateway base URL | `http://localhost:5000/api` |
| `REACT_APP_API_URL` | Fallback API URL | `http://localhost:5000/api` |
| `NODE_ENV` | Environment (development/production) | `development` |

### API Configuration

API endpoints are centrally managed in `src/config/api.config.js`. This includes:

- Base URL configuration with fallbacks
- Endpoint definitions for all features
- Error message mappings
- Request timeout settings

## 📡 API Integration

### Service Layer Architecture

All API calls go through the centralized service layer in `src/services/api/`:

```javascript
// Example: Using the auth API service
import { authApi } from '../services/api';

const handleLogin = async (credentials) => {
  try {
    const user = await authApi.login(credentials);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### HTTP Client Features

The custom HTTP client (`httpClient.js`) provides:

- **Automatic token injection** for authenticated requests
- **Token refresh mechanism** for expired tokens
- **Global error handling** with user-friendly messages
- **Request/response interceptors**
- **Network error detection**

### Available API Services

- **authApi**: Login, register, profile, logout
- **menuApi**: Get items, create, update, delete (admin)
- **ordersApi**: Create orders, get orders, update status

## 🎨 UI Components

### Reusable Components

All UI components are in `src/components/ui/` and include:

- **ErrorBoundary**: Catches and displays React errors
- **LoadingSpinner**: Animated loading indicator
- **LoadingSkeleton**: Placeholder for loading content
- **ErrorMessage**: Error display with retry
- **EmptyState**: No-data state display
- **Button**: Accessible button with variants
- **Input**: Form input with validation

### Usage Example

```javascript
import { Button, LoadingSpinner, ErrorMessage } from '../components/ui';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <>
      {loading && <LoadingSpinner size="lg" />}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}
      <Button variant="primary" onClick={handleAction}>
        Click Me
      </Button>
    </>
  );
};
```

## 🔐 Authentication & Authorization

### Authentication Flow

1. User submits credentials
2. Login request through `authApi.login()`
3. Token stored in localStorage
4. Token automatically included in subsequent requests
5. Automatic token refresh on expiry

### Protected Routes

Admin routes are protected using the `ProtectedRoute` component:

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

### Session Management

- Auto-login on app load if valid token exists
- Auto-logout on token expiry
- Logout clears all stored credentials

## 📊 State Management

### Redux Store Structure

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
    items: Array,
  },
  menu: {
    items: Array,
    currentItem: Object,
    loading: Boolean,
    error: String
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

### Using Redux Slices

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../redux/slices/menuSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchMenuItems({ available: true }));
  }, [dispatch]);

  // Component logic
};
```

## 🛡️ Security Features

### Implemented Security Measures

- ✅ **XSS Prevention**: React's built-in escaping
- ✅ **Input Sanitization**: Validation on all forms
- ✅ **Secure Token Storage**: localStorage with auto-cleanup
- ✅ **CORS Awareness**: Proper header handling
- ✅ **No Secrets in Frontend**: Environment-based configuration
- ✅ **Error Message Sanitization**: No sensitive data in errors

### Best Practices

- Never store sensitive data in state or localStorage
- Always validate and sanitize user input
- Use HTTPS in production
- Implement CSP headers on the server
- Regular security audits

## ⚡ Performance Optimizations

### Implemented Optimizations

- Component lazy loading (can be enhanced)
- Memoization with useMemo and useCallback
- Optimized re-renders with React.memo
- Efficient Redux selectors
- Image lazy loading

### Bundle Optimization

The production build includes:
- Code splitting
- Tree shaking
- Minification
- Compression

## ♿ Accessibility

### ARIA Support

All UI components include proper ARIA attributes:
- Labels and descriptions
- Live regions for dynamic content
- Role attributes
- Keyboard navigation support

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus management for modals and popups
- Skip links for navigation

## 🧪 Testing

### Test Structure

Tests are colocated with components and follow naming convention `*.test.js`

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📦 Deployment

### Production Build

```bash
npm run build
```

### Deployment Platforms

**Recommended platforms:**
- Vercel (recommended for React apps)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Environment Setup

Set production environment variables:
```env
REACT_APP_API_GATEWAY_URL=https://api.yourproduction.com
NODE_ENV=production
```

## 🔄 Migration Guide

### Using New API Services

Replace old axios imports with new service layer:

```javascript
// Old way (deprecated)
import api from '../api/axios';
const response = await api.get('/menu');

// New way
import { menuApi } from '../services/api';
const items = await menuApi.getMenuItems();
```

### Benefits of New Architecture

- Centralized error handling
- Automatic token refresh
- Type-safe with JSDoc
- Easier testing and mocking
- Better maintainability

## 📖 API Documentation

### API Endpoints

All endpoints are documented in `src/config/api.config.js`

### Error Handling

API errors are normalized and include:
- `message`: User-friendly error message
- `type`: Error type (NETWORK_ERROR, UNAUTHORIZED, etc.)
- `status`: HTTP status code
- `data`: Additional error data

## 🔒 Local HTTPS Setup (orderease.dev)

### Why Local HTTPS?

Local HTTPS setup is essential for:
- **Secure Cookies**: Testing HTTP-only and Secure cookie flags
- **Service Workers**: Required for PWA features and offline functionality
- **OAuth/Social Login**: Many providers require HTTPS callbacks
- **Browser APIs**: Features like Geolocation, Camera, etc., require secure context
- **Production Parity**: Match production environment more closely

### Architecture Flow

```
Browser (https://orderease.dev:3001)
   ↓ User visits frontend
Frontend Dev Server (HTTPS on port 3001)
   ↓ API requests to /api/*
Proxy Middleware (setupProxy.js)
   ↓ Forwards to backend
Backend API (HTTP on localhost:3000/api)
```

**Key Points:**
- ✅ Frontend runs on HTTPS with trusted certificates
- ✅ Backend stays on HTTP (simpler, no SSL overhead in development)
- ✅ Proxy handles HTTPS → HTTP communication transparently
- ✅ No browser SSL warnings (green lock 🔒)

### Prerequisites

1. **mkcert** - Tool for creating locally-trusted development certificates

### Installation Steps

#### Step 1: Install mkcert

**macOS:**
```bash
brew install mkcert
brew install nss  # For Firefox support
```

**Linux (Ubuntu/Debian):**
```bash
# Install dependencies
sudo apt install libnss3-tools

# Download and install mkcert
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
sudo chmod +x /usr/local/bin/mkcert
```

**Windows:**
```powershell
# Using Chocolatey
choco install mkcert

# OR download from: https://github.com/FiloSottile/mkcert/releases
```

#### Step 2: Install Local Certificate Authority

This installs mkcert as a trusted certificate authority on your system:

```bash
mkcert -install
```

You should see:
```
Created a new local CA 💥
The local CA is now installed in the system trust store! ⚡️
```

#### Step 3: Generate SSL Certificates

Navigate to the frontend directory and create certificates:

```bash
cd frontend
mkdir -p certs
cd certs
mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1
```

This creates:
- `orderease.dev.pem` - SSL certificate
- `orderease.dev-key.pem` - Private key

**Important:** These files are gitignored and should NEVER be committed.

#### Step 4: Update Hosts File

Map `orderease.dev` to localhost:

**macOS/Linux:**
```bash
sudo nano /etc/hosts
```

**Windows (Run as Administrator):**
```powershell
notepad C:\Windows\System32\drivers\etc\hosts
```

Add this line:
```
127.0.0.1    orderease.dev
```

Save and close the file.

**Verify the mapping:**
```bash
ping orderease.dev
# Should respond from 127.0.0.1
```

#### Step 5: Install Dependencies

```bash
cd frontend
npm install
```

This installs required packages:
- `http-proxy-middleware` - For proxying API requests
- `cross-env` - For cross-platform environment variables

#### Step 6: Configure Backend CORS

Update your backend `.env` file to allow the HTTPS origin:

```env
CORS_ORIGIN=http://localhost:3001,https://orderease.dev:3001
```

The backend will now accept requests from both HTTP and HTTPS origins.

### Running with HTTPS

#### Start Backend (HTTP)

```bash
cd backend
npm run start:dev
```

Backend runs on: `http://localhost:3000/api`

#### Start Frontend (HTTPS)

```bash
cd frontend
npm run dev:https
```

Frontend runs on: `https://orderease.dev:3001`

**What happens:**
1. Script checks if certificates exist
2. If missing, shows setup instructions and exits
3. If found, starts dev server with HTTPS enabled
4. Browser opens to `https://orderease.dev:3001`
5. You should see a 🔒 green lock (trusted HTTPS)

### Configuration Files

#### `frontend/.env.https`

Contains HTTPS-specific configuration:
```env
HTTPS=true
SSL_CRT_FILE=certs/orderease.dev.pem
SSL_KEY_FILE=certs/orderease.dev-key.pem
HOST=orderease.dev
PORT=3000
REACT_APP_API_URL=/api
REACT_APP_BACKEND_PORT=3000
```

#### `frontend/src/setupProxy.js`

Handles proxying from HTTPS frontend to HTTP backend:
- Proxies all `/api/*` requests to `http://localhost:3000`
- Preserves headers and cookies
- Adds CORS headers
- Logs proxy requests in development

### Verification Checklist

After setup, verify:

- [ ] Visit `https://orderease.dev:3001` - Should load without warnings
- [ ] Browser shows 🔒 green lock in address bar
- [ ] Certificate is valid and issued by "mkcert"
- [ ] API requests to `/api/*` work correctly
- [ ] Browser DevTools → Network tab shows successful API calls
- [ ] No CORS errors in console
- [ ] Authentication and cookies work properly

### Troubleshooting

#### "Certificate Not Trusted" Warning

**Cause:** mkcert CA not installed or browser not restarted

**Solution:**
```bash
mkcert -install
# Then restart your browser completely
```

#### "Cannot find module 'http-proxy-middleware'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd frontend
npm install
```

#### Proxy Not Working / API 404 Errors

**Cause:** Backend not running or wrong port

**Solution:**
1. Ensure backend is running: `cd backend && npm run start:dev`
2. Check backend port in `.env` (should be 3000)
3. Verify `REACT_APP_BACKEND_PORT=3000` in frontend `.env.https`

#### CORS Errors

**Cause:** Backend CORS not configured for HTTPS origin

**Solution:**
Update `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3001,https://orderease.dev:3001
```

#### "Host Not Found" / Cannot Reach orderease.dev

**Cause:** Hosts file not updated or DNS cache issue

**Solution:**
1. Verify hosts file entry: `127.0.0.1    orderease.dev`
2. Flush DNS cache:
   - **macOS:** `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
   - **Windows:** `ipconfig /flushdns`
   - **Linux:** `sudo systemd-resolve --flush-caches`

#### Port Already in Use

**Cause:** Another process using port 3000

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in .env.https
PORT=3001
```

### Regular HTTP Development

The standard HTTP development flow still works:

```bash
cd frontend
npm start
```

This runs on: `http://localhost:3001` (no certificates needed)

### Security Notes

- **Certificates are local only** - Only trusted on your machine
- **Never commit certificates** - They are gitignored for security
- **Backend stays HTTP** - No SSL overhead in development
- **Production uses real certificates** - Not mkcert
- **Regenerate if expired** - Mkcert certificates expire after 2+ years

### Why orderease.dev?

Using a custom local domain instead of `localhost` provides:
- **Realistic testing** - Closer to production domain behavior
- **Cookie isolation** - Separate cookies from other local projects
- **Subdomain support** - Can add subdomains if needed (api.orderease.dev)
- **Professional DX** - Looks and feels like a real domain

### Additional Resources

- [mkcert Documentation](https://github.com/FiloSottile/mkcert)
- [Create React App HTTPS](https://create-react-app.dev/docs/using-https-in-development/)
- [HTTP Proxy Middleware](https://github.com/chimurai/http-proxy-middleware)

## 🤝 Contributing

### Development Guidelines

1. Follow existing code structure
2. Use the service layer for API calls
3. Add proper error handling
4. Include loading states
5. Ensure accessibility
6. Write tests for new features
7. Update documentation

### Code Style

- Use ESLint configuration
- Follow React best practices
- Use functional components with hooks
- Prefer composition over inheritance

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check existing documentation
- Review error messages in browser console
- Check network tab for API issues
- Verify environment configuration

---

**Built with ❤️ by TechSign**
