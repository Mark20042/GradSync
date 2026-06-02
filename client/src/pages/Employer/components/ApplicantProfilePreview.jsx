import { Download, X, User, Sparkles, BrainCircuit } from "lucide-react";

import { useState, useEffect } from "react";
import { getInitials } from "../../../utils/helper";
import moment from "moment";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import EmployerSuitabilityModal from "./EmployerSuitabilityModal";
import { FileCode } from "lucide-react";

import StatusBadge from "../../../components/StatusBadge";
const statusOptions = ["Applied", "In Review", "Rejected", "Accepted"];

const ApplicantProfilePreview = ({
  selectedApplicant,
  setSelectedApplicant,
  handleDownloadResume,
  handleClose,
}) => {
  const [currentStatus, setCurrentStatus] = useState(selectedApplicant.status);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [hasPromptedFeedback, setHasPromptedFeedback] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (!showAiModal && aiAnalysis && !hasPromptedFeedback) {
      setHasPromptedFeedback(true);
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("openFeedbackModal", {
            detail: { featureName: "Employer Suitability Analysis" },
          })
        );
      }, 500);
    }
  }, [showAiModal, aiAnalysis, hasPromptedFeedback]);

  const handleOpenAiAnalysis = async () => {
    setShowAiModal(true);
    // Only fetch if not already fetched to save tokens/time
    if (!aiAnalysis) {
      setIsAiLoading(true);
      try {
        const response = await axiosInstance.post(API_PATH.AI.CHECK_CANDIDATE_SUITABILITY, {
          jobId: selectedApplicant.job._id,
          candidateId: selectedApplicant.applicant._id
        });
        setAiAnalysis(response.data);
      } catch (error) {
        console.error("Analysis failed:", error);
        toast.error("Failed to analyze candidate");
        setShowAiModal(false);
      } finally {
        setIsAiLoading(false);
      }
    }
  };


  const updateStatusAPI = async (newStatus, reason = null) => {
    setCurrentStatus(newStatus);
    setLoading(true);

    try {
      const payload = { status: newStatus };
      if (reason) payload.rejectionReason = reason;

      const response = await axiosInstance.put(
        API_PATH.APPLICATIONS.UPDATE_STATUS(selectedApplicant._id),
        payload
      );

      if (response.status === 200) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
        toast.success("Application status updated successfully");
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      setCurrentStatus(selectedApplicant.status);
      toast.error("Something went wrong! Try again later");
    } finally {
      setLoading(false);
    }
  };

  const onChangeStatus = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === "Rejected") {
      setShowRejectionModal(true);
      return;
    }
    await updateStatusAPI(newStatus);
  };

  const handleRejectConfirm = async () => {
    let finalReason = rejectionReason;
    if (rejectionReason === "Others") {
      finalReason = customReason;
    }
    await updateStatusAPI("Rejected", finalReason);
    setShowRejectionModal(false);
    setRejectionReason("");
    setCustomReason("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ring-1 ring-black/5">
        {/*Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Applicant Profile
          </h3>
          <button
            onClick={() => handleClose()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {/*Modal Content */}
        <div className="p-6">
          {/* Header Row */}
          <div className="flex items-center gap-5 mb-6">
            {selectedApplicant.applicant.avatar ? (
              <img
                src={selectedApplicant.applicant.avatar}
                alt={selectedApplicant.applicant.fullName}
                className="h-16 w-16 rounded-full object-cover shadow-sm ring-2 ring-gray-100"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm ring-2 ring-white">
                <span className="text-blue-700 font-bold text-xl tracking-wide">
                  {getInitials(selectedApplicant.applicant.fullName)}
                </span>
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold text-gray-900 leading-tight">
                {selectedApplicant.applicant.fullName}
              </h4>
              <p className="text-gray-500 text-sm mt-0.5">{selectedApplicant.applicant.email}</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Applied Position
                </p>
                <p className="font-semibold text-gray-900">{selectedApplicant.job.title}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <span className="truncate">{selectedApplicant.job.location}</span>
                  <span>•</span>
                  <span>{selectedApplicant.job.type}</span>
                </p>
              </div>

              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Application Status
                  </p>
                  <span className="text-[11px] text-gray-400 font-medium bg-white px-2 py-0.5 rounded-full border border-gray-100">
                    {moment(selectedApplicant.createdAt).format("MMM Do, YYYY")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <StatusBadge status={currentStatus} />
                  </div>
                  <select
                    value={currentStatus}
                    onChange={onChangeStatus}
                    disabled={loading}
                    className="w-full text-sm font-medium border border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-gray-300 transition-colors cursor-pointer"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* AI Analysis Banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm">
              <div>
                <h5 className="font-bold text-indigo-900 flex items-center gap-2 mb-0.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Suitability Check
                </h5>
                <p className="text-[11px] font-medium text-indigo-600/80 uppercase tracking-wide">Evaluate match with job requirements</p>
              </div>

              <button
                onClick={handleOpenAiAnalysis}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-indigo-200 flex items-center gap-2 active:scale-95"
              >
                <BrainCircuit className="w-4 h-4" />
                {aiAnalysis ? "View Analysis" : "Run Analysis"}
              </button>
            </div>

            {/* Modals */}
            <EmployerSuitabilityModal
              isOpen={showAiModal}
              onClose={() => setShowAiModal(false)}
              loading={isAiLoading}
              result={aiAnalysis}
              candidateName={selectedApplicant.applicant.fullName}
              jobTitle={selectedApplicant.job.title}
            />



            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-gray-100 mt-4">
              <button
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-md shadow-gray-200 active:scale-[0.98] focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                onClick={() =>
                  navigate("/applicant-profile", {
                    state: { applicantId: selectedApplicant._id },
                  })
                }
              >
                <User className="w-5 h-5" />
                View Full Profile
              </button>



              <button
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-all shadow-sm active:scale-[0.98] focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                onClick={() =>
                  handleDownloadResume(selectedApplicant.applicant.resume)
                }
              >
                <Download className="w-5 h-5" />
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reason for Rejection</h3>
              <button onClick={() => setShowRejectionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Providing a reason helps candidates improve and leaves a good impression. This is optional.
            </p>
            <div className="space-y-3 mb-6">
              {[
                "Lack of required skills or experience",
                "Better suited candidates found",
                "Position closed or on hold",
                "Did not meet requirements required",
                "Others"
              ].map(reason => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason}
                    checked={rejectionReason === reason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  {reason}
                </label>
              ))}

              {rejectionReason === "Others" && (
                <textarea
                  placeholder="Please specify the reason (optional)..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full mt-2 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows="3"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={loading}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantProfilePreview;
