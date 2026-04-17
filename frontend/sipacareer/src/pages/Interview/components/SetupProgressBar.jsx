import React from "react";
import { ArrowLeft, Check } from "lucide-react";

const SetupProgressBar = ({ setupStep, onBack }) => {
  const stepLabels = ["Rules & Guidelines", "Agreement", "Camera Setup"];

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <button
        onClick={onBack}
        className="flex items-center gap-2 border-none bg-transparent text-slate-500 font-semibold text-sm cursor-pointer hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <div className="flex items-center gap-2">
        {stepLabels.map((label, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  setupStep > idx + 1
                    ? "bg-emerald-500 text-white"
                    : setupStep === idx + 1
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-slate-200 text-slate-400"
                }`}
              >
                {setupStep > idx + 1 ? <Check size={16} /> : idx + 1}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  setupStep === idx + 1 ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < 2 && (
              <div className={`w-12 h-0.5 rounded ${
                setupStep > idx + 1 ? "bg-emerald-400" : "bg-slate-200"
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="w-16" /> {/* Placeholder to balance flex */}
    </div>
  );
};

export default SetupProgressBar;
