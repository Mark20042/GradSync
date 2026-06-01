import type { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '@/config/environment.js';
import Message from '@/models/Message.model.js';
import Conversation from '@/models/Conversation.model.js';
import User from '@/models/User.model.js';
import { createNotification } from '@/utils/notification.helper.js';
import { checkAndSendAutoReply } from '@/services/auto-reply.helper.js';

import { isMessageClean } from '@/controllers/message.controller.js';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer): void => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`📡 User connected to Socket.IO: ${socket.id}`);

    // 1. User joins a room with their own User ID
    socket.on('joinRoom', (userId: string) => {
      socket.join(userId);
      console.log(`↳ User ${userId} joined room: ${userId}`);
    });

    // 2. Listen for a new message
    socket.on('sendMessage', async ({ conversationId, senderId, recipientId, content }) => {
      try {
        const validation = isMessageClean(content);
        if (!validation.clean) {
          // Send error specifically back to the sender
          return socket.emit('messageError', { message: validation.reason });
        }
        // Save the new message to the database
        const newMessage = new Message({ conversationId, sender: senderId, content });
        const savedMessage = await newMessage.save();

        // Update the conversation's 'lastMessage' for UI previews
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: { text: content, sender: senderId, sentAt: new Date() },
        });

        // Populate sender info before emitting
        const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'fullName avatar role');

        // Create notification for the recipient
        const sender = await User.findById(senderId).select('fullName');
        if (sender) {
          await createNotification(
            recipientId,
            'MESSAGE',
            'New Message',
            `${sender.fullName || 'Someone'} sent you a message`,
            conversationId
          );
        }

        // Emit the message to the recipient's room
        io.to(recipientId).emit('receiveMessage', populatedMessage);

        // Emit confirmation back to the sender
        io.to(senderId).emit('messageSent', populatedMessage);

        // Check for Auto-Reply (Employer Auto-Pilot)
        await checkAndSendAutoReply(recipientId, senderId, content, conversationId, io);

      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('messageError', { message: 'Could not send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  console.log('⚡ Socket.IO initialized successfully');
};

export const getIo = (): SocketIOServer => {
  if (!io) { throw new Error('Socket.io is not initialized!'); }
  return io;
};
