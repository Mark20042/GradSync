import mongoose, { Schema, Document } from "mongoose";

export interface ISystemMetrics extends Document {
  date: string; // YYYY-MM-DD
  geminiDailyRequests: number;
  gemmaDailyRequests: number;
}

const systemMetricsSchema = new Schema<ISystemMetrics>({
  date: { type: String, required: true, unique: true },
  geminiDailyRequests: { type: Number, default: 0 },
  gemmaDailyRequests: { type: Number, default: 0 },
});

const SystemMetrics = mongoose.model<ISystemMetrics>("SystemMetrics", systemMetricsSchema);
export default SystemMetrics;
