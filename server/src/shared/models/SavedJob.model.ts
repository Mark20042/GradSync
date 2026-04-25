import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISavedJob extends Document {
  _id: Types.ObjectId;
  graduate: Types.ObjectId;
  job: Types.ObjectId;
}

const savedJobSchema = new Schema<ISavedJob>({
  graduate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
});

const SavedJob = mongoose.model<ISavedJob>('SavedJob', savedJobSchema);
export default SavedJob;
