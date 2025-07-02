const { Server } = require("socket.io");
const { getUserFromToken } = require("../utils/userUtils");

/**
 * Configure and initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Configured Socket.IO server instance
 */
const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = await getUserFromToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  return io;
};

module.exports = { initializeSocket };