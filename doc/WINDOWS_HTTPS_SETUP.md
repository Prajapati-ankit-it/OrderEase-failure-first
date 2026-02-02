# HTTPS Setup for Windows

This guide is specifically for **Windows users** setting up local HTTPS with `orderease.dev`.

## Prerequisites

- Windows 10 or Windows 11
- Node.js installed (check with `node --version`)
- PowerShell or Command Prompt
- Administrator access

## Step-by-Step Setup

### 1. Install mkcert

**Option A: Using Chocolatey (Recommended)**

First, check if Chocolatey is installed:
```powershell
choco --version
```

If not installed, install Chocolatey from: https://chocolatey.org/install

Then install mkcert:
```powershell
choco install mkcert
```

**Option B: Manual Installation**

1. Go to: https://github.com/FiloSottile/mkcert/releases
2. Download `mkcert-vX.X.X-windows-amd64.exe`
3. Rename it to `mkcert.exe`
4. Move it to `C:\Windows\System32\` or add its location to PATH
5. Restart PowerShell

### 2. Install Local Certificate Authority

> ⚠️ **Important**: Run PowerShell as **Administrator** for this step.

Right-click on PowerShell → "Run as Administrator", then:

```powershell
mkcert -install
```

You should see:
```
Created a new local CA 💥
The local CA is now installed in the system trust store! ⚡️
```

### 3. Generate SSL Certificates

Navigate to the frontend directory and create certificates:

```powershell
cd OrderEase\frontend
mkdir certs
cd certs
mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1
```

This creates:
- `orderease.dev.pem` (certificate)
- `orderease.dev-key.pem` (private key)

### 4. Update Hosts File

> ⚠️ **Must run as Administrator**

Right-click on PowerShell → "Run as Administrator", then:

```powershell
notepad C:\Windows\System32\drivers\etc\hosts
```

Add this line at the end of the file:
```
127.0.0.1    orderease.dev
```

**Important**: Make sure there's NO `#` character at the beginning of the line!

Save and close the file.

### 5. Flush DNS Cache

In the same Administrator PowerShell window:

```powershell
ipconfig /flushdns
```

You should see: "Successfully flushed the DNS Resolver Cache."

### 6. Verify DNS Resolution

Test if the domain resolves correctly:

```powershell
ping orderease.dev
```

You should see: `Reply from 127.0.0.1`

If you see "could not find host", check your hosts file again.

### 7. Install Dependencies

```powershell
cd OrderEase\frontend
npm install
```

This installs the required proxy and HTTPS dependencies.

### 8. Configure Backend CORS

Edit `backend\.env` file:

```env
CORS_ORIGIN = http://localhost:3000,http://localhost:3001,https://orderease.dev:3000,https://orderease.dev:3001
```

### 9. Start Backend

Open a new PowerShell window (doesn't need Administrator):

```powershell
cd OrderEase\backend
npm run start:dev
```

Leave this running. You should see:
```
OrderEase RBAC API is running on: http://localhost:3000
```

### 10. Start Frontend with HTTPS

Open another new PowerShell window (doesn't need Administrator):

```powershell
cd OrderEase\frontend
npm run dev:https
```

The script will:
1. Check if certificates exist
2. If found, start the server with HTTPS
3. Open your browser to `https://orderease.dev:3001`

## Verify It's Working

1. Browser should open to `https://orderease.dev:3001`
2. Look for the 🔒 **green lock** in the address bar
3. Click the lock → Should show "Certificate (Valid)" issued by "mkcert"
4. No SSL warnings or errors
5. Frontend loads normally
6. Login and test API calls

## Common Windows Issues

### "mkcert: command not found"

**Solution:**
- Restart PowerShell after installing mkcert
- Or add mkcert to your PATH manually
- Or use Command Prompt instead

### "Access Denied" when editing hosts file

**Solution:**
- Make sure you're running PowerShell as Administrator
- Right-click → "Run as Administrator"

### Hosts file changes not working

**Solution:**
```powershell
# Flush DNS (as Administrator)
ipconfig /flushdns

# Restart browser completely (close all windows)

# Check hosts file has the entry
type C:\Windows\System32\drivers\etc\hosts | findstr orderease
```

### PowerShell execution policy errors

**Solution:**
```powershell
# Allow scripts for this session
Set-ExecutionPolicy Bypass -Scope Process

# Then run the command again
npm run dev:https
```

### Port 3000 already in use

**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Note the PID (last column), then kill it
taskkill /PID <pid_number> /F

# Replace <pid_number> with actual number
```

### Can't reach https://orderease.dev:3001

**Checklist:**
1. ✅ Is backend running? (check other PowerShell window)
2. ✅ Did you flush DNS cache? (`ipconfig /flushdns`)
3. ✅ Does `ping orderease.dev` work?
4. ✅ Is hosts file saved correctly?
5. ✅ Did you restart browser completely?
6. ✅ Is Windows Firewall allowing Node.js?

### Certificate not trusted

**Solution:**
```powershell
# Reinstall mkcert CA (as Administrator)
mkcert -install

# Restart browser completely

# Check certificate in browser (click lock icon)
```

## Windows Terminal Tips

Using **Windows Terminal** is recommended for better experience:

1. Install from Microsoft Store: "Windows Terminal"
2. Set it as default terminal
3. Right-click → "Run as Administrator" when needed
4. Supports tabs for multiple terminals

## Regular HTTP Development

If you don't need HTTPS, just use:

```powershell
cd frontend
npm start
```

This runs on: `http://localhost:3001` (no certificates needed)

## Uninstalling

If you want to remove the HTTPS setup:

```powershell
# Remove certificates
cd OrderEase\frontend\certs
del *.pem

# Remove hosts entry (as Administrator)
notepad C:\Windows\System32\drivers\etc\hosts
# Delete the line: 127.0.0.1    orderease.dev

# Flush DNS (as Administrator)
ipconfig /flushdns

# Uninstall mkcert CA (optional)
mkcert -uninstall
```

## Need More Help?

- Full documentation: `frontend/README.md` (Local HTTPS Setup section)
- Quick reference: `HTTPS_SETUP.md`
- mkcert documentation: https://github.com/FiloSottile/mkcert

---

**Built with ❤️ for Windows developers**
