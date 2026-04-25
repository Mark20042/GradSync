const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Executive", "All"],
      required: true,
      default: "Entry",
    },
    jobRole: {
      type: String,
      default: "Any", // A custom string the admin can type, not tied to the Job collection
    },
    // Inside interviewQuestionSchema
    idealAnswer: {
      type: String,
      required: true,
      default: "Answer pending admin input.",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InterviewQuestion", interviewQuestionSchema);
