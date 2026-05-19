import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket;

export const initSocket = (token) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: {
      token
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("calmmind_token");
    if (token) {
      return initSocket(token);
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
