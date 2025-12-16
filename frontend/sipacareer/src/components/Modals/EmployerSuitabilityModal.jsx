import React, { useEffect } from "react";
import { X, Sparkles, BrainCircuit, AlertTriangle, CheckCircle } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const EmployerSuitabilityModal = ({
    isOpen,
    onClose,
    loading,
    result,
    candidateName,
    jobTitle
}) => {
    if (!isOpen) return null;

    // Get color based on score
    const getScoreColor = (score) => {
        if (score >= 85) return "bg-emerald-500";
        if (score >= 70) return "bg-blue-500";
        if (score >= 50) return "bg-amber-500";
        return "bg-red-500";
    };

    const getScoreLabel = (score) => {
        if (score >= 85) return "Excellent Match";
        if (score >= 70) return "Good Fit";
        if (score >= 50) return "Moderate Fit";
        return "Not Qualified";
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="bg-indigo-50 p-3 rounded-full">
                        <BrainCircuit className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            AI Candidate Analysis
                        </h2>
                        <p className="text-sm text-gray-500">
                            Evaluating <span className="font-medium text-gray-800">{candidateName}</span> for <span className="font-medium text-gray-800">{jobTitle}</span>
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {/* Thinking State */}
                        <div className="flex flex-col items-center justify-center py-4">
                            <p className="text-sm text-indigo-600 font-medium animate-pulse">Analyzing skills match...</p>
                        </div>

                        {/* Score Bar Skeleton */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <Skeleton width={100} height={20} />
                                <Skeleton width={60} height={32} />
                            </div>
                            <Skeleton height={12} borderRadius={9999} />
                            <div className="flex justify-center mt-2">
                                <Skeleton width={100} height={16} />
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
                            <Skeleton count={2} />
                        </div>
                    </div>
                ) : result ? (
                    <div className="space-y-5">
                        {/* Score Section */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-700">Suitability Score</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-3xl font-bold ${result.score >= 70 ? "text-emerald-600" : result.score >= 50 ? "text-amber-600" : "text-red-600"
                                        }`}>{result.score}</span>
                                    <span className="text-gray-400 text-lg font-medium">/100</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getScoreColor(result.score)} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${result.score}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-center mt-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${result.score >= 70 ? "bg-emerald-100 text-emerald-700" : result.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                    }`}>
                                    {getScoreLabel(result.score)}
                                </span>
                            </div>
                        </div>

                        {/* Analysis / Reasoning */}
                        <div className={`p-5 rounded-xl border ${result.score >= 50 ? "bg-indigo-50 border-indigo-100" : "bg-red-50 border-red-100"
                            }`}>
                            <h3 className={`font-semibold mb-2 flex items-center gap-2 ${result.score >= 50 ? "text-indigo-900" : "text-red-900"
                                }`}>
                                {result.score >= 50 ? <Sparkles className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                AI Assessment & Reasoning
                            </h3>
                            <p className={`text-sm leading-relaxed ${result.score >= 50 ? "text-indigo-800" : "text-red-800"
                                }`}>
                                {result.analysis}
                            </p>
                        </div>

                        {/* Missing Skills / Recommendations */}
                        {result.recommendations && result.recommendations.length > 0 && (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2 text-sm">
                                    Missing Qualifications / Gaps
                                </h3>
                                <ul className="space-y-2">
                                    {result.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2 text-orange-800 text-sm">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200 mt-2"
                        >
                            Close Analysis
                        </button>
                    </div>
                ) : (
                    // Fallback error state
                    <div className="text-center py-8">
                        <p className="text-red-500">Failed to load analysis.</p>
                        <button onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-700">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerSuitabilityModal;
