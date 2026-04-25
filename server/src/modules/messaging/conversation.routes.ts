import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import Conversation from '../../shared/models/Conversation.model.js';
import Message from '../../shared/models/Message.model.js';
import Job from '../../shared/models/Job.model.js';
import { createNotification } from '../../shared/utils/notification.helper.js';

const router = Router();

// ─── Conversation Routes (/api/conversations) ───────────────────────────

// POST /api/conversations
router.post('/', protect as any, async (req: any, res: Response) => {
  try {
    const { jobId, applicantId } = req.body;
    const userId = req.user.id;
    if (!jobId) { res.status(400).json({ message: 'Job ID is required' }); return; }
    const job = await Job.findById(jobId);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    let participants: string[];
    if (req.user.role === 'employer') {
      if (!applicantId) { res.status(400).json({ message: 'Applicant ID required' }); return; }
      participants = [userId, applicantId].sort();
    } else {
      participants = [userId, String(job.company)].sort();
    }
    let convo = await Conversation.findOne({ participants: { $all: participants }, job: jobId });
    if (!convo) { convo = new Conversation({ participants, job: jobId }); await convo.save(); }
    const populated = await Conversation.findById(convo._id)
      .populate('participants', 'fullName avatar role companyName companyLogo').populate('job', 'title');
    res.status(200).json(populated);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/conversations
router.get('/', protect as any, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const convos = await Conversation.find({ participants: userId })
      .populate('participants', 'fullName avatar role companyName companyLogo').populate('job', 'title').sort({ updatedAt: -1 });
    const formatted = convos.map(c => {
      const recipient = (c as any).participants.find((p: any) => String(p._id) !== userId);
      return { _id: c._id, recipient, job: (c as any).job, lastMessage: c.lastMessage, updatedAt: c.updatedAt };
    });
    res.status(200).json(formatted);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
