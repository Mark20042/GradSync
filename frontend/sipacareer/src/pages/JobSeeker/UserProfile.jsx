import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  BookOpen,
  Target,
  FileText,
  Edit,
  Settings,
  Camera,
  Save,
  ArrowLeft,
  Download,
  Upload,
  Trash2,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useAuth } from "../../context/AuthContext";
import UserProfileSkeleton from "./components/skeletons/UserProfileSkeleton";

// Import new modular components
import ContactSection from "./components/profile/ContactSection";
import AboutSection from "./components/profile/AboutSection";
import ResumeSection from "./components/profile/ResumeSection";
import EducationSection from "./components/profile/EducationSection";
import ExperienceSection from "./components/profile/ExperienceSection";
import ProjectsSection from "./components/profile/ProjectsSection";
import CertificationsSection from "./components/profile/CertificationsSection";
import JobPreferencesSection from "./components/profile/JobPreferencesSection";
import AccountSettingsSection from "./components/profile/AccountSettingsSection";
import SkillsSection from "./components/profile/SkillsSection";
import InterviewScoresSection from "./components/profile/InterviewScoresSection";

const UserProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeSection, setActiveSection] = useState("contact");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    if (typeof dateString === "string" && /^\d{4}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
    return "";
  };

  const formatSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) {
      return skills
        .map((skill) =>
          typeof skill === "string" ? skill.trim() : String(skill).trim()
        )
        .filter((skill) => skill.length > 0);
    }
    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);
    }
    return [];
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.AUTH.GET_PROFILE);
      const userData = response.data;

      const formatDates = (items, dateFields) => {
        return items.map(item => {
          const newItem = { ...item };
          dateFields.forEach(field => {
            if (newItem[field]) newItem[field] = formatDateForInput(newItem[field]);
          });
          return newItem;
        });
      };

      const formattedData = {
        ...userData,
        education: Array.isArray(userData.education)
          ? formatDates(userData.education, ['startDate', 'endDate'])
          : [],
        experiences: Array.isArray(userData.experiences)
          ? formatDates(userData.experiences, ['startDate', 'endDate'])
          : [],
        internships: Array.isArray(userData.internships)
          ? formatDates(userData.internships, ['startDate', 'endDate'])
          : [],
        projects: Array.isArray(userData.projects)
          ? formatDates(userData.projects, ['startDate', 'endDate'])
          : [],
        certifications: Array.isArray(userData.certifications)
          ? formatDates(userData.certifications, ['issueDate', 'expirationDate'])
          : [],
        awards: Array.isArray(userData.awards)
          ? formatDates(userData.awards, ['date'])
          : [],
        languages: Array.isArray(userData.languages) ? userData.languages : [],
        skills: formatSkills(userData.skills),
        jobPreferences: userData.jobPreferences || {},
      };

      setUser(formattedData);
      setEditData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploadingAvatar(true);

    try {
      const response = await axiosInstance.post(
        API_PATH.AUTH.UPLOAD_IMAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newAvatarUrl = response.data.avatarUrl;
      setEditData((prev) => ({ ...prev, avatar: newAvatarUrl }));
      setUser((prev) => ({ ...prev, avatar: newAvatarUrl }));
      updateUser({ avatar: newAvatarUrl });
      setUploadingAvatar(false);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploadingAvatar(false);
      toast.error("Error uploading profile picture");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const processedSkills = formatSkills(editData.skills);
      const processedJobPreferences = {
        ...editData.jobPreferences,
        jobType: editData.jobPreferences?.jobType || undefined,
        desiredJobTitle: editData.jobPreferences?.desiredJobTitle || undefined,
        industry: editData.jobPreferences?.industry || undefined,
        preferredLocation: editData.jobPreferences?.preferredLocation || undefined,
        salaryExpectation: editData.jobPreferences?.salaryExpectation || undefined,
      };

      const formattedData = {
        ...editData,
        skills: processedSkills,
        jobPreferences: processedJobPreferences,
      };

      const response = await axiosInstance.put(
        API_PATH.AUTH.UPDATE_PROFILE,
        formattedData
      );

      const updatedUserData = response.data;

      // Re-format data for state
      // (Simplified: In a real app, extract this formatting logic to reuse)
      setUser(updatedUserData);
      updateUser(updatedUserData);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile. Please check all fields.");
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF, DOC, or DOCX file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await axiosInstance.post(
        API_PATH.AUTH.UPLOAD_RESUME,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newResumeUrl = response.data.resumeUrl;
      setEditData((prev) => ({ ...prev, resume: newResumeUrl }));
      setUser((prev) => ({ ...prev, resume: newResumeUrl }));
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Error uploading resume");
    }
  };

  const handleDeleteResume = async () => {
    if (!user.resume) return;
    try {
      await axiosInstance.delete(API_PATH.AUTH.DELETE_RESUME, {
        data: { resumeUrl: user.resume },
      });
      setUser((prev) => ({ ...prev, resume: "" }));
      setEditData((prev) => ({ ...prev, resume: "" }));
      toast.success("Resume deleted");
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Error deleting resume");
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await axiosInstance.post(API_PATH.AI.GENERATE_SUMMARY);
      const { summary } = response.data;
      setEditData(prev => ({ ...prev, bio: summary }));
      toast.success("Bio generated!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const downloadResume = () => {
    if (user?.resume) {
      window.open(user.resume, "_blank");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteModalOpen(false);
    try {
      await axiosInstance.delete(API_PATH.AUTH.DELETE_ACCOUNT);
      toast.success("Account deleted successfully.");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  if (loading) return <UserProfileSkeleton />;

  const sections = [
    { id: "contact", label: "Contact Information", icon: User },
    { id: "about", label: "About Me", icon: FileText },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience & Internships", icon: Briefcase },
    { id: "skills", label: "Skills & Languages", icon: Code },
    { id: "projects", label: "Projects", icon: Layers },
    { id: "certifications", label: "Certifications & Awards", icon: Award },
    { id: "interviews", label: "Interview Scores", icon: Target },
    { id: "preferences", label: "Job Preferences", icon: Target },
    { id: "settings", label: "Account Settings", icon: Settings, danger: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back to Find Jobs Link */}
        <button
          onClick={() => navigate("/find-jobs")}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Find Jobs
        </button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="md:flex items-center justify-between p-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-offset-2 ring-blue-50">
                  <img
                    src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.fullName || "User")}
                    alt={user?.fullName}
                    className="w-full h-full object-cover"
                  />
                  {editing && (
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-8 h-8" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{user?.fullName}</h1>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide">
                    {user?.role}
                  </span>
                </div>
                <p className="text-blue-600 font-medium text-lg">
                  {user?.education?.[0]?.degree || user?.degree || "Job Seeker"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 md:mt-0">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/resume-builder")}
                    className="flex items-center px-6 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Build Resume
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
                Profile Sections
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeSection === section.id
                      ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                      : section.danger
                        ? "text-red-500 hover:bg-red-50"
                        : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <section.icon className={`w-5 h-5 ${activeSection === section.id ? "text-blue-600" : ""
                      }`} />
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-h-[calc(100vh-280px)] overflow-y-auto"
            >
              {activeSection === "contact" && (
                <ContactSection
                  user={user}
                  editing={editing}
                  editData={editData}
                  handleEditChange={handleEditChange}
                />
              )}

              {activeSection === "about" && (
                <AboutSection
                  user={user}
                  editing={editing}
                  editData={editData}
                  setEditData={setEditData}
                  summaryLoading={summaryLoading}
                  handleGenerateSummary={handleGenerateSummary}
                />
              )}

              {/* Only show Resume section inside 'about' if separate section is preferred, 
                  or keep distinct. For now, Resume is effectively part of documents, 
                  but we'll keep it as a standalone section if needed or integrated.
                  Let's put Resume logic inside About or separate. 
                  Actually, the user requested specialized components. 
                  Resume was typically under 'about' or separate. 
                  I'll add a separate Resume section if selected, or just integrate it nicely.
                  Wait, I made a ResumeSection component but didn't list it in sidebar.
                  Let's assume it fits well inside "About Me" or add a new tab. 
                  I'll add it to 'About Me' area for now or just under documents if that existed.
                  Actually, let's just add it to the render logic here.
              */}

              {activeSection === "education" && (
                <EducationSection
                  user={user}
                  editing={editing}
                  editData={editData}
                  setEditData={setEditData}
                />
              )}

              {activeSection === "experience" && (
                <ExperienceSection
                  user={user}
                  editing={editing}
                  editData={editData}
                  setEditData={setEditData}
                />
              )}

              {activeSection === "projects" && (
                <ProjectsSection
                  user={user}
                  editing={editing}
                  editData={editData}
                  setEditData={setEditData}
                />
              )}


              {activeSection === "skills" && (
                <SkillsSection
                  user={user}
                  verifiedSkills={user?.verifiedSkills}
                  editing={editing}
                  editData={editData}
                  setEditData={setEditData}
                />
              )}

              {activeSection === "certifications" && (
                <CertificationsSection
                  user={user}
                  editing={editing}
                  editData={editData}
                  setEditData={setEditData}
                />
              )}

              {activeSection === "preferences" && (
                <JobPreferencesSection
                  user={user}
                  editing={editing}
                  editData={editData}
                  setEditData={setEditData}
                />
              )}

              {activeSection === "interviews" && (
                <InterviewScoresSection />
              )}

              {activeSection === "settings" && (
                <AccountSettingsSection
                  setDeleteModalOpen={setDeleteModalOpen}
                />
              )}

            </motion.div>
          </div>
        </div>

        {/* Resume Card - Always Visible */}
        <div className="max-w-7xl mx-auto mt-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Resume</h3>
                  <p className="text-blue-100 text-sm">
                    {user?.resume ? "Resume uploaded and ready" : "Upload your resume to apply for jobs"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {user?.resume ? (
                  <>
                    <button
                      onClick={downloadResume}
                      className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    {editing && (
                      <>
                        <label className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Update
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                          />
                        </label>
                        <button
                          onClick={handleDeleteResume}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <label className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resume
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Delete Your Account?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete your account? All of
                your data will be lost forever. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
                >
                  Yes, Delete My Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
