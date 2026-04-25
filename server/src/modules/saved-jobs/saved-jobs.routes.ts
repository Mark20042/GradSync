import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import SavedJob from '../../shared/models/SavedJob.model.js';

const router = Router();

// POST /api/save-jobs/:jobId
router.post('/:jobId', protect as any, async (req: any, res: Response) => {
  try {
    const exists = await SavedJob.findOne({ job: req.params.jobId, graduate: req.user._id });
    if (exists) { res.status(400).json({ message: 'Job already saved' }); return; }
    const saved = await SavedJob.create({ job: req.params.jobId, graduate: req.user._id });
    res.status(201).json(saved);
  } catch (error: any) { res.status(500).json({ message: 'Failed to save job', error: error.message }); }
});

// DELETE /api/save-jobs/:jobId
router.delete('/:jobId', protect as any, async (req: any, res: Response) => {
  try {
    await SavedJob.findOneAndDelete({ job: req.params.jobId, graduate: req.user._id });
    res.status(200).json({ message: 'Job removed from saved list' });
  } catch (error: any) { res.status(500).json({ message: 'Failed to unsave job', error: error.message }); }
});

// GET /api/save-jobs/my
router.get('/my', protect as any, async (req: any, res: Response) => {
  try {
    const savedJobs = await SavedJob.find({ graduate: req.user._id })
      .populate({ path: 'job', populate: { path: 'company', select: 'fullName companyName companyLogo' } });
    res.status(200).json(savedJobs);
  } catch (error: any) { res.status(500).json({ message: 'Failed to get saved jobs', error: error.message }); }
});

export default router;
