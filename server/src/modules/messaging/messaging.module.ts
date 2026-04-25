import type { Application } from 'express';
import conversationRoutes from './conversation.routes.js';
import messageRoutes from './message.routes.js';

export const registerMessagingModule = (app: Application): void => {
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/messages', messageRoutes);
  console.log('💬 Messaging Module registered at /api/conversations, /api/messages');
};
