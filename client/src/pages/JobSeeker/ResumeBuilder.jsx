import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Github,
    ExternalLink,
    Download,
    Printer,
    ArrowLeft,
    Save,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import ResumeBuilderSkeleton from "./components/skeletons/ResumeBuilderSkeleton";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";

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

    const handlePrint = () => {
        window.print();
    };

    const handleSaveResume = async () => {
        setSaving(true);
        try {
            // Generate PDF blob using @react-pdf/renderer
            const blob = await pdf(<ResumePDF user={user} />).toBlob();

            const formData = new FormData();
            formData.append("resume", blob, "resume.pdf");

            await axiosInstance.post(API_PATH.AUTH.UPLOAD_RESUME, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Resume saved to your profile successfully!");

            // Optionally update local user state if needed
            setUser(prev => ({ ...prev, resume: "resume.pdf" }));

        } catch (error) {
            console.error("Error saving resume:", error);
            alert(`Failed to save resume: ${error.message}`);
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
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
            {/* Toolbar - Hidden when printing */}
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
                        Print / Save as PDF
                    </button>
                </div>
            </div>

            {/* Resume Page - A4 Size */}
            <div
                id="resume-content"
                className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print:w-full print:max-w-none min-h-[297mm] p-[15mm] md:p-[20mm] text-gray-900 font-serif leading-relaxed"
            >
                {/* Header */}
                <header className="border-b-2 border-gray-900 pb-6 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-tight mb-4">
                        {user.fullName}
                    </h1>

                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600">
                        {user.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                        )}
                        {user.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                        {user.address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{user.address}</span>
                            </div>
                        )}
                        {user.website && (
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {user.website.replace(/^https?:\/\//, '')}
                                </a>
                            </div>
                        )}
                        {user.linkedin && (
                            <div className="flex items-center gap-2">
                                <Linkedin className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{user.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                            </div>
                        )}
                        {user.github && (
                            <div className="flex items-center gap-2">
                                <Github className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{user.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Summary */}
                {user.bio && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">
                            Professional Summary
                        </h2>
                        <p className="text-gray-700 text-justify leading-relaxed">
                            {user.bio}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {user.experiences && user.experiences.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                            Work Experience
                        </h2>
                        <div className="space-y-5">
                            {user.experiences.map((exp, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{exp.title}</h3>
                                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                            {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-800 font-semibold">{exp.company}</span>
                                        {exp.location && <span className="text-sm text-gray-500 italic">{exp.location}</span>}
                                    </div>
                                    {exp.description && (
                                        <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Internships */}
                {user.internships && user.internships.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                            Internships
                        </h2>
                        <div className="space-y-5">
                            {user.internships.map((intern, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{intern.title}</h3>
                                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                            {formatDate(intern.startDate)} – {intern.current ? "Present" : formatDate(intern.endDate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-800 font-semibold">{intern.company}</span>
                                        {intern.location && <span className="text-sm text-gray-500 italic">{intern.location}</span>}
                                    </div>
                                    {intern.description && (
                                        <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                                            {intern.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {user.education && user.education.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                            Education
                        </h2>
                        <div className="space-y-4">
                            {user.education.map((edu, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{edu.school}</h3>
                                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                            {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : "Present"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-800 font-semibold">{edu.degree}</span>
                                        {edu.location && <span className="text-sm text-gray-500 italic">{edu.location}</span>}
                                    </div>
                                    {edu.activities && (
                                        <p className="text-gray-700 text-sm mt-1">
                                            <span className="font-medium">Activities:</span> {edu.activities}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-gray-800 text-sm leading-relaxed">
                            {Array.isArray(user.skills) ? (
                                user.skills.map((skill, index) => (
                                    <span key={index} className="font-medium">
                                        {skill}{index < user.skills.length - 1 ? " • " : ""}
                                    </span>
                                ))
                            ) : (
                                <span className="font-medium">{user.skills}</span>
                            )}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {user.projects && user.projects.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {user.projects.map((project, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                            {project.name}
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 print:hidden">
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </h3>
                                        {(project.startDate || project.endDate) && (
                                            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                                {formatDate(project.startDate)} – {formatDate(project.endDate)}
                                            </span>
                                        )}
                                    </div>
                                    {project.description && (
                                        <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                                            {project.description}
                                        </p>
                                    )}
                                    {project.url && (
                                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 mt-1 block hover:underline print:text-gray-800 print:no-underline">
                                            {project.url}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {user.certifications && user.certifications.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                            Certifications
                        </h2>
                        <div className="space-y-3">
                            {user.certifications.map((cert, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900">{cert.name}</h3>
                                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                            {formatDate(cert.issueDate)}
                                        </span>
                                    </div>
                                    <div className="text-gray-700 text-sm">
                                        <span className="font-medium">{cert.issuer}</span>
                                        {cert.credentialID && <span> • ID: {cert.credentialID}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Awards */}
                {user.awards && user.awards.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                            Awards
                        </h2>
                        <div className="space-y-3">
                            {user.awards.map((award, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900">{award.title}</h3>
                                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                            {formatDate(award.date)}
                                        </span>
                                    </div>
                                    <div className="text-gray-700 text-sm">
                                        <span className="font-medium">{award.issuer}</span>
                                    </div>
                                    {award.description && (
                                        <p className="text-gray-600 text-sm mt-1">
                                            {award.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Languages */}
                {user.languages && user.languages.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">
                            Languages
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-800 text-sm">
                            {user.languages.map((lang, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="font-bold">{lang.language}</span>
                                    <span className="text-gray-600">({lang.proficiency})</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>

            <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:text-gray-800 {
            color: #1f2937 !important;
          }
          .print\\:no-underline {
            text-decoration: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default ResumeBuilder;
