import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "@/errors/index.js";
import mongoose from "mongoose";
import InterviewRole from "@/models/InterviewRole.model.js";
import InterviewDraft from "@/models/InterviewDraft.model.js";

const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, jobRole } = req.query as any;
    const allQuestions: any[] = [];
    
    // Check if it's an InterviewDraft (Tailored Interview)
    if (jobRole && mongoose.isValidObjectId(jobRole)) {
      const draft = await InterviewDraft.findById(jobRole);
      if (draft) {
        draft.questions.forEach((q: any) => {
          if (category && category !== "All" && q.category !== category) return;
          allQuestions.push({ 
            _id: q._id, 
            roleId: draft._id, 
            jobRole: "Tailored Interview", 
            question: q.questionText || q.question, // handle schema variations
            category: q.category, 
            idealAnswer: q.idealAnswer || "" 
          });
        });
        return res.status(StatusCodes.OK).json(allQuestions);
      }
    }

    // Otherwise treat as a standard InterviewRole
    const roles = await InterviewRole.find();
    roles.forEach(role => {
      if (jobRole && !role.roleName.toLowerCase().includes(jobRole.toLowerCase())) return;
      role.questions.forEach(q => {
        if (category && category !== "All" && q.category !== category) return;
        allQuestions.push({ _id: q._id, roleId: role._id, jobRole: role.roleName, question: q.questionText, category: q.category, idealAnswer: q.idealAnswer || "" });
      });
    });
    res.status(StatusCodes.OK).json(allQuestions);
  } catch (error) { next(error); }
};

const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try { res.status(StatusCodes.OK).json(await InterviewRole.find().sort({ createdAt: -1 })); }
  catch (error) { next(error); }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleName, description } = req.body;
    if (await InterviewRole.findOne({ roleName })) throw new BadRequestError("Already exists");
    const role = new InterviewRole({ roleName, description, questions: [] });
    await role.save(); res.status(StatusCodes.CREATED).json(role);
  } catch (error) { next(error); }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await InterviewRole.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!r) throw new NotFoundError("Role not found");
    res.status(StatusCodes.OK).json(r);
  } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(await InterviewRole.findByIdAndDelete(req.params.id))) throw new NotFoundError("Role not found");
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) { next(error); }
};

const addQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await InterviewRole.findById(req.params.id);
    if (!r) throw new NotFoundError("Role not found");
    r.questions.push(req.body as any);
    await r.save(); res.status(StatusCodes.CREATED).json(r);
  } catch (error) { next(error); }
};

const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await InterviewRole.findById(req.params.id);
    if (!r) throw new NotFoundError("Role not found");
    const q = (r.questions as any).id(req.params.questionId);
    if (!q) throw new NotFoundError("Question not found");
    q.questionText = req.body.questionText || q.questionText;
    q.category = req.body.category || q.category;
    if (req.body.idealAnswer !== undefined) q.idealAnswer = req.body.idealAnswer;
    await r.save(); res.status(StatusCodes.OK).json(r);
  } catch (error) { next(error); }
};

const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await InterviewRole.findById(req.params.id);
    if (!r) throw new NotFoundError("Role not found");
    (r.questions as any).pull(req.params.questionId);
    await r.save(); res.status(StatusCodes.OK).json(r);
  } catch (error) { next(error); }
};

export { getAllQuestions, getAll, create, update, remove, addQuestion, updateQuestion, deleteQuestion };
