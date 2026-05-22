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
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const EmployerAssessmentReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [verifiedReviewIds, setVerifiedReviewIds] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, title: '', message: '', actionText: '' });


  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/employer-assessments/submissions",
      );
      setSubmissions(res.data);
    } catch (error) {
      console.error("Failed to fetch submissions", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseScore = async (submissionId) => {
    if (!submissionId && confirmModal.id) {
      submissionId = confirmModal.id;
    }
    
    if (!confirmModal.isOpen) {
      setConfirmModal({
        isOpen: true,
        type: 'release',
        id: submissionId,
        title: 'Release Score',
        message: 'Are you sure you want to release this score to the candidate? They will be notified via email.',
        actionText: 'Release Score'
      });
      return;
    }

    try {
      await axiosInstance.put(
        `/api/employer-assessments/submissions/${submissionId}/release-score`,
      );
      toast.success("Score released successfully!");
      fetchSubmissions();
      setShowDetailModal(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Failed to release score", error);
      toast.error("Failed to release score");
    } finally {
      setConfirmModal({ isOpen: false, type: '', id: null, title: '', message: '', actionText: '' });
    }
  };

  const handleDelete = async (submissionId) => {
    if (!submissionId && confirmModal.id) {
      submissionId = confirmModal.id;
    }

    if (!confirmModal.isOpen) {
      setConfirmModal({
        isOpen: true,
        type: 'delete',
        id: submissionId,
        title: 'Delete Review',
        message: 'Are you sure you want to delete this review? This action cannot be undone.',
        actionText: 'Delete'
      });
      return;
    }

    try {
      await axiosInstance.delete(
        `/api/employer-assessments/submissions/${submissionId}`,
      );
      toast.success("Review deleted.");
      fetchSubmissions();
      setShowDetailModal(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Failed to delete review");
    } finally {
      setConfirmModal({ isOpen: false, type: '', id: null, title: '', message: '', actionText: '' });
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
      "under-review": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Under Review",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Approved",
      },
      released: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Score Released",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Rejected",
      },
    };
    const config = configs[status] || configs["under-review"];
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
      sub.employerAssessment?.skill?.toLowerCase().includes(searchTerm.toLowerCase());

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
        (sub) => (sub.score || 0) >= (sub.employerAssessment?.passingScore || 80),
      ).length /
        totalSubmissions) *
      100
    : 0;

  const toggleVerifiedReview = (submissionId) => {
    setVerifiedReviewIds((prev) => ({
      ...prev,
      [submissionId]: !prev[submissionId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full mt-4">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Submissions</h2>
          <p className="text-gray-500 text-sm mt-1">Check candidates' integrity and release scores.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500">Total Pending:</span>
          <span className="text-xl font-bold text-orange-600">
            {submissions.filter((s) => s.status === "under-review").length}
          </span>
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
                <option value="under-review">Under Review</option>
                <option value="released">Score Released</option>

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
                          {submission.employerAssessment?.skill || submission.employerAssessment?.title}
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
                          className={`font-bold text-lg ${
                            submission.violationCount >= 3
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
                  {selectedSubmission.employerAssessment?.skill || selectedSubmission.employerAssessment?.title}
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
                            selectedSubmission.employerAssessment?.questions?.find(
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


              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                {selectedSubmission.status === "under-review" && (
                    <>
                      <button
                        onClick={() => handleReleaseScore(selectedSubmission._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={20} />
                        Release Score
                      </button>
                    </>
                  )}
              </div>

              {selectedSubmission.status === "released" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold">
                    Score Released on{" "}
                    {new Date(
                      selectedSubmission.reviewedAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmModal.type === 'delete' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              {confirmModal.type === 'delete' ? <Trash2 size={24} /> : <CheckCircle size={24} />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-gray-500 text-sm mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: '', id: null, title: '', message: '', actionText: '' })}
                className="flex-1 py-2.5 px-4 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmModal.type === 'release' ? handleReleaseScore(confirmModal.id) : handleDelete(confirmModal.id)}
                className={`flex-1 py-2.5 px-4 font-semibold rounded-xl text-white transition-colors ${confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {confirmModal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default EmployerAssessmentReview;
