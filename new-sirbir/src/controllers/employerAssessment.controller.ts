import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import EmployerAssessment from "@/models/EmployerAssessment.model.js";
import EmployerAssessmentSubmission from "@/models/EmployerAssessmentSubmission.model.js";
import EmployerAssessmentInvitation from "@/models/EmployerAssessmentInvitation.model.js";
import {
  sendEmployerAssessmentResultEmail
} from "@/utils/email.service.js";

const getAllForEmployer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assessments = await EmployerAssessment.find({ employer: req.user._id });
    res.status(StatusCodes.OK).json(assessments);
  } catch (error) {
    next(error);
  }
};

const getDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await EmployerAssessment.findById(req.params.id);
    if (!a) throw new NotFoundError("Assessment not found");
    res.status(StatusCodes.OK).json(a);
  } catch (error) {
    next(error);
  }
};

const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, timeLimit, passingScore, strictProtocols, job, validFrom, validUntil, questions } = req.body;

    const a = new EmployerAssessment({
      employer: req.user._id,
      title,
      description,
      timeLimit: timeLimit || 15,
      passingScore: passingScore || 80,
      strictProtocols: strictProtocols ?? true,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      job: job || null,
      questions: questions || [],
    });
    await a.save();
    res.status(StatusCodes.CREATED).json(a);
  } catch (error) {
    next(error);
  }
};

const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const a = await EmployerAssessment.findOneAndUpdate(
      { _id: req.params.id, employer: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!a) throw new NotFoundError("Assessment not found");
    res.status(StatusCodes.OK).json(a);
  } catch (error) {
    next(error);
  }
};

const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deletedAssessment = await EmployerAssessment.findOneAndDelete({ _id: req.params.id, employer: req.user._id });
    if (!deletedAssessment) {
      throw new NotFoundError("Assessment not found");
    }

    // Also delete any pending or completed invitations for this assessment so graduates don't see broken cards
    await EmployerAssessmentInvitation.deleteMany({ assessment: req.params.id });

    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};

const addQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const a = await EmployerAssessment.findOne({ _id: req.params.id, employer: req.user._id });
    if (!a) throw new NotFoundError("Assessment not found");
    a.questions.push(req.body as any);
    await a.save();
    res.status(StatusCodes.OK).json(a);
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const a = await EmployerAssessment.findOne({ _id: req.params.assessmentId, employer: req.user._id });
    if (!a) throw new NotFoundError("Assessment not found");
    const q = (a.questions as any).id(req.params.questionId);
    if (!q) throw new NotFoundError("Question not found");
    Object.assign(q, req.body);
    await a.save();
    res.status(StatusCodes.OK).json(a);
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const a = await EmployerAssessment.findOne({ _id: req.params.assessmentId, employer: req.user._id });
    if (!a) throw new NotFoundError("Assessment not found");
    (a.questions as any).id(req.params.questionId)?.deleteOne();
    await a.save();
    res.status(StatusCodes.OK).json({ message: "Question deleted", assessment: a });
  } catch (error) {
    next(error);
  }
};

const submit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      assessmentId,
      answers,
      violations = [],
      violationCount = 0,
      timeSpent = 0,
      forcedSubmission = false,
      invitationId,
    } = req.body;

    const assessment = await EmployerAssessment.findById(assessmentId);
    if (!assessment) throw new NotFoundError("Assessment not found");

    if (invitationId) {
      const invitation = await EmployerAssessmentInvitation.findById(invitationId);
      if (!invitation) throw new NotFoundError("Invitation not found");
      if (invitation.status !== 'pending') {
        throw new BadRequestError("This assessment invitation has already been completed or has expired.");
      }
    }

    let correct = 0;
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    assessment.questions.forEach((q: any) => {
      const c = q.category || 'General';
      if (!categoryTotals[c]) { categoryTotals[c] = 0; categoryCounts[c] = 0; }
      categoryCounts[c] += 1;

      const ua = answers.find((a: any) => a.questionId === String(q._id));
      if (ua) {
        let isCorrect = false;
        if (q.type === 'identification') {
          if (ua.selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) isCorrect = true;
        } else {
          if (ua.selectedOption.trim() === q.correctAnswer.trim()) isCorrect = true;
        }
        if (isCorrect) {
           correct++;
           categoryTotals[c] += 100;
        }
      }
    });

    const categoryScores: Record<string, number> = {};
    let highestCategory = { name: "", score: -1 };
    let lowestCategory = { name: "", score: 101 };
    
    Object.keys(categoryTotals).forEach(c => {
      const avg = Math.round(categoryTotals[c] / categoryCounts[c]);
      categoryScores[c] = avg;
      if (avg > highestCategory.score) highestCategory = { name: c, score: avg };
      if (avg < lowestCategory.score) lowestCategory = { name: c, score: avg };
    });
    
    let categoryInterpretation = `The candidate showed a balanced performance across all evaluated areas.`;
    if (highestCategory.name && lowestCategory.name && highestCategory.name !== lowestCategory.name) {
      if (highestCategory.score >= 80 && lowestCategory.score < 60) {
        categoryInterpretation = `The candidate excelled remarkably in ${highestCategory.name} but exhibited significant gaps in ${lowestCategory.name}.`;
      } else if (highestCategory.score - lowestCategory.score >= 15) {
        categoryInterpretation = `The candidate is strongest in ${highestCategory.name} but lacks slightly in ${lowestCategory.name}.`;
      }
    }

    const score = (correct / (assessment.questions.length || 1)) * 100;
    const passed = score >= assessment.passingScore;
    const status = passed ? "under-review" : "rejected";

    await EmployerAssessmentSubmission.create({
      employerAssessment: assessment._id,
      user: req.user._id,
      answers,
      score,
      passed,
      violations,
      violationCount,
      timeSpent,
      forcedSubmission,
      categoryScores,
      categoryInterpretation,
      status,
    });

    if (invitationId) {
      await EmployerAssessmentInvitation.findByIdAndUpdate(invitationId, {
        status: 'completed'
      });
    }

    res.status(StatusCodes.OK).json({
      score,
      passed,
      message: passed
        ? "Assessment submitted successfully."
        : "You did not pass. Better luck next time.",
    });
  } catch (error) {
    next(error);
  }
};

