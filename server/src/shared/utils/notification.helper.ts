import { Schema, type Document, type Types } from 'mongoose';
import mongoose from 'mongoose';

/**
 * Lightweight Notification model for the initial migration.
 * Used by the AI module's scanForMatches to create match notifications.
 * The full notification module will be migrated separately.
 */

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  referenceId?: Types.ObjectId;
  isRead: boolean;
  createdAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

/**
 * Creates a notification document in the database.
 * Lightweight helper extracted from the old notificationController.
 */
export const createNotification = async (
  recipientId: Types.ObjectId | string,
  type: string,
  title: string,
  message: string,
  referenceId?: Types.ObjectId | string
): Promise<INotification> => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    referenceId,
  });
  return notification;
};

export default Notification;
