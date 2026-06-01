import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, UnauthenticatedError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Notification from "@/utils/notification.helper.js";

const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.status(StatusCodes.OK).json(notifications);
  } catch (error) { next(error); }
};

const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) throw new NotFoundError("Notification not found");
    if (String(notification.recipient) !== String(req.user._id)) throw new UnauthenticatedError("Not authorized");
    notification.isRead = true;
    await notification.save();
    res.status(StatusCodes.OK).json(notification);
  } catch (error) { next(error); }
};

export { getNotifications, markAsRead };
