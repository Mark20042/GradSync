import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import {
  CheckCircle, MapPin, Phone, User, FileText, Code,
  Calendar, Globe, Github, Linkedin, Briefcase,
  ArrowRight, ArrowLeft, Loader2, Plus, X, Sparkles, BookOpen
} from "lucide-react";
import LocationDetectInput from "../../components/Input/LocationDetectInput";
import toast from "react-hot-toast";

const stepsConfig = [
  { id: 1, title: "Personal Details", desc: "How can employers reach you?" },
  { id: 2, title: "Professional Links", desc: "Showcase your online presence." },
  { id: 3, title: "Work Experience", desc: "Share your professional history." },
  { id: 4, title: "Skills & Bio", desc: "What makes you stand out?" },
  { id: 5, title: "Job Preferences", desc: "What kind of job are you looking for?" },
];

// --- Input helper ---
const InputField = ({ icon: Icon, label, required, error, children, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}{required && " *"}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `w-full pl-11 pr-4 py-3.5 rounded-xl border ${err ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"} focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-700`;

const SetupProfileJobseeker = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: "", address: "", birthdate: "", bio: "",
    website: "", github: "", linkedin: "", portfolio: "",
    skills: "", experiences: [], internships: [],
    experienceType: "work",
    jobPreferences: {
      desiredJobTitle: "", industry: "", preferredLocation: "", jobType: "Full-time", salaryExpectation: "", relocation: false
    }
  });

  const [newExp, setNewExp] = useState({
    title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    JSON.parse(localStorage.getItem("user")) || {};
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors((p) => ({ ...p, [name]: "" }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      jobPreferences: { ...prev.jobPreferences, [name]: type === 'checkbox' ? checked : value }
    }));
    if (validationErrors[name]) setValidationErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleExpChange = (field, value) => setNewExp((p) => ({ ...p, [field]: value }));

  const addExperience = () => {
    if (!newExp.title || !newExp.company) { toast.error("Title & Company are required."); return; }
    const key = formData.experienceType === "work" ? "experiences" : "internships";
    setFormData((p) => ({ ...p, [key]: [...p[key], newExp] }));
    setNewExp({ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
    toast.success("Added!");
  };

  const removeExperience = (idx, type) => {
    const key = type === "work" ? "experiences" : "internships";
    setFormData((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await axiosInstance.post(API_PATH.AI.GENERATE_SUMMARY);
      setFormData((p) => ({ ...p, bio: response.data.summary }));
      toast.success("Bio generated!");
    } catch { toast.error("Failed to generate summary"); }
    finally { setSummaryLoading(false); }
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.phone?.trim()) errors.phone = "Phone number is required";
      if (!formData.address?.trim()) errors.address = "Address is required";
    } else if (step === 4) {
      if (!formData.skills?.trim()) errors.skills = "At least one skill is required";
      if (!formData.bio?.trim()) errors.bio = "A short professional bio is required";
    } else if (step === 5) {
      if (!formData.jobPreferences?.desiredJobTitle?.trim()) errors.desiredJobTitle = "Desired Job Title is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) { setCurrentStep((p) => Math.min(p + 1, stepsConfig.length)); }
    else { toast.error("Please fill in all required fields."); }
  };
  const handleBack = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(5)) { toast.error("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        isProfileComplete: true,
      };
      delete payload.experienceType;
      await axiosInstance.put(API_PATH.AUTH.SETUP_GRAD_PROFILE, payload);
      setSuccess(true);
      setTimeout(() => navigate("/find-jobs"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  // --- Success screen ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center max-w-md w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Profile Complete!</h2>
          <p className="text-gray-600 mb-8">Your profile has been saved. Employers can now discover you.</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 font-medium">
            <Loader2 className="w-5 h-5 animate-spin" /><span>Redirecting to your dashboard...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Current experience list ---
  const currentList = formData.experienceType === "work" ? formData.experiences : formData.internships;
  const otherList = formData.experienceType === "work" ? formData.internships : formData.experiences;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Complete Your Profile</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Add a few more details to help top employers find you.</p>
      </div>

      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-6 sm:px-10 sm:py-8">
          <div className="flex items-center justify-between relative z-10">
            {stepsConfig.map((step) => (
              <div key={step.id} className="flex flex-col items-center relative w-1/5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                  currentStep >= step.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50" : "bg-gray-100 text-gray-400"
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.id}
                </div>
                <div className="mt-4 text-center hidden sm:block">
                  <p className={`text-xs font-bold ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"}`}>{step.title}</p>
                </div>
              </div>
            ))}
            <div className="absolute top-6 left-[12.5%] right-[12.5%] h-[3px] bg-gray-100 -z-10 rounded-full">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep - 1) / (stepsConfig.length - 1)) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="px-6 py-8 sm:px-10 sm:py-10 bg-gray-50/50">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-6"><h3 className="text-2xl font-bold text-gray-900">Personal Details</h3><p className="text-gray-500 text-sm mt-1">Provide your basic contact information.</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField icon={Phone} label="Phone Number" required error={validationErrors.phone}>
                      <div className="relative group"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+63 912 345 6789" className={inputCls(validationErrors.phone)} />
                      </div>
                    </InputField>
                    <InputField icon={Calendar} label="Birthdate">
                      <div className="relative group"><Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input type="date" name="birthdate" value={formData.birthdate ? new Date(formData.birthdate).toISOString().split("T")[0] : ""} onChange={handleChange} className={inputCls(false)} />
                      </div>
                    </InputField>
                    <InputField label="Location / Address" required error={validationErrors.address} className="md:col-span-2">
                      <LocationDetectInput name="address" placeholder="e.g. Cebu City, Philippines" value={formData.address} onChange={handleChange} />
                    </InputField>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Links */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div><h3 className="text-2xl font-bold text-gray-900">Professional Presence</h3><p className="text-gray-500 text-sm mt-1">Add links to showcase your portfolio.</p></div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full uppercase tracking-wider">Optional</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: "linkedin", icon: Linkedin, label: "LinkedIn Profile", ph: "https://linkedin.com/in/..." },
                      { name: "github", icon: Github, label: "GitHub Profile", ph: "https://github.com/..." },
                    ].map(({ name, icon: Icon, label, ph }) => (
                      <InputField key={name} label={label}>
                        <div className="relative group"><Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                          <input type="url" name={name} value={formData[name]} onChange={handleChange} placeholder={ph} className={inputCls(false)} />
                        </div>
                      </InputField>
                    ))}
                    <InputField label="Personal Website / Portfolio" className="md:col-span-2">
                      <div className="relative group"><Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourportfolio.com" className={inputCls(false)} />
                      </div>
                    </InputField>
                  </div>
                </div>
              )}

              {/* Step 3: Work Experience */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div><h3 className="text-2xl font-bold text-gray-900">Work Experience</h3><p className="text-gray-500 text-sm mt-1">Add your professional or internship history.</p></div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full uppercase tracking-wider">Optional</span>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 mb-4">
                    {[{ key: "work", label: "Work Experience", icon: Briefcase }, { key: "internship", label: "Internships", icon: BookOpen }].map(({ key, label, icon: Icon }) => (
                      <button key={key} type="button" onClick={() => setFormData((p) => ({ ...p, experienceType: key }))}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${formData.experienceType === key ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                        <Icon className="w-4 h-4" />{label}
                      </button>
                    ))}
                  </div>

                  {/* Add form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{formData.experienceType === "work" ? "Job Title" : "Internship Role"} *</label>
                      <input type="text" value={newExp.title} onChange={(e) => handleExpChange("title", e.target.value)}
                        placeholder={formData.experienceType === "work" ? "e.g. Software Engineer" : "e.g. Software Dev Intern"}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                      <input type="text" value={newExp.company} onChange={(e) => handleExpChange("company", e.target.value)} placeholder="Company name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input type="text" value={newExp.location} onChange={(e) => handleExpChange("location", e.target.value)} placeholder="e.g. Cebu City"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
                    </div>
                    <div className="flex items-center md:col-span-2">
                      <input type="checkbox" id="currentJob" checked={newExp.current} onChange={(e) => handleExpChange("current", e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="currentJob" className="ml-2 text-sm text-gray-700">{formData.experienceType === "work" ? "I currently work here" : "Current Internship"}</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input type="month" value={newExp.startDate} onChange={(e) => handleExpChange("startDate", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
                    </div>
                    {!newExp.current && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input type="month" value={newExp.endDate} onChange={(e) => handleExpChange("endDate", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea value={newExp.description} onChange={(e) => handleExpChange("description", e.target.value)} rows={3}
                        placeholder="Describe your responsibilities and achievements..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
                    </div>
                  </div>
                  <button type="button" onClick={addExperience}
                    className="flex items-center text-blue-600 font-medium text-sm px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />Add {formData.experienceType === "work" ? "Work Experience" : "Internship"}
                  </button>

                  {/* Added items */}
                  {currentList.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <h4 className="font-medium text-gray-700 text-sm">{formData.experienceType === "work" ? "Work Experience" : "Internships"}</h4>
                      {currentList.map((exp, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-start shadow-sm">
                          <div><p className="font-semibold text-sm">{exp.title}</p><p className="text-gray-500 text-xs">{exp.company} • {exp.startDate} - {exp.current ? "Present" : exp.endDate}</p></div>
                          <button type="button" onClick={() => removeExperience(idx, formData.experienceType)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {otherList.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                      You have {otherList.length} {formData.experienceType === "work" ? "internship(s)" : "work experience(s)"} added. Switch tabs to manage them.
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Skills & Bio */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="mb-6"><h3 className="text-2xl font-bold text-gray-900">Skills & Bio</h3><p className="text-gray-500 text-sm mt-1">What are your strengths?</p></div>

                  {/* Bio with AI */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Professional Bio *</label>
                      <button type="button" onClick={handleGenerateSummary} disabled={summaryLoading}
                        className="flex items-center gap-2 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 font-medium shadow-sm">
                        {summaryLoading ? (<><div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />Generating...</>) : (<><Sparkles className="w-3 h-3" />Generate with AI</>)}
                      </button>
                    </div>
                    <div className="relative group">
                      <FileText className="absolute left-3.5 top-4 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                      <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="I am a passionate developer with 3 years of experience..."
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${validationErrors.bio ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"} focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-700 resize-none`} />
                    </div>
                    {validationErrors.bio && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{validationErrors.bio}</p>}
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Key Skills * <span className="text-gray-400 font-normal ml-1">(comma separated)</span></label>
                    <div className="relative group">
                      <Code className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                      <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="JavaScript, React, Node.js"
                        className={inputCls(validationErrors.skills)} />
                    </div>
                    {validationErrors.skills && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{validationErrors.skills}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formData.skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill, idx) => (
                        <span key={idx} className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 shadow-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Job Preferences */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="mb-6"><h3 className="text-2xl font-bold text-gray-900">Job Preferences</h3><p className="text-gray-500 text-sm mt-1">What kind of job are you looking for?</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField icon={Briefcase} label="Desired Job Title" required error={validationErrors.desiredJobTitle}>
                      <div className="relative group">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input type="text" name="desiredJobTitle" value={formData.jobPreferences.desiredJobTitle} onChange={handlePreferenceChange} placeholder="e.g. Frontend Developer" className={inputCls(validationErrors.desiredJobTitle)} />
                      </div>
                    </InputField>

                    <InputField icon={Globe} label="Industry">
                      <div className="relative group">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input type="text" name="industry" value={formData.jobPreferences.industry} onChange={handlePreferenceChange} placeholder="e.g. Information Technology" className={inputCls(false)} />
                      </div>
                    </InputField>

                    <InputField label="Preferred Location">
                      <LocationDetectInput name="preferredLocation" placeholder="e.g. Remote, Manila" value={formData.jobPreferences.preferredLocation} onChange={handlePreferenceChange} />
                    </InputField>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                      <select name="jobType" value={formData.jobPreferences.jobType} onChange={handlePreferenceChange} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-700 bg-white">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>

                    <InputField label="Salary Expectation (Monthly)">
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₱</span>
                        <input type="number" name="salaryExpectation" value={formData.jobPreferences.salaryExpectation} onChange={handlePreferenceChange} placeholder="e.g. 30000" className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-700 bg-white" />
                      </div>
                    </InputField>

                    <div className="flex items-center mt-8">
                      <input type="checkbox" id="relocation" name="relocation" checked={formData.jobPreferences.relocation} onChange={handlePreferenceChange} className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                      <label htmlFor="relocation" className="ml-3 text-sm font-medium text-gray-700">Open to relocation</label>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-200">
            <button type="button" onClick={handleBack} disabled={currentStep === 1 || loading}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${currentStep === 1 ? "text-gray-400 cursor-not-allowed opacity-40" : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm active:scale-95"}`}>
              <ArrowLeft className="w-5 h-5 mr-2" />Back
            </button>
            {currentStep < stepsConfig.length ? (
              <button type="button" onClick={handleNext}
                className="flex items-center px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 active:scale-95">
                Continue<ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex items-center px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 active:scale-95 disabled:opacity-70">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Saving...</>) : (<>Complete Profile<CheckCircle className="w-5 h-5 ml-2" /></>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupProfileJobseeker;
