import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import { BadRequestError } from "@/errors/index.js";
import Message from "@/models/Message.model.js";
import Conversation from "@/models/Conversation.model.js";
import { createNotification } from "@/utils/notification.helper.js";

const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate("sender", "fullName avatar role")
      .sort({ createdAt: "asc" });
    res.status(StatusCodes.OK).json(messages);
  } catch (error) { next(error); }
};

export const isMessageClean = (messageText: string): { clean: boolean; reason?: string } => {
  if (!messageText) return { clean: true };
  const lowerCaseMsg = messageText.toLowerCase();

  // 1. Hate Speech & Spam Keywords
  const bannedKeywords = [
    "crypto", "bitcoin", "lottery", "earn fast", "sugar daddy",
    "piste", "yawa", "suck", "giatay", "dildos",
    "fuck", "shit", "bitch", "asshole", "cunt", "nigger", "faggot", "retard", "whore", "slut"
  ];
  const containsBannedWord = bannedKeywords.some(word => lowerCaseMsg.includes(word));
  if (containsBannedWord) {
    return { clean: false, reason: "Message contains prohibited keywords, spam, or inappropriate language." };
  }

  // 2. Regular Expression: Block URLs/Links
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  if (urlRegex.test(lowerCaseMsg)) {
    return { clean: false, reason: "External links are not permitted in the chat for security reasons." };
  }

  // 3. Regular Expression: Block Excessive Repeated Characters (e.g., "hiii")
  const repeatedCharsRegex = /(.)\1{2,}/g;
  if (repeatedCharsRegex.test(lowerCaseMsg)) {
    return { clean: false, reason: "Message contains excessive repeated characters." };
  }

  return { clean: true };
};

const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content } = req.body;

    const validation = isMessageClean(content);
    if (!validation.clean) {
      throw new BadRequestError(validation.reason);
    }

    const senderId = req.user._id;
    const newMessage = await Message.create({ conversationId, sender: senderId, content });
    const conversation = await Conversation.findByIdAndUpdate(conversationId,
      { lastMessage: { text: content, sender: senderId, sentAt: Date.now() } }, { new: true })
      .populate("participants", "fullName role");
    if (conversation) {
      const recipient = (conversation as any).participants.find((p: any) => String(p._id) !== String(senderId));
      if (recipient) {
        await createNotification(recipient._id, "MESSAGE", "New Message",
          `You have a new message from ${req.user.fullName || "a user"}`, conversationId);
      }
    }
    const populated = await Message.findById(newMessage._id)
      .populate("sender", "fullName avatar");
    res.status(StatusCodes.CREATED).json(populated);
  } catch (error) { next(error); }
};

export { getMessages, sendMessage };
