import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IRoleQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  category?: string;
  idealAnswer?: string;
}

export interface IInterviewRole extends Document {
  _id: Types.ObjectId;
  roleName: string;
  description?: string;
  questions: IRoleQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema({
  questionText: { type: String, required: true },
  category: { type: String, default: 'General' },
  idealAnswer: { type: String, default: '' },
});

const interviewRoleSchema = new Schema<IInterviewRole>(
  {
    roleName: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const InterviewRole = mongoose.model<IInterviewRole>('InterviewRole', interviewRoleSchema);
export default InterviewRole;
