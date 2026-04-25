const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  category: { type: String, default: "General" },
  idealAnswer: { type: String, default: "" }, // Admin-provided reference answer for AI evaluation
});

const interviewRoleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true }, // e.g., "Frontend Developer"
    description: { type: String, default: "" },
    questions: [questionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("InterviewRole", interviewRoleSchema);
