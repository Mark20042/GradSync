import cron from 'node-cron';
import Notification from '@/utils/notification.helper.js';

export const initCronJobs = () => {
  // Run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job to clean up old notifications...');
    try {
      // Calculate the date 5 days ago
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      // Delete notifications older than 5 days
      const result = await Notification.deleteMany({
        createdAt: { $lt: fiveDaysAgo }
      });

      console.log(`Successfully deleted ${result.deletedCount} old notifications.`);
    } catch (error) {
      console.error('Error deleting old notifications:', error);
    }
  });

  console.log('Cron jobs initialized successfully');
};
