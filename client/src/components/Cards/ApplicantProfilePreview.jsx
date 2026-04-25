import { Download, X, User, Sparkles, BrainCircuit } from "lucide-react";

import { useState } from "react";
import { getInitials } from "../../utils/helper";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import EmployerSuitabilityModal from "../Modals/EmployerSuitabilityModal";

import StatusBadge from "./../StatusBadge";
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
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
          <div className="text-center mb-6">
            {selectedApplicant.applicant.avatar ? (
              <img
                src={selectedApplicant.applicant.avatar}
                alt={selectedApplicant.applicant.fullName}
                className="h-20 w-20 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-semibold text-2xl leading-tight tracking-wide">
                  {getInitials(selectedApplicant.applicant.fullName)}
                </span>
              </div>
            )}
            <h4 className="mt-4 text-xl font-semibold text-gray-900">
              {selectedApplicant.applicant.fullName}
            </h4>
            <p className="text-gray-600">{selectedApplicant.applicant.email}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">
                Applied Position
              </h5>
              <p className="text-gray-700">{selectedApplicant.job.title}</p>
              <p className="text-gray-600 text-sm mt-1">
                {selectedApplicant.job.location} • {selectedApplicant.job.type}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">
                Application Details
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <StatusBadge status={currentStatus} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applied Date:</span>
                  <span className="text-gray-900">
                    {moment(selectedApplicant.createdAt).format("Do MMM, YYYY")}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Analysis Button Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-indigo-900 flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Suitability Check
                </h5>
                <p className="text-xs text-indigo-600/80">Evaluate match with job requirements</p>
              </div>

              <button
                onClick={handleOpenAiAnalysis}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <BrainCircuit className="w-4 h-4" />
                {aiAnalysis ? "View Analysis" : "Run Analysis"}
              </button>
            </div>

            {/* AI Modal */}
            <EmployerSuitabilityModal
              isOpen={showAiModal}
              onClose={() => setShowAiModal(false)}
              loading={isAiLoading}
              result={aiAnalysis}
              candidateName={selectedApplicant.applicant.fullName}
              jobTitle={selectedApplicant.job.title}
            />

            <button
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() =>
                navigate("/applicant-profile", {
                  state: { applicantId: selectedApplicant._id },
                })
              }
            >
              <User className="w-4 h-4" />
              View Profile
            </button>

            <button
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              onClick={() =>
                handleDownloadResume(selectedApplicant.applicant.resume)
              }
            >
              <Download className="w-4 h-4" />
              Download Resume
            </button>

            {/* Status Dropdown */}
            <div className="mt-4">
              <label className="block mb-1 text-sm text-gray-700 font-medium">
                Change Application Status
              </label>
              <select
                value={currentStatus}
                onChange={onChangeStatus}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {loading && (
                <p className="text-xs text-gray-500 mt-1">Updating status...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfilePreview;
