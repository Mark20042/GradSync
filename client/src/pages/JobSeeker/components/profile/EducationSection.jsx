import React from 'react';
import { GraduationCap, Trash2, Plus } from 'lucide-react';

const EducationSection = ({ user, editing, editData, setEditData }) => {
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

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-6 h-6 mr-3 text-blue-600" />
                Education
            </h3>
            <div className="space-y-6">
                {(editing ? editData.education : user.education)?.map((edu, index) => (
                    <div
                        key={index}
                        className="border-l-4 border-purple-500 pl-6 py-4 bg-purple-50 rounded-r-xl relative"
                    >
                        {editing && (
                            <button
                                onClick={() => handleRemoveItem(index, "education")}
                                className="absolute right-4 top-4 text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        {editing ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={edu.school || ""}
                                    onChange={(e) =>
                                        handleArrayChange(e, index, "school", "education")
                                    }
                                    placeholder="School/University"
                                    className="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none font-semibold text-lg"
                                />
                                <input
                                    type="text"
                                    value={edu.degree || ""}
                                    onChange={(e) =>
                                        handleArrayChange(e, index, "degree", "education")
                                    }
                                    placeholder="Degree"
                                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="month"
                                        value={edu.startDate || ""}
                                        onChange={(e) =>
                                            handleArrayChange(e, index, "startDate", "education")
                                        }
                                        placeholder="Start Date"
                                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                                    />
                                    <input
                                        type="month"
                                        value={edu.endDate || ""}
                                        onChange={(e) =>
                                            handleArrayChange(e, index, "endDate", "education")
                                        }
                                        placeholder="End Date"
                                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={edu.location || ""}
                                    onChange={(e) =>
                                        handleArrayChange(e, index, "location", "education")
                                    }
                                    placeholder="Location"
                                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        ) : (
                            <>
                                <h4 className="text-lg font-semibold text-gray-900">
                                    {edu.school}
                                </h4>
                                <p className="text-purple-600 font-medium">{edu.degree}</p>
                                <p className="text-sm text-gray-500">
                                    {formatDate(edu.startDate)} - {formatDate(edu.endDate) || "Present"}
                                    {edu.location && ` | ${edu.location}`}
                                </p>
                            </>
                        )}
                    </div>
                ))}
                {editing && (
                    <button
                        onClick={() =>
                            handleAddItem("education", {
                                school: "",
                                degree: "",
                                startDate: "",
                                endDate: "",
                                location: "",
                            })
                        }
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Education
                    </button>
                )}
                {!editing && (!user.education || user.education.length === 0) && (
                    <p className="text-gray-500 text-sm">No education added yet</p>
                )}
            </div>
        </div>
    );
};

export default EducationSection;
