import React from 'react';
import { Target } from 'lucide-react';

const JobPreferencesSection = ({ user, editing, editData, setEditData }) => {
    // Job preferences are nested in jobPreferences object in User model
    const prefs = editing ? (editData.jobPreferences || {}) : (user.jobPreferences || {});

    const handlePrefChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            jobPreferences: {
                ...(prev.jobPreferences || {}),
                [field]: value
            }
        }));
    };

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-6 h-6 mr-3 text-blue-600" />
                Job Preferences
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-2">
                        Desired Job Title
                    </label>
                    {editing ? (
                        <input
                            type="text"
                            value={prefs.desiredJobTitle || ""}
                            onChange={(e) => handlePrefChange("desiredJobTitle", e.target.value)}
                            placeholder="e.g. Software Developer"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    ) : (
                        <p className="font-medium text-gray-800">
                            {prefs.desiredJobTitle || "Not specified"}
                        </p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-2">
                        Industry
                    </label>
                    {editing ? (
                        <input
                            type="text"
                            value={prefs.industry || ""}
                            onChange={(e) => handlePrefChange("industry", e.target.value)}
                            placeholder="e.g. Technology, Healthcare"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    ) : (
                        <p className="font-medium text-gray-800">
                            {prefs.industry || "Not specified"}
                        </p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-2">
                        Preferred Location
                    </label>
                    {editing ? (
                        <input
                            type="text"
                            value={prefs.preferredLocation || ""}
                            onChange={(e) => handlePrefChange("preferredLocation", e.target.value)}
                            placeholder="e.g. Remote, Cebu City"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    ) : (
                        <p className="font-medium text-gray-800">
                            {prefs.preferredLocation || "Not specified"}
                        </p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-2">
                        Job Type
                    </label>
                    {editing ? (
                        <select
                            value={prefs.jobType || ""}
                            onChange={(e) => handlePrefChange("jobType", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select type...</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Remote">Remote</option>
                        </select>
                    ) : (
                        <p className="font-medium text-gray-800">
                            {prefs.jobType || "Not specified"}
                        </p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-2">
                        Salary Expectation
                    </label>
                    {editing ? (
                        <input
                            type="text"
                            value={prefs.salaryExpectation || ""}
                            onChange={(e) => handlePrefChange("salaryExpectation", e.target.value)}
                            placeholder="e.g. ₱25,000 - ₱35,000"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    ) : (
                        <p className="font-medium text-gray-800">
                            {prefs.salaryExpectation || "Not specified"}
                        </p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl border border-cyan-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-2">
                        Open to Relocation
                    </label>
                    {editing ? (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handlePrefChange("relocation", true)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${prefs.relocation === true
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePrefChange("relocation", false)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${prefs.relocation === false
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <p className="font-medium text-gray-800">
                            {prefs.relocation ? "Yes" : prefs.relocation === false ? "No" : "Not specified"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobPreferencesSection;
