import { Router } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import InterviewQuestion from '../../shared/models/InterviewQuestion.model.js';

const router = Router();

router.get('/', protect as any, async (req, res) => {
  try {
    const { category, difficulty, jobRole } = req.query as any;
    const query: any = {};
    if (category && category !== 'All') query.category = category;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (jobRole) query.jobRole = { $regex: jobRole, $options: 'i' };
    res.status(200).json(await InterviewQuestion.find(query).sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect as any, async (req, res) => {
  try {
    const q = new InterviewQuestion({ ...req.body, jobRole: req.body.jobRole || 'Any' });
    await q.save(); res.status(201).json(q);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', protect as any, async (req, res) => {
  try {
    const q = await InterviewQuestion.findByIdAndUpdate(req.params.id.replace(/'/g, ''),
      { ...req.body, jobRole: req.body.jobRole || 'Any' }, { new: true, runValidators: true });
    if (!q) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json(q);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect as any, async (req, res) => {
  try {
    if (!(await InterviewQuestion.findByIdAndDelete(req.params.id))) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json({ message: 'Question removed' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