const getSubmissionsForEmployer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Find all assessments owned by this employer
    const assessments = await EmployerAssessment.find({ employer: req.user._id }).select('_id');
    const assessmentIds = assessments.map(a => a._id);

    const submissions = await EmployerAssessmentSubmission.find({ employerAssessment: { $in: assessmentIds } })
      .populate("user", "fullName email")
      .populate("employerAssessment")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json(submissions);
  } catch (error) {
    next(error);
  }
};

const releaseScore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const submission = await EmployerAssessmentSubmission.findById(req.params.id)
      .populate("employerAssessment")
      .populate("user");
    if (!submission) throw new NotFoundError("Submission not found");

    const assessment = submission.employerAssessment as any;
    const user = submission.user as any;

    if (user?.email) {
      await sendEmployerAssessmentResultEmail(
        user.email,
        user.fullName || "Job Seeker",
        assessment?.title || assessment?.skill || "Employer Assessment",
        submission.score
      );
    }

    // update status to released if needed
    submission.status = "released";
    await submission.save();

    res.status(StatusCodes.OK).json({ message: "Score released successfully!" });
  } catch (error) {
    next(error);
  }
};


const inviteCandidate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { candidateId, assessmentId, jobId, dueDate } = req.body;
    const employerId = req.user._id;

    const assessment = await EmployerAssessment.findById(assessmentId);
    if (!assessment) throw new NotFoundError("Assessment not found");
    if (assessment.employer.toString() !== employerId.toString()) {
      throw new UnauthorizedError("You don't have permission to use this assessment");
    }

    const invitation = await EmployerAssessmentInvitation.create({
      employer: employerId,
      candidate: candidateId,
      assessment: assessmentId,
      job: jobId || undefined,
      dueDate: new Date(dueDate),
      status: 'pending'
    });

    res.status(StatusCodes.CREATED).json(invitation);
  } catch (error) {
    next(error);
  }
};

const getInvitationsForCandidate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.user._id;

    // First, expire any old pending invitations
    await EmployerAssessmentInvitation.updateMany(
      { candidate: candidateId, status: 'pending', dueDate: { $lt: new Date() } },
      { $set: { status: 'expired' } }
    );

    const invitations = await EmployerAssessmentInvitation.find({ candidate: candidateId })
      .populate("employer", "fullName companyName avatar")
      .populate("assessment", "title skill difficulty timeLimit passingScore")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    // Filter out invitations where the assessment was deleted (ghosts)
    const validInvitations = invitations.filter((inv) => inv.assessment !== null);

    // Clean up orphans in the background
    const orphanIds = invitations.filter((inv) => inv.assessment === null).map(inv => inv._id);
    if (orphanIds.length > 0) {
      EmployerAssessmentInvitation.deleteMany({ _id: { $in: orphanIds } }).exec().catch(err => console.error(err));
    }

    res.status(StatusCodes.OK).json(validInvitations);
  } catch (error) {
    next(error);
  }
};

export {
  getAllForEmployer,
  getDetail,
  create,
  update,
  remove,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  submit,
  getSubmissionsForEmployer,
  releaseScore,
  inviteCandidate,
  getInvitationsForCandidate
};
