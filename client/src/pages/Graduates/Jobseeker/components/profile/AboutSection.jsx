import React from 'react';
import { User, Sparkles, FileText, Award } from 'lucide-react';
import StarRating from "../../../../../components/ratings/StarRating";

const AboutSection = ({ user, editing, editData, setEditData, summaryLoading, handleGenerateSummary }) => {
    const aiCost = user?.systemSettings?.aiCosts?.profileGeneration || 1;

    const onGenerateClick = () => {
        if ((user?.aiTokens || 0) < aiCost) {
            window.dispatchEvent(new CustomEvent("openTokenModal"));
            return;
        }
        handleGenerateSummary();
    };

    const renderBio = (text) => {
        if (!text) return "No bio provided yet. Click 'Edit Profile' to add your story!";
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                return <span key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                About Me
            </h3>

            {!editing && user?.employeeAverageRating > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 shadow rounded-xl p-6 mb-6">
                    <h2 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" />
                        Conduct Score
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-white rounded-xl w-16 h-16 shadow-sm border border-indigo-100 shrink-0">
                            <span className="text-2xl font-extrabold text-indigo-700 leading-none">
                                {user.employeeAverageRating.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-semibold mt-0.5">/5.0</span>
                        </div>
                        <div>
                            <StarRating
                                value={Math.round(user.employeeAverageRating)}
                                size="sm"
                                readOnly
                            />
                            <p className="text-xs text-indigo-600 mt-1.5 font-medium">
                                Based on {user.employeeRatingCount} employer{user.employeeRatingCount === 1 ? '' : 's'}
                            </p>
                            <p className="text-[11px] text-indigo-400 mt-0.5">Performance rating based on previous jobs</p>
                        </div>
                    </div>
                </div>
            )}

            {editing ? (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <button
                            onClick={onGenerateClick}
                            disabled={summaryLoading}
                            className="flex items-center gap-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 font-medium shadow-sm"
                        >
                            {summaryLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate with AI
                                    <span className="flex items-center gap-1 ml-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                                        <img src="/gradcoin.svg" alt="GradCoin" className="w-3.5 h-3.5 object-contain" /> {aiCost}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        name="bio"
                        value={editData.bio || ""}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={8}
                        placeholder="Tell us about yourself, your career goals, and what makes you unique..."
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:outline-none resize-none text-gray-700"
                    />
                </div>
            ) : (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                        {renderBio(user.bio)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AboutSection;
