// SetupProfileGrad.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";

import ProgressSteps from "./components/ProgressSteps";
import ProfilePreview from "./components/ProfilePreview";
import FormSteps from "./components/FromSteps/FormSteps"; // Check if path/typo is correct
import NavigationButton from "./components/NavigationButton";
import { CheckCircle } from "lucide-react"; // Import CheckCircle for success message

const SetupProfileGrad = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7; // Reduced steps since Resume is removed

  const [formData, setFormData] = useState({
    university: "",
    graduationYear: "",
    graduationMonth: "",
    portfolio: "",
    linkedin: "",
    github: "",
    resume: null, // Initialize as null for potential file upload
    skills: "",
    degree: "",
    bio: "",
    address: "",
    phone: "",
    website: "", // This field wasn't used before, ensure it's handled if needed
    major: "",
    experiences: [],
    internships: [],
    education: [], // Initialize the array for EducationStep
    awards: [],
    certifications: [],
    projects: [],
    languages: [],
    experienceType: "work", // Default for ExperienceStep tab
    certificationType: "certification", // Default for SkillsStep tab
    jobPreferences: {
      desiredJobTitle: "",
      industry: "",
      preferredLocation: "",
      jobType: "",
      salaryExpectation: "",
      relocation: false,
    },
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    setUserData(storedUser);
    setFormData((prev) => ({
      ...prev,
      degree: storedUser.degree || "",
      // You could pre-fill other fields from storedUser if available
      // e.g., fullName: storedUser.fullName || "", email: storedUser.email || ""
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobPreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const validateStep = () => {
    const errors = {};
    // Add validation checks for required fields in each step
    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.university?.trim())
          errors.university = "University is required";
        if (!formData.graduationYear?.trim())
          errors.graduationYear = "Graduation year is required";
        if (!formData.degree?.trim()) errors.degree = "Degree is required";
        break;
      // Add cases for other steps with required fields
      // Example for SkillsStep (assuming step 4)
      case 4:
        if (!formData.skills?.trim())
          errors.skills = "At least one skill is required";
        break;
      // Example for ExperienceStep (assuming step 3) - maybe no required fields, just the ability to add
      // case 3:
      //    break;
      // Example for JobPreferencesStep (assuming step 6) - maybe no required fields
      // case 6:
      //    break;
      default:
        break;
    }
    setValidationErrors(errors);
    console.log("Validation Errors:", errors); // Log errors for debugging
    return Object.keys(errors).length === 0;
  };

  const nextStep = async () => {
    // Only validate if NOT moving to the last step
    const shouldValidate = currentStep < 6; // Stop validating before step 6 (Job Prefs)

    if (currentStep < totalSteps && (!shouldValidate || validateStep())) {
      setCurrentStep(currentStep + 1);
      setValidationErrors({});
    }
    // If validation fails, errors are already set and displayed
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check if we are on the final step
    if (currentStep !== totalSteps) {
      console.error("handleSubmit called on incorrect step.");
      return;
    }

    setLoading(true); // Start loading

    // 4. Submit the profile data (JSON)
    console.log("Proceeding with profile data submission...");
    try {
      // --- Combine ALL education for the payload ---
      let combinedEducationPayload = [];

      // 1. Add Primary Education (from Step 1)
      if (formData.university) {
        combinedEducationPayload.push({
          school: formData.university,
          degree: formData.degree || "",
          major: formData.major || "",
          endDate: `${formData.graduationMonth ? formData.graduationMonth + " " : ""}${formData.graduationYear}` || "",
          startDate: "",
          location: formData.address || "",
          activities: "",
          isPrimary: true,
        });
      }

      // 2. Add Other Education (from Step 2), avoiding exact duplicates of school name
      if (formData.education && formData.education.length > 0) {
        formData.education.forEach((otherEdu) => {
          // Check if this school is already added (case-insensitive check might be better but simple check for now)
          const isDuplicate = combinedEducationPayload.some(
            (existing) => existing.school === otherEdu.school
          );

          if (!isDuplicate) {
            combinedEducationPayload.push({ ...otherEdu, isPrimary: false });
          }
        });
      }
      // --- End Education Fix ---

      const payload = {
        ...formData,
        skills:
          typeof formData.skills === "string"
            ? formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean) // Use filter(Boolean) to remove empty strings
            : formData.skills || [],
        education: combinedEducationPayload, // Use the combined array
        experiences: formData.experiences || [],
        internships: formData.internships || [],
        projects: formData.projects || [],
        certifications: formData.certifications || [],
        awards: formData.awards || [],
        languages: formData.languages || [],
        jobPreferences: formData.jobPreferences || {},
      };

      delete payload.experienceType;
      delete payload.certificationType;
      // Prevent overwriting resume if it's null or empty (since it's uploaded separately)
      if (!payload.resume || payload.resume instanceof File) {
        delete payload.resume;
      }

      console.log(
        "Submitting profile data payload:",
        JSON.stringify(payload, null, 2)
      );
      await axiosInstance.put(API_PATH.AUTH.SETUP_GRAD_PROFILE, payload);
      console.log("Profile setup successful.");

      // 6. Show success and navigate
      setSuccess(true);
      setTimeout(() => navigate("/find-jobs"), 2000);
    } catch (err) {
      console.error(
        "Setup profile submission or upload failed:",
        err.response?.data || err.message || err
      );

      // Check for the 404 error specifically on the resume upload
      if (
        err.response &&
        err.response.status === 404 &&
        err.config.url.includes(API_PATH.AUTH.UPLOAD_RESUME)
      ) {
        alert(
          "Profile data was saved, but automatic resume upload failed. The server endpoint (API) was not found (404). Please upload your resume manually from your profile page."
        );
        // Still count as success because profile data was saved
        setSuccess(true);
        setTimeout(() => navigate("/find-jobs"), 3500); // Give user time to read
      } else {
        // Handle other errors (like profile save failure)
        alert(
          `An error occurred: ${err.response?.data?.message || err.message || "Unknown error"
          }`
        );
        setLoading(false); // Stop loading on other errors so user can retry
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full text-center max-w-md"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Profile Complete!
          </h2>
          <p className="text-gray-600">
            Your profile has been saved successfully.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Redirecting you shortly...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Graduate Profile
          </h1>
          <p className="text-gray-600">
            Build your professional profile to stand out to employers
          </p>
        </div>

        <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <ProfilePreview userData={userData} formData={formData} />
          <motion.div
            key={currentStep} // Add key for animation on step change
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full lg:w-3/5"
          >
            <div className="bg-white p-6 rounded-xl shadow-md">
              <FormSteps
                currentStep={currentStep}
                formData={formData}
                setFormData={setFormData}
                validationErrors={validationErrors}
                userData={userData}
              />

              <NavigationButton
                currentStep={currentStep}
                totalSteps={totalSteps}
                onPrev={prevStep}
                onNext={nextStep}
                onSubmit={handleSubmit}
                loading={loading}
                // Disable Next if current step fails validation
                isNextDisabled={
                  Object.keys(validationErrors).length > 0 &&
                  currentStep < totalSteps // Disable next on any step if validation fails
                }
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SetupProfileGrad;
