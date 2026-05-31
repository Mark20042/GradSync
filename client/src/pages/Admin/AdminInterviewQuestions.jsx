import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { CheckCircle, Eye, AlertCircle, RefreshCw, Plus, Users, Search, Target, X, Trash2, Edit3, Save } from "lucide-react";
import toast from "react-hot-toast";

const AdminInterviewQuestions = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInterview, setModalInterview] = useState(null);
  
  // Edit state
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({ questionText: "", idealAnswer: "", category: "" });

  // Add state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [addForm, setAddForm] = useState({ questionText: "", idealAnswer: "", category: "Technical" });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/users");
      const filtered = res.data.filter(u => u.role === "jobseeker" || u.role === "graduate");
      setCandidates(filtered);
    } catch (error) {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewsForCandidate = async (candidateId) => {
    setLoadingInterviews(true);
    try {
      const res = await axiosInstance.get(`/api/generation/interviews/candidate/${candidateId}`);
      setInterviews(res.data || []);
    } catch (error) {
      toast.error("Failed to load candidate interviews");
    } finally {
      setLoadingInterviews(false);
    }
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    fetchInterviewsForCandidate(candidate._id);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await axiosInstance.post("/api/generation/interviews/generate", {
        candidateId: selectedCandidate._id
      });
      toast.success("Interview generation started / completed!");
      fetchInterviewsForCandidate(selectedCandidate._id);
    } catch (error) {
      toast.error("Failed to generate interview");
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/api/generation/interviews/${id}/approve`);
      toast.success("Interview approved and now visible to candidate!");
      fetchInterviewsForCandidate(selectedCandidate._id);
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  const handleDeleteInterview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entire interview draft?")) return;
    try {
      await axiosInstance.delete(`/api/generation/interviews/${id}`);
      toast.success("Interview draft deleted");
      fetchInterviewsForCandidate(selectedCandidate._id);
      if (modalInterview?._id === id) setModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete interview");
    }
  };

  const handleDeleteQuestion = async (interviewId, questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axiosInstance.delete(`/api/generation/interviews/${interviewId}/questions/${questionId}`);
      toast.success("Question deleted");
      // Update modal data in-place
      setModalInterview(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q._id !== questionId)
      }));
      fetchInterviewsForCandidate(selectedCandidate._id);
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const startEditing = (q) => {
    setEditingQuestion(q._id);
    setEditForm({ questionText: q.questionText, idealAnswer: q.idealAnswer, category: q.category });
  };

  const handleSaveEdit = async (interviewId, questionId) => {
    try {
      await axiosInstance.put(`/api/generation/interviews/${interviewId}/questions/${questionId}`, editForm);
      toast.success("Question updated");
      setEditingQuestion(null);
      // Update in-place
      setModalInterview(prev => ({
        ...prev,
        questions: prev.questions.map(q => q._id === questionId ? { ...q, ...editForm } : q)
      }));
      fetchInterviewsForCandidate(selectedCandidate._id);
    } catch (error) {
      toast.error("Failed to update question");
    }
  };

  const handleAddQuestion = async (interviewId) => {
    if (!addForm.questionText || !addForm.idealAnswer) {
      toast.error("Please fill in both question and answer");
      return;
    }
    
    try {
      const res = await axiosInstance.post(`/api/generation/interviews/${interviewId}/questions`, addForm);
      toast.success("Question added successfully");
      setIsAddingQuestion(false);
      setAddForm({ questionText: "", idealAnswer: "", category: "Technical" });
      
      // Update in-place
      setModalInterview(prev => ({
        ...prev,
        questions: [...prev.questions, res.data.question]
      }));
      fetchInterviewsForCandidate(selectedCandidate._id);
    } catch (error) {
      toast.error("Failed to add question");
    }
  };

  const openModal = (interview) => {
    setModalInterview(interview);
    setModalOpen(true);
    setEditingQuestion(null);
    setIsAddingQuestion(false);
  };

  const filteredCandidates = candidates.filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryColors = {
    Technical: "bg-blue-100 text-blue-800",
    Behavioral: "bg-green-100 text-green-800",
    Communication: "bg-yellow-100 text-yellow-800",
    General: "bg-gray-100 text-gray-700",
  };

  return (
    <DashboardLayout activeMenu="admin-interview-questions">
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Interviews</h1>
          <p className="text-gray-500 mt-2">Manage, edit, and generate tailored AI interview questions per candidate.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidates List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <p className="p-4 text-center text-gray-500">Loading candidates...</p>
              ) : filteredCandidates.map(c => (
                <button
                  key={c._id}
                  onClick={() => handleSelectCandidate(c)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all ${selectedCandidate?._id === c._id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50 border border-transparent'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-3 shrink-0">
                    {c.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Management */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-[calc(100vh-200px)]">
            {!selectedCandidate ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Users className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg">Select a candidate to manage their interviews</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.fullName}'s Interviews</h2>
                    <p className="text-gray-500 mt-1">Review, edit, approve, or generate new interview drafts.</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                        onClick={() => fetchInterviewsForCandidate(selectedCandidate._id)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all mr-2"
                        title="Refresh Interviews"
                    >
                        <RefreshCw className={`w-4 h-4 ${loadingInterviews ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                    >
                        {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Generate Tailored Interview
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {loadingInterviews ? (
                    <p className="text-center text-gray-500 mt-10">Loading interviews...</p>
                  ) : interviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 mb-2">No generated interview drafts found.</p>
                      <p className="text-sm text-gray-400">Click generate to create one based on their profile and job preferences.</p>
                    </div>
                  ) : (
                    interviews.map(a => (
                      <div key={a._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-gray-900">Tailored AI Interview</h3>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{a.questions?.length || 0} questions generated • Tailored to profile</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {a.status === 'generating' ? (
                                <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-700 flex items-center gap-2">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> GENERATING
                                </span>
                            ) : (
                                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${a.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {a.status}
                                </span>
                            )}
                            <div className="flex gap-2">
                              {a.status === 'pending review' && (
                                  <button 
                                      onClick={() => handleApprove(a._id)}
                                      className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg font-medium transition-all shadow-sm"
                                  >
                                      Approve
                                  </button>
                              )}
                              {a.status !== 'generating' && (
                                <button 
                                    onClick={() => openModal(a)}
                                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-1"
                                >
                                    <Eye className="w-3.5 h-3.5" /> View / Edit
                                </button>
                              )}
                              <button 
                                  onClick={() => handleDeleteInterview(a._id)}
                                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-all shadow-sm"
                              >
                                  <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interview Questions Modal */}
      {modalOpen && modalInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setModalOpen(false); setEditingQuestion(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Interview Questions</h2>
                <p className="text-sm text-gray-500 mt-1">{modalInterview.questions?.length || 0} questions • Status: <span className="font-semibold">{modalInterview.status}</span></p>
              </div>
              <button onClick={() => { setModalOpen(false); setEditingQuestion(null); setIsAddingQuestion(false); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white">
              <button
                onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                {isAddingQuestion ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isAddingQuestion ? 'Cancel Adding' : 'Add New Question'}
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isAddingQuestion && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm mb-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Add New Question</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Question</label>
                      <textarea
                        value={addForm.questionText}
                        onChange={e => setAddForm(prev => ({ ...prev, questionText: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Ideal Answer</label>
                      <textarea
                        value={addForm.idealAnswer}
                        onChange={e => setAddForm(prev => ({ ...prev, idealAnswer: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                      <select
                        value={addForm.category}
                        onChange={e => setAddForm(prev => ({ ...prev, category: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Behavioral">Behavioral</option>
                        <option value="Communication">Communication</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="pt-2">
                      <button 
                        onClick={() => handleAddQuestion(modalInterview._id)} 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      >
                        Save Question
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {modalInterview.questions?.map((q, idx) => (
                <div key={q._id || idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-200 transition-colors">
                  {editingQuestion === q._id ? (
                    // Editing mode
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Question</label>
                        <textarea
                          value={editForm.questionText}
                          onChange={e => setEditForm(prev => ({ ...prev, questionText: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Ideal Answer</label>
                        <textarea
                          value={editForm.idealAnswer}
                          onChange={e => setEditForm(prev => ({ ...prev, idealAnswer: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                        <select
                          value={editForm.category}
                          onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Technical">Technical</option>
                          <option value="Behavioral">Behavioral</option>
                          <option value="Communication">Communication</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(modalInterview._id, q._id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button onClick={() => setEditingQuestion(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          <span className="text-purple-600 mr-1">Q{idx + 1}.</span>
                          {q.questionText}
                        </p>
                        <div className="mt-2 bg-white border border-gray-100 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Ideal Answer</p>
                          <p className="text-sm text-gray-700">{q.idealAnswer}</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${categoryColors[q.category] || "bg-gray-100 text-gray-600"}`}>{q.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button 
                          onClick={() => startEditing(q)}
                          className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(modalInterview._id, q._id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(!modalInterview.questions || modalInterview.questions.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <p>No questions in this interview draft.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default AdminInterviewQuestions;
