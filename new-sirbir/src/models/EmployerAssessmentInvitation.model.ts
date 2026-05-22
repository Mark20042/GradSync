import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IEmployerAssessmentInvitation extends Document {
  employer: Types.ObjectId;
  candidate: Types.ObjectId;
  assessment: Types.ObjectId;
  job?: Types.ObjectId;
  dueDate: Date;
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IEmployerAssessmentInvitation>(
  {
    employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assessment: { type: Schema.Types.ObjectId, ref: 'EmployerAssessment', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job' }, // optional, context for why they were invited
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'completed', 'expired'], default: 'pending' },
  },
  { timestamps: true }
);

const EmployerAssessmentInvitation = mongoose.model<IEmployerAssessmentInvitation>('EmployerAssessmentInvitation', invitationSchema);
export default EmployerAssessmentInvitation;
