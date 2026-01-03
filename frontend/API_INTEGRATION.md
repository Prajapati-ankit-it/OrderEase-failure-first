# API Integration Guide

This guide explains how to integrate with the backend API through the centralized service layer.

## Architecture Overview

The frontend uses a **layered architecture** for API integration:

```
Component Layer
    ↓
Redux Slice (State Management)
    ↓
API Service Layer (auth.api.js, menu.api.js, etc.)
    ↓
HTTP Client (httpClient.js with interceptors)
    ↓
API Gateway / Backend
```

## Benefits

1. **Centralized Configuration**: All API endpoints in one place
2. **Automatic Authentication**: Tokens added to requests automatically
3. **Token Refresh**: Handles expired tokens transparently
4. **Error Handling**: Consistent error handling across the app
5. **Easy Mocking**: Service layer can be easily mocked for testing
6. **Type Safety**: JSDoc comments provide IDE autocomplete

## Using API Services

### 1. Authentication

```javascript
import { authApi } from '../services/api';

// Login
const loginUser = async (email, password) => {
  try {
    const userData = await authApi.login({ email, password });
    console.log('User logged in:', userData);
    // Token is automatically stored
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// Register
const registerUser = async (name, email, password) => {
  try {
    const userData = await authApi.register({ name, email, password });
    console.log('User registered:', userData);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};

// Get Profile
const getProfile = async () => {
  try {
    const profile = await authApi.getProfile();
    console.log('User profile:', profile);
  } catch (error) {
    console.error('Failed to fetch profile:', error.message);
  }
};

// Logout
const logout = async () => {
  try {
    await authApi.logout();
    // Tokens are automatically cleared
  } catch (error) {
    console.error('Logout failed:', error.message);
  }
};
```

### 2. Menu Management

```javascript
import { menuApi } from '../services/api';

// Get all menu items
const getMenuItems = async () => {
  try {
    const items = await menuApi.getMenuItems({ available: true });
    console.log('Menu items:', items);
  } catch (error) {
    console.error('Failed to fetch menu:', error.message);
  }
};

// Get single item
const getMenuItem = async (id) => {
  try {
    const item = await menuApi.getMenuItemById(id);
    console.log('Menu item:', item);
  } catch (error) {
    console.error('Failed to fetch item:', error.message);
  }
};

// Create menu item (Admin only)
const createNewMenuItem = async () => {
  try {
    const newItem = await menuApi.createMenuItem({
      name: 'Margherita Pizza',
      price: 12.99,
      category: 'Main Course',
      description: 'Classic Italian pizza',
      image: 'https://example.com/pizza.jpg',
      isAvailable: true,
    });
    console.log('Created item:', newItem);
  } catch (error) {
    console.error('Failed to create item:', error.message);
  }
};

// Update menu item (Admin only)
const updateExistingItem = async (id) => {
  try {
    const updated = await menuApi.updateMenuItem(id, {
      price: 13.99,
      isAvailable: false,
    });
    console.log('Updated item:', updated);
  } catch (error) {
    console.error('Failed to update item:', error.message);
  }
};

// Delete menu item (Admin only)
const deleteItem = async (id) => {
  try {
    await menuApi.deleteMenuItem(id);
    console.log('Item deleted');
  } catch (error) {
    console.error('Failed to delete item:', error.message);
  }
};
```

### 3. Orders

```javascript
import { ordersApi } from '../services/api';

// Create order
const placeOrder = async (orderData) => {
  try {
    const order = await ordersApi.createOrder({
      customerName: 'John Doe',
      phone: '123-456-7890',
      items: [
        { menuItemId: '123', quantity: 2, price: 12.99 },
      ],
      totalPrice: 25.98,
      orderType: 'dine-in',
    });
    console.log('Order placed:', order);
  } catch (error) {
    console.error('Failed to place order:', error.message);
  }
};

// Get all orders (Admin only)
const getAllOrders = async () => {
  try {
    const orders = await ordersApi.getAllOrders({ status: 'pending' });
    console.log('Orders:', orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error.message);
  }
};

// Get order by ID
const getOrder = async (id) => {
  try {
    const order = await ordersApi.getOrderById(id);
    console.log('Order:', order);
  } catch (error) {
    console.error('Failed to fetch order:', error.message);
  }
};

// Update order status (Admin only)
const updateStatus = async (id, newStatus) => {
  try {
    const updated = await ordersApi.updateOrderStatus(id, newStatus);
    console.log('Order updated:', updated);
  } catch (error) {
    console.error('Failed to update status:', error.message);
  }
};

// Get order statistics (Admin only)
const getStats = async () => {
  try {
    const stats = await ordersApi.getOrderStats();
    console.log('Order stats:', stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error.message);
  }
};
```

## Using with Redux

### Example: Menu Items with Redux

