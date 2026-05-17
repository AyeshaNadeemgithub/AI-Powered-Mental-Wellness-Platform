const socketIo = require('socket.io');
const prisma = require('./src/lib/prisma');
const jwt = require('jsonwebtoken');

// A map to store connected users and their socket IDs for online status
const connectedUsers = new Map(); // userId -> socketId

function getConnectedUsers() {
  return connectedUsers;
}

function initSocket(server) {
  console.log("Initializing Socket.IO...");
  const io = socketIo(server, {
    cors: {
      origin: "*", // Configure this to frontend origin in production
      methods: ["GET", "POST"]
    }
  });
  console.log("Socket.IO Initialized.");

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true }
      });

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.role}) [Socket: ${socket.id}]`);
    
    // Store user as online
    connectedUsers.set(socket.user.id, socket.id);
    
    // Broadcast to everyone that this user is online
    io.emit('user_status_change', { userId: socket.user.id, status: 'online' });

    // Join a specific conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
      console.log(`User ${socket.user.id} joined conversation: ${conversationId}`);
    });

    // Leave a specific conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
      console.log(`User ${socket.user.id} left conversation: ${conversationId}`);
    });

    // Handle incoming messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;
        
        // Ensure user is part of the conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { patientId: socket.user.id },
              { psychologistId: socket.user.id }
            ]
          }
        });

        if (!conversation) {
          console.error("Unauthorized message attempt or conversation not found");
          return;
        }

        // Save message to database
        const savedMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: socket.user.id,
            content: content,
            isRead: false
          },
          include: {
            sender: {
              select: { id: true, firstName: true, avatarUrl: true }
            }
          }
        });

        // Update conversation last message timestamp
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { 
            lastMessage: content,
            lastMessageAt: new Date()
          }
        });

        // Determine recipient ID
        const recipientId = conversation.patientId === socket.user.id 
          ? conversation.psychologistId 
          : conversation.patientId;

        // 1. Broadcast to the room (for people already looking at the chat)
        io.to(`conv_${conversationId}`).emit('new_message', savedMessage);

        // 2. Emit a global notification to the recipient (for the toast)
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message_notification', {
            conversationId: conversation.id,
            content: content,
            senderName: savedMessage.sender.firstName
          });
        } else {
          // Recipient is offline, create a DB Notification
          await prisma.notification.create({
            data: {
              userId: recipientId,
              type: 'NEW_MESSAGE',
              title: `New message from ${savedMessage.sender.firstName}`,
              message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
              payload: { conversationId: conversation.id }
            }
          });
        }

      } catch (err) {
        console.error("Error sending message via socket:", err);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      // Broadcast to others in the room
      socket.to(`conv_${conversationId}`).emit('typing_status', {
        userId: socket.user.id,
        isTyping
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        const { conversationId } = data;
        
        await prisma.message.updateMany({
          where: {
            conversationId: conversationId,
            senderId: { not: socket.user.id },
            isRead: false
          },
          data: { isRead: true }
        });

        // Notify the room that messages were read
        socket.to(`conv_${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: socket.user.id
        });

      } catch (err) {
        console.error("Error marking messages as read via socket:", err);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      connectedUsers.delete(socket.user.id);
      io.emit('user_status_change', { userId: socket.user.id, status: 'offline' });
    });
  });

  return io;
}

module.exports = { initSocket, getConnectedUsers };
