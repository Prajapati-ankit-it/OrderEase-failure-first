#!/usr/bin/env node

/**
 * HTTPS Setup Verification Script
 * 
 * This script verifies that SSL certificates are properly generated
 * before starting the development server with HTTPS.
 * 
 * Usage: node scripts/setup-https.js
 */

const fs = require('fs');
const path = require('path');

const CERTS_DIR = path.join(__dirname, '..', 'certs');
const CERT_FILE = path.join(CERTS_DIR, 'orderease.dev.pem');
const KEY_FILE = path.join(CERTS_DIR, 'orderease.dev-key.pem');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCertificates() {
  log('\n🔒 Checking HTTPS Certificates...', 'cyan');
  
  if (!fs.existsSync(CERTS_DIR)) {
    log('\n❌ Error: Certificates directory not found!', 'red');
    log('\nThe "certs" directory does not exist.', 'yellow');
    printSetupInstructions();
    process.exit(1);
  }
  
  if (!fs.existsSync(CERT_FILE)) {
    log('\n❌ Error: Certificate file not found!', 'red');
    log(`\nExpected certificate at: ${CERT_FILE}`, 'yellow');
    printSetupInstructions();
    process.exit(1);
  }
  
  if (!fs.existsSync(KEY_FILE)) {
    log('\n❌ Error: Private key file not found!', 'red');
    log(`\nExpected private key at: ${KEY_FILE}`, 'yellow');
    printSetupInstructions();
    process.exit(1);
  }
  
  log('✅ Certificate files found!', 'green');
  log(`   📄 Certificate: ${CERT_FILE}`, 'blue');
  log(`   🔑 Private Key: ${KEY_FILE}`, 'blue');
  log('\n✨ HTTPS setup is ready!', 'green');
}

function printSetupInstructions() {
  log('\n📖 Setup Instructions:', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log('\n1️⃣  Install mkcert (if not already installed):', 'yellow');
  log('\n   macOS:', 'blue');
  log('   brew install mkcert');
  log('   brew install nss  # For Firefox support');
  
  log('\n   Linux:', 'blue');
  log('   # Ubuntu/Debian');
  log('   sudo apt install libnss3-tools');
  log('   wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64');
  log('   sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert');
  log('   sudo chmod +x /usr/local/bin/mkcert');
  
  log('\n   Windows:', 'blue');
  log('   # Using Chocolatey');
  log('   choco install mkcert');
  log('   # OR download from: https://github.com/FiloSottile/mkcert/releases');
  
  log('\n2️⃣  Install the local Certificate Authority:', 'yellow');
  log('   mkcert -install');
  
  log('\n3️⃣  Generate certificates:', 'yellow');
  log('   mkdir -p frontend/certs');
  log('   cd frontend/certs');
  log('   mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1');
  
  log('\n4️⃣  Update your hosts file:', 'yellow');
  log('\n   macOS/Linux:', 'blue');
  log('   sudo nano /etc/hosts');
  log('   # Add this line:');
  log('   127.0.0.1    orderease.dev');
  
  log('\n   Windows:', 'blue');
  log('   # Open as Administrator:');
  log('   notepad C:\\Windows\\System32\\drivers\\etc\\hosts');
  log('   # Add this line:');
  log('   127.0.0.1    orderease.dev');
  
  log('\n5️⃣  Start the development server:', 'yellow');
  log('   npm run dev:https');
  
  log('\n' + '='.repeat(60), 'cyan');
  log('\n📚 For more information, see the README.md file.\n', 'blue');
}

// Run the check
checkCertificates();
