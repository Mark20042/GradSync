import React from "react";
import { ArrowLeft, Check } from "lucide-react";

const SetupProgressBar = ({ setupStep, onBack }) => {
  const stepLabels = ["Rules & Guidelines", "Agreement", "Camera Setup"];

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between relative z-20 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1 sm:gap-2 border-none bg-transparent text-slate-500 font-semibold text-xs sm:text-sm cursor-pointer hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Back</span>
      </button>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {stepLabels.map((label, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                  setupStep > idx + 1
                    ? "bg-emerald-500 text-white"
                    : setupStep === idx + 1
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-slate-200 text-slate-400"
                }`}
              >
                {setupStep > idx + 1 ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : idx + 1}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold hidden sm:inline ${
                  setupStep === idx + 1 ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < 2 && (
              <div className={`w-4 sm:w-12 h-0.5 rounded ${
                setupStep > idx + 1 ? "bg-emerald-400" : "bg-slate-200"
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="w-8 sm:w-16" /> {/* Placeholder to balance flex */}
    </div>
  );
};

export default SetupProgressBar;
