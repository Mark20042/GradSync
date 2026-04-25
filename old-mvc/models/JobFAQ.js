const mongoose = require("mongoose");

const jobFAQSchema = new mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: false, // Can be general FAQs or specific to a job
    },
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Index for faster keyword search could be added here if needed
// jobFAQSchema.index({ keywords: 'text' });

module.exports = mongoose.model("JobFAQ", jobFAQSchema);
