import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  BookOpen,
  Target,
  FileText,
  Edit,
  Download,
  Trash2, // This icon is used for the new delete section
  Calendar,
  ExternalLink,
  Plus,
  X,
  Camera,
  Save,
  Upload,
  ArrowLeft,
  Linkedin,
  Github,
  Trophy,
  Languages,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useAuth } from "../../context/AuthContext";

const UserProfile = () => {
  // 1. Added 'logout' from useAuth
  const { user: authUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeSection, setActiveSection] = useState("contact");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // 2. Added state for the delete confirmation modal
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Helper function to format date for input type="month"
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // If it's already in yyyy-MM format, return as is
    if (typeof dateString === "string" && /^\d{4}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If it's an ISO date string, convert to yyyy-MM
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

  // Helper function to format skills consistently
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

  // Helper function to get skills for display
  const getDisplaySkills = (skills) => {
    return formatSkills(skills);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.AUTH.GET_PROFILE);
      const userData = response.data;

      // Format dates for display and editing
      const formatEducationDates = (education) => {
        return education.map((edu) => ({
          ...edu,
          startDate: formatDateForInput(edu.startDate),
          endDate: formatDateForInput(edu.endDate),
        }));
      };

      const formatExperienceDates = (experiences) => {
        return experiences.map((exp) => ({
          ...exp,
          startDate: formatDateForInput(exp.startDate),
          endDate: formatDateForInput(exp.endDate),
        }));
      };

      const formatCertificationDates = (certifications) => {
        return certifications.map((cert) => ({
          ...cert,
          issueDate: formatDateForInput(cert.issueDate),
          expirationDate: formatDateForInput(cert.expirationDate),
        }));
      };

      const formatAwardDates = (awards) => {
        return awards.map((award) => ({
          ...award,
          date: formatDateForInput(award.date),
        }));
      };

      const formatProjectDates = (projects) => {
        return projects.map((project) => ({
          ...project,
          startDate: formatDateForInput(project.startDate),
          endDate: formatDateForInput(project.endDate),
        }));
      };

      // Ensure all arrays exist and have proper structure
      const formattedData = {
        ...userData,
        education: Array.isArray(userData.education)
          ? formatEducationDates(userData.education)
          : [],
        experiences: Array.isArray(userData.experiences)
          ? formatExperienceDates(userData.experiences)
          : [],
        internships: Array.isArray(userData.internships)
          ? formatExperienceDates(userData.internships)
          : [],
        projects: Array.isArray(userData.projects)
          ? formatProjectDates(userData.projects)
          : [],
        certifications: Array.isArray(userData.certifications)
          ? formatCertificationDates(userData.certifications)
          : [],
        awards: Array.isArray(userData.awards)
          ? formatAwardDates(userData.awards)
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

  const handleNestedEditChange = (section, index, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleArrayEditChange = (field, value) => {
    if (field === "skills") {
      // Store the raw string value for editing
      setEditData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [field]: value.split(",").map((item) => item.trim()),
      }));
    }
  };

  const handleAddItem = (section) => {
    const template = getTemplateForSection(section);
    setEditData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), template],
    }));
  };

  const handleRemoveItem = (section, index) => {
    setEditData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const getTemplateForSection = (section) => {
    const templates = {
      education: {
        school: "",
        degree: "",
        startDate: "",
        endDate: "",
        location: "",
        activities: "",
      },
      experiences: {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
      internships: {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
      projects: {
        name: "",
        description: "",
        url: "",
        startDate: "",
        endDate: "",
        technologies: [],
      },
      certifications: {
        name: "",
        issuer: "",
        issueDate: "",
        expirationDate: "",
        credentialID: "",
        credentialURL: "",
      },
      awards: {
        title: "",
        issuer: "",
        date: "",
        description: "",
      },
      languages: {
        language: "",
        proficiency: "Basic",
      },
      jobPreferences: {
        desiredJobTitle: "",
        industry: "",
        preferredLocation: "",
        jobType: "",
        salaryExpectation: "",
        relocation: false,
      },
    };
    return templates[section] || {};
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
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
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploadingAvatar(false);
      alert("Error uploading profile picture. Please try again.");
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Process skills properly before sending
      const processedSkills = formatSkills(editData.skills);

      // Validate and format jobPreferences
      const processedJobPreferences = {
        ...editData.jobPreferences,
        // Ensure jobType is either a valid enum value or undefined
        jobType: editData.jobPreferences?.jobType || undefined,
        // Convert empty strings to undefined for other fields
        desiredJobTitle: editData.jobPreferences?.desiredJobTitle || undefined,
        industry: editData.jobPreferences?.industry || undefined,
        preferredLocation:
          editData.jobPreferences?.preferredLocation || undefined,
        salaryExpectation:
          editData.jobPreferences?.salaryExpectation || undefined,
      };

      // Format data before sending - send skills as array
      const formattedData = {
        ...editData,
        skills: processedSkills, // Send as array to backend
        jobPreferences: processedJobPreferences,
      };

      const response = await axiosInstance.put(
        API_PATH.AUTH.UPDATE_PROFILE,
        formattedData
      );

      const updatedUserData = response.data;

      // Ensure skills are properly formatted after save
      const formattedUserData = {
        ...updatedUserData,
        skills: formatSkills(updatedUserData.skills),
        education: Array.isArray(updatedUserData.education)
          ? updatedUserData.education.map((edu) => ({
            ...edu,
            startDate: formatDateForInput(edu.startDate),
            endDate: formatDateForInput(edu.endDate),
          }))
          : [],
        experiences: Array.isArray(updatedUserData.experiences)
          ? updatedUserData.experiences.map((exp) => ({
            ...exp,
            startDate: formatDateForInput(exp.startDate),
            endDate: formatDateForInput(exp.endDate),
          }))
          : [],
        internships: Array.isArray(updatedUserData.internships)
          ? updatedUserData.internships.map((intern) => ({
            ...intern,
            startDate: formatDateForInput(intern.startDate),
            endDate: formatDateForInput(intern.endDate),
          }))
          : [],
      };

      setUser(formattedUserData);
      updateUser(formattedUserData);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please check all fields and try again.");
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
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  };

  // 3. Added new function to handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteModalOpen(false);
    try {
      await axiosInstance.delete(API_PATH.AUTH.DELETE_ACCOUNT);
      toast.success("Account deleted successfully.");
      logout(); // Log the user out
      navigate("/"); // Redirect to home
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const downloadResume = () => {
    if (user.resume) {
      window.open(user.resume, "_blank");
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
      alert("Please select a PDF, DOC, or DOCX file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await axiosInstance.post(
        API_PATH.AUTH.UPLOAD_RESUME,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newResumeUrl = response.data.resumeUrl;
      setEditData((prev) => ({ ...prev, resume: newResumeUrl }));
      setUser((prev) => ({ ...prev, resume: newResumeUrl }));

      alert("Resume uploaded successfully!");
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Error uploading resume. Please try again.");
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await axiosInstance.post(API_PATH.AI.GENERATE_SUMMARY);
      const { summary } = response.data;

      setEditData(prev => ({
        ...prev,
        bio: summary
      }));

      // Optional: Show success toast/alert
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Failed to generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Render section content based on active section
  const renderSectionContent = () => {
    if (!user) return null;

    const sections = {
      contact: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <Mail className="w-5 h-5 mr-4 text-blue-500" />
              <div className="flex-1">
                <label className="text-sm text-gray-500">Email</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email || ""}
                    onChange={handleEditChange}
                    className="w-full border-b-2 border-blue-300 focus:border-blue-500 focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-medium">{user.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <Phone className="w-5 h-5 mr-4 text-green-500" />
              <div className="flex-1">
                <label className="text-sm text-gray-500">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ""}
                    onChange={handleEditChange}
                    className="w-full border-b-2 border-blue-300 focus:border-blue-500 focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-medium">{user.phone || "Not provided"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-4 text-red-500" />
              <div className="flex-1">
                <label className="text-sm text-gray-500">Address</label>
                {editing ? (
                  <input
                    type="text"
                    name="address"
                    value={editData.address || ""}
                    onChange={handleEditChange}
                    className="w-full border-b-2 border-blue-300 focus:border-blue-500 focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-medium">
                    {user.address || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <Globe className="w-5 h-5 mr-4 text-purple-500" />
              <div className="flex-1">
                <label className="text-sm text-gray-500">Website</label>
                {editing ? (
                  <input
                    type="url"
                    name="website"
                    value={editData.website || ""}
                    onChange={handleEditChange}
                    className="w-full border-b-2 border-blue-300 focus:border-blue-500 focus:outline-none py-1"
                  />
                ) : user.website ? (
                  <a
                    href={user.website}
                    className="text-blue-600 hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                ) : (
                  <p className="text-gray-500">Not provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ),

      about: (
        <div>
          {editing ? (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 font-medium"
                >
                  {summaryLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                name="bio"
                value={editData.bio || ""}
                onChange={handleEditChange}
                rows={6}
                placeholder="Tell us about yourself..."
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed text-lg">
              {user.bio || "No bio provided yet."}
            </p>
          )}
        </div>
      ),

      education: (
        <div className="space-y-6">
          {editing && (
            <button
              onClick={() => handleAddItem("education")}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </button>
          )}

          {(editData.education || []).map((edu, index) => (
            <div
              key={index}
              className="border-l-4 border-purple-500 pl-6 py-4 bg-purple-50 rounded-r-xl"
            >
              {editing ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      value={edu.school || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "education",
                          index,
                          "school",
                          e.target.value
                        )
                      }
                      placeholder="School/University"
                      className="text-lg font-semibold bg-transparent border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none w-full"
                    />
                    <button
                      onClick={() => handleRemoveItem("education", index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Education Level Dropdown - Same as SetupProfileGrad */}
                  <select
                    value={edu.degree || ""}
                    onChange={(e) =>
                      handleNestedEditChange(
                        "education",
                        index,
                        "degree",
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                  >
                    <option value="">Select education level</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Junior High School">
                      Junior High School
                    </option>
                    <option value="Senior High School">
                      Senior High School
                    </option>
                    <option value="Vocational">Vocational/Training</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Other">Other</option>
                  </select>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="month"
                      value={edu.startDate || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "education",
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                      placeholder="Start Date"
                      className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <input
                      type="month"
                      value={edu.endDate || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "education",
                          index,
                          "endDate",
                          e.target.value
                        )
                      }
                      placeholder="End Date"
                      className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                  </div>
                  <input
                    type="text"
                    value={edu.location || ""}
                    onChange={(e) =>
                      handleNestedEditChange(
                        "education",
                        index,
                        "location",
                        e.target.value
                      )
                    }
                    placeholder="Location"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                  />
                  <textarea
                    value={edu.activities || ""}
                    onChange={(e) =>
                      handleNestedEditChange(
                        "education",
                        index,
                        "activities",
                        e.target.value
                      )
                    }
                    placeholder="Activities and achievements"
                    rows={3}
                    className="w-full bg-transparent border border-gray-300 focus:border-blue-500 focus:outline-none rounded p-2"
                  />
                </div>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {edu.school}
                  </h4>
                  <p className="text-gray-600">{edu.degree}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate || "Present"} |{" "}
                    {edu.location}
                  </p>
                  {edu.activities && (
                    <p className="text-gray-700 mt-2">{edu.activities}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ),

      experience: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Work Experience
            </h4>
            {editing && (
              <button
                onClick={() => handleAddItem("experiences")}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Work Experience
              </button>
            )}

            {(editData.experiences || []).map((exp, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-xl mb-4"
              >
                {editing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={exp.title || ""}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "experiences",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Job Title"
                        className="text-lg font-semibold bg-transparent border-b-2 border-blue-300 focus:border-blue-500 focus:outline-none w-full"
                      />
                      <button
                        onClick={() => handleRemoveItem("experiences", index)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "experiences",
                          index,
                          "company",
                          e.target.value
                        )
                      }
                      placeholder="Company"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="month"
                        value={exp.startDate || ""}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "experiences",
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                        placeholder="Start Date"
                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                      />
                      {!exp.current && (
                        <input
                          type="month"
                          value={exp.endDate || ""}
                          onChange={(e) =>
                            handleNestedEditChange(
                              "experiences",
                              index,
                              "endDate",
                              e.target.value
                            )
                          }
                          placeholder="End Date"
                          className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                        />
                      )}
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exp.current || false}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "experiences",
                            index,
                            "current",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        I currently work here
                      </label>
                    </div>
                    <input
                      type="text"
                      value={exp.location || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "experiences",
                          index,
                          "location",
                          e.target.value
                        )
                      }
                      placeholder="Location"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <textarea
                      value={exp.description || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "experiences",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Job description"
                      rows={3}
                      className="w-full bg-transparent border border-gray-300 focus:border-blue-500 focus:outline-none rounded p-2"
                    />
                  </div>
                ) : (
                  <>
                    <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                    <p className="text-gray-600">
                      {exp.company} | {exp.location}
                    </p>
                    <p className="text-sm text-gray-500">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Internships
            </h4>
            {editing && (
              <button
                onClick={() => handleAddItem("internships")}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Internship
              </button>
            )}

            {(editData.internships || []).map((intern, index) => (
              <div
                key={index}
                className="border-l-4 border-green-500 pl-6 py-4 bg-green-50 rounded-r-xl mb-4"
              >
                {editing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={intern.title || ""}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "internships",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Internship Role"
                        className="text-lg font-semibold bg-transparent border-b-2 border-green-300 focus:border-green-500 focus:outline-none w-full"
                      />
                      <button
                        onClick={() => handleRemoveItem("internships", index)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={intern.company || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "internships",
                          index,
                          "company",
                          e.target.value
                        )
                      }
                      placeholder="Company"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="month"
                        value={intern.startDate || ""}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "internships",
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                        placeholder="Start Date"
                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                      />
                      {!intern.current && (
                        <input
                          type="month"
                          value={intern.endDate || ""}
                          onChange={(e) =>
                            handleNestedEditChange(
                              "internships",
                              index,
                              "endDate",
                              e.target.value
                            )
                          }
                          placeholder="End Date"
                          className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                        />
                      )}
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={intern.current || false}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "internships",
                            index,
                            "current",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Current Internship
                      </label>
                    </div>
                    <textarea
                      value={intern.description || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "internships",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Internship description"
                      rows={3}
                      className="w-full bg-transparent border border-gray-300 focus:border-blue-500 focus:outline-none rounded p-2"
                    />
                  </div>
                ) : (
                  <>
                    <h5 className="font-semibold text-gray-900">
                      {intern.title}
                    </h5>
                    <p className="text-gray-600">{intern.company}</p>
                    <p className="text-sm text-gray-500">
                      {intern.startDate} -{" "}
                      {intern.current ? "Present" : intern.endDate}
                    </p>
                    {intern.description && (
                      <p className="text-gray-700 mt-2">{intern.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ),

      skills: (
        <div className="space-y-6">
          {/* Skills */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills</h4>
            {editing ? (
              <div className="space-y-4">
                <textarea
                  value={
                    typeof editData.skills === "string"
                      ? editData.skills
                      : Array.isArray(editData.skills)
                        ? editData.skills.join(", ")
                        : formatSkills(editData.skills).join(", ")
                  }
                  onChange={(e) =>
                    handleArrayEditChange("skills", e.target.value)
                  }
                  placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:outline-none resize-none"
                />
                <p className="text-sm text-gray-500">
                  Separate multiple skills with commas.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formatSkills(user.skills).length > 0 ? (
                  formatSkills(user.skills).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Languages */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Languages
            </h4>
            {editing && (
              <button
                onClick={() => handleAddItem("languages")}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Language
              </button>
            )}

            {(editData.languages || []).map((lang, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2"
              >
                {editing ? (
                  <div className="flex items-center space-x-4 w-full">
                    <input
                      type="text"
                      value={lang.language || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "languages",
                          index,
                          "language",
                          e.target.value
                        )
                      }
                      placeholder="Language"
                      className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1"
                    />
                    <select
                      value={lang.proficiency || "Basic"}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "languages",
                          index,
                          "proficiency",
                          e.target.value
                        )
                      }
                      className="border border-gray-300 rounded px-3 py-1"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Conversational">Conversational</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </select>
                    <button
                      onClick={() => handleRemoveItem("languages", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-gray-600">({lang.proficiency})</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ),

      projects: (
        <div className="space-y-6">
          {editing && (
            <button
              onClick={() => handleAddItem("projects")}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </button>
          )}

          {(editData.projects || []).map((project, index) => (
            <div
              key={index}
              className="border-l-4 border-orange-500 pl-6 py-4 bg-orange-50 rounded-r-xl"
            >
              {editing ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      value={project.name || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "projects",
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Project Name"
                      className="text-lg font-semibold bg-transparent border-b-2 border-orange-300 focus:border-orange-500 focus:outline-none w-full"
                    />
                    <button
                      onClick={() => handleRemoveItem("projects", index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="url"
                    value={project.url || ""}
                    onChange={(e) =>
                      handleNestedEditChange(
                        "projects",
                        index,
                        "url",
                        e.target.value
                      )
                    }
                    placeholder="Project URL"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="month"
                      value={project.startDate || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "projects",
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                      placeholder="Start Date"
                      className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <input
                      type="month"
                      value={project.endDate || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "projects",
                          index,
                          "endDate",
                          e.target.value
                        )
                      }
                      placeholder="End Date"
                      className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                  </div>
                  <textarea
                    value={project.description || ""}
                    onChange={(e) =>
                      handleNestedEditChange(
                        "projects",
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Project description"
                    rows={3}
                    className="w-full bg-transparent border border-gray-300 focus:border-blue-500 focus:outline-none rounded p-2"
                  />
                  <input
                    type="text"
                    value={
                      Array.isArray(project.technologies)
                        ? project.technologies.join(", ")
                        : project.technologies || ""
                    }
                    onChange={(e) =>
                      handleNestedEditChange(
                        "projects",
                        index,
                        "technologies",
                        e.target.value.split(",").map((t) => t.trim())
                      )
                    }
                    placeholder="Technologies used (comma separated)"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                  />
                </div>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h4>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Project
                    </a>
                  )}
                  <p className="text-sm text-gray-500">
                    {project.startDate} - {project.endDate || "Present"}
                  </p>
                  {project.description && (
                    <p className="text-gray-700 mt-2">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ),

      certifications: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Certifications
            </h4>
            {editing && (
              <button
                onClick={() => handleAddItem("certifications")}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </button>
            )}

            {(editData.certifications || []).map((cert, index) => (
              <div
                key={index}
                className="border-l-4 border-indigo-500 pl-6 py-4 bg-indigo-50 rounded-r-xl mb-4"
              >
                {editing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={cert.name || ""}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "certifications",
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Certification Name"
                        className="text-lg font-semibold bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 focus:outline-none w-full"
                      />
                      <button
                        onClick={() =>
                          handleRemoveItem("certifications", index)
                        }
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={cert.issuer || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "certifications",
                          index,
                          "issuer",
                          e.target.value
                        )
                      }
                      placeholder="Issuing Organization"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="month"
                        value={cert.issueDate || ""}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "certifications",
                            index,
                            "issueDate",
                            e.target.value
                          )
                        }
                        placeholder="Issue Date"
                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                      />
                      <input
                        type="month"
                        value={cert.expirationDate || ""}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "certifications",
                            index,
                            "expirationDate",
                            e.target.value
                          )
                        }
                        placeholder="Expiration Date"
                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                      />
                    </div>
                    <input
                      type="text"
                      value={cert.credentialID || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "certifications",
                          index,
                          "credentialID",
                          e.target.value
                        )
                      }
                      placeholder="Credential ID"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <input
                      type="url"
                      value={cert.credentialURL || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "certifications",
                          index,
                          "credentialURL",
                          e.target.value
                        )
                      }
                      placeholder="Credential URL"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                  </div>
                ) : (
                  <>
                    <h5 className="font-semibold text-gray-900">{cert.name}</h5>
                    <p className="text-gray-600">{cert.issuer}</p>
                    <p className="text-sm text-gray-500">
                      Issued: {cert.issueDate}{" "}
                      {cert.expirationDate &&
                        `| Expires: ${cert.expirationDate}`}
                    </p>
                    {cert.credentialID && (
                      <p className="text-sm text-gray-600">
                        ID: {cert.credentialID}
                      </p>
                    )}
                    {cert.credentialURL && (
                      <a
                        href={cert.credentialURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Credential
                      </a>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Awards</h4>
            {editing && (
              <button
                onClick={() => handleAddItem("awards")}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Award
              </button>
            )}

            {(editData.awards || []).map((award, index) => (
              <div
                key={index}
                className="border-l-4 border-yellow-500 pl-6 py-4 bg-yellow-50 rounded-r-xl mb-4"
              >
                {editing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={award.title || ""}
                        onChange={(e) =>
                          handleNestedEditChange(
                            "awards",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Award Title"
                        className="text-lg font-semibold bg-transparent border-b-2 border-yellow-300 focus:border-yellow-500 focus:outline-none w-full"
                      />
                      <button
                        onClick={() => handleRemoveItem("awards", index)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={award.issuer || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "awards",
                          index,
                          "issuer",
                          e.target.value
                        )
                      }
                      placeholder="Issuing Organization"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <input
                      type="month"
                      value={award.date || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "awards",
                          index,
                          "date",
                          e.target.value
                        )
                      }
                      placeholder="Date Received"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                    />
                    <textarea
                      value={award.description || ""}
                      onChange={(e) =>
                        handleNestedEditChange(
                          "awards",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Award description"
                      rows={3}
                      className="w-full bg-transparent border border-gray-300 focus:border-blue-500 focus:outline-none rounded p-2"
                    />
                  </div>
                ) : (
                  <>
                    <h5 className="font-semibold text-gray-900">
                      {award.title}
                    </h5>
                    <p className="text-gray-600">{award.issuer}</p>
                    <p className="text-sm text-gray-500">Date: {award.date}</p>
                    {award.description && (
                      <p className="text-gray-700 mt-2">{award.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ),

      preferences: (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">
            Job Preferences
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Job Title
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editData.jobPreferences?.desiredJobTitle || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      jobPreferences: {
                        ...prev.jobPreferences,
                        desiredJobTitle: e.target.value,
                      },
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <p className="text-gray-700">
                  {user.jobPreferences?.desiredJobTitle || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editData.jobPreferences?.industry || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      jobPreferences: {
                        ...prev.jobPreferences,
                        industry: e.target.value,
                      },
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <p className="text-gray-700">
                  {user.jobPreferences?.industry || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Location
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editData.jobPreferences?.preferredLocation || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      jobPreferences: {
                        ...prev.jobPreferences,
                        preferredLocation: e.target.value,
                      },
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <p className="text-gray-700">
                  {user.jobPreferences?.preferredLocation || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              {editing ? (
                <select
                  value={editData.jobPreferences?.jobType || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      jobPreferences: {
                        ...prev.jobPreferences,
                        jobType:
                          e.target.value === "" ? undefined : e.target.value,
                      },
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              ) : (
                <p className="text-gray-700">
                  {user.jobPreferences?.jobType || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Expectation
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editData.jobPreferences?.salaryExpectation || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      jobPreferences: {
                        ...prev.jobPreferences,
                        salaryExpectation: e.target.value,
                      },
                    }))
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <p className="text-gray-700">
                  {user.jobPreferences?.salaryExpectation || "Not specified"}
                </p>
              )}
            </div>

            <div className="flex items-center">
              {editing ? (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editData.jobPreferences?.relocation || false}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        jobPreferences: {
                          ...prev.jobPreferences,
                          relocation: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Willing to relocate
                  </span>
                </label>
              ) : (
                <p className="text-gray-700">
                  Willing to relocate:{" "}
                  {user.jobPreferences?.relocation ? "Yes" : "No"}
                </p>
              )}
            </div>
          </div>
        </div>
      ),

      // 4. Added new section content for 'account'
      account: (
        <div className="space-y-4 p-4 border border-red-200 bg-red-50 rounded-lg">
          <h4 className="text-lg font-semibold text-red-800">Delete Account</h4>
          <p className="text-gray-700">
            Permanently delete your account and all associated data, including
            your profile, applications, and saved jobs. This action cannot be
            undone.
          </p>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete My Account
          </button>
        </div>
      ),
    };

    return sections[activeSection] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600">Unable to load user profile.</p>
        </div>
      </div>
    );
  }

  // 5. Added 'account' to the icon and title objects
  const sectionIcons = {
    contact: User,
    about: BookOpen,
    education: GraduationCap,
    experience: Briefcase,
    skills: Award,
    projects: Code,
    certifications: FileText,
    preferences: Target,
    account: Trash2,
  };

  const sectionTitles = {
    contact: "Contact Information",
    about: "About Me",
    education: "Education",
    experience: "Experience & Internships",
    skills: "Skills & Languages",
    projects: "Projects",
    certifications: "Certifications & Awards",
    preferences: "Job Preferences",
    account: "Account Settings",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <button
          onClick={() => navigate("/find-jobs")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Find Jobs
        </button>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center border-4 border-white shadow-2xl">
                  {(editing ? editData.avatar : user.avatar) ? (
                    <img
                      src={editing ? editData.avatar : user.avatar}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-blue-600" />
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all duration-200">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  {editing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={editData.fullName || ""}
                      onChange={handleEditChange}
                      className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-700"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.fullName}
                    </h1>
                  )}
                  {user.role === "graduate" && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Graduate
                    </span>
                  )}
                </div>

                {editing ? (
                  <input
                    type="text"
                    name="degree"
                    value={editData.degree || ""}
                    onChange={handleEditChange}
                    placeholder="Your degree"
                    className="text-lg text-blue-600 font-medium bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  user.degree && (
                    <p className="text-lg text-blue-600 font-medium">
                      {user.degree}
                    </p>
                  )
                )}

                <div className="flex space-x-4 mt-3">
                  {editing ? (
                    <>
                      <input
                        type="url"
                        name="linkedin"
                        value={editData.linkedin || ""}
                        onChange={handleEditChange}
                        placeholder="LinkedIn URL"
                        className="text-sm text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 px-2 py-1"
                      />
                      <input
                        type="url"
                        name="github"
                        value={editData.github || ""}
                        onChange={handleEditChange}
                        placeholder="GitHub URL"
                        className="text-sm text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 px-2 py-1"
                      />
                    </>
                  ) : (
                    <>
                      {user.linkedin && (
                        <a
                          href={user.linkedin}
                          className="text-gray-600 hover:text-blue-600"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {user.github && (
                        <a
                          href={user.github}
                          className="text-gray-600 hover:text-gray-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 flex space-x-3">
              {!editing ? (
                <>
                  <button
                    onClick={() => navigate("/resume-builder")}
                    className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Build Resume
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Profile
                  </button>
                </>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditData(user);
                    }}
                    className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Sections
              </h3>
              <nav className="space-y-2">
                {Object.entries(sectionTitles).map(([key, title]) => {
                  const IconComponent = sectionIcons[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${activeSection === key
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                        } ${key === "account" // Special styling for delete
                          ? "text-red-600 hover:bg-red-50"
                          : ""
                        } ${activeSection === "account"
                          ? "!bg-red-100 !text-red-700"
                          : ""
                        }`}
                    >
                      <IconComponent className="w-4 h-4 mr-3" />
                      {title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="xl:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-xl font-semibold flex items-center ${activeSection === "account"
                    ? "text-red-700"
                    : "text-gray-900"
                    }`}
                >
                  {React.createElement(sectionIcons[activeSection], {
                    className: `w-6 h-6 mr-3 ${activeSection === "account"
                      ? "text-red-600"
                      : "text-blue-600"
                      }`,
                  })}
                  {sectionTitles[activeSection]}
                </h3>
              </div>

              {renderSectionContent()}
            </motion.div>

            {user.role === "graduate" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mt-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-600" />
                  Resume
                </h3>

                <div className="space-y-4">
                  {(editing ? editData.resume : user.resume) ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={downloadResume}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Resume
                      </button>
                      {editing && (
                        <>
                          <label className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all cursor-pointer">
                            <Upload className="w-5 h-5 mr-2" />
                            Update Resume
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={handleResumeUpload}
                            />
                          </label>
                          <button
                            onClick={handleDeleteResume}
                            className="flex-1 flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                          >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Delete Resume
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      {editing ? (
                        <label className="cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            Click to upload your resume
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            PDF, DOC, DOCX (Max 5MB)
                          </p>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                          />
                        </label>
                      ) : (
                        <p className="text-gray-500">No resume uploaded</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Added Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full m-4"
              onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Delete Your Account?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete your account? All of
                your data, including your profile, applications, and saved jobs,
                will be lost forever. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount} // This calls the delete function
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
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
