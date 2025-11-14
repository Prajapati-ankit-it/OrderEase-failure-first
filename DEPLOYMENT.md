# OrderEase Deployment Guide

Complete guide for deploying OrderEase to production.

## 📋 Pre-Deployment Checklist

### Backend
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Security features enabled (rate limiting, JWT)
- [ ] API endpoints tested
- [ ] Error handling verified

### Frontend
- [ ] Build process tested
- [ ] Environment variables set
- [ ] API URL configured for production
- [ ] Responsive design verified
- [ ] Cross-browser compatibility checked

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] Initial data seeded (optional)

## 🌐 Deployment Options

### Option 1: Render (Backend) + Vercel (Frontend) [Recommended]

#### Step 1: Deploy Database (MongoDB Atlas)

1. **Create Account**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select cloud provider and region
   - Create cluster (takes 1-3 minutes)

3. **Configure Access**
   - Database Access: Add new user
     - Username: `orderease_admin`
     - Password: Generate secure password
     - Role: Read and write to any database
   
   - Network Access: Add IP address
     - Click "Add IP Address"
     - Select "Allow access from anywhere" (0.0.0.0/0)
     - Or whitelist specific IPs

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://orderease_admin:PASSWORD@cluster0.xxxxx.mongodb.net/orderease?retryWrites=true&w=majority`

#### Step 2: Deploy Backend (Render)

1. **Prepare Repository**
   - Push code to GitHub
   - Ensure `backend` folder is in root

2. **Create Web Service**
   - Visit https://render.com
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select "OrderEase" repository

3. **Configure Service**
   ```
   Name: orderease-api
   Region: Choose closest to your users
   Branch: main (or your production branch)
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add variables:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_super_secret_jwt_key_min_32_chars
     NODE_ENV=production
     PORT=5000
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Copy the service URL (e.g., `https://orderease-api.onrender.com`)

6. **Test Backend**
   ```bash
   curl https://orderease-api.onrender.com
   # Should return: {"message":"OrderEase API is running"}
   ```

7. **Seed Database (Optional)**
   - Use Render Shell or local connection
   ```bash
   # Set MONGODB_URI locally
   export MONGODB_URI="your_mongodb_atlas_connection_string"
   cd backend
   npm run seed
   ```

#### Step 3: Deploy Frontend (Vercel)

1. **Prepare for Deployment**
   - Ensure `frontend` folder has build script
   - Test local build: `cd frontend && npm run build`

2. **Deploy to Vercel**
   - Visit https://vercel.com
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import "OrderEase" repository

3. **Configure Project**
   ```
   Project Name: orderease
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Set Environment Variable**
   - Go to project settings
   - Environment Variables section
   - Add:
     ```
     REACT_APP_API_URL=https://orderease-api.onrender.com/api
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-4 minutes)
   - Visit your site (e.g., `https://orderease.vercel.app`)

6. **Test Frontend**
   - Browse menu
   - Test cart functionality
   - Try placing an order
   - Test admin login

### Option 2: Heroku (Full Stack)

#### Backend Setup

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Windows - Download from heroku.com
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd backend
   heroku create orderease-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your_connection_string"
   heroku config:set JWT_SECRET="your_secret"
   heroku config:set NODE_ENV="production"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### Frontend Setup

1. **Create Another Heroku App**
   ```bash
   cd frontend
   heroku create orderease-web
   ```

2. **Add Buildpack**
   ```bash
   heroku buildpacks:set mars/create-react-app
   ```

3. **Set Environment Variable**
   ```bash
   heroku config:set REACT_APP_API_URL="https://orderease-api.herokuapp.com/api"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: Netlify (Frontend) + Railway (Backend)

Similar to Option 1, but using different platforms. Follow platform-specific documentation.

## ⚙️ Post-Deployment Configuration

### 1. Test All Endpoints

```bash
# Health check
curl https://your-api-url.com

# Get menu items
curl https://your-api-url.com/api/menu

# Create order (test with valid data)
curl -X POST https://your-api-url.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","phone":"1234567890","items":[]}'
```

### 2. Monitor Application

**Render Monitoring:**
- View logs in Render dashboard
- Set up health checks
- Configure alerting

**Vercel Monitoring:**
- View deployment logs
- Check analytics
- Monitor performance

**MongoDB Atlas:**
- Monitor database metrics
- Set up alerts
- Review slow queries

### 3. Custom Domain (Optional)

**For Frontend (Vercel):**
1. Go to project settings
2. Add custom domain
3. Update DNS records (provided by Vercel)

**For Backend (Render):**
1. Go to service settings
2. Add custom domain
3. Update DNS records (provided by Render)

### 4. SSL/HTTPS

- ✅ Render provides SSL automatically
- ✅ Vercel provides SSL automatically
- ✅ MongoDB Atlas uses SSL by default

## 🔐 Security Best Practices

### Production Environment Variables

```env
# Backend .env (Never commit to Git!)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/orderease
JWT_SECRET=use_a_very_long_random_string_at_least_32_characters
NODE_ENV=production
PORT=5000

# Frontend .env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Additional Security

1. **Enable CORS Properly**
   ```javascript
   // In production, specify allowed origins
   app.use(cors({
     origin: ['https://your-frontend-url.com']
   }));
   ```

2. **Use HTTPS Only**
   - Ensure all communications use HTTPS
   - Update API URLs to use https://

3. **Environment Variables**
   - Never commit .env files
   - Use platform's secret management
   - Rotate secrets regularly

4. **Rate Limiting**
   - Already implemented ✅
   - Monitor for abuse
   - Adjust limits as needed

## 📊 Monitoring & Maintenance

### Performance Monitoring

1. **Frontend (Vercel)**
   - Analytics dashboard
   - Core Web Vitals
   - Deploy frequency

2. **Backend (Render)**
   - Response times
   - Error rates
   - Resource usage

3. **Database (MongoDB Atlas)**
   - Query performance
   - Connection pool
   - Storage usage

### Log Management

```bash
# Render logs
render logs --tail

# Heroku logs
heroku logs --tail

# Vercel logs (in dashboard)
```

### Backup Strategy

1. **Database Backups**
   - MongoDB Atlas: Automatic backups enabled
   - Configure retention policy
   - Test restore procedure

2. **Code Backups**
   - GitHub repository is your backup
   - Use tags for releases
   - Maintain multiple branches

## 🚨 Troubleshooting

### Common Issues

**Problem: API not responding**
```bash
# Check if service is running
curl https://your-api-url.com

# Check logs
# Platform-specific log viewing
```

**Problem: Database connection failed**
```bash
# Verify connection string
# Check IP whitelist in MongoDB Atlas
# Verify credentials
```

**Problem: CORS errors**
```javascript
// Update CORS configuration in server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
```

**Problem: Frontend can't reach API**
```bash
# Verify REACT_APP_API_URL is set correctly
# Check browser console for errors
# Verify API is responding
```

## 🔄 CI/CD (Optional)

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## 📞 Support

If you encounter deployment issues:

1. Check platform status pages
2. Review logs for errors
3. Verify environment variables
4. Test API endpoints individually
5. Check database connection

## ✅ Deployment Checklist Summary

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed (Render/Heroku)
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Environment variables configured
- [ ] Database seeded with initial data
- [ ] All endpoints tested
- [ ] HTTPS enabled
- [ ] Custom domains configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 🎉 Congratulations!

Your OrderEase application is now live and ready to serve customers!

**Next Steps:**
1. Share your live URL
2. Add to your portfolio
3. Monitor performance
4. Gather user feedback
5. Plan future enhancements

---

For more information, see:
- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Local development
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines
