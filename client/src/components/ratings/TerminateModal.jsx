import { useState, useEffect } from "react";
import { X, UserX, AlertTriangle, ChevronDown } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import toast from "react-hot-toast";

/**
 * TerminateModal
 * Shown when employer clicks "End Employment".
 * Step 1: Select termination reason + confirm.
 * After success: triggers onTerminated(reviewId) so caller can open EmployerRatingModal.
 */
const TerminateModal = ({ isOpen, onClose, applicant, onTerminated }) => {
  const [reasons, setReasons] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReasons();
      setSelectedReasonId("");
    }
  }, [isOpen]);

  const fetchReasons = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.TERMINATION_REVIEWS.GET_REASONS);
      setReasons(res.data || []);
    } catch {
      // fallback: empty, employer can still proceed
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post(API_PATH.TERMINATION_REVIEWS.TERMINATE, {
        applicationId: applicant._id,
        terminationReasonId: selectedReasonId || null,
      });
      toast.success("Employment terminated successfully.");
      onClose();
      onTerminated?.(res.data.review?._id);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to terminate employment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">End Employment</h3>
              <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Terminating employment for{" "}
                <span className="font-bold">{applicant?.applicant?.fullName}</span>
              </p>
              <p className="text-xs text-red-600 mt-1">
                The employee will be notified and prompted to rate their experience.
              </p>
            </div>
          </div>

          {/* Reason selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Termination
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={selectedReasonId}
                onChange={(e) => setSelectedReasonId(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="">Select a reason...</option>
                {reasons.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {reasons.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">Loading reasons...</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 w-full sm:w-auto py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 w-full sm:w-auto py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-md shadow-red-200 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UserX className="w-4 h-4" />
                Confirm Termination
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminateModal;
