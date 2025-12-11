import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  FileText,
  Trophy,
  Target,
} from "lucide-react";

const ProfilePreview = ({ userData, formData }) => {
  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  // Safe defaults
  const experiences = formData.experiences || [];
  const internships = formData.internships || [];
  const education = formData.education || [];
  const projects = formData.projects || [];
  const certifications = formData.certifications || [];
  const awards = formData.awards || [];
  const languages = formData.languages || [];
  const skillsArray = formData.skills
    ? typeof formData.skills === "string"
      ? formData.skills.split(",").map((s) => s.trim()).filter((s) => s)
      : formData.skills
    : [];

  // Combine education for display if needed
  const displayEducation = [...education];
  if (formData.university && !displayEducation.some(e => e.school === formData.university)) {
    displayEducation.unshift({
      school: formData.university,
      degree: formData.degree,
      startDate: "",
      endDate: `${formData.graduationMonth ? formData.graduationMonth + " " : ""}${formData.graduationYear}`,
      location: "",
      activities: ""
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full lg:w-2/5 space-y-6 h-fit sticky top-6"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header / Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              {userData?.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.fullName || "Profile"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {userData?.fullName?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {userData?.fullName || "Your Name"}
          </h2>
          <p className="text-gray-500 font-medium mb-4">
            {formData.degree || "Degree"} {formData.major ? `in ${formData.major}` : ""}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            {formData.university || "University"} {formData.graduationYear ? `• Class of ${formData.graduationYear}` : ""}
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-6">
            {(userData?.email || formData.email) && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{userData?.email || formData.email}</span>
              </div>
            )}
            {formData.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{formData.phone}</span>
              </div>
            )}
            {formData.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{formData.address}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex gap-3 mb-6">
            {formData.linkedin && (
              <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {formData.github && (
              <a href={formData.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
            {formData.website && (
              <a href={formData.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-6">
            {/* About */}
            {formData.bio && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> About
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {formData.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {skillsArray.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-500" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsArray.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {displayEducation.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" /> Education
                </h3>
                <div className="space-y-4">
                  {displayEducation.map((edu, index) => (
                    <div key={index} className="text-sm border-l-2 border-purple-100 pl-3">
                      <p className="font-semibold text-gray-800">{edu.school}</p>
                      <p className="text-gray-600">{edu.degree}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {edu.startDate ? formatDate(edu.startDate) : ""} - {edu.endDate ? formatDate(edu.endDate) : "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience & Internships */}
            {(experiences.length > 0 || internships.length > 0) && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-green-500" /> Experience
                </h3>
                <div className="space-y-4">
                  {[...experiences, ...internships].map((exp, index) => (
                    <div key={index} className="text-sm border-l-2 border-green-100 pl-3">
                      <p className="font-semibold text-gray-800">{exp.title}</p>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-500" /> Projects
                </h3>
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div key={index} className="text-sm border-l-2 border-indigo-100 pl-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          {project.name}
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </h4>
                        {(project.startDate || project.endDate) && (
                          <span className="text-xs text-gray-500">
                            {formatDate(project.startDate)} - {formatDate(project.endDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" /> Certifications
                </h3>
                <div className="space-y-3">
                  {certifications.map((cert, index) => (
                    <div key={index} className="text-sm border-l-2 border-orange-100 pl-3">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-800">{cert.name}</span>
                        <span className="text-xs text-gray-500">{formatDate(cert.issueDate)}</span>
                      </div>
                      <p className="text-gray-600">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {awards.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" /> Awards
                </h3>
                <div className="space-y-3">
                  {awards.map((award, index) => (
                    <div key={index} className="text-sm border-l-2 border-yellow-100 pl-3">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-800">{award.title}</span>
                        <span className="text-xs text-gray-500">{formatDate(award.date)}</span>
                      </div>
                      <p className="text-gray-600">{award.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" /> Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang, index) => (
                    <div key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 flex items-center gap-1">
                      <span>{lang.language}</span>
                      <span className="text-blue-300">•</span>
                      <span className="text-blue-500">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Preferences */}
            {formData.jobPreferences && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-500" /> Job Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.jobPreferences.desiredJobTitle && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Desired Role</p>
                      <p className="text-sm text-gray-800 font-medium">{formData.jobPreferences.desiredJobTitle}</p>
                    </div>
                  )}
                  {formData.jobPreferences.jobType && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Job Type</p>
                      <p className="text-sm text-gray-800 font-medium">{formData.jobPreferences.jobType}</p>
                    </div>
                  )}
                  {formData.jobPreferences.preferredLocation && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                      <p className="text-sm text-gray-800 font-medium">{formData.jobPreferences.preferredLocation}</p>
                    </div>
                  )}
                  {formData.jobPreferences.salaryExpectation && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Salary Range</p>
                      <p className="text-sm text-gray-800 font-medium">{formData.jobPreferences.salaryExpectation}</p>
                    </div>
                  )}
                  {formData.jobPreferences.industry && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Industry</p>
                      <p className="text-sm text-gray-800 font-medium">{formData.jobPreferences.industry}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Relocation</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${formData.jobPreferences.relocation ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {formData.jobPreferences.relocation ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePreview;
