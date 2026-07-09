import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IApplication extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  applicant: Types.ObjectId;
  resume?: string;
  status: 'Applied' | 'In Review' | 'Rejected' | 'Accepted' | 'Terminated' | 'Resigned' | 'Contract Ended';
  experienceRef?: Types.ObjectId;
  terminationReview?: Types.ObjectId;
  terminatedAt?: Date;
  terminationReason?: Types.ObjectId;
  resignationRequest?: {
    requestedEndDate: Date;
    status: 'Pending' | 'Approved' | 'Rejected';
    rejectedReason?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: [true, 'Job is required'] },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Applicant is required'] },
    resume: String,
    status: { type: String, enum: ['Applied', 'In Review', 'Rejected', 'Accepted', 'Terminated', 'Resigned', 'Contract Ended'], default: 'Applied' },
    experienceRef: { type: Schema.Types.ObjectId, default: null },
    terminationReview: { type: Schema.Types.ObjectId, ref: 'TerminationReview', default: null },
    terminatedAt: { type: Date, default: null },
    terminationReason: { type: Schema.Types.ObjectId, ref: 'TerminationReason', default: null },
    resignationRequest: {
      requestedEndDate: Date,
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      rejectedReason: String,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model<IApplication>('Application', applicationSchema);
export default Application;
