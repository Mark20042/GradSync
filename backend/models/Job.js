const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    requirements: {
      type: String,
      required: [true, "Requirements are required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    category: {
      type: String,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Company is required"],
    },
    salaryMin: {
      type: Number,
    },
    salaryMax: {
      type: Number,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: [
        "Remote",
        "Hybrid",
        "Full-Time",
        "Part-Time",
        "Internship",
        "Contract",
      ],
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    autoReplyMessage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
