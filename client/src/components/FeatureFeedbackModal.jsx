import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPath";
import { toast } from "react-hot-toast";
import { X, Star } from "lucide-react";
import { motion } from "framer-motion";

const FeatureFeedbackModal = () => {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [improvements, setImprovements] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpenFeedback = (event) => {
      const { featureName: incomingFeature } = event.detail;
      
      // Check if user has already provided feedback for this feature
      const hasProvided = user?.feedbackProvidedFeatures?.includes(incomingFeature);
      
      if (user && !hasProvided) {
        setFeatureName(incomingFeature);
        setRating(0);
        setComments("");
        setImprovements("");
        setIsOpen(true);
      }
    };

    window.addEventListener("openFeedbackModal", handleOpenFeedback);
    return () => window.removeEventListener("openFeedbackModal", handleOpenFeedback);
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post(API_PATH.AI.SUBMIT_FEEDBACK, {
        rating,
        comments,
        improvements,
        featureName,
      });
      toast.success("Thank you for your feedback!");
      updateUser({ 
        feedbackProvidedFeatures: [...(user?.feedbackProvidedFeatures || []), featureName] 
      });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post(API_PATH.AI.SUBMIT_FEEDBACK, {
        rating: 5,
        comments: "Skipped",
        improvements: "",
        featureName,
      });
      updateUser({ 
        feedbackProvidedFeatures: [...(user?.feedbackProvidedFeatures || []), featureName] 
      });
      setIsOpen(false);
    } catch (error) {
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-100"
      >
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                How was your experience?
              </h2>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                You recently used <span className="font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">{featureName}</span> for the first time! We'd love to hear your thoughts.
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full transition-all shadow-sm"
              aria-label="Close"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center space-x-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={44}
                    className={`transition-all duration-200 ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                        : "text-gray-200"
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="comments" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  What did you like? <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="comments"
                  rows="2"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-all text-sm"
                  placeholder="Tell us what worked well for you..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label htmlFor="improvements" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Suggest improvements <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="improvements"
                  rows="2"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-all text-sm"
                  placeholder="What could be better?"
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full py-3.5 px-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FeatureFeedbackModal;
