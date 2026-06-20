import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import dns from 'node:dns';
import TerminationReason from '@/models/TerminationReason.model.js';

dotenv.config();

// Use public DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const DEFAULT_REASONS = [
  { label: 'Contract ended', description: 'The employment contract naturally reached its end date.', order: 1 },
  { label: 'Performance issues', description: 'Employee did not meet the expected performance standards.', order: 2 },
  { label: 'Misconduct', description: 'Employee violated company policies or code of conduct.', order: 3 },
  { label: 'Resigned', description: 'Employee voluntarily resigned from the position.', order: 4 },
  { label: 'Redundancy', description: 'The position was made redundant due to restructuring.', order: 5 },
  { label: 'Probationary period failed', description: 'Employee did not pass the probationary evaluation.', order: 6 },
  { label: 'Other', description: 'Another reason not listed above.', order: 7 },
];

async function seedTerminationReasons() {
  try {
    const count = await TerminationReason.countDocuments();
    if (count === 0) {
      await TerminationReason.insertMany(DEFAULT_REASONS);
      console.log('✅ Seeded default termination reasons.');
    }
  } catch (e) {
    console.error('⚠️  Could not seed termination reasons:', e);
  }
}

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedTerminationReasons();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ MongoDB Connection Error: ${message}`);
    process.exit(1);
  }
};
