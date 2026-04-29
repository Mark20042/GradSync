import { Router } from 'express';
import type { Response } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { admin } from '../../shared/middleware/admin.middleware.js';
import Interview from '../../shared/models/Interview.model.js';
import InterviewRole from '../../shared/models/InterviewRole.model.js';
import InterviewQuestion from '../../shared/models/InterviewQuestion.model.js';
import { getOllamaService } from '../ai/services/ollama.service.js';
import { sendInterviewResultEmail } from '../../shared/utils/email.service.js';
import { interviewGraph } from '../ai/workflows/interview-agent.workflow.js';
import { HumanMessage } from '@langchain/core/messages';

const router = Router();

// ─── Interview Evaluation & Records ──────────────────────────────────────

router.post('/evaluate', protect as any, async (req: any, res: Response) => {
  try {
    const { roleName, answers } = req.body;
    const candidateId = req.user._id;
    const userEmail = req.user.email;
    const userName = req.user.fullName;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ message: 'No answers provided' });
      return;
    }

    const role = await InterviewRole.findOne({ roleName });
    const roleQuestions = role ? role.questions : [];
    const idealMap: Record<string, string> = {};
    roleQuestions.forEach((q) => {
      idealMap[String(q._id)] = q.idealAnswer || '';
    });

    // Create/Update the record as "pending" so the user knows it's being worked on
    const interview = await Interview.findOneAndUpdate(
      { candidateId, roleName: roleName || 'General' },
      { $set: { status: 'pending', answers: answers.map(a => ({
          questionId: a.questionId || null,
          questionText: a.questionText,
          candidateAnswer: a.candidateAnswer,
          idealAnswer: idealMap[String(a.questionId)] || a.idealAnswer || ''
        }))
      }},
      { new: true, upsert: true }
    );

    // Return immediate response to the client
    res.status(202).json({
      message: 'Interview submitted. We are analyzing your answers in the background. You will receive an email once complete.',
      interviewId: interview._id
    });

    // Background Evaluation Process
    (async () => {
      try {
        const ollama = getOllamaService();
        console.log(`🧠 Background evaluation started for user: ${userName} (${roleName})`);

        const bulkResult = await ollama.evaluateFullInterview(
          roleName || 'General',
          answers.map((a) => ({
            questionId: String(a.questionId),
            questionText: a.questionText,
            idealAnswer: idealMap[String(a.questionId)] || a.idealAnswer || '',
            candidateAnswer: a.candidateAnswer,
          }))
        );

        const evaluated = bulkResult.evaluations.map((ev, idx) => {
          const orig = answers[idx];
          // Always trust the original questionId from our trusted 'answers' array
          // and only take the performance data (score/feedback) from the AI.
          return {
            questionId: orig.questionId || null,
            questionText: orig.questionText,
            idealAnswer: idealMap[String(orig.questionId)] || orig.idealAnswer || '',
            candidateAnswer: orig.candidateAnswer,
            score: typeof ev.score === 'number' ? ev.score : 0,
            feedback: ev.feedback || 'No feedback provided.',
          };
        });

        const aiFeedback = {
          overallScore: bulkResult.overallScore,
          totalQuestions: answers.length,
          strengths: bulkResult.strengths,
          areasForImprovement: bulkResult.areasForImprovement,
          summary: bulkResult.summary,
        };

        await Interview.findByIdAndUpdate(interview._id, {
          $set: {
            answers: evaluated,
            aiScore: bulkResult.overallScore,
            aiFeedback,
            status: 'evaluated',
          },
        });

        console.log(`✅ Background evaluation complete for ${userName}`);

        // Send Email Notification
        await sendInterviewResultEmail(
          userEmail,
          userName,
          roleName || 'General',
          bulkResult.overallScore,
          bulkResult.summary
        );
      } catch (err: any) {
        console.error('❌ Background evaluation failed:', err.message);
        await Interview.findByIdAndUpdate(interview._id, { $set: { status: 'failed' } });
      }
    })();
  } catch (error: any) {
    console.error('Evaluation setup failed:', error);
    res.status(500).json({ message: 'Failed to submit interview for evaluation' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();
    res.status(201).json({ message: 'Interview saved', interview });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/user', protect as any, async (req: any, res: Response) => {
  try { res.status(200).json(await Interview.find({ candidateId: req.user.id }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/all-scores', protect as any, admin as any, async (_req, res) => {
  try { res.status(200).json(await Interview.find({ status: 'evaluated' }).populate('candidateId', 'fullName email avatar degree').sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/graduate/:userId', protect as any, async (req, res) => {
  try { res.status(200).json(await Interview.find({ candidateId: req.params.userId, status: 'evaluated' }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/', protect as any, async (_req, res) => {
  try { res.status(200).json(await Interview.find().populate('candidateId', 'fullName email avatar').sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', protect as any, async (req, res) => {
  try {
    const i = await Interview.findById(req.params.id).populate('candidateId', 'fullName email avatar');
    if (!i) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json(i);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect as any, admin as any, async (req, res) => {
  try {
    if (!(await Interview.findByIdAndDelete(req.params.id))) { res.status(404).json({ message: 'Not found' }); return; }
    res.status(200).json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ─── Real-Time Conversational AI Endpoint ──────────────────────────────────
router.post('/chat', protect as any, async (req: any, res: Response) => {
  try {
    const { thread_id, roleName, message } = req.body;
    const candidateId = req.user._id;

    if (!thread_id) {
      res.status(400).json({ message: 'thread_id is required' });
      return;
    }

    const config = { configurable: { thread_id } };

    // 1. Initialization (Start of interview)
    if (!message) {
      const role = await InterviewRole.findOne({ roleName });
      if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }
      
      const mappedQuestions = role.questions.map((q: any) => ({
        questionId: String(q._id),
        text: q.questionText,
        idealAnswer: q.idealAnswer || ''
      }));

      // Add 3 structural prep questions tailored for fresh graduates
      const introQuestions = [
        {
          questionId: "intro_1",
          text: `Hello! I'm your GradSync AI Interviewer. To start, how do you plan to handle the responsibilities of the ${roleName} role as a fresh graduate?`,
          idealAnswer: `The candidate should confidently explain their readiness and motivation for the ${roleName} role.`
        },
        {
          questionId: "intro_2",
          text: `What specific skills or software have you learned during your studies that will directly help you succeed as a ${roleName}?`,
          idealAnswer: `The candidate should highlight relevant academic projects, software, or coursework that align with the ${roleName}.`
        },
        {
          questionId: "intro_3",
          text: `Transitioning into a professional ${roleName} environment can be challenging. How will you stay organized and continuously improve your skills on the job?`,
          idealAnswer: `The candidate should discuss adaptive strategies, problem-solving, and a willingness to learn continuously.`
        }
      ];

      mappedQuestions.unshift(...introQuestions);

      const result: any = await interviewGraph.invoke({ 
         roleName: roleName,
         questions: mappedQuestions,
         messages: [] 
      }, config);
      
      const lastMessage = result.messages[result.messages.length - 1];
      res.json({ aiMessage: lastMessage.content, isFinished: result.isFinished });
      return;
    }

    // 2. Ongoing Conversation (Candidate submits an answer)
    console.log(`🎤 Processing candidate answer via LangGraph for thread: ${thread_id}`);
    const result: any = await interviewGraph.invoke({ 
        messages: [new HumanMessage(message)] 
    }, config);

    // 3. Check if the interview just finished
    if (result.isFinished && result.evaluations && result.evaluations.length > 0) {
       console.log(`✅ Interview finished! Saving to database...`);
       
       const evals = result.evaluations.map((e: any) => {
          const evalCopy = { ...e };
          // MongoDB will throw a CastError if we pass a custom string to an ObjectId field
          if (evalCopy.questionId && String(evalCopy.questionId).startsWith('intro')) {
             delete evalCopy.questionId;
          }
          return evalCopy;
       });

       const totalScore = evals.reduce((sum: number, ev: any) => sum + ev.score, 0);
       const avgScore = evals.length > 0 ? Math.round(totalScore / evals.length) : 0;

       // Use existing OllamaService to generate a cohesive summary based on the parsed answers
       const ollama = getOllamaService();
       const summaryRes = await ollama.evaluateFullInterview(
          roleName,
          evals.map((e: any) => ({
             questionId: e.questionId,
             questionText: e.questionText,
             candidateAnswer: e.candidateAnswer,
             idealAnswer: e.idealAnswer
          }))
       );

       await Interview.create({
          candidateId,
          roleName,
          status: 'evaluated',
          answers: evals,
          aiScore: avgScore,
          aiFeedback: {
             overallScore: avgScore,
             totalQuestions: evals.length,
             summary: summaryRes.summary,
             strengths: summaryRes.strengths,
             areasForImprovement: summaryRes.areasForImprovement
          }
       });

       // We could trigger the email here as well:
       await sendInterviewResultEmail(req.user.email, req.user.fullName, roleName, avgScore, summaryRes.summary);
    }
    
    const lastMessage = result.messages[result.messages.length - 1];
    res.json({ 
      aiMessage: lastMessage?.content || "Thank you. That completes our interview.", 
      isFinished: result.isFinished 
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ message: 'Failed to process chat message' });
  }
});

export default router;
