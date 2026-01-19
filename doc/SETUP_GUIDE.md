# OrderEase - Complete Setup Guide

This guide will help you set up and run the OrderEase Restaurant Ordering System on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB**
   - Option A: Install locally from https://www.mongodb.com/try/download/community
   - Option B: Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
   - Verify installation: `mongod --version`

3. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

4. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone or Download the Repository

```bash
# Using Git
git clone https://github.com/TECH-SIGN/OrderEase.git
cd OrderEase

# OR download ZIP and extract it
```

### Step 2: Start MongoDB

**If using local MongoDB:**
```bash
# Windows: MongoDB starts automatically as a service
# Mac/Linux:
mongod
```

**If using MongoDB Atlas:**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 3: Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# - For local MongoDB: mongodb://localhost:27017/orderease
# - For MongoDB Atlas: use your connection string
```

Your `.env` file should look like:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/orderease
JWT_SECRET=mysecretkey123
NODE_ENV=development
```

**Seed the database with sample data:**
```bash
npm run seed
```

This creates:
- 12 sample menu items
- Admin account: `admin@orderease.com` / `admin123`
- Customer account: `customer@orderease.com` / `customer123`

**Start the backend server:**
```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: ...
```

### Step 4: Setup Frontend

**Open a new terminal window:**

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

Your `.env` file should contain:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Start the React development server:**
```bash
npm start
```

The application will automatically open at `http://localhost:3000`

## 🎯 Testing the Application

### As a Customer:

1. Open http://localhost:3000
2. Browse the menu (12 sample items across 5 categories)
3. Add items to cart
4. Click "Cart" in navigation
5. Proceed to checkout
6. Fill in details:
   - Name: John Doe
   - Phone: 9876543210
   - Order Type: Dine-in or Delivery
   - Table/Address as needed
7. Place order
8. View order confirmation

### As an Admin:

1. Visit http://localhost:3000/admin/login
2. Login with:
   - Email: `admin@orderease.com`
   - Password: `admin123`
3. Explore:
   - **Dashboard**: View statistics (orders, revenue)
   - **Menu**: Add, edit, delete menu items
   - **Orders**: View and update order status

## 🔧 Troubleshooting

### Backend Issues

**Problem: "Cannot connect to MongoDB"**
```bash
# Solution 1: Check if MongoDB is running
mongod

# Solution 2: Check your MONGODB_URI in .env
# Make sure it matches your MongoDB setup
```

**Problem: "Port 5000 already in use"**
```bash
# Solution: Change PORT in backend/.env to another port
PORT=5001
```

### Frontend Issues

**Problem: "Cannot connect to API"**
```bash
# Solution: Check REACT_APP_API_URL in frontend/.env
# Make sure it matches your backend server URL
REACT_APP_API_URL=http://localhost:5000/api
```

**Problem: Build errors with Tailwind**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Common Issues

**Problem: "Module not found"**
```bash
# Solution: Install dependencies
cd backend
npm install
cd ../frontend
npm install
```

**Problem: "Cors error in browser console"**
- The backend already has CORS enabled
- Make sure backend is running on port 5000
- Check browser console for actual error

## 📱 Running in Production Mode

### Backend:
```bash
cd backend
npm start
```

### Frontend:
```bash
cd frontend
npm run build
# Serve the build folder using any static server
npx serve -s build
```

## 🌐 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Go to https://render.com
3. Create new "Web Service"
4. Connect GitHub repository
5. Set build command: `cd backend && npm install`
6. Set start command: `cd backend && npm start`
7. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Any random secret string
   - `NODE_ENV`: production

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import project
4. Set root directory to `frontend`
5. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL from Render
6. Deploy

### MongoDB Atlas Setup

1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP address (or allow from anywhere: 0.0.0.0/0)
4. Get connection string
5. Replace `<password>` with your database password
6. Use this connection string in your backend .env

## 📞 Support

If you encounter any issues:

1. Check the console logs for errors
2. Verify all environment variables are set correctly
3. Make sure MongoDB is running
4. Check that ports 3000 and 5000 are available

## 🎓 Learning Resources

- **React**: https://react.dev
- **Node.js**: https://nodejs.org/docs
- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Tailwind CSS**: https://tailwindcss.com/docs

## ✨ Features Overview

### Customer Features
- Browse menu by categories
- Add items to cart
- Adjust quantities
- Place orders (dine-in/delivery)
- View order confirmation

### Admin Features
- Secure login
- Dashboard with statistics
- Add/Edit/Delete menu items
- View all orders
- Update order status
- Real-time order monitoring

## 🔒 Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 30 days
- Admin routes are protected
- CORS is configured for security
- Always use HTTPS in production

## 📝 Next Steps

1. Customize the menu items
2. Add your own branding
3. Configure payment gateway (Razorpay/Stripe)
4. Add email notifications
5. Deploy to production

---

Happy Coding! 🚀

For questions or issues, please create an issue on GitHub.
