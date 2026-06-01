import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Conversation from "@/models/Conversation.model.js";
import Job from "@/models/Job.model.js";

const createConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { jobId, applicantId } = req.body;
    const userId = req.user.id;
    if (!jobId) throw new BadRequestError("Job ID is required");
    const job = await Job.findById(jobId);
    if (!job) throw new NotFoundError("Job not found");
    let participants: string[];
    if (req.user.role === "employer") {
      if (!applicantId) throw new BadRequestError("Applicant ID required");
      participants = [userId, applicantId].sort();
    } else {
      participants = [userId, String(job.company)].sort();
    }
    let convo = await Conversation.findOne({ participants: { $all: participants }, job: jobId });
    if (!convo) { convo = new Conversation({ participants, job: jobId }); await convo.save(); }
    const populated = await Conversation.findById(convo._id)
      .populate("participants", "fullName avatar role companyName companyLogo").populate("job", "title");
    res.status(StatusCodes.OK).json(populated);
  } catch (error) { next(error); }
};

const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const convos = await Conversation.find({ participants: userId })
      .populate("participants", "fullName avatar role companyName companyLogo").populate("job", "title").sort({ updatedAt: -1 });
    const formatted = convos.map(c => {
      const recipient = (c as any).participants.find((p: any) => String(p._id) !== userId);
      return { _id: c._id, recipient, job: (c as any).job, lastMessage: c.lastMessage, updatedAt: c.updatedAt };
    });
    res.status(StatusCodes.OK).json(formatted);
  } catch (error) { next(error); }
};

export { createConversation, getConversations };
