import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { toast } from "react-hot-toast";
import { Trash2, MessageSquare, Star, Eye, X, BarChart3 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminFeatureFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.ADMIN.AI_FEEDBACKS);
      setFeedbacks(response.data);
    } catch (error) {
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await axiosInstance.delete(API_PATH.ADMIN.DELETE_AI_FEEDBACK(id));
      toast.success("Feedback deleted successfully");
      fetchFeedbacks();
      if (selectedFeedback?._id === id) setShowDetailModal(false);
    } catch (error) {
      toast.error("Failed to delete feedback");
    }
  };

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  // Analytics Calculation
  const totalFeedbacks = feedbacks.length;
  const averageRating = totalFeedbacks > 0
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedbacks).toFixed(1)
    : 0;

  const featureAnalytics = feedbacks.reduce((acc, curr) => {
    if (!acc[curr.featureName]) {
      acc[curr.featureName] = { count: 0, totalRating: 0 };
    }
    acc[curr.featureName].count += 1;
    acc[curr.featureName].totalRating += curr.rating;
    return acc;
  }, {});

  const featureStats = Object.keys(featureAnalytics).map(feature => ({
    name: feature,
    count: featureAnalytics[feature].count,
    average: (featureAnalytics[feature].totalRating / featureAnalytics[feature].count).toFixed(1)
  })).sort((a, b) => b.count - a.count);

  return (
    <DashboardLayout activeMenu="admin-ai-feedbacks">
      <div className="space-y-6">
        {/* Analytics Section */}
        {!loading && feedbacks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-700">Total Feedbacks</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalFeedbacks}</p>
              <p className="text-sm text-gray-500 mt-1">System-wide rating: <span className="font-semibold text-gray-800">{averageRating} / 5.0</span></p>
            </div>

            {featureStats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-700 mb-2 truncate" title={stat.name}>{stat.name}</h3>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900">{stat.average}</span>
                  <div className="flex text-amber-400 mb-2">
                    <Star size={16} className="fill-current" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">{stat.count} user {stat.count === 1 ? 'review' : 'reviews'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Feedback List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Feature Feedbacks</h2>
              <p className="text-sm text-gray-500 mt-1">
                View and manage user feedback across all system features.
              </p>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No feedback found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto admin-table-responsive">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                      <th className="px-6 py-4 rounded-tl-xl">User</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Feature</th>
                      <th className="px-6 py-4">Feedback Snippet</th>
                      <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feedbacks.map((feedback) => (
                      <tr
                        key={feedback._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {feedback.user?.fullName || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {feedback.user?.email}
                              </div>
                              <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {feedback.user?.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < feedback.rating
                                    ? "fill-current"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                          {feedback.featureName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <p className="truncate" title={feedback.comments || feedback.improvements}>
                            {feedback.comments || feedback.improvements || <span className="text-gray-400 italic">No text provided</span>}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleView(feedback)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(feedback._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Feedback"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1.5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {selectedFeedback.user?.fullName?.charAt(0) || "?"}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedFeedback.user?.fullName || "Unknown User"}</h4>
                  <p className="text-sm text-gray-500">{selectedFeedback.user?.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full text-sm">
                    {selectedFeedback.featureName}
                  </span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < selectedFeedback.rating ? "fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">What they liked:</h5>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-200">
                      {selectedFeedback.comments || <span className="italic text-gray-400">No positive feedback provided.</span>}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Suggested improvements:</h5>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-200">
                      {selectedFeedback.improvements || <span className="italic text-gray-400">No improvements suggested.</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDelete(selectedFeedback._id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminFeatureFeedbacks;
