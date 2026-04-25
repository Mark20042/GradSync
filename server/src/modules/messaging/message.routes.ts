import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import Message from '../../shared/models/Message.model.js';
import Conversation from '../../shared/models/Conversation.model.js';
import { createNotification } from '../../shared/utils/notification.helper.js';

const router = Router();

// GET /api/messages/:conversationId
router.get('/:conversationId', protect as any, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'fullName avatar role').sort({ createdAt: 'asc' });
    res.status(200).json(messages);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/messages
router.post('/', protect as any, async (req: any, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const newMessage = await Message.create({ conversationId, sender: senderId, content });
    const conversation = await Conversation.findByIdAndUpdate(conversationId,
      { lastMessage: { text: content, sender: senderId, sentAt: Date.now() } }, { new: true })
      .populate('participants', 'fullName role');
    if (conversation) {
      const recipient = (conversation as any).participants.find((p: any) => String(p._id) !== String(senderId));
      if (recipient) {
        await createNotification(recipient._id, 'MESSAGE', 'New Message',
          `You have a new message from ${req.user.fullName || 'a user'}`, conversationId);
      }
    }
    const populated = await Message.findById(newMessage._id).populate('sender', 'fullName avatar');
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: 'Failed to send message' }); }
});

export default router;
