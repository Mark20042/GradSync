import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAssessmentQuestion {
  _id?: Types.ObjectId;
  type: 'multiple-choice' | 'true-false' | 'identification';
  questionText: string;
  codeSnippet?: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  category?: string;
  difficulty?: 'Entry' | 'Mid' | 'Senior' | 'Expert';
}

export interface IAssessment extends Document {
  _id: Types.ObjectId;
  candidateId?: Types.ObjectId;
  skill: string;
  title: string;
  difficulty: 'Entry' | 'Mid' | 'Senior' | 'Expert';
  timeLimit: number;
  passingScore: number;
  maxTabSwitches: number;
  maxCopyPastes: number;
  maxWindowBlurs: number;
  maxRightClicks: number;
  maxDevTools: number;
  questions: IAssessmentQuestion[];
  status?: 'pending review' | 'approved' | 'generating';
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema({
  type: { type: String, enum: ['multiple-choice', 'true-false', 'identification'], default: 'multiple-choice' },
  questionText: { type: String, required: true },
  codeSnippet: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Expert'], default: 'Entry' },
});

const assessmentSchema = new Schema<IAssessment>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'User' },
    skill: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Expert'], default: 'Entry' },
    timeLimit: { type: Number, default: 15 },
    passingScore: { type: Number, default: 80 },
    maxTabSwitches: { type: Number, default: 3 },
    maxCopyPastes: { type: Number, default: 3 },
    maxWindowBlurs: { type: Number, default: 3 },
    maxRightClicks: { type: Number, default: 3 },
    maxDevTools: { type: Number, default: 1 },
    questions: [questionSchema],
    status: { type: String, enum: ['pending review', 'approved', 'generating'], default: 'approved' },
  },
  { timestamps: true }
);

const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);
export default Assessment;
