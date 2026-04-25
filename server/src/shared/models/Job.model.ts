import mongoose, { Schema } from 'mongoose';
import type { IJob } from '../interfaces/base.interfaces.js';

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: String,
      required: [true, 'Job requirements are required'],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: String,
    type: String,
    category: String,
    skills: [String],
    salary: Number,
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model<IJob>('Job', jobSchema);
export default Job;
