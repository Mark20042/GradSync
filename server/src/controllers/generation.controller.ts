import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { generateAssessment, generateAllAssessments, generateInterviewDraft } from "../services/generation.service.js";
import Assessment from "../models/Assessment.model.js";
import InterviewDraft from "../models/InterviewDraft.model.js";
import User from "../models/User.model.js";
import AssessmentSubmission from "../models/AssessmentSubmission.model.js";
import Interview from "../models/Interview.model.js";
import { NotFoundError } from "../errors/index.js";

export const generateAssessmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skill, candidateId } = req.body;
    if (!skill || !candidateId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Skill and candidateId are required" });
    }
    const assessment = await generateAssessment(skill, candidateId);
    res.status(StatusCodes.CREATED).json(assessment);
  } catch (error) {
    next(error);
  }
};

// Generate assessments for ALL candidate skills sequentially
export const generateAllAssessmentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "candidateId is required" });
    }

    // Fetch user to get their skills
    const user = await User.findById(candidateId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Candidate not found" });
    }

    const rawSkills = [...(user.verifiedSkills || []), ...(user.skills || [])];
    const allSkills = Array.from(new Set(
      rawSkills.map((s: any) => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : s)
        .filter((s: any) => s && typeof s === 'string' && s.trim() !== '')
    )) as string[];

    if (allSkills.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Candidate has no skills listed" });
    }

    // Respond immediately — processing happens in background
    res.status(StatusCodes.ACCEPTED).json({
      message: `Started generating assessments for ${allSkills.length} skills sequentially`,
      skills: allSkills
    });

    // Fire sequential generation in background
    generateAllAssessments(allSkills, candidateId).catch(err =>
      console.error("Batch assessment generation error:", err)
    );
  } catch (error) {
    next(error);
  }
};

// Generate assessments for ONLY missing candidate skills sequentially
export const generateMissingAssessmentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "candidateId is required" });
    }

    // Fetch user to get their skills
    const user = await User.findById(candidateId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Candidate not found" });
    }

    const rawSkills = [...(user.verifiedSkills || []), ...(user.skills || [])];
    const allSkills = Array.from(new Set(
      rawSkills.map((s: any) => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : s)
        .filter((s: any) => s && typeof s === 'string' && s.trim() !== '')
    )) as string[];

    // Fetch existing assessments to determine missing skills
    const existingAssessments = await Assessment.find({ candidateId });
    const generatedSkills = existingAssessments.map(a => a.skill.toLowerCase());
    
    const missingSkills = allSkills.filter(s => !generatedSkills.includes(s.toLowerCase()));

    if (missingSkills.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Candidate has no missing skills" });
    }

    // Respond immediately — processing happens in background
    res.status(StatusCodes.ACCEPTED).json({
      message: `Started generating assessments for ${missingSkills.length} missing skills sequentially`,
      skills: missingSkills
    });

    // Fire sequential generation in background
    generateAllAssessments(missingSkills, candidateId).catch(err =>
      console.error("Batch missing assessment generation error:", err)
    );
  } catch (error) {
    next(error);
  }
};

export const approveAssessmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true, runValidators: true }
    );
    if (!assessment) throw new NotFoundError("Assessment not found");
    res.status(StatusCodes.OK).json(assessment);
  } catch (error) {
    next(error);
  }
};

export const generateInterviewDraftController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "candidateId is required" });
    }
    const interviewDraft = await generateInterviewDraft(candidateId);
    res.status(StatusCodes.CREATED).json(interviewDraft);
  } catch (error) {
    next(error);
  }
};

export const approveInterviewDraftController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const interviewDraft = await InterviewDraft.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true, runValidators: true }
    );
    if (!interviewDraft) throw new NotFoundError("Interview Draft not found");
    res.status(StatusCodes.OK).json(interviewDraft);
  } catch (error) {
    next(error);
  }
};

// Jobseeker/Graduate fetching their own APPROVED assessments
export const getMyApprovedAssessments = async (req: any, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.user._id;
    const assessments = await Assessment.find({ candidateId, status: 'approved' });
    res.status(StatusCodes.OK).json(assessments);
  } catch (error) {
    next(error);
  }
};

// Jobseeker/Graduate fetching their own APPROVED interviews
export const getMyApprovedInterviewDrafts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.user._id;
    const interviewDrafts = await InterviewDraft.find({ candidateId, status: 'approved' });
    res.status(StatusCodes.OK).json(interviewDrafts);
  } catch (error) {
    next(error);
  }
};

