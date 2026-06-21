import { connectDB } from '@/config/db.js';
import Notification from '@/utils/notification.helper.js';
import * as dotenv from 'dotenv';
import { subDays } from 'date-fns';

dotenv.config();

const runScheduler = async () => {
  try {
    console.log('🔄 Heroku Scheduler starting...');
    await connectDB();
    
    const thirtyDaysAgo = subDays(new Date(), 30);
    console.log(`Cleaning notifications older than ${thirtyDaysAgo.toISOString()}`);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    console.log(`✅ Successfully deleted ${result.deletedCount} old notifications`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Scheduler failed:', error);
    process.exit(1);
  }
};

runScheduler();
