#!/usr/bin/env node

/**
 * OrderEase - Global Server Launcher
 * 
 * This script allows you to run all services from the root folder.
 * It uses pnpm workspace commands to start multiple services.
 * 
 * Usage:
 *   node server.js                    # Run all services
 *   node server.js api-gateway        # Run only API gateway
 *   node server.js backend            # Run only backend
 *   node server.js all                # Run all services
 */

const { spawn } = require('child_process');
const path = require('path');

// Service configurations
const SERVICES = {
  'api-gateway': {
    name: 'API Gateway',
    filter: '@orderease/api-gateway',
    port: 4000,
    color: '\x1b[36m', // Cyan
  },
  'backend': {
    name: 'Backend',
    filter: '@orderease/backend',
    port: 3001,
    color: '\x1b[32m', // Green
  },
  'frontend': {
    name: 'Frontend',
    filter: 'frontend',
    port: 3000,
    color: '\x1b[35m', // Magenta
  },
};

const RESET_COLOR = '\x1b[0m';

// Parse command line arguments
const args = process.argv.slice(2);
const serviceName = args[0] || 'all';

/**
 * Start a single service
 */
function startService(key, config) {
  console.log(`${config.color}[${config.name}]${RESET_COLOR} Starting on port ${config.port}...`);
  
  const command = key === 'frontend' ? 'start' : 'dev';
  const child = spawn('pnpm', ['--filter', config.filter, command], {
    cwd: path.resolve(__dirname),
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (error) => {
    console.error(`${config.color}[${config.name}]${RESET_COLOR} Error:`, error);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${config.color}[${config.name}]${RESET_COLOR} Exited with code ${code}`);
    }
  });

  return child;
}

/**
 * Start all services in parallel
 */
function startAllServices() {
  console.log('\x1b[1m\x1b[33m╔════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m\x1b[33m║   OrderEase - Starting All Services       ║\x1b[0m');
  console.log('\x1b[1m\x1b[33m╚════════════════════════════════════════════╝\x1b[0m');
  console.log('');

  const children = [];
  
  // Start API Gateway first
  if (SERVICES['api-gateway']) {
    children.push(startService('api-gateway', SERVICES['api-gateway']));
  }
  
  // Then start backend
  if (SERVICES['backend']) {
    setTimeout(() => {
      children.push(startService('backend', SERVICES['backend']));
    }, 2000);
  }
  
  // Finally start frontend
  if (SERVICES['frontend']) {
    setTimeout(() => {
      children.push(startService('frontend', SERVICES['frontend']));
    }, 4000);
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\x1b[33mShutting down all services...\x1b[0m');
    children.forEach(child => child.kill('SIGINT'));
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\x1b[33mShutting down all services...\x1b[0m');
    children.forEach(child => child.kill('SIGTERM'));
    process.exit(0);
  });
}

/**
 * Main execution
 */
function main() {
  if (serviceName === 'all') {
    startAllServices();
  } else if (SERVICES[serviceName]) {
    console.log('\x1b[1m\x1b[33m╔════════════════════════════════════════════╗\x1b[0m');
    console.log(`\x1b[1m\x1b[33m║   OrderEase - ${SERVICES[serviceName].name.padEnd(28)} ║\x1b[0m`);
    console.log('\x1b[1m\x1b[33m╚════════════════════════════════════════════╝\x1b[0m');
    console.log('');
    
    const child = startService(serviceName, SERVICES[serviceName]);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(`\n\x1b[33mShutting down ${SERVICES[serviceName].name}...\x1b[0m`);
      child.kill('SIGINT');
      process.exit(0);
    });
  } else {
    console.error('\x1b[31mError: Unknown service "%s"\x1b[0m', serviceName);
    console.log('');
    console.log('Usage: node server.js [service]');
    console.log('');
    console.log('Available services:');
    Object.keys(SERVICES).forEach(key => {
      console.log(`  - ${key.padEnd(15)} (${SERVICES[key].name})`);
    });
    console.log('  - all           (All services)');
    process.exit(1);
  }
}

// Run the script
main();
