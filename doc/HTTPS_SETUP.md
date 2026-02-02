# Local HTTPS Setup Guide

This guide provides quick setup instructions for running the OrderEase frontend on HTTPS with a custom local domain `orderease.dev`.

> **📌 Windows Users**: We have a dedicated guide for you! See [WINDOWS_HTTPS_SETUP.md](./WINDOWS_HTTPS_SETUP.md) for step-by-step Windows-specific instructions with detailed troubleshooting.

## Quick Start (macOS/Linux)

```bash
# 1. Install mkcert
brew install mkcert              # macOS
# OR for Linux/Windows - see detailed instructions below

# 2. Install local CA
mkcert -install

# 3. Generate certificates
cd frontend
mkdir -p certs && cd certs
mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1

# 4. Update hosts file
sudo nano /etc/hosts              # macOS/Linux
# Add: 127.0.0.1    orderease.dev

# 5. Install dependencies
cd ..
npm install

# 6. Configure backend CORS
# Edit backend/.env and add:
# CORS_ORIGIN = http://localhost:3000,http://localhost:3001,https://orderease.dev:3000,https://orderease.dev:3001

# 7. Start backend
cd ../backend
npm run start:dev

# 8. Start frontend with HTTPS
cd ../frontend
npm run dev:https
```

Visit: `https://orderease.dev:3001` ✨

## Windows Quick Start

> **⚠️ Important**: Run PowerShell or Command Prompt as **Administrator** for certificate installation and hosts file editing.

```powershell
# 1. Install mkcert (choose one method)
# Method A: Using Chocolatey (recommended)
choco install mkcert

# Method B: Download manually from GitHub
# Visit: https://github.com/FiloSottile/mkcert/releases
# Download mkcert-vX.X.X-windows-amd64.exe
# Rename to mkcert.exe and add to PATH

# 2. Install local CA (creates trusted certificate authority)
mkcert -install

# 3. Generate certificates
cd frontend
mkdir certs
cd certs
mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1

# 4. Update hosts file (must run as Administrator)
notepad C:\Windows\System32\drivers\etc\hosts
# Add this line at the end:
# 127.0.0.1    orderease.dev
# Save and close

# 5. Flush DNS cache
ipconfig /flushdns

# 6. Install dependencies
cd ..
npm install

# 7. Configure backend CORS
# Edit backend\.env and add:
# CORS_ORIGIN = http://localhost:3000,http://localhost:3001,https://orderease.dev:3000,https://orderease.dev:3001

# 8. Start backend (in a new terminal)
cd ..\backend
npm run start:dev

# 9. Start frontend with HTTPS (in a new terminal)
cd ..\frontend
npm run dev:https
```

Visit: `https://orderease.dev:3001` ✨

**Windows Tips:**
- Use PowerShell or Windows Terminal (recommended)
- Make sure to run as Administrator when prompted
- If `choco` is not found, install Chocolatey first: https://chocolatey.org/install
- If you get "execution policy" errors, run: `Set-ExecutionPolicy Bypass -Scope Process`

## Detailed Platform-Specific Instructions

### macOS

```bash
# Install mkcert
brew install mkcert
brew install nss  # For Firefox

# Install local CA
mkcert -install

# Generate certificates
cd frontend && mkdir -p certs && cd certs
mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1

# Update hosts file
sudo nano /etc/hosts
# Add this line:
127.0.0.1    orderease.dev

# Save and exit (Ctrl+X, Y, Enter)

# Flush DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Linux (Ubuntu/Debian)

```bash
# Install dependencies
sudo apt update
sudo apt install libnss3-tools

# Download and install mkcert
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
sudo chmod +x /usr/local/bin/mkcert

# Install local CA
mkcert -install

# Generate certificates
cd frontend && mkdir -p certs && cd certs
mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1

# Update hosts file
sudo nano /etc/hosts
# Add this line:
127.0.0.1    orderease.dev

# Save and exit (Ctrl+X, Y, Enter)

# Flush DNS cache
sudo systemd-resolve --flush-caches
```

### Windows

```powershell
# Install mkcert using Chocolatey
choco install mkcert

# OR download manually from:
# https://github.com/FiloSottile/mkcert/releases

# Install local CA
mkcert -install

# Generate certificates
cd frontend
mkdir certs
cd certs
mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1

# Update hosts file (Run as Administrator)
notepad C:\Windows\System32\drivers\etc\hosts
# Add this line:
127.0.0.1    orderease.dev

# Save and close

# Flush DNS cache (Run as Administrator)
ipconfig /flushdns
```

## Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# Add HTTPS origin to CORS
CORS_ORIGIN = http://localhost:3000,http://localhost:3001,https://orderease.dev:3000,https://orderease.dev:3001
```

### Frontend Configuration

