import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "@/errors/index.js";
import InterviewQuestion from "@/models/InterviewQuestion.model.js";

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, difficulty, jobRole } = req.query as any;
    const query: any = {};
    if (category && category !== "All") query.category = category;
    if (difficulty && difficulty !== "All") query.difficulty = difficulty;
    if (jobRole) query.jobRole = { $regex: jobRole, $options: "i" };
    res.status(StatusCodes.OK).json(await InterviewQuestion.find(query).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = new InterviewQuestion({ ...req.body, jobRole: req.body.jobRole || "Any" });
    await q.save(); res.status(StatusCodes.CREATED).json(q);
  } catch (error) { next(error); }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.replace(/'/g, "") : req.params.id;
    const q = await InterviewQuestion.findByIdAndUpdate(id,
      { ...req.body, jobRole: req.body.jobRole || "Any" }, { new: true, runValidators: true });
    if (!q) throw new NotFoundError("Question not found");
    res.status(StatusCodes.OK).json(q);
  } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(await InterviewQuestion.findByIdAndDelete(req.params.id))) throw new NotFoundError("Question not found");
    res.status(StatusCodes.OK).json({ message: "Question removed" });
  } catch (error) { next(error); }
};

export { getAll, create, update, remove };
