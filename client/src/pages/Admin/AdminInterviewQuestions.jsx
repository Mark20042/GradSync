import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Edit2, X } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminInterviewQuestions = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newRole, setNewRole] = useState({
    roleName: "",
    description: "",
  });

  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    category: "General",
    idealAnswer: "",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.INTERVIEW.GET_ROLES);
      setRoles(res.data);
    } catch (error) {
      toast.error("Failed to fetch interview roles");
      console.error(error);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.roleName) {
      toast.error("Please provide a Role Name");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_PATH.INTERVIEW.GET_ROLES, newRole);
      toast.success("Job Role created successfully!");
      setIsRoleModalOpen(false);
      setNewRole({ roleName: "", description: "" });
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(
        API_PATH.INTERVIEW.GET_ROLE_BY_ID(selectedRole._id),
        selectedRole,
      );
      toast.success("Role updated successfully!");
      setIsEditRoleModalOpen(false);
      fetchRoles();
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this Role and all its questions?",
      )
    )
      return;

    try {
      await axiosInstance.delete(API_PATH.INTERVIEW.GET_ROLE_BY_ID(id));
      toast.success("Role deleted");
      fetchRoles();
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText) {
      toast.error("Please provide the question text");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(
        API_PATH.INTERVIEW.MANAGE_QUESTIONS(selectedRole._id),
        newQuestion,
      );
      toast.success("Question added!");
      setNewQuestion({
        questionText: "",
        category: "General",
        idealAnswer: "",
      });
      setIsQuestionModalOpen(false);
      fetchRoles();
    } catch (error) {
      toast.error("Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion.questionText) {
      toast.error("Please provide the question text");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(
        API_PATH.INTERVIEW.MANAGE_QUESTION_BY_ID(selectedRole._id, editingQuestion._id),
        {
          questionText: editingQuestion.questionText,
          category: editingQuestion.category,
          idealAnswer: editingQuestion.idealAnswer,
        },
      );
      toast.success("Question updated!");
      setIsEditQuestionModalOpen(false);
      setEditingQuestion(null);
      fetchRoles();
    } catch (error) {
      toast.error("Failed to update question");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (roleId, questionId) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await axiosInstance.delete(
        API_PATH.INTERVIEW.MANAGE_QUESTION_BY_ID(roleId, questionId),
      );
      toast.success("Question deleted");
      fetchRoles();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  return (
    <DashboardLayout activeMenu="admin-interview-questions">
      <div className="min-h-screen bg-gray-100 p-10">
        <div className="flex justify-between items-end mb-12 bg-white px-8 py-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 m-0 tracking-tight">
              Interview Questions Manager
            </h1>
            <p className="text-gray-500 mt-2 text-base">
              Create job roles and attach questions for candidate mock
              interviews.
            </p>
          </div>
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 shadow-sm"
          >
            <Plus size={20} />
            Create Job Role
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
          {roles.map((role) => (
            <div key={role._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-blue-200 flex flex-col overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-white to-slate-50 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-800 m-0 flex items-center justify-between">{role.roleName}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedRole(role);
                        setIsEditRoleModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-4 text-gray-500 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">📝</span> {role.questions?.length || 0} Questions
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 flex-1">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 tracking-wider uppercase">
                  QUESTIONS PREVIEW
                </h4>

                {!role.questions || role.questions.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm">No questions added yet</p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {role.questions.map((q) => (
                      <div key={q._id} className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-start gap-1 text-sm text-gray-600 hover:bg-white hover:border-slate-300 transition-colors">
                        <div className="flex w-full items-center">
                          <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis pr-2">
                            {q.questionText}
                          </span>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setSelectedRole(role);
                                setEditingQuestion(q);
                                setIsEditQuestionModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-blue-600 p-1 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(role._id, q._id)}
                              className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <span className={`text-xs ${q.idealAnswer ? "text-emerald-500" : "text-amber-500"}`}>
                          {q.idealAnswer ? "✓ Has ideal answer" : "⚠ No ideal answer"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedRole(role);
                    setIsQuestionModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-semibold transition-all bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Plus size={16} /> Add Qs
                </button>
              </div>
            </div>
          ))}
        </div>

        {isRoleModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-2xl p-8 max-w-[600px] w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 m-0">Create Job Role</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setIsRoleModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Job Role Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., Frontend Developer"
                    value={newRole.roleName}
                    onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleCreateRole}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? "Creating..." : "Create Role"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditRoleModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-2xl p-8 max-w-[600px] w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 m-0">Edit Job Role</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setIsEditRoleModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Job Role Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    value={selectedRole?.roleName || ""}
                    onChange={(e) => setSelectedRole({ ...selectedRole, roleName: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleUpdateRole}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? "Updating..." : "Update Role"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-2xl p-8 max-w-[600px] w-full shadow-2xl max-h-[90vh] overflow-y-auto w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 m-0">Add Question to {selectedRole?.roleName}</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setIsQuestionModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Question Text</label>
                  <textarea
                    rows="3"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Category</label>
                  <select
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white w-full"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  >
                    <option>General</option>
                    <option>Technical</option>
                    <option>Behavioral</option>
                    <option>Communication</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Ideal Answer (Reference for AI Evaluation)</label>
                  <textarea
                    rows="4"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="Enter the ideal/expected answer. The AI will compare candidate answers against this reference..."
                    value={newQuestion.idealAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, idealAnswer: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleAddQuestion}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? "Saving..." : "Save Question"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditQuestionModalOpen && editingQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-2xl p-8 max-w-[600px] w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 m-0">Edit Question</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setIsEditQuestionModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Question Text</label>
                  <textarea
                    rows="3"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    value={editingQuestion.questionText}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Category</label>
                  <select
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white w-full"
                    value={editingQuestion.category}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                  >
                    <option>General</option>
                    <option>Technical</option>
                    <option>Behavioral</option>
                    <option>Communication</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Ideal Answer (Reference for AI Evaluation)</label>
                  <textarea
                    rows="4"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="Enter the ideal/expected answer..."
                    value={editingQuestion.idealAnswer || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, idealAnswer: e.target.value })}
                  />
                </div>
                <button
                  onClick={handleUpdateQuestion}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? "Saving..." : "Update Question"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminInterviewQuestions;
