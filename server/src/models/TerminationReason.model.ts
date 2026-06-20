import mongoose, { Schema, type Document } from 'mongoose';

export interface ITerminationReason extends Document {
  label: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const terminationReasonSchema = new Schema<ITerminationReason>(
  {
    label: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TerminationReason = mongoose.model<ITerminationReason>('TerminationReason', terminationReasonSchema);
export default TerminationReason;
