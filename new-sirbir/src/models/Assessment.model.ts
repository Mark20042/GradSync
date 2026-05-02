import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAssessmentQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  codeSnippet?: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface IAssessment extends Document {
  _id: Types.ObjectId;
  skill: string;
  title: string;
  difficulty: 'Entry' | 'Mid' | 'Senior' | 'Expert';
  timeLimit: number;
  passingScore: number;
  questions: IAssessmentQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema({
  questionText: { type: String, required: true },
  codeSnippet: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const assessmentSchema = new Schema<IAssessment>(
  {
    skill: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Expert'], default: 'Entry' },
    timeLimit: { type: Number, default: 15 },
    passingScore: { type: Number, default: 80 },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);
export default Assessment;
