import { Server as SocketIOServer } from 'socket.io';
import EmployerSettings from '../../shared/models/EmployerSettings.model.js';
import JobFAQ from '../../shared/models/JobFAQ.model.js';
import Message from '../../shared/models/Message.model.js';
import Conversation from '../../shared/models/Conversation.model.js';
import { toZonedTime, format } from 'date-fns-tz';

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Checks for FAQ matches or offline business hours to send an automated reply.
 */
export const checkAndSendAutoReply = async (
  recipientId: string,
  senderId: string,
  messageContent: string,
  conversationId: string,
  io: SocketIOServer
): Promise<void> => {
  try {
    // 1. Check if recipient has settings
    const settings = await EmployerSettings.findOne({ user: recipientId });
    if (!settings) return; // No settings, assume online or no auto-reply needed

    // 2. Check for FAQ match FIRST (FAQs should work 24/7)
    const faqs = await JobFAQ.find({ employer: recipientId });
    let autoReplyContent: string | null = null;
    let isFaqMatch = false;
    const lowerContent = messageContent.toLowerCase();

    for (const faq of faqs) {
      const questionLower = faq.question.toLowerCase();
      const messageWords = lowerContent.split(/\s+/).filter((word) => word.length >= 3);
      const questionWords = questionLower.split(/\s+/).filter((word) => word.length >= 3);

      let match = false;
      if (messageWords.length >= 2) {
        const matchingWords = questionWords.filter((qWord) =>
          messageWords.some((mWord) => mWord.includes(qWord) || qWord.includes(mWord))
        );
        const matchRatio = matchingWords.length / Math.max(questionWords.length, 1);
        match = matchRatio >= 0.5 && matchingWords.length >= 2;
      }

      if (!match && lowerContent.length >= 10) {
        const exactMatch = lowerContent.includes(questionLower) || questionLower.includes(lowerContent);
        match = exactMatch && lowerContent.length >= questionLower.length * 0.5;
      }

      if (match) {
        autoReplyContent = faq.answer;
        isFaqMatch = true;
        break;
      }
    }

    // 3. If no FAQ match, check if "offline" for generic auto-reply
    if (!isFaqMatch) {
      const timeZone = 'Asia/Manila';
      const now = new Date();
      const zonedDate = toZonedTime(now, timeZone);
      const dayName = daysOfWeek[zonedDate.getDay()];
      const currentTime = format(zonedDate, 'HH:mm', { timeZone });

      const todayHours = settings.businessHours?.[dayName as keyof typeof settings.businessHours];
      let isOffline = true;

      // Type-cast to any to get around the dynamic indexing on Mongoose Document
      const hours = todayHours as unknown as { isOpen: boolean; start: string; end: string };

      if (hours) {
        if (!hours.isOpen) {
          isOffline = true;
        } else {
          isOffline = currentTime < hours.start || currentTime > hours.end;
        }
      }

      if (isOffline && settings.autoReplyMessage) {
        autoReplyContent = settings.autoReplyMessage;
      }
    }

    if (!autoReplyContent) return;

    // 4. Send Auto-Reply
    const autoReply = new Message({
      conversationId,
      sender: recipientId, // Sent BY the employer (auto)
      content: `[Auto-Reply] ${autoReplyContent}`,
    });
    const savedReply = await autoReply.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { text: autoReply.content, sender: recipientId, sentAt: new Date() },
    });

    const populatedReply = await Message.findById(savedReply._id).populate('sender', 'fullName avatar role');
    io.to(senderId).emit('receiveMessage', populatedReply);

  } catch (error) {
    console.error('Auto-reply error:', error);
  }
};
