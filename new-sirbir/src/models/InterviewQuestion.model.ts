import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IInterviewQuestion extends Document {
  _id: Types.ObjectId;
  question: string;
  category: string;
  difficulty: 'Entry' | 'Mid' | 'Senior' | 'Executive' | 'All';
  jobRole: string;
  idealAnswer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const interviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    question: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    difficulty: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Executive', 'All'], required: true, default: 'Entry' },
    jobRole: { type: String, default: 'Any' },
    idealAnswer: { type: String, required: true, default: 'Answer pending admin input.' },
  },
  { timestamps: true }
);

const InterviewQuestion = mongoose.model<IInterviewQuestion>('InterviewQuestion', interviewQuestionSchema);
export default InterviewQuestion;
