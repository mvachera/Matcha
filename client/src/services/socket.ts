import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Initialize socket connection with authentication
 * @param token - JWT auth token
 * @returns Socket instance
 */
export const initializeSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  
  socket.connect();
  
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get current socket instance if available
 */
export const getSocket = (): Socket | null => {
  return socket;
};
