import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Clock,
  User,
  Award,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,

  Trash2,
  Settings,
  Save,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import DashboardLayout from "../../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import {API_PATH} from "../../utils/apiPath.js";

const AdminAssessmentReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axiosInstance.get(
        API_PATH.ADMIN.ASSESSMENTS_REVIEWS
      );
      setSubmissions(res.data);
    } catch (error) {
      console.error("Failed to fetch submissions", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;

    try {
      await axiosInstance.delete(
        API_PATH.ADMIN.ASSESSMENTS_REVIEWS_ID(submissionId)
      );
      toast.success("Review deleted.");
      fetchSubmissions();
      setShowDetailModal(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Failed to delete review");
    }
  };

  const getViolationTypeLabel = (type) => {
    const labels = {
      "tab-switch": "Tab Switch",
      "window-blur": "Window Blur",
      "copy-paste": "Copy/Paste",
      "right-click": "Right Click",
      devtools: "DevTools",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const configs = {
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Approved",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Rejected",
      },
    };
    const config = configs[status] || configs["rejected"];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.assessment?.skill?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalSubmissions = submissions.length;
  const totalViolations = submissions.reduce(
    (sum, sub) => sum + (sub.violationCount || 0),
    0,
  );
  const averageScore = totalSubmissions
    ? submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) /
    totalSubmissions
    : 0;
  const passRate = totalSubmissions
    ? (submissions.filter(
      (sub) => (sub.score || 0) >= (sub.assessment?.passingScore || 80),
    ).length /
      totalSubmissions) *
    100
    : 0;


  if (loading) {
    return (
      <DashboardLayout activeMenu="admin-assessment-review">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="admin-assessment-review">
      <div className="min-h-screen bg-gray-100 p-10">
        {/* Header */}
        <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 tracking-tight m-0">
                Assessment Review
              </h1>
              <p className="text-gray-500 mt-2 text-base">
                Review flagged assessments and approve or reject submissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Total Submissions:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {submissions.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, email, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
              Total Submissions
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalSubmissions}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
              Average Score
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(averageScore)}%
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
              Pass Rate
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {Math.round(passRate)}%
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
              Total Violations
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {totalViolations}
            </p>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No submissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Main Row */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {submission.user?.fullName?.charAt(0).toUpperCase() ||
                          "U"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg m-0">
                          {submission.user?.fullName || "Unknown User"}
                        </h3>
                        <p className="text-sm text-gray-500 m-0">
                          {submission.user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Assessment Info */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Skill
                        </p>
                        <p className="font-bold text-gray-900">
                          {submission.assessment?.skill}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Score
                        </p>
                        <p
                          className={`font-bold text-lg ${submission.score >= 80 ? "text-green-600" : "text-red-600"}`}
                        >
                          {Math.round(submission.score)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Violations
                        </p>
                        <p
                          className={`font-bold text-lg ${submission.violationCount >= 3
                              ? "text-red-600"
                              : submission.violationCount >= 2
                                ? "text-orange-600"
                                : "text-yellow-600"
                            }`}
                        >
                          {submission.violationCount}
                        </p>
                      </div>
                      <div>{getStatusBadge(submission.status)}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        View Review
                      </button>
                      <button
                        onClick={() => handleDelete(submission._id)}
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 m-0">
                  Assessment Review
                </h2>
                <p className="text-sm text-gray-500 m-0">
                  {selectedSubmission.user?.fullName || "Unknown User"} •{" "}
                  {selectedSubmission.assessment?.skill}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <XCircle size={22} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
                  {/* Violation Log */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Violation Log
                    </h4>
                    {selectedSubmission.violations &&
                      selectedSubmission.violations.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSubmission.violations.map((violation, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {getViolationTypeLabel(violation.type)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Question #{violation.questionIndex + 1}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(
                                violation.timestamp,
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No violations recorded
                      </p>
                    )}
                  </div>

                  {/* Submission Details */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Submitted At
                      </p>
                      <p className="font-semibold text-gray-900">
                        {new Date(
                          selectedSubmission.submittedAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Time Spent
                      </p>
                      <p className="font-semibold text-gray-900">
                        {Math.floor(selectedSubmission.timeSpent / 60)}m{" "}
                        {selectedSubmission.timeSpent % 60}s
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Forced Submission
                      </p>
                      <p
                        className={`font-semibold ${selectedSubmission.forcedSubmission ? "text-red-600" : "text-green-600"}`}
                      >
                        {selectedSubmission.forcedSubmission ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {/* Category Performance */}
                  {selectedSubmission.categoryScores && Object.keys(selectedSubmission.categoryScores).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
                        Category Performance
                      </h4>
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
                        <div className="flex flex-wrap gap-3 mb-4">
                          {Object.entries(selectedSubmission.categoryScores).map(([cat, score]) => (
                            <div key={cat} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-50 flex items-center gap-3">
                              <span className="font-semibold text-indigo-900">{cat}</span>
                              <div className="w-px h-4 bg-indigo-100"></div>
                              <span className={`font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {Math.round(score)}%
                              </span>
                            </div>
                          ))}
                        </div>
                        {selectedSubmission.categoryInterpretation && (
                          <p className="text-sm text-indigo-800 font-medium italic">
                            💡 "{selectedSubmission.categoryInterpretation}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Answers & Scoring */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      Answers & Scoring
                    </h4>
                    {selectedSubmission.answers &&
                      selectedSubmission.answers.length > 0 ? (
                      <div className="space-y-3">
                        {selectedSubmission.answers.map((answer, idx) => {
                          const questionId =
                            answer.questionId || answer.question || answer._id;
                          const question =
                            selectedSubmission.assessment?.questions?.find(
                              (q) =>
                                q._id === questionId || q.id === questionId,
                            );
                          const selected =
                            answer.selectedOption ||
                            answer.answer ||
                            answer.response;
                          const correct = question?.correctAnswer;
                          const isCorrect =
                            correct && selected ? correct === selected : null;

                          return (
                            <div
                              key={idx}
                              className="bg-white p-4 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 mb-1">
                                    Q{idx + 1}:{" "}
                                    {question?.questionText ||
                                      "Question text unavailable"}
                                  </p>
                                  {question?.category && (
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 mb-2 uppercase tracking-wide">
                                      {question.category}
                                    </span>
                                  )}
                                  <p className="text-xs text-gray-500 mb-2">
                                    Selected: {selected || "No answer"}
                                  </p>
                                  {correct && (
                                    <p className="text-xs text-gray-500">
                                      Correct: {correct}
                                    </p>
                                  )}
                                </div>
                                {isCorrect !== null && (
                                  <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                                  >
                                    {isCorrect ? "Correct" : "Incorrect"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No answers available
                      </p>
                    )}
                  </div>


              <div className="mt-6 pt-6 border-t border-gray-100">
                {selectedSubmission.status === "approved" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-semibold">
                      Auto-approved on{" "}
                      {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {selectedSubmission.status === "rejected" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-red-800 font-semibold">
                      Rejected on{" "}
                      {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                    </p>
                    {selectedSubmission.rejectionReason && (
                      <p className="text-red-700 text-sm mt-2 font-medium">
                        Reason: {selectedSubmission.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default AdminAssessmentReview;
