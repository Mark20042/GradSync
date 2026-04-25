import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import Application from '../../shared/models/Application.model.js';
import Job from '../../shared/models/Job.model.js';
import { createNotification } from '../../shared/utils/notification.helper.js';

const router = Router();

// POST /api/applications/:jobId
router.post('/:jobId', protect as any, async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'graduate') { res.status(403).json({ message: 'Only graduates can apply' }); return; }
    const existing = await Application.findOne({ job: req.params.jobId, applicant: req.user._id });
    if (existing) { res.status(400).json({ message: 'Already applied' }); return; }
    const application = await Application.create({ job: req.params.jobId, applicant: req.user._id, resume: req.user.resume });
    try {
      const job = await Job.findById(req.params.jobId).populate('company', 'fullName');
      if (job && job.company) {
        const company = job.company as any;
        await createNotification(company._id, 'APPLICATION', 'New Application Received',
          `${req.user.fullName || 'A candidate'} applied to your job: ${job.title}`, application._id);
      }
    } catch (e) { console.error('Notification error:', e); }
    res.status(201).json(application);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// GET /api/applications/my
router.get('/my', protect as any, async (req: any, res: Response) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate({ path: 'job', select: 'title location type company', populate: { path: 'company', select: 'companyName fullName' } })
      .sort({ createdAt: -1 });
    res.status(200).json(apps);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// GET /api/applications/job/:jobId
router.get('/job/:jobId', protect as any, async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || String(job.company) !== String(req.user._id)) { res.status(404).json({ message: 'Not authorized' }); return; }
    const apps = await Application.find({ job: req.params.jobId })
      .populate('job', 'title location category type')
      .populate('applicant', 'fullName email resume avatar');
    res.status(200).json(apps);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// GET /api/applications/:id
router.get('/:id', protect as any, async (req: any, res: Response) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('job', 'title company')
      .populate('applicant', 'fullName degree email avatar bio resume skills verifiedSkills experiences internships education projects portfolio linkedin phone address awards certifications languages');
    if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
    res.status(200).json(app);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// PUT /api/applications/:id/status
router.put('/:id/status', protect as any, async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const app = await Application.findById(req.params.id).populate('job');
    if (!app) { res.status(404).json({ message: 'Not authorized' }); return; }
    app.status = status;
    await app.save();
    res.json({ message: 'Application status updated', status });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

export default router;
