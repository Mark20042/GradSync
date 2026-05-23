import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Interview from "@/models/Interview.model.js";
import InterviewRole from "@/models/InterviewRole.model.js";
import { getOllamaService } from "@/services/ai/ollama.service.js";
import { sendInterviewResultEmail, sendAssessmentRejectionEmail } from "@/utils/email.service.js";
import { interviewGraph } from "@/services/ai/workflows/interview-agent.workflow.js";
import { HumanMessage } from "@langchain/core/messages";

const evaluate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roleName, answers, violations } = req.body;
    const candidateId = req.user._id;
    const userEmail = req.user.email;
    const userName = req.user.fullName;
    if (!answers || !Array.isArray(answers) || answers.length === 0) throw new BadRequestError("No answers provided");

    const role = await InterviewRole.findOne({ roleName });
    const roleQuestions = role ? role.questions : [];
    const idealMap: Record<string, string> = {};
    roleQuestions.forEach((q) => { idealMap[String(q._id)] = q.idealAnswer || ""; });

    // Evaluate integrity violations
    const violationCounts: Record<string, number> = { "tab-switch": 0, "copy-paste": 0, "window-blur": 0, "right-click": 0, devtools: 0 };
    if (Array.isArray(violations)) {
      violations.forEach((v: any) => {
        if (violationCounts[v.type] !== undefined) violationCounts[v.type]++;
      });
    }

    let isFailed = false;
    let rejectionReason = "";

    const maxTabSwitches = role?.maxTabSwitches ?? 3;
    const maxCopyPastes = role?.maxCopyPastes ?? 3;
    const maxWindowBlurs = role?.maxWindowBlurs ?? 3;
    const maxRightClicks = role?.maxRightClicks ?? 3;
    const maxDevTools = role?.maxDevTools ?? 1;

    if (violationCounts["tab-switch"] > maxTabSwitches) {
      isFailed = true; rejectionReason = `Multiple tab-switching violations detected.`;
    } else if (violationCounts["copy-paste"] > maxCopyPastes) {
      isFailed = true; rejectionReason = `Multiple copy-paste violations detected.`;
    } else if (violationCounts["window-blur"] > maxWindowBlurs) {
      isFailed = true; rejectionReason = `Multiple window blur violations detected.`;
    } else if (violationCounts["right-click"] > maxRightClicks) {
      isFailed = true; rejectionReason = `Multiple right-click violations detected.`;
    } else if (violationCounts["devtools"] > maxDevTools) {
      isFailed = true; rejectionReason = `Unauthorized use of developer tools detected.`;
    }

    const initialStatus = isFailed ? "failed" : "pending";

    const interview = await Interview.findOneAndUpdate(
      { candidateId, roleName: roleName || "General" },
      { $set: { 
          status: initialStatus, 
          violations: violations || [],
          violationCount: Array.isArray(violations) ? violations.length : 0,
          rejectionReason,
          answers: answers.map((a: any) => ({
            questionId: a.questionId || null, questionText: a.questionText,
            candidateAnswer: a.candidateAnswer, idealAnswer: idealMap[String(a.questionId)] || a.idealAnswer || ""
          }))
        }
      },
      { new: true, upsert: true }
    );

    if (isFailed) {
      await sendAssessmentRejectionEmail(userEmail, userName, `Interview - ${roleName || "General"}`, rejectionReason);
      res.status(StatusCodes.OK).json({
        message: "Interview submitted.",
        status: "rejected",
        interviewId: interview._id
      });
      return;
    }

    res.status(StatusCodes.ACCEPTED).json({
      message: "Interview submitted. Analyzing in background. You will receive an email once complete.",
      interviewId: interview._id
    });

    (async () => {
      try {
        const ollama = getOllamaService();
        console.log(`🧠 Background evaluation started for user: ${userName} (${roleName})`);
        const bulkResult = await ollama.evaluateFullInterview(
          roleName || "General",
          answers.map((a: any) => ({ questionId: String(a.questionId), questionText: a.questionText,
            idealAnswer: idealMap[String(a.questionId)] || a.idealAnswer || "", candidateAnswer: a.candidateAnswer }))
        );
        const evaluated = bulkResult.evaluations.map((ev, idx) => {
          const orig = answers[idx];
          return { questionId: orig.questionId || null, questionText: orig.questionText,
            idealAnswer: idealMap[String(orig.questionId)] || orig.idealAnswer || "",
            candidateAnswer: orig.candidateAnswer,
            score: typeof ev.score === "number" ? ev.score : 0,
            feedback: ev.feedback || "No feedback provided." };
        });
        const aiFeedback = { overallScore: bulkResult.overallScore, totalQuestions: answers.length,
          strengths: bulkResult.strengths, areasForImprovement: bulkResult.areasForImprovement, summary: bulkResult.summary };
        await Interview.findByIdAndUpdate(interview._id, { $set: { answers: evaluated, aiScore: bulkResult.overallScore, aiFeedback, status: "evaluated" } });
        console.log(`✅ Background evaluation complete for ${userName}`);
        await sendInterviewResultEmail(userEmail, userName, roleName || "General", bulkResult.overallScore, bulkResult.summary);
      } catch (err: any) {
        console.error("❌ Background evaluation failed:", err.message);
        await Interview.findByIdAndUpdate(interview._id, { $set: { status: "failed" } });
      }
    })();
  } catch (error) { next(error); }
};

