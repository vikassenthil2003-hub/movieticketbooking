import { io } from 'socket.io-client';

// Determine the WebSocket server address:
// In local dev, connecting directly to http://localhost:5000 avoids Vite proxy HTTP-polling disconnect issues.
// Can also be overridden with VITE_SOCKET_URL environment variable.
const getSocketUrl = () => {
  const envSocketUrl = (import.meta.env.VITE_SOCKET_URL || '').trim();
  const isSocketPlaceholder =
    !envSocketUrl ||
    envSocketUrl.includes('your-backend-deployment-url') ||
    envSocketUrl.includes('placeholder');

  if (!isSocketPlaceholder) {
    return envSocketUrl;
  }

  const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  const isApiPlaceholder =
    !envApiUrl ||
    envApiUrl.includes('your-backend-deployment-url') ||
    envApiUrl.includes('your-backend.onrender.com') ||
    envApiUrl.includes('<');

  if (!isApiPlaceholder) {
    try {
      const parsed = new URL(envApiUrl);
      return parsed.origin;
    } catch {
      // fallback
    }
  }

  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    // In production without configured VITE_SOCKET_URL / VITE_API_URL, do NOT connect to Vercel origin.
    // Return null to avoid spamming Vercel's static router with WebSocket polling requests.
    return null;
  }
  return 'http://localhost:5000';
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
