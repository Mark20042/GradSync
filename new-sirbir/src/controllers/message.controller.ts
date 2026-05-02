import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Message from "@/models/Message.model.js";
import Conversation from "@/models/Conversation.model.js";
import { createNotification } from "@/utils/notification.helper.js";

const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate("sender", "fullName avatar role").sort({ createdAt: "asc" });
    res.status(StatusCodes.OK).json(messages);
  } catch (error) { next(error); }
};

const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content } = req.body;
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
    const populated = await Message.findById(newMessage._id).populate("sender", "fullName avatar");
    res.status(StatusCodes.CREATED).json(populated);
  } catch (error) { next(error); }
};

export { getMessages, sendMessage };
