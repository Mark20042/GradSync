import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ITerminationReview extends Document {
  application: Types.ObjectId;
  job: Types.ObjectId;
  company: Types.ObjectId;
  employee: Types.ObjectId;

  // Jobseeker rates the Company (anonymous on company profile & job card)
  jobseekerRating?: number;
  jobseekerFeedback?: string;
  jobseekerTags?: string[];
  jobseekerRatedAt?: Date;
  isJobseekerRated: boolean;
  jobseekerRatingPromptDismissed: boolean;

  // Employer rates the Employee (score aggregated publicly, text is private)
  employerRating?: number;
  employerFeedback?: string; // PRIVATE — never returned in public API
  employerTags?: string[];   // PRIVATE — never returned in public API
  employerRatedAt?: Date;
  isEmployerRated: boolean;

  // Termination metadata
  terminationReason?: Types.ObjectId; // ref: TerminationReason (admin-configured)
  terminationDate: Date;
  tenureDays: number; // computed: terminationDate - application.createdAt

  createdAt?: Date;
  updatedAt?: Date;
}

const terminationReviewSchema = new Schema<ITerminationReview>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employee: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Jobseeker → Company
    jobseekerRating: { type: Number, min: 1, max: 5, default: null },
    jobseekerFeedback: { type: String, default: '' },
    jobseekerTags: { type: [String], default: [] },
    jobseekerRatedAt: { type: Date, default: null },
    isJobseekerRated: { type: Boolean, default: false },
    jobseekerRatingPromptDismissed: { type: Boolean, default: false },

    // Employer → Employee (text fields PRIVATE)
    employerRating: { type: Number, min: 1, max: 5, default: null },
    employerFeedback: { type: String, default: '' },
    employerTags: { type: [String], default: [] },
    employerRatedAt: { type: Date, default: null },
    isEmployerRated: { type: Boolean, default: false },

    // Termination metadata
    terminationReason: { type: Schema.Types.ObjectId, ref: 'TerminationReason', default: null },
    terminationDate: { type: Date, required: true },
    tenureDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for fast lookups
terminationReviewSchema.index({ company: 1, isJobseekerRated: 1 });
terminationReviewSchema.index({ employee: 1, isEmployerRated: 1 });
terminationReviewSchema.index({ job: 1 });
terminationReviewSchema.index({ employee: 1, isJobseekerRated: 1 });

const TerminationReview = mongoose.model<ITerminationReview>('TerminationReview', terminationReviewSchema);
export default TerminationReview;
