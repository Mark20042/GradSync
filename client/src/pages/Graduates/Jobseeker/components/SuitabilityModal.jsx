import React from "react";
import { X, Sparkles } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SuitabilityModal = ({
  isOpen,
  onClose,
  loading,
  result,
  onStartAnalysis,
}) => {
  if (!isOpen) return null;

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-amber-500";
    if (score >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent ";
    if (score >= 70) return "Good ";
    if (score >= 50) return "Moderate ";
    if (score >= 25) return "Weak ";
    return "Poor ";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col relative animate-in fade-in zoom-in duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 m-0">
              AI Suitability Analysis
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">

        {loading ? (
          <div className="space-y-4">
            {/* Score Bar Skeleton */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <Skeleton width={100} height={20} />
                <Skeleton width={80} height={32} />
              </div>
              <Skeleton height={12} borderRadius={9999} />
              <div className="flex justify-center mt-2">
                <Skeleton width={120} height={16} />
              </div>
            </div>

            {/* Analysis Skeleton */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Skeleton width={80} height={20} className="mb-2" />
              <Skeleton count={3} />
            </div>

            {/* Recommendations Skeleton */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Skeleton width={180} height={20} className="mb-2" />
              <Skeleton count={3} />
            </div>

            <Skeleton height={48} borderRadius={12} />

            <p className="text-center text-sm text-gray-400">
              Analyzing your profile...
            </p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Score Bar */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">Match Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{result.score}</span>
                  <span className="text-gray-400 text-sm">%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-10 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreColor(result.score)} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500 mt-2 text-center">
                {getScoreLabel(result.score)}
              </p>
            </div>

            {/* Analysis */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-2">Analysis</h3>
              <p className="text-indigo-800 text-sm leading-relaxed">
                {result.analysis}
              </p>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Recommended Improvements
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-orange-800 text-sm">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition mt-4"
            >
              Close Analysis
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">
              Click below to analyze if you're a good fit for this role.
            </p>
            <button
              onClick={onStartAnalysis}
              className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition w-full"
            >
              Start Analysis
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SuitabilityModal;
