import mongoose from 'mongoose';
import { env } from './environment.js';


export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ MongoDB Connection Error: ${message}`);
    process.exit(1);
  }
};
