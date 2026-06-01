import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IApplication extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  applicant: Types.ObjectId;
  resume?: string;
  status: 'Applied' | 'In Review' | 'Rejected' | 'Accepted';
  createdAt?: Date;
  updatedAt?: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: [true, 'Job is required'] },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Applicant is required'] },
    resume: String,
    status: { type: String, enum: ['Applied', 'In Review', 'Rejected', 'Accepted'], default: 'Applied' },
  },
  { timestamps: true }
);

const Application = mongoose.model<IApplication>('Application', applicationSchema);
export default Application;