const save = async (req: Request, res: Response, next: NextFunction) => {
  try { const interview = new Interview(req.body); await interview.save(); res.status(StatusCodes.CREATED).json({ message: "Interview saved", interview }); }
  catch (error) { next(error); }
};

const patchCategories = async (interviews: any[]) => {
  const roles = await InterviewRole.find({}).lean();
  const roleMap: Record<string, any[]> = {};
  roles.forEach(r => { roleMap[r.roleName] = r.questions; });

  interviews.forEach(interview => {
    const roleQuestions = roleMap[interview.roleName] || [];
    interview.answers?.forEach((ans: any) => {
      let cat = ans.category || "General";
      if (!ans.category || ans.category === "General") {
        if (String(ans.questionId).startsWith("intro_1")) cat = "Communication";
        else if (String(ans.questionId).startsWith("intro_2")) cat = "General";
        else if (String(ans.questionId).startsWith("intro_3")) cat = "Behavioral";
        else {
          const matchedQ = roleQuestions.find((rq: any) => String(rq._id) === String(ans.questionId));
          if (matchedQ && matchedQ.category) cat = matchedQ.category;
          else if (!ans.questionId) {
              if (ans.questionText.includes("plan to handle the responsibilities")) cat = "Communication";
              else if (ans.questionText.includes("specific skills or software")) cat = "General";
              else if (ans.questionText.includes("stay organized and continuously improve")) cat = "Behavioral";
          }
        }
        ans.category = cat;
      }
    });
  });
  return interviews;
};

const getUserInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { 
    const interviews = await Interview.find({ candidateId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.status(StatusCodes.OK).json(await patchCategories(interviews)); 
  }
  catch (error) { next(error); }
};

const getAllScores = async (_req: Request, res: Response, next: NextFunction) => {
  try { 
    const interviews = await Interview.find({ status: "evaluated" }).populate("candidateId", "fullName email avatar degree").sort({ createdAt: -1 }).lean();
    res.status(StatusCodes.OK).json(await patchCategories(interviews)); 
  }
  catch (error) { next(error); }
};

const getGraduateInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try { 
    const interviews = await Interview.find({ candidateId: req.params.userId, status: "evaluated" }).sort({ createdAt: -1 }).lean();
    res.status(StatusCodes.OK).json(await patchCategories(interviews)); 
  }
  catch (error) { next(error); }
};

const getInterviewAll = async (_req: Request, res: Response, next: NextFunction) => {
  try { 
    const interviews = await Interview.find().populate("candidateId", "fullName email avatar").sort({ createdAt: -1 }).lean();
    res.status(StatusCodes.OK).json(await patchCategories(interviews)); 
  }
  catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const i = await Interview.findById(req.params.id).populate("candidateId", "fullName email avatar").lean();
    if (!i) throw new NotFoundError("Interview not found");
    const patched = await patchCategories([i]);
    res.status(StatusCodes.OK).json(patched[0]);
  } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(await Interview.findByIdAndDelete(req.params.id))) throw new NotFoundError("Interview not found");
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) { next(error); }
};

