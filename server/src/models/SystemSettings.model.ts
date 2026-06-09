import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSettings extends Document {
  aiCosts: {
    interview: number;
    jobMatch: number;
    suitability: number;
    skillVerification: number;
  };
}

const systemSettingsSchema = new Schema<ISystemSettings>({
  aiCosts: {
    interview: { type: Number, default: 20 },
    jobMatch: { type: Number, default: 1 },
    suitability: { type: Number, default: 1 },
    skillVerification: { type: Number, default: 1 },
  },
});

const SystemSettings = mongoose.model<ISystemSettings>("SystemSettings", systemSettingsSchema);
export default SystemSettings;
