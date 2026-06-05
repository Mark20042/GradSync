import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IInterviewDraftQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  idealAnswer: string;
  category: 'General' | 'Communication' | 'Technical' | 'Behavioral';
}

export interface IInterviewDraft extends Document {
  _id: Types.ObjectId;
  candidateId: Types.ObjectId;
  status: 'draft' | 'pending review' | 'generating' | 'approved';
  questions: IInterviewDraftQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

const interviewDraftQuestionSchema = new Schema({
  questionText: { type: String, required: true },
  idealAnswer: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['General', 'Communication', 'Technical', 'Behavioral'], 
    required: true 
  },
});

const interviewDraftSchema = new Schema<IInterviewDraft>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'pending review', 'generating', 'approved'], default: 'approved' },
    questions: [interviewDraftQuestionSchema],
  },
  { timestamps: true }
);

const InterviewDraft = mongoose.model<IInterviewDraft>('InterviewDraft', interviewDraftSchema);
export default InterviewDraft;
