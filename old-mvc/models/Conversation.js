const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    /**
     * An array containing the two participants:
     * [0] will be the graduate (applicant)
     * [1] will be the employer (job poster)
     */
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    /**
     * This is the "classification" you wanted.
     * Links this entire chat to a single Job.
     */
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },

    /**
     * Used for chat list previews.
     * Updated every time a new message is sent.
     */
    lastMessage: {
      text: String,
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      sentAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Index removed to allow multiple conversations per job (one per applicant)

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
