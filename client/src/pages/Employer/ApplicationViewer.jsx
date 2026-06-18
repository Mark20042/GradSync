import { useState, useEffect, useMemo } from "react";
import {
  Users,
  MapPin,
  Briefcase,
  ArrowLeft,
  Download,
  Calendar,
  Eye,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  UserX,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getInitials } from "../../utils/helper";
import moment from "moment";
import StatusBadge from "./../../components/StatusBadge";
import ApplicantProfilePreview from "./components/ApplicantProfilePreview";
import RankedCandidates from "./RankedCandidates";
import Breadcrumbs from "../../components/Breadcrumbs";

const ApplicationViewer = () => {
  const location = useLocation();
  const jobId = location.state?.jobId || null;

  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATH.APPLICATIONS.GET_ALL_APPLICATIONS(jobId)
      );
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) fetchApplications();
    else navigate("/manage-jobs");
  }, [jobId, navigate]);

  const groupedApplications = useMemo(() => {
    // Backend now provides matchScore and matchReason via aggregation
    const filtered = applications.filter((app) => app.job && app.job.title);

    return filtered.reduce((acc, app) => {
      const jobId = app.job._id;
      if (!acc[jobId]) {
        acc[jobId] = {
          job: app.job,
          applications: [],
        };
      }
      acc[jobId].applications.push(app);
      return acc;
    }, {});
  }, [applications]);

  const handleDownloadResume = (resumeUrl) => {
    if (!resumeUrl) return;
    window.open(resumeUrl, "_blank");
  };

  const currentJobTitle = applications.length > 0 && applications[0].job ? applications[0].job.title : "Applications Overview";

  return (
    <DashboardLayout activeMenu="manage-jobs">
      {loading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className=" mb-8 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs 
              items={[
                { label: 'Manage Jobs', onClick: () => navigate('/manage-jobs') },
                { label: currentJobTitle }
              ]} 
            />

            <div className="flex justify-between items-center mt-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {currentJobTitle}
              </h1>
              <button
                className="group inline-flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                onClick={() => navigate("/manage-jobs")}
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to Jobs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pb-8">
          {Object.keys(groupedApplications).length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <Users className="mx-auto h-24 w-24 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No applications available
              </h3>
              <p className="mt-2 text-gray-500">
                No applications found at the moment
              </p>
            </div>
          ) : (
            // Applications by Job
            <div className="space-y-8">
              {Object.values(groupedApplications).map(
                ({ job, applications }) => (
                  <div
                    key={job._id}
                    className="p-4 bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    {/* Job Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left side: Job title + details */}
                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            {job.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-blue-100">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              <span className="text-sm">{job.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{job.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Application count */}
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 self-start sm:self-center">
                          <span className="text-sm text-white font-medium">
                            {applications.length} Application
                            {applications.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Counters */}
                    <div className="px-3 sm:px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Applied", color: "bg-blue-100 text-blue-700", icon: Send },
                          { label: "In Review", color: "bg-amber-100 text-amber-700", icon: Clock },
                          { label: "Accepted", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
                          { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
                          { label: "Terminated", color: "bg-slate-200 text-slate-700", icon: UserX },
                        ].map(({ label, color, icon: Icon }) => {
                          const count = applications.filter(a => a.status === label).length;
                          return (
                            <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${color}`}>
                              <Icon className="w-3.5 h-3.5" />
                              {count} {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-3 sm:px-6 pt-4 border-b border-gray-200 bg-white">
                      <div className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide whitespace-nowrap">
                        <button
                          onClick={() => setActiveTab("all")}
                          className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "all" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          All Applications
                          {activeTab === "all" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("ranked")}
                          className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "ranked" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                          🏆 Top Ranked Candidates
                          {activeTab === "ranked" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Applications List */}
                    <div className="p-3 sm:p-6 bg-gray-50/50">
                      {activeTab === "ranked" ? (
                        <RankedCandidates
                          applications={applications}
                          handleDownloadResume={handleDownloadResume}
                          setSelectedApplicant={setSelectedApplicant}
                        />
                      ) : (
                        <div className="space-y-4">
                          {applications.filter((app) => app.applicant).map((application) => (
                            <div
                              key={application._id}
                              className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                  {application.applicant.avatar ? (
                                    <img
                                      src={application.applicant.avatar}
                                      alt={application.applicant.fullName}
                                      className="h-12 w-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-600 font-semibold text-lg">
                                        {getInitials(
                                          application.applicant.fullName
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Applicant Info */}
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {application.applicant.fullName}
                                  </h3>
                                  <p className="text-gray-600 text-sm truncate">
                                    {application.applicant.email}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      Applied{" "}
                                      {moment(application.createdAt)?.format(
                                        "Do MMM, YYYY"
                                      )}
                                    </span>
                                  </div>

                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 mt-4 md:m-0">
                                <StatusBadge status={application.status} />
                                <button
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors "
                                  onClick={() =>
                                    handleDownloadResume(
                                      application.applicant.resume
                                    )
                                  }
                                >
                                  <Download className="w-4 h-4" />
                                  Resume
                                </button>

                                <button
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                  onClick={() =>
                                    setSelectedApplicant(application)
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                  Preview
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedApplicant && (
        <ApplicantProfilePreview
          selectedApplicant={selectedApplicant}
          setSelectedApplicant={setSelectedApplicant}
          handleDownloadResume={handleDownloadResume}
          handleClose={() => {
            setSelectedApplicant(null);
            fetchApplications();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ApplicationViewer;
