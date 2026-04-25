import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  RefreshCw,
  User,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import confetti from "canvas-confetti";

const InterviewResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const interview = location.state?.interview;
  const confettiFired = useRef(false);

  useEffect(() => {
    if (interview?.aiScore >= 80 && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"],
        });
      }, 500);
    }
  }, [interview]);

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No interview results found.</p>
          <button
            onClick={() => navigate("/skill-center")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Go to Skill Center
          </button>
        </div>
      </div>
    );
  }

  const { aiScore, aiFeedback, answers, roleName } = interview;

  const getScoreColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#2563eb";
    if (score >= 40) return "#ca8a04";
    return "#dc2626";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-emerald-500 to-green-600";
    if (score >= 60) return "from-blue-500 to-indigo-600";
    if (score >= 40) return "from-amber-500 to-yellow-600";
    return "from-red-500 to-rose-600";
  };

  // Calculate the stroke-dashoffset for the circular progress
  const circumference = 2 * Math.PI * 70; // radius = 70
  const offset = circumference - (aiScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-16">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/skill-center")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Skill Center
          </button>
          <span className="text-sm text-slate-400">
            Interview Results • {new Date(interview.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pt-10">
        {/* Score Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8"
        >
          <div className={`bg-gradient-to-r ${getScoreGradient(aiScore)} p-1`}>
            <div className="bg-white rounded-t-[calc(1.5rem-4px)] px-8 py-10">
              <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Circular Score */}
                <div className="flex-shrink-0">
                  <svg width="180" height="180" className="transform -rotate-90">
                    <circle
                      cx="90" cy="90" r="70"
                      fill="none" stroke="#f1f5f9" strokeWidth="12"
                    />
                    <motion.circle
                      cx="90" cy="90" r="70"
                      fill="none"
                      stroke={getScoreColor(aiScore)}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    />
                  </svg>
                  <div className="relative" style={{ marginTop: "-130px", textAlign: "center", height: "80px" }}>
                    <motion.span
                      className="text-5xl font-black"
                      style={{ color: getScoreColor(aiScore) }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {aiScore}
                    </motion.span>
                    <span className="text-slate-400 text-lg font-medium">/100</span>
                  </div>
                </div>

                {/* Score Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <span
                      className={`px-4 py-1.5 rounded-full text-white text-sm font-bold bg-gradient-to-r ${getScoreGradient(aiScore)}`}
                    >
                      {getScoreLabel(aiScore)}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {roleName || "General"} Interview
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
                    Interview Performance
                  </h1>
                  <p className="text-slate-500 leading-relaxed max-w-lg">
                    {aiFeedback?.summary || "Your interview has been evaluated by our AI system."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {(aiFeedback?.strengths || []).map((s, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-600 leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {(aiFeedback?.areasForImprovement || []).map((s, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-600 leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Per-Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Question-by-Question Breakdown
            </h3>
          </div>

          <div className="space-y-5">
            {answers?.map((answer, idx) => (
              <div
                key={idx}
                className="border border-slate-100 rounded-xl p-5 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {answer.questionText}
                    </p>
                  </div>
                  <div
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-white font-bold text-sm bg-gradient-to-r ${getScoreGradient(answer.score)}`}
                  >
                    {answer.score}/100
                  </div>
                </div>

                {/* Score Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(answer.score)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${answer.score}%` }}
                    transition={{ duration: 1, delay: 0.8 + idx * 0.1, ease: "easeOut" }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
                      Your Answer
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {answer.candidateAnswer || (
                        <span className="italic text-slate-400">No answer provided</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-400 uppercase mb-1">
                      AI Feedback
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {answer.feedback || "No feedback available."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-8"
        >
          <button
            onClick={() => navigate("/profile")}
            className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2"
          >
            <User size={20} />
            View on My Profile
          </button>
          <button
            onClick={() => navigate("/interview-room", { state: { jobRole: roleName } })}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewResults;
