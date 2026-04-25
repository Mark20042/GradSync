const InterviewQuestion = require("../models/InterviewQuestion");

// @desc    Create a new interview question
// @route   POST /api/interview-questions
// @access  Private/Admin
exports.createQuestion = async (req, res) => {
  try {
    const { question, category, difficulty, jobRole } = req.body;

    const newQuestion = new InterviewQuestion({
      question,
      category,
      difficulty,
      jobRole: jobRole || "Any",
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error creating interview question:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all interview questions
// @route   GET /api/interview-questions
// @access  Public (or Private depending on use case, let's keep it Private for job seekers)
exports.getQuestions = async (req, res) => {
  try {
    const { category, difficulty, jobRole } = req.query;
    let query = {};

    if (category && category !== "All") query.category = category;
    if (difficulty && difficulty !== "All") query.difficulty = difficulty;
    if (jobRole) {
      query.jobRole = { $regex: jobRole, $options: "i" }; // Case-insensitive match
    }

    const questions = await InterviewQuestion.find(query).sort({
      createdAt: -1,
    });
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching interview questions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an interview question
// @route   PUT /api/interview-questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res) => {
  try {
    const { question, category, difficulty, jobRole } = req.body;

    const updatedQuestion = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      { question, category, difficulty, jobRole: jobRole || "Any" },
      { new: true, runValidators: true },
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Error updating interview question:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete an interview question
// @route   DELETE /api/interview-questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await InterviewQuestion.findByIdAndDelete(
      req.params.id,
    );

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question removed" });
  } catch (error) {
    console.error("Error deleting interview question:", error);
    res.status(500).json({ message: "Server error" });
  }
};
