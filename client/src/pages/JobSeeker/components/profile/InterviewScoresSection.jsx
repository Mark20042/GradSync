import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
} from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { API_PATH } from "../../../../utils/apiPath";

const InterviewScoresSection = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.INTERVIEW.GET_USER_INTERVIEWS);
      setInterviews(res.data.filter((i) => i.status === "evaluated"));
    } catch (error) {
      console.error("Error fetching interview scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-blue-50 border-blue-200";
    if (score >= 40) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-emerald-500 to-green-600";
    if (score >= 60) return "from-blue-500 to-indigo-600";
    if (score >= 40) return "from-amber-500 to-yellow-600";
    return "from-red-500 to-rose-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Interview Scores
        </h2>
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const avgScore = interviews.length > 0
    ? Math.round(interviews.reduce((sum, i) => sum + (i.aiScore || 0), 0) / interviews.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Interview Scores
        </h2>
        <button
          onClick={() => navigate("/interview-room")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
        >
          Take Interview
        </button>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No interview scores yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Take a mock interview to get AI-evaluated feedback
          </p>
          <button
            onClick={() => navigate("/skill-center")}
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            Go to Skill Center
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                Average Score
              </p>
              <p className="text-2xl font-extrabold text-blue-700">
                {avgScore}<span className="text-base text-blue-400">/100</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">
                Total Interviews
              </p>
              <p className="text-2xl font-extrabold text-emerald-700">
                {interviews.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">
                Best Score
              </p>
              <p className="text-2xl font-extrabold text-purple-700">
                {Math.max(...interviews.map((i) => i.aiScore || 0))}
              </p>
            </div>
          </div>

          {/* Interview Cards */}
          <div className="space-y-3">
            {interviews.map((interview) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl transition-all ${
                  expandedId === interview._id ? "border-blue-200 shadow-md" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === interview._id ? null : interview._id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${getScoreGradient(interview.aiScore)} text-white font-bold text-lg shadow-sm`}
                    >
                      {interview.aiScore}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {interview.roleName || "General"} Interview
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreBg(interview.aiScore)} ${getScoreColor(interview.aiScore)}`}>
                          {getScoreLabel(interview.aiScore)}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expandedId === interview._id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {expandedId === interview._id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    {interview.aiFeedback?.summary && (
                      <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                        {interview.aiFeedback.summary}
                      </p>
                    )}
                    <div className="space-y-3">
                      {interview.answers?.map((answer, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                            Q{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 truncate font-medium">
                              {answer.questionText}
                            </p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                              <div
                                className={`h-1.5 rounded-full bg-gradient-to-r ${getScoreGradient(answer.score)}`}
                                style={{ width: `${answer.score}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(answer.score)}`}>
                            {answer.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewScoresSection;
