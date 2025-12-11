// components/FormSteps/FormSteps.js
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import BasicInfoStep from "./BasicInfoStep";
import EducationStep from "./EducationStep";
import ExperienceStep from "./ExperienceStep";
import SkillsStep from "./SkillsStep";
import ProjectsStep from "./ProjectsStep";
import JobPreferencesStep from "./JobPreferencesStep";

const stepTitles = [
  "Basic Information",
  "Education",
  "Experience",
  "Skills & Certifications",
  "Projects",
  "Job Preferences",
  "Finalize",
];

const FormSteps = ({
  currentStep,
  formData,
  setFormData,
  validationErrors,
  userData,
  onReceiveDownloadFunction,
}) => {
  const renderStep = () => {
    const commonProps = {
      formData,
      setFormData,
      validationErrors,
      userData,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...commonProps} />;
      case 2:
        return <EducationStep {...commonProps} />;
      case 3:
        return <ExperienceStep {...commonProps} />;
      case 4:
        return <SkillsStep {...commonProps} />;
      case 5:
        return <ProjectsStep {...commonProps} />;
      case 6:
        return <JobPreferencesStep {...commonProps} />;
      case 7:
        return <BasicInfoStep {...commonProps} />;
      default:
        return <BasicInfoStep {...commonProps} />;
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-800">
        Step {currentStep}: {stepTitles[currentStep - 1] || "Complete Profile"}
      </h2>
      <p className="text-gray-600 text-sm">
        Complete this section to continue building your profile
      </p>

      <form className="space-y-6 mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </form>
    </div>
  );
};

export default FormSteps;
