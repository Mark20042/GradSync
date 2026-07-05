import React from "react";
import {
  Clock,
  Target,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shield,
} from "lucide-react";

const InstructionsScreen = ({ assessment, onStart, onCancel }) => {
  const instructions = [
    {
      icon: Clock,
      title: "Time Management",
      points: [
        `You have ${assessment.timeLimit || 15} minutes to complete all questions`,
        "The timer starts immediately when you begin",
        "Time cannot be paused or extended",
        "Assessment auto-submits when time expires",
      ],
    },
    {
      icon: BookOpen,
      title: "Navigation",
      points: [
        "You can navigate between questions using Next/Previous buttons",
        "Review and change your answers before submitting",
        "Unanswered questions will be marked as incorrect",
        "Submit button appears after answering all questions",
      ],
    },
    {
      icon: Target,
      title: "Scoring",
      points: [
        `Passing score: ${assessment.passingScore || 80}%`,
        "Each question carries equal weight",
        "Only one answer is correct per question",
        "Results are shown immediately after submission",
      ],
    },
    {
      icon: Shield,
      title: "Integrity Rules",
      points: [
        "Stay on the assessment tab - switching tabs is monitored",
        "No external resources or tools allowed",
        "Complete the assessment independently",
        "Multiple violations may result in rejection",
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 max-w-[1100px] w-[95%] lg:w-full mx-auto my-4 sm:my-6 lg:my-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 m-0">
            Assessment Instructions
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 m-0 text-sm sm:text-base">{assessment.title}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 border border-blue-200">
          <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase mb-1 line-clamp-1">
            Questions
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">
            {assessment.questions?.length || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 border border-purple-200">
          <p className="text-[10px] sm:text-xs font-semibold text-purple-600 uppercase mb-1 line-clamp-1">
            Time Limit
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">
            {assessment.timeLimit || 15}m
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 border border-green-200">
          <p className="text-[10px] sm:text-xs font-semibold text-green-600 uppercase mb-1 line-clamp-1">
            Passing Score
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">
            {assessment.passingScore || 80}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 sm:p-4 border border-orange-200">
          <p className="text-[10px] sm:text-xs font-semibold text-orange-600 uppercase mb-1 line-clamp-1">
            Difficulty
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-900 capitalize">
            {assessment.difficulty}
          </p>
        </div>
      </div>

      {/* Instructions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {instructions.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6"
          >
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 m-0">
                {section.title}
              </h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              {section.points.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs sm:text-sm lg:text-base text-gray-700"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl sm:rounded-2xl shadow-sm border border-red-200 p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-red-900 mb-1 sm:mb-2 m-0">
              Important: Assessment Monitoring
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-red-800 mb-2 sm:mb-3 m-0 leading-relaxed">
              This assessment is monitored for integrity violations. Tab
              switching, window blur events, and other suspicious activities are
              tracked. You will receive warnings for violations, and multiple
              violations may result in rejection upon submission.
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-red-800 font-semibold m-0">
              Please ensure you're in a quiet environment with a stable internet
              connection before starting.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
        <button
          onClick={onStart}
          className="flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl transition-all hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 text-sm sm:text-base"
        >
          <span>Begin Assessment</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 text-gray-700 font-bold rounded-xl transition-all hover:bg-gray-200 order-last sm:order-none text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InstructionsScreen;
