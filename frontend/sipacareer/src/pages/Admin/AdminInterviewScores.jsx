import React, { useState, useEffect } from "react";
import { BarChart3, User, Calendar, Eye, ChevronDown, ChevronUp, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminInterviewScores = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.INTERVIEW.GET_ALL_SCORES);
      setInterviews(res.data);
    } catch (error) {
      toast.error("Failed to fetch interview scores");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent row click from expanding
    if (window.confirm("Are you sure you want to delete this interview record? This action cannot be undone.")) {
      try {
        await axiosInstance.delete(API_PATH.INTERVIEW.DELETE_INTERVIEW(id));
        toast.success("Interview record deleted successfully");
        setInterviews((prev) => prev.filter((i) => i._id !== id));
      } catch (error) {
        toast.error("Failed to delete interview");
        console.error("Delete Error:", error);
      }
    }
  };

  const filtered = interviews.filter((i) => {
    const name = i.candidateId?.fullName?.toLowerCase() || "";
    const role = i.roleName?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || role.includes(term);
  });

  const avgScore = interviews.length > 0
    ? Math.round(interviews.reduce((sum, i) => sum + (i.aiScore || 0), 0) / interviews.length)
    : 0;

  const highScorers = interviews.filter((i) => i.aiScore >= 80).length;

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <DashboardLayout activeMenu="admin-interview-scores">
      <div className="min-h-screen bg-gray-100 p-10">
        <div className="flex justify-between items-end mb-8 bg-white px-8 py-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 m-0 tracking-tight">
              Interview Scores
            </h1>
            <p className="text-gray-500 mt-2 text-base">
              AI-evaluated mock interview results across all graduates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Total Evaluations</p>
            <p className="text-3xl font-extrabold text-gray-900 m-0">{interviews.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Average Score</p>
            <p className="text-3xl font-extrabold text-gray-900 m-0">
              {avgScore}<span className="text-base text-gray-400">/100</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">High Scorers (≥80)</p>
            <p className="text-3xl font-extrabold text-green-600 m-0">{highScorers}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Unique Candidates</p>
            <p className="text-3xl font-extrabold text-gray-900 m-0">
              {new Set(interviews.map((i) => i.candidateId?._id).filter(Boolean)).size}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 mb-6 border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            className="flex-1 border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
            placeholder="Search by candidate name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500 font-medium bg-white rounded-2xl shadow-sm border border-gray-100">
            Loading interview scores...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <BarChart3 size={48} className="mb-4 opacity-50 text-gray-300" />
            <p className="font-bold">No interview scores found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_0.5fr] px-6 py-4 bg-gray-50 border-b border-gray-200 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">
              <span>Candidate</span>
              <span>Role</span>
              <span>Score</span>
              <span>Date</span>
              <span className="text-center">Details</span>
              <span className="text-center">Action</span>
            </div>
            {filtered.map((interview) => (
              <React.Fragment key={interview._id}>
                <div 
                  onClick={() => setExpandedId(expandedId === interview._id ? null : interview._id)}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_0.5fr] px-6 py-4 border-b border-gray-100 items-center cursor-pointer transition-colors hover:bg-slate-50 last:border-none"
                >
                  <div className="flex items-center gap-3">
                    {interview.candidateId?.avatar ? (
                      <img
                        src={interview.candidateId.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-sm">
                        {interview.candidateId?.fullName?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {interview.candidateId?.fullName || "Unknown"}
                      </div>
                      <div className="text-[0.7rem] text-gray-400 truncate">
                        {interview.candidateId?.email || ""}
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-700">{interview.roleName || "General"}</span>
                  <div>
                    <span className={`inline-flex items-center justify-center px-4 py-1 rounded-full font-bold text-xs ${getScoreColor(interview.aiScore)}`}>
                      {interview.aiScore}/100
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs font-medium">
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex justify-center">
                    {expandedId === interview._id
                      ? <ChevronUp size={20} className="text-gray-400" />
                      : <ChevronDown size={20} className="text-gray-400" />
                    }
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => handleDelete(e, interview._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete Record"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {expandedId === interview._id && (
                  <div className="px-6 py-6 bg-slate-50 border-b-2 border-slate-200">
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        AI Feedback Summary
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
                        {interview.aiFeedback?.summary || "No summary available."}
                      </p>
                    </div>
                    <h4 className="text-[0.7rem] font-bold text-gray-400 mb-3 uppercase tracking-widest">
                      Per-Question Breakdown ({interview.answers?.length || 0} questions)
                    </h4>
                    <div className="flex flex-col gap-3">
                      {interview.answers?.map((answer, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm transition-all hover:border-blue-200">
                          <div className="flex justify-between items-start mb-2 gap-3">
                            <p className="font-bold text-gray-800 text-sm flex-1 leading-snug">
                              Q{idx + 1}: {answer.questionText}
                            </p>
                            <span className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full font-bold text-[0.65rem] shrink-0 ${getScoreColor(answer.score)}`}>
                              {answer.score}/100
                            </span>
                          </div>
                          <p className="text-[0.75rem] text-gray-400 mb-1 leading-normal italic">
                            <strong className="text-gray-500 not-italic">Candidate said:</strong> {answer.candidateAnswer || <em className="text-gray-300">No answer</em>}
                          </p>
                          <p className="text-[0.75rem] text-gray-600 leading-normal">
                            <strong className="text-gray-700">Feedback:</strong> {answer.feedback}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminInterviewScores;
