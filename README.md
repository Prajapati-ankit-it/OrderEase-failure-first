# OrderEase - Restaurant Ordering System

A complete full-stack restaurant ordering system built with the MERN stack (MongoDB, Express.js, React, Node.js). This is a portfolio project by TechSign showcasing modern web development practices.

## 🚀 Features

### Customer Features
- 📱 Browse menu by categories (Starters, Main Course, Drinks, etc.)
- 🛒 Shopping cart with quantity management
- 📝 Place orders with dine-in or delivery options
- ✅ Order confirmation with real-time status
- 💳 Mobile-responsive design

### Admin Features
- 🔐 Secure JWT authentication
- 📊 Dashboard with order statistics and revenue tracking
- 📋 Menu management (CRUD operations)
- 🍽️ Order management with status updates
- 👤 Real-time order monitoring

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Redux Toolkit (State Management)
- React Router v6
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB installed locally or MongoDB Atlas account
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/TECH-SIGN/OrderEase.git
cd OrderEase
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/orderease
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

The API will be running on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## 👤 Default Admin Account

To create an admin account, you can use the registration endpoint with role set to 'admin':

```bash
POST /api/auth/register
{
  "name": "Admin",
  "email": "admin@orderease.com",
  "password": "admin123",
  "role": "admin"
}
```

Then login at: `http://localhost:3000/admin/login`

## 📱 Usage

### For Customers:
1. Visit `http://localhost:3000`
2. Browse the menu by categories
3. Add items to cart
4. Proceed to checkout
5. Fill in customer details and place order
6. View order confirmation

### For Admins:
1. Visit `http://localhost:3000/admin/login`
2. Login with admin credentials
3. Access dashboard to view statistics
4. Manage menu items (add, edit, delete)
5. View and update order statuses

## 🗂️ Project Structure

```
OrderEase/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── server.js       # Entry point
├── frontend/
│   ├── public/         # Static files
│   └── src/
│       ├── api/        # API configuration
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       ├── redux/      # Redux store and slices
│       └── App.js      # Main app component
└── README.md
```

## 🎨 Database Schema

### User
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String (admin/customer)
}
```

### MenuItem
```javascript
{
  name: String,
  price: Number,
  category: String,
  description: String,
  image: String,
  isAvailable: Boolean
}
```

### Order
```javascript
{
  customerName: String,
  phone: String,
  items: Array,
  totalPrice: Number,
  orderType: String (dine-in/delivery),
  status: String,
  createdAt: Date
}
```

## 🚀 Deployment

### Backend (Render/Heroku)
1. Push code to GitHub
2. Connect repository to Render/Heroku
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build the app: `npm run build`
2. Deploy the build folder
3. Set environment variable for API URL

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

## 🔒 Security Features

- ✅ **Password Security:** bcrypt hashing with salt rounds
- ✅ **JWT Authentication:** Token-based authentication with expiry
- ✅ **Rate Limiting:** Protection against brute force and DoS attacks
  - Auth endpoints: 5 requests per 15 minutes
  - Order creation: 10 requests per 5 minutes
  - General API: 100 requests per 15 minutes
- ✅ **Protected Routes:** Admin-only endpoints with middleware
- ✅ **CORS Configuration:** Cross-origin resource sharing enabled
- ✅ **Input Validation:** Request validation for all endpoints

## 📝 Future Enhancements

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Email notifications
- [ ] SMS order updates
- [ ] Customer order history
- [ ] Reviews and ratings
- [ ] Multiple restaurant support
- [ ] Analytics and reporting

## 👨‍💻 About TechSign

This project is part of TechSign's portfolio, demonstrating full-stack development skills including:
- RESTful API design
- Database modeling
- State management
- Authentication & authorization
- Responsive UI design
- Modern JavaScript (ES6+)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For any queries or collaboration opportunities, feel free to reach out!

---

⭐ If you found this project helpful, please consider giving it a star!
