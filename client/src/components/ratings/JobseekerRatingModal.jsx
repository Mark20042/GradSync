import { useState } from "react";
import { X, Star } from "lucide-react";
import StarRating from "./StarRating";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import toast from "react-hot-toast";

const JOBSEEKER_TAGS = [
  "Great work culture", "Good pay & benefits", "Work-life balance",
  "Growth opportunities", "Supportive management", "Clear expectations",
  "Poor management", "Toxic environment", "Overworked", "Low pay",
  "No career growth", "Poor communication",
];

/**
 * JobseekerRatingModal
 * Can be triggered two ways:
 *   1. Automatic pop-up from DashboardLayout (passes `review` prop)
 *   2. Manual "Rate Experience" button in MyApplications (passes `review` prop)
 *
 * Props:
 *   isOpen: boolean
 *   onClose(wasRated: boolean): callback
 *   review: { _id, job: { title }, company: { companyName, companyLogo } }
 */
const JobseekerRatingModal = ({ isOpen, onClose, review }) => {
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
      await axiosInstance.patch(
        API_PATH.TERMINATION_REVIEWS.JOBSEEKER_RATE(review._id),
        { rating, feedback, tags: selectedTags }
      );
      toast.success("Thank you for your review! It helps future applicants.");
      onClose(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await axiosInstance.patch(
        API_PATH.TERMINATION_REVIEWS.DISMISS_PROMPT(review._id)
      );
    } catch {
      // silently fail
    } finally {
      onClose(false);
    }
  };

  if (!isOpen || !review) return null;

  const companyName = review?.company?.companyName || "the company";
  const jobTitle = review?.job?.title || "this position";
  const companyLogo = review?.company?.companyLogo;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[120]">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white relative shrink-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-4 w-36 h-36 rounded-full bg-white" />
            <div className="absolute -bottom-4 -left-8 w-40 h-40 rounded-full bg-white" />
          </div>
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-14 w-14 rounded-xl object-contain bg-white p-1 shadow-md"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Star className="w-4 h-4 text-purple-200" />
                  <span className="text-purple-100 text-xs font-semibold uppercase tracking-wider">
                    Rate Your Experience
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight line-clamp-2">{companyName}</h3>
                <p className="text-purple-200 text-xs mt-0.5 line-clamp-1">Position: {jobTitle}</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="relative text-purple-200 text-xs mt-3">
            Your review is completely anonymous. Help future applicants make informed decisions.
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600 mb-3">
              How was working at {companyName}?
            </p>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            {rating > 0 && (
              <p className="text-sm text-purple-600 font-semibold mt-2">
                {["", "Very Disappointed", "Below Expectations", "It was Okay", "Good Experience", "Loved It!"][rating]}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              What stood out?{" "}
              <span className="text-gray-400 font-normal">(select all that apply)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {JOBSEEKER_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                    selectedTags.includes(tag)
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tell us more{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={`What was your experience like at ${companyName}?`}
              className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none resize-none transition-all"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 sm:pt-0 shrink-0 bg-white border-t sm:border-t-0 border-gray-100">
          <button
            onClick={handleDismiss}
            disabled={isSubmitting}
            className="flex-1 w-full sm:w-auto py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
          >
            Rate Later
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 w-full sm:w-auto py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-md shadow-violet-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobseekerRatingModal;
