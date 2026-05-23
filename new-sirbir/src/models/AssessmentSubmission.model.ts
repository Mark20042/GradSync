import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IAssessmentAnswer {
  questionId?: Types.ObjectId;
  selectedOption: string;
}

export interface IAssessmentViolation {
  type: string;
  timestamp: Date;
  questionIndex: number;
}

export interface IAssessmentSubmission extends Document {
  _id: Types.ObjectId;
  assessment: Types.ObjectId;
  user: Types.ObjectId;
  answers: IAssessmentAnswer[];
  score: number;
  passed: boolean;
  violations: IAssessmentViolation[];
  violationCount: number;
  timeSpent: number;
  forcedSubmission: boolean;
  categoryScores?: Record<string, number>;
  categoryInterpretation?: string;
  status: "approved" | "rejected";
  rejectionReason?: string | null;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const answerSchema = new Schema<IAssessmentAnswer>({
  questionId: { type: Schema.Types.ObjectId, ref: "Assessment" },
  selectedOption: { type: String, required: true },
});

const violationSchema = new Schema<IAssessmentViolation>({
  type: { type: String, required: true },
  timestamp: { type: Date, required: true },
  questionIndex: { type: Number, required: true },
});

const assessmentSubmissionSchema = new Schema<IAssessmentSubmission>(
  {
    assessment: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
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
      enum: ["approved", "rejected"],
      default: "rejected",
    },
    rejectionReason: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const AssessmentSubmission = mongoose.model<IAssessmentSubmission>(
  "AssessmentSubmission",
  assessmentSubmissionSchema,
);

export default AssessmentSubmission;
