const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    /**
     * The User ID of the person who sent the message.
     */
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /**
     * The text content of the message.
     */
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
