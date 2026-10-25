import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';

// Create custom logger to absorb normal TCP socket disconnects (ECONNRESET/EPIPE)
// that occur when browser tabs reload, close, or HMR disconnects WebSockets.
const customLogger = createLogger();
const originalError = customLogger.error;
customLogger.error = (msg, options) => {
  const errCode = options?.error?.code;
  if (
    errCode === 'ECONNRESET' ||
    errCode === 'EPIPE' ||
    errCode === 'ECONNABORTED' ||
    (typeof msg === 'string' && msg.includes('ws proxy socket error'))
  ) {
    // Gracefully ignore normal TCP socket reset on client disconnect/refresh
    return;
  }
  originalError(msg, options);
};

const proxyConfig = {
  '/api': {
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
    secure: false,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, res) => {
        if (res && !res.headersSent && typeof res.writeHead === 'function') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              message: 'CineVerse backend server is temporarily unreachable on port 5000. Please ensure the Express server is running.',
              code: err.code,
            })
          );
        }
      });
    },
  },
  '/socket.io': {
    target: 'http://127.0.0.1:5000',
    ws: true,
    changeOrigin: true,
    secure: false,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, res) => {
        if (res && !res.headersSent && typeof res.writeHead === 'function') {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              message: 'Socket.IO backend server is temporarily unreachable.',
              code: err?.code,
            })
          );
        }
      });
      proxy.on('proxyReqWs', (_proxyReq, _req, socket) => {
        if (socket) {
          socket.on('error', (err) => {
            if (['ECONNRESET', 'EPIPE', 'ECONNABORTED'].includes(err?.code)) {
              if (!socket.destroyed) {
                socket.destroy();
              }
            }
          });
        }
      });
      proxy.on('proxyReqWsError', (_err, _req, socket) => {
        if (socket && !socket.destroyed) {
          socket.destroy();
        }
      });
    },
  },
};

export default defineConfig({
  plugins: [react()],
  customLogger,
  server: {
    port: 5173,
    host: true,
    proxy: proxyConfig,
  },
  preview: {
    port: 4173,
    host: true,
    proxy: proxyConfig,
  },
});

