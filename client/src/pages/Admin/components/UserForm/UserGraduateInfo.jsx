
import React from 'react';
import { Eye, EyeOff, Upload, File, Loader, Plus, Trash2 } from 'lucide-react';
import { Degrees } from '../../../../utils/data';


const UserGraduateInfo = ({ editingUser, setEditingUser, degreeSearchTerm, setDegreeSearchTerm, showDegreeDropdown, setShowDegreeDropdown, degreeDropdownRef }) => {
    return (
        <>
                        {/* Graduate Specific */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                                    <div className="md:col-span-2">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Primary Academic Info</h3>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                                        <input
                                            type="text"
                                            value={editingUser.university || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, university: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">University Address</label>
                                        <input
                                            type="text"
                                            value={editingUser.universityAddress || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, universityAddress: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div ref={degreeDropdownRef} className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                        <input
                                            type="text"
                                            placeholder="Search for a degree..."
                                            value={showDegreeDropdown ? degreeSearchTerm : (editingUser.degree || "")}
                                            onChange={(e) => {
                                                setDegreeSearchTerm(e.target.value);
                                                setShowDegreeDropdown(true);
                                                if (editingUser.degree) {
                                                    setEditingUser({ ...editingUser, degree: "" });
                                                }
                                            }}
                                            onFocus={() => {
                                                setDegreeSearchTerm("");
                                                setShowDegreeDropdown(true);
                                            }}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                        {showDegreeDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {Object.keys(Degrees)
                                                    .filter((degree) =>
                                                        degree.toLowerCase().includes(degreeSearchTerm.toLowerCase())
                                                    )
                                                    .map((key) => (
                                                        <div
                                                            key={key}
                                                            onClick={() => {
                                                                setEditingUser({ ...editingUser, degree: key });
                                                                setDegreeSearchTerm("");
                                                                setShowDegreeDropdown(false);
                                                            }}
                                                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                                                        >
                                                            {key}
                                                        </div>
                                                    ))}
                                                {Object.keys(Degrees).filter((degree) =>
                                                    degree.toLowerCase().includes(degreeSearchTerm.toLowerCase())
                                                ).length === 0 && (
                                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                        No degrees found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                                        <input
                                            type="text"
                                            value={editingUser.major || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, major: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Education</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newEducation = [...(editingUser.education || []), {
                                                school: "",
                                                degree: "",
                                                startDate: "",
                                                endDate: "",
                                                location: "",
                                                activities: ""
                                            }];
                                            setEditingUser({ ...editingUser, education: newEducation });
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Education
                                    </button>
                                </div>

                                {editingUser.education && editingUser.education.length > 0 ? (
                                    <div className="space-y-4">
                                        {editingUser.education.map((edu, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newEducation = editingUser.education.filter((_, i) => i !== index);
                                                        setEditingUser({ ...editingUser, education: newEducation });
                                                    }}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                                                        <input
                                                            type="text"
                                                            value={edu.school || ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].school = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                                        <input
                                                            type="text"
                                                            value={edu.degree || ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].degree = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                        <input
                                                            type="month"
                                                            value={edu.startDate ? (typeof edu.startDate === "string" && edu.startDate.includes("T") ? edu.startDate.substring(0, 7) : (edu.startDate.length > 7 ? edu.startDate.substring(0, 7) : edu.startDate)) : ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].startDate = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                        <input
                                                            type="month"
                                                            value={edu.endDate ? (typeof edu.endDate === "string" && edu.endDate.includes("T") ? edu.endDate.substring(0, 7) : (edu.endDate.length > 7 ? edu.endDate.substring(0, 7) : edu.endDate)) : ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].endDate = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                        <input
                                                            type="text"
                                                            value={edu.location || ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].location = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Activities</label>
                                                        <textarea
                                                            value={edu.activities || ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].activities = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            rows="2"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                                        <p className="text-gray-500 text-sm">No education entries. Click "Add Education" to add one.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Graduate Specific - Professional Links */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Professional</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                                        <input
                                            type="text"
                                            value={editingUser.linkedin || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, linkedin: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                                        <input
                                            type="text"
                                            value={editingUser.github || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, github: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                                        <input
                                            type="text"
                                            value={editingUser.portfolio || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, portfolio: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Skills */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Skills</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={editingUser.skills ? editingUser.skills.join(", ") : ""}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            skills: e.target.value.split(",").map(skill => skill.trim())
                                        })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g. React, Node.js, Python"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Languages */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Languages</h4>
                                <div className="space-y-4">
                                    {editingUser.languages && editingUser.languages.map((lang, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <input
                                                type="text"
                                                value={lang.language}
                                                onChange={(e) => {
                                                    const newLanguages = [...editingUser.languages];
                                                    newLanguages[index].language = e.target.value;
                                                    setEditingUser({ ...editingUser, languages: newLanguages });
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Language (e.g. English)"
                                            />
                                            <select
                                                value={lang.proficiency}
                                                onChange={(e) => {
                                                    const newLanguages = [...editingUser.languages];
                                                    newLanguages[index].proficiency = e.target.value;
                                                    setEditingUser({ ...editingUser, languages: newLanguages });
                                                }}
                                                className="w-40 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="Basic">Basic</option>
                                                <option value="Conversational">Conversational</option>
                                                <option value="Fluent">Fluent</option>
                                                <option value="Native">Native</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newLanguages = editingUser.languages.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, languages: newLanguages });
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <i className="fas fa-trash"></i> Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newLanguages = [...(editingUser.languages || []), { language: "", proficiency: "Basic" }];
                                            setEditingUser({ ...editingUser, languages: newLanguages });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Language
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Experience (Simplified Edit) */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Experience</h4>
                                <div className="space-y-4">
                                    {editingUser.experiences && editingUser.experiences.map((exp, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    value={exp.title || ""}
                                                    onChange={(e) => {
                                                        const newExperiences = [...editingUser.experiences];
                                                        newExperiences[index].title = e.target.value;
                                                        setEditingUser({ ...editingUser, experiences: newExperiences });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={exp.company || ""}
                                                    onChange={(e) => {
                                                        const newExperiences = [...editingUser.experiences];
                                                        newExperiences[index].company = e.target.value;
                                                        setEditingUser({ ...editingUser, experiences: newExperiences });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Company"
                                                />
                                                <div className="flex flex-col">
                                                    <label className="text-xs text-gray-500 mb-1">Start Date</label>
                                                    <input
                                                        type="month"
                                                        value={exp.startDate ? new Date(exp.startDate).toISOString().substring(0, 7) : ""}
                                                        onChange={(e) => {
                                                            const newExperiences = [...editingUser.experiences];
                                                            newExperiences[index].startDate = e.target.value;
                                                            setEditingUser({ ...editingUser, experiences: newExperiences });
                                                        }}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="text-xs text-gray-500 mb-1">End Date</label>
                                                    <input
                                                        type="month"
                                                        value={exp.endDate ? new Date(exp.endDate).toISOString().substring(0, 7) : ""}
                                                        onChange={(e) => {
                                                            const newExperiences = [...editingUser.experiences];
                                                            newExperiences[index].endDate = e.target.value;
                                                            setEditingUser({ ...editingUser, experiences: newExperiences });
                                                        }}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                value={exp.description}
                                                onChange={(e) => {
                                                    const newExperiences = [...editingUser.experiences];
                                                    newExperiences[index].description = e.target.value;
                                                    setEditingUser({ ...editingUser, experiences: newExperiences });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20 resize-none"
                                                placeholder="Description"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newExperiences = editingUser.experiences.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, experiences: newExperiences });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Experience
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newExperiences = [...(editingUser.experiences || []), { title: "", company: "", description: "", startDate: "", endDate: "", current: false }];
                                            setEditingUser({ ...editingUser, experiences: newExperiences });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Experience
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Internships */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Internships</h4>
                                <div className="space-y-4">
                                    {editingUser.internships && editingUser.internships.map((internship, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    value={internship.title || ""}
                                                    onChange={(e) => {
                                                        const newInternships = [...editingUser.internships];
                                                        newInternships[index].title = e.target.value;
                                                        setEditingUser({ ...editingUser, internships: newInternships });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={internship.company || ""}
                                                    onChange={(e) => {
                                                        const newInternships = [...editingUser.internships];
                                                        newInternships[index].company = e.target.value;
                                                        setEditingUser({ ...editingUser, internships: newInternships });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Company"
                                                />
                                                <div className="flex flex-col">
                                                    <label className="text-xs text-gray-500 mb-1">Start Date</label>
                                                    <input
                                                        type="month"
                                                        value={internship.startDate ? new Date(internship.startDate).toISOString().substring(0, 7) : ""}
                                                        onChange={(e) => {
                                                            const newInternships = [...editingUser.internships];
                                                            newInternships[index].startDate = e.target.value;
                                                            setEditingUser({ ...editingUser, internships: newInternships });
                                                        }}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="text-xs text-gray-500 mb-1">End Date</label>
                                                    <input
                                                        type="month"
                                                        value={internship.endDate ? new Date(internship.endDate).toISOString().substring(0, 7) : ""}
                                                        onChange={(e) => {
                                                            const newInternships = [...editingUser.internships];
                                                            newInternships[index].endDate = e.target.value;
                                                            setEditingUser({ ...editingUser, internships: newInternships });
                                                        }}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                value={internship.description}
                                                onChange={(e) => {
                                                    const newInternships = [...editingUser.internships];
                                                    newInternships[index].description = e.target.value;
                                                    setEditingUser({ ...editingUser, internships: newInternships });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20 resize-none"
                                                placeholder="Description"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newInternships = editingUser.internships.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, internships: newInternships });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Internship
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newInternships = [...(editingUser.internships || []), { title: "", company: "", description: "", startDate: "", endDate: "", current: false }];
                                            setEditingUser({ ...editingUser, internships: newInternships });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Internship
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Awards */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Awards</h4>
                                <div className="space-y-4">
                                    {editingUser.awards && editingUser.awards.map((award, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    value={award.title || ""}
                                                    onChange={(e) => {
                                                        const newAwards = [...editingUser.awards];
                                                        newAwards[index].title = e.target.value;
                                                        setEditingUser({ ...editingUser, awards: newAwards });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={award.issuer || ""}
                                                    onChange={(e) => {
                                                        const newAwards = [...editingUser.awards];
                                                        newAwards[index].issuer = e.target.value;
                                                        setEditingUser({ ...editingUser, awards: newAwards });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Issuer"
                                                />
                                                <div className="flex flex-col md:col-span-2">
                                                    <label className="text-xs text-gray-500 mb-1">Date Received</label>
                                                    <input
                                                        type="month"
                                                        value={award.date ? new Date(award.date).toISOString().substring(0, 7) : ""}
                                                        onChange={(e) => {
                                                            const newAwards = [...editingUser.awards];
                                                            newAwards[index].date = e.target.value;
                                                            setEditingUser({ ...editingUser, awards: newAwards });
                                                        }}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm w-1/2"
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                value={award.description}
                                                onChange={(e) => {
                                                    const newAwards = [...editingUser.awards];
                                                    newAwards[index].description = e.target.value;
                                                    setEditingUser({ ...editingUser, awards: newAwards });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20 resize-none"
                                                placeholder="Description"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newAwards = editingUser.awards.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, awards: newAwards });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Award
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newAwards = [...(editingUser.awards || []), { title: "", issuer: "", description: "", date: "" }];
                                            setEditingUser({ ...editingUser, awards: newAwards });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Award
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Certifications</h4>
                                <div className="space-y-4">
                                    {editingUser.certifications && editingUser.certifications.map((cert, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    value={cert.name || ""}
                                                    onChange={(e) => {
                                                        const newCerts = [...editingUser.certifications];
                                                        newCerts[index].name = e.target.value;
                                                        setEditingUser({ ...editingUser, certifications: newCerts });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Name"
                                                />
                                                <input
                                                    type="text"
                                                    value={cert.issuer || ""}
                                                    onChange={(e) => {
                                                        const newCerts = [...editingUser.certifications];
                                                        newCerts[index].issuer = e.target.value;
                                                        setEditingUser({ ...editingUser, certifications: newCerts });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Issuer"
                                                />
                                                <div className="flex flex-col md:col-span-2">
                                                    <label className="text-xs text-gray-500 mb-1">Issue Date</label>
                                                    <input
                                                        type="month"
                                                        value={cert.issueDate ? new Date(cert.issueDate).toISOString().substring(0, 7) : ""}
                                                        onChange={(e) => {
                                                            const newCerts = [...editingUser.certifications];
                                                            newCerts[index].issueDate = e.target.value;
                                                            setEditingUser({ ...editingUser, certifications: newCerts });
                                                        }}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm w-1/2"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newCerts = editingUser.certifications.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, certifications: newCerts });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Certification
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newCerts = [...(editingUser.certifications || []), { name: "", issuer: "", issueDate: "" }];
                                            setEditingUser({ ...editingUser, certifications: newCerts });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Certification
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Projects</h4>
                                <div className="space-y-4">
                                    {editingUser.projects && editingUser.projects.map((proj, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    value={proj.name || ""}
                                                    onChange={(e) => {
                                                        const newProjects = [...editingUser.projects];
                                                        newProjects[index].name = e.target.value;
                                                        setEditingUser({ ...editingUser, projects: newProjects });
                                                    }}
                                                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Project Name"
                                                />
                                            </div>
                                            <textarea
                                                value={proj.description || ""}
                                                onChange={(e) => {
                                                    const newProjects = [...editingUser.projects];
                                                    newProjects[index].description = e.target.value;
                                                    setEditingUser({ ...editingUser, projects: newProjects });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20 resize-none mb-2"
                                                placeholder="Description"
                                            />
                                            <input
                                                type="text"
                                                value={proj.url || ""}
                                                onChange={(e) => {
                                                    const newProjects = [...editingUser.projects];
                                                    newProjects[index].url = e.target.value;
                                                    setEditingUser({ ...editingUser, projects: newProjects });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm mb-2"
                                                placeholder="Project URL"
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                                <div className="flex flex-col">
                                                    <label className="text-xs text-gray-500 mb-1">Start Date</label>
                                                    <input
                                                        type="month"
                                                        value={proj.startDate ? new Date(proj.startDate).toISOString().substring(0, 7) : ""}
                                                        onChange={(e) => {
                                                            const newProjects = [...editingUser.projects];
                                                            newProjects[index].startDate = e.target.value;
                                                            setEditingUser({ ...editingUser, projects: newProjects });
                                                        }}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="text-xs text-gray-500 mb-1">End Date</label>
                                                    <input
                                                        type="month"
                                                        value={proj.endDate ? new Date(proj.endDate).toISOString().substring(0, 7) : ""}
                                                        onChange={(e) => {
                                                            const newProjects = [...editingUser.projects];
                                                            newProjects[index].endDate = e.target.value;
                                                            setEditingUser({ ...editingUser, projects: newProjects });
                                                        }}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newProjects = editingUser.projects.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, projects: newProjects });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Project
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newProjects = [...(editingUser.projects || []), { name: "", description: "", url: "", startDate: "", endDate: "" }];
                                            setEditingUser({ ...editingUser, projects: newProjects });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Project
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Job Preferences */}
                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Job Preferences</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Desired Job Title</label>
                                        <input
                                            type="text"
                                            value={editingUser.jobPreferences?.desiredJobTitle || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...(editingUser.jobPreferences || {}), desiredJobTitle: e.target.value }
                                            })}
                                            placeholder="e.g. Marketing Manager"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                        <input
                                            type="text"
                                            value={editingUser.jobPreferences?.industry || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...(editingUser.jobPreferences || {}), industry: e.target.value }
                                            })}
                                            placeholder="e.g. Finance, Healthcare"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                                        <input
                                            type="text"
                                            value={editingUser.jobPreferences?.preferredLocation || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...(editingUser.jobPreferences || {}), preferredLocation: e.target.value }
                                            })}
                                            placeholder="e.g. Manila, Cebu"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                                        <select
                                            value={editingUser.jobPreferences?.jobType || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...(editingUser.jobPreferences || {}), jobType: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Select job type</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Remote">Remote</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation (₱ per month)</label>
                                        <input
                                            type="number"
                                            value={editingUser.jobPreferences?.salaryExpectation || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...(editingUser.jobPreferences || {}), salaryExpectation: e.target.value ? Number(e.target.value) : undefined }
                                            })}
                                            placeholder="e.g. 75000"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="relocation"
                                            checked={editingUser.jobPreferences?.relocation || false}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...(editingUser.jobPreferences || {}), relocation: e.target.checked }
                                            })}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="relocation" className="ml-2 text-sm text-gray-700">
                                            Willing to relocate
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}



        </>
    );
};

export default UserGraduateInfo;
