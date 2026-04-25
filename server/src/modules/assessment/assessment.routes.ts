import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import Assessment from '../../shared/models/Assessment.model.js';
import User from '../../shared/models/User.model.js';

const router = Router();

// GET /api/assessments
router.get('/', protect as any, async (_req, res) => {
  try { res.status(200).json(await Assessment.find()); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/assessments/detail/:id
router.get('/detail/:id', protect as any, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json(a);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/assessments
router.post('/', protect as any, async (req, res) => {
  try {
    const { skill, title, difficulty, timeLimit, passingScore } = req.body;
    if (await Assessment.findOne({ skill })) { res.status(400).json({ message: 'Already exists' }); return; }
    const a = new Assessment({ skill, title, difficulty, timeLimit: timeLimit || 15, passingScore: passingScore || 80, questions: [] });
    await a.save(); res.status(201).json(a);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/assessments/submit
router.post('/submit', protect as any, async (req: any, res: Response) => {
  try {
    const { skill, answers } = req.body;
    const assessment = await Assessment.findOne({ skill });
    if (!assessment) { res.status(404).json({ message: 'Not found' }); return; }
    let correct = 0;
    assessment.questions.forEach(q => {
      const ua = answers.find((a: any) => a.questionId === String(q._id));
      if (ua && ua.selectedOption.trim() === q.correctAnswer.trim()) correct++;
    });
    const score = (correct / assessment.questions.length) * 100;
    const passed = score >= assessment.passingScore;
    if (passed) {
      const user = await User.findById(req.user._id);
      if (user) {
        const level = assessment.difficulty;
        const idx = user.verifiedSkills?.findIndex(s => s.skill === skill) ?? -1;
        const levelH: Record<string, number> = { Entry: 1, Mid: 2, Senior: 3, Expert: 4 };
        if (idx >= 0 && user.verifiedSkills) {
          const cur = user.verifiedSkills[idx]!;
          if ((levelH[level] ?? 0) >= (levelH[cur.level ?? 'Entry'] ?? 0)) {
            cur.level = level; cur.assessmentTitle = assessment.title; cur.earnedAt = new Date();
            if (score > (cur.score ?? 0)) cur.score = score;
          }
        } else {
          user.verifiedSkills?.push({ skill, assessmentTitle: assessment.title, level, badgeIcon: 'verified-badge', score });
        }
        await user.save();
      }
    }
    res.status(200).json({ score, passed, candidateName: passed ? req.user.fullName : undefined,
      message: passed ? 'Congratulations! You passed.' : 'You did not pass. Try again later.' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/assessments/:id
router.put('/:id', protect as any, async (req, res) => {
  try {
    const a = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!a) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json(a);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// DELETE /api/assessments/:id
router.delete('/:id', protect as any, async (req, res) => {
  try {
    if (!(await Assessment.findByIdAndDelete(req.params.id))) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/assessments/:id/questions
router.post('/:id/questions', protect as any, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) { res.status(404).json({ message: 'Not found' }); return; }
    a.questions.push(req.body as any);
    await a.save(); res.status(200).json(a);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/assessments/:assessmentId/questions/:questionId
router.put('/:assessmentId/questions/:questionId', protect as any, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.assessmentId);
    if (!a) { res.status(404).json({ message: 'Not found' }); return; }
    const q = (a.questions as any).id(req.params.questionId);
    if (!q) { res.status(404).json({ message: 'Question not found' }); return; }
    Object.assign(q, req.body);
    await a.save(); res.status(200).json(a);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// DELETE /api/assessments/:assessmentId/questions/:questionId
router.delete('/:assessmentId/questions/:questionId', protect as any, async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.assessmentId);
    if (!a) { res.status(404).json({ message: 'Not found' }); return; }
    (a.questions as any).id(req.params.questionId)?.deleteOne();
    await a.save(); res.status(200).json({ message: 'Question deleted', assessment: a });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/assessments/:skill/users
router.get('/:skill/users', protect as any, async (req, res) => {
  try {
    const { skill } = req.params;
    const assessment = await Assessment.findOne({ skill });
    const defaultScore = assessment?.passingScore || 80;
    const users = await User.find({ 'verifiedSkills.skill': skill }).select('fullName email verifiedSkills');
    const verified = users.map(u => {
      const s = u.verifiedSkills?.find(v => v.skill === skill);
      return { _id: u._id, fullName: u.fullName, email: u.email, level: s?.level, earnedAt: s?.earnedAt,
        assessmentTitle: s?.assessmentTitle, score: (s?.score && s.score > 0) ? s.score : defaultScore };
    }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    res.status(200).json(verified);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// DELETE /api/assessments/:skill/users/:userId
router.delete('/:skill/users/:userId', protect as any, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    user.verifiedSkills = user.verifiedSkills?.filter(s => s.skill !== req.params.skill);
    await user.save();
    res.status(200).json({ message: 'User unverified' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/assessments/:skill (catch-all)
router.get('/:skill', protect as any, async (req, res) => {
  try {
    const a = await Assessment.findOne({ skill: req.params.skill });
    if (!a) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json(a);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
