import { Router } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import EmployerSettings from '../../shared/models/EmployerSettings.model.js';
import JobFAQ from '../../shared/models/JobFAQ.model.js';

const router = Router();

// --- Settings ---
router.get('/settings', protect as any, async (req: any, res) => {
  try {
    let settings = await EmployerSettings.findOne({ user: req.user._id });
    if (!settings) { settings = await EmployerSettings.create({ user: req.user._id }); }
    res.json(settings);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

router.put('/settings', protect as any, async (req: any, res) => {
  try {
    const settings = await EmployerSettings.findOneAndUpdate(
      { user: req.user._id }, req.body, { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// --- FAQs ---
router.get('/faqs', protect as any, async (req: any, res) => {
  try {
    const faqs = await JobFAQ.find({ employer: req.user._id });
    res.json(faqs);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

router.post('/faqs', protect as any, async (req: any, res) => {
  try {
    const { keywords, ...faqData } = req.body;
    const faq = await JobFAQ.create({ employer: req.user._id, ...faqData });
    res.status(201).json(faq);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

router.put('/faqs/:id', protect as any, async (req: any, res) => {
  try {
    const { keywords, ...updateData } = req.body;
    const faq = await JobFAQ.findOneAndUpdate(
      { _id: req.params.id, employer: req.user._id }, updateData, { new: true, runValidators: true }
    );
    if (!faq) { res.status(404).json({ message: 'FAQ not found' }); return; }
    res.json(faq);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

router.delete('/faqs/:id', protect as any, async (req: any, res) => {
  try {
    const jobFAQ = await JobFAQ.findOne({ _id: req.params.id });
    if (!jobFAQ) { res.status(404).json({ message: 'FAQ not found' }); return; }
    if (String(jobFAQ.employer) !== String(req.user._id)) { res.status(403).json({ message: 'Unauthorized' }); return; }
    await jobFAQ.deleteOne();
    res.json({ message: 'FAQ removed' });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

router.get('/:employerId/public-faqs', protect as any, async (req: any, res) => {
  try {
    const faqs = await JobFAQ.find({ employer: req.params.employerId }).populate('job', 'title');
    res.json(faqs);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

export default router;
