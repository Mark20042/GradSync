import { Router } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import InterviewRole from '../../shared/models/InterviewRole.model.js';

const router = Router();

router.get('/all-questions', protect as any, async (req, res) => {
  try {
    const { category, jobRole } = req.query as any;
    const roles = await InterviewRole.find();
    const allQuestions: any[] = [];
    roles.forEach(role => {
      if (jobRole && !role.roleName.toLowerCase().includes(jobRole.toLowerCase())) return;
      role.questions.forEach(q => {
        if (category && category !== 'All' && q.category !== category) return;
        allQuestions.push({ _id: q._id, roleId: role._id, jobRole: role.roleName, question: q.questionText, category: q.category, idealAnswer: q.idealAnswer || '' });
      });
    });
    res.status(200).json(allQuestions);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/', async (_req, res) => {
  try { res.status(200).json(await InterviewRole.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect as any, async (req, res) => {
  try {
    const { roleName, description } = req.body;
    if (await InterviewRole.findOne({ roleName })) { res.status(400).json({ message: 'Already exists' }); return; }
    const role = new InterviewRole({ roleName, description, questions: [] });
    await role.save(); res.status(201).json(role);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', protect as any, async (req, res) => {
  try {
    const r = await InterviewRole.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!r) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json(r);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect as any, async (req, res) => {
  try {
    if (!(await InterviewRole.findByIdAndDelete(req.params.id))) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/:id/questions', protect as any, async (req, res) => {
  try {
    const r = await InterviewRole.findById(req.params.id);
    if (!r) { res.status(404).json({ message: 'Not found' }); return; }
    r.questions.push(req.body as any);
    await r.save(); res.status(201).json(r);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/questions/:questionId', protect as any, async (req, res) => {
  try {
    const r = await InterviewRole.findById(req.params.id);
    if (!r) { res.status(404).json({ message: 'Not found' }); return; }
    const q = (r.questions as any).id(req.params.questionId);
    if (!q) { res.status(404).json({ message: 'Question not found' }); return; }
    q.questionText = req.body.questionText || q.questionText;
    q.category = req.body.category || q.category;
    if (req.body.idealAnswer !== undefined) q.idealAnswer = req.body.idealAnswer;
    await r.save(); res.status(200).json(r);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id/questions/:questionId', protect as any, async (req, res) => {
  try {
    const r = await InterviewRole.findById(req.params.id);
    if (!r) { res.status(404).json({ message: 'Not found' }); return; }
    (r.questions as any).pull(req.params.questionId);
    await r.save(); res.status(200).json(r);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
