const mongoose = require("mongoose");

const answerDetailSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    questionText: {
        type: String,
        required: true,
    },
    idealAnswer: {
        type: String,
        default: "",
    },
    candidateAnswer: {
        type: String, // STT transcript of the candidate's spoken answer
        default: "",
    },
    score: {
        type: Number, // Per-question score 0-100
        min: 0,
        max: 100,
        default: 0,
    },
    feedback: {
        type: String, // Per-question AI feedback
        default: "",
    },
});

const interviewSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        roleName: {
            type: String, // The job role name for this interview (e.g., "Frontend Developer")
            default: "General",
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            default: null, // Can be a general practice interview
        },
        difficulty: {
            type: String,
            enum: ["Entry", "Mid", "Senior", "Executive"],
            default: "Entry",
        },
        recordingUrl: {
            type: String,
            default: "", // Optional: not used for STT-based evaluation
        },
        answers: [answerDetailSchema], // Per-question STT answers and evaluations
        aiScore: {
            type: Number, // Aggregate score across all questions
            min: 0,
            max: 100,
            default: 0,
        },
        aiFeedback: {
            type: Object, // Structured JSON feedback (strengths, weaknesses, overall)
            default: {},
        },
        status: {
            type: String,
            enum: ["pending", "evaluated", "failed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
