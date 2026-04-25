const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    codeSnippet: { type: String, default: "" }, // Optional code block
    imageUrl: { type: String, default: "" }, // Optional image URL
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: "" }, // Explanation for correct answer
});

const assessmentSchema = new mongoose.Schema(
    {
        skill: { type: String, required: true, unique: true }, // e.g., "JavaScript", "React"
        title: { type: String, required: true }, // e.g., "JavaScript Fundamentals"
        difficulty: {
            type: String,
            enum: ["Entry", "Mid", "Senior", "Expert"],
            default: "Entry",
        },
        timeLimit: { type: Number, default: 15 }, // Time limit in minutes
        passingScore: { type: Number, default: 80 }, // Passing percentage (0-100)
        questions: [questionSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