The frontend is pre-configured with:
- `.env.https` - HTTPS environment variables
- `setupProxy.js` - Proxy configuration for API requests
- `dev:https` script in package.json

No additional configuration needed!

## Running the Application

### Terminal 1 - Backend (HTTP)

```bash
cd backend
npm run start:dev
```

✅ Backend running on: `http://localhost:3000/api`

### Terminal 2 - Frontend (HTTPS)

```bash
cd frontend
npm run dev:https
```

✅ Frontend running on: `https://orderease.dev:3001`

## Verification

1. Open browser to `https://orderease.dev:3001`
2. Check for 🔒 green lock in address bar
3. Click the lock icon → Certificate should show "mkcert"
4. Open DevTools → Console (should have no errors)
5. Test login/API calls (should work normally)

## Troubleshooting

### Certificate Not Trusted

```bash
# Re-install CA and restart browser
mkcert -install
# Then completely restart browser
```

### Cannot Reach orderease.dev

```bash
# Verify hosts file
cat /etc/hosts | grep orderease          # macOS/Linux
type C:\Windows\System32\drivers\etc\hosts | findstr orderease   # Windows

# Should show: 127.0.0.1    orderease.dev

# Test with ping
ping orderease.dev
# Should respond from 127.0.0.1
```

### API/Proxy Errors

```bash
# Check backend is running
curl http://localhost:3000/api/health

# Verify backend port in frontend/.env.https
# REACT_APP_BACKEND_PORT=3000
```

### Port 3000 Already in Use

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9          # macOS/Linux
netstat -ano | findstr :3000            # Windows (note the PID)
taskkill /PID <pid> /F                  # Windows (replace <pid>)

# OR change port in frontend/.env.https
PORT=3001
```

### Windows-Specific Issues

#### "mkcert: command not found"
**Cause:** mkcert not installed or not in PATH

**Solution:**
```powershell
# Check if mkcert is installed
mkcert --version

# If not found, install using Chocolatey
choco install mkcert

# OR download manually and add to PATH:
# 1. Download from: https://github.com/FiloSottile/mkcert/releases
# 2. Place mkcert.exe in: C:\Windows\System32
# 3. Restart PowerShell
```

#### "Access Denied" when editing hosts file
**Cause:** Not running as Administrator

**Solution:**
1. Close notepad/PowerShell
2. Right-click PowerShell/Command Prompt
3. Select "Run as Administrator"
4. Try again: `notepad C:\Windows\System32\drivers\etc\hosts`

#### Hosts file changes not taking effect
**Cause:** DNS cache not flushed or file not saved correctly

**Solution:**
```powershell
# Flush DNS cache (run as Administrator)
ipconfig /flushdns

# Verify hosts file entry exists
type C:\Windows\System32\drivers\etc\hosts | findstr orderease

# Should output: 127.0.0.1    orderease.dev

# Restart browser completely (close all windows)
```

#### "Execution Policy" errors with npm scripts
**Cause:** PowerShell execution policy restrictions

**Solution:**
```powershell
# Allow scripts for current session
Set-ExecutionPolicy Bypass -Scope Process

# OR use Command Prompt instead of PowerShell
```

#### Can't access `https://orderease.dev:3001` on Windows
**Cause:** Firewall blocking or hosts file issue

**Solution:**
```powershell
# Test if domain resolves
ping orderease.dev
# Should show: Reply from 127.0.0.1

# If no reply, check hosts file again
notepad C:\Windows\System32\drivers\etc\hosts

# Ensure this line exists (no # at the start):
# 127.0.0.1    orderease.dev

# Check Windows Firewall
# Go to: Windows Defender Firewall → Allow an app
# Ensure Node.js has network access
```

## Regular HTTP Development

Standard HTTP development still works:

```bash
cd frontend
npm start
```

Runs on: `http://localhost:3001`

## Security Notes

- ✅ Certificates are local and only trusted on your machine
- ✅ Certificates are gitignored and never committed
- ✅ Backend stays HTTP (simpler development)
- ✅ Production uses real SSL certificates
- ⚠️ Mkcert certificates expire after 2+ years (regenerate if needed)

## Why This Setup?

✅ **Frontend on HTTPS**: Modern browser features, secure cookies, OAuth  
✅ **Backend on HTTP**: Simpler development, no SSL overhead  
✅ **Proxy Middleware**: Transparent HTTPS→HTTP communication  
✅ **Custom Domain**: Realistic testing, cookie isolation  
✅ **Trusted Certificates**: No browser warnings, green lock 🔒

## Need Help?

See full documentation in `frontend/README.md` under "Local HTTPS Setup"

## Resources

- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [CRA HTTPS Docs](https://create-react-app.dev/docs/using-https-in-development/)
- [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
