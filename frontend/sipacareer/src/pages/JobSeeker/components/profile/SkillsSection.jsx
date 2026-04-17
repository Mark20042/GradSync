import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Lock, Plus, X, Globe } from 'lucide-react';
import { getBadgeComponent } from '../../../../components/Badges/SkillBadges';

const SkillsSection = ({ user, verifiedSkills = [], editing, editData, setEditData }) => {
    const navigate = useNavigate();
    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'Basic' });
    const [selectedSkill, setSelectedSkill] = useState(null);

    const isVerified = (skill) => {
        if (!verifiedSkills || !skill) return null;
        const normalize = (s) => String(s).trim().toLowerCase();
        return verifiedSkills.find(v => normalize(v.skill) === normalize(skill));
    };

    const handleUnverifiedClick = (skillName) => {
        if (!editing) {
            navigate('/skill-center', { state: { targetSkill: skillName } });
        }
    };

    const getBadgeColor = (level) => {
        switch (level) {
            case "Entry": return "from-green-400 to-green-600";
            case "Mid": return "from-blue-400 to-blue-600";
            case "Senior": return "from-purple-400 to-purple-600";
            case "Expert": return "from-orange-400 to-orange-600";
            default: return "from-gray-400 to-gray-600";
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            const currentSkills = editData.skills || [];
            if (!currentSkills.includes(newSkill.trim())) {
                setEditData({
                    ...editData,
                    skills: [...currentSkills, newSkill.trim()]
                });
            }
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setEditData({
            ...editData,
            skills: (editData.skills || []).filter(s => s !== skillToRemove)
        });
    };

    const handleAddLanguage = () => {
        if (newLanguage.language.trim()) {
            const currentLanguages = editData.languages || [];
            setEditData({
                ...editData,
                languages: [...currentLanguages, { ...newLanguage, language: newLanguage.language.trim() }]
            });
            setNewLanguage({ language: '', proficiency: 'Basic' });
        }
    };

    const handleRemoveLanguage = (index) => {
        setEditData({
            ...editData,
            languages: (editData.languages || []).filter((_, i) => i !== index)
        });
    };

    const skillsData = editing ? (editData.skills || []) : (user.skills || []);
    const languagesData = editing ? (editData.languages || []) : (user.languages || []);

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="w-6 h-6 mr-3 text-blue-600" />
                Skills & Languages
            </h3>

            {/* Skills Section */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Skills</h4>

                {/* Add Skill Input (Edit Mode) */}
                {editing && (
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            placeholder="Add a skill (e.g., React, Python, Project Management)"
                            className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                        />
                        <button
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    {skillsData.map((skill, index) => {
                        const verified = isVerified(skill);
                        const BadgeIcon = verified ? getBadgeComponent(verified.level) : null;

                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    if (verified) setSelectedSkill(verified);
                                    else if (!verified && !editing) handleUnverifiedClick(skill);
                                }}
                                className={`
                                    relative px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 group
                                    ${verified
                                        ? `bg-gradient-to-r ${getBadgeColor(verified.level)} text-white shadow-md cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5`
                                        : editing
                                            ? 'bg-gray-100 text-gray-700 border border-gray-300'
                                            : 'bg-white text-gray-700 border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                                    }
                                `}
                                title={verified ? `Click to view badge details` : editing ? skill : 'Click to take assessment'}
                            >
                                {verified && BadgeIcon ? (
                                    <BadgeIcon size={20} />
                                ) : !editing && (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                                        <Lock size={10} className="text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                )}

                                <span>{skill}</span>

                                {editing && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveSkill(skill);
                                        }}
                                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}

                                {!verified && !editing && (
                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                        VERIFY
                                    </div>
                                )}

                                {verified && (
                                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {skillsData.length === 0 && (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                )}

                {/* Legend */}
                {!editing && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                            <Lock size={14} className="text-gray-400" />
                            <span>Click unverified skills to take assessments and earn badges</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Languages Section */}
            <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    Languages
                </h4>

                {/* Add Language Input (Edit Mode) */}
                {editing && (
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newLanguage.language}
                            onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                            placeholder="Language (e.g., English, Filipino)"
                            className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                        />
                        <select
                            value={newLanguage.proficiency}
                            onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="Basic">Basic</option>
                            <option value="Conversational">Conversational</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Native">Native</option>
                        </select>
                        <button
                            onClick={handleAddLanguage}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                )}

                {languagesData.length > 0 ? (
                    <div className="space-y-2">
                        {languagesData.map((lang, index) => (
                            <div key={index} className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                <span className="font-medium text-gray-700">{lang.language}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                                        {lang.proficiency}
                                    </span>
                                    {editing && (
                                        <button
                                            onClick={() => handleRemoveLanguage(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No languages added yet</p>
                )}
            </div>
            {/* Verified Skill Details Modal */}
            {selectedSkill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSkill(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedSkill(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            {(() => {
                                const BadgeIcon = getBadgeComponent(selectedSkill.level);
                                return BadgeIcon && (
                                    <div className="mb-4 transform hover:scale-110 transition-transform duration-300">
                                        <BadgeIcon size={80} />
                                    </div>
                                );
                            })()}

                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedSkill.skill}</h3>
                            <p className="text-gray-500 text-sm mb-4">{selectedSkill.assessmentTitle || `${selectedSkill.skill} Assessment`}</p>
                            <div className={`text-sm font-bold px-3 py-1 rounded-full mb-6 ${selectedSkill.level === 'Expert' ? 'bg-orange-100 text-orange-700' :
                                selectedSkill.level === 'Senior' ? 'bg-purple-100 text-purple-700' :
                                    selectedSkill.level === 'Mid' ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
                                }`}>
                                {selectedSkill.level} Level Verified
                            </div>

                            <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-500">Earned On</span>
                                    <span className="font-semibold text-gray-900">{formatDate(selectedSkill.earnedAt)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Status</span>
                                    <span className="font-semibold text-green-600 flex items-center gap-1">
                                        Verified <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillsSection;
