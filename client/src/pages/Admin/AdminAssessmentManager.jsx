import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { CheckCircle, Eye, AlertCircle, RefreshCw, Plus, Users, Search, Target, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminAssessmentManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [viewingAssessment, setViewingAssessment] = useState(null);
  const pollIntervalRef = React.useRef(null);

  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const autoGenIntervalRef = React.useRef(null);

  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [addForm, setAddForm] = useState({
    questionText: "",
    correctAnswer: "",
    category: "General",
    type: "identification",
    explanation: "",
    options: "" // comma separated for now
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/candidates");
      setCandidates(res.data);
    } catch (error) {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentsForCandidate = async (candidateId) => {
    setLoadingAssessments(true);
    try {
      const res = await axiosInstance.get(`/api/generation/assessments/candidate/${candidateId}`);
      setAssessments(res.data || []);
    } catch (error) {
      toast.error("Failed to load candidate assessments");
    } finally {
      setLoadingAssessments(false);
    }
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    fetchAssessmentsForCandidate(candidate._id);
  };

  const handleCancelGeneration = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setGenerating(false);
    setGenerateProgress("");
    toast.success("Generation polling stopped.");
  };

  const handleGenerate = async () => {
    let rawSkills = [...(selectedCandidate.verifiedSkills || []), ...(selectedCandidate.skills || [])];
    let allSkills = Array.from(new Set(rawSkills.map(s => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : s).filter(s => s && s.trim() !== "")));

    if (allSkills.length === 0) {
      return toast.error("Candidate has no skills listed.");
    }

    setGenerating(true);
    try {
      if (selectedSkill === "all") {
        // Use the new batch endpoint — backend processes skills sequentially
        setGenerateProgress(`Starting generation for all ${allSkills.length} skills...`);
        await axiosInstance.post("/api/generation/assessments/generate-all", {
          candidateId: selectedCandidate._id
        });
        toast.success(`Generation started for ${allSkills.length} skills! They will process one by one. Click refresh to check progress.`);
      } else {
        // Single skill generation
        setGenerateProgress(`Generating for ${selectedSkill}...`);
        await axiosInstance.post("/api/generation/assessments/generate", {
          candidateId: selectedCandidate._id,
          skill: selectedSkill
        });
        toast.success(`Generation started for ${selectedSkill}!`);
      }
      fetchAssessmentsForCandidate(selectedCandidate._id);

      // Start auto-polling to track progress
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await axiosInstance.get(`/api/generation/assessments/candidate/${selectedCandidate._id}`);
          setAssessments(res.data || []);
          const stillGenerating = (res.data || []).some(a => a.status === 'generating');
          if (!stillGenerating) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setGenerating(false);
            setGenerateProgress("");
            toast.success("All assessments finished generating!");
          } else {
            const done = (res.data || []).filter(a => a.status !== 'generating').length;
            const total = (res.data || []).length;
            setGenerateProgress(`Processing... ${done}/${total} skills complete`);
          }
        } catch (_) { }
      }, 10000); // Poll every 10 seconds

    } catch (error) {
      toast.error("Failed to start assessment generation.");
      setGenerating(false);
      setGenerateProgress("");
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (isAutoGenerating) {
      const pollLogic = async () => {
        try {
          // Fetch fresh candidates
          const res = await axiosInstance.get("/api/admin/candidates");
          setCandidates(res.data);

          // Check if anyone is generating right now
          const anyGenerating = res.data.some(c => c.isGenerating);
          if (anyGenerating) {
            return; // Wait for them to finish
          }

          // Find first candidate with missing skills
          const candidateToGen = filtered.find(c => {
            let rawSkills = [...(c.verifiedSkills || []), ...(c.skills || [])];
            let uniqueSkills = Array.from(new Set(rawSkills.map(s => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : s).filter(s => s && s.trim() !== "")));
            const generatedSkillsData = c.generatedSkills || [];
            const missingSkills = uniqueSkills.filter(s => !generatedSkillsData.some(gs => gs.skill.toLowerCase() === s.toLowerCase()));
            return missingSkills.length > 0;
          });

          if (candidateToGen) {
            toast.loading(`Auto-generating for ${candidateToGen.fullName}...`, { id: 'autogen', duration: 3000 });
            await axiosInstance.post("/api/generation/assessments/generate-missing", {
              candidateId: candidateToGen._id
            });
            // Optimistic update
            setCandidates(prev => prev.map(c => c._id === candidateToGen._id ? { ...c, isGenerating: true } : c));
            if (selectedCandidate?._id === candidateToGen._id) {
              fetchAssessmentsForCandidate(candidateToGen._id);
            }
          } else {
            toast.success("Auto-generation complete for all candidates!", { id: 'autogen' });
            setIsAutoGenerating(false);
          }
        } catch (error) {
          console.error("Auto-gen error:", error);
        }
      };

      // Run immediately on start
      pollLogic();

      // Then set interval
      autoGenIntervalRef.current = setInterval(pollLogic, 10000); // Check every 10 seconds
    } else {
      if (autoGenIntervalRef.current) clearInterval(autoGenIntervalRef.current);
    }
    return () => {
      if (autoGenIntervalRef.current) clearInterval(autoGenIntervalRef.current);
    };
  }, [isAutoGenerating, selectedCandidate]);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/api/generation/assessments/${id}/approve`);
      toast.success("Assessment approved and now visible to candidate!");
      fetchAssessmentsForCandidate(selectedCandidate._id);
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entire assessment? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/generation/assessments/${id}`);
      toast.success("Assessment deleted successfully!");
      if (viewingAssessment?._id === id) setViewingAssessment(null);
      fetchAssessmentsForCandidate(selectedCandidate._id);
    } catch (error) {
      toast.error("Failed to delete assessment");
    }
  };

  const handleDeleteQuestion = async (assessmentId, questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axiosInstance.delete(`/api/generation/assessments/${assessmentId}/questions/${questionId}`);
      toast.success("Question deleted");

      // Update local state for modal
      if (viewingAssessment && viewingAssessment._id === assessmentId) {
        setViewingAssessment(prev => ({
          ...prev,
          questions: prev.questions.filter(q => q._id !== questionId)
        }));
      }
      fetchAssessmentsForCandidate(selectedCandidate._id);
    } catch (err) {
      toast.error("Failed to delete question");
    }
  };

  const handleAddQuestion = async (assessmentId) => {
    if (!addForm.questionText || !addForm.correctAnswer) {
      toast.error("Please fill in both question and correct answer");
      return;
    }

    try {
      let payload = { ...addForm };
      if (addForm.type === 'multiple-choice' && addForm.options) {
        payload.options = addForm.options.split(',').map(o => o.trim());
      } else {
        payload.options = [];
      }

      const res = await axiosInstance.post(`/api/generation/assessments/${assessmentId}/questions`, payload);
      toast.success("Question added successfully");
      setIsAddingQuestion(false);
      setAddForm({ questionText: "", correctAnswer: "", category: "General", type: "identification", explanation: "", options: "" });

      // Update in-place
      setViewingAssessment(prev => ({
        ...prev,
        questions: [...prev.questions, res.data.question]
      }));
      fetchAssessmentsForCandidate(selectedCandidate._id);
    } catch (error) {
      toast.error("Failed to add question");
    }
  };



  const filteredCandidates = candidates.filter(c =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout activeMenu="admin-assessments">
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Assessments</h1>
          <p className="text-gray-500 mt-2">Manage and generate tailored AI assessments per candidate.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidates List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
              <button
                onClick={() => setIsAutoGenerating(!isAutoGenerating)}
                className={`w-full py-2 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${isAutoGenerating
                    ? "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 shadow-inner"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                  }`}
              >
                {isAutoGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Stop Auto-Generation
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Auto-Generate Missing
                  </>
                )}
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <p className="p-4 text-center text-gray-500">Loading candidates...</p>
              ) : filteredCandidates.map(c => {
                let rawSkills = [...(c.verifiedSkills || []), ...(c.skills || [])];
                let uniqueSkills = Array.from(new Set(rawSkills.map(s => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : s).filter(s => s && s.trim() !== "")));
                const generatedSkillsData = c.generatedSkills || [];

                const completedSkillsCount = uniqueSkills.filter(s => generatedSkillsData.some(gs => gs.skill.toLowerCase() === s.toLowerCase() && gs.status !== 'generating')).length;
                const pendingReviewCount = generatedSkillsData.filter(gs => gs.status === 'pending review').length;
                const generatingSkills = uniqueSkills.filter(s => generatedSkillsData.some(gs => gs.skill.toLowerCase() === s.toLowerCase() && gs.status === 'generating'));
                const missingSkills = uniqueSkills.filter(s => !generatedSkillsData.some(gs => gs.skill.toLowerCase() === s.toLowerCase()));

                const hasNewSkill = missingSkills.length > 0;

                let completionPercentage = 0;
                if (uniqueSkills.length > 0) {
                  completionPercentage = Math.round((completedSkillsCount / uniqueSkills.length) * 100);
                } else {
                  completionPercentage = 100; // no skills = fully covered
                }

                return (
                  <button
                    key={c._id}
                    onClick={() => handleSelectCandidate(c)}
                    className={`w-full flex items-center p-3 rounded-xl transition-all ${selectedCandidate?._id === c._id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shrink-0 relative">
                      {c.fullName?.charAt(0) || 'U'}
                      {hasNewSkill && !c.isGenerating && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" title="New skill added"></span>
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate flex items-center gap-2">
                        {c.fullName}
                        {c.isGenerating && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        )}
                      </p>
                      <div className="flex justify-between items-center mt-0.5 mb-1">
                        <p className="text-xs text-gray-500 truncate">{c.email}</p>
                        <div className="flex items-center gap-1">
                          {pendingReviewCount > 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-full shrink-0" title={`${pendingReviewCount} assessments pending review`}>
                              {pendingReviewCount} Pending
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-full shrink-0">
                            {completionPercentage}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div className={`h-1.5 rounded-full ${completionPercentage === 100 ? 'bg-green-500' : completionPercentage > 50 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${completionPercentage}%` }}></div>
                      </div>

                      {generatingSkills.length > 0 && (
                        <p className="text-[10px] text-blue-600 font-semibold mt-1 animate-pulse truncate" title={`Generating: ${generatingSkills.join(", ")}`}>
                          <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                          Generating: {generatingSkills.join(", ")}
                        </p>
                      )}

                      {hasNewSkill && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1 animate-pulse truncate" title={`Missing: ${missingSkills.join(", ")}`}>
                          Missing: {missingSkills.join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Assessment Management */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-[calc(100vh-200px)]">
            {!selectedCandidate ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Users className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg">Select a candidate to manage their assessments</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.fullName}'s Assessments</h2>
                    <p className="text-gray-500 mt-1">Review, approve, or generate new assessments.</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => fetchAssessmentsForCandidate(selectedCandidate._id)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all mr-2"
                      title="Refresh Assessments"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingAssessments ? 'animate-spin' : ''}`} />
                    </button>
                    {generating && <span className="text-sm text-blue-600 font-medium">{generateProgress}</span>}
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">Generate for All Skills</option>
                      {Array.from(new Set([...(selectedCandidate.verifiedSkills || []), ...(selectedCandidate.skills || [])]
                        .map(s => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : s)
                        .filter(s => s && s.trim() !== "")))
                        .map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                    </select>
                    {generating ? (
                      <button
                        onClick={handleCancelGeneration}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Stop Polling
                      </button>
                    ) : (
                      <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {selectedSkill === 'all' ? 'Generate All' : 'Generate Selected'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {loadingAssessments ? (
                    <p className="text-center text-gray-500 mt-10">Loading assessments...</p>
                  ) : assessments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 mb-2">No generated assessments found.</p>
                      <p className="text-sm text-gray-400">Select a skill above and click generate.</p>
                    </div>
                  ) : (
                    assessments.map(a => (
                      <div key={a._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-gray-900">{a.title}</h3>
                              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-semibold uppercase">{a.skill}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{a.questions?.length || 0} questions generated</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${a.status === 'approved' ? 'bg-green-100 text-green-700' :
                                a.status === 'generating' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                  'bg-orange-100 text-orange-700'
                              }`}>
                              {a.status}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons & Status */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-between items-center">
                          <div className="flex gap-2">
                            {a.questions && a.questions.length > 0 && (
                              <button
                                onClick={() => setViewingAssessment(a)}
                                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg font-medium transition-all"
                              >
                                View Questions ({a.questions.length})
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAssessment(a._id)}
                              className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg font-medium transition-all"
                            >
                              Delete
                            </button>
                          </div>

                          <div className="flex gap-2 items-center">
                            {a.status === 'pending review' && (
                              <button
                                onClick={() => handleApprove(a._id)}
                                className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg font-medium transition-all shadow-sm"
                              >
                                Approve Assessment
                              </button>
                            )}
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

        {/* View Questions Modal */}
        {viewingAssessment && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 md:p-8" onClick={() => setViewingAssessment(null)}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-full flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{viewingAssessment.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">{viewingAssessment.questions.length} questions available</p>
                </div>
                <button onClick={() => { setViewingAssessment(null); setIsAddingQuestion(false); }} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-b border-gray-100 bg-white">
                <button
                  onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                >
                  {isAddingQuestion ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isAddingQuestion ? 'Cancel Adding' : 'Add New Question'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isAddingQuestion && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm mb-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Add New Question</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Question</label>
                        <textarea
                          value={addForm.questionText}
                          onChange={e => setAddForm(prev => ({ ...prev, questionText: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Type</label>
                          <select
                            value={addForm.type}
                            onChange={e => setAddForm(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="identification">Identification</option>
                            <option value="true-false">True/False</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                          <input
                            type="text"
                            value={addForm.category}
                            onChange={e => setAddForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. General"
                          />
                        </div>
                      </div>
                      {addForm.type === 'multiple-choice' && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Options (comma separated)</label>
                          <input
                            type="text"
                            value={addForm.options}
                            onChange={e => setAddForm(prev => ({ ...prev, options: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Option A, Option B, Option C, Option D"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Correct Answer</label>
                        <input
                          type="text"
                          value={addForm.correctAnswer}
                          onChange={e => setAddForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Explanation (Optional)</label>
                        <textarea
                          value={addForm.explanation}
                          onChange={e => setAddForm(prev => ({ ...prev, explanation: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                          rows={2}
                        />
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => handleAddQuestion(viewingAssessment._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          Save Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {viewingAssessment.questions.map((q, idx) => (
                  <div key={q._id || idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{q.category}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider">{q.type}</span>
                        </div>
                        <p className="text-base font-semibold text-gray-900"><span className="text-blue-600 mr-2">Q{idx + 1}.</span>{q.questionText}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(viewingAssessment._id, q._id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all shrink-0"
                        title="Delete Question"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>

                    {q.codeSnippet && (
                      <div className="mb-4 bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono overflow-x-auto">
                        <pre><code>{q.codeSnippet}</code></pre>
                      </div>
                    )}

                    {q.options && q.options.length > 0 && q.type !== 'identification' && (
                      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-3 rounded-lg border ${opt === q.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} text-sm`}>
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                      <p className="text-sm"><span className="font-bold text-gray-900 mr-2">Correct Answer:</span> <span className="text-green-700 font-semibold">{q.correctAnswer}</span></p>
                      {q.explanation && (
                        <p className="text-sm mt-2 text-gray-600"><span className="font-bold text-gray-900 mr-2">Explanation:</span> {q.explanation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAssessmentManager;