```javascript
// In your component
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../redux/slices/menuSlice';

const MenuComponent = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchMenuItems({ available: true }));
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {items.map((item) => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## Error Handling

### Error Structure

All API errors follow this structure:

```javascript
{
  message: 'User-friendly error message',
  type: 'ERROR_TYPE', // NETWORK_ERROR, UNAUTHORIZED, etc.
  status: 401,
  data: {...}, // Additional error data from backend
  originalError: Error
}
```

### Error Types

- `NETWORK_ERROR`: No internet connection
- `UNAUTHORIZED`: Token expired or invalid
- `FORBIDDEN`: No permission for this action
- `NOT_FOUND`: Resource not found
- `BAD_REQUEST`: Invalid request data
- `SERVER_ERROR`: Backend error (5xx)
- `TIMEOUT`: Request timed out

### Handling Errors

```javascript
try {
  const data = await menuApi.getMenuItems();
} catch (error) {
  switch (error.type) {
    case 'NETWORK_ERROR':
      // Show offline message
      break;
    case 'UNAUTHORIZED':
      // Redirect to login (handled automatically)
      break;
    case 'NOT_FOUND':
      // Show not found message
      break;
    default:
      // Show generic error
      console.error(error.message);
  }
}
```

## Token Management

### Automatic Token Handling

The HTTP client automatically:
1. Adds the token to request headers
2. Refreshes expired tokens
3. Retries failed requests after refresh
4. Logs out user if refresh fails

### Manual Token Access

```javascript
import { TokenManager } from '../services/api';

// Get token
const token = TokenManager.getToken();

// Set token
TokenManager.setToken('your-token');

// Remove token
TokenManager.removeToken();
```

## Adding New API Endpoints

### 1. Update API Configuration

Edit `src/config/api.config.js`:

```javascript
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  // New feature endpoints
  REVIEWS: {
    LIST: '/reviews',
    BY_ID: (id) => `/reviews/${id}`,
    CREATE: '/reviews',
  },
};
```

### 2. Create API Service

Create `src/services/api/reviews.api.js`:

```javascript
import httpClient from './httpClient';
import { API_ENDPOINTS } from '../../config/api.config';

const reviewsApi = {
  getReviews: async (params = {}) => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.REVIEWS.LIST, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createReview: async (reviewData) => {
    try {
      const response = await httpClient.post(API_ENDPOINTS.REVIEWS.CREATE, reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reviewsApi;
```

### 3. Export Service

Update `src/services/api/index.js`:

```javascript
export { default as reviewsApi } from './reviews.api';
```

### 4. Create Redux Slice (Optional)

Create `src/redux/slices/reviewsSlice.js` if you need state management.

## Testing API Services

### Mocking Services

```javascript
// In your test file
jest.mock('../services/api', () => ({
  menuApi: {
    getMenuItems: jest.fn(),
  },
}));

// In your test
import { menuApi } from '../services/api';

test('fetches menu items', async () => {
  menuApi.getMenuItems.mockResolvedValue([
    { _id: '1', name: 'Pizza', price: 12.99 },
  ]);

  // Test your component
});
```

## Best Practices

1. **Always use the service layer** - Don't import httpClient directly in components
2. **Handle errors gracefully** - Use try-catch and provide user feedback
3. **Show loading states** - Indicate when requests are in progress
4. **Use Redux for shared state** - Menu items, orders, etc.
5. **Keep services thin** - Business logic belongs in components or Redux
6. **Add JSDoc comments** - Document parameters and return values
7. **Validate input** - Check data before sending to API
8. **Handle edge cases** - Empty responses, network errors, etc.

## Common Patterns

### Loading State Pattern

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await menuApi.getMenuItems();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Retry Pattern

```javascript
const fetchWithRetry = async (retries = 3) => {
  try {
    return await menuApi.getMenuItems();
  } catch (error) {
    if (retries > 0 && error.type === 'NETWORK_ERROR') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(retries - 1);
    }
    throw error;
  }
};
```

### Optimistic Update Pattern

```javascript
const updateMenuItem = async (id, updates) => {
  // Update UI immediately
  const originalItem = items.find(item => item._id === id);
  setItems(items.map(item => 
    item._id === id ? { ...item, ...updates } : item
  ));

  try {
    // Confirm with server
    await menuApi.updateMenuItem(id, updates);
  } catch (error) {
    // Revert on error
    setItems(items.map(item => 
      item._id === id ? originalItem : item
    ));
    throw error;
  }
};
```

## Troubleshooting

### Common Issues

**Issue**: "Network Error"
- **Solution**: Check backend is running and CORS is configured

**Issue**: "Unauthorized" on every request
- **Solution**: Check token is being stored and sent correctly

**Issue**: API calls work but Redux state not updating
- **Solution**: Check Redux slice reducers and dispatch calls

**Issue**: Token refresh infinite loop
- **Solution**: Check refresh token endpoint and expiry logic

---

For more information, see the main README or contact the development team.
