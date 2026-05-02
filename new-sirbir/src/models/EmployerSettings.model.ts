import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ITimeRange {
  start: string;
  end: string;
  isOpen: boolean;
}

export interface IEmployerSettings extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  timezone: string;
  businessHours: {
    monday: ITimeRange;
    tuesday: ITimeRange;
    wednesday: ITimeRange;
    thursday: ITimeRange;
    friday: ITimeRange;
    saturday: ITimeRange;
    sunday: ITimeRange;
    [key: string]: ITimeRange; // For dynamic access
  };
  autoReplyMessage: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const timeRangeSchema = new Schema<ITimeRange>({
  start: { type: String, required: true },
  end: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
});

const employerSettingsSchema = new Schema<IEmployerSettings>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    timezone: { type: String, default: 'UTC' },
    businessHours: {
      monday: { type: timeRangeSchema, default: { start: '09:00', end: '17:00', isOpen: true } },
      tuesday: { type: timeRangeSchema, default: { start: '09:00', end: '17:00', isOpen: true } },
      wednesday: { type: timeRangeSchema, default: { start: '09:00', end: '17:00', isOpen: true } },
      thursday: { type: timeRangeSchema, default: { start: '09:00', end: '17:00', isOpen: true } },
      friday: { type: timeRangeSchema, default: { start: '09:00', end: '17:00', isOpen: true } },
      saturday: { type: timeRangeSchema, default: { start: '09:00', end: '17:00', isOpen: false } },
      sunday: { type: timeRangeSchema, default: { start: '09:00', end: '17:00', isOpen: false } },
    },
    autoReplyMessage: {
      type: String,
      default: 'Thank you for your message. We are currently closed and will get back to you during our business hours.',
    },
  },
  { timestamps: true }
);

const EmployerSettings = mongoose.model<IEmployerSettings>('EmployerSettings', employerSettingsSchema);
export default EmployerSettings;
