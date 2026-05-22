import React, { useState, useEffect } from "react";
import { Plus, Clock, FileText, Trash2, Edit3, Users, Calendar } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { API_PATH } from "../../utils/apiPath";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import EmployerAssessmentReview from "./EmployerAssessmentReview";
import { useNavigate } from "react-router-dom";

const EmployerAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assessments");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/employer-assessments');
      setAssessments(res.data);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      toast.error("Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await axiosInstance.delete(`/api/employer-assessments/${id}`);
      toast.success("Assessment deleted successfully");
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to delete assessment");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Anytime";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="employer-assessments">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="employer-assessments">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assessments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage custom technical and behavioral tests for candidates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("assessments")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'assessments' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <FileText className="w-4 h-4" />
            My Assessments
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Users className="w-4 h-4" />
            Review Submissions
          </button>

          <button
            onClick={() => navigate('/employer-assessment-builder')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 ml-2"
          >
            <Plus className="w-4 h-4" />
            Create New Assessment
          </button>
        </div>
      </div>

      {activeTab === "reviews" ? (
        <EmployerAssessmentReview />
      ) : (
        <>
          {assessments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center mt-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">No Assessments Yet</h2>
              <p className="text-gray-500 text-sm max-w-sm mb-6">
                Create customized technical tests to send to candidates directly in the chat, complete with anti-cheating protocols.
              </p>
              <button
                onClick={() => navigate('/employer-assessment-builder')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                Create Your First Assessment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              {assessments.map((a) => (
                <div key={a._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/employer-assessment-builder?id=${a._id}`)}
                      className="p-1.5 bg-gray-50 text-gray-600 hover:text-blue-600 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="p-1.5 bg-gray-50 text-gray-600 hover:text-red-600 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{a.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{a.description || 'No description provided'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 bg-gray-50/50 p-3 rounded-xl mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{a.timeLimit} mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{a.questions?.length || 0} Qs</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 text-xs">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        Availability: {formatDate(a.validFrom)} - {formatDate(a.validUntil)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${a.strictProtocols ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {a.strictProtocols ? 'Strict Mode' : 'Standard'}
                    </span>

                    <span className="text-xs font-semibold text-blue-600">
                      Pass: {a.passingScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default EmployerAssessments;
