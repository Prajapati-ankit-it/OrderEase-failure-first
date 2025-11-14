# OrderEase - Quick Start Guide

Get OrderEase running in 5 minutes! ⚡

## Prerequisites

- Node.js installed
- MongoDB running (local or Atlas)

## Steps

### 1. Clone & Install (2 min)

```bash
# Clone repository
git clone https://github.com/TECH-SIGN/OrderEase.git
cd OrderEase

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure Environment (1 min)

**Backend** - Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/orderease
JWT_SECRET=mysupersecretkey123
NODE_ENV=development
```

**Frontend** - Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Seed Database (30 sec)

```bash
cd backend
npm run seed
```

This creates:
- 12 sample menu items
- Admin: `admin@orderease.com` / `admin123`
- Customer: `customer@orderease.com` / `customer123`

### 4. Start Application (1 min)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Access

- **Customer Portal:** http://localhost:3000
- **Admin Portal:** http://localhost:3000/admin/login
- **API:** http://localhost:5000/api

## Test It Out

### As Customer:
1. Browse menu at http://localhost:3000
2. Add items to cart
3. Checkout with any name/phone

### As Admin:
1. Login at http://localhost:3000/admin/login
2. Email: `admin@orderease.com`
3. Password: `admin123`
4. Manage menu and orders

## Common Commands

```bash
# Backend
npm run dev          # Start with nodemon
npm run seed        # Seed database
npm start           # Production mode

# Frontend
npm start           # Development server
npm run build       # Production build
npm test            # Run tests
```

## Troubleshooting

**Port already in use?**
```bash
# Change backend port in backend/.env
PORT=5001

# Update frontend API URL in frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

**MongoDB not connecting?**
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://...
```

**Can't access admin panel?**
```bash
# Re-run seed script
cd backend
npm run seed
```

## Next Steps

- Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- See [README.md](README.md) for complete documentation

## Need Help?

- Check the full [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Review [Troubleshooting section](SETUP_GUIDE.md#troubleshooting)
- Open an issue on GitHub

---

**Happy coding! 🚀**
