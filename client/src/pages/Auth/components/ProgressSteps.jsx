// components/ProgressSteps.js
import React from "react";
import { Check } from "lucide-react";

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
    <div className="mb-10 bg-white p-4 sm:p-6 rounded-xl shadow-sm overflow-x-auto">
      <div className="flex items-start min-w-max sm:min-w-0">
        {[...Array(totalSteps)].map((_, index) => {
          const isCompleted = index + 1 < currentStep;
          const isCurrent = index + 1 === currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step item */}
              <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all duration-300 shrink-0 ${
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white"
                      : isCurrent
                      ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md shadow-blue-100"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : index + 1}
                </div>
                <span
                  className={`text-[10px] sm:text-xs mt-2 text-center leading-tight max-w-[90px] sm:max-w-[110px] ${
                    isCurrent
                      ? "font-semibold text-blue-600"
                      : isCompleted
                      ? "font-medium text-blue-500"
                      : "text-gray-400"
                  }`}
                >
                  {stepTitles[index]}
                </span>
              </div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div className="flex-1 flex items-center self-center mt-[-18px] sm:mt-[-16px] px-1 sm:px-2 min-w-[20px]">
                  <div
                    className={`w-full h-[3px] rounded-full transition-colors duration-300 ${
                      isCompleted ? "bg-blue-600" : "bg-gray-100"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;
