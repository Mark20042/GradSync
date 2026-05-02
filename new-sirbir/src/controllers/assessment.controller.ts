import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Assessment from "@/models/Assessment.model.js";
import User from "@/models/User.model.js";

const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try { res.status(StatusCodes.OK).json(await Assessment.find()); }
  catch (error) { next(error); }
};

const getDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) throw new NotFoundError("Assessment not found");
    res.status(StatusCodes.OK).json(a);
  } catch (error) { next(error); }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skill, title, difficulty, timeLimit, passingScore } = req.body;
    if (await Assessment.findOne({ skill })) throw new BadRequestError("Assessment already exists");
    const a = new Assessment({ skill, title, difficulty, timeLimit: timeLimit || 15, passingScore: passingScore || 80, questions: [] });
    await a.save(); res.status(StatusCodes.CREATED).json(a);
  } catch (error) { next(error); }
};

const submit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { skill, answers } = req.body;
    const assessment = await Assessment.findOne({ skill });
    if (!assessment) throw new NotFoundError("Assessment not found");
    let correct = 0;
    assessment.questions.forEach(q => {
      const ua = answers.find((a: any) => a.questionId === String(q._id));
      if (ua && ua.selectedOption.trim() === q.correctAnswer.trim()) correct++;
    });
    const score = (correct / assessment.questions.length) * 100;
    const passed = score >= assessment.passingScore;
    if (passed) {
      const user = await User.findById(req.user._id);
      if (user) {
        const level = assessment.difficulty;
        const idx = user.verifiedSkills?.findIndex(s => s.skill === skill) ?? -1;
        const levelH: Record<string, number> = { Entry: 1, Mid: 2, Senior: 3, Expert: 4 };
        if (idx >= 0 && user.verifiedSkills) {
          const cur = user.verifiedSkills[idx]!;
          if ((levelH[level] ?? 0) >= (levelH[cur.level ?? "Entry"] ?? 0)) {
            cur.level = level; cur.assessmentTitle = assessment.title; cur.earnedAt = new Date();
            if (score > (cur.score ?? 0)) cur.score = score;
          }
        } else {
          user.verifiedSkills?.push({ skill, assessmentTitle: assessment.title, level, badgeIcon: "verified-badge", score });
        }
        await user.save();
      }
    }
    res.status(StatusCodes.OK).json({ score, passed, candidateName: passed ? req.user.fullName : undefined,
      message: passed ? "Congratulations! You passed." : "You did not pass. Try again later." });
  } catch (error) { next(error); }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!a) throw new NotFoundError("Assessment not found");
    res.status(StatusCodes.OK).json(a);
  } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(await Assessment.findByIdAndDelete(req.params.id))) throw new NotFoundError("Assessment not found");
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) { next(error); }
};

const addQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) throw new NotFoundError("Assessment not found");
    a.questions.push(req.body as any);
    await a.save(); res.status(StatusCodes.OK).json(a);
  } catch (error) { next(error); }
};

const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await Assessment.findById(req.params.assessmentId);
    if (!a) throw new NotFoundError("Assessment not found");
    const q = (a.questions as any).id(req.params.questionId);
    if (!q) throw new NotFoundError("Question not found");
    Object.assign(q, req.body);
    await a.save(); res.status(StatusCodes.OK).json(a);
  } catch (error) { next(error); }
};

const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await Assessment.findById(req.params.assessmentId);
    if (!a) throw new NotFoundError("Assessment not found");
    (a.questions as any).id(req.params.questionId)?.deleteOne();
    await a.save(); res.status(StatusCodes.OK).json({ message: "Question deleted", assessment: a });
  } catch (error) { next(error); }
};

const getVerifiedUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skill } = req.params;
    const assessment = await Assessment.findOne({ skill });
    const defaultScore = assessment?.passingScore || 80;
    const users = await User.find({ "verifiedSkills.skill": skill }).select("fullName email verifiedSkills");
    const verified = users.map(u => {
      const s = u.verifiedSkills?.find(v => v.skill === skill);
      return { _id: u._id, fullName: u.fullName, email: u.email, level: s?.level, earnedAt: s?.earnedAt,
        assessmentTitle: s?.assessmentTitle, score: (s?.score && s.score > 0) ? s.score : defaultScore };
    }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    res.status(StatusCodes.OK).json(verified);
  } catch (error) { next(error); }
};

const unverifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) throw new NotFoundError("User not found");
    user.verifiedSkills = user.verifiedSkills?.filter(s => s.skill !== req.params.skill);
    await user.save();
    res.status(StatusCodes.OK).json({ message: "User unverified" });
  } catch (error) { next(error); }
};

const getBySkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await Assessment.findOne({ skill: req.params.skill });
    if (!a) throw new NotFoundError("Assessment not found");
    res.status(StatusCodes.OK).json(a);
  } catch (error) { next(error); }
};

export { getAll, getDetail, create, submit, update, remove, addQuestion, updateQuestion, deleteQuestion, getVerifiedUsers, unverifyUser, getBySkill };
