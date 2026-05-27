import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, Save } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";
import ResumeBuilderSkeleton from "./components/skeletons/ResumeBuilderSkeleton";
import { pdf } from "@react-pdf/renderer";
import ResumePDFx from "./ResumePDFx";
import toast from "react-hot-toast";

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.AUTH.GET_PROFILE);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      const blob = await pdf(<ResumePDFx user={user} />).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Error printing resume:", error);
      toast.error("Failed to print resume");
    }
  };

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      // Delete old resume from Cloudinary if exists
      if (user?.resume) {
        try {
          await axiosInstance.delete(API_PATH.AUTH.DELETE_RESUME, {
            data: { resumeUrl: user.resume },
          });
        } catch (deleteError) {
          console.warn("Could not delete old resume:", deleteError);
          // Continue with upload even if delete fails
        }
      }

      // Generate PDF blob using PDFx
      const blob = await pdf(<ResumePDFx user={user} />).toBlob();

      const formData = new FormData();
      formData.append("resume", blob, "resume_ats.pdf");

      const response = await axiosInstance.post(
        API_PATH.AUTH.UPLOAD_RESUME,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Update local state with the actual Cloudinary URL
      const { resumeUrl } = response.data;
      setUser((prev) => ({ ...prev, resume: resumeUrl }));

      toast.success("ATS-friendly resume saved to your profile successfully!");
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error(
        `Failed to save resume: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ResumeBuilderSkeleton />;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load profile data.</p>
      </div>
    );
  }

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center px-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Profile
        </button>
        <div className="flex gap-4">
          <button
            onClick={handleSaveResume}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save to Profile"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* ATS-Friendly Badge */}
      <div className="max-w-[210mm] mx-auto mb-4 px-4 print:hidden">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-800 font-medium">
              ATS-Friendly Resume - Optimized for Applicant Tracking Systems
            </p>
          </div>
          <p className="text-xs text-green-700 mt-1 ml-4">
            This resume uses clean structure, standard fonts, and proper
            formatting for maximum ATS compatibility.
          </p>
        </div>
      </div>

      {/* Resume Preview - HTML version matching PDF design */}
      <div className="max-w-[210mm] mx-auto px-4 print:hidden">
        <div
          className="bg-white shadow-xl rounded-lg overflow-hidden p-12"
          style={{ minHeight: "297mm" }}
        >
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-bold text-black uppercase mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
              {user.fullName}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
              {user.email && <span>{user.email}</span>}
              {user.phone && <span>{user.phone}</span>}
              {user.address && <span>{user.address}</span>}
              {user.website && <span>{user.website.replace(/^https?:\/\//, '')}</span>}
              {user.linkedin && <span>LinkedIn: {user.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>}
              {user.github && <span>GitHub: {user.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {user.bio && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                Professional Summary
              </h2>
              <p className="text-xs text-gray-800 leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                {user.bio}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {user.experiences && user.experiences.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                Work Experience
              </h2>
              <div className="space-y-3">
                {user.experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-bold text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {exp.title}
                      </h3>
                      <span className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {exp.company}
                      </span>
                      {exp.location && (
                        <span className="text-xs text-gray-600 italic" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {exp.location}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internships */}
          {user.internships && user.internships.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                Internships
              </h2>
              <div className="space-y-3">
                {user.internships.map((intern, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-bold text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {intern.title}
                      </h3>
                      <span className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {formatDate(intern.startDate)} – {intern.current ? "Present" : formatDate(intern.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {intern.company}
                      </span>
                      {intern.location && (
                        <span className="text-xs text-gray-600 italic" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {intern.location}
                        </span>
                      )}
                    </div>
                    {intern.description && (
                      <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {intern.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {user.education && user.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                Education
              </h2>
              <div className="space-y-3">
                {user.education.map((edu, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-bold text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {edu.school}
                      </h3>
                      <span className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : "Present"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {edu.degree}
                      </span>
                      {edu.location && (
                        <span className="text-xs text-gray-600 italic" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {edu.location}
                        </span>
                      )}
                    </div>
                    {edu.activities && (
                      <p className="text-xs text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                        <span className="font-semibold">Activities:</span> {edu.activities}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                Skills
              </h2>
              <div className="text-xs text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
                {Array.isArray(user.skills)
                  ? user.skills.join(" • ")
                  : user.skills}
              </div>
            </div>
          )}

          {/* Projects */}
          {user.projects && user.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                Projects
              </h2>
              <div className="space-y-3">
                {user.projects.map((project, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-bold text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {project.name}
                      </h3>
                      {(project.startDate || project.endDate) && (
                        <span className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {formatDate(project.startDate)} – {formatDate(project.endDate)}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {project.description}
                      </p>
                    )}
                    {project.url && (
                      <p className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {project.url}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {user.certifications && user.certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                Certifications
              </h2>
              <div className="space-y-2">
                {user.certifications.map((cert, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-bold text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {cert.name}
                      </h3>
                      <span className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {formatDate(cert.issueDate)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <span className="font-semibold">{cert.issuer}</span>
                      {cert.credentialID && <span> • ID: {cert.credentialID}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {user.awards && user.awards.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                Awards
              </h2>
              <div className="space-y-2">
                {user.awards.map((award, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-bold text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {award.title}
                      </h3>
                      <span className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {formatDate(award.date)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                      <span className="font-semibold">{award.issuer}</span>
                    </div>
                    {award.description && (
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {award.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {user.languages && user.languages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-black uppercase border-b border-gray-400 pb-1 mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                Languages
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
                {user.languages.map((lang, index) => (
                  <div key={index}>
                    <span className="font-bold">{lang.language}</span>
                    <span className="text-gray-600"> ({lang.proficiency})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
