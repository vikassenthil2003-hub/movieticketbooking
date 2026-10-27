import { io } from 'socket.io-client';

// Determine the WebSocket server address:
// In local dev, connecting directly to http://localhost:5000 avoids Vite proxy HTTP-polling disconnect issues.
// Can also be overridden with VITE_SOCKET_URL environment variable.
const getSocketUrl = () => {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    return 'http://localhost:5000';
  }

  let envSocketUrl = (
    process.env.REACT_APP_SOCKET_URL ||
    process.env.VITE_SOCKET_URL ||
    process.env.REACT_APP_API_URL ||
    process.env.VITE_API_URL ||
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL : '') ||
    ''
  ).trim();

  if (
    !envSocketUrl ||
    envSocketUrl.includes('localhost') ||
    envSocketUrl.includes('127.0.0.1') ||
    envSocketUrl.includes('your-backend-deployment-url') ||
    envSocketUrl.includes('your-backend.onrender.com') ||
    envSocketUrl.includes('<') ||
    envSocketUrl === 'placeholder'
  ) {
    envSocketUrl = 'https://ticketformovie.onrender.com';
  }

  try {
    const parsed = new URL(envSocketUrl);
    return parsed.origin;
  } catch {
    return 'https://ticketformovie.onrender.com';
  }
};

const socketUrl = getSocketUrl();
const shouldAutoConnect = Boolean(socketUrl);

const socket = io(socketUrl || 'http://localhost:5000', {
  autoConnect: shouldAutoConnect,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'], // Prefer native WebSocket, fall back to polling
});

socket.on('connect', () => {
  console.log(`[CineVerse Socket.IO] Connected to real-time server (${socket.id}) at ${socketUrl}`);
});

socket.on('connect_error', (error) => {
  console.warn(`[CineVerse Socket.IO] Connection warning: ${error.message}. Reconnecting...`);
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Reconnect manually if server disconnected socket explicitly
    socket.connect();
  }
});

// Cleanly close connection when page unloads or refreshes to prevent abrupt socket resets
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });
}

export default socket;
