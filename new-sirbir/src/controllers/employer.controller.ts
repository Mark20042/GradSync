import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, UnauthorizedError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import EmployerSettings from "@/models/EmployerSettings.model.js";
import JobFAQ from "@/models/JobFAQ.model.js";

const getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let settings = await EmployerSettings.findOne({ user: req.user._id });
    if (!settings) settings = await EmployerSettings.create({ user: req.user._id });
    res.json(settings);
  } catch (error) { next(error); }
};

const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await EmployerSettings.findOneAndUpdate({ user: req.user._id }, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (error) { next(error); }
};

const getFaqs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await JobFAQ.find({ employer: req.user._id })); }
  catch (error) { next(error); }
};

const createFaq = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { keywords, ...faqData } = req.body;
    const faq = await JobFAQ.create({ employer: req.user._id, ...faqData });
    res.status(StatusCodes.CREATED).json(faq);
  } catch (error) { next(error); }
};

const updateFaq = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { keywords, ...updateData } = req.body;
    const faq = await JobFAQ.findOneAndUpdate({ _id: req.params.id, employer: req.user._id }, updateData, { new: true, runValidators: true });
    if (!faq) throw new NotFoundError("FAQ not found");
    res.json(faq);
  } catch (error) { next(error); }
};

const deleteFaq = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const jobFAQ = await JobFAQ.findOne({ _id: req.params.id });
    if (!jobFAQ) throw new NotFoundError("FAQ not found");
    if (String(jobFAQ.employer) !== String(req.user._id)) throw new UnauthorizedError("Unauthorized");
    await jobFAQ.deleteOne();
    res.json({ message: "FAQ removed" });
  } catch (error) { next(error); }
};

const getPublicFaqs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await JobFAQ.find({ employer: req.params.employerId }).populate("job", "title")); }
  catch (error) { next(error); }
};

export { getSettings, updateSettings, getFaqs, createFaq, updateFaq, deleteFaq, getPublicFaqs };
