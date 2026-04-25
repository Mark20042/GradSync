import {
  MapPin,
  Building2,
  Clock,
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle,
  Bookmark,
  Archive,
  Share2
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
import JobDetailsSkeleton from "./components/skeletons/JobDetailsSkeleton";

const JobDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state
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
      setLoading(true); // Start loading
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
    } finally {
      setLoading(false); // End loading
    }
  };

  const toggleSaveJob = async () => {
    if (!user) {
      toast.error("Please login to save jobs");
      return;
    }

    try {
      if (jobDetails?.isSaved) {
        await axiosInstance.delete(API_PATH.JOBS.UNSAVE_JOB(jobId));
        toast.success("Job removed from saved");
        setJobDetails(prev => ({ ...prev, isSaved: false }));
      } else {
        await axiosInstance.post(API_PATH.JOBS.SAVE_JOB(jobId));
        toast.success("Job saved successfully");
        setJobDetails(prev => ({ ...prev, isSaved: true }));
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      toast.error("Failed to update bookmark");
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
    if (jobId) { // Removed user dependency to allow public view fetching if needed
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

  // Show Skeleton if loading
  if (loading) return <JobDetailsSkeleton />;
  if (!jobDetails) return null;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      {/* Hero Section - Enhanced with Gradient */}
      <div className="bg-gradient-to-b from-white to-blue-50/30 border-b border-gray-200 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/find-jobs")}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors text-sm font-medium group"
          >
            <div className="p-1 rounded-md  group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Jobs
          </button>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Company Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex-shrink-0 bg-white p-1">
              {jobDetails?.company?.companyLogo ? (
                <img
                  src={jobDetails.company.companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center rounded-xl">
                  <Building2 className="w-10 h-10 text-indigo-300" />
                </div>
              )}
            </div>

            {/* Job Header Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    {jobDetails.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium px-2 py-1 rounded-md bg-white border border-gray-100 shadow-sm">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {jobDetails?.company?.companyName || "Company"}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-100 shadow-sm">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      {jobDetails.location}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-100 shadow-sm">
                      <Clock className="w-4 h-4 text-orange-500" />
                      Posted {moment(jobDetails.createdAt).fromNow()}
                    </span>
                  </div>
                </div>

                {/* Company & Apply Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 xl:mt-0">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {jobDetails?.company?._id && (
                      <button
                        onClick={() => navigate(`/company/${jobDetails.company._id}`)}
                        className="flex-1 sm:flex-none py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white text-blue-600 hover:border-blue-200 hover:shadow-md transition-all whitespace-nowrap"
                        title="Visit Company Profile"
                      >
                        Visit Profile
                      </button>
                    )}
                    <button
                      onClick={sendMessage}
                      className="flex-1 sm:flex-none py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white text-blue-600 hover:border-blue-200 hover:shadow-md transition-all whitespace-nowrap flex items-center justify-center gap-2"
                      title="Message Employer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  </div>

                  <div className="h-8 w-px bg-gray-300 hidden sm:block mx-1"></div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={toggleSaveJob}
                      className={`p-3 rounded-xl border transition-all ${jobDetails?.isSaved
                        ? "bg-blue-100 border-blue-200 text-blue-600 shadow-inner"
                        : "border-gray-200 text-gray-500 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-md"
                        }`}
                      title={jobDetails?.isSaved ? "Remove from Saved" : "Save Job"}
                    >
                      <Bookmark className={`w-5 h-5 ${jobDetails?.isSaved ? "fill-current" : ""}`} />
                    </button>
                    {jobDetails?.applicationStatus ? (
                      <StatusBadge status={jobDetails?.applicationStatus} />
                    ) : (
                      <button
                        onClick={applyToJob}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100 shadow-sm">
                  {jobDetails.type}
                </span>
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100 shadow-sm">
                  {jobDetails.category}
                </span>
                <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-100 shadow-sm">
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

            {/* Professional Job Overview Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors group">
                <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Salary</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {jobDetails.salaryMin && jobDetails.salaryMax
                      ? `${formatPeso(jobDetails.salaryMin)} - ${formatPeso(jobDetails.salaryMax)}`
                      : "Competitive"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors group">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Job Type</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{jobDetails.type}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors group">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Posted</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{moment(jobDetails.createdAt).format("MMM Do, YYYY")}</p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {jobDetails.description}
              </div>
            </section>

            {/* Requirements */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                Requirements
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {jobDetails.requirements}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* AI Suitability Card - Prime Spot */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-24 h-24" />
              </div>
              <h3 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Match Analysis
              </h3>
              <p className="text-indigo-100 text-sm mb-6 relative z-10">
                See how well your profile matches this job description using our AI to improve your chances.
              </p>
              <button
                onClick={() => setShowSuitabilityModal(true)}
                className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors relative z-10 flex items-center justify-center gap-2 shadow-sm"
              >
                Check My Match
              </button>
            </div>

            {/* Company Info Card (Simplified) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">About the Company</h3>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-2">
                {jobDetails?.company?.companyLogo ? (
                  <img
                    src={jobDetails.company.companyLogo}
                    alt="Company Logo"
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <Building2 className="w-7 h-7 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    {jobDetails?.company?.companyName || "Company Name"}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {jobDetails?.company?.address || jobDetails.location}
                  </p>
                </div>
              </div>
              {/* Note: Actions moved to Hero for better visibility */}
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
