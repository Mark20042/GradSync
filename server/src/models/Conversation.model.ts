import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  job?: Types.ObjectId;
  lastMessage?: { text?: string; sender?: Types.ObjectId; sentAt?: Date };
  createdAt?: Date;
  updatedAt?: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: false },
    lastMessage: {
      text: String,
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export default Conversation;
