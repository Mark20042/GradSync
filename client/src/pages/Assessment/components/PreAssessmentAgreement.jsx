import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  X,
} from "lucide-react";

const PreAssessmentAgreement = ({ assessment, onAgree, onCancel }) => {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const rules = [
    {
      icon: AlertTriangle,
      title: "No Tab Switching",
      description:
        "Switching tabs or windows will be detected and counted as a violation. Three violations will result in automatic submission.",
      color: "text-red-600",
    },
    {
      icon: Eye,
      title: "Stay Focused",
      description:
        "Keep your browser window active and in focus throughout the assessment. Minimize distractions.",
      color: "text-orange-600",
    },
    {
      icon: Clock,
      title: "Time Limit",
      description: `You have ${assessment.timeLimit || 15} minutes to complete this assessment. The timer cannot be paused.`,
      color: "text-blue-600",
    },
    {
      icon: Shield,
      title: "No External Resources",
      description:
        "Do not use external resources, tools, or assistance. This assessment tests your individual knowledge.",
      color: "text-purple-600",
    },
  ];

  const terms = [
    "I understand that this assessment is monitored for integrity violations",
    "I will not use any external resources or assistance during the assessment",
    "I will not switch tabs, windows, or leave the assessment page",
    "I understand that violations may result in automatic submission and review",
    "I agree to complete this assessment honestly and independently",
    "I understand that the results of this assessment will be viewed by the employer of the applied job of yours",
  ];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-6xl w-[95%] lg:w-full mx-auto my-4 sm:my-6 lg:my-8 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 lg:p-8">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white m-0">
                Assessment Agreement
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm lg:text-base mt-1 m-0">
                {assessment.title}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white transition-colors shrink-0"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Assessment Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center divide-x divide-blue-200">
            <div className="px-1 sm:px-4">
              <p className="text-gray-500 text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase mb-1 sm:mb-2 line-clamp-1">
                Questions
              </p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">
                {assessment.questions?.length || 0}
              </p>
            </div>
            <div className="px-1 sm:px-4">
              <p className="text-gray-500 text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase mb-1 sm:mb-2 line-clamp-1">
                Time Limit
              </p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">
                {assessment.timeLimit || 15}m
              </p>
            </div>
            <div className="px-1 sm:px-4">
              <p className="text-gray-500 text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase mb-1 sm:mb-2 line-clamp-1">
                Passing Score
              </p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">
                {assessment.passingScore || 80}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Rules */}
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              Assessment Rules
            </h3>
            <div className="space-y-3 mb-6 sm:mb-8">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <rule.icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${rule.color} flex-shrink-0 mt-0.5`}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base m-0">
                      {rule.title}
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2 m-0 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-2 sm:mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Three-Strike Warning System
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-amber-800">
                <p className="m-0 flex items-start gap-2">
                  <strong className="whitespace-nowrap">Strike 1:</strong> 
                  <span>Warning notification - Continue with caution</span>
                </p>
                <p className="m-0 flex items-start gap-2">
                  <strong className="whitespace-nowrap">Strike 2:</strong> 
                  <span>Final warning - One more violation will end the assessment</span>
                </p>
                <p className="m-0 flex items-start gap-2">
                  <strong className="whitespace-nowrap">Strike 3:</strong> 
                  <span>Assessment automatically submitted for admin review</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right: Terms + Agreement */}
          <div className="mt-2 lg:mt-0">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h3>
            <div className="space-y-3 bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200 mb-6 sm:mb-8">
              {terms.map((term, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-gray-700 m-0 leading-relaxed">{term}</p>
                </div>
              ))}
            </div>

            <label className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-blue-50 border-2 border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors mb-6 sm:mb-8">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5 shrink-0"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-900 leading-relaxed">
                I have read and agree to all the terms, conditions, and rules
                stated above. I understand that violations will be monitored and
                may result in assessment termination.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={onAgree}
                disabled={!agreed}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 text-sm sm:text-base"
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                Next
              </button>
              <button
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:bg-gray-300 order-last sm:order-none text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreAssessmentAgreement;
