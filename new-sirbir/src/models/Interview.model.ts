import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAnswerDetail {
  questionId?: Types.ObjectId | null;
  questionText: string;
  idealAnswer?: string;
  candidateAnswer?: string;
  score: number;
  feedback?: string;
}

export interface IAiFeedback {
  overallScore?: number;
  totalQuestions?: number;
  strengths?: string[];
  areasForImprovement?: string[];
  summary?: string;
}

export interface IInterview extends Document {
  _id: Types.ObjectId;
  candidateId: Types.ObjectId;
  roleName: string;
  jobId?: Types.ObjectId | null;
  difficulty: 'Entry' | 'Mid' | 'Senior' | 'Executive';
  recordingUrl?: string;
  answers: IAnswerDetail[];
  aiScore: number;
  aiFeedback: IAiFeedback;
  status: 'pending' | 'evaluated' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

const answerDetailSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, default: null },
  questionText: { type: String, required: true },
  idealAnswer: { type: String, default: '' },
  candidateAnswer: { type: String, default: '' },
  score: { type: Number, min: 0, max: 100, default: 0 },
  feedback: { type: String, default: '' },
});

const interviewSchema = new Schema<IInterview>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roleName: { type: String, default: 'General' },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null },
    difficulty: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Executive'], default: 'Entry' },
    recordingUrl: { type: String, default: '' },
    answers: [answerDetailSchema],
    aiScore: { type: Number, min: 0, max: 100, default: 0 },
    aiFeedback: { type: Object, default: {} },
    status: { type: String, enum: ['pending', 'evaluated', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
export default Interview;
