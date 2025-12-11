const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema({
  graduate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
});

module.exports = mongoose.model("SavedJob", savedJobSchema);
