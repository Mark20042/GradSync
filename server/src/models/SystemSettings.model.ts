import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSettings extends Document {
  aiCosts: {
    interview: number;
    jobMatch: number;
    suitability: number;
    skillVerification: number;
    profileGeneration: number;
    employerSummary: number;
  };
  initialTokens: {
    graduate: number;
    jobseeker: number;
    employer: number;
  };
  tokenPackages: {
    basic: { tokens: number; price: number };
    popular: { tokens: number; price: number };
    premium: { tokens: number; price: number };
  };
}

const systemSettingsSchema = new Schema<ISystemSettings>({
  aiCosts: {
    interview: { type: Number, default: 20 },
    jobMatch: { type: Number, default: 1 },
    suitability: { type: Number, default: 1 },
    skillVerification: { type: Number, default: 1 },
    profileGeneration: { type: Number, default: 1 },
    employerSummary: { type: Number, default: 20 },
  },
  initialTokens: {
    graduate: { type: Number, default: 5 },
    jobseeker: { type: Number, default: 5 },
    employer: { type: Number, default: 5 },
  },
  tokenPackages: {
    basic: {
      tokens: { type: Number, default: 5 },
      price: { type: Number, default: 109 }
    },
    popular: {
      tokens: { type: Number, default: 15 },
      price: { type: Number, default: 239 }
    },
    premium: {
      tokens: { type: Number, default: 30 },
      price: { type: Number, default: 549 }
    }
  }
});

const SystemSettings = mongoose.model<ISystemSettings>("SystemSettings", systemSettingsSchema);
export default SystemSettings;
