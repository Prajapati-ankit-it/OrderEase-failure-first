# OrderEase API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-01-03T18:00:00.000Z",
  "path": "/api/endpoint",
  "message": "Error message",
  "errorCode": "ERROR_CODE"
}
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"  // Optional: "USER" or "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cuid123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2026-01-03T18:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## 👤 User Endpoints

### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2026-01-03T18:00:00.000Z"
  }
}
```

### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

### Change Password
```http
PUT /api/user/password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Get User Orders
```http
GET /api/user/orders?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

---

## 🛡️ Admin Endpoints

### Get Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin dashboard accessed",
  "data": {
    "admin": { /* admin user */ },
    "totalUsers": 100,
    "totalOrders": 500,
    "totalRevenue": 25000,
    "pendingOrders": 10
  }
}
```

### Get All Users
```http
GET /api/admin/users?page=1&limit=10
Authorization: Bearer <admin_token>
```

### Get User by ID
```http
GET /api/admin/users/:id
Authorization: Bearer <admin_token>
```

### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### Update User Role
```http
PUT /api/admin/users/:id/role
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "role": "ADMIN"  // or "USER"
}
```

### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin_token>
```

---

## 🍽️ Food Endpoints (Admin Only)

### Create Food Item
```http
POST /api/food
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato and mozzarella",
  "price": 12.99,
  "category": "Main Course",
  "image": "https://example.com/pizza.jpg",
  "isAvailable": true
}
```

### Get All Food Items
```http
GET /api/food?category=Main+Course&includeUnavailable=false
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `category` (optional) - Filter by category
- `includeUnavailable` (optional, default: false) - Include unavailable items

### Get Food Item by ID
```http
GET /api/food/:id
Authorization: Bearer <admin_token>
```

### Update Food Item
```http
PUT /api/food/:id
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Pizza",
  "price": 14.99,
  "isAvailable": false
}
```

### Delete Food Item
```http
DELETE /api/food/:id
Authorization: Bearer <admin_token>
```

---

## 🛒 Cart Endpoints

### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": {
    "id": "cart_id",
    "userId": "user_id",
    "cartItems": [
      {
        "id": "item_id",
        "foodId": "food_id",
        "quantity": 2,
        "food": {
          "id": "food_id",
          "name": "Pizza",
          "price": 12.99,
          "category": "Main Course"
        }
      }
    ],
    "totalPrice": 25.98,
    "itemCount": 1
  }
}
```

### Add Item to Cart
```http
POST /api/cart
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "foodId": "food_id",
  "quantity": 2
}
```

**Notes:**
- If item already exists in cart, quantities are added together
- Validates that food item exists and is available

### Update Cart Item
```http
PUT /api/cart/:itemId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Notes:**
- Setting quantity to 0 removes the item
- Must be a positive integer or 0

### Remove Item from Cart
```http
DELETE /api/cart/:itemId
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <token>
```

---

## 📦 Order Endpoints

### Create Order with Items
```http
POST /api/order
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "foodId": "food_id_1",
      "quantity": 2
    },
    {
      "foodId": "food_id_2",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order_id",
    "userId": "user_id",
    "totalPrice": 38.97,
    "status": "PENDING",
    "orderItems": [
      {
        "id": "item_id",
        "quantity": 2,
        "price": 12.99,
        "food": {
          "id": "food_id",
          "name": "Pizza",
          "price": 12.99
        }
      }
    ],
    "createdAt": "2026-01-03T18:00:00.000Z"
  }
}
```

### Create Order from Cart (Recommended)
```http
POST /api/order/from-cart
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "clearCart": true  // Optional, default: true
}
```

**Response:**
Same as create order

**Notes:**
- Creates order from all items in user's cart
- Validates all items are still available
- Optionally clears cart after order creation (default: true)

### Get All Orders (Admin)
```http
GET /api/order?page=1&limit=10&status=PENDING
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `status` (optional) - Filter by status: PENDING, PREPARING, READY, DELIVERED, CANCELLED

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "orders": [
      {
        "id": "order_id",
        "totalPrice": 38.97,
        "status": "PENDING",
        "user": {
          "id": "user_id",
          "email": "user@example.com",
          "name": "John Doe"
        },
        "orderItems": [ /* items */ ],
        "createdAt": "2026-01-03T18:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

### Get Order by ID
```http
GET /api/order/:id
Authorization: Bearer <token>
```

**Notes:**
- Users can only see their own orders
- Admins can see all orders

### Update Order Status (Admin)
```http
PUT /api/order/:id/status
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "PREPARING"
}
```

**Valid Status Values:**
- `PENDING` - Order placed
- `PREPARING` - Being prepared
- `READY` - Ready for pickup/delivery
- `DELIVERED` - Delivered to customer
- `CANCELLED` - Order cancelled

### Delete Order (Admin)
```http
DELETE /api/order/:id
Authorization: Bearer <admin_token>
```

---

## 🌍 Public Endpoints

No authentication required.

### Health Check
```http
GET /api/public/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-01-03T18:00:00.000Z"
  }
}
```

### Get Available Menu
```http
GET /api/menu
GET /api/public/menu
```

**Query Parameters:**
- `available` (optional) - Filter by availability (always returns available items for public endpoints)
- `category` (optional) - Filter by category

**Response:**
Returns all available food items

**Examples:**
```http
GET /api/menu?available=true
GET /api/menu?category=Main+Course
GET /api/menu?available=true&category=Desserts
```

### Get Menu Item by ID
```http
GET /api/menu/:id
GET /api/public/menu/:id
```

### Get Categories
```http
GET /api/public/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    "Starters",
    "Main Course",
    "Desserts",
    "Beverages"
  ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Authentication required or failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND_ERROR` | Resource not found |
| `CONFLICT_ERROR` | Resource already exists |
| `INTERNAL_ERROR` | Internal server error |
| `DATABASE_ERROR` | Database operation failed |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **General API**: 100 requests per 15 minutes per IP
- Exceeding the limit returns HTTP 429 (Too Many Requests)

---

## Typical User Flow

### Customer Journey
1. Browse menu: `GET /api/menu` or `GET /api/public/menu`
2. Register/Login: `POST /api/auth/signup` or `POST /api/auth/login`
3. Add items to cart: `POST /api/cart`
4. View cart: `GET /api/cart`
5. Update quantities: `PUT /api/cart/:itemId`
6. Create order: `POST /api/order/from-cart`
7. View order history: `GET /api/user/orders`

### Admin Journey
1. Login: `POST /api/auth/login` (with admin credentials)
2. View dashboard: `GET /api/admin/dashboard`
3. Manage food items: CRUD on `/api/food`
4. View orders: `GET /api/order`
5. Update order status: `PUT /api/order/:id/status`
6. Manage users: CRUD on `/api/admin/users`

---

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@orderease.com","password":"user123"}'
```

### Get Cart Example
```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add to Cart Example
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"foodId":"food_id_here","quantity":2}'
```

---

## Support

For issues or questions, please contact support or create an issue on GitHub.
