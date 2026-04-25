import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  Code,
  Image as ImageIcon,
  AlertCircle,
  Users,
  Search,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import DashboardLayout from "../../components/layout/DashboardLayout";
import toast from "react-hot-toast";

const AdminAssessmentManager = () => {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVerifiedUsersModalOpen, setIsVerifiedUsersModalOpen] =
    useState(false);

  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [newAssessment, setNewAssessment] = useState({
    skill: "",
    title: "",
    difficulty: "Entry",
    timeLimit: 15,
    passingScore: 80,
  });

  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    codeSnippet: "",
    imageUrl: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await axiosInstance.get("/api/assessments");
      setAssessments(res.data);
    } catch (error) {
      toast.error("Failed to fetch assessments");
      console.error(error);
    }
  };

  const handleCreateAssessment = async () => {
    if (!newAssessment.skill || !newAssessment.title) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/api/assessments", newAssessment);
      toast.success("Assessment created successfully!");
      setIsCreateModalOpen(false);
      setNewAssessment({ 
        skill: "", 
        title: "", 
        difficulty: "Entry",
        timeLimit: 15,
        passingScore: 80 
      });
      fetchAssessments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create assessment",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssessment = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(
        `/api/assessments/${selectedAssessment._id}`,
        selectedAssessment,
      );
      toast.success("Assessment updated successfully!");
      setIsEditModalOpen(false);
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to update assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment?"))
      return;

    try {
      await axiosInstance.delete(`/api/assessments/${id}`);
      toast.success("Assessment deleted");
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to delete assessment");
    }
  };

  const handleViewVerifiedUsers = async (assessment) => {
    setSelectedAssessment(assessment);
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/assessments/${assessment.skill}/users`,
      );
      setVerifiedUsers(res.data);
      setIsVerifiedUsersModalOpen(true);
    } catch (error) {
      toast.error("Failed to fetch verified users");
    } finally {
      setLoading(false);
    }
  };

  const handleUnverifyUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to unverify this user? They will lose their badge.",
      )
    )
      return;

    try {
      await axiosInstance.delete(
        `/api/assessments/${selectedAssessment.skill}/users/${userId}`,
      );
      toast.success("User unverified successfully");
      handleViewVerifiedUsers(selectedAssessment);
    } catch (error) {
      toast.error("Failed to unverify user");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText || !newQuestion.correctAnswer) {
      toast.error("Please fill required question fields");
      return;
    }

    const validOptions = newQuestion.options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(
        `/api/assessments/${selectedAssessment._id}/questions`,
        {
          ...newQuestion,
          options: validOptions,
        },
      );
      toast.success("Question added!");
      setNewQuestion({
        questionText: "",
        codeSnippet: "",
        imageUrl: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      });
      setIsQuestionModalOpen(false);
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (assessmentId, questionId) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await axiosInstance.delete(
        `/api/assessments/${assessmentId}/questions/${questionId}`,
      );
      toast.success("Question deleted");
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const handleOpenEditQuestion = (assessment, question) => {
    setSelectedAssessment(assessment);
    setEditingQuestion({
      ...question,
      options:
        question.options?.length >= 4
          ? question.options
          : [
              ...(question.options || []),
              ...Array(4 - (question.options?.length || 0)).fill(""),
            ],
    });
    setIsEditQuestionModalOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion.questionText || !editingQuestion.correctAnswer) {
      toast.error("Please fill required question fields");
      return;
    }

    const validOptions = editingQuestion.options.filter(
      (opt) => opt.trim() !== "",
    );
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(
        `/api/assessments/${selectedAssessment._id}/questions/${editingQuestion._id}`,
        {
          questionText: editingQuestion.questionText,
          codeSnippet: editingQuestion.codeSnippet || "",
          imageUrl: editingQuestion.imageUrl || "",
          options: validOptions,
          correctAnswer: editingQuestion.correctAnswer,
          explanation: editingQuestion.explanation || "",
        },
      );
      toast.success("Question updated successfully!");
      setIsEditQuestionModalOpen(false);
      setEditingQuestion(null);
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to update question");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyStyles = (diff) => {
    switch (diff) {
      case "Entry": return "bg-emerald-100 text-emerald-800";
      case "Mid": return "bg-blue-100 text-blue-800";
      case "Senior": return "bg-indigo-100 text-indigo-800";
      case "Expert": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout activeMenu="admin-assessments">
      <div className="min-h-screen bg-gray-100 p-10">
        <div className="flex justify-between items-end mb-12 bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 tracking-tight m-0">
              Assessment Manager
            </h1>
            <p className="text-gray-500 mt-2 text-base">
              Create, manage, and track skill assessments for your candidates.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 shadow-[0_4px_6px_-1px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            <Plus size={20} />
            Create Assessment
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
          {assessments.map((assessment) => (
            <div key={assessment._id} className="bg-white rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-blue-200 border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-6 bg-gradient-to-br from-white to-slate-50 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center justify-between m-0">
                    {assessment.title}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Edit Settings"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAssessment(assessment._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete Assessment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <span className="text-[0.7rem] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                    {assessment.skill}
                  </span>
                  <span className={`text-[0.7rem] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getDifficultyStyles(assessment.difficulty)}`}>
                    {assessment.difficulty}
                  </span>
                </div>

                <div className="flex gap-4 mt-4 text-gray-500 text-sm font-medium">
                  <div className="flex items-center gap-1.5" title="Time Limit">
                    <span>⏱️</span> {assessment.timeLimit || 15}m
                  </div>
                  <div className="flex items-center gap-1.5" title="Passing Score">
                    <span>🎯</span> {assessment.passingScore || 80}%
                  </div>
                  <div className="flex items-center gap-1.5" title="Questions">
                    <span>📝</span> {assessment.questions?.length || 0}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1">
                <h4 className="text-[0.7rem] font-bold text-gray-400 mb-3 uppercase tracking-widest">
                  Questions Preview
                </h4>

                {!assessment.questions || assessment.questions.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm">No questions yet</p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
                    {assessment.questions.map((q, idx) => (
                      <div key={q._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-600 flex items-center justify-between hover:border-slate-300 hover:bg-white transition-all">
                        <span className="truncate max-w-[200px]">
                          {idx + 1}. {q.questionText}
                        </span>
                        <button
                          onClick={() => handleOpenEditQuestion(assessment, q)}
                          className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedAssessment(assessment);
                    setIsQuestionModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <Plus size={16} /> Add Qs
                </button>
                <button
                  onClick={() => handleViewVerifiedUsers(assessment)}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <Users size={16} /> Takers
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Assessment Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5" onClick={() => setIsCreateModalOpen(false)}>
            <div className="bg-white rounded-2xl p-8 max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 m-0">Create New Assessment</h2>

              <label className="block font-semibold text-gray-700 mb-2">Skill Name *</label>
              <input
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                placeholder="e.g., JavaScript, React, Python"
                value={newAssessment.skill}
                onChange={(e) => setNewAssessment({ ...newAssessment, skill: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">Assessment Title *</label>
              <input
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                placeholder="e.g., JavaScript Fundamentals"
                value={newAssessment.title}
                onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">Difficulty *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500 bg-white"
                value={newAssessment.difficulty}
                onChange={(e) => setNewAssessment({ ...newAssessment, difficulty: e.target.value })}
              >
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Expert">Expert</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                    min="1"
                    max="180"
                    placeholder="15"
                    value={newAssessment.timeLimit}
                    onChange={(e) => setNewAssessment({ ...newAssessment, timeLimit: parseInt(e.target.value) || 15 })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                    min="1"
                    max="100"
                    placeholder="80"
                    value={newAssessment.passingScore}
                    onChange={(e) => setNewAssessment({ ...newAssessment, passingScore: parseInt(e.target.value) || 80 })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateAssessment}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:bg-gray-300"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Assessment Modal */}
        {isEditModalOpen && selectedAssessment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5" onClick={() => setIsEditModalOpen(false)}>
            <div className="bg-white rounded-2xl p-8 max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 m-0">Edit Assessment</h2>

              <label className="block font-semibold text-gray-700 mb-2">Skill Name</label>
              <input
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                value={selectedAssessment.skill}
                onChange={(e) => setSelectedAssessment({ ...selectedAssessment, skill: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">Assessment Title</label>
              <input
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                value={selectedAssessment.title}
                onChange={(e) => setSelectedAssessment({ ...selectedAssessment, title: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500 bg-white"
                value={selectedAssessment.difficulty}
                onChange={(e) => setSelectedAssessment({ ...selectedAssessment, difficulty: e.target.value })}
              >
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Expert">Expert</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                    min="1"
                    max="180"
                    placeholder="15"
                    value={selectedAssessment.timeLimit || 15}
                    onChange={(e) => setSelectedAssessment({ ...selectedAssessment, timeLimit: parseInt(e.target.value) || 15 })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                    min="1"
                    max="100"
                    placeholder="80"
                    value={selectedAssessment.passingScore || 80}
                    onChange={(e) => setSelectedAssessment({ ...selectedAssessment, passingScore: parseInt(e.target.value) || 80 })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateAssessment}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? "Updating..." : "Update"}
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:bg-gray-300"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Question Modal */}
        {isQuestionModalOpen && selectedAssessment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5" onClick={() => setIsQuestionModalOpen(false)}>
            <div className="bg-white rounded-2xl p-8 max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 m-0">Add Question</h2>
              <p className="text-gray-500 mb-8 font-medium">to {selectedAssessment.title}</p>

              <label className="block font-semibold text-gray-700 mb-2">Question Text *</label>
              <textarea
                rows={3}
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                placeholder="Enter your question here..."
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">
                <Code size={16} className="inline mr-1" />
                Code Snippet (Optional)
              </label>
              <textarea
                rows={5}
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500 font-mono text-sm"
                placeholder="Paste code here..."
                value={newQuestion.codeSnippet}
                onChange={(e) => setNewQuestion({ ...newQuestion, codeSnippet: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">
                <ImageIcon size={16} className="inline mr-1" />
                Image URL (Optional)
              </label>
              <input
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/image.png"
                value={newQuestion.imageUrl}
                onChange={(e) => setNewQuestion({ ...newQuestion, imageUrl: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">Answer Options *</label>
              <div className="grid gap-2 mb-4">
                {newQuestion.options.map((option, index) => (
                  <input
                    key={index}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options];
                      newOptions[index] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: newOptions });
                    }}
                  />
                ))}
              </div>

              <label className="block font-semibold text-gray-700 mb-2">Correct Answer *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500 bg-white"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
              >
                <option value="">Select correct answer</option>
                {newQuestion.options.map((opt, i) => opt && (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>

              <label className="block font-semibold text-gray-700 mb-2">Explanation (Optional)</label>
              <textarea
                rows={3}
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                placeholder="Explain why this is the correct answer..."
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddQuestion}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  Save Question
                </button>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:bg-gray-300"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Question Modal */}
        {isEditQuestionModalOpen && editingQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5" onClick={() => setIsEditQuestionModalOpen(false)}>
            <div className="bg-white rounded-2xl p-8 max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 m-0">Edit Question</h2>
              <p className="text-gray-500 mb-8 font-medium">in {selectedAssessment?.title}</p>

              <label className="block font-semibold text-gray-700 mb-2">Question Text *</label>
              <textarea
                rows={3}
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                placeholder="Enter your question here..."
                value={editingQuestion.questionText}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">
                <Code size={16} className="inline mr-1" />
                Code Snippet (Optional)
              </label>
              <textarea
                rows={5}
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500 font-mono text-sm"
                placeholder="Paste code here..."
                value={editingQuestion.codeSnippet || ""}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, codeSnippet: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">
                <ImageIcon size={16} className="inline mr-1" />
                Image URL (Optional)
              </label>
              <input
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/image.png"
                value={editingQuestion.imageUrl || ""}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
              />

              <label className="block font-semibold text-gray-700 mb-2">Answer Options *</label>
              <div className="grid gap-2 mb-4">
                {editingQuestion.options?.map((option, index) => (
                  <input
                    key={index}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editingQuestion.options];
                      newOptions[index] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, options: newOptions });
                    }}
                  />
                ))}
              </div>

              <label className="block font-semibold text-gray-700 mb-2">Correct Answer *</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500 bg-white"
                value={editingQuestion.correctAnswer}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
              >
                <option value="">Select correct answer</option>
                {editingQuestion.options?.map((opt, i) => opt && (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>

              <label className="block font-semibold text-gray-700 mb-2">Explanation (Optional)</label>
              <textarea
                rows={3}
                className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                placeholder="Explain why this is the correct answer..."
                value={editingQuestion.explanation || ""}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateQuestion}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  Update Question
                </button>
                <button
                  onClick={() => setIsEditQuestionModalOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:bg-gray-300"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verified Users Modal */}
        {isVerifiedUsersModalOpen && selectedAssessment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5" onClick={() => setIsVerifiedUsersModalOpen(false)}>
            <div className="bg-white rounded-2xl p-8 max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Verified Users - {selectedAssessment.title}
                  <span className="text-base font-normal text-gray-400 ml-3">({verifiedUsers.length})</span>
                </h2>
                <button
                  onClick={() => setIsVerifiedUsersModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={20} />
                </div>
                <input
                  className="w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl text-sm transition-all focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {verifiedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Users size={48} className="mb-4 opacity-50" />
                  <p className="text-lg">No certified talent yet.</p>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-2">
                  {verifiedUsers
                    .filter((user) =>
                        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user, idx) => {
                      const rank = idx + 1;
                      return (
                        <div key={user._id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl transition-all hover:border-blue-500 hover:shadow-sm hover:translate-x-1">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[0.9rem] mr-4 shrink-0 
                              ${rank === 1 ? 'bg-amber-100 text-amber-900 border-2 border-amber-400' : 
                                rank === 2 ? 'bg-gray-100 text-gray-800 border-2 border-gray-300' : 
                                rank === 3 ? 'bg-pink-100 text-pink-900 border-2 border-pink-300' : 'bg-gray-100 text-gray-500'}`}>
                              #{rank}
                            </div>

                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 mr-4 shadow-sm">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 m-0 text-base truncate" title={user.fullName}>
                                {user.fullName}
                              </h4>
                              <p className="text-gray-500 text-sm mt-0.5 truncate m-0" title={user.email}>
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0 ml-4">
                            <div className="text-right">
                              <p className="text-[0.65rem] text-gray-400 mb-0.5 uppercase font-bold">Score</p>
                              <span className="text-emerald-500 font-bold text-lg leading-none">
                                {user.score !== null && user.score !== undefined ? Math.round(user.score) : "N/A"}%
                              </span>
                            </div>

                            <div className="text-right min-w-[70px]">
                              <p className="text-[0.65rem] text-gray-400 mb-0.5 uppercase font-bold">Level</p>
                              <span className={`font-bold text-sm leading-none ${
                                user.level === "Expert" ? "text-amber-700" : 
                                user.level === "Senior" ? "text-violet-700" : 
                                user.level === "Mid" ? "text-blue-700" : "text-emerald-700"
                              }`}>
                                {user.level}
                              </span>
                            </div>

                            <div className="text-right min-w-[80px]">
                              <p className="text-[0.65rem] text-gray-400 mb-0.5 uppercase font-bold">Date</p>
                              <span className="text-gray-600 font-semibold text-sm leading-none">
                                {new Date(user.earnedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <button
                              className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnverifyUser(user._id);
                              }}
                              title="Unverify User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAssessmentManager;
