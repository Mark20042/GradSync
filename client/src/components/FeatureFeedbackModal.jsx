import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPath";
import { toast } from "react-hot-toast";
import { X, Star } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              How was your experience?
            </h2>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6 text-sm">
            You recently used <span className="font-semibold text-indigo-600">{featureName}</span> for the first time! We'd love to hear your thoughts to help us improve.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                What did you like? (Optional)
              </label>
              <textarea
                id="comments"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                placeholder="Tell us what you liked..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
                Suggest improvements (Optional)
              </label>
              <textarea
                id="improvements"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                placeholder="What could be better?"
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeatureFeedbackModal;
