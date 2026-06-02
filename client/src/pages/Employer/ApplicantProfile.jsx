import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { getInitials } from "../../utils/helper";
import moment from "moment";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Shield,
  BarChart3,
  Award,
  X,
  Eye,
  MapPin,
  Sparkles,
  BrainCircuit,
} from "lucide-react";
import { getBadgeComponent } from "../../components/Badges/SkillBadges";
import EmployerSuitabilityModal from "./components/EmployerSuitabilityModal";
import toast from "react-hot-toast";

const ApplicantProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const applicantId = location.state?.applicantId || null;

  const [applicant, setApplicant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [interviewScores, setInterviewScores] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // AI Suitability
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasPromptedFeedback, setHasPromptedFeedback] = useState(false);

  useEffect(() => {
    if (!showAiModal && aiAnalysis && !hasPromptedFeedback) {
      setHasPromptedFeedback(true);
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("openFeedbackModal", {
            detail: { featureName: "Employer Suitability Analysis" },
          })
        );
      }, 500);
    }
  }, [showAiModal, aiAnalysis, hasPromptedFeedback]);

  const handleOpenAiAnalysis = async () => {
    setShowAiModal(true);
    if (!aiAnalysis) {
      setIsAiLoading(true);
      try {
        const response = await axiosInstance.post(API_PATH.AI.CHECK_CANDIDATE_SUITABILITY, {
          jobId: applicant.job._id,
          candidateId: applicant.applicant._id
        });
        setAiAnalysis(response.data);
      } catch (error) {
        console.error("Analysis failed:", error);
        toast.error("Failed to analyze candidate");
        setShowAiModal(false);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const [assessmentSubmissions, setAssessmentSubmissions] = useState([]);

  const fetchApplicant = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATH.APPLICATIONS.GET_APPLICATION_BY_ID(applicantId),
      );
      setApplicant(response.data);
    } catch (error) {
      console.error("Error fetching applicant:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicantId) fetchApplicant();
  }, [applicantId]);

  // Fetch interview scores for the applicant
  useEffect(() => {
    const fetchInterviewScores = async () => {
      if (!applicant?.applicant?._id) return;
      try {
        const res = await axiosInstance.get(
          API_PATH.INTERVIEW.GET_GRADUATE_INTERVIEWS(applicant.applicant._id),
        );
        setInterviewScores(res.data);
      } catch (error) {
        console.error("Error fetching interview scores:", error);
      }
    };

    const fetchAssessmentSubmissions = async () => {
      if (!applicant?.applicant?._id) return;
      try {
        const res = await axiosInstance.get(`/api/assessments/submissions/user/${applicant.applicant._id}`);
        setAssessmentSubmissions(res.data || []);
      } catch (error) {
        console.error("Error fetching assessment submissions:", error);
      }
    };

    fetchInterviewScores();
    fetchAssessmentSubmissions();
  }, [applicant]);

  // Helper to get submission details for selected skill
  const getSelectedSkillDetails = () => {
    if (!selectedSkill) return null;
    const submission = assessmentSubmissions.find(s => s.assessment?.skill === selectedSkill.skill);
    return {
      ...selectedSkill,
      categoryScores: selectedSkill.categoryScores && Object.keys(selectedSkill.categoryScores).length > 0 
        ? selectedSkill.categoryScores 
        : submission?.categoryScores,
      categoryInterpretation: selectedSkill.categoryInterpretation || submission?.categoryInterpretation
    };
  };
  const activeSkillDetails = getSelectedSkillDetails();

  return (
    <DashboardLayout activeMenu="messages">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          className="group flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-white bg-white/50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 border border-gray-200 hover:border-transparent rounded-xl transition-all duration-300 shadow-md hover:shadow-lg mb-6"
          onClick={() => navigate("/applicants")}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : !applicant ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-600">No applicant data found.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
              {applicant.applicant.avatar ? (
                <img
                  src={applicant.applicant.avatar}
                  alt={applicant.applicant.fullName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-blue-600 font-semibold text-2xl">
                    {getInitials(applicant.applicant.fullName)}
                  </span>
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {applicant.applicant.fullName}
                </h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {applicant.applicant.degree}
                  </span>
                  • {applicant.applicant.email}
                </p>
                {applicant.applicant.universityAddress && (
                  <p className="text-gray-500 text-sm mt-1">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {applicant.applicant.universityAddress}
                  </p>
                )}
                <div className="mt-3 flex gap-3">
                  {applicant.applicant.resume && (
                    <a
                      href={applicant.applicant.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Resume
                    </a>
                  )}
                  {applicant.applicant.website && (
                    <a
                      href={applicant.applicant.website.startsWith("http") ? applicant.applicant.website : `https://${applicant.applicant.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Website
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        const response = await axiosInstance.post(
                          API_PATH.CHAT.FIND_OR_CREATE_CONVERSATION,
                          {
                            applicantId: applicant.applicant._id,
                            jobId: applicant.job._id,
                          },
                        );
                        if (response.status === 200) {
                          navigate("/employer-messages", {
                            state: {
                              conversationId: response.data._id,
                              jobId: applicant.job._id,
                            },
                          });
                        }
                      } catch (error) {
                        console.error("Error starting conversation:", error);
                        navigate("/employer-messages");
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {applicant.applicant.bio && (
              <div className="bg-white shadow rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  About
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {applicant.applicant.bio}
                </p>
              </div>
            )}

            {/* AI Analysis Banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm mb-6">
              <div>
                <h5 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  AI Suitability Check
                </h5>
                <p className="text-sm font-medium text-indigo-600/80 uppercase tracking-wide">Evaluate match with job requirements</p>
              </div>
              <button
                onClick={handleOpenAiAnalysis}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md shadow-indigo-200 flex items-center gap-2 active:scale-95"
              >
                <BrainCircuit className="w-5 h-5" />
                {aiAnalysis ? "View Analysis" : "Run Analysis"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="md:col-span-2 space-y-6">
                {/* Application Info */}
                <div className="bg-white shadow rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Application Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Position Applied For</p>
                      <p className="font-medium text-gray-900">
                        {applicant.job?.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Applied Date</p>
                      <p className="font-medium text-gray-900">
                        {moment(applicant.createdAt).format("MMMM Do, YYYY")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Current Status</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                          applicant.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : applicant.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {applicant.status.charAt(0).toUpperCase() +
                          applicant.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                {applicant.applicant.experiences?.length > 0 && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Experience
                    </h2>
                    <div className="space-y-4">
                      {applicant.applicant.experiences.map((exp, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {exp.jobTitle}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {exp.company}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {moment(exp.startDate).format("MMM YYYY")} -{" "}
                              {exp.endDate
                                ? moment(exp.endDate).format("MMM YYYY")
                                : "Present"}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                              {exp.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internships */}
                {applicant.applicant.internships?.length > 0 && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Internships
                    </h2>
                    <div className="space-y-4">
                      {applicant.applicant.internships.map(
                        (internship, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {internship.jobTitle}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {internship.company}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {moment(internship.startDate).format(
                                  "MMM YYYY",
                                )}{" "}
                                -{" "}
                                {internship.endDate
                                  ? moment(internship.endDate).format(
                                      "MMM YYYY",
                                    )
                                  : "Present"}
                              </p>
                              <p className="text-gray-600 text-sm mt-2">
                                {internship.description}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {applicant.applicant.education?.length > 0 && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Education
                    </h2>
                    <div className="space-y-4">
                      {applicant.applicant.education.map((edu, index) => (
                        <div key={index}>
                          <h3 className="font-medium text-gray-900">
                            {edu.degree}
                          </h3>
                          <p className="text-gray-600 text-sm">{edu.school}</p>
                          <p className="text-gray-400 text-xs">
                            {edu.graduationYear}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {applicant.applicant.projects?.length > 0 && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Projects
                    </h2>
                    <div className="space-y-4">
                      {applicant.applicant.projects.map((proj, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900 text-base">
                                {proj.name}
                              </h3>
                              {proj.startDate && (
                                <p className="text-gray-400 text-xs mt-0.5">
                                  {moment(proj.startDate).format("MMM YYYY")} -{" "}
                                  {proj.endDate
                                    ? moment(proj.endDate).format("MMM YYYY")
                                    : "Present"}
                                </p>
                              )}
                            </div>
                            {proj.url && (
                              <a
                                href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline flex items-center gap-1"
                              >
                                View Project
                              </a>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mt-2">
                            {proj.description}
                          </p>

                          {proj.technologies &&
                            proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {proj.technologies.map((tech, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2 py-1 rounded bg-gray-50 text-gray-600 text-xs border border-gray-200"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards & Certifications */}
                {(applicant.applicant.awards?.length > 0 ||
                  applicant.applicant.certifications?.length > 0) && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Awards & Certifications
                    </h2>
                    <div className="space-y-4">
                      {applicant.applicant.awards?.map((award, index) => (
                        <div key={`award-${index}`}>
                          <h3 className="font-medium text-gray-900">
                            {award.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {award.issuer}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {moment(award.date).format("MMM YYYY")}
                          </p>
                        </div>
                      ))}
                      {applicant.applicant.certifications?.map(
                        (cert, index) => (
                          <div key={`cert-${index}`}>
                            <h3 className="font-medium text-gray-900">
                              {cert.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {cert.issuer}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {moment(cert.date).format("MMM YYYY")}
                            </p>
                            {cert.credentialURL && (
                              <a
                                href={cert.credentialURL.startsWith('http') ? cert.credentialURL : `https://${cert.credentialURL}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline inline-flex items-center mt-1"
                              >
                                View Credential
                              </a>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white shadow rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Contact Info
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {applicant.applicant.email}
                      </p>
                    </div>
                    {applicant.applicant.phone && (
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {applicant.applicant.phone}
                        </p>
                      </div>
                    )}
                    {applicant.applicant.address && (
                      <div>
                        <p className="text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">
                          {applicant.applicant.address}
                        </p>
                      </div>
                    )}
                    {applicant.applicant.birthdate && (
                      <div>
                        <p className="text-gray-500">Birthdate</p>
                        <p className="font-medium text-gray-900">
                          {moment(applicant.applicant.birthdate).format(
                            "MMMM Do, YYYY",
                          )}
                        </p>
                      </div>
                    )}
                    {applicant.applicant.linkedin && (
                      <div>
                        <p className="text-gray-500">LinkedIn</p>
                        <a
                          href={applicant.applicant.linkedin.startsWith('http') ? applicant.applicant.linkedin : `https://${applicant.applicant.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                    {applicant.applicant.github && (
                      <div>
                        <p className="text-gray-500">GitHub</p>
                        <a
                          href={applicant.applicant.github.startsWith('http') ? applicant.applicant.github : `https://${applicant.applicant.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block"
                        >
                          View GitHub
                        </a>
                      </div>
                    )}
                    {applicant.applicant.website && (
                      <div>
                        <p className="text-gray-500">Website</p>
                        <a
                          href={applicant.applicant.website.startsWith('http') ? applicant.applicant.website : `https://${applicant.applicant.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block"
                        >
                          View Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {applicant.applicant.skills?.length > 0 && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {applicant.applicant.skills.map((skill, index) => {
                        // Check if skill is verified
                        const verifiedSkill =
                          applicant.applicant.verifiedSkills?.find(
                            (v) =>
                              v.skill?.toLowerCase() === skill?.toLowerCase(),
                          );
                        const isVerified = !!verifiedSkill;

                        return (
                          <div
                            key={index}
                            onClick={() => isVerified && setSelectedSkill(verifiedSkill)}
                            className={`relative px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                              isVerified
                                ? "bg-green-600 text-white shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                                : "bg-gray-100 text-gray-600 border border-gray-200 cursor-default"
                            }`}
                            title={
                              isVerified
                                ? "Click to view details"
                                : "Unverified Skill"
                            }
                          >
                            {isVerified ? (
                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span>{skill}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span>Verified</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          <span>Unverified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages */}
                {applicant.applicant.languages?.length > 0 && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Languages
                    </h2>
                    <div className="space-y-2">
                      {applicant.applicant.languages.map((lang, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="font-medium text-gray-900">
                            {lang.language}
                          </span>
                          <span className="text-gray-500">
                            {lang.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Performance */}
                {interviewScores.length > 0 && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Interview Performance
                    </h2>
                    <div className="space-y-4">
                      {/* Average Score */}
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                          Average AI Score
                        </p>
                        <p className="text-3xl font-extrabold text-blue-700">
                          {Math.round(
                            interviewScores.reduce(
                              (sum, i) => sum + (i.aiScore || 0),
                              0,
                            ) / interviewScores.length,
                          )}
                          <span className="text-base text-blue-400">/100</span>
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          {interviewScores.length} interview
                          {interviewScores.length !== 1 ? "s" : ""} completed
                        </p>
                      </div>

                      {/* Individual Scores */}
                      <div className="space-y-2">
                        {interviewScores.slice(0, 5).map((interview) => {
                          const scoreColor =
                            interview.aiScore >= 80
                              ? "bg-emerald-500"
                              : interview.aiScore >= 60
                                ? "bg-blue-500"
                                : interview.aiScore >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500";
                          const scoreBadge =
                            interview.aiScore >= 80
                              ? "bg-emerald-100 text-emerald-700"
                              : interview.aiScore >= 60
                                ? "bg-blue-100 text-blue-700"
                                : interview.aiScore >= 40
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700";
                          return (
                            <div
                              key={interview._id}
                              className="border border-gray-100 rounded-xl bg-gray-50/50 overflow-hidden transition-all"
                            >
                              <div className="flex items-center gap-3 p-3 hover:bg-gray-100/80 transition-colors">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {interview.roleName || "General"}
                                  </p>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div
                                      className={`h-1.5 rounded-full ${scoreColor}`}
                                      style={{ width: `${interview.aiScore}%` }}
                                    />
                                  </div>
                                </div>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded-lg ${scoreBadge}`}
                                >
                                  {interview.aiScore}
                                </span>
                                <button
                                  onClick={() =>
                                    setSelectedInterview(interview)
                                  }
                                  className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                                  title="View Full Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal for Interview Details */}
            {selectedInterview && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setSelectedInterview(null)}
              >
                <div
                  className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedInterview.roleName || "General"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Interview evaluated on{" "}
                        {moment(selectedInterview.createdAt).format(
                          "MMMM Do, YYYY",
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedInterview(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-fit transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto p-6 bg-gray-50/50">
                    <div className="mb-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                          AI Summary
                        </h4>
                        <span
                          className={`text-sm font-bold px-3 py-1 rounded-lg ${
                            selectedInterview.aiScore >= 80
                              ? "bg-emerald-100 text-emerald-700"
                              : selectedInterview.aiScore >= 60
                                ? "bg-blue-100 text-blue-700"
                                : selectedInterview.aiScore >= 40
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          Score: {selectedInterview.aiScore}/100
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedInterview.aiFeedback?.summary ||
                          "No summary available."}
                      </p>
                    </div>

                    {/* Category Performance */}
                    {selectedInterview.aiFeedback?.categoryScores && Object.keys(selectedInterview.aiFeedback.categoryScores).length > 0 && (
                      <div className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                        <h4 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Category Performance
                        </h4>
                        <div className="flex flex-wrap gap-3 mb-4">
                          {Object.entries(selectedInterview.aiFeedback.categoryScores).map(([cat, score]) => (
                            <div key={cat} className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-indigo-50 flex items-center gap-2 text-sm">
                              <span className="font-semibold text-indigo-900">{cat}</span>
                              <div className="w-px h-3 bg-indigo-100"></div>
                              <span className={`font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {score}%
                              </span>
                            </div>
                          ))}
                        </div>
                        {selectedInterview.aiFeedback?.categoryInterpretation && (
                          <p className="text-sm text-indigo-800 font-medium italic">
                            💡 "{selectedInterview.aiFeedback.categoryInterpretation}"
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider pl-1">
                        Q&amp;A Breakdown (
                        {selectedInterview.answers?.length || 0})
                      </h4>
                      <div className="space-y-4">
                        {selectedInterview.answers?.map((answer, idx) => {
                          const ansColor =
                            answer.score >= 80
                              ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                              : answer.score >= 60
                                ? "text-blue-700 bg-blue-50 border-blue-100"
                                : answer.score >= 40
                                  ? "text-amber-700 bg-amber-50 border-amber-100"
                                  : "text-red-700 bg-red-50 border-red-100";

                          return (
                            <div
                              key={idx}
                              className={`bg-white rounded-xl p-4 border ${ansColor} shadow-sm transition-all hover:shadow-md`}
                            >
                              <div className="flex justify-between items-start mb-3 gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-800 leading-snug">
                                    Q{idx + 1}: {answer.questionText}
                                  </p>
                                  {answer.category && (
                                    <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                                      {answer.category}
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${ansColor.replace("border-", "border").replace(" shadow-sm transition-all hover:shadow-md", "")} flex-shrink-0`}
                                >
                                  {answer.score}/100
                                </span>
                              </div>
                              <div className="space-y-3 bg-gray-50/80 rounded-lg p-3">
                                <p className="text-sm text-gray-700">
                                  <span className="font-bold text-gray-900 block mb-1">
                                    Candidate Answer:
                                  </span>
                                  {answer.candidateAnswer || (
                                    <span className="italic text-gray-400">
                                      Skipped or no answer recorded.
                                    </span>
                                  )}
                                </p>
                                <hr className="border-gray-200" />
                                <p className="text-sm text-gray-700">
                                  <span className="font-bold text-gray-900 block mb-1">
                                    AI Feedback:
                                  </span>
                                  {answer.feedback}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Skill Details Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedSkill(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                {selectedSkill.skill}
              </h3>
              <button onClick={() => setSelectedSkill(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                  <p className="text-sm text-blue-600 font-bold mb-1 uppercase tracking-wider">Assessment Score</p>
                  <p className="text-3xl font-black text-blue-700">{selectedSkill.score || 0}%</p>
                </div>
                <div className="flex-1 border rounded-xl p-4 text-center flex flex-col items-center justify-center bg-green-50 border-green-100">
                  <p className="text-sm font-bold mb-1 uppercase tracking-wider text-green-600">Status</p>
                  <div className="flex items-center justify-center gap-2 text-xl font-bold capitalize text-green-700">
                    <CheckCircle size={22} /> Passed
                  </div>
                </div>
              </div>

              {activeSkillDetails?.categoryScores && Object.keys(activeSkillDetails.categoryScores).length > 0 ? (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-sm mt-4">
                  <h4 className="text-sm font-bold text-indigo-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Category Performance
                  </h4>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {Object.entries(activeSkillDetails.categoryScores).map(([cat, score]) => (
                      <div key={cat} className="bg-white px-3 py-2 rounded-lg shadow-sm border border-indigo-50 flex items-center gap-3 text-sm flex-1 min-w-[140px] justify-between">
                        <span className="font-semibold text-indigo-900">{cat}</span>
                        <span className={`font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {score}%
                        </span>
                      </div>
                    ))}
                  </div>
                  {activeSkillDetails.categoryInterpretation && (
                    <div className="bg-white/60 p-3 rounded-lg border border-indigo-50">
                      <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                        💡 {activeSkillDetails.categoryInterpretation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Interpretation</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedSkill.level === "Entry" && "Demonstrates fundamental knowledge and basic understanding of core concepts."}
                    {selectedSkill.level === "Mid" && "Shows practical experience, capable of applying knowledge to solve standard problems independently."}
                    {selectedSkill.level === "Senior" && "Exhibits advanced expertise, capable of designing solutions and guiding others."}
                    {selectedSkill.level === "Expert" && "Demonstrates mastery, deep subject matter expertise, and thought leadership in this area."}
                  </p>
                </div>
              )}
              
              {selectedSkill.assessmentTitle && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Assessment</p>
                  <p className="text-sm text-gray-600">{selectedSkill.assessmentTitle}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suitability Modal */}
      <EmployerSuitabilityModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        loading={isAiLoading}
        result={aiAnalysis}
        candidateName={applicant?.applicant?.fullName}
        jobTitle={applicant?.job?.title}
      />
    </DashboardLayout>
  );
};

export default ApplicantProfile;
