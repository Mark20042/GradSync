import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import dns from 'node:dns';

dotenv.config();

// Use public DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ MongoDB Connection Error: ${message}`);
    process.exit(1);
  }
};
