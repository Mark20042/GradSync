import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Trash2, Edit, Plus, HelpCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";
import AdminModal from "../../components/Admin/AdminModal";

const AdminFAQs = () => {
    const [activeTab, setActiveTab] = useState("job"); // system tab hidden for now
    const [faqs, setFaqs] = useState([]);
    const [jobFaqs, setJobFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [viewingFaq, setViewingFaq] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Data for dropdowns
    const [employers, setEmployers] = useState([]);
    const [jobs, setJobs] = useState([]);

    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        category: "General",
        order: 0,
        isActive: true,
        // Job FAQ specific
        employer: "",
        job: ""
    });

    useEffect(() => {
        fetchFaqs();
        fetchJobFaqs();
        fetchEmployers();
    }, []);

    // Fetch jobs when employer changes
    useEffect(() => {
        if (formData.employer) {
            fetchEmployerJobs(formData.employer);
        } else {
            setJobs([]);
        }
    }, [formData.employer]);

    const fetchFaqs = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.FAQS);
            setFaqs(response.data);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
            toast.error("Failed to fetch FAQs");
        } finally {
            setLoading(false);
        }
    };

    const fetchJobFaqs = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.JOB_FAQS);
            setJobFaqs(response.data);
        } catch (error) {
            console.error("Error fetching Job FAQs:", error);
        }
    };

    const fetchEmployers = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.USERS);
            const employerUsers = response.data.filter(user => user.role === 'employer');
            setEmployers(employerUsers);
        } catch (error) {
            console.error("Error fetching employers:", error);
        }
    };

    const fetchEmployerJobs = async (employerId) => {
        try {
            // We need a way to get jobs for a specific employer. 
            // The existing API might not support filtering by employer ID directly in the public route,
            // but let's try to filter the all jobs list for now or use a specific endpoint if available.
            // Ideally: /api/jobs?employer=ID or similar.
            // For now, let's fetch all jobs and filter client side if needed, or assume we need a new endpoint.
            // Actually, let's use the admin get all jobs and filter.
            const response = await axiosInstance.get(API_PATH.ADMIN.JOBS);
            const employerJobs = response.data.filter(job => job.company && job.company._id === employerId);
            setJobs(employerJobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const handleDelete = async (faqId) => {
        if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

        try {
            if (activeTab === "system") {
                await axiosInstance.delete(API_PATH.ADMIN.DELETE_FAQ(faqId));
                setFaqs(faqs.filter((faq) => faq._id !== faqId));
            } else {
                await axiosInstance.delete(API_PATH.ADMIN.DELETE_JOB_FAQ(faqId));
                setJobFaqs(jobFaqs.filter((faq) => faq._id !== faqId));
            }
            toast.success("FAQ deleted successfully");
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            toast.error("Failed to delete FAQ");
        }
    };

    const handleView = (faq) => {
        setViewingFaq(faq);
        setShowViewModal(true);
    };

    const handleEdit = (faq) => {
        setEditingFaq(faq);
        if (activeTab === "system") {
            setFormData({
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                order: faq.order,
                isActive: faq.isActive,
            });
        } else {
            setFormData({
                question: faq.question,
                answer: faq.answer,
                employer: faq.employer?._id || "",
                job: faq.job?._id || ""
            });
        }
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingFaq(null);
        if (activeTab === "system") {
            setFormData({
                question: "",
                answer: "",
                category: "General",
                order: 0,
                isActive: true,
            });
        } else {
            setFormData({
                question: "",
                answer: "",
                employer: "",
                job: ""
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === "system") {
                if (editingFaq) {
                    const response = await axiosInstance.put(API_PATH.ADMIN.UPDATE_FAQ(editingFaq._id), formData);
                    setFaqs(faqs.map((faq) => (faq._id === editingFaq._id ? response.data : faq)));
                    toast.success("FAQ updated successfully");
                } else {
                    const response = await axiosInstance.post(API_PATH.ADMIN.CREATE_FAQ, formData);
                    setFaqs([...faqs, response.data]);
                    toast.success("FAQ created successfully");
                }
            } else {
                // Job FAQ Submit
                const jobFaqData = {
                    question: formData.question,
                    answer: formData.answer,
                    employer: formData.employer,
                    job: formData.job || undefined
                };

                if (editingFaq) {
                    const response = await axiosInstance.put(API_PATH.ADMIN.UPDATE_JOB_FAQ(editingFaq._id), jobFaqData);
                    setJobFaqs(jobFaqs.map((faq) => (faq._id === editingFaq._id ? response.data : faq)));
                    toast.success("Job FAQ updated successfully");
                } else {
                    const response = await axiosInstance.post(API_PATH.ADMIN.CREATE_JOB_FAQ, jobFaqData);
                    setJobFaqs([...jobFaqs, response.data]);
                    toast.success("Job FAQ created successfully");
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving FAQ:", error);
            toast.error("Failed to save FAQ");
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeMenu="admin-faqs">
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeMenu="admin-faqs">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Job FAQ
                    </button>
                </div>

                {/* Tabs - System FAQs hidden for future use */}
                {/* 
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("system")}
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === "system" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        System FAQs
                        {activeTab === "system" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("job")}
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === "job" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Job/Employer FAQs
                        {activeTab === "job" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                        )}
                    </button>
                </div>
                */}

                {/* Job FAQs Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider w-2/5 pl-8">Question</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider w-1/4">Employer</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider w-1/6">Job</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider w-1/6 text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {jobFaqs.map((faq) => (
                                <tr key={faq._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                                    <td className="px-6 py-5 pl-8">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                                <HelpCircle className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 pt-0.5">
                                                <span className="font-semibold text-gray-900 block truncate text-base mb-1">
                                                    {faq.question}
                                                </span>
                                                <span className="text-sm text-gray-500 block line-clamp-2 leading-relaxed">
                                                    {faq.answer}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6">
                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-900 truncate">{faq.employer?.companyName || "Unknown Company"}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{faq.employer?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6">
                                        {faq.job ? (
                                            <span className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-full text-xs font-semibold inline-block border border-emerald-200/50 shadow-sm">
                                                {faq.job.title}
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold inline-block">
                                                General
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 align-top pt-5 pr-8">
                                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleView(faq)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(faq)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Edit FAQ"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(faq._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Delete FAQ"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {jobFaqs.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                                        <div className="flex flex-col items-center gap-3">
                                            <HelpCircle className="w-12 h-12 text-gray-300" />
                                            <p>No job FAQs found yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/Add FAQ Modal */}
            <AdminModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingFaq ? (activeTab === "system" ? "Edit FAQ" : "Edit Job FAQ") : (activeTab === "system" ? "Add FAQ" : "Add Job FAQ")}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                        <input
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g., How do I reset my password?"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                        <textarea
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                            placeholder="Enter the answer here..."
                            required
                        />
                    </div>

                    {activeTab === "system" ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="General">General</option>
                                        <option value="Account">Account</option>
                                        <option value="Jobs">Jobs</option>
                                        <option value="Employers">Employers</option>
                                        <option value="Graduates">Graduates</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
                                <select
                                    value={formData.employer}
                                    onChange={(e) => setFormData({ ...formData, employer: e.target.value, job: "" })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Employer</option>
                                    {employers.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.companyName || emp.fullName} ({emp.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job (Optional)</label>
                                <select
                                    value={formData.job}
                                    onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    disabled={!formData.employer}
                                >
                                    <option value="">General (No specific job)</option>
                                    {jobs.map(job => (
                                        <option key={job._id} value={job._id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
                        >
                            {editingFaq ? "Save Changes" : "Create FAQ"}
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* View FAQ Modal */}
            <AdminModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="FAQ Details"
            >
                {viewingFaq && (
                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Question</h3>
                            <p className="text-lg font-medium text-gray-900">{viewingFaq.question}</p>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Answer</h3>
                            <div className="p-4 bg-white border border-gray-200 rounded-xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {viewingFaq.answer}
                            </div>
                        </div>



                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</h3>
                                <p className="text-gray-900 text-sm">{new Date(viewingFaq.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </AdminModal>
        </DashboardLayout>
    );
};

export default AdminFAQs;
