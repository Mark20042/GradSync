import React from 'react';
import { User, Sparkles, FileText } from 'lucide-react';

const AboutSection = ({ user, editing, editData, setEditData, summaryLoading, handleGenerateSummary }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                About Me
            </h3>

            {editing ? (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <button
                            onClick={handleGenerateSummary}
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
                        {user.bio || "No bio provided yet. Click 'Edit Profile' to add your story!"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AboutSection;
