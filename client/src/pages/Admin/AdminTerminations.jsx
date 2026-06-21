import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import {
  AlertTriangle,
  Search,
  Building2,
  UserX,
  Star,
  Eye,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";

const AdminTerminations = () => {
  const [terminations, setTerminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchTerminations();
  }, []);

  const fetchTerminations = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/terminations");
      setTerminations(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch terminations.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTerminations = terminations.filter((t) => {
    const s = searchTerm.toLowerCase();
    return (
      t.employee?.fullName?.toLowerCase().includes(s) ||
      t.company?.companyName?.toLowerCase().includes(s) ||
      t.job?.title?.toLowerCase().includes(s) ||
      t.terminationReason?.label?.toLowerCase().includes(s)
    );
  });

  return (
    <DashboardLayout activeMenu="admin-terminations">
      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserX className="w-6 h-6 text-red-600" />
              Terminations & Reviews
            </h1>
            <p className="text-gray-500 mt-1">
              Monitor all employment terminations, employer feedback, and jobseeker reviews.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by company, employee, job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company & Job</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTerminations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No terminations found.
                      </td>
                    </tr>
                  ) : (
                    filteredTerminations.map((term) => (
                      <tr key={term._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={term.employee?.avatar || "/default-avatar.png"}
                              alt=""
                              className="w-8 h-8 rounded-full bg-gray-100 object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{term.employee?.fullName || "Deleted User"}</p>
                              <p className="text-xs text-gray-500">{term.employee?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-semibold text-gray-900 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {term.company?.companyName || "Deleted Company"}
                            </p>
                            <p className="text-xs text-gray-500">{term.job?.title || "Deleted Job"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                            {term.terminationReason?.label || "Unspecified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {term.terminationDate ? new Date(term.terminationDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedReview(term)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View Reviews
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Termination & Feedback Details</h3>
                  <p className="text-sm text-gray-500">Full transparency report</p>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Employer Feedback */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    Employer Review (About Employee)
                  </h4>
                  {selectedReview.employerRating ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < selectedReview.employerRating ? "fill-current" : "text-gray-300"}`} />
                          ))}
                        </div>
                        <span className="font-bold text-gray-900">{selectedReview.employerRating}/5</span>
                      </div>
                      {selectedReview.employerTags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedReview.employerTags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white border border-indigo-100 rounded text-xs text-indigo-700 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-indigo-50">
                        {selectedReview.employerFeedback || "No text feedback provided."}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">The employer has not submitted a review yet.</p>
                  )}
                </div>

                {/* Jobseeker Feedback */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-purple-500" />
                    Jobseeker Review (About Company)
                  </h4>
                  {selectedReview.jobseekerRating ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < selectedReview.jobseekerRating ? "fill-current" : "text-gray-300"}`} />
                          ))}
                        </div>
                        <span className="font-bold text-gray-900">{selectedReview.jobseekerRating}/5</span>
                      </div>
                      {selectedReview.jobseekerTags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedReview.jobseekerTags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white border border-purple-100 rounded text-xs text-purple-700 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-purple-50">
                        {selectedReview.jobseekerFeedback || "No text feedback provided."}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">The jobseeker has not submitted a review yet.</p>
                  )}
                </div>

              </div>
              
              <div className="p-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminTerminations;
