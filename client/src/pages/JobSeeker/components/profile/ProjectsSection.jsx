import React from 'react';
import { Layers, Trash2, Plus, ExternalLink } from 'lucide-react';

const ProjectsSection = ({ user, editing, editData, setEditData }) => {
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

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Layers className="w-6 h-6 mr-3 text-blue-600" />
                Projects
            </h3>
            <div className="grid gap-4">
                {(editing ? editData.projects : user.projects)?.map((proj, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 relative group"
                    >
                        {editing && (
                            <button
                                onClick={() => handleRemoveItem(index, "projects")}
                                className="absolute right-4 top-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        {editing ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={proj.name || ""}
                                    onChange={(e) =>
                                        handleArrayChange(e, index, "name", "projects")
                                    }
                                    placeholder="Project Name"
                                    className="w-full bg-transparent border-b-2 border-blue-300 focus:border-blue-500 focus:outline-none font-semibold text-lg"
                                />
                                <textarea
                                    value={proj.description || ""}
                                    onChange={(e) =>
                                        handleArrayChange(e, index, "description", "projects")
                                    }
                                    placeholder="Project Description"
                                    className="w-full bg-white border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:outline-none"
                                    rows={3}
                                />
                                <input
                                    type="url"
                                    value={proj.url || ""}
                                    onChange={(e) =>
                                        handleArrayChange(e, index, "url", "projects")
                                    }
                                    placeholder="Project URL (optional)"
                                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm text-blue-600"
                                />
                                <input
                                    type="text"
                                    value={proj.technologies?.join(", ") || ""}
                                    onChange={(e) => {
                                        const newArray = [...(editData.projects || [])];
                                        newArray[index] = {
                                            ...newArray[index],
                                            technologies: e.target.value.split(",").map(t => t.trim())
                                        };
                                        setEditData({ ...editData, projects: newArray });
                                    }}
                                    placeholder="Technologies (comma separated)"
                                    className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900 text-lg">{proj.name}</h4>
                                    {proj.url && (
                                        <a
                                            href={proj.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View
                                        </a>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{proj.description}</p>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {proj.technologies.map((tech, i) => (
                                            <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
                {editing && (
                    <button
                        onClick={() =>
                            handleAddItem("projects", {
                                name: "",
                                description: "",
                                url: "",
                                technologies: [],
                            })
                        }
                        className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add Project
                    </button>
                )}
                {!editing && (!user.projects || user.projects.length === 0) && (
                    <p className="text-gray-500 text-sm">No projects added yet</p>
                )}
            </div>
        </div>
    );
};

export default ProjectsSection;
