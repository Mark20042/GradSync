import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import User from '../../shared/models/User.model.js';
import Application from '../../shared/models/Application.model.js';
import SavedJob from '../../shared/models/SavedJob.model.js';
import Job from '../../shared/models/Job.model.js';
import Conversation from '../../shared/models/Conversation.model.js';
import Message from '../../shared/models/Message.model.js';

const router = Router();

// PUT /api/users/profile
router.put('/profile', protect as any, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    const body = req.body || {};
    // Update basic fields
    user.fullName = body.fullName || user.fullName;
    user.email = body.email || user.email;
    user.avatar = body.avatar || user.avatar;
    user.bio = body.bio !== undefined ? body.bio : user.bio;
    user.phone = body.phone !== undefined ? body.phone : user.phone;
    user.address = body.address !== undefined ? body.address : user.address;
    user.website = body.website !== undefined ? body.website : user.website;
    user.resume = body.resume !== undefined ? body.resume : user.resume;

    if (user.role === 'graduate') {
      user.degree = body.degree || user.degree;
      user.university = body.university !== undefined ? body.university : user.university;
      user.graduationYear = body.graduationYear !== undefined ? body.graduationYear : user.graduationYear;
      user.major = body.major !== undefined ? body.major : user.major;
      user.portfolio = body.portfolio !== undefined ? body.portfolio : user.portfolio;
      user.linkedin = body.linkedin !== undefined ? body.linkedin : user.linkedin;
      user.github = body.github !== undefined ? body.github : user.github;
      if (body.experiences !== undefined) user.experiences = body.experiences;
      if (body.internships !== undefined) user.internships = body.internships;
      if (body.education !== undefined) user.education = body.education;
      if (body.skills !== undefined) user.skills = body.skills;
      if (body.languages !== undefined) user.languages = body.languages;
      if (body.awards !== undefined) user.awards = body.awards;
      if (body.certifications !== undefined) user.certifications = body.certifications;
      if (body.projects !== undefined) user.projects = body.projects;
      if (body.jobPreferences !== undefined) user.jobPreferences = body.jobPreferences;
      user.isProfileComplete = Boolean(user.university && user.graduationYear && user.degree && user.skills && user.skills.length > 0);
    }

    if (user.role === 'employer') {
      user.companyName = body.companyName || user.companyName;
      user.companyLogo = body.companyLogo !== undefined ? body.companyLogo : user.companyLogo;
      user.companyDescription = body.companyDescription !== undefined ? body.companyDescription : user.companyDescription;
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.status(200).json(updatedUser);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/users/profile
router.delete('/profile', protect as any, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const userId = user._id;
    if (user.role === 'graduate') {
      await Application.deleteMany({ applicant: userId });
      await SavedJob.deleteMany({ graduate: userId });
    }
    if (user.role === 'employer') {
      const jobs = await Job.find({ company: userId }).select('_id');
      const jobIds = jobs.map(j => j._id);
      await Job.deleteMany({ _id: { $in: jobIds } });
      await Application.deleteMany({ job: { $in: jobIds } });
      await SavedJob.deleteMany({ job: { $in: jobIds } });
    }
    const conversations = await Conversation.find({ participants: { $in: [userId] } });
    const conversationIds = conversations.map(c => c._id);
    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ _id: { $in: conversationIds } });
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Account and all associated data deleted successfully' });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/users/resume
router.delete('/resume', protect as any, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    if (user.role !== 'graduate') { res.status(403).json({ message: 'Only jobseekers can delete resumes' }); return; }
    user.resume = '';
    await user.save();
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// GET /api/users/employers
router.get('/employers', async (_req, res) => {
  try {
    const employers = await User.find({ role: 'employer' })
      .select('companyName companyLogo companyDescription email website address')
      .sort({ createdAt: -1 });
    res.status(200).json(employers);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -isAdmin');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.status(200).json(user);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

export default router;
