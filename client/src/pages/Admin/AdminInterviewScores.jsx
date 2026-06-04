import React, { useState, useEffect } from "react";
import { BarChart3, User, Calendar, Eye, ChevronDown, ChevronUp, Search, Trash2, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminInterviewScores = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterviewForDetails, setSelectedInterviewForDetails] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);

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

  const handleDelete = (e, id) => {
    e.stopPropagation(); // prevent row click from expanding
    setInterviewToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!interviewToDelete) return;
    try {
      await axiosInstance.delete(API_PATH.INTERVIEW.DELETE_INTERVIEW(interviewToDelete));
      toast.success("Interview record deleted successfully");
      setInterviews((prev) => prev.filter((i) => i._id !== interviewToDelete));
    } catch (error) {
      toast.error("Failed to delete interview");
      console.error("Delete Error:", error);
    } finally {
      setDeleteModalOpen(false);
      setInterviewToDelete(null);
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

  // Backend patchCategories already assigns correct categories
  // Valid categories: General, Communication, Technical, Behavioral
  const getDisplayCategory = (answer) => answer.category || "General";

  const getDisplayCategoryScores = (interview) => {
    if (!interview) return null;
    if (interview.aiFeedback?.categoryScores && Object.keys(interview.aiFeedback.categoryScores).length > 0) {
      return interview.aiFeedback.categoryScores;
    }
    
    // Fallback calculation from answer categories (already correct from backend)
    if (!interview.answers || interview.answers.length === 0) return null;
    
    const categoryTotals = {};
    const categoryCounts = {};
    interview.answers.forEach(ans => {
      const c = ans.category || "General";
      if (!categoryTotals[c]) { categoryTotals[c] = 0; categoryCounts[c] = 0; }
      categoryTotals[c] += ans.score || 0;
      categoryCounts[c] += 1;
    });
    
    const calculated = {};
    Object.keys(categoryTotals).forEach(c => {
      calculated[c] = Math.round(categoryTotals[c] / categoryCounts[c]);
    });
    
    return Object.keys(calculated).length > 0 ? calculated : null;
  };

  const getDisplayCategoryInterpretation = (interview, scores) => {
    if (!interview || !scores) return null;
    if (interview.aiFeedback?.categoryInterpretation) return interview.aiFeedback.categoryInterpretation;
    
    let highest = { name: "", score: -1 };
    let lowest = { name: "", score: 101 };
    
    Object.entries(scores).forEach(([name, score]) => {
      if (score > highest.score) highest = { name, score };
      if (score < lowest.score) lowest = { name, score };
    });
    
    if (highest.name && lowest.name && highest.name !== lowest.name) {
      if (highest.score >= 80 && lowest.score < 60) {
        return `The candidate excelled remarkably in ${highest.name} but exhibited significant gaps in ${lowest.name}.`;
      } else if (highest.score - lowest.score >= 15) {
        return `The candidate is strongest in ${highest.name} but lacks slightly in ${lowest.name}.`;
      }
    }
    return `The candidate showed a balanced performance across all evaluated areas.`;
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
                  onClick={() => {
                    setSelectedInterviewForDetails(interview);
                    setDetailsModalOpen(true);
                  }}
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
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInterviewForDetails(interview);
                        setDetailsModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
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
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedInterviewForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetailsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 m-0">Interview Details</h3>
                <p className="text-sm text-gray-500 m-0 mt-1">
                  Candidate: <span className="font-semibold text-gray-700">{selectedInterviewForDetails.candidateId?.fullName || "Unknown"}</span> • Role: <span className="font-semibold text-gray-700">{selectedInterviewForDetails.roleName || "General"}</span>
                </p>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              <div className="mb-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-2">
                  AI Feedback Summary
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedInterviewForDetails.aiFeedback?.summary || "No summary available."}
                </p>

                {getDisplayCategoryScores(selectedInterviewForDetails) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Category Performance</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {Object.entries(getDisplayCategoryScores(selectedInterviewForDetails)).map(([cat, score]) => (
                        <div key={cat} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 truncate">{cat}</p>
                          <p className={`text-lg font-extrabold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {score}<span className="text-xs text-gray-400 font-medium">/100</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    {getDisplayCategoryInterpretation(selectedInterviewForDetails, getDisplayCategoryScores(selectedInterviewForDetails)) && (
                      <p className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg font-medium border border-indigo-100 leading-relaxed">
                        💡 {getDisplayCategoryInterpretation(selectedInterviewForDetails, getDisplayCategoryScores(selectedInterviewForDetails))}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <h4 className="text-[0.7rem] font-bold text-gray-400 mb-3 uppercase tracking-widest px-1">
                Per-Question Breakdown ({selectedInterviewForDetails.answers?.length || 0} questions)
              </h4>
              <div className="flex flex-col gap-4">
                {selectedInterviewForDetails.answers?.map((answer, idx) => {
                  const displayCat = getDisplayCategory(answer);
                  return (
                  <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm transition-all hover:border-blue-200">
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <p className="font-bold text-gray-800 text-sm flex-1 leading-snug">
                        {displayCat && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest rounded-md font-bold mr-2 mb-1 align-bottom">
                            {displayCat}
                          </span>
                        )}
                        Q{idx + 1}: {answer.questionText}
                      </p>
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-[0.7rem] shrink-0 ${getScoreColor(answer.score)}`}>
                        {answer.score}/100
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                      <p className="text-[0.8rem] text-gray-600 leading-relaxed italic m-0">
                        <strong className="text-gray-500 not-italic mr-2">Candidate said:</strong> 
                        {answer.candidateAnswer || <em className="text-gray-300">No answer</em>}
                      </p>
                    </div>
                    <p className="text-[0.8rem] text-gray-700 leading-relaxed m-0">
                      <strong className="text-gray-900 mr-2">Feedback:</strong> {answer.feedback}
                    </p>
                  </div>
                )})}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100 shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Interview Record</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this interview record? This action cannot be undone and will permanently remove the scores and AI feedback.
            </p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default AdminInterviewScores;
