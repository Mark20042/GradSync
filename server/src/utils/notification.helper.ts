import { Schema, type Document, type Types } from 'mongoose';
import mongoose from 'mongoose';
import webpush from 'web-push';
import User from '@/models/User.model.js';
import { env } from '@/config/environment.js';

if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@gradsync.com',
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
}

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

  // Send Web Push Notification if user is subscribed
  try {
    const user = await User.findById(recipientId).select('pushSubscription');
    if (user?.pushSubscription && env.VAPID_PUBLIC_KEY) {
      const payload = JSON.stringify({
        title: `GradSync - ${title}`,
        message,
        type,
        referenceId,
      });
      await webpush.sendNotification(user.pushSubscription, payload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid
          console.log('Push subscription expired, removing...');
          return User.findByIdAndUpdate(recipientId, { pushSubscription: null });
        } else {
          console.error('Error sending push notification:', err);
        }
      });
    }
  } catch (error) {
    console.error('Failed to process web push:', error);
  }

  return notification;
};

export default Notification;
