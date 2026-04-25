const Assessment = require("../models/Assessment");
const User = require("../models/User");

// Get assessment by skill
exports.getAssessment = async (req, res) => {
  try {
    const { skill } = req.params;
    const assessment = await Assessment.findOne({ skill });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit assessment
exports.submitAssessment = async (req, res) => {
  try {
    const { skill, answers } = req.body; // answers = [{ questionId, selectedOption }]
    const userId = req.user._id;

    // Fetch the assessment
    const assessment = await Assessment.findOne({ skill });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Grade
    let correctCount = 0;
    assessment.questions.forEach((q) => {
      const userAnswer = answers.find((a) => a.questionId === q._id.toString());
      if (
        userAnswer &&
        userAnswer.selectedOption.trim() === q.correctAnswer.trim()
      ) {
        correctCount++;
      }
    });

    const score = (correctCount / assessment.questions.length) * 100;
    const passed = score >= assessment.passingScore; // Use assessment's passing score

    if (passed) {
      const user = await User.findById(userId);

      // Determine level based on assessment difficulty (now they match 1:1)
      const level = assessment.difficulty; // Entry, Mid, or Senior

      // Check if skill is already verified
      const existingSkillIndex = user.verifiedSkills.findIndex(
        (s) => s.skill === skill,
      );

      if (existingSkillIndex >= 0) {
        // Update existing skill level if new level is higher
        const levelHierarchy = { Entry: 1, Mid: 2, Senior: 3, Expert: 4 };
        const currentLevel =
          user.verifiedSkills[existingSkillIndex].level || "Entry";

        // Update if level is higher OR if level is same but score/date needs update
        if (
          levelHierarchy[level] > levelHierarchy[currentLevel] ||
          levelHierarchy[level] === levelHierarchy[currentLevel]
        ) {
          user.verifiedSkills[existingSkillIndex].level = level;
          user.verifiedSkills[existingSkillIndex].assessmentTitle =
            assessment.title;
          user.verifiedSkills[existingSkillIndex].earnedAt = new Date();

          // Only update score if it's higher or if it was missing (0)
          const currentScore =
            user.verifiedSkills[existingSkillIndex].score || 0;
          if (score > currentScore) {
            user.verifiedSkills[existingSkillIndex].score = score;
          }
        }
      } else {
        // Add new verified skill
        user.verifiedSkills.push({
          skill: skill,
          assessmentTitle: assessment.title,
          level: level,
          badgeIcon: "verified-badge",
          score: score,
        });
      }

      await user.save();
    }

    res.status(200).json({
      score,
      passed,
      candidateName: passed && req.user ? req.user.fullName : undefined, // Attach name if passed
      message: passed
        ? "Congratulations! You passed the assessment."
        : "You did not pass. Try again later.",
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new assessment (Admin)
exports.createAssessment = async (req, res) => {
  try {
    const { skill, title, difficulty, timeLimit, passingScore } = req.body;

    const existing = await Assessment.findOne({ skill });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Assessment for this skill already exists" });
    }

    const assessment = new Assessment({
      skill,
      title,
      difficulty,
      timeLimit: timeLimit || 15,
      passingScore: passingScore || 80,
      questions: [],
    });

    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all assessments (Admin)
exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find();
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a question to an assessment (Admin)
exports.addQuestion = async (req, res) => {
  try {
    const { skill } = req.params;
    const {
      questionText,
      codeSnippet,
      imageUrl,
      options,
      correctAnswer,
      explanation,
    } = req.body;

    const assessment = await Assessment.findOne({ skill });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    assessment.questions.push({
      questionText,
      codeSnippet: codeSnippet || "",
      imageUrl: imageUrl || "",
      options,
      correctAnswer,
      explanation: explanation || "",
    });

    await assessment.save();
    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update assessment (Admin)
exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { skill, title, difficulty, timeLimit, passingScore } = req.body;

    const assessment = await Assessment.findByIdAndUpdate(
      id,
      { skill, title, difficulty, timeLimit, passingScore },
      { new: true, runValidators: true },
    );

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete assessment (Admin)
exports.deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findByIdAndDelete(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a specific question in an assessment (Admin)
exports.updateQuestion = async (req, res) => {
  try {
    const { assessmentId, questionId } = req.params;
    const {
      questionText,
      codeSnippet,
      imageUrl,
      options,
      correctAnswer,
      explanation,
    } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const question = assessment.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.questionText = questionText;
    question.codeSnippet = codeSnippet || "";
    question.imageUrl = imageUrl || "";
    question.options = options;
    question.correctAnswer = correctAnswer;
    question.explanation = explanation || "";

    await assessment.save();
    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a specific question from an assessment (Admin)
exports.deleteQuestion = async (req, res) => {
  try {
    const { assessmentId, questionId } = req.params;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    assessment.questions.id(questionId).remove();
    await assessment.save();

    res
      .status(200)
      .json({ message: "Question deleted successfully", assessment });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single assessment by ID (Admin)
exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = exports;
// Get all users who have verified a specific skill (Admin)
exports.getVerifiedUsers = async (req, res) => {
  try {
    const { skill } = req.params;

    // Fetch assessment to get passing score for legacy data fallback
    const assessment = await Assessment.findOne({ skill });
    const defaultScore = assessment ? assessment.passingScore || 80 : 80;

    // Case-insensitive search requires regex, but since we store exact strings for skills, exact match is preferred for performance if possible.
    // Assuming consistent casings.
    const users = await User.find({ "verifiedSkills.skill": skill }).select(
      "fullName email verifiedSkills",
    );

    const verifiedUsers = users.map((user) => {
      const skillData = user.verifiedSkills.find((s) => s.skill === skill);
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        level: skillData.level,
        earnedAt: skillData.earnedAt,
        assessmentTitle: skillData.assessmentTitle,
        score:
          skillData.score && skillData.score > 0
            ? skillData.score
            : defaultScore,
      };
    });

    // Sort by score descending (Leaderboard)
    verifiedUsers.sort((a, b) => b.score - a.score);

    res.status(200).json(verifiedUsers);
  } catch (error) {
    console.error("Error fetching verified users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unverify a user for a specific skill (Admin)
exports.unverifyUser = async (req, res) => {
  try {
    const { userId, skill } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.verifiedSkills = user.verifiedSkills.filter((s) => s.skill !== skill);
    await user.save();

    res.status(200).json({ message: "User unverified successfully" });
  } catch (error) {
    console.error("Error unverifying user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
