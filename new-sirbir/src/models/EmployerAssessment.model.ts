import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IEmployerAssessmentQuestion {
  _id?: Types.ObjectId;
  type: 'multiple-choice' | 'true-false' | 'identification';
  questionText: string;
  codeSnippet?: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  category?: string;
}

export interface IEmployerAssessment extends Document {
  _id: Types.ObjectId;
  employer: Types.ObjectId;
  job?: Types.ObjectId;
  title: string;
  description?: string;
  timeLimit: number;
  passingScore: number;
  strictProtocols: boolean;
  validFrom?: Date;
  validUntil?: Date;
  questions: IEmployerAssessmentQuestion[];
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
});

const employerAssessmentSchema = new Schema<IEmployerAssessment>(
  {
    employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', default: null },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    timeLimit: { type: Number, default: 15 },
    passingScore: { type: Number, default: 80 },
    strictProtocols: { type: Boolean, default: true },
    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const EmployerAssessment = mongoose.model<IEmployerAssessment>('EmployerAssessment', employerAssessmentSchema);
export default EmployerAssessment;
