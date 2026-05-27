import React, { useState } from 'react';
import { Briefcase, Trash2, Plus } from 'lucide-react';

const ExperienceSection = ({ user, editing, editData, setEditData }) => {
    const [activeTab, setActiveTab] = useState('experiences');

    const handleArrayChange = (e, index, field, section) => {
        const newArray = [...(editData[section] || [])];
        newArray[index] = { ...newArray[index], [field]: e.target.value };
        setEditData({ ...editData, [section]: newArray });
    };

    const handleAddItem = (section, initialData) => {
        setEditData({
            ...editData,
            [section]: [...(editData[section] || []), initialData],
        });
    };

    const handleRemoveItem = (index, section) => {
        const newArray = (editData[section] || []).filter((_, i) => i !== index);
        setEditData({ ...editData, [section]: newArray });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
            const [year, month] = dateStr.split('-');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[parseInt(month) - 1]} ${year}`;
        }
        return dateStr;
    };

    const renderExperienceCard = (exp, index, section, borderColor, bgColor) => (
        <div
            key={index}
            className={`border-l-4 ${borderColor} pl-6 py-4 ${bgColor} rounded-r-xl relative`}
        >
            {editing && (
                <button
                    onClick={() => handleRemoveItem(index, section)}
                    className="absolute right-4 top-4 text-red-500 hover:text-red-700"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            {editing ? (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={exp.title || ""}
                        onChange={(e) => handleArrayChange(e, index, "title", section)}
                        placeholder="Job Title / Role"
                        className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none font-semibold text-lg"
                    />
                    <input
                        type="text"
                        value={exp.company || ""}
                        onChange={(e) => handleArrayChange(e, index, "company", section)}
                        placeholder="Company / Organization"
                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={exp.location || ""}
                        onChange={(e) => handleArrayChange(e, index, "location", section)}
                        placeholder="Location"
                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="month"
                            value={exp.startDate || ""}
                            onChange={(e) => handleArrayChange(e, index, "startDate", section)}
                            placeholder="Start Date"
                            className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                        />
                        <input
                            type="month"
                            value={exp.endDate || ""}
                            onChange={(e) => handleArrayChange(e, index, "endDate", section)}
                            placeholder="End Date"
                            className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                        />
                    </div>
                    <textarea
                        value={exp.description || ""}
                        onChange={(e) => handleArrayChange(e, index, "description", section)}
                        placeholder="Description of your role and achievements..."
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
                        rows={3}
                    />
                </div>
            ) : (
                <>
                    <h4 className="text-lg font-semibold text-gray-900">{exp.title}</h4>
                    <p className={`font-medium ${section === 'experiences' ? 'text-green-600' : 'text-blue-600'}`}>
                        {exp.company}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                        {exp.location && ` • ${exp.location}`}
                    </p>
                    {exp.description && (
                        <p className="text-sm text-gray-600">{exp.description}</p>
                    )}
                </>
            )}
        </div>
    );

    const experienceData = editing ? editData.experiences : user.experiences;
    const internshipData = editing ? editData.internships : user.internships;

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                Experience & Internships
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('experiences')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'experiences'
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Work Experience ({experienceData?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('internships')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'internships'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Internships ({internshipData?.length || 0})
                </button>
            </div>

            {/* Work Experience */}
            {activeTab === 'experiences' && (
                <div className="space-y-4">
                    {experienceData?.map((exp, index) =>
                        renderExperienceCard(exp, index, 'experiences', 'border-green-500', 'bg-green-50')
                    )}
                    {editing && (
                        <button
                            onClick={() => handleAddItem("experiences", {
                                title: "",
                                company: "",
                                location: "",
                                startDate: "",
                                endDate: "",
                                description: "",
                            })}
                            className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Work Experience
                        </button>
                    )}
                    {!editing && (!experienceData || experienceData.length === 0) && (
                        <p className="text-gray-500 text-sm">No work experience added yet</p>
                    )}
                </div>
            )}

            {/* Internships */}
            {activeTab === 'internships' && (
                <div className="space-y-4">
                    {internshipData?.map((intern, index) =>
                        renderExperienceCard(intern, index, 'internships', 'border-blue-500', 'bg-blue-50')
                    )}
                    {editing && (
                        <button
                            onClick={() => handleAddItem("internships", {
                                title: "",
                                company: "",
                                location: "",
                                startDate: "",
                                endDate: "",
                                description: "",
                            })}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Internship
                        </button>
                    )}
                    {!editing && (!internshipData || internshipData.length === 0) && (
                        <p className="text-gray-500 text-sm">No internships added yet</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExperienceSection;
