import React, { useState } from 'react';
import { Award, Trash2, Plus, ExternalLink, Trophy } from 'lucide-react';

const CertificationsSection = ({ user, editing, editData, setEditData }) => {
    const [activeTab, setActiveTab] = useState('certifications');

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

    const certData = editing ? editData.certifications : user.certifications;
    const awardData = editing ? editData.awards : user.awards;

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-6 h-6 mr-3 text-blue-600" />
                Certifications & Awards
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('certifications')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'certifications'
                            ? 'bg-yellow-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <Award className="w-4 h-4" />
                    Certifications ({certData?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('awards')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'awards'
                            ? 'bg-purple-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <Trophy className="w-4 h-4" />
                    Awards ({awardData?.length || 0})
                </button>
            </div>

            {/* Certifications Tab */}
            {activeTab === 'certifications' && (
                <div className="space-y-4">
                    {certData?.map((cert, index) => (
                        <div
                            key={index}
                            className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 relative"
                        >
                            {editing && (
                                <button
                                    onClick={() => handleRemoveItem(index, "certifications")}
                                    className="absolute right-4 top-4 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            {editing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={cert.name || ""}
                                        onChange={(e) => handleArrayChange(e, index, "name", "certifications")}
                                        placeholder="Certificate Name"
                                        className="w-full bg-transparent border-b-2 border-yellow-300 focus:border-yellow-500 focus:outline-none font-semibold text-lg"
                                    />
                                    <input
                                        type="text"
                                        value={cert.issuer || ""}
                                        onChange={(e) => handleArrayChange(e, index, "issuer", "certifications")}
                                        placeholder="Issuing Organization"
                                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Issue Date</label>
                                            <input
                                                type="month"
                                                value={cert.issueDate || ""}
                                                onChange={(e) => handleArrayChange(e, index, "issueDate", "certifications")}
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Expiration (optional)</label>
                                            <input
                                                type="month"
                                                value={cert.expirationDate || ""}
                                                onChange={(e) => handleArrayChange(e, index, "expirationDate", "certifications")}
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={cert.credentialID || ""}
                                        onChange={(e) => handleArrayChange(e, index, "credentialID", "certifications")}
                                        placeholder="Credential ID (optional)"
                                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                                    />
                                    <input
                                        type="url"
                                        value={cert.credentialURL || ""}
                                        onChange={(e) => handleArrayChange(e, index, "credentialURL", "certifications")}
                                        placeholder="Credential URL (optional)"
                                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm text-blue-600"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-lg">{cert.name}</h4>
                                            <p className="text-yellow-700 font-medium">{cert.issuer}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Issued: {formatDate(cert.issueDate)}
                                                {cert.expirationDate && ` • Expires: ${formatDate(cert.expirationDate)}`}
                                            </p>
                                            {cert.credentialID && (
                                                <p className="text-xs text-gray-400 mt-1">ID: {cert.credentialID}</p>
                                            )}
                                        </div>
                                        {cert.credentialURL && (
                                            <a
                                                href={cert.credentialURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {editing && (
                        <button
                            onClick={() => handleAddItem("certifications", {
                                name: "",
                                issuer: "",
                                issueDate: "",
                                expirationDate: "",
                                credentialID: "",
                                credentialURL: "",
                            })}
                            className="flex items-center text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Certification
                        </button>
                    )}
                    {!editing && (!certData || certData.length === 0) && (
                        <p className="text-gray-500 text-sm">No certifications added yet</p>
                    )}
                </div>
            )}

            {/* Awards Tab */}
            {activeTab === 'awards' && (
                <div className="space-y-4">
                    {awardData?.map((award, index) => (
                        <div
                            key={index}
                            className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 relative"
                        >
                            {editing && (
                                <button
                                    onClick={() => handleRemoveItem(index, "awards")}
                                    className="absolute right-4 top-4 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            {editing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={award.title || ""}
                                        onChange={(e) => handleArrayChange(e, index, "title", "awards")}
                                        placeholder="Award Title"
                                        className="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none font-semibold text-lg"
                                    />
                                    <input
                                        type="text"
                                        value={award.issuer || ""}
                                        onChange={(e) => handleArrayChange(e, index, "issuer", "awards")}
                                        placeholder="Issuing Organization"
                                        className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                    />
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Date Received</label>
                                        <input
                                            type="month"
                                            value={award.date || ""}
                                            onChange={(e) => handleArrayChange(e, index, "date", "awards")}
                                            className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1"
                                        />
                                    </div>
                                    <textarea
                                        value={award.description || ""}
                                        onChange={(e) => handleArrayChange(e, index, "description", "awards")}
                                        placeholder="Description (optional)"
                                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
                                        rows={2}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Trophy className="w-5 h-5 text-purple-500" />
                                        <h4 className="font-semibold text-gray-900 text-lg">{award.title}</h4>
                                    </div>
                                    <p className="text-purple-600 font-medium">{award.issuer}</p>
                                    <p className="text-sm text-gray-500 mt-1">{formatDate(award.date)}</p>
                                    {award.description && (
                                        <p className="text-sm text-gray-600 mt-2">{award.description}</p>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                    {editing && (
                        <button
                            onClick={() => handleAddItem("awards", {
                                title: "",
                                issuer: "",
                                date: "",
                                description: "",
                            })}
                            className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Award
                        </button>
                    )}
                    {!editing && (!awardData || awardData.length === 0) && (
                        <p className="text-gray-500 text-sm">No awards added yet</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CertificationsSection;
