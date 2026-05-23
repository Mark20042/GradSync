import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IEmployerAssessmentAnswer {
  questionId?: Types.ObjectId;
  selectedOption: string;
}

export interface IEmployerAssessmentViolation {
  type: string;
  timestamp: Date;
  questionIndex: number;
}

export interface IEmployerAssessmentSubmission extends Document {
  _id: Types.ObjectId;
  employerAssessment: Types.ObjectId;
  user: Types.ObjectId;
  answers: IEmployerAssessmentAnswer[];
  score: number;
  passed: boolean;
  violations: IEmployerAssessmentViolation[];
  violationCount: number;
  timeSpent: number;
  forcedSubmission: boolean;
  categoryScores?: Record<string, number>;
  categoryInterpretation?: string;
  status: "under-review" | "approved" | "rejected" | "released";
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const answerSchema = new Schema<IEmployerAssessmentAnswer>({
  questionId: { type: Schema.Types.ObjectId },
  selectedOption: { type: String, required: true },
});

const violationSchema = new Schema<IEmployerAssessmentViolation>({
  type: { type: String, required: true },
  timestamp: { type: Date, required: true },
  questionIndex: { type: Number, required: true },
});

const employerAssessmentSubmissionSchema = new Schema<IEmployerAssessmentSubmission>(
  {
    employerAssessment: {
      type: Schema.Types.ObjectId,
      ref: "EmployerAssessment",
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: [answerSchema],
    score: { type: Number, min: 0, max: 100, default: 0 },
    passed: { type: Boolean, default: false },
    violations: [violationSchema],
    violationCount: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    forcedSubmission: { type: Boolean, default: false },
    categoryScores: { type: Map, of: Number, default: {} },
    categoryInterpretation: { type: String, default: '' },
    status: {
      type: String,
      enum: ["under-review", "approved", "rejected", "released"],
      default: "under-review",
    },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const EmployerAssessmentSubmission = mongoose.model<IEmployerAssessmentSubmission>(
  "EmployerAssessmentSubmission",
  employerAssessmentSubmissionSchema,
);

export default EmployerAssessmentSubmission;
