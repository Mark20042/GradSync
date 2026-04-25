import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import Job from '../../shared/models/Job.model.js';
import User from '../../shared/models/User.model.js';
import Application from '../../shared/models/Application.model.js';
import SavedJob from '../../shared/models/SavedJob.model.js';

const router = Router();

// POST /api/jobs — Create job (employer only)
router.post('/', protect as any, async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'employer') { res.status(403).json({ message: 'Only employers can post jobs' }); return; }
    const job = new Job({ ...req.body, company: req.user._id });
    await job.save();
    res.status(201).json(job);
  } catch (error: any) { res.status(500).json({ message: error.message || 'Server error' }); }
});

// GET /api/jobs — Get all jobs with filtering
router.get('/', async (req, res) => {
  const { keyword, location, type, minSalary, maxSalary, userId, category } = req.query as any;
  try {
    const query: any = { isClosed: false,
      ...(keyword && { title: { $regex: keyword, $options: 'i' } }),
      ...(location && { location: { $regex: location, $options: 'i' } }),
      ...(category && { category }),
      ...(type && { type }),
      ...(req.query.company && { company: req.query.company }),
    };
    const andConditions: any[] = [];
    if (minSalary && !isNaN(minSalary)) andConditions.push({ salaryMax: { $gte: Number(minSalary) } });
    if (maxSalary && !isNaN(maxSalary)) andConditions.push({ salaryMin: { $lte: Number(maxSalary) } });
    if (andConditions.length > 0) query.$and = andConditions;

    const jobs = await Job.find(query).populate('company', 'fullName companyName companyLogo');
    let saveJobIds: string[] = [];
    const appliedJobStatusMap: Record<string, string> = {};
    if (userId) {
      const savedJobs = await SavedJob.find({ graduate: userId }).select('job');
      saveJobIds = savedJobs.map(s => String(s.job));
      const applications = await Application.find({ applicant: userId }).select('job status');
      applications.forEach(app => { appliedJobStatusMap[String(app.job)] = app.status; });
    }
    const jobsWithExtras = jobs.map(job => {
      const id = String(job._id);
      return { ...job.toObject(), isSaved: saveJobIds.includes(id), applicationStatus: appliedJobStatusMap[id] || null };
    });
    res.json(jobsWithExtras);
  } catch (error: any) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// GET /api/jobs/recommended
router.get('/recommended', protect as any, async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const userSkills = user.skills?.map(s => s.toLowerCase()) || [];
    const preferredLocation = user.jobPreferences?.preferredLocation?.toLowerCase() || user.address?.toLowerCase() || '';
    const jobs = await Job.find({ isClosed: false }).populate('company', 'fullName companyName companyLogo');
    const savedJobs = await SavedJob.find({ graduate: userId }).select('job');
    const saveJobIds = savedJobs.map(s => String(s.job));
    const applications = await Application.find({ applicant: userId }).select('job status');
    const appliedMap: Record<string, string> = {};
    applications.forEach(app => { appliedMap[String(app.job)] = app.status; });

    let scoredJobs = jobs.map(job => {
      let score = 0; const reasons: string[] = [];
      const jobSkills = job.skills?.map(s => s.toLowerCase()) || [];
      const jobReq = job.requirements?.toLowerCase() || '';
      let skillMatch = 0;
      jobSkills.forEach(s => { if (userSkills.includes(s)) { score++; skillMatch++; } });
      userSkills.forEach(us => { if (!jobSkills.includes(us) && jobReq.includes(us)) { score++; skillMatch++; } });
      if (skillMatch > 0) reasons.push('Matches your skills');
      if (preferredLocation && job.location?.toLowerCase().includes(preferredLocation)) { score += 2; reasons.push('Near you'); }
      const desiredTitle = user.jobPreferences?.desiredJobTitle?.toLowerCase() || user.major?.toLowerCase() || '';
      if (desiredTitle && job.title?.toLowerCase().includes(desiredTitle)) { score += 2; reasons.push('Matches your profile'); }
      let primary = reasons.length > 0 ? reasons[reasons.length - 1]! : 'Recommended';
      if (reasons.includes('Near you')) primary = 'Near you';
      else if (reasons.includes('Matches your skills')) primary = 'Matches your skills';
      const id = String(job._id);
      return { ...job.toObject(), matchScore: score, matchReason: primary, isSaved: saveJobIds.includes(id), applicationStatus: appliedMap[id] || null };
    });
    scoredJobs = scoredJobs.filter(j => j.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    res.status(200).json(scoredJobs.slice(0, 6));
  } catch (error: any) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// GET /api/jobs/get-jobs-employer
router.get('/get-jobs-employer', protect as any, async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'employer') { res.status(403).json({ message: 'Only employers can access their jobs.' }); return; }
    const jobs = await Job.find({ company: req.user._id }).populate('company', 'fullName companyName companyLogo').lean();
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const applicationCount = await Application.countDocuments({ job: job._id });
      return { ...job, applicationCount };
    }));
    res.status(200).json(jobsWithCounts);
  } catch (error: any) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const { userId } = req.query as any;
    let applicationStatus = null; let isSaved = false;
    const job = await Job.findById(req.params.id).populate('company', 'fullName companyName companyLogo');
    if (userId) {
      const app = await Application.findOne({ job: req.params.id, applicant: userId }).select('status');
      if (app) applicationStatus = app.status;
      const saved = await SavedJob.findOne({ job: req.params.id, graduate: userId });
      if (saved) isSaved = true;
    }
    res.status(200).json({ ...job!.toObject(), applicationStatus, isSaved });
  } catch (error: any) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// PUT /api/jobs/:id
router.put('/:id', protect as any, async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    if (String(job.company) !== String(req.user._id)) { res.status(403).json({ message: 'Not authorized' }); return; }
    Object.assign(job, req.body);
    const updated = await job.save();
    res.status(200).json(updated);
  } catch (error: any) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// DELETE /api/jobs/:id
router.delete('/:id', protect as any, async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    if (String(job.company) !== String(req.user._id)) { res.status(403).json({ message: 'Not authorized' }); return; }
    await job.deleteOne();
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error: any) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// PUT /api/jobs/:id/toggle-close
router.put('/:id/toggle-close', protect as any, async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    if (String(job.company) !== String(req.user._id)) { res.status(403).json({ message: 'Not authorized' }); return; }
    job.isClosed = !job.isClosed;
    await job.save();
    res.json({ message: 'Job status toggled' });
  } catch (error: any) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

export default router;
