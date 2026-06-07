import type { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '@/config/environment.js';
import Message from '@/models/Message.model.js';
import Conversation from '@/models/Conversation.model.js';
import User from '@/models/User.model.js';
import { createNotification } from '@/utils/notification.helper.js';
import webpush from 'web-push';
import { checkAndSendAutoReply } from '@/services/auto-reply.helper.js';

import { isMessageClean } from '@/controllers/message.controller.js';

import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer): void => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  // Setup Redis Adapter if REDIS_URL exists
  if (process.env.REDIS_URL) {
    const redisUrl = process.env.REDIS_URL;
    const redisOptions = redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {};
    const pubClient = new Redis(redisUrl, redisOptions);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    console.log('🔗 Socket.IO configured with Redis Adapter');
  }

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
        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationId,
          { lastMessage: { text: content, sender: senderId, sentAt: new Date() } },
          { new: true }
        ).populate('job', 'title');

        // Populate sender info before emitting
        const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'fullName avatar role');

        // Send push notification directly instead of saving a Notification DB record
        const sender = await User.findById(senderId).select('fullName');
        if (sender) {
          const jobTitle = (updatedConversation?.job as any)?.title;
          const notificationMessage = jobTitle
            ? `${sender.fullName || 'Someone'} sent you a message regarding the ${jobTitle} position`
            : `${sender.fullName || 'Someone'} sent you a message`;

          // Trigger Web Push directly
          try {
            const recipient = await User.findById(recipientId).select('pushSubscription');
            if (recipient?.pushSubscription && env.VAPID_PUBLIC_KEY) {
              const payload = JSON.stringify({
                title: 'GradSync - New Message',
                message: notificationMessage,
                type: 'MESSAGE',
                referenceId: conversationId,
              });
              await webpush.sendNotification(recipient.pushSubscription, payload).catch((err: any) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                  User.findByIdAndUpdate(recipientId, { pushSubscription: null }).exec();
                } else {
                  console.error('Error sending push notification:', err);
                }
              });
            }
          } catch (pushErr) {
            console.error('Failed to send push for message:', pushErr);
          }
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
