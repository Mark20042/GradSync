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
        "Three violations result in automatic submission",
      ],
    },
  ];

  const tips = [
    "Read each question carefully before answering",
    "Manage your time - don't spend too long on one question",
    "Review your answers before final submission",
    "Stay calm and focused throughout the assessment",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-6xl w-full mx-auto my-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0">
            Assessment Instructions
          </h1>
          <p className="text-gray-600 mt-1 m-0">{assessment.title}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
            Questions
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {assessment.questions?.length || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-xs font-semibold text-purple-600 uppercase mb-1">
            Time Limit
          </p>
          <p className="text-2xl font-bold text-purple-900">
            {assessment.timeLimit || 15}m
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-600 uppercase mb-1">
            Passing Score
          </p>
          <p className="text-2xl font-bold text-green-900">
            {assessment.passingScore || 80}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <p className="text-xs font-semibold text-orange-600 uppercase mb-1">
            Difficulty
          </p>
          <p className="text-2xl font-bold text-orange-900">
            {assessment.difficulty}
          </p>
        </div>
      </div>

      {/* Instructions Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {instructions.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <section.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 m-0">
                {section.title}
              </h3>
            </div>
            <ul className="space-y-2">
              {section.points.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          <h3 className="text-lg font-bold text-amber-900 m-0">Helpful Tips</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm text-amber-900"
            >
              <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-700">
                  {index + 1}
                </span>
              </div>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg border-2 border-red-200 p-6 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-2 m-0">
              Important: Assessment Monitoring
            </h3>
            <p className="text-sm text-red-800 mb-3 m-0">
              This assessment is monitored for integrity violations. Tab
              switching, window blur events, and other suspicious activities are
              tracked. You will receive warnings for violations, and three
              violations will result in automatic submission and admin review.
            </p>
            <p className="text-sm text-red-800 font-semibold m-0">
              Please ensure you're in a quiet environment with stable internet
              connection before starting.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onStart}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl transition-all hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
        >
          <span>Next</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl transition-all hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm text-gray-500 mt-6 m-0">
        By starting this assessment, you acknowledge that you have read and
        understood all instructions and rules.
      </p>
    </div>
  );
};

export default InstructionsScreen;
