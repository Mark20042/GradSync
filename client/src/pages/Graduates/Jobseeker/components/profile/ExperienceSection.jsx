import React, { useState, useEffect } from 'react';
import { Briefcase, Trash2, Plus, Star, Award, Clock } from 'lucide-react';
import axiosInstance from '../../../../../utils/axiosInstance';
import { API_PATH } from '../../../../../utils/apiPath';
import StarRating from "../../../../../components/ratings/StarRating";

const ExperienceSection = ({ user, editing, editData, setEditData }) => {
    const [activeTab, setActiveTab] = useState('experiences');
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        if (!editing && user?._id && activeTab === 'reviews') {
            const fetchReviews = async () => {
                setLoadingReviews(true);
                try {
                    const res = await axiosInstance.get(API_PATH.TERMINATION_REVIEWS.EMPLOYEE_REVIEWS(user._id));
                    setReviews(res.data.reviews || []);
                } catch (e) {
                    console.error("Failed to load reviews");
                } finally {
                    setLoadingReviews(false);
                }
            };
            fetchReviews();
        }
    }, [activeTab, editing, user?._id]);

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
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('experiences')}
                    className={`w-full sm:w-auto justify-center px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'experiences'
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Work Experience ({experienceData?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('internships')}
                    className={`w-full sm:w-auto justify-center px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'internships'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Internships ({internshipData?.length || 0})
                </button>
                {!editing && (
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`w-full sm:w-auto justify-center px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'reviews'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Employer Reviews ({user?.employeeRatingCount || 0})
                    </button>
                )}
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

            {/* Reviews */}
            {activeTab === 'reviews' && !editing && (
                <div className="space-y-6">
                    {/* Overall Rating Summary */}
                    {user?.employeeAverageRating > 0 && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
                            <div className="flex flex-col items-center justify-center bg-white rounded-xl w-20 h-20 shadow-sm border border-amber-100 shrink-0">
                                <span className="text-3xl font-extrabold text-amber-600 leading-none">
                                    {user.employeeAverageRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-amber-500 font-bold mt-1">/ 5.0</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-amber-900 mb-1 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    Overall Performance
                                </h4>
                                <StarRating value={Math.round(user.employeeAverageRating)} size="md" readOnly />
                                <p className="text-sm text-amber-700 mt-1.5 font-medium">
                                    Based on {user.employeeRatingCount} rating{user.employeeRatingCount === 1 ? '' : 's'} from past employers.
                                </p>
                            </div>
                        </div>
                    )}

                    {loadingReviews ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse flex gap-4 bg-gray-50 rounded-xl p-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="w-1/3 h-4 bg-gray-200 rounded mb-2" />
                                        <div className="w-1/4 h-3 bg-gray-200 rounded mb-4" />
                                        <div className="w-full h-12 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-3">
                                            {review.companyLogo ? (
                                                <img src={review.companyLogo} alt={review.companyName} className="w-12 h-12 rounded-xl object-contain border border-gray-100 bg-gray-50" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-200">
                                                    {review.companyName.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h5 className="font-bold text-gray-900 leading-tight">{review.companyName}</h5>
                                                <p className="text-sm text-gray-500">{review.jobTitle}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <StarRating value={review.rating} size="sm" readOnly />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 text-xs text-gray-400 font-medium">
                                            {new Date(review.ratedAt).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}
                                            {review.tenureDays > 0 && (
                                                <div className="flex items-center justify-end gap-1 mt-1 text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {review.tenureDays < 30 ? `${review.tenureDays}d` : review.tenureDays < 365 ? `${Math.round(review.tenureDays/30)}mo` : `${(review.tenureDays/365).toFixed(1)}yr`} tenure
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {review.tags && review.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3 mb-2">
                                            {review.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {review.feedback && (
                                        <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                                            "{review.feedback}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                            No employer reviews received yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExperienceSection;
