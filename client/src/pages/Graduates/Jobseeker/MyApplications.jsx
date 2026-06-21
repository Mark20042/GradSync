import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Briefcase,
    Calendar,
    MapPin,
    Building2,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader,
    Search,
    Filter,
    ArrowLeft,
    UserX,
    Star,
} from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";
import Navbar from "./components/Navbar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import MyApplicationsSkeleton from "./components/skeletons/MyApplicationsSkeleton";
import JobseekerRatingModal from "../../../components/ratings/JobseekerRatingModal";

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratingReview, setRatingReview] = useState(null); // review to rate
    const [ratedIds, setRatedIds] = useState(new Set()); // track which reviews were rated this session
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_PATH.APPLICATIONS.GET_MY_APPLICATIONS);
            setApplications(response.data);
        } catch (err) {
            console.error("Error fetching applications:", err);
            setError("Failed to load applications.");
        } finally {
            setLoading(false);
        }
    };

    // Group applications by status (including Terminated)
    const columns = {
        Applied: applications.filter((app) => app.status === "Applied"),
        "In Review": applications.filter((app) => app.status === "In Review"),
        Accepted: applications.filter((app) => app.status === "Accepted"),
        Rejected: applications.filter((app) => app.status === "Rejected"),
        Terminated: applications.filter((app) => app.status === "Terminated"),
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Applied":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "In Review":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Accepted":
                return "bg-green-100 text-green-700 border-green-200";
            case "Rejected":
                return "bg-red-100 text-red-700 border-red-200";
            case "Terminated":
                return "bg-slate-100 text-slate-600 border-slate-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusBorderColor = (status) => {
        switch (status) {
            case "Applied": return "border-blue-500";
            case "In Review": return "border-yellow-500";
            case "Accepted": return "border-green-500";
            case "Rejected": return "border-red-500";
            case "Terminated": return "border-slate-500";
            default: return "border-gray-400";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Applied":
                return <Clock className="w-4 h-4" />;
            case "In Review":
                return <Search className="w-4 h-4" />;
            case "Accepted":
                return <CheckCircle className="w-4 h-4" />;
            case "Rejected":
                return <XCircle className="w-4 h-4" />;
            case "Terminated":
                return <UserX className="w-4 h-4" />;
            default:
                return <Briefcase className="w-4 h-4" />;
        }
    };

    const handleRated = (reviewId) => {
        setRatedIds((prev) => new Set([...prev, reviewId]));
        setRatingReview(null);
    };


    if (loading) {
        return <MyApplicationsSkeleton />;
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 flex flex-col mt-16 overflow-hidden bg-gray-50/50">
                <div className="container mx-auto px-4 pt-6 md:pt-8 pb-4 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Applications</h1>
                            <p className="text-gray-500 text-sm mt-1">Track and manage the status of your job applications</p>
                        </div>
                        <button
                            onClick={() => navigate("/find-jobs")}
                            className="w-full sm:w-auto justify-center flex items-center text-gray-700 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 px-4 py-2.5 rounded-xl hover:text-blue-700 transition-all shadow-sm font-medium text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Jobs
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50/80 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 backdrop-blur-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}
                </div>

                {/* Kanban Board Container */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar px-4 pb-8">
                    <div className="flex gap-6 h-full items-start min-w-max pb-4 px-2">
                        {Object.entries(columns).map(([status, apps]) => (
                            <div key={status} className="flex flex-col w-[320px] max-w-[85vw] max-h-full h-fit shrink-0">
                                {/* Column Header */}
                                <div className={`flex items-center justify-between p-4 rounded-t-2xl border-b-[3px] bg-white shadow-sm shrink-0 z-10 relative ${getStatusBorderColor(status)}`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`p-1.5 rounded-lg ${getStatusColor(status)} bg-opacity-10 ring-1 ring-inset ring-current/10`}>
                                            {getStatusIcon(status)}
                                        </div>
                                        <h3 className="font-bold text-gray-800 tracking-wide text-sm uppercase">{status}</h3>
                                    </div>
                                    <div className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold shadow-inner">
                                        {apps.length}
                                    </div>
                                </div>

                                {/* Column Content */}
                                <div className="bg-gray-100/60 p-3.5 rounded-b-2xl overflow-y-auto custom-scrollbar space-y-3.5 border border-t-0 border-gray-200/80 shadow-inner min-h-[100px]">
                                    {apps.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                                                <Briefcase className="w-5 h-5 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 text-xs font-medium">No applications</p>
                                        </div>
                                    ) : (
                                        apps.map((app) => (
                                            <motion.div
                                                key={app._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/60 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all cursor-pointer group"
                                                onClick={() => app.job && navigate(`/job/${app.job._id}`)}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2 max-w-[70%]">
                                                        <div className="w-6 h-6 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                            {app.job?.company?.companyLogo ? (
                                                                <img src={app.job.company.companyLogo} alt="logo" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors truncate">
                                                            {app.job?.company?.companyName || app.job?.company?.fullName || "Company"}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                        {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>

                                                <h4 className="font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                                                    {app.job?.title || "Deleted Job"}
                                                </h4>
                                                
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 bg-gray-50/80 w-fit px-2 py-1 rounded-md border border-gray-100">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <span className="line-clamp-1 font-medium">{app.job?.location || "Remote"}</span>
                                                </div>

                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex gap-1.5">
                                                        {app.job?.type && (
                                                            <span className="text-[10px] px-2 py-1 rounded-md font-bold bg-gray-100 text-gray-600 border border-gray-200/80">
                                                                {app.job.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Rate Experience button for Terminated apps */}
                                                    {status === "Terminated" && app.terminationReview && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (ratedIds.has(app.terminationReview._id || app.terminationReview)) return;
                                                                setRatingReview({
                                                                    _id: app.terminationReview._id || app.terminationReview,
                                                                    job: app.job,
                                                                    company: app.job?.company,
                                                                });
                                                            }}
                                                            className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all ${
                                                                app.terminationReview?.isJobseekerRated || ratedIds.has(app.terminationReview?._id || app.terminationReview)
                                                                    ? "bg-gray-50 text-gray-400 border border-gray-200 cursor-default"
                                                                    : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 hover:from-amber-200 hover:to-orange-200 border border-amber-200 shadow-sm"
                                                            }`}
                                                        >
                                                            <Star className="w-3 h-3" />
                                                            {app.terminationReview?.isJobseekerRated || ratedIds.has(app.terminationReview?._id || app.terminationReview)
                                                                ? "RATED"
                                                                : "RATE"}
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Jobseeker Rating Modal */}
            <JobseekerRatingModal
                isOpen={!!ratingReview}
                onClose={(wasRated) => wasRated ? handleRated(ratingReview?._id) : setRatingReview(null)}
                review={ratingReview}
            />
        </div>
    );
};

export default MyApplications;
