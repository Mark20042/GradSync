import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { toast } from "react-hot-toast";
import { Trash2, MessageSquare, Star } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminAIFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.ADMIN.AI_FEEDBACKS);
      setFeedbacks(response.data);
    } catch (error) {
      toast.error("Failed to load AI feedbacks");
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
    } catch (error) {
      toast.error("Failed to delete feedback");
    }
  };

  return (
    <DashboardLayout activeMenu="admin-ai-feedbacks">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Feature Feedbacks</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage user feedback on system features like Assessments, Interviews, Resume Builder, and AI.
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    <th className="px-6 py-4 rounded-tl-xl">User</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Feature</th>
                    <th className="px-6 py-4">Comments</th>
                    <th className="px-6 py-4">Improvements</th>
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
                        <div className="flex text-yellow-400">
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {feedback.featureName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <p className="truncate" title={feedback.comments}>
                          {feedback.comments || <span className="text-gray-400 italic">No comments</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <p className="truncate" title={feedback.improvements}>
                          {feedback.improvements || <span className="text-gray-400 italic">None</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(feedback._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Feedback"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAIFeedbacks;
