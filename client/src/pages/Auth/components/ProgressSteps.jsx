// components/ProgressSteps.js
import React from "react";

const stepTitles = [
  "Basic Information",
  "Education",
  "Experience",
  "Skills & Certifications",
  "Projects",
  "Job Preferences",
  "Resume Builder",
  "Finalize Profile",
];

const ProgressSteps = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-10 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between relative z-10">
        {[...Array(totalSteps)].map((_, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 font-medium transition-colors ${
                  index + 1 < currentStep
                    ? "bg-blue-600 border-blue-600 text-white"
                    : index + 1 === currentStep
                    ? "border-blue-600 bg-white text-blue-600"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs mt-2 text-center absolute top-10 w-24 hidden sm:block ${
                  index + 1 === currentStep
                    ? "font-semibold text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {stepTitles[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-colors ${
                  index + 1 < currentStep ? "bg-blue-600" : "bg-gray-100"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
