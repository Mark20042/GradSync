import React, { useState, useEffect } from "react";
import { X, Calendar, Search } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import toast from "react-hot-toast";

const EmployerAssessmentInvitationModal = ({ isOpen, onClose, candidate, job }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssessments();
      // default due date: 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate.toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/employer-assessments");
      setAssessments(res.data);
    } catch (error) {
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedAssessmentId || !dueDate) {
      toast.error("Please select an assessment and due date");
      return;
    }

    setSending(true);
    try {
      await axiosInstance.post("/api/employer-assessments/invite", {
        candidateId: candidate._id,
        assessmentId: selectedAssessmentId,
        jobId: job?._id,
        dueDate: dueDate,
      });
      toast.success("Assessment invitation sent successfully!");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Invite to Assessment</h3>
            <p className="text-xs text-gray-500 mt-1">Candidate: {candidate.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't created any assessments yet.</p>
              <a href="/employer-assessment-builder" className="text-blue-600 hover:underline font-medium">Create Assessment</a>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Assessment
                </label>
                <select
                  value={selectedAssessmentId}
                  onChange={(e) => setSelectedAssessmentId(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="" disabled>-- Select an Assessment --</option>
                  {assessments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.title} ({a.timeLimit} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Candidates will not be able to take the assessment after this date.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvite}
            disabled={!selectedAssessmentId || sending || assessments.length === 0}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerAssessmentInvitationModal;
