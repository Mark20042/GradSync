import { useState, useEffect, useMemo } from "react";
import {
  Users,
  MapPin,
  Briefcase,
  ArrowLeft,
  Download,
  Calendar,
  Eye,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getInitials } from "../../utils/helper";
import moment from "moment";
import StatusBadge from "./../../components/StatusBadge";
import ApplicantProfilePreview from "../../components/Cards/ApplicantProfilePreview";
import RankedCandidates from "./RankedCandidates";

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

  // Group and Score applications by job
  const groupedApplications = useMemo(() => {
    const scoredApps = applications.map(app => {
      let score = 0;
      const reasons = [];

      if (app.job && app.applicant) {
        const jobSkills = app.job.skills?.map(s => s.toLowerCase()) || [];
        const jobReq = app.job.requirements?.toLowerCase() || "";
        const userSkills = app.applicant.skills?.map(s => s.toLowerCase()) || [];

        let skillMatch = 0;
        jobSkills.forEach(s => { if (userSkills.includes(s)) { score++; skillMatch++; } });
        userSkills.forEach(us => { if (!jobSkills.includes(us) && jobReq.includes(us)) { score++; skillMatch++; } });

        if (skillMatch > 0) reasons.push(`${skillMatch} matching skills`);

        const desiredTitle = app.applicant.major?.toLowerCase() || "";
        if (desiredTitle && app.job.title?.toLowerCase().includes(desiredTitle)) {
          score += 2;
          reasons.push("Matches Major");
        }
      }

      return {
        ...app,
        matchScore: score,
        matchReason: reasons.length > 0 ? reasons.join(", ") : "General Match"
      };
    });

    // We don't sort here anymore, we just return the raw scored apps. 
    // RankedCandidates component will sort them.
    scoredApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const filtered = scoredApps.filter((app) => app.job && app.job.title);

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
            <button
              className="group inline-flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
              onClick={() => navigate("/manage-jobs")}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Jobs</span>
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Applications Overview
            </h1>
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
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

                    {/* Tabs */}
                    <div className="px-6 pt-4 border-b border-gray-200 bg-white">
                      <div className="flex space-x-8">
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
                    <div className="p-6 bg-gray-50/50">
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
                              <div className="flex items-center gap-3 mt-4 md:m-0">
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