// Admin fetching assessments per candidate (both pending and approved)
export const getAssessmentsByCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.params;
    const assessments = await Assessment.find({ candidateId }).lean();
    
    const assessmentsWithStatus = await Promise.all(assessments.map(async (a) => {
      const isTaken = await AssessmentSubmission.exists({ assessment: a._id, user: candidateId });
      return { ...a, isTaken: !!isTaken };
    }));

    res.status(StatusCodes.OK).json(assessmentsWithStatus);
  } catch (error) {
    next(error);
  }
};

// Admin fetching interview drafts per candidate (both pending and approved)
export const getInterviewDraftsByCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.params;
    const interviewDrafts = await InterviewDraft.find({ candidateId }).lean();

    const draftsWithStatus = await Promise.all(interviewDrafts.map(async (d) => {
      const isTaken = await Interview.exists({ candidateId, roleName: String(d._id) });
      return { ...d, isTaken: !!isTaken };
    }));

    res.status(StatusCodes.OK).json(draftsWithStatus);
  } catch (error) {
    next(error);
  }
};

export const deleteInterviewQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, questionId } = req.params;
    const interviewDraft = await InterviewDraft.findById(id);
    if (!interviewDraft) throw new NotFoundError("Interview Draft not found");

    interviewDraft.questions = interviewDraft.questions.filter(
      (q: any) => q._id.toString() !== questionId
    );

    await interviewDraft.save();
    res.status(StatusCodes.OK).json({ message: "Question deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Delete entire interview draft
export const deleteInterviewDraftController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await InterviewDraft.findByIdAndDelete(id);
    if (!result) throw new NotFoundError("Interview Draft not found");
    res.status(StatusCodes.OK).json({ message: "Interview draft deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Edit a single interview question
export const updateInterviewQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, questionId } = req.params;
    const { questionText, idealAnswer, category } = req.body;

    const interviewDraft = await InterviewDraft.findById(id);
    if (!interviewDraft) throw new NotFoundError("Interview Draft not found");

    const question = interviewDraft.questions.find(
      (q: any) => q._id.toString() === questionId
    );
    if (!question) throw new NotFoundError("Question not found");

    if (questionText !== undefined) question.questionText = questionText;
    if (idealAnswer !== undefined) question.idealAnswer = idealAnswer;
    if (category !== undefined) question.category = category;

    await interviewDraft.save();
    res.status(StatusCodes.OK).json({ message: "Question updated successfully", question });
  } catch (error) {
    next(error);
  }
};

// Delete entire assessment
export const deleteAssessmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await Assessment.findByIdAndDelete(id);
    if (!result) throw new NotFoundError("Assessment not found");
    res.status(StatusCodes.OK).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Add a new interview question
export const addInterviewQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { questionText, idealAnswer, category } = req.body;

    const interviewDraft = await InterviewDraft.findById(id);
    if (!interviewDraft) throw new NotFoundError("Interview Draft not found");

    const newQuestion = { questionText, idealAnswer, category };
    interviewDraft.questions.push(newQuestion as any);
    await interviewDraft.save();
    
    // Get the newly added question with its _id
    const addedQuestion = interviewDraft.questions[interviewDraft.questions.length - 1];
    
    res.status(StatusCodes.CREATED).json({ message: "Question added successfully", question: addedQuestion });
  } catch (error) {
    next(error);
  }
};

// Add a new assessment question
export const addAssessmentQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const questionData = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) throw new NotFoundError("Assessment not found");

    assessment.questions.push(questionData as any);
    await assessment.save();
    
    const addedQuestion = assessment.questions[assessment.questions.length - 1];
    
    res.status(StatusCodes.CREATED).json({ message: "Question added successfully", question: addedQuestion });
  } catch (error) {
    next(error);
  }
};

// Edit a single assessment question
export const updateAssessmentQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, questionId } = req.params;
    const questionData = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) throw new NotFoundError("Assessment not found");

    const questionIndex = assessment.questions.findIndex(
      (q: any) => q._id.toString() === questionId
    );
    if (questionIndex === -1) throw new NotFoundError("Question not found");

    // Merge existing with new data
    assessment.questions[questionIndex] = {
      ...assessment.questions[questionIndex].toObject(),
      ...questionData
    };

    await assessment.save();
    res.status(StatusCodes.OK).json({ message: "Question updated successfully", question: assessment.questions[questionIndex] });
  } catch (error) {
    next(error);
  }
};

// Delete a single assessment question
export const deleteAssessmentQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, questionId } = req.params;
    const assessment = await Assessment.findById(id);
    if (!assessment) throw new NotFoundError("Assessment not found");

    assessment.questions = assessment.questions.filter(
      (q: any) => q._id.toString() !== questionId
    );

    await assessment.save();
    res.status(StatusCodes.OK).json({ message: "Question deleted successfully" });
  } catch (error) {
    next(error);
  }
};

