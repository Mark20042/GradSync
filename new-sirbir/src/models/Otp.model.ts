import mongoose, { Schema } from "mongoose";

export interface IOtp extends mongoose.Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes in seconds
  },
});

const Otp = mongoose.model<IOtp>("Otp", otpSchema);
export default Otp;
