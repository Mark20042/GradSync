import { useState } from "react";
import { X, Award } from "lucide-react";
import StarRating from "./StarRating";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import toast from "react-hot-toast";

const EMPLOYER_TAGS = [
  "Punctual", "Hard-working", "Reliable", "Team player",
  "Strong communicator", "Proactive", "Needs improvement",
  "Lacks initiative", "Communication issues", "Attendance issues",
];

const EmployerRatingModal = ({ isOpen, onClose, reviewId, employeeName }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.patch(API_PATH.TERMINATION_REVIEWS.EMPLOYER_RATE(reviewId), {
        rating,
        feedback,
        tags: selectedTags,
      });
      toast.success("Rating submitted. Thank you for your feedback!");
      onClose(true); // true = was rated
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await axiosInstance.patch(
        API_PATH.TERMINATION_REVIEWS.DISMISS_PROMPT(reviewId)
      );
    } catch {
      // silently fail
    } finally {
      onClose(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[120]">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white relative shrink-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white" />
            <div className="absolute -bottom-8 -left-4 w-40 h-40 rounded-full bg-white" />
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-indigo-200" />
                <span className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">
                  Rate Employee
                </span>
              </div>
              <h3 className="text-xl font-bold line-clamp-2">How did {employeeName} perform?</h3>
              <p className="text-indigo-200 text-sm mt-1">Your feedback is anonymous and kept private.</p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600 mb-3">Overall Rating</p>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            {rating > 0 && (
              <p className="text-sm text-indigo-600 font-semibold mt-2">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Attributes{" "}
              <span className="text-gray-400 font-normal">(select all that apply)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {EMPLOYER_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Feedback{" "}
              <span className="text-gray-400 font-normal">(private, optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe this employee's work ethic, strengths, and areas for improvement..."
              className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none resize-none transition-all"
              rows={3}
            />
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              🔒 This feedback will never be shown publicly — only the rating score is visible to others.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 sm:pt-0 shrink-0 bg-white border-t sm:border-t-0 border-gray-100">
          <button
            onClick={handleDismiss}
            disabled={isSubmitting}
            className="flex-1 w-full sm:w-auto py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 w-full sm:w-auto py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerRatingModal;
