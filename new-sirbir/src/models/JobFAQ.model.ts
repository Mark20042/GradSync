import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IJobFAQ extends Document {
  _id: Types.ObjectId;
  employer: Types.ObjectId;
  job?: Types.ObjectId;
  keywords?: string[];
  question: string;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const jobFAQSchema = new Schema<IJobFAQ>(
  {
    employer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job" },
    keywords: { type: [String], default: [] },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true },
);

const JobFAQ = mongoose.model<IJobFAQ>("JobFAQ", jobFAQSchema);
export default JobFAQ;
