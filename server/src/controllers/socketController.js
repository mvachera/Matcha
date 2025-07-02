const { connectedUsers, userRooms } = require("../models/userStore");

/**
 * Set up socket event handlers
 * @param {Object} io - Socket.IO server instance
 */
const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const username = socket.user?.username;
    if (!username) {
      console.log("User connected without username");
      return;
    }
    console.log(`User connected: ${username}, Socket ID: ${socket.id}`);

    // Store user connection
    connectedUsers.set(username, {
      socketId: socket.id,
      username: username,
      email: socket.user.email,
    });

    // Broadcast connected users
    broadcastConnectedUsers(io);

    // Join user to personal room
    socket.join(`user:${username}`);

    // Handle chat message
    socket.on("sendMessage", (data) => handleSendMessage(io, socket, data));

    // Handle typing indicator
    socket.on("typing", (data) => handleTypingIndicator(io, socket, data));

    // Handle disconnection
    socket.on("disconnect", () => handleDisconnect(io, socket));
  });
};

/**
 * Handle sending a message
 */
const handleSendMessage = (io, socket, data) => {
  const { recipientUsername, message, conversationId } = data;
  const senderUsername = socket.user.username;

  console.log(`Message from ${senderUsername} to ${recipientUsername}: ${message}`);

  // Create message object
  const messageObject = {
    // Fixed duplicate property
    senderUsername,
    recipientUsername,
    message,
    conversationId,
    timestamp: new Date(),
  };

  // Here you would typically save the message to your database
  // ...

  // Send to recipient if online
  const recipientSocketId = connectedUsers.get(recipientUsername)?.socketId;
  if (recipientSocketId) {
    io.to(recipientSocketId).emit("newMessage", messageObject);
  }

  // Also send to sender as confirmation
  socket.emit("messageSent", {
    ...messageObject,
    delivered: !!recipientSocketId,
  });
};

/**
 * Handle typing indicator
 */
const handleTypingIndicator = (io, socket, data) => {
  const { recipientUsername, isTyping } = data;
  const senderUsername = socket.user.username;

  const recipientSocketId = connectedUsers.get(recipientUsername)?.socketId;
  if (recipientSocketId) {
    io.to(recipientSocketId).emit("userTyping", {
      // Fixed duplicate property
      senderUsername,
      isTyping,
    });
  }
};

/**
 * Handle user disconnection
 */
const handleDisconnect = (io, socket) => {
  const username = socket.user?.username;
  if (!username) return;

  console.log(`User disconnected: ${username}`);

  // Remove from connected users
  connectedUsers.delete(username);

  // Broadcast updated list
  broadcastConnectedUsers(io);
};

/**
 * Broadcast connected users to all clients
 */
const broadcastConnectedUsers = (io) => {
  const connectedUsernames = Array.from(connectedUsers.values()).map((user) => user.username);

  io.emit("connectedUsers", connectedUsernames);
};

module.exports = { setupSocketHandlers };
