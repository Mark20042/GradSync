const InterviewRole = require("../models/InterviewRole");

// Get all interview questions (flattened for Job Seeker UI)
exports.getFlatQuestions = async (req, res) => {
  try {
    const { category, jobRole } = req.query;
    const roles = await InterviewRole.find();

    let allQuestions = [];
    roles.forEach((role) => {
      // match jobRole if requested
      if (
        jobRole &&
        !role.roleName.toLowerCase().includes(jobRole.toLowerCase())
      ) {
        return;
      }

      role.questions.forEach((q) => {
        // match category / difficulty if requested
        if (category && category !== "All" && q.category !== category) return;

        allQuestions.push({
          _id: q._id,
          roleId: role._id,
          jobRole: role.roleName,
          question: q.questionText,
          category: q.category,
          idealAnswer: q.idealAnswer || "",
        });
      });
    });

    res.status(200).json(allQuestions);
  } catch (error) {
    console.error("Error fetching flat interview questions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all interview roles
exports.getInterviewRoles = async (req, res) => {
  try {
    const roles = await InterviewRole.find().sort({ createdAt: -1 });
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching interview roles:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new interview role
exports.createInterviewRole = async (req, res) => {
  try {
    const { roleName, description } = req.body;

    const roleExists = await InterviewRole.findOne({ roleName });
    if (roleExists) {
      return res.status(400).json({ message: "Job Role already exists" });
    }

    const newRole = new InterviewRole({ roleName, description, questions: [] });
    await newRole.save();
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating interview role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an interview role
exports.updateInterviewRole = async (req, res) => {
  try {
    const { roleName, description } = req.body;
    const updatedRole = await InterviewRole.findByIdAndUpdate(
      req.params.id,
      { roleName, description },
      { new: true, runValidators: true },
    );
    if (!updatedRole)
      return res.status(404).json({ message: "Role not found" });
    res.status(200).json(updatedRole);
  } catch (error) {
    console.error("Error updating interview role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an interview role
exports.deleteInterviewRole = async (req, res) => {
  try {
    const deletedRole = await InterviewRole.findByIdAndDelete(req.params.id);
    if (!deletedRole)
      return res.status(404).json({ message: "Role not found" });
    res.status(200).json({ message: "Role deleted" });
  } catch (error) {
    console.error("Error deleting interview role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Question to a Role
exports.addQuestionToRole = async (req, res) => {
  try {
    const role = await InterviewRole.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    role.questions.push(req.body);
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    console.error("Error adding question to role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Question in a Role
exports.updateQuestionInRole = async (req, res) => {
  try {
    const role = await InterviewRole.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    const question = role.questions.id(req.params.questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    question.questionText = req.body.questionText || question.questionText;
    question.category = req.body.category || question.category;
    if (req.body.idealAnswer !== undefined) question.idealAnswer = req.body.idealAnswer;

    await role.save();
    res.status(200).json(role);
  } catch (error) {
    console.error("Error updating question in role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Question from a Role
exports.deleteQuestionFromRole = async (req, res) => {
  try {
    const role = await InterviewRole.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    role.questions.pull(req.params.questionId);
    await role.save();
    res.status(200).json(role);
  } catch (error) {
    console.error("Error deleting question from role:", error);
    res.status(500).json({ message: "Server error" });
  }
};
