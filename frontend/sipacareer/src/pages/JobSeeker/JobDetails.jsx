import {
  MapPin,
  Building2,
  Clock,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle,
  Bookmark,
  Archive
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SuitabilityModal from "./components/SuitabilityModal";
import moment from "moment";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [jobDetails, setJobDetails] = useState(null);
  const [showSuitabilityModal, setShowSuitabilityModal] = useState(false);
  const [suitabilityResult, setSuitabilityResult] = useState(null);
  const [suitabilityLoading, setSuitabilityLoading] = useState(false);
  const navigate = useNavigate();

  const checkSuitability = async () => {
    setSuitabilityLoading(true);
    try {
      const response = await axiosInstance.post(API_PATH.AI.CHECK_SUITABILITY, {
        jobId,
      });
      setSuitabilityResult(response.data);
    } catch (error) {
      console.error("Error checking suitability:", error);
      toast.error("Failed to analyze suitability");
    } finally {
      setSuitabilityLoading(false);
    }
  };

  const getjobDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATH.JOBS.GET_JOB_BY_ID(jobId),
        {
          params: { userId: user?._id || null },
        }
      );
      setJobDetails(response.data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Error fetching job details");
    }
  };

  const applyToJob = async () => {
    try {
      if (jobId) {
        await axiosInstance.post(API_PATH.APPLICATIONS.APPLY_TO_JOB(jobId));
        toast.success("Applied to job successfully");
      }
      getjobDetailsById();
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Error applying to job");
    }
  };

  const sendMessage = async () => {
    if (!jobId) return;

    try {
      const response = await axiosInstance.post(
        API_PATH.CHAT.FIND_OR_CREATE_CONVERSATION,
        { jobId }
      );

      const conversation = response.data;
      const recipient = conversation.participants.find(
        (p) => p._id !== user._id
      );

      if (!recipient) {
        toast.error("Could not find chat recipient.");
        return;
      }

      toast.success("Opening chat...");
      navigate(`/messages/${conversation._id}`, {
        state: {
          recipient: recipient,
          job: conversation.job,
        },
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Could not start chat.");
    }
  };

  useEffect(() => {
    if (jobId && user) {
      getjobDetailsById();
    }
  }, [jobId, user]);

  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  if (!jobDetails) return null;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/find-jobs")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Company Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-shrink-0 bg-white p-1">
              {jobDetails?.company?.companyLogo ? (
                <img
                  src={jobDetails.company.companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl">
                  <Building2 className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            {/* Job Header Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {jobDetails.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {jobDetails?.company?.companyName || "Company"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {jobDetails.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Posted {moment(jobDetails.createdAt).fromNow()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-2 md:mt-0">

                  <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  {jobDetails?.applicationStatus ? (
                    <StatusBadge status={jobDetails?.applicationStatus} />
                  ) : (
                    <button
                      onClick={applyToJob}
                      className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                  {jobDetails.type}
                </span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100">
                  {jobDetails.category}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-100">
                  {jobDetails.salaryMin && jobDetails.salaryMax
                    ? `${formatPeso(jobDetails.salaryMin)} - ${formatPeso(jobDetails.salaryMax)}`
                    : "Competitive Salary"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {jobDetails.description}
              </div>
            </section>

            {/* Requirements */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                Requirements
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {jobDetails.requirements}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* AI Suitability Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                {/* <Archive className="w-24 h-24" /> */}
              </div>
              <h3 className="text-lg font-bold mb-2 relative z-10">AI Match Analysis</h3>
              <p className="text-indigo-100 text-sm mb-6 relative z-10">
                See how well your profile matches this job description using our AI.
              </p>
              <button
                onClick={() => setShowSuitabilityModal(true)}
                className="w-full bg-white text-indigo-600 font-semibold py-2.5 rounded-xl hover:bg-indigo-50 transition-colors relative z-10 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Check My Match
              </button>
            </div>

            {/* Company Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">About the Company</h3>
              <div className="flex items-center gap-3 mb-4">
                {jobDetails?.company?.companyLogo ? (
                  <img
                    src={jobDetails.company.companyLogo}
                    alt="Company Logo"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {jobDetails?.company?.companyName || "Company Name"}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {jobDetails?.company?.address || jobDetails.location}
                  </p>
                </div>
              </div>

              {jobDetails?.company?._id && (
                <button
                  onClick={() => navigate(`/company/${jobDetails.company._id}`)}
                  className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  Visit Profile
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              )}

              <button
                onClick={sendMessage}
                className="w-full mt-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message Employer
              </button>
            </div>

            {/* Job Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Salary</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {jobDetails.salaryMin && jobDetails.salaryMax
                        ? `${formatPeso(jobDetails.salaryMin)} - ${formatPeso(jobDetails.salaryMax)}`
                        : "Competitive"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Posted Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {moment(jobDetails.createdAt).format("MMMM Do, YYYY")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Job Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {jobDetails.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suitability Modal */}
      <SuitabilityModal
        isOpen={showSuitabilityModal}
        onClose={() => setShowSuitabilityModal(false)}
        loading={suitabilityLoading}
        result={suitabilityResult}
        onStartAnalysis={checkSuitability}
      />
    </div>
  );
};

export default JobDetails;
