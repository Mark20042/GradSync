import mongoose, { Schema, Document } from "mongoose";

export interface IFeatureFeedback extends Document {
  user: mongoose.Types.ObjectId;
  featureName: string;
  rating: number;
  comments: string;
  improvements: string;
  createdAt: Date;
  updatedAt: Date;
}

const featureFeedbackSchema = new Schema<IFeatureFeedback>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    featureName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      default: "",
    },
    improvements: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const FeatureFeedback = mongoose.model<IFeatureFeedback>("FeatureFeedback", featureFeedbackSchema);
export default FeatureFeedback;
