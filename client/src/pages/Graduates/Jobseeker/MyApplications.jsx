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

            <div className="flex-1 flex flex-col mt-16 overflow-hidden">
                <div className="flex-1 overflow-y-auto lg:overflow-x-auto">
                    <div className="container mx-auto px-4 pt-6 md:pt-8 pb-28 md:pb-8 lg:h-full flex flex-col min-w-0 lg:min-w-[1024px]">
                        <div className="mb-6 flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                                <p className="text-gray-600 text-sm md:text-base mt-1">Track the status of your job applications</p>
                            </div>
                            <button
                                onClick={() => navigate("/find-jobs")}
                                className="w-full sm:w-auto justify-center flex items-center text-gray-600 bg-white border border-gray-200 hover:border-blue-200 px-4 py-2 rounded-xl hover:text-blue-600 transition-colors shadow-sm"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Jobs
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 lg:min-h-0">
                            {Object.entries(columns).map(([status, apps]) => (
                                <div key={status} className="flex flex-col h-auto lg:h-full lg:max-h-full">
                                    {/* Column Header */}
                                    <div className={`flex items-center justify-between p-4 rounded-t-xl border-b-2 bg-white shadow-sm flex-shrink-0 ${getStatusBorderColor(status)}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${getStatusColor(status)} bg-opacity-20`}>
                                                {getStatusIcon(status)}
                                            </div>
                                            <h3 className="font-semibold text-gray-900">{status}</h3>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                            {apps.length}
                                        </span>
                                    </div>

                                    {/* Column Content */}
                                    <div className="flex-1 bg-gray-100/50 p-4 rounded-b-xl overflow-y-visible lg:overflow-y-auto space-y-4 border border-t-0 border-gray-200 lg:min-h-0 min-h-[150px]">
                                        {apps.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 text-sm">
                                                No applications
                                            </div>
                                        ) : (
                                            apps.map((app) => (
                                                <motion.div
                                                    key={app._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                                                    onClick={() => app.job && navigate(`/job/${app.job._id}`)}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                            {app.job?.company?.companyName || app.job?.company?.fullName || "Company"}
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(app.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                        {app.job?.title || "Deleted Job"}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                                        {app.job?.company?.companyName || app.job?.company?.fullName || "Company"}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="line-clamp-1">{app.job?.location || "Unknown Location"}</span>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                        {app.job?.type && (
                                                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusColor(status)} bg-opacity-10`}>
                                                                {app.job.type}
                                                            </span>
                                                        )}
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
                                                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                                                                    app.terminationReview?.isJobseekerRated || ratedIds.has(app.terminationReview?._id || app.terminationReview)
                                                                        ? "bg-gray-100 text-gray-400 cursor-default"
                                                                        : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shadow-sm"
                                                                }`}
                                                            >
                                                                <Star className="w-3 h-3" />
                                                                {app.terminationReview?.isJobseekerRated || ratedIds.has(app.terminationReview?._id || app.terminationReview)
                                                                    ? "✓ Rated"
                                                                    : "Rate Experience"}
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
