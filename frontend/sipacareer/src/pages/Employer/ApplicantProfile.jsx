import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { getInitials } from "../../utils/helper";
import moment from "moment";
import { ArrowLeft } from "lucide-react";

const ApplicantProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const applicantId = location.state?.applicantId || null;

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApplicant = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATH.APPLICATIONS.GET_APPLICATION_BY_ID(applicantId)
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
                  {applicant.applicant.portfolio && (
                    <a
                      href={applicant.applicant.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Portfolio
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        const response = await axiosInstance.post(API_PATH.CHAT.FIND_OR_CREATE_CONVERSATION, {
                          applicantId: applicant.applicant._id,
                          jobId: applicant.job._id
                        });
                        if (response.status === 200) {
                          navigate("/employer-messages", {
                            state: {
                              conversationId: response.data._id,
                              jobId: applicant.job._id
                            }
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
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {applicant.applicant.bio}
                </p>
              </div>
            )}

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
                      <p className="font-medium text-gray-900">{applicant.job?.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Applied Date</p>
                      <p className="font-medium text-gray-900">
                        {moment(applicant.createdAt).format("MMMM Do, YYYY")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Current Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${applicant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        applicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
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
                            <h3 className="font-medium text-gray-900">{exp.jobTitle}</h3>
                            <p className="text-gray-600 text-sm">{exp.company}</p>
                            <p className="text-gray-400 text-xs">
                              {moment(exp.startDate).format("MMM YYYY")} -{" "}
                              {exp.endDate ? moment(exp.endDate).format("MMM YYYY") : "Present"}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
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
                      {applicant.applicant.internships.map((internship, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{internship.jobTitle}</h3>
                            <p className="text-gray-600 text-sm">{internship.company}</p>
                            <p className="text-gray-400 text-xs">
                              {moment(internship.startDate).format("MMM YYYY")} -{" "}
                              {internship.endDate ? moment(internship.endDate).format("MMM YYYY") : "Present"}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">{internship.description}</p>
                          </div>
                        </div>
                      ))}
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
                          <h3 className="font-medium text-gray-900">{edu.degree}</h3>
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
                              <h3 className="font-medium text-gray-900 text-base">{proj.name}</h3>
                              {proj.startDate && (
                                <p className="text-gray-400 text-xs mt-0.5">
                                  {moment(proj.startDate).format("MMM YYYY")} - {proj.endDate ? moment(proj.endDate).format("MMM YYYY") : "Present"}
                                </p>
                              )}
                            </div>
                            {proj.url && (
                              <a
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline flex items-center gap-1"
                              >
                                View Project
                              </a>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mt-2">{proj.description}</p>

                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {proj.technologies.map((tech, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-gray-50 text-gray-600 text-xs border border-gray-200">
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
                {(applicant.applicant.awards?.length > 0 || applicant.applicant.certifications?.length > 0) && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Awards & Certifications
                    </h2>
                    <div className="space-y-4">
                      {applicant.applicant.awards?.map((award, index) => (
                        <div key={`award-${index}`}>
                          <h3 className="font-medium text-gray-900">{award.title}</h3>
                          <p className="text-gray-600 text-sm">{award.issuer}</p>
                          <p className="text-gray-400 text-xs">
                            {moment(award.date).format("MMM YYYY")}
                          </p>
                        </div>
                      ))}
                      {applicant.applicant.certifications?.map((cert, index) => (
                        <div key={`cert-${index}`}>
                          <h3 className="font-medium text-gray-900">{cert.name}</h3>
                          <p className="text-gray-600 text-sm">{cert.issuer}</p>
                          <p className="text-gray-400 text-xs">
                            {moment(cert.date).format("MMM YYYY")}
                          </p>
                        </div>
                      ))}
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
                      <p className="font-medium text-gray-900">{applicant.applicant.email}</p>
                    </div>
                    {applicant.applicant.phone && (
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{applicant.applicant.phone}</p>
                      </div>
                    )}
                    {applicant.applicant.address && (
                      <div>
                        <p className="text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">{applicant.applicant.address}</p>
                      </div>
                    )}
                    {applicant.applicant.linkedin && (
                      <div>
                        <p className="text-gray-500">LinkedIn</p>
                        <a href={applicant.applicant.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {applicant.applicant.skills?.length > 0 && (
                  <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {applicant.applicant.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
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
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-900">{lang.language}</span>
                          <span className="text-gray-500">{lang.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicantProfile;