const chat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { thread_id, roleName, message } = req.body;
    const candidateId = req.user._id;
    if (!thread_id) throw new BadRequestError("thread_id is required");
    const config = { configurable: { thread_id } };

    if (!message) {
      const role = await InterviewRole.findOne({ roleName });
      if (!role) throw new NotFoundError("Role not found");
      const mappedQuestions = role.questions.map((q: any) => ({ questionId: String(q._id), text: q.questionText, idealAnswer: q.idealAnswer || "" }));
      const introQuestions = [
        { questionId: "intro_1", text: `Hello! I'm your GradSync AI Interviewer. To start, how do you plan to handle the responsibilities of the ${roleName} role as a fresh graduate?`, idealAnswer: `The candidate should confidently explain their readiness and motivation for the ${roleName} role.` },
        { questionId: "intro_2", text: `What specific skills or software have you learned during your studies that will directly help you succeed as a ${roleName}?`, idealAnswer: `The candidate should highlight relevant academic projects, software, or coursework that align with the ${roleName}.` },
        { questionId: "intro_3", text: `Transitioning into a professional ${roleName} environment can be challenging. How will you stay organized and continuously improve your skills on the job?`, idealAnswer: `The candidate should discuss adaptive strategies, problem-solving, and a willingness to learn continuously.` }
      ];
      mappedQuestions.unshift(...introQuestions);
      const result: any = await interviewGraph.invoke({ roleName, questions: mappedQuestions, messages: [] }, config);
      const lastMessage = result.messages[result.messages.length - 1];
      res.json({ aiMessage: lastMessage.content, isFinished: result.isFinished });
      return;
    }

    const result: any = await interviewGraph.invoke({ messages: [new HumanMessage(message)] }, config);
    if (result.isFinished && result.evaluations && result.evaluations.length > 0) {
      
      const role = await InterviewRole.findOne({ roleName });
      const roleQuestions = role ? role.questions : [];

      const evals = result.evaluations.map((e: any) => {
        const evalCopy = { ...e };
        
        let cat = "General";
        if (evalCopy.questionId) {
          if (String(evalCopy.questionId).startsWith("intro_1")) cat = "Communication";
          else if (String(evalCopy.questionId).startsWith("intro_2")) cat = "General";
          else if (String(evalCopy.questionId).startsWith("intro_3")) cat = "Behavioral";
          else {
            const matchedQ = roleQuestions.find((rq: any) => String(rq._id) === String(evalCopy.questionId));
            if (matchedQ && matchedQ.category) cat = matchedQ.category;
          }
        }
        evalCopy.category = cat;

        if (evalCopy.questionId && String(evalCopy.questionId).startsWith("intro")) delete evalCopy.questionId;
        return evalCopy;
      });

      const totalScore = evals.reduce((sum: number, ev: any) => sum + ev.score, 0);
      const avgScore = evals.length > 0 ? Math.round(totalScore / evals.length) : 0;
      
      const categoryTotals: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      evals.forEach((ev: any) => {
         const c = ev.category || "General";
         if (!categoryTotals[c]) { categoryTotals[c] = 0; categoryCounts[c] = 0; }
         categoryTotals[c] += ev.score;
         categoryCounts[c] += 1;
      });
      const categoryScores: Record<string, number> = {};
      let highestCategory = { name: "", score: -1 };
      let lowestCategory = { name: "", score: 101 };
      Object.keys(categoryTotals).forEach(c => {
         const avg = Math.round(categoryTotals[c] / categoryCounts[c]);
         categoryScores[c] = avg;
         if (avg > highestCategory.score) highestCategory = { name: c, score: avg };
         if (avg < lowestCategory.score) lowestCategory = { name: c, score: avg };
      });
      
      let categoryInterpretation = `The candidate showed a balanced performance across all evaluated areas.`;
      if (highestCategory.name && lowestCategory.name && highestCategory.name !== lowestCategory.name) {
         if (highestCategory.score >= 80 && lowestCategory.score < 60) {
            categoryInterpretation = `The candidate excelled remarkably in ${highestCategory.name} but exhibited significant gaps in ${lowestCategory.name}.`;
         } else if (highestCategory.score - lowestCategory.score >= 15) {
            categoryInterpretation = `The candidate is strongest in ${highestCategory.name} but lacks slightly in ${lowestCategory.name}.`;
         }
      }

      const ollama = getOllamaService();
      const summaryRes = await ollama.evaluateFullInterview(roleName, evals.map((e: any) => ({ questionId: e.questionId, questionText: e.questionText, candidateAnswer: e.candidateAnswer, idealAnswer: e.idealAnswer })));
      
      await Interview.create({ 
        candidateId, 
        roleName, 
        status: "evaluated", 
        answers: evals, 
        aiScore: avgScore,
        aiFeedback: { 
          overallScore: avgScore, 
          totalQuestions: evals.length, 
          summary: summaryRes.summary, 
          strengths: summaryRes.strengths, 
          areasForImprovement: summaryRes.areasForImprovement,
          categoryScores,
          categoryInterpretation
        } 
      });
      await sendInterviewResultEmail(req.user.email, req.user.fullName, roleName, avgScore, summaryRes.summary);
    }
    const lastMessage = result.messages[result.messages.length - 1];
    res.json({ aiMessage: lastMessage?.content || "Thank you. That completes our interview.", isFinished: result.isFinished });
  } catch (error) { next(error); }
};

export { evaluate, save, getUserInterviews, getAllScores, getGraduateInterviews, getInterviewAll, getById, remove, chat };
