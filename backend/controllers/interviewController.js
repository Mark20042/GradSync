const Interview = require("../models/Interview");
const InterviewRole = require("../models/InterviewRole");
const { evaluateInterviewAnswer } = require("../ai_services/ollamaService");

// Save interview result (Legacy - Called by Python Agent)
exports.saveInterviewResult = async (req, res) => {
    try {
        const { candidateId, jobId, difficulty, recordingUrl, aiScore, aiFeedback } =
            req.body;

        const interview = new Interview({
            candidateId,
            jobId, // Optional
            difficulty,
            recordingUrl,
            aiScore,
            aiFeedback,
            status: "evaluated",
        });

        await interview.save();

        res.status(201).json({ message: "Interview saved successfully", interview });
    } catch (error) {
        console.error("Error saving interview:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Evaluate interview answers using Ollama RAG
exports.evaluateInterview = async (req, res) => {
    try {
        const { roleName, answers } = req.body;
        const candidateId = req.user._id;

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "No answers provided for evaluation." });
        }

        console.log(`Starting interview evaluation for user ${candidateId}, role: ${roleName}`);

        // Fetch ideal answers from the InterviewRole in DB
        const role = await InterviewRole.findOne({ roleName: roleName });
        const roleQuestions = role ? role.questions : [];

        // Build a map of questionId -> idealAnswer for quick lookup
        const idealAnswerMap = {};
        roleQuestions.forEach((q) => {
            idealAnswerMap[q._id.toString()] = q.idealAnswer || "";
        });

        // Evaluate each answer via Ollama
        const evaluatedAnswers = [];
        let totalScore = 0;
        const allStrengths = [];
        const allWeaknesses = [];

        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            const idealAnswer = idealAnswerMap[answer.questionId] || answer.idealAnswer || "";

            console.log(`Evaluating question ${i + 1}/${answers.length}: "${answer.questionText?.substring(0, 50)}..."`);

            let evaluation;
            try {
                evaluation = await evaluateInterviewAnswer(
                    answer.questionText,
                    idealAnswer,
                    answer.candidateAnswer
                );
            } catch (aiError) {
                console.error(`AI evaluation failed for question ${i + 1}:`, aiError.message);
                evaluation = {
                    score: 0,
                    feedback: "AI evaluation failed for this question. Please try again.",
                };
            }

            const evaluatedAnswer = {
                questionId: answer.questionId || null,
                questionText: answer.questionText,
                idealAnswer: idealAnswer,
                candidateAnswer: answer.candidateAnswer,
                score: evaluation.score,
                feedback: evaluation.feedback,
            };

            evaluatedAnswers.push(evaluatedAnswer);
            totalScore += evaluation.score;

            // Classify feedback for overall summary
            if (evaluation.score >= 70) {
                allStrengths.push(`Q${i + 1}: ${evaluation.feedback}`);
            } else if (evaluation.score < 50) {
                allWeaknesses.push(`Q${i + 1}: ${evaluation.feedback}`);
            }
        }

        // Calculate aggregate score
        const aiScore = Math.round(totalScore / answers.length);

        // Build structured feedback
        const aiFeedback = {
            overallScore: aiScore,
            totalQuestions: answers.length,
            strengths: allStrengths.length > 0
                ? allStrengths
                : ["Keep practicing to build your strengths!"],
            areasForImprovement: allWeaknesses.length > 0
                ? allWeaknesses
                : ["Good job overall. Continue refining your answers."],
            summary: aiScore >= 80
                ? "Excellent performance! You demonstrated strong knowledge and communication skills."
                : aiScore >= 60
                    ? "Good effort! You covered the core concepts but could improve on depth and specificity."
                    : aiScore >= 40
                        ? "Fair performance. Focus on studying the key concepts for this role and practice articulating your thoughts clearly."
                        : "Needs significant improvement. Review the fundamentals for this role and practice answering common interview questions.",
        };

        // Save to database (Upsert: overwrite existing if re-taking the same role)
        const interview = await Interview.findOneAndUpdate(
            { candidateId, roleName: roleName || "General" },
            {
                $set: {
                    answers: evaluatedAnswers,
                    aiScore,
                    aiFeedback,
                    status: "evaluated",
                }
            },
            { new: true, upsert: true }
        );

        console.log(`Interview evaluation complete. Score: ${aiScore}/100`);

        res.status(201).json({
            message: "Interview evaluated successfully",
            interview,
        });
    } catch (error) {
        console.error("Error evaluating interview:", error);
        res.status(500).json({ message: "Failed to evaluate interview. Ensure Ollama is running." });
    }
};

// Get interviews for the currently logged-in candidate
exports.getUserInterviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const interviews = await Interview.find({ candidateId: userId }).sort({
            createdAt: -1,
        });
        res.status(200).json(interviews);
    } catch (error) {
        console.error("Error fetching user interviews:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get interview details by ID
exports.getInterviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id).populate(
            "candidateId",
            "fullName email avatar"
        );
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        res.status(200).json(interview);
    } catch (error) {
        console.error("Error fetching interview:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all interviews (For Admin Dashboard)
exports.getAllInterviewScores = async (req, res) => {
    try {
        const interviews = await Interview.find({ status: "evaluated" })
            .populate("candidateId", "fullName email avatar degree")
            .sort({ createdAt: -1 });
        res.status(200).json(interviews);
    } catch (error) {
        console.error("Error fetching all interview scores:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get interviews for a specific graduate (For Employer view)
exports.getGraduateInterviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const interviews = await Interview.find({
            candidateId: userId,
            status: "evaluated",
        }).sort({ createdAt: -1 });
        res.status(200).json(interviews);
    } catch (error) {
        console.error("Error fetching graduate interviews:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all interviews (Legacy - For Employer Dashboard)
exports.getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find()
            .populate("candidateId", "fullName email avatar")
            .sort({ createdAt: -1 });
        res.status(200).json(interviews);
    } catch (error) {
        console.error("Error fetching all interviews:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete an interview record (Admin only)
exports.deleteInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        await Interview.findByIdAndDelete(id);
        res.status(200).json({ message: "Interview record deleted successfully" });
    } catch (error) {
        console.error("Error deleting interview:", error);
        res.status(500).json({ message: "Server error" });
    }
};
