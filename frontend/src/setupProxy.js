/**
 * Proxy Configuration for Create React App
 * 
 * This file configures the development server to proxy API requests
 * from the frontend (HTTPS) to the backend (HTTP).
 * 
 * Flow:
 * Browser (https://orderease.dev:3001)
 *   ↓ requests to /api/*
 * Frontend Dev Server (proxy middleware)
 *   ↓ forwards to
 * Backend API (http://localhost:3000/api)
 * 
 * Note: This file is automatically loaded by Create React App.
 * No need to import or reference it manually.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Get backend port from environment or use default
  const backendPort = process.env.REACT_APP_BACKEND_PORT || '3000';
  const backendUrl = `http://localhost:${backendPort}`;
  
  // Proxy all /api requests to the backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      secure: false, // Allow proxy to HTTP backend even from HTTPS frontend
      ws: true, // Enable WebSocket proxying
      logLevel: 'info',
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${backendUrl}${req.url}`);
        }
        
        // Forward original host and protocol headers
        proxyReq.setHeader('X-Forwarded-Host', req.headers.host || '');
        proxyReq.setHeader('X-Forwarded-Proto', req.protocol || 'https');
        proxyReq.setHeader('X-Forwarded-For', req.ip || '');
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err.message);
        res.status(500).json({
          error: 'Proxy Error',
          message: 'Failed to connect to backend API',
          details: err.message,
        });
      },
    })
  );
  
  console.log(`\n🔗 API Proxy configured: /api -> ${backendUrl}`);
  console.log(`📡 Backend should be running at: ${backendUrl}\n`);
};
