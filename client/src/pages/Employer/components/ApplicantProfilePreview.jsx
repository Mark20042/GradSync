import { Download, X, User, Sparkles, BrainCircuit } from "lucide-react";

import { useState } from "react";
import { getInitials } from "../../../utils/helper";
import moment from "moment";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import EmployerSuitabilityModal from "./EmployerSuitabilityModal";
import EmployerAssessmentInvitationModal from "./EmployerAssessmentInvitationModal";
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
  const [showInviteModal, setShowInviteModal] = useState(false);

  const navigate = useNavigate();

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


  const onChangeStatus = async (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    setLoading(true);

    try {
      const response = await axiosInstance.put(
        API_PATH.APPLICATIONS.UPDATE_STATUS(selectedApplicant._id),
        { status: newStatus }
      );

      if (response.status === 200) {
        //Update local state after successful update
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
        toast.success("Application status updated successfully");
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      //Optionally revert status back if failed
      setCurrentStatus(selectedApplicant.status);
      toast.error("Something went wrong! Try again later");
    } finally {
      setLoading(false);
    }
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

            <EmployerAssessmentInvitationModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              candidate={selectedApplicant.applicant}
              job={selectedApplicant.job}
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
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-indigo-600 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-sm active:scale-[0.98] focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                onClick={() => setShowInviteModal(true)}
              >
                <FileCode className="w-5 h-5" />
                Invite to Assessment
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
    </div>
  );
};

export default ApplicantProfilePreview;
