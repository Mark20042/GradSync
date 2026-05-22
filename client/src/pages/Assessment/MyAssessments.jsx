import React, { useState, useEffect } from "react";
import { Clock, Target, Calendar, CheckCircle, FileCode, ArrowRight, ArrowLeft } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import Navbar from "../JobSeeker/components/Navbar";
import moment from "moment";

const MyAssessments = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await axiosInstance.get("/api/employer-assessments/invitations");
      setInvitations(res.data);
    } catch (error) {
      console.error("Failed to load invitations", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingInvites = invitations.filter(i => i.status === "pending");
  const pastInvites = invitations.filter(i => i.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 mt-16 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">My Assessments</h1>
          <button
            onClick={() => navigate("/find-jobs")}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </button>
        </div>
        <p className="text-gray-500 mb-8">Manage and take technical assessments assigned to you by employers.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Assessments */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Action Required
                <span className="bg-blue-100 text-blue-600 text-xs py-1 px-2.5 rounded-full">
                  {pendingInvites.length}
                </span>
              </h2>

              {pendingInvites.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                  <FileCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-900 font-bold mb-1">No pending assessments</h3>
                  <p className="text-gray-500 text-sm">You're all caught up! When an employer invites you to an assessment, it will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingInvites.map(inv => (
                    <div key={inv._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src={inv.employer?.avatar || "https://ui-avatars.com/api/?name=" + inv.employer?.companyName} 
                            alt={inv.employer?.companyName}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="font-semibold text-gray-900 text-sm">{inv.employer?.companyName}</span>
                        </div>
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                          Pending
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{inv.assessment?.title}</h3>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-1">For Job: {inv.job?.title || "General Application"}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-600 mb-5 bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500"/> {inv.assessment?.timeLimit} mins</div>
                        <div className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-indigo-500"/> Pass: {inv.assessment?.passingScore}%</div>
                        <div className="col-span-2 flex items-center gap-1.5 mt-1 text-red-500">
                          <Calendar className="w-3.5 h-3.5" /> 
                          Due: {moment(inv.dueDate).format("MMM Do, YYYY")}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <button
                          onClick={() => navigate('/employer-assessment-taking', { state: { assessmentId: inv.assessment?._id, invitationId: inv._id } })}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 group"
                        >
                          Start Assessment
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Assessments */}
            {pastInvites.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 mt-12 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-400" /> Past Assessments
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="py-3 px-4 font-semibold text-gray-600">Assessment</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">Employer</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="py-3 px-4 font-semibold text-gray-600">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pastInvites.map(inv => (
                        <tr key={inv._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-900">{inv.assessment?.title}</p>
                            <p className="text-xs text-gray-500">{inv.job?.title || "General Application"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img src={inv.employer?.avatar || "https://ui-avatars.com/api/?name=" + inv.employer?.companyName} className="w-6 h-6 rounded-md" alt="" />
                              <span className="text-gray-700 font-medium">{inv.employer?.companyName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${inv.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {moment(inv.dueDate).format("MMM Do, YYYY")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssessments;
