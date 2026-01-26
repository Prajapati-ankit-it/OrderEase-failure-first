# OrderEase API Postman Testing Guide

## 🚀 Quick Setup

### 1. Import Collection & Environment
1. Open Postman
2. Click **Import** → Select `postman-collection.json`
3. Click **Import** again → Select `postman-environment.json`
4. Select the "OrderEase API Environment" from the dropdown

### 2. Start Your Server
```bash
# Start Backend Service Only (Direct Connection)
cd apps/backend
pnpm dev
```

### 3. Verify Service
- Backend Service: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- **Note**: API Gateway is bypassed - connecting directly to backend

## 🧪 Testing Flow

### Phase 1: Authentication Setup
1. **User Signup** → Creates test user (stores `authToken`, `userId`)
2. **Admin Signup** → Creates admin user (stores `adminToken`)
3. **User Login** → Test login flow (updates tokens)
4. **Admin Login** → Test admin login (updates admin token)

### Phase 2: Public API Testing
1. **Health Check** → Verify service status
2. **Get Menu** → Browse available food (stores `foodId`)
3. **Get Food by ID** → Get specific food details
4. **Get Categories** → List food categories

### Phase 3: User Workflow
1. **Get Profile** → View user profile
2. **Add to Cart** → Add items to cart
3. **Get Cart** → View cart contents
4. **Create Order** → Place order directly
5. **Create Order from Cart** → Convert cart to order
6. **Get User Orders** → View order history

### Phase 4: Admin Management
1. **Get Dashboard** → Admin dashboard stats
2. **Get All Users** → User management
3. **Update User Role** → Role management
4. **Create Food Item** → Add new menu items
5. **Update Food Item** → Modify menu items

## 📝 Environment Variables

The collection automatically manages these variables:

| Variable | Description | Set By |
|----------|-------------|--------|
| `baseUrl` | Backend service URL (direct) | Pre-configured |
| `authToken` | User JWT token | Login/Signup |
| `adminToken` | Admin JWT token | Admin Login/Signup |
| `userId` | Current user ID | Login/Signup |
| `foodId` | Test food item ID | Get Menu |
| `orderId` | Test order ID | Create Order |
| `cartItemId` | Cart item ID | Add to Cart |

## 🔧 Test Scripts

Each request includes automated test scripts that:
- ✅ Validate response status codes
- ✅ Check response format consistency
- ✅ Extract and store IDs for subsequent tests
- ✅ Log responses for debugging

## 📊 Response Format

All API responses follow this standard format:
```json
{
  "success": boolean,
  "message": "string",
  "data": any,
  "error": {
    "code": "string",
    "message": "string",
    "details": any
  }
}
```

## 🛡️ Authentication

### Bearer Token Format
```
Authorization: Bearer <token>
```

### Token Management
- Tokens are automatically stored after login/signup
- Use `authToken` for user operations
- Use `adminToken` for admin operations
- Tokens are injected automatically via collection auth

## 📋 API Endpoints Summary

### Authentication (🔐)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### Public (🌐)
- `GET /public/health` - Health check
- `GET /public/menu` - Get menu
- `GET /public/menu/:id` - Get food item
- `GET /public/categories` - Get categories

### User (👤)
- `GET /user/profile` - Get profile
- `PUT /user/profile` - Update profile
- `PUT /user/password` - Update password
- `GET /user/orders` - Get user orders

### Cart (🛒)
- `GET /cart` - Get cart
- `POST /cart` - Add item to cart
- `PUT /cart/:itemId` - Update cart item
- `DELETE /cart/:itemId` - Remove item
- `DELETE /cart` - Clear cart

### Orders (📦)
- `POST /order` - Create order
- `POST /order/from-cart` - Create from cart
- `GET /order/:id` - Get order
- `PUT /order/:id/status` - Update status (Admin)
- `DELETE /order/:id` - Delete order (Admin)

### Admin (👨‍💼)
- `GET /admin/dashboard` - Dashboard
- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get user
- `PUT /admin/users/:id/role` - Update role
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Food Management (🍔)
- `POST /food` - Create food (Admin)
- `GET /food` - Get all food (Admin)
- `GET /food/:id` - Get food (Admin)
- `PUT /food/:id` - Update food (Admin)
- `DELETE /food/:id` - Delete food (Admin)

## 🐛 Troubleshooting

### Common Issues

**401 Unauthorized**
- Check if token is set in environment
- Try logging in again
- Verify token hasn't expired

**403 Forbidden**
- Using user token for admin endpoint
- User role insufficient for operation

**404 Not Found**
- Check if environment variables are populated
- Verify backend server is running on port 3000
- Check endpoint URL

**500 Internal Server Error**
- Check backend server logs
- Verify database connection
- Check request body format

### Debug Tips

1. **Enable Console Logging**: Check Postman console for detailed logs
2. **Response Validation**: All test scripts log response data
3. **Environment Check**: Verify variables are populated after each step
4. **Server Status**: Run health check first to verify connectivity

## 🎯 Best Practices

1. **Sequential Testing**: Run requests in the order listed
2. **Token Refresh**: Use refresh token endpoint when tokens expire
3. **Data Cleanup**: Use admin endpoints to clean up test data
4. **Environment Reset**: Clear environment variables before fresh testing
5. **Error Handling**: Check response messages for detailed error info

## 📞 Support

For issues with:
- **API Problems**: Check backend server logs and database connection
- **Collection Issues**: Verify JSON import and environment setup  
- **Authentication**: Ensure proper token handling and role assignment
- **Connection Issues**: Ensure backend is running on http://localhost:3000

## 🔧 Updated Configuration

**Important Changes Made:**
- ✅ **Direct Backend Connection**: `baseUrl` now points to `http://localhost:3000/api`
- ✅ **API Gateway Bypassed**: No longer using port 4000
- ✅ **Single Service**: Only backend service needs to be running
- ✅ **All Endpoints Updated**: All requests now go directly to backend

Happy Testing! 🚀
