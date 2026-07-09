import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Search, FileText, Eye, CheckCircle, XCircle, Clock, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminModal from "./components/AdminModal";

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");

    const [viewingApp, setViewingApp] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    useEffect(() => {
        fetchApplications();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchApplications, 30000);

        const handleVisibility = () => {
            if (document.visibilityState === "visible") fetchApplications();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.APPLICATIONS);
            setApplications(response.data);
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (app) => {
        setViewingApp(app);
        setShowViewModal(true);
    };

    const handleDelete = async (appId) => {
        if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) return;

        try {
            await axiosInstance.delete(API_PATH.ADMIN.DELETE_APPLICATION(appId));
            setApplications(applications.filter((app) => app._id !== appId));
            toast.success("Application deleted successfully");
        } catch (error) {
            console.error("Error deleting application:", error);
            toast.error("Failed to delete application");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Accepted": return <CheckCircle className="w-4 h-4 text-emerald-600" />;
            case "Rejected": return <XCircle className="w-4 h-4 text-red-600" />;
            case "In Review": return <Clock className="w-4 h-4 text-amber-600" />;
            default: return <Send className="w-4 h-4 text-blue-600" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Accepted": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Rejected": return "bg-red-50 text-red-700 border-red-200";
            case "In Review": return "bg-amber-50 text-amber-700 border-amber-200";
            default: return "bg-blue-50 text-blue-700 border-blue-200";
        }
    };

    const applicationsWithScore = applications.map(app => {
        let score = 0;
        const reasons = [];
        
        if (app.job && app.applicant) {
            const jobSkills = app.job.skills?.map(s => s.toLowerCase()) || [];
            const jobReq = app.job.requirements?.toLowerCase() || "";
            const userSkills = app.applicant.skills?.map(s => s.toLowerCase()) || [];
            
            let skillMatch = 0;
            jobSkills.forEach(s => { if (userSkills.includes(s)) { score++; skillMatch++; } });
            userSkills.forEach(us => { if (!jobSkills.includes(us) && jobReq.includes(us)) { score++; skillMatch++; } });
            
            if (skillMatch > 0) reasons.push(`${skillMatch} matching skills`);
            
            const desiredTitle = app.applicant.major?.toLowerCase() || "";
            if (desiredTitle && app.job.title?.toLowerCase().includes(desiredTitle)) { 
                score += 2; 
                reasons.push("Matches Major"); 
            }
        }
        
        return { 
            ...app, 
            matchScore: score, 
            matchReason: reasons.length > 0 ? reasons.join(", ") : "General Match" 
        };
    });

    let filteredApps = applicationsWithScore.filter((app) => {
        const matchesSearch = 
            (app.job?.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (app.applicant?.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (app.job?.company?.companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "All" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (sortBy === "best_match") {
        filteredApps.sort((a, b) => b.matchScore - a.matchScore);
    } else {
        filteredApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (loading) {
        return (
            <DashboardLayout activeMenu="admin-applications">
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeMenu="admin-applications">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
                    <div className="flex gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 font-medium"
                        >
                            <option value="newest">Newest First</option>
                            <option value="best_match">🏆 Rank by Best Match</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Applied">Applied</option>
                            <option value="In Review">In Review</option>
                            <option value="Accepted">Hired (Accepted)</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by job, applicant, company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-72"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto admin-table-responsive">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider pl-8">Applicant</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Job / Company</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredApps.map((app) => (
                                <tr key={app._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                                    <td className="px-6 py-5 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden shadow-sm">
                                                {app.applicant?.avatar ? (
                                                    <img src={app.applicant.avatar} alt={app.applicant.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    app.applicant?.fullName?.charAt(0) || "?"
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{app.applicant?.fullName}</div>
                                                <div className="text-xs text-gray-500">{app.applicant?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-medium text-gray-900">{app.job?.title}</div>
                                        <div className="text-xs text-gray-500 mb-1">{app.job?.company?.companyName}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit ${getStatusStyle(app.status)}`}>
                                            {getStatusIcon(app.status)}
                                            {app.status === "Accepted" ? "Hired" : app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-gray-500 text-sm font-medium">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleView(app)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(app._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Delete Application"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredApps.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="w-12 h-12 text-gray-300" />
                                            <p>No applications found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>

            {/* View Modal */}
            <AdminModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Application Details"
            >
                {viewingApp && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
                                {viewingApp.applicant?.avatar ? (
                                    <img src={viewingApp.applicant.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-400">
                                        {viewingApp.applicant?.fullName?.charAt(0) || "?"}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{viewingApp.applicant?.fullName}</h3>
                                <p className="text-sm text-gray-500">{viewingApp.applicant?.email}</p>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(viewingApp.status)}`}>
                                {getStatusIcon(viewingApp.status)}
                                {viewingApp.status === "Accepted" ? "Hired" : viewingApp.status}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Details</h4>
                            <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                <div className="font-semibold text-gray-900 text-lg">{viewingApp.job?.title}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium text-gray-800">{viewingApp.job?.company?.companyName}</span>
                                    {viewingApp.job?.location && ` • ${viewingApp.job.location}`}
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    {viewingApp.job?.category} • {viewingApp.job?.type}
                                </div>
                            </div>
                        </div>

                        {viewingApp.resume && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resume</h4>
                                <a 
                                    href={viewingApp.resume} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center p-3 w-full border border-blue-200 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-semibold shadow-sm"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    View / Download Resume
                                </a>
                            </div>
                        )}
                        
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </AdminModal>
        </DashboardLayout>
    );
};

export default AdminApplications;
