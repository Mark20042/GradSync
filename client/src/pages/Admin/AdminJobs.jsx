import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Trash2, Search, Briefcase, Edit, Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";
import AdminModal from "../../components/Admin/AdminModal";

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [editingJob, setEditingJob] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewingJob, setViewingJob] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [employers, setEmployers] = useState([]);

    useEffect(() => {
        fetchJobs();
        fetchEmployers();
    }, []);

    const fetchEmployers = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.USERS);
            const allEmployers = response.data.filter(u => u.role === 'employer');
            setEmployers(allEmployers);
        } catch (error) {
            console.error("Error fetching employers:", error);
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.JOBS);
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (job) => {
        setViewingJob(job);
        setShowViewModal(true);
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;

        try {
            await axiosInstance.delete(API_PATH.ADMIN.DELETE_JOB(jobId));
            setJobs(jobs.filter((job) => job._id !== jobId));
            toast.success("Job deleted successfully");
        } catch (error) {
            console.error("Error deleting job:", error);
            toast.error("Failed to delete job");
        }
    };

    const handleEdit = (job) => {
        setEditingJob({ ...job });
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setEditingJob({
            title: "",
            category: "",
            type: "Full-Time",
            salaryMin: "",
            salaryMax: "",
            location: "",
            isClosed: false,
            description: "",
            requirements: "",
            company: "", // Should be a dropdown in real app, or auto-assigned if context known. 
            // For admin, we might want to select company.
            autoReplyMessage: ""
        });
        setShowEditModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingJob._id) {
                const response = await axiosInstance.put(API_PATH.ADMIN.UPDATE_JOB(editingJob._id), editingJob);
                setJobs(jobs.map((job) => (job._id === editingJob._id ? response.data : job)));
                toast.success("Job updated successfully");
            } else {
                const response = await axiosInstance.post(API_PATH.ADMIN.CREATE_JOB, editingJob);
                setJobs([...jobs, response.data]);
                toast.success("Job created successfully");
            }
            setShowEditModal(false);
            setEditingJob(null);
        } catch (error) {
            console.error("Error saving job:", error);
            toast.error(error.response?.data?.message || "Failed to save job");
        }
    };

    const filteredJobs = jobs.filter(
        (job) =>
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.company?.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardLayout activeMenu="admin-jobs">
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeMenu="admin-jobs">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Add Job
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider pl-8">Job Title</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Company</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Posted</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredJobs.map((job) => (
                                <tr key={job._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                                    <td className="px-6 py-5 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                                <Briefcase className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-900 block">
                                                    {job.title}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {job.type} • {job.location}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-medium text-gray-700">
                                            {job.company?.companyName || "Unknown Company"}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {job.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-500 text-sm font-medium">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleView(job)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(job)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Edit Job"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Delete Job"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredJobs.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                                        <div className="flex flex-col items-center gap-3">
                                            <Briefcase className="w-12 h-12 text-gray-300" />
                                            <p>No jobs found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Job Modal */}
            <AdminModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={editingJob?._id ? "Edit Job" : "Add Job"}
            >
                {editingJob && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                <input
                                    type="text"
                                    value={editingJob.title}
                                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            {!editingJob._id && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                    <select
                                        value={editingJob.company}
                                        onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="">Select Company</option>
                                        {employers.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.companyName} ({emp.email})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={editingJob.category}
                                    onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={editingJob.type}
                                    onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min</label>
                                <input
                                    type="number"
                                    value={editingJob.salaryMin || ""}
                                    onChange={(e) => setEditingJob({ ...editingJob, salaryMin: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max</label>
                                <input
                                    type="number"
                                    value={editingJob.salaryMax || ""}
                                    onChange={(e) => setEditingJob({ ...editingJob, salaryMax: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={editingJob.location || ""}
                                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={editingJob.isClosed}
                                    onChange={(e) => setEditingJob({ ...editingJob, isClosed: e.target.value === "true" })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="false">Active</option>
                                    <option value="true">Closed</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editingJob.description}
                                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                                <textarea
                                    value={editingJob.requirements || ""}
                                    onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
                            >
                                {editingJob._id ? "Save Changes" : "Create Job"}
                            </button>
                        </div>
                    </form>
                )}
            </AdminModal>

            {/* View Job Modal */}
            <AdminModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Job Details"
                maxWidth="max-w-2xl"
            >
                {viewingJob && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{viewingJob.title}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                    <p className="text-lg text-gray-600">{viewingJob.company?.companyName}</p>
                                </div>
                            </div>
                            <span
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${!viewingJob.isClosed
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                    }`}
                            >
                                {viewingJob.isClosed ? "Closed" : "Active"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</h4>
                                <p className="text-gray-900 font-medium">{viewingJob.category}</p>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Job Type</h4>
                                <p className="text-gray-900 font-medium">{viewingJob.type}</p>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</h4>
                                <p className="text-gray-900 font-medium">{viewingJob.location}</p>
                            </div>
                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Salary Range</h4>
                                <p className="text-gray-900 font-medium">
                                    {viewingJob.salaryMin && viewingJob.salaryMax
                                        ? `₱${viewingJob.salaryMin.toLocaleString()} - ₱${viewingJob.salaryMax.toLocaleString()}`
                                        : viewingJob.salaryMin
                                            ? `₱${viewingJob.salaryMin.toLocaleString()}+`
                                            : viewingJob.salaryMax
                                                ? `Up to ₱${viewingJob.salaryMax.toLocaleString()}`
                                                : "Not specified"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                            <div className="bg-gray-50 rounded-xl p-5 text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                                {viewingJob.description}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requirements</h4>
                            <div className="bg-gray-50 rounded-xl p-5 text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                                {viewingJob.requirements}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                            <div>
                                <span>Posted: </span>
                                <span className="font-medium text-gray-900">{new Date(viewingJob.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span>Last Updated: </span>
                                <span className="font-medium text-gray-900">{new Date(viewingJob.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </AdminModal>
        </DashboardLayout>
    );
};

export default AdminJobs;
